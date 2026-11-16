/**
 * Extracts semantic interface signatures from Python code.
 * Preserves classes, method signatures, type annotations, and docstrings
 * while collapsing function bodies to '...'.
 */

export function slimPython(sourceCode) {
  if (!sourceCode || typeof sourceCode !== 'string') {
    return '';
  }

  const lines = sourceCode.split('\n');
  const output = [];
  let inDocstring = false;
  let docstringDelimiter = null;
  let skippingBlockIndent = null;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      if (skippingBlockIndent === null) {
        output.push('');
      }
      continue;
    }

    const currentIndent = rawLine.search(/\S|$/);

    // Stop skipping once we return to an indentation level <= the block opener
    if (skippingBlockIndent !== null) {
      if (currentIndent <= skippingBlockIndent) {
        skippingBlockIndent = null;
      } else {
        continue;
      }
    }

    // Handle multi-line docstrings
    if (!inDocstring && (trimmed.startsWith('"""') || trimmed.startsWith("'''"))) {
      const delim = trimmed.startsWith('"""') ? '"""' : "'''";
      output.push(rawLine);
      const occurrences = (trimmed.match(new RegExp(delim, 'g')) || []).length;
      if (occurrences === 1) {
        inDocstring = true;
        docstringDelimiter = delim;
      }
      continue;
    }

    if (inDocstring) {
      output.push(rawLine);
      if (trimmed.includes(docstringDelimiter)) {
        inDocstring = false;
        docstringDelimiter = null;
      }
      continue;
    }

    // Preserve decorators, imports, and top-level definitions
    if (
      trimmed.startsWith('@') ||
      trimmed.startsWith('import ') ||
      trimmed.startsWith('from ') ||
      trimmed.startsWith('class ')
    ) {
      output.push(rawLine);
      continue;
    }

    // Check for function or method declarations
    if (trimmed.startsWith('def ') || trimmed.startsWith('async def ')) {
      output.push(rawLine);
      
      // Lookahead to check if the next line is a docstring
      let nextLineIndex = i + 1;
      let hasDocstring = false;
      while (nextLineIndex < lines.length && !lines[nextLineIndex].trim()) {
        nextLineIndex++;
      }

      if (nextLineIndex < lines.length) {
        const nextTrimmed = lines[nextLineIndex].trim();
        if (nextTrimmed.startsWith('"""') || nextTrimmed.startsWith("'''")) {
          hasDocstring = true;
        }
      }

      if (!hasDocstring) {
        const indentStr = ' '.repeat(currentIndent + 4);
        output.push(`${indentStr}...`);
      }

      skippingBlockIndent = currentIndent;
      continue;
    }

    // Keep top-level constants and type definitions
    if (currentIndent === 0 && (trimmed.includes('=') || trimmed.includes(':'))) {
      output.push(rawLine);
      continue;
    }
  }

  return output
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
