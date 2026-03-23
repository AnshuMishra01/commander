import chalk from 'chalk';

const SEPARATOR = chalk.gray('─'.repeat(40));

export function showThinking(): void {
  process.stderr.write(chalk.gray('  Thinking...'));
}

export function clearThinking(): void {
  process.stderr.write('\r\x1b[K');
}

export function showCommand(command: string, flags?: { flag: string; desc: string }[]): void {
  console.error();
  console.error('  ' + SEPARATOR);
  console.error('  ' + chalk.bold.green(command));
  console.error('  ' + SEPARATOR);

  if (flags && flags.length > 0) {
    console.error();
    console.error(chalk.yellow('  Breakdown:'));
    const maxLen = Math.max(...flags.map(f => f.flag.length));
    for (const f of flags) {
      console.error(
        '    ' + chalk.cyan(f.flag.padEnd(maxLen + 2)) + chalk.gray(f.desc)
      );
    }
  }

  console.error();
}

export function showError(message: string): void {
  console.error(chalk.red('  Error: ' + message));
}

export function showUsage(): void {
  console.error(`
${chalk.bold('coderdodo')} — Natural language to shell commands

${chalk.yellow('Usage:')}
  coderdodo <natural language description>

${chalk.yellow('Examples:')}
  coderdodo list all files larger than 100MB
  coderdodo find all TODO comments in this project
  coderdodo compress the logs folder into a tar.gz
  coderdodo start a redis container with docker
  coderdodo show git log for the last 5 commits

${chalk.yellow('Environment:')}
  CODERDODO_MODEL   Ollama model to use (default: qwen2.5-coder:1.5b)
`);
}
