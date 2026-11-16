import fs from 'node:fs';
import path from 'node:path';
import { slimJavaScript } from '../parsers/javascript.js';
import { slimPython } from '../parsers/python.js';
import { computeReduction } from './tokens.js';

const DEFAULT_IGNORE = new Set([
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  'coverage',
  '.venv',
  'venv',
  '__pycache__',
  '.turbo',
  'out'
]);

export function getLanguageForFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'].includes(ext)) {
    return 'javascript';
  }
  if (['.py', '.pyi'].includes(ext)) {
    return 'python';
  }
  return null;
}

export function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lang = getLanguageForFile(filePath);

  let slimmed = content;
  if (lang === 'javascript') {
    slimmed = slimJavaScript(content);
  } else if (lang === 'python') {
    slimmed = slimPython(content);
  }

  const metrics = computeReduction(content, slimmed);

  return {
    filePath,
    language: lang,
    originalContent: content,
    slimmedContent: slimmed,
    metrics
  };
}

export function collectFiles(targetPath, options = {}) {
  const results = [];
  const stat = fs.statSync(targetPath);

  if (stat.isFile()) {
    if (getLanguageForFile(targetPath)) {
      results.push(targetPath);
    }
    return results;
  }

  if (stat.isDirectory()) {
    const entries = fs.readdirSync(targetPath, { withFileTypes: true });
    for (const entry of entries) {
      if (DEFAULT_IGNORE.has(entry.name) || entry.name.startsWith('.')) {
        continue;
      }
      const fullPath = path.join(targetPath, entry.name);
      if (entry.isDirectory()) {
        results.push(...collectFiles(fullPath, options));
      } else if (entry.isFile() && getLanguageForFile(fullPath)) {
        results.push(fullPath);
      }
    }
  }

  return results;
}
