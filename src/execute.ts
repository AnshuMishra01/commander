import * as readline from 'readline';
import { execSync } from 'child_process';

export function askConfirmation(prompt: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stderr,
  });

  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      const normalized = answer.trim().toLowerCase();
      // Default is Yes (empty input = yes)
      resolve(normalized === '' || normalized === 'y' || normalized === 'yes');
    });
  });
}

export function runCommand(command: string): void {
  const shell = process.platform === 'win32'
    ? process.env.COMSPEC || 'cmd.exe'
    : process.env.SHELL || '/bin/sh';
  execSync(command, {
    stdio: 'inherit',
    shell,
    cwd: process.cwd(),
  });
}
