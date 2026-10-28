import fs from 'node:fs/promises';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const repository = process.env.GITHUB_REPOSITORY;
const token = process.env.GITHUB_TOKEN;
const directory = process.env.BUILD_DIR || '.build';
if (!repository || !token) throw new Error('GitHub Actions credentials are required');
const base = `https://api.github.com/repos/${repository}`;

async function api(route, method = 'GET', body, optional = false) {
  const response = await fetch(base + route, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(body ? { 'Content-Type': 'application/json' } : {})
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(30000),
    cache: 'no-store'
  });
  if (optional && response.status === 404) return null;
  if (!response.ok) throw new Error(`GitHub publish API failed: HTTP ${response.status}`);
  return response.json();
}

async function main() {
  const metadata = JSON.parse(await fs.readFile(path.join(directory, 'version.json'), 'utf8'));
  const ciphertext = await fs.readFile(path.join(directory, 'config.yaml.age'));
  if (!ciphertext.subarray(0, 35).toString().startsWith('-----BEGIN AGE ENCRYPTED FILE-----')) {
    throw new Error('Refusing to publish a non-age file');
  }
  const ref = await api('/git/ref/heads/subscription', 'GET', undefined, true);
  if (ref) {
    const previous = await api(`/contents/version.json?ref=${ref.object.sha}`, 'GET', undefined, true);
    if (previous) {
      const old = JSON.parse(Buffer.from(previous.content, 'base64').toString());
      if (old.configSha256 === metadata.configSha256 && old.sourceSha256 === metadata.sourceSha256) {
        console.log('Published configuration is already current; no commit needed.');
        return;
      }
    }
  }
  const files = [
    ['config.yaml.age', ciphertext],
    ['version.json', Buffer.from(JSON.stringify(metadata, null, 2) + '\n')]
  ];
  const tree = [];
  for (const [name, bytes] of files) {
    const blob = await api('/git/blobs', 'POST', { encoding: 'base64', content: bytes.toString('base64') });
    tree.push({ path: name, mode: '100644', type: 'blob', sha: blob.sha });
  }
  const root = await api('/git/trees', 'POST', { tree });
  const commit = await api('/git/commits', 'POST', {
    message: `Publish encrypted subscription from ${metadata.sourceCommit?.slice(0, 7) || 'manual build'}`,
    tree: root.sha,
    parents: ref ? [ref.object.sha] : [],
    author: { name: 'github-actions[bot]', email: '41898282+github-actions[bot]@users.noreply.github.com' }
  });
  if (ref) {
    await api('/git/refs/heads/subscription', 'PATCH', { sha: commit.sha, force: false });
  } else {
    await api('/git/refs', 'POST', { ref: 'refs/heads/subscription', sha: commit.sha });
  }
  // A branch-name GET may briefly return its previous value after a successful PATCH.
  // Retry a cache-busted read, then verify both files at the immutable commit.
  let verified = false;
  for (const [attempt, milliseconds] of [0, 1000, 2000, 4000, 8000].entries()) {
    if (milliseconds) await delay(milliseconds);
    const exact = await api(`/git/ref/heads/subscription?verify=${commit.sha}&attempt=${attempt}`);
    if (exact.object.sha === commit.sha) {
      verified = true;
      break;
    }
  }
  if (!verified) throw new Error('Published branch verification failed after retries');
  for (const [name, expected] of files) {
    const actual = await api(`/contents/${name}?ref=${commit.sha}`);
    if (!Buffer.from(actual.content, 'base64').equals(expected)) {
      throw new Error('Published file verification failed');
    }
  }
  console.log(`Encrypted subscription published and verified: ${commit.sha}`);
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
