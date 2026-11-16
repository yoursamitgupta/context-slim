/**
 * Heuristic token counter for estimating LLM token usage across
 * GPT, Claude, and Gemini model families.
 */

export function estimateTokens(text) {
  if (!text || typeof text !== 'string') {
    return 0;
  }

  // Common heuristic: 1 token is roughly 4 characters or 0.75 words for English code/text.
  // In source code, punctuation and symbols increase token density.
  const characterCount = text.length;
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  
  // Blended estimate tuned for programming languages (dense punctuation)
  const charBased = characterCount / 3.7;
  const wordBased = wordCount * 1.3;
  
  return Math.max(1, Math.round((charBased + wordBased) / 2));
}

export function computeReduction(originalText, slimmedText) {
  const originalTokens = estimateTokens(originalText);
  const slimmedTokens = estimateTokens(slimmedText);
  const savedTokens = Math.max(0, originalTokens - slimmedTokens);
  const reductionPercentage = originalTokens > 0
    ? ((savedTokens / originalTokens) * 100).toFixed(1)
    : '0.0';

  return {
    originalTokens,
    slimmedTokens,
    savedTokens,
    reductionPercentage: Number(reductionPercentage)
  };
}
