import { slimJavaScript } from './parsers/javascript.js';
import { slimPython } from './parsers/python.js';
import { estimateTokens, computeReduction } from './utils/tokens.js';
import { collectFiles, processFile, getLanguageForFile } from './utils/file-tree.js';
import { formatAsMarkdown } from './formatters/markdown.js';

export {
  slimJavaScript,
  slimPython,
  estimateTokens,
  computeReduction,
  collectFiles,
  processFile,
  getLanguageForFile,
  formatAsMarkdown
};

export function slimCode(code, language = 'javascript') {
  if (language === 'python') {
    return slimPython(code);
  }
  return slimJavaScript(code);
}
