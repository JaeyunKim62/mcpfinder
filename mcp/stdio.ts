// Local entry: claude mcp add mcp-index -- npx tsx <repo>/mcp/stdio.ts
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './server.js';

await createServer().connect(new StdioServerTransport());
