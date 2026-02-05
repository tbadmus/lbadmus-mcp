#!/usr/bin/env node
/**
 * Example: Testing Excel MCP Server
 *
 * This script demonstrates how to interact with the excel-mcp-server
 * via the stdio protocol using docker exec.
 *
 * Usage: node test-excel-mcp.js
 *
 * Prerequisites:
 * - excel-mcp-server container must be running
 * - Excel files should be placed in ~/Desktop/excel-files/
 */

const { spawn } = require('child_process');
const readline = require('readline');

const EXCEL_FILE = "/excel-files/example.xlsx"; // Update with your file name
const SHEET_NAME = "Sheet1"; // Update with your sheet name

// Spawn the MCP server via docker exec
const mcp = spawn('docker', ['exec', '-i', 'excel-mcp-server', 'excel-mcp-server']);

let requestId = 1;
const pendingRequests = new Map();

// Set up line reader for responses
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

mcp.stderr.on('data', (data) => {
  console.error('Server error:', data.toString());
});

/**
 * Send a JSON-RPC request to the MCP server
 */
function sendRequest(method, params = {}) {
  return new Promise((resolve) => {
    const id = requestId++;
    const request = {
      jsonrpc: "2.0",
      id,
      method,
      params
    };

    pendingRequests.set(id, resolve);
    mcp.stdin.write(JSON.stringify(request) + '\n');
  });
}

/**
 * Main test function
 */
async function main() {
  console.log('🔌 Connecting to excel-mcp-server...\n');

  // Step 1: Initialize the MCP session
  const initResponse = await sendRequest('initialize', {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "test-client", version: "1.0" }
  });

  console.log('✅ Initialized:', initResponse.result.serverInfo.name,
              'version', initResponse.result.serverInfo.version);

  // Step 2: List available tools
  console.log('\n📋 Available tools:');
  const toolsResponse = await sendRequest('tools/list');
  toolsResponse.result.tools.forEach(tool => {
    console.log(`  - ${tool.name}: ${tool.description}`);
  });

  // Step 3: Describe sheets in the Excel file
  console.log('\n📊 Describing sheets...');
  try {
    const describeResponse = await sendRequest('tools/call', {
      name: 'excel_describe_sheets',
      arguments: { fileAbsolutePath: EXCEL_FILE }
    });

    const sheetsData = JSON.parse(describeResponse.result.content[0].text);
    console.log('  Backend:', sheetsData.backend);
    console.log('  Sheets found:', sheetsData.sheets.length);
    sheetsData.sheets.forEach(sheet => {
      console.log(`    - ${sheet.name} (${sheet.usedRange})`);
    });
  } catch (e) {
    console.error('  ❌ Error:', e.message);
    console.log('  💡 Tip: Make sure the Excel file exists in ~/Desktop/excel-files/');
  }

  // Step 4: Read sheet data (first 5 rows)
  console.log(`\n📖 Reading ${SHEET_NAME} (first 5 rows)...`);
  try {
    const readResponse = await sendRequest('tools/call', {
      name: 'excel_read_sheet',
      arguments: {
        fileAbsolutePath: EXCEL_FILE,
        sheetName: SHEET_NAME,
        range: 'A1:E5'
      }
    });

    // The response is HTML formatted
    const htmlContent = readResponse.result.content[0].text;
    console.log('  ✅ Data retrieved (HTML format)');
    console.log('  💡 Use jsdom or similar to parse the HTML table');
  } catch (e) {
    console.error('  ❌ Error:', e.message);
  }

  // Clean up
  setTimeout(() => {
    mcp.kill();
    console.log('\n👋 Disconnected\n');
    process.exit(0);
  }, 1000);
}

// Run the test
main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
