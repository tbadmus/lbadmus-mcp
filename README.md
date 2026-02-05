# MCP Central Gateway

Docker Compose configuration for running multiple MCP (Model Context Protocol) servers.

## Docker Hub Images

All MCP server images are available on Docker Hub:

| Image | Description | Pull Command |
|-------|-------------|--------------|
| `elbeeng/mcp-atlassian` | Atlassian Jira/Confluence | `docker pull elbeeng/mcp-atlassian:latest` |
| `elbeeng/mcp-aws` | AWS CLI operations | `docker pull elbeeng/mcp-aws:latest` |
| `elbeeng/mcp-terraform` | HashiCorp Terraform | `docker pull elbeeng/mcp-terraform:latest` |
| `elbeeng/mcp-openai` | OpenAI GPT models | `docker pull elbeeng/mcp-openai:latest` |
| `elbeeng/mcp-gemini` | Google Gemini models | `docker pull elbeeng/mcp-gemini:latest` |
| `elbeeng/browserbase-mcp-server` | Browserbase browser automation | `docker pull elbeeng/browserbase-mcp-server:latest` |

## Available MCP Servers

| Service | Port | Transport | Endpoint |
|---------|------|-----------|----------|
| mcp-atlassian-sse | 8000 | SSE | http://localhost:8000/sse |
| mcp-atlassian-http | 8001 | HTTP | http://localhost:8001/mcp |
| aws-mcp-server | 8002 | SSE | http://localhost:8002/sse |
| terraform-mcp-server | 8003 | HTTP | http://localhost:8003/mcp |
| openai-mcp-server | 8004 | HTTP | http://localhost:8004/mcp |
| gemini-mcp-server | 8005 | HTTP | http://localhost:8005/mcp |
| browserbase-mcp-server | 8006 | HTTP | http://localhost:8006/mcp |

## Quick Start (Using Pre-built Images)

1. Pull all images:

   ```bash
   docker pull elbeeng/mcp-atlassian:latest
   docker pull elbeeng/mcp-aws:latest
   docker pull elbeeng/mcp-terraform:latest
   docker pull elbeeng/mcp-openai:latest
   docker pull elbeeng/mcp-gemini:latest
   docker pull elbeeng/browserbase-mcp-server:latest
   ```

2. Create a `.env` file with your credentials:

   ```bash
   # Atlassian/Jira
   JIRA_URL=https://your-instance.atlassian.net
   JIRA_USERNAME=your-email@example.com
   JIRA_API_TOKEN=your-jira-api-token

   # OpenAI
   OPENAI_API_KEY=sk-your-openai-api-key

   # Google Gemini
   GEMINI_API_KEY=your-gemini-api-key

   # Browserbase (AI-powered browser automation)
   BROWSERBASE_API_KEY=your-browserbase-api-key
   BROWSERBASE_PROJECT_ID=your-browserbase-project-id
   ```

3. Use docker-compose-registry.yml (or run containers manually):

   ```bash
   docker compose -f docker-compose-registry.yml up -d
   ```

## Manual Container Run (Using Registry Images)

```bash
# Atlassian MCP (SSE)
docker run -d --name mcp-atlassian-sse -p 8000:8000 \
  -e JIRA_URL="$JIRA_URL" \
  -e JIRA_USERNAME="$JIRA_USERNAME" \
  -e JIRA_API_TOKEN="$JIRA_API_TOKEN" \
  -e TRANSPORT=sse \
  elbeeng/mcp-atlassian:latest

# AWS MCP
docker run -d --name mcp-aws -p 8002:8000 \
  -e AWS_MCP_TRANSPORT=sse \
  -v ~/.aws:/home/appuser/.aws:ro \
  elbeeng/mcp-aws:latest

# Terraform MCP
docker run -d --name mcp-terraform -p 8003:8080 \
  -e TRANSPORT_MODE=streamable-http \
  -e TRANSPORT_HOST=0.0.0.0 \
  -e TRANSPORT_PORT=8080 \
  elbeeng/mcp-terraform:latest

# OpenAI MCP
docker run -d --name mcp-openai -p 8004:8004 \
  -e OPENAI_API_KEY="$OPENAI_API_KEY" \
  -e PORT=8004 \
  elbeeng/mcp-openai:latest

# Gemini MCP
docker run -d --name mcp-gemini -p 8005:8005 \
  -e GEMINI_API_KEY="$GEMINI_API_KEY" \
  -e PORT=8005 \
  elbeeng/mcp-gemini:latest

# Browserbase MCP
docker run -d --name mcp-browserbase -p 8006:8006 \
  -e BROWSERBASE_API_KEY="$BROWSERBASE_API_KEY" \
  -e BROWSERBASE_PROJECT_ID="$BROWSERBASE_PROJECT_ID" \
  -e GEMINI_API_KEY="$GEMINI_API_KEY" \
  -e PORT=8006 \
  elbeeng/browserbase-mcp-server:latest
```

