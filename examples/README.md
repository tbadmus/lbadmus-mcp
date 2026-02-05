# MCP Server Examples

This directory contains example scripts demonstrating how to interact with MCP servers in the mcp-central-gateway setup.

## Available Examples

### test-excel-mcp.js

A comprehensive example showing how to interact with the excel-mcp-server via stdio protocol.

**Features demonstrated:**
- Initializing MCP session
- Listing available tools
- Calling MCP tools (describe_sheets, read_sheet)
- Error handling
- Async request/response handling

**Usage:**
```bash
# Install dependencies (if needed)
npm install

# Run the example
node examples/test-excel-mcp.js
```

**Prerequisites:**
- excel-mcp-server container must be running
- Place an Excel file in `~/Desktop/excel-files/`
- Update `EXCEL_FILE` and `SHEET_NAME` constants in the script

## Testing Other Servers

The same pattern can be used to test other MCP servers:

1. Replace `'excel-mcp-server'` with your container name
2. Replace `'excel-mcp-server'` command with your server's binary
3. Update the tool names and arguments for your specific server

## Resources

- See [TESTING.md](../TESTING.md) for more testing methods
- [MCP Protocol Specification](https://modelcontextprotocol.io/)
- [mcp-proxy Documentation](https://github.com/mark3labs/mcp-proxy)
