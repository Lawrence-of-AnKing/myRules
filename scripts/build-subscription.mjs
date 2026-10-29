import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import YAML from 'yaml';

const hash = data => createHash('sha256').update(data).digest('hex');
const root = process.cwd();
const output = process.env.BUILD_DIR || path.join(root, '.build');
const maximum = 8 * 1024 * 1024;

async function main() {
  let text;
  if (process.env.SUBSCRIPTION_INPUT) {
    text = await fs.readFile(process.env.SUBSCRIPTION_INPUT, 'utf8');
  } else {
    const url = process.env.AIRPORT_SUBSCRIPTION_URL;
    if (!url || new URL(url).protocol !== 'https:') {
      throw new Error('A valid HTTPS subscription secret is required');
    }
    const response = await fetch(url, {
      headers: { 'User-Agent': 'clash.meta' },
      signal: AbortSignal.timeout(60000)
    });
    if (!response.ok) throw new Error(`Subscription download failed: HTTP ${response.status}`);
    text = await response.text();
  }
  if (Buffer.byteLength(text) > maximum) throw new Error('Subscription exceeds size limit');
  const source = YAML.parse(text, { maxAliasCount: 100 });
  if (!source || typeof source !== 'object' || !Array.isArray(source.proxies) || !source.proxies.length) {
    throw new Error('Upstream must be a complete Clash/Mihomo YAML subscription with proxies');
  }
  const script = await fs.readFile(path.join(root, 'reWrite.js'), 'utf8');
  // Credentials are injected in memory, never checked into this public repository.
  const privateJson = process.env.IPROYAL_PROXY_JSON;
  if (!privateJson) throw new Error('Private IPRoyal proxy secret is required');
  let privateProxy;
  try { privateProxy = JSON.parse(privateJson); }
  catch { throw new Error('Private IPRoyal proxy secret is not valid JSON'); }
  const context = vm.createContext({ config: structuredClone(source), IPROYAL_PROXY_INJECT: privateProxy });
  // This executes the repository owner's trusted script, not untrusted third-party JS.
  // node:vm is a compatibility boundary, not a security sandbox.
  vm.runInContext(script, context, { timeout: 5000, filename: 'reWrite.js' });
  vm.runInContext('result = main(config)', context, { timeout: 5000 });
  const result = JSON.parse(JSON.stringify(context.result));
  if (!Array.isArray(result.rules) || !result.rules.length || !Array.isArray(result['proxy-groups'])) {
    throw new Error('Override did not return a complete configuration');
  }
  const targets = new Set(['DIRECT', 'REJECT', 'REJECT-DROP', 'PASS', 'COMPATIBLE', 'GLOBAL']);
  for (const item of [...result.proxies, ...result['proxy-groups']]) {
    if (!item.name || targets.has(item.name)) throw new Error('Missing or duplicate proxy/group name');
    targets.add(item.name);
  }
  for (const group of result['proxy-groups']) {
    for (const name of group.proxies || []) {
      if (!targets.has(name)) throw new Error('A proxy group references a missing target');
    }
  }
  for (const rule of result.rules) {
    const fields = rule.split(',');
    const target = fields.at(-1) === 'no-resolve' ? fields.at(-2) : fields.at(-1);
    if (!targets.has(target)) throw new Error('A routing rule references a missing target');
    if (fields[0] === 'RULE-SET' && !result['rule-providers']?.[fields[1]]) {
      throw new Error('A routing rule references a missing rule provider');
    }
  }
  const sensitive = ['💲 美国规则', '🇭🇰 香港固定', '🇭🇰 香港规则', '🇸🇬 WorkBuddy'];
  for (const name of sensitive) {
    const group = result['proxy-groups'].find(item => item.name === name);
    if (group?.type !== 'select' || group.proxies?.[0] !== 'REJECT') {
      throw new Error('Sensitive groups must default to REJECT; saved choices stay on each device');
    }
  }
  const fixedAI = result['proxy-groups'].find(item => item.name === '🔒 ChatGPT / Claude');
  const fixedNode = result.proxies.find(item => item.name === 'IPRoyal 新加坡固定');
  if (fixedAI?.type !== 'select' || JSON.stringify(fixedAI.proxies) !== JSON.stringify(['IPRoyal 新加坡固定', 'REJECT']) ||
      fixedNode?.type !== 'socks5' || fixedNode['dialer-proxy'] !== '🇭🇰 香港S01') {
    throw new Error('AI egress must contain only the explicitly approved private proxy and REJECT');
  }
  for (const node of result.proxies) {
    if (node['dialer-proxy'] && !targets.has(node['dialer-proxy'])) {
      throw new Error('A chained proxy references a missing front node');
    }
  }
  for (const listener of result.listeners || []) {
    if (listener.proxy && !targets.has(listener.proxy)) throw new Error('Listener references a missing proxy');
    if (listener.rule && !result['sub-rules']?.[listener.rule]) throw new Error('Listener references missing sub-rules');
  }
  for (const rules of Object.values(result['sub-rules'] || {})) {
    for (const rule of rules) {
      const fields = rule.split(',');
      const target = fields.at(-1) === 'no-resolve' ? fields.at(-2) : fields.at(-1);
      if (!targets.has(target)) throw new Error('A sub-rule references a missing target');
    }
  }
  // Complete config distribution must not publish an unauthenticated management listener.
  result['external-controller'] = '';
  for (const key of ['external-controller-tls', 'external-controller-pipe', 'external-controller-unix', 'secret']) {
    delete result[key];
  }
  result.profile = { ...result.profile, 'store-selected': true };
  await fs.mkdir(output, { recursive: true, mode: 0o700 });
  const content = YAML.stringify(result, { lineWidth: 0 });
  await fs.writeFile(path.join(output, 'config.yaml'), content, { mode: 0o600 });
  const metadata = {
    schemaVersion: 1,
    sourceCommit: process.env.GITHUB_SHA || null,
    sourceSha256: hash(script),
    configSha256: hash(content),
    generatedAt: new Date().toISOString(),
    encryption: 'age-X25519',
    counts: { proxies: result.proxies.length, groups: result['proxy-groups'].length, rules: result.rules.length }
  };
  await fs.writeFile(path.join(output, 'version.json'), JSON.stringify(metadata, null, 2) + '\n');
  console.log(JSON.stringify({ status: 'generated', counts: metadata.counts, sourceSha256: metadata.sourceSha256 }));
}

main().catch(error => {
  // Do not dump response bodies, parsed configs or network errors containing the secret URL.
  console.error(error.message?.startsWith('Subscription download failed:') ? error.message : 'Subscription generation failed; previous published config is unchanged.');
  process.exitCode = 1;
});
