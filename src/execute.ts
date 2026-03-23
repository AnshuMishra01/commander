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
  execSync(command, {
    stdio: 'inherit',
    shell: process.env.SHELL || '/bin/sh',
    cwd: process.cwd(),
  });
}
