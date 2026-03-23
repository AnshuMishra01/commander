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

function installOllama(): void {
  const platform = process.platform;

  if (platform === 'darwin') {
    // macOS: try brew first, fallback to curl installer
    console.error(chalk.yellow('  Ollama not found. Installing automatically...'));
    try {
      execSync('which brew', { stdio: 'pipe' });
      console.error(chalk.gray('  Running: brew install ollama'));
      execSync('brew install ollama', { stdio: 'inherit' });
      return;
    } catch {
      // brew not available, try direct install
    }
    try {
      console.error(chalk.gray('  Downloading Ollama installer...'));
      execSync('curl -fsSL https://ollama.com/install.sh | sh', { stdio: 'inherit' });
      return;
    } catch {
      throw new Error('Failed to install Ollama automatically. Install manually from https://ollama.com/download');
    }
  }

  if (platform === 'linux') {
    console.error(chalk.yellow('  Ollama not found. Installing automatically...'));
    try {
      console.error(chalk.gray('  Running: curl -fsSL https://ollama.com/install.sh | sh'));
      execSync('curl -fsSL https://ollama.com/install.sh | sh', { stdio: 'inherit' });
      return;
    } catch {
      throw new Error('Failed to install Ollama automatically. Install manually from https://ollama.com/download');
    }
  }

  if (platform === 'win32') {
    console.error(chalk.yellow('  Ollama not found. Installing automatically...'));

    // Try winget first (built into Windows 10/11)
    try {
      execSync('where winget', { stdio: 'pipe' });
      console.error(chalk.gray('  Running: winget install Ollama.Ollama'));
      execSync('winget install Ollama.Ollama --accept-package-agreements --accept-source-agreements', {
        stdio: 'inherit',
      });
      // winget may need a PATH refresh
      refreshPathWindows();
      if (isOllamaInstalled()) return;
    } catch {
      // winget not available or failed
    }

    // Fallback: download and run the installer silently
    try {
      const installerUrl = 'https://ollama.com/download/OllamaSetup.exe';
      const installerPath = `${process.env.TEMP || 'C:\\\\Temp'}\\\\OllamaSetup.exe`;
      console.error(chalk.gray('  Downloading Ollama installer...'));
      execSync(`curl -fsSL -o "${installerPath}" "${installerUrl}"`, { stdio: 'pipe' });
      console.error(chalk.gray('  Running installer (this may take a minute)...'));
      execSync(`"${installerPath}" /S`, { stdio: 'inherit' });
      refreshPathWindows();
      if (isOllamaInstalled()) return;
    } catch {
      // silent install failed
    }

    throw new Error(
      'Could not install Ollama automatically.\n' +
      '  Please install it manually from: https://ollama.com/download/windows\n' +
      '  Then run coderdodo again.'
    );
  }

  throw new Error('Unsupported platform. Install Ollama manually from https://ollama.com/download');
}

function refreshPathWindows(): void {
  // After winget/installer, ollama might be in PATH but current process doesn't see it
  // Common install locations on Windows
  const paths = [
    `${process.env.LOCALAPPDATA}\\Programs\\Ollama`,
    `${process.env.PROGRAMFILES}\\Ollama`,
    'C:\\Program Files\\Ollama',
  ];
  for (const p of paths) {
    try {
      execSync(`"${p}\\ollama.exe" --version`, { stdio: 'pipe' });
      process.env.PATH = `${p};${process.env.PATH}`;
      return;
    } catch {
      // not in this location
    }
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
  // 1. Install Ollama if not present
  if (!isOllamaInstalled()) {
    installOllama();
    if (!isOllamaInstalled()) {
      showError('Ollama installation failed. Please install manually from https://ollama.com/download');
      process.exit(1);
    }
    console.error(chalk.green('  Ollama installed successfully!'));
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
