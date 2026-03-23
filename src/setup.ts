import { execSync, spawn } from 'child_process';
import { showError } from './ui';
import chalk from 'chalk';

function isOllamaInstalled(): boolean {
  try {
    const cmd = process.platform === 'win32' ? 'where ollama' : 'which ollama';
    execSync(cmd, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

async function isOllamaRunning(): Promise<boolean> {
  try {
    const res = await fetch('http://127.0.0.1:11434/api/tags');
    return res.ok;
  } catch {
    return false;
  }
}

async function startOllama(): Promise<void> {
  console.error(chalk.gray('  Starting Ollama...'));
  const isWin = process.platform === 'win32';
  const child = spawn(isWin ? 'ollama.exe' : 'ollama', ['serve'], {
    stdio: 'ignore',
    detached: !isWin,
    shell: isWin,
    windowsHide: true,
  });
  child.unref();

  // Wait for Ollama to be ready (up to 15 seconds)
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 500));
    if (await isOllamaRunning()) return;
  }
  throw new Error('Ollama started but is not responding. Try running "ollama serve" manually.');
}

async function isModelAvailable(model: string): Promise<boolean> {
  try {
    const res = await fetch('http://127.0.0.1:11434/api/tags');
    if (!res.ok) return false;
    const data = await res.json();
    const models: string[] = (data.models || []).map((m: any) => m.name);
    // Check both exact match and without tag (e.g. "qwen2.5-coder:1.5b" or "qwen2.5-coder")
    return models.some(
      (m) => m === model || m.startsWith(model + ':') || model.startsWith(m.split(':')[0])
    );
  } catch {
    return false;
  }
}

async function pullModel(model: string): Promise<void> {
  console.error(chalk.gray(`  Pulling model ${model}... (first time only, may take a few minutes)`));
  try {
    execSync(`ollama pull ${model}`, { stdio: 'inherit' });
  } catch {
    throw new Error(`Failed to pull model '${model}'. Try running: ollama pull ${model}`);
  }
}

export async function ensureReady(model: string): Promise<void> {
  // 1. Check if Ollama is installed
  if (!isOllamaInstalled()) {
    const platform = process.platform;
    let installCmd = 'Visit https://ollama.com/download';
    if (platform === 'darwin') installCmd = 'brew install ollama';
    else if (platform === 'linux') installCmd = 'curl -fsSL https://ollama.com/install.sh | sh';
    else if (platform === 'win32') installCmd = 'Download from https://ollama.com/download/windows';

    showError(`Ollama is not installed. Install it with:\n\n  ${installCmd}\n`);
    process.exit(1);
  }

  // 2. Start Ollama if not running
  if (!(await isOllamaRunning())) {
    await startOllama();
  }

  // 3. Pull model if not available
  if (!(await isModelAvailable(model))) {
    await pullModel(model);
  }
}
