/**
 * Extracts semantic interface signatures from JavaScript and TypeScript code.
 * Preserves exports, types, interfaces, enums, docstrings, and function/method headers
 * while condensing function bodies.
 */

export function slimJavaScript(sourceCode) {
  if (!sourceCode || typeof sourceCode !== 'string') {
    return '';
  }

  const lines = sourceCode.split('\n');
  const output = [];
  let inBlockComment = false;
  let braceDepth = 0;
  let skipUntilBraceDepth = null;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Preserve multi-line JSDoc comments (crucial for LLM understanding)
    if (trimmed.startsWith('/**') || trimmed.startsWith('/*')) {
      inBlockComment = true;
      output.push(rawLine);
      if (trimmed.includes('*/') && !trimmed.endsWith('/*')) {
        inBlockComment = false;
      }
      continue;
    }

    if (inBlockComment) {
      output.push(rawLine);
      if (trimmed.includes('*/')) {
        inBlockComment = false;
      }
      continue;
    }

    // Preserve single line comments if they are annotations or directives
    if (trimmed.startsWith('// @') || trimmed.startsWith('///')) {
      output.push(rawLine);
      continue;
    }

    // Count braces on this line to manage nesting
    const openBraces = (rawLine.match(/\{/g) || []).length;
    const closeBraces = (rawLine.match(/\}/g) || []).length;

    // Check if we are currently skipping an inner function/method body
    if (skipUntilBraceDepth !== null) {
      braceDepth += openBraces - closeBraces;
      if (braceDepth <= skipUntilBraceDepth) {
        skipUntilBraceDepth = null;
      }
      continue;
    }

    // Always preserve imports, type aliases, and interfaces
    if (
      trimmed.startsWith('import ') ||
      trimmed.startsWith('export type ') ||
      trimmed.startsWith('export interface ') ||
      trimmed.startsWith('type ') ||
      trimmed.startsWith('interface ') ||
      trimmed.startsWith('export *')
    ) {
      output.push(rawLine);
      braceDepth += openBraces - closeBraces;
      continue;
    }

    // Identify function declarations, methods, or constructors
    const isFunctionDeclaration =
      /^(export\s+)?(default\s+)?(async\s+)?function(\s*\*|\s+[\w$]+)\s*\(/.test(trimmed) ||
      /^(public|private|protected|static|async|\*)*\s*constructor\s*\(/.test(trimmed) ||
      /^(public|private|protected|static|async|\*)*\s*[\w$]+\s*\([^)]*\)\s*([:]\s*[\w<>\[\],\s|&]+)?\s*\{/.test(trimmed) ||
      /^(export\s+)?(const|let|var)\s+[\w$]+\s*=\s*(async\s*)?\([^)]*\)\s*(=>)?\s*\{/.test(trimmed);

    if (isFunctionDeclaration && openBraces > 0) {
      // Extract the signature up to the opening brace
      const braceIndex = rawLine.indexOf('{');
      const signature = rawLine.slice(0, braceIndex).trimEnd();
      output.push(`${signature} { /* implementation truncated */ }`);

      // If the brace isn't closed on the same line, skip the rest of the body
      if (openBraces > closeBraces) {
        skipUntilBraceDepth = braceDepth;
        braceDepth += openBraces - closeBraces;
      }
      continue;
    }

    // Keep class headers, enums, and module declarations
    if (
      /^(export\s+)?(abstract\s+)?class\s+/.test(trimmed) ||
      /^(export\s+)?enum\s+/.test(trimmed) ||
      /^(export\s+)?namespace\s+/.test(trimmed)
    ) {
      output.push(rawLine);
      braceDepth += openBraces - closeBraces;
      continue;
    }

    // Preserve top-level variable declarations or export statements
    if (braceDepth === 0 && (trimmed.startsWith('export ') || trimmed.startsWith('const ') || trimmed.startsWith('let '))) {
      output.push(rawLine);
      braceDepth += openBraces - closeBraces;
      continue;
    }

    // Maintain closing braces for classes/namespaces
    if (trimmed === '}' || trimmed === '};') {
      output.push(rawLine);
      braceDepth += openBraces - closeBraces;
      continue;
    }

    // Update brace depth for any unmatched structural lines
    braceDepth += openBraces - closeBraces;
  }

  // Clean up duplicate empty lines
  return output
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
