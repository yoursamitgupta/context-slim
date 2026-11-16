/**
 * Formats processed files into structured Markdown blocks for feeding
 * directly into LLMs with minimal token overhead.
 */

export function formatAsMarkdown(processedFiles, showMetrics = true) {
  const sections = [];

  for (const item of processedFiles) {
    const lang = item.language === 'python' ? 'python' : 'typescript';
    let header = `### File: \`${item.filePath}\``;
    
    if (showMetrics && item.metrics) {
      header += ` (${item.metrics.slimmedTokens} tokens, -${item.metrics.reductionPercentage}%)`;
    }

    sections.push(`${header}\n\`\`\`${lang}\n${item.slimmedContent}\n\`\`\``);
  }

  return sections.join('\n\n');
}
