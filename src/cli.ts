#!/usr/bin/env node

import chalk from 'chalk';
import { getSystemContext } from './context';
import { buildSystemPrompt } from './prompt';
import { generateCommand, DEFAULT_MODEL } from './ollama';
import { askConfirmation, runCommand } from './execute';
import { showCommand, showError, showThinking, clearThinking, showUsage } from './ui';
import { ensureReady } from './setup';

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    showUsage();
    process.exit(0);
  }

  const query = args.join(' ');
  const model = process.env.CODERDODO_MODEL || DEFAULT_MODEL;

  // Auto-setup: start Ollama + pull model if needed
  try {
    await ensureReady(model);
  } catch (err) {
    showError(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }

  const context = getSystemContext();
  const systemPrompt = buildSystemPrompt(context);

  showThinking();

  let result: Awaited<ReturnType<typeof generateCommand>>;
  try {
    result = await generateCommand(systemPrompt, query, model);
  } catch (err) {
    clearThinking();
    showError(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }

  clearThinking();
  showCommand(result.command, result.flags);

  const confirmed = await askConfirmation(
    chalk.yellow('  Execute? ') + chalk.gray('(Y/n): ')
  );

  if (!confirmed) {
    console.error(chalk.gray('  Cancelled.'));
    process.exit(0);
  }

  console.error();

  try {
    runCommand(result.command);
  } catch (err: any) {
    process.exit(err.status ?? 1);
  }
}

main();
