# MCP Server Testing Guide

This guide explains how to test and validate MCP servers in the mcp-central-gateway setup.

## Testing MCP Servers via stdio

MCP servers communicate via JSON-RPC over stdio. You can test them directly using docker exec.

### Basic Test Pattern

```bash
# Test initialize call
docker exec -i <container-name> <mcp-command> <<'EOF'
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}
EOF
```

### Example: Testing excel-mcp-server

#### 1. Initialize and list tools

```bash
docker exec -i excel-mcp-server excel-mcp-server <<'EOF'
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}
{"jsonrpc":"2.0","id":2,"method":"tools/list"}
EOF
```

#### 2. Call a tool

```bash
docker exec -i excel-mcp-server excel-mcp-server <<'EOF'
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}
{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"excel_describe_sheets","arguments":{"fileAbsolutePath":"/excel-files/example.xlsx"}}}
EOF
```

## Testing MCP Servers via HTTP/SSE

For servers exposed via mcp-proxy, you can test using HTTP endpoints.

### SSE Endpoints

```bash
# Test SSE connection
curl http://localhost:8007/sse -H "Accept: text/event-stream"
```

### HTTP Endpoints

```bash
# Test HTTP endpoint (for streamable-http transport)
curl -X POST http://localhost:8004/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}'
```

## Testing with Node.js

For more complex testing workflows, use Node.js scripts:

```javascript
const { spawn } = require('child_process');
const readline = require('readline');

const mcp = spawn('docker', ['exec', '-i', 'excel-mcp-server', 'excel-mcp-server']);

let requestId = 1;
const pendingRequests = new Map();

const rl = readline.createInterface({
  input: mcp.stdout,
  crlfDelay: Infinity
});

rl.on('line', (line) => {
  try {
    const response = JSON.parse(line);
    if (response.id && pendingRequests.has(response.id)) {
      const resolver = pendingRequests.get(response.id);
      resolver(response);
      pendingRequests.delete(response.id);
    }
  } catch (e) {
    console.error('Parse error:', e.message);
  }
});

function sendRequest(method, params = {}) {
  return new Promise((resolve) => {
    const id = requestId++;
    const request = { jsonrpc: "2.0", id, method, params };
    pendingRequests.set(id, resolve);
    mcp.stdin.write(JSON.stringify(request) + '\n');
  });
}

async function main() {
  // Initialize
  await sendRequest('initialize', {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "test", version: "1.0" }
  });

  // Call tools
  const response = await sendRequest('tools/call', {
    name: 'excel_describe_sheets',
    arguments: { fileAbsolutePath: '/excel-files/example.xlsx' }
  });

  console.log(JSON.stringify(response, null, 2));

  setTimeout(() => {
    mcp.kill();
    process.exit(0);
  }, 1000);
}

main().catch(console.error);
```

## Verifying Container Status

```bash
# Check if containers are running
docker ps --filter "name=mcp"

# Check container logs
docker logs excel-mcp-server --tail 20

# Check if file volumes are mounted correctly
docker exec excel-mcp-server ls -la /excel-files/
```

## Common Issues

### Issue: Session ID Required
**Problem**: HTTP endpoint returns "session_id is required"
**Solution**: Use SSE endpoint first to get a session ID, or use stdio testing

### Issue: Invalid Session ID
**Problem**: "Invalid session ID" error
**Solution**: Connect to SSE endpoint first to establish a valid session

### Issue: File Not Found
**Problem**: Excel file not found in container
**Solution**: Verify volume mount: `docker exec <container> ls -la /excel-files/`

### Issue: Parse Error
**Problem**: JSON parse error when reading responses
**Solution**: MCP returns HTML-formatted output for some tools (like excel_read_sheet). Parse the HTML table or check the response format.

## Testing Checklist

When adding a new MCP server:

- [ ] Container builds successfully
- [ ] Container starts without errors
- [ ] stdio communication works (initialize + tools/list)
- [ ] HTTP/SSE endpoint responds (if applicable)
- [ ] Tools can be called successfully
- [ ] Volume mounts work (if applicable)
- [ ] Environment variables are passed correctly
- [ ] Server appears in `docker ps`
- [ ] Server logs show no errors
- [ ] Image pushed to Docker registry
- [ ] README updated with server details
- [ ] docker-compose.yml updated
- [ ] docker-compose-registry.yml updated

## Resources

- [MCP Protocol Specification](https://modelcontextprotocol.io/)
- [mcp-proxy Documentation](https://github.com/mark3labs/mcp-proxy)
- [Claude Desktop MCP Integration](https://docs.anthropic.com/claude/docs/model-context-protocol)
