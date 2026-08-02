import { traderConfig } from './config';

export function reviewRisk({ capital, entry, stop, openCorrelatedPositions = 0, dailyLossPct = 0, weeklyLossPct = 0 }) {
  const reasons = [];
  const numericCapital = Number(capital);
  const numericEntry = Number(entry);
  const numericStop = Number(stop);

  if (![numericCapital, numericEntry, numericStop].every(Number.isFinite)) reasons.push('invalid_numbers');
  if (numericCapital <= 0) reasons.push('invalid_capital');
  if (numericEntry <= 0 || numericStop <= 0 || numericEntry === numericStop) reasons.push('invalid_stop');
  if (openCorrelatedPositions >= traderConfig.risk.maxCorrelatedPositions) reasons.push('correlation_limit');
  if (dailyLossPct >= traderConfig.risk.maxDailyLossPct) reasons.push('daily_loss_limit');
  if (weeklyLossPct >= traderConfig.risk.maxWeeklyLossPct) reasons.push('weekly_loss_limit');

  if (reasons.length) return { approved: false, reasons, quantity: 0, riskAmount: 0 };

  const riskAmount = numericCapital * (traderConfig.risk.maxRiskPerTradePct / 100);
  const riskPerUnit = Math.abs(numericEntry - numericStop);
  const quantity = Math.floor(riskAmount / riskPerUnit);

  if (quantity < 1) reasons.push('position_too_small');

  return {
    approved: reasons.length === 0,
    reasons,
    quantity: Math.max(quantity, 0),
    riskAmount: Number(riskAmount.toFixed(2)),
    maxPositionValue: Number((Math.max(quantity, 0) * numericEntry).toFixed(2)),
  };
}
