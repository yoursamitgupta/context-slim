#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { collectFiles, processFile } from '../src/utils/file-tree.js';
import { formatAsMarkdown } from '../src/formatters/markdown.js';

const args = process.argv.slice(2);

function showHelp() {
  console.log(`
ContextSlim - Semantic AST context minifier for AI coding agents

Usage:
  npx context-slim <file-or-dir> [options]

Options:
  -t, --tokens     Show token reduction metrics and savings table
  -o, --output     Write output to a specified file
  --raw            Output raw code without markdown blocks
  --json           Print structured JSON output
  -h, --help       Show this help message

Examples:
  npx context-slim src/index.ts
  npx context-slim ./src --tokens
  npx context-slim ./src -o context.md
`);
}

if (args.includes('-h') || args.includes('--help')) {
  showHelp();
  process.exit(0);
}

const showTokens = args.includes('-t') || args.includes('--tokens');
const isJson = args.includes('--json');
const isRaw = args.includes('--raw');

const outputIndex = args.findIndex(a => a === '-o' || a === '--output');
const outputFile = outputIndex !== -1 ? args[outputIndex + 1] : null;

const targets = args.filter(a => !a.startsWith('-') && a !== outputFile);
const targetPath = targets.length > 0 ? targets[0] : '.';

if (!fs.existsSync(targetPath)) {
  console.error(`Error: Target path does not exist: ${targetPath}`);
  process.exit(1);
}

const files = collectFiles(path.resolve(targetPath));

if (files.length === 0) {
  console.error(`No supported source files found in: ${targetPath}`);
  process.exit(1);
}

const processed = files.map(processFile);

if (isJson) {
  console.log(JSON.stringify(processed, null, 2));
  process.exit(0);
}

let resultText = '';
if (isRaw) {
  resultText = processed.map(p => p.slimmedContent).join('\n\n');
} else {
  resultText = formatAsMarkdown(processed, showTokens);
}

if (outputFile) {
  fs.writeFileSync(outputFile, resultText, 'utf-8');
  console.log(`Context saved to ${outputFile}`);
} else {
  console.log(resultText);
}

if (showTokens) {
  let totalOriginal = 0;
  let totalSlimmed = 0;

  for (const item of processed) {
    totalOriginal += item.metrics.originalTokens;
    totalSlimmed += item.metrics.slimmedTokens;
  }

  const saved = totalOriginal - totalSlimmed;
  const pct = totalOriginal > 0 ? ((saved / totalOriginal) * 100).toFixed(1) : '0.0';

  console.error('\n--- Token Reduction Summary ---');
  console.error(`Files processed:  ${processed.length}`);
  console.error(`Original tokens:  ${totalOriginal.toLocaleString()}`);
  console.error(`Slimmed tokens:   ${totalSlimmed.toLocaleString()}`);
  console.error(`Tokens saved:     ${saved.toLocaleString()} (${pct}% reduction)`);
}
