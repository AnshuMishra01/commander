# coderdodo

**Natural language to shell commands.** Just describe what you want, get the command.

Powered by local AI via [Ollama](https://ollama.com) — no API keys, no cloud, 100% private.

---

## Demo

```
$ coderdodo start redis locally using docker and show me the logs

  ────────────────────────────────────────
  docker run -d --name redis -p 6379:6379 redis && docker logs redis
  ────────────────────────────────────────

  Breakdown:
    -d            Run container in background (detached)
    --name redis  Name the container "redis"
    -p 6379:6379  Map host port 6379 → container port 6379
    redis         Docker image to use

  Execute? (Y/n):
```

```
$ coderdodo copy all png files from Downloads to Desktop

  ────────────────────────────────────────
  cp /Users/anshu/Downloads/*.png /Users/anshu/Desktop
  ────────────────────────────────────────

  Breakdown:
    cp       Copy files
    *.png    Glob pattern for PNG files only
    ~/Downloads/  Source directory
    ~/Desktop/    Destination directory

  Execute? (Y/n):
```

```
$ coderdodo run the voxship backend docker container with port 8080 exposed

  ────────────────────────────────────────
  docker run -d --name voxship-backend -p 8080:8080 voxship/backend
  ────────────────────────────────────────

  Breakdown:
    -d                      Run container in background (detached)
    --name voxship-backend  Name the container "voxship-backend"
    -p 8080:8080            Map host port 8080 → container port 8080
    voxship/backend         Docker image to use

  Execute? (Y/n):
```

---

## Features

- **Natural language input** — just describe what you want in plain English
- **Command breakdown** — explains every flag and argument before you run it
- **Confirm before execute** — shows the command, you press Enter to run or `n` to cancel
- **Context-aware** — detects your OS, shell, and current directory for accurate commands
- **100% local** — runs on Ollama, no API keys, no cloud, your data stays on your machine
- **Tiny footprint** — 1 runtime dependency (`chalk`), ~25KB total
- **Cross-platform** — works on macOS, Linux, and Windows
- **Zero setup** — auto-starts Ollama and auto-pulls the model on first run

---

## Installation

### 1. Install Ollama

| Platform | Command |
|---|---|
| **macOS** | `brew install ollama` |
| **Linux** | `curl -fsSL https://ollama.com/install.sh \| sh` |
| **Windows** | Download from [ollama.com/download](https://ollama.com/download/windows) |

### 2. Install coderdodo

```bash
npm i -g coderdodo
```

That's it. **No other setup needed.** On first run, coderdodo will automatically start Ollama and download the model for you.

---

## Usage

```bash
coderdodo <describe what you want in plain English>
```

### File Operations

```bash
coderdodo copy all png files from Downloads to Desktop
coderdodo find all files larger than 100MB
coderdodo compress the src folder into a tar.gz
coderdodo rename all .jpeg files to .jpg in current directory
```

### Git

```bash
coderdodo show git log for the last 5 commits
coderdodo stage all files and commit with message "initial commit"
coderdodo remove some files from my previous commit and commit again
coderdodo create a new branch called feature-login
coderdodo squash the last 3 commits
```

### Docker

```bash
coderdodo start a redis container with port 6379 exposed
coderdodo show docker logs for redis
coderdodo stop and remove all running containers
coderdodo build a docker image from the Dockerfile in current directory
coderdodo run the voxship backend container with port 8080
```

### System & Networking

```bash
coderdodo show disk usage in human readable format
coderdodo show me all processes using port 3000
coderdodo find my public IP address
coderdodo show system memory usage
coderdodo list all open network connections
```

### Search & Exploration

```bash
coderdodo find all TODO comments in this project
coderdodo find all typescript files modified in the last 24 hours
coderdodo count lines of code in all javascript files
coderdodo search for "API_KEY" in all env files
```

### Package Managers

```bash
coderdodo install express and typescript as dev dependency
coderdodo list all globally installed npm packages
coderdodo update all outdated pip packages
coderdodo clear npm cache
```

---

## How It Works

```
 You type                     coderdodo starts redis with docker
     │
     ▼
 ┌──────────┐    ┌───────────────┐    ┌──────────┐
 │  Your     │───▶│  Local Ollama  │───▶│ Generated │
 │  Query    │    │  LLM (local)   │    │  Command  │
 └──────────┘    └───────────────┘    └──────────┘
                                            │
                                            ▼
                                     ┌──────────────┐
                                     │  Breakdown    │
                                     │  (flags +     │
                                     │   explanation) │
                                     └──────────────┘
                                            │
                                            ▼
                                     ┌──────────────┐
                                     │  Confirm &    │
                                     │  Execute      │
                                     └──────────────┘
```

1. You describe a task in natural language
2. coderdodo sends it to your **local** Ollama instance with context about your OS, shell, and current directory
3. The LLM generates the right shell command
4. You see the command + a **breakdown** of every flag and argument
5. Press **Enter** to execute, or **n** to cancel

---

## Configuration

### Changing the model

The default model is `qwen2.5-coder:1.5b` (986MB, code-specialized). You can use any Ollama model:

```bash
# Use a different model for one command
CODERDODO_MODEL=llama3.1 coderdodo show disk usage

# Or export it for the session
export CODERDODO_MODEL=llama3.1
coderdodo show disk usage
```

### Recommended models

| Model | Size | Best for |
|---|---|---|
| `qwen2.5-coder:1.5b` (default) | 986MB | Fast, great for common commands |
| `qwen2.5-coder:7b` | 4.7GB | More accurate for complex commands |
| `llama3.1` | 4.7GB | Good general purpose |
| `llama3.3` | 43GB | Best accuracy, needs beefy hardware |

---

## Why coderdodo?

| | coderdodo | Other tools |
|---|---|---|
| **Privacy** | 100% local via Ollama | Most require OpenAI/cloud API keys |
| **Cost** | Free forever | API calls cost money |
| **Speed** | Fast (local inference) | Network latency + API overhead |
| **Explain flags** | Built-in breakdown | Most just show the command |
| **Dependencies** | 1 (chalk) | Often 10+ |

---

## Development

```bash
git clone https://github.com/AnshuMishra01/commander.git
cd commander
npm install
npm run build
node dist/cli.js list files in current directory

# Install locally for testing
npm install -g .
coderdodo show disk usage
```

---

## License

MIT
