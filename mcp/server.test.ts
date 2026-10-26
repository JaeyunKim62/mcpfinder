import { test } from 'node:test';
import assert from 'node:assert/strict';
import { searchServers } from './server';
import { ServerItem } from '../src/types';

const mk = (name: string, desc: string, cat = 'other', extra: Partial<ServerItem> = {}): ServerItem => ({
  id: name, name, desc, cat, lang: 'ts', scope: 'local', off: false, gh: null, web: null, trans: 'stdio',
  cmd: null, pkg: null, pkgType: null, remoteUrl: null, envs: null, stars: null, dl: null, updatedAt: null, ...extra,
});

// Input order = popularity order
const items = [
  mk('popular-tool', 'does postgres things too'),
  mk('postgres-mcp', 'Query a PostgreSQL database', 'databases'),
  mk('slack-notion-bridge', 'post notion pages to slack'),
  mk('slack-bot', 'send slack messages', 'communication', { scope: 'cloud', off: true }),
];

test('name match outranks description-only match', () => {
  assert.deepEqual(searchServers(items, { query: 'postgres' }).map((s) => s.name), ['postgres-mcp', 'popular-tool']);
});

test('more matched keywords rank first, ties keep popularity order', () => {
  assert.equal(searchServers(items, { query: 'slack notion' })[0].name, 'slack-notion-bridge');
});

test('vendor-owned server outranks third-party ones', () => {
  const withVendor = [mk('github-pr-helper', 'github PRs'), mk('github-mcp-server', 'GitHub API', 'other', { id: 'github/github-mcp-server' })];
  assert.equal(searchServers(withVendor, { query: 'github' })[0].id, 'github/github-mcp-server');
});

test('filters and limit apply', () => {
  assert.deepEqual(searchServers(items, { query: 'slack', scope: 'cloud' }).map((s) => s.name), ['slack-bot']);
  assert.deepEqual(searchServers(items, { query: 'slack', officialOnly: true }).map((s) => s.name), ['slack-bot']);
  assert.equal(searchServers(items, { query: 'slack', limit: 1 }).length, 1);
  assert.deepEqual(searchServers(items, { query: 'nothing-matches' }), []);
});
