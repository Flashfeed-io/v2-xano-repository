/**
 * Calculate category score from radar values using weighted emphasis curve
 * @param {number[]} radarValues - Array of radar values (0-5 scale)
 * @returns {number} Calculated score (0-100)
 */
export function calcCategoryScore(radarValues) {
  // Convert 0-5 scale to 0-100 scale
  const scaledValues = radarValues.map(v => (v / 5) * 100);
  
  // Sort descending
  const sorted = [...scaledValues].sort((a, b) => b - a);
  const top = sorted.slice(0, 3);
  const others = sorted.slice(3);

  // Weighted emphasis curve: super reward for top 1–2
  const w1 = 0.65, w2 = 0.25, w3 = 0.1;

  // Nonlinear amplifier — 95 feels huge, 70 not as much
  const amplify = v => Math.pow(v / 100, 1.4) * 100;

  const topWeighted =
    (amplify(top[0] || 0) * w1) +
    (amplify(top[1] || 0) * w2) +
    (amplify(top[2] || 0) * w3);

  // Minor contribution from rest, but diminished
  const otherAvg = others.length
    ? others.reduce((a, b) => a + b, 0) / others.length
    : 0;

  const othersWeighted = amplify(otherAvg) * 0.05;

  // Total category score
  const score = Math.min(100, topWeighted + othersWeighted);
  return score;
}

/**
 * Calculate virality, direct response, and overall scores from copilot data
 * @param {Object} copilot - Copilot object containing virality_radar and direct_response_radar
 * @param {boolean} updateCopilot - Whether to update the copilot object with calculated scores
 * @returns {Object} Object with virality, direct_response, and score properties
 */
export function calcAdScores(copilot, updateCopilot = true) {
  if (!copilot?.virality_radar || !copilot?.direct_response_radar) {
    return { virality: 0, direct_response: 0, score: 0 };
  }
  
  const viralityScore = calcCategoryScore(copilot.virality_radar.map(r => r.value));
  const directResponseScore = calcCategoryScore(copilot.direct_response_radar.map(r => r.value));
  
  // Weighted average overall: virality slightly stronger for pop potential
  const overallScore = (viralityScore * 0.55) + (directResponseScore * 0.45);
  
  const scores = {
    virality: Math.round(viralityScore),
    direct_response: Math.round(directResponseScore),
    score: Math.round(overallScore)
  };
  
  // Update copilot object with calculated scores
  if (updateCopilot) {
    copilot.virality = scores.virality;
    copilot.direct_response = scores.direct_response;
    copilot.score = scores.score;
  }
  
  return scores;
}

/**
 * Calculate individual category score (virality or direct response)
 * @param {Object} copilot - Copilot object
 * @param {string} category - Category type: 'virality' or 'direct_response'
 * @returns {number} Rounded score for the category
 */
export function calcSingleCategoryScore(copilot, category) {
  const radarKey = category === 'virality' ? 'virality_radar' : 'direct_response_radar';
  
  if (!copilot[radarKey] || !Array.isArray(copilot[radarKey])) {
    return 0;
  }
  
  const score = calcCategoryScore(copilot[radarKey].map(r => r.value));
  return Math.round(score);
}
