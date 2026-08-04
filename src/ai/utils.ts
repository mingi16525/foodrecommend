/**
 * AI & Math Utilities for Recommendation Engine
 */

/**
 * Calculates the cosine similarity between two vectors.
 * Returns a value between -1 and 1.
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length || vecA.length === 0) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  const result = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  return Math.max(-1, Math.min(1, result));
}

/**
 * Mock function to generate an embedding vector for Cold Start users or new dishes.
 * In production, this would call an Embedding Model (e.g., text-embedding-ada-002).
 */
export function generateEmbedding(text: string): number[] {
  // We'll create a deterministic fake 5-dimensional vector based on the string hash
  const vector = new Array(5).fill(0);
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    vector[i % 5] += charCode;
  }
  // Normalize it somewhat
  for (let i = 0; i < 5; i++) {
    vector[i] = (vector[i] % 100) / 100.0;
  }
  return vector;
}

/**
 * Maximal Marginal Relevance (MMR)
 * Balances relevance and diversity in recommendations.
 * @param items The candidate items, each must have an `embedding` (number[]) and an initial `score` (number)
 * @param queryVector The user's query vector
 * @param lambda Parameter between 0 and 1. 1 means pure relevance, 0 means pure diversity.
 * @param topK How many items to return
 */
export function maximalMarginalRelevance<T extends { id: string; score: number; embedding: number[] }>(
  items: T[],
  queryVector: number[],
  lambda: number = 0.5,
  topK: number = items.length
): T[] {
  if (items.length === 0) return [];
  
  const selected: T[] = [];
  const remaining = [...items];

  // While we need more items and have remaining items
  while (selected.length < topK && remaining.length > 0) {
    let bestScore = -Infinity;
    let bestIndex = -1;

    for (let i = 0; i < remaining.length; i++) {
      const candidate = remaining[i];
      const relevance = cosineSimilarity(candidate.embedding, queryVector); // Or use candidate.score

      let maxSimilarityToSelected = 0;
      for (const sel of selected) {
        const sim = cosineSimilarity(candidate.embedding, sel.embedding);
        if (sim > maxSimilarityToSelected) {
          maxSimilarityToSelected = sim;
        }
      }

      // MMR formula
      const mmrScore = lambda * relevance - (1 - lambda) * maxSimilarityToSelected;

      if (mmrScore > bestScore) {
        bestScore = mmrScore;
        bestIndex = i;
      }
    }

    if (bestIndex !== -1) {
      selected.push(remaining[bestIndex]);
      remaining.splice(bestIndex, 1);
    } else {
      break;
    }
  }

  return selected;
}
