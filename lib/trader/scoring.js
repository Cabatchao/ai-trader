const clamp = (value, min = 0, max = 100) => Math.min(max, Math.max(min, Number(value) || 0));

export function scoreOpportunity(input) {
  const credibility = clamp(input.credibility);
  const novelty = clamp(input.novelty);
  const surprise = clamp(input.surprise);
  const economicImpact = clamp(input.economicImpact);
  const assetSensitivity = clamp(input.assetSensitivity);
  const marketConfirmation = clamp(input.marketConfirmation);
  const liquidity = clamp(input.liquidity);
  const rewardRisk = clamp(input.rewardRisk);
  const alreadyPriced = clamp(input.alreadyPriced);
  const contradictions = clamp(input.contradictions);

  const positive =
    credibility * 0.18 +
    novelty * 0.12 +
    surprise * 0.1 +
    economicImpact * 0.14 +
    assetSensitivity * 0.12 +
    marketConfirmation * 0.16 +
    liquidity * 0.08 +
    rewardRisk * 0.1;

  const penalties = alreadyPriced * 0.12 + contradictions * 0.1;
  const score = Math.round(clamp(positive - penalties));

  let action = 'archive';
  if (score >= 85) action = 'priority_alert';
  else if (score >= 75) action = 'prepare_proposal';
  else if (score >= 65) action = 'analyse';
  else if (score >= 50) action = 'watch';

  return { score, action };
}
