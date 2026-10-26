import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseInstallCommand, getCleanServerKey, generateClientConfig } from './configGenerator';
import { ServerItem } from '../types';

const base: ServerItem = {
  id: 'x', name: '@acme/db-mcp', desc: '', cat: 'db', lang: 'typescript', scope: 'local', off: false,
  gh: null, web: null, trans: 'stdio', cmd: null, pkg: null, pkgType: null, remoteUrl: null,
  envs: null, stars: null, dl: null, updatedAt: null,
};

test('parseInstallCommand prefers explicit cmd, then npm/pypi package', () => {
  assert.deepEqual(parseInstallCommand({ ...base, cmd: 'npx -y @acme/db-mcp --ro' }), { command: 'npx', args: ['-y', '@acme/db-mcp', '--ro'] });
  assert.deepEqual(parseInstallCommand({ ...base, pkgType: 'npm', pkg: 'foo' }), { command: 'npx', args: ['-y', 'foo'] });
  assert.deepEqual(parseInstallCommand({ ...base, pkgType: 'pypi', pkg: 'bar' }), { command: 'uvx', args: ['bar'] });
});

test('getCleanServerKey strips scope and symbols', () => {
  assert.equal(getCleanServerKey(base), 'acme-db-mcp');
});

test('local server: env placeholders for secrets, user values win', () => {
  const item = { ...base, pkgType: 'npm', pkg: 'foo', envs: [{ name: 'API_KEY', required: true, secret: true }, { name: 'URL', required: false, secret: false }] };
  const cfg = JSON.parse(generateClientConfig(item, 'cursor').code);
  assert.deepEqual(cfg.mcpServers['acme-db-mcp'].env, { API_KEY: 'YOUR_API_KEY', URL: '' });
  const filled = JSON.parse(generateClientConfig(item, 'cursor', { API_KEY: 'k' }).code);
  assert.equal(filled.mcpServers['acme-db-mcp'].env.API_KEY, 'k');
});

test('http transport without remoteUrl stays local (no fake URL)', () => {
  const code = generateClientConfig({ ...base, trans: 'streamable_http', pkgType: 'npm', pkg: 'foo' }, 'cursor').code;
  assert.ok(!code.includes('example.com'));
  assert.equal(JSON.parse(code).mcpServers['acme-db-mcp'].command, 'npx');
});

test('remote server uses each client\'s format', () => {
  const item = { ...base, trans: 'sse', remoteUrl: 'https://mcp.acme.dev/sse' };
  const get = (c: Parameters<typeof generateClientConfig>[1]) => generateClientConfig(item, c).code;
  assert.deepEqual(JSON.parse(get('claude')).mcpServers['acme-db-mcp'], { command: 'npx', args: ['-y', 'mcp-remote', 'https://mcp.acme.dev/sse'] });
  assert.deepEqual(JSON.parse(get('cursor')).mcpServers['acme-db-mcp'], { url: 'https://mcp.acme.dev/sse' });
  assert.deepEqual(JSON.parse(get('windsurf')).mcpServers['acme-db-mcp'], { serverUrl: 'https://mcp.acme.dev/sse' });
  assert.deepEqual(JSON.parse(get('zed')).context_servers['acme-db-mcp'], { url: 'https://mcp.acme.dev/sse' });
  assert.equal(get('claude_code'), 'claude mcp add acme-db-mcp --transport sse https://mcp.acme.dev/sse');
});
