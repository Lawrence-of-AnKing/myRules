import fs from 'node:fs/promises';
import path from 'node:path';

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
    signal: AbortSignal.timeout(30000)
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
    const previous = await api('/contents/version.json?ref=subscription', 'GET', undefined, true);
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
  const exact = await api('/git/ref/heads/subscription');
  if (exact.object.sha !== commit.sha) throw new Error('Published branch verification failed');
  console.log(`Encrypted subscription published and verified: ${commit.sha}`);
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