## Setup (Build from Source)

1. Copy `.env.example` to `.env` and fill in your credentials:

   ```bash
   cp .env.example .env
   ```

2. Or symlink to parent .env:

   ```bash
   ln -s ../.env .env
   ```

3. Build and start all services:

   ```bash
   docker compose up -d --build
   ```

4. Check status:

   ```bash
   docker compose ps
   ```

5. View logs:

   ```bash
   docker compose logs -f
   ```

## Claude Desktop Configuration

Claude Desktop requires `mcp-remote` to connect to HTTP-based MCP servers. Add this to your Claude Desktop configuration:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "atlassian-sse": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "http://localhost:8000/sse"]
    },
    "atlassian-http": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "http://localhost:8001/mcp"]
    },
    "aws": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "http://localhost:8002/sse"]
    },
    "terraform": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "http://localhost:8003/mcp"]
    },
    "openai": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "http://localhost:8004/mcp"]
    },
    "gemini": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "http://localhost:8005/mcp"]
    },
    "browserbase": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "http://localhost:8006/mcp"]
    }
  }
}
```

## Claude Code CLI Configuration

Claude Code CLI supports direct HTTP connections. Create `.mcp.json` in your project:

```json
{
  "mcpServers": {
    "atlassian": {
      "url": "http://localhost:8000/sse",
      "transport": "sse"
    },
    "aws": {
      "url": "http://localhost:8002/sse",
      "transport": "sse"
    },
    "terraform": {
      "url": "http://localhost:8003/mcp",
      "transport": "http"
    },
    "openai": {
      "url": "http://localhost:8004/mcp",
      "transport": "http"
    },
    "gemini": {
      "url": "http://localhost:8005/mcp",
      "transport": "http"
    },
    "browserbase": {
      "url": "http://localhost:8006/mcp",
      "transport": "http"
    }
  }
}
```

## Commands

```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# Rebuild and restart
docker compose up -d --build

# View logs for specific service
docker compose logs -f gemini-mcp-server

# Restart a specific service
docker compose restart openai-mcp-server

# Pull latest images from registry
docker compose pull
```

## Testing Endpoints

```bash
# Test Atlassian SSE
curl http://localhost:8000/sse -H "Accept: text/event-stream"

# Test AWS SSE
curl http://localhost:8002/sse -H "Accept: text/event-stream"

# Test Terraform health
curl http://localhost:8003/health

# Test OpenAI MCP
curl -X POST http://localhost:8004/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}'

# Test Gemini MCP
curl -X POST http://localhost:8005/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}'

# Test Browserbase MCP
curl -X POST http://localhost:8006/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}'
```

## Prerequisites

- Docker and Docker Compose
- Node.js (for `mcp-remote` with Claude Desktop)
- AWS credentials in `~/.aws` (for aws-mcp-server)
- Valid API keys in `.env` file:
  - `JIRA_URL`, `JIRA_USERNAME`, `JIRA_API_TOKEN` (Atlassian)
  - `OPENAI_API_KEY` (OpenAI)
  - `GEMINI_API_KEY` (Google Gemini)
  - `BROWSERBASE_API_KEY`, `BROWSERBASE_PROJECT_ID` (Browserbase)

## Architecture

```
┌─────────────────┐     ┌──────────────────────────────────────────┐
│  Claude Desktop │     │           Docker Containers              │
│                 │     │                                          │
│  ┌───────────┐  │     │  ┌─────────────┐  ┌─────────────┐       │
│  │mcp-remote │──┼─────┼──│ mcp-atlassian│  │  mcp-aws    │       │
│  └───────────┘  │     │  │   :8000     │  │   :8002     │       │
│                 │     │  └─────────────┘  └─────────────┘       │
│  ┌───────────┐  │     │                                          │
│  │mcp-remote │──┼─────┼──┌─────────────┐  ┌─────────────┐       │
│  └───────────┘  │     │  │mcp-terraform│  │ mcp-openai  │       │
│                 │     │  │   :8003     │  │   :8004     │       │
└─────────────────┘     │  └─────────────┘  └─────────────┘       │
                        │                                          │
┌─────────────────┐     │  ┌─────────────┐  ┌─────────────┐       │
│ Claude Code CLI │─────┼──│ mcp-gemini  │  │mcp-browserbase│     │
│ (Direct HTTP)   │     │  │   :8005     │  │   :8006     │       │
└─────────────────┘     │  └─────────────┘  └─────────────┘       │
                        └──────────────────────────────────────────┘
```

## License

MIT
