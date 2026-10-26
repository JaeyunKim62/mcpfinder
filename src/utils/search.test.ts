import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseQuery, searchServers } from './search';
import { ServerItem } from '../types';

const mk = (name: string, desc: string, cat = 'Other'): ServerItem => ({
  id: name, name, desc, cat, lang: 'ts', scope: 'local', off: false, gh: null, web: null, trans: 'stdio',
  cmd: null, pkg: null, pkgType: null, remoteUrl: null, envs: null, stars: null, dl: null, updatedAt: null,
});

test('parseQuery drops filler words and expands Korean terms, ignoring particles', () => {
  assert.deepEqual(parseQuery('PostgreSQL MCP 서버'), [['postgresql']]);
  assert.deepEqual(parseQuery('데이터베이스를 찾아줘'), [['데이터베이스를', 'database', 'sql']]);
});

test('multi-word query: all words matched ranks above partial matches', () => {
  const items = [mk('slack-bot', 'send slack messages'), mk('notion-slack', 'sync notion pages to slack')];
  assert.equal(searchServers(items, 'notion slack')[0].name, 'notion-slack');
});

test('Korean query finds English descriptions and Korean extra text', () => {
  const items = [mk('pg-tool', 'Query a PostgreSQL database'), mk('other', 'unrelated')];
  assert.deepEqual(searchServers(items, '데이터베이스').map((s) => s.name), ['pg-tool']);
  const ko = (s: ServerItem) => (s.name === 'other' ? '날씨 정보' : '');
  assert.deepEqual(searchServers([mk('other', 'unrelated')], '날씨', ko).map((s) => s.name), ['other']);
});
