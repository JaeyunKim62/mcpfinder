import { ServerItem, SupportedClient } from '../types';

export interface GeneratedConfig {
  filename: string;
  locationHint: string;
  code: string;
  cliCommand?: string;
}

export function parseInstallCommand(item: ServerItem): { command: string; args: string[] } {
  if (item.cmd) {
    const parts = item.cmd.trim().split(/\s+/);
    return {
      command: parts[0] || 'npx',
      args: parts.slice(1),
    };
  }

  if (item.pkgType === 'npm' && item.pkg) {
    return {
      command: 'npx',
      args: ['-y', item.pkg],
    };
  }

  if (item.pkgType === 'pypi' && item.pkg) {
    return {
      command: 'uvx',
      args: [item.pkg],
    };
  }

  return {
    command: 'npx',
    args: ['-y', item.name],
  };
}

export function getCleanServerKey(item: ServerItem): string {
  return item.name
    .replace(/^@/, '')
    .replace(/[/_]/g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '')
    .toLowerCase();
}

export function generateClientConfig(
  item: ServerItem,
  client: SupportedClient,
  envValues: Record<string, string> = {}
): GeneratedConfig {
  const key = getCleanServerKey(item);
  const { command, args } = parseInstallCommand(item);

  const envObj: Record<string, string> = {};
  if (item.envs) {
    for (const e of item.envs) {
      envObj[e.name] = envValues[e.name] || (e.secret ? 'YOUR_' + e.name : '');
    }
  }

  // Only a known endpoint makes it remote; http transport alone often still ships a local package
  const remoteUrl = item.remoteUrl;
  const localDef = { command, args, ...(Object.keys(envObj).length > 0 ? { env: envObj } : {}) };

  switch (client) {
    case 'claude': {
      // Claude Desktop config only launches local processes; bridge remote servers via mcp-remote
      const serverDef = remoteUrl ? { command: 'npx', args: ['-y', 'mcp-remote', remoteUrl] } : localDef;
      return {
        filename: 'claude_desktop_config.json',
        locationHint: 'macOS: ~/Library/Application Support/Claude/ | Windows: %APPDATA%\\Claude\\',
        code: JSON.stringify({ mcpServers: { [key]: serverDef } }, null, 2),
      };
    }

    case 'cursor': {
      const serverDef = remoteUrl ? { url: remoteUrl } : localDef;
      return {
        filename: 'mcp.json',
        locationHint: 'Project: .cursor/mcp.json | Global: ~/.cursor/mcp.json',
        code: JSON.stringify({ mcpServers: { [key]: serverDef } }, null, 2),
      };
    }

    case 'windsurf': {
      const serverDef = remoteUrl ? { serverUrl: remoteUrl } : localDef;
      return {
        filename: 'mcp_config.json',
        locationHint: '~/.codeium/windsurf/mcp_config.json',
        code: JSON.stringify({ mcpServers: { [key]: serverDef } }, null, 2),
      };
    }

    case 'zed': {
      const serverDef = remoteUrl ? { url: remoteUrl } : localDef;
      return {
        filename: 'settings.json',
        locationHint: '~/.config/zed/settings.json',
        code: JSON.stringify({ context_servers: { [key]: serverDef } }, null, 2),
      };
    }

    case 'claude_code': {
      const envFlags = Object.entries(envObj)
        .map(([k, v]) => `-e ${k}="${v}"`)
        .join(' ');

      const transport = item.trans === 'sse' ? 'sse' : 'http';
      const cli = remoteUrl
        ? `claude mcp add ${key} --transport ${transport} ${remoteUrl}`
        : `claude mcp add ${key} ${envFlags ? envFlags + ' ' : ''}-- ${command} ${args.join(' ')}`;

      return {
        filename: 'Terminal Command',
        locationHint: 'Run directly in your shell with Claude Code CLI installed',
        code: cli,
        cliCommand: cli,
      };
    }
  }
}
