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

  const isRemote = item.trans === 'streamable_http' || item.trans === 'sse' || !!item.remoteUrl;
  const remoteUrl = item.remoteUrl || 'https://api.example.com/mcp';

  switch (client) {
    case 'claude': {
      const serverDef = isRemote
        ? { url: remoteUrl }
        : { command, args, ...(Object.keys(envObj).length > 0 ? { env: envObj } : {}) };

      const json = {
        mcpServers: {
          [key]: serverDef,
        },
      };

      return {
        filename: 'claude_desktop_config.json',
        locationHint: 'macOS: ~/Library/Application Support/Claude/ | Windows: %APPDATA%\\Claude\\',
        code: JSON.stringify(json, null, 2),
      };
    }

    case 'cursor': {
      const serverDef = isRemote
        ? { url: remoteUrl }
        : { command, args, ...(Object.keys(envObj).length > 0 ? { env: envObj } : {}) };

      const json = {
        mcpServers: {
          [key]: serverDef,
        },
      };

      return {
        filename: 'mcp.json',
        locationHint: 'Project: .cursor/mcp.json | Global: ~/.cursor/mcp.json',
        code: JSON.stringify(json, null, 2),
      };
    }

    case 'windsurf': {
      const serverDef = isRemote
        ? { url: remoteUrl }
        : { command, args, ...(Object.keys(envObj).length > 0 ? { env: envObj } : {}) };

      const json = {
        mcpServers: {
          [key]: serverDef,
        },
      };

      return {
        filename: 'mcp_config.json',
        locationHint: '~/.codeium/windsurf/mcp_config.json',
        code: JSON.stringify(json, null, 2),
      };
    }

    case 'zed': {
      const serverDef = isRemote
        ? { id: key, url: remoteUrl }
        : { id: key, command, args, ...(Object.keys(envObj).length > 0 ? { env: envObj } : {}) };

      const json = {
        context_servers: [serverDef],
      };

      return {
        filename: 'settings.json',
        locationHint: '~/.config/zed/settings.json',
        code: JSON.stringify(json, null, 2),
      };
    }

    case 'claude_code': {
      const envFlags = Object.entries(envObj)
        .map(([k, v]) => `-e ${k}="${v}"`)
        .join(' ');

      const cli = isRemote
        ? `claude mcp add ${key} --transport http ${remoteUrl}`
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

export function generateMergedStackConfig(
  items: ServerItem[],
  client: SupportedClient,
  envValues: Record<string, Record<string, string>> = {}
): GeneratedConfig {
  if (client === 'zed') {
    const list = items.map((item) => {
      const key = getCleanServerKey(item);
      const { command, args } = parseInstallCommand(item);
      const isRemote = item.trans === 'streamable_http' || item.trans === 'sse' || !!item.remoteUrl;
      const remoteUrl = item.remoteUrl || 'https://api.example.com/mcp';

      const envObj: Record<string, string> = {};
      if (item.envs) {
        for (const e of item.envs) {
          const val = envValues[item.id]?.[e.name];
          envObj[e.name] = val || (e.secret ? 'YOUR_' + e.name : '');
        }
      }

      return isRemote
        ? { id: key, url: remoteUrl }
        : { id: key, command, args, ...(Object.keys(envObj).length > 0 ? { env: envObj } : {}) };
    });

    return {
      filename: 'settings.json',
      locationHint: '~/.config/zed/settings.json',
      code: JSON.stringify({ context_servers: list }, null, 2),
    };
  }

  if (client === 'claude_code') {
    const commands = items.map((item) => {
      return generateClientConfig(item, 'claude_code', envValues[item.id] || {}).code;
    });

    return {
      filename: 'Terminal Commands',
      locationHint: 'Run each command in your terminal',
      code: commands.join('\n\n'),
    };
  }

  // Claude, Cursor, Windsurf all use { mcpServers: { ... } }
  const mcpServers: Record<string, any> = {};
  for (const item of items) {
    const key = getCleanServerKey(item);
    const { command, args } = parseInstallCommand(item);
    const isRemote = item.trans === 'streamable_http' || item.trans === 'sse' || !!item.remoteUrl;
    const remoteUrl = item.remoteUrl || 'https://api.example.com/mcp';

    const envObj: Record<string, string> = {};
    if (item.envs) {
      for (const e of item.envs) {
        const val = envValues[item.id]?.[e.name];
        envObj[e.name] = val || (e.secret ? 'YOUR_' + e.name : '');
      }
    }

    mcpServers[key] = isRemote
      ? { url: remoteUrl }
      : { command, args, ...(Object.keys(envObj).length > 0 ? { env: envObj } : {}) };
  }

  const filename =
    client === 'claude'
      ? 'claude_desktop_config.json'
      : client === 'cursor'
      ? 'mcp.json'
      : 'mcp_config.json';

  const locationHint =
    client === 'claude'
      ? 'macOS: ~/Library/Application Support/Claude/ | Windows: %APPDATA%\\Claude\\'
      : client === 'cursor'
      ? 'Project: .cursor/mcp.json | Global: ~/.cursor/mcp.json'
      : '~/.codeium/windsurf/mcp_config.json';

  return {
    filename,
    locationHint,
    code: JSON.stringify({ mcpServers }, null, 2),
  };
}
