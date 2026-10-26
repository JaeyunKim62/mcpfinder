import type { VercelRequest, VercelResponse } from '@vercel/node';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createServer } from '../mcp/server.js';

// Remote entry: claude mcp add --transport http mcpfinder https://<site>/api/mcp
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    // Stateless server: no SSE stream or session to resume
    res.status(405).setHeader('Allow', 'POST').json({ jsonrpc: '2.0', error: { code: -32000, message: 'Method not allowed' }, id: null });
    return;
  }
  const server = createServer();
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
  res.on('close', () => {
    transport.close();
    server.close();
  });
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
}
