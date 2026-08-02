export const traderConfig = Object.freeze({
  mode: 'paper',
  worldMonitor: {
    baseUrl: process.env.WORLD_MONITOR_BASE_URL || 'https://worldmonitor.app',
    apiKey: process.env.WORLD_MONITOR_API_KEY || '',
    timeoutMs: 10000,
  },
  risk: {
    maxRiskPerTradePct: 0.5,
    maxDailyLossPct: 1,
    maxWeeklyLossPct: 3,
    maxCorrelatedPositions: 2,
    leverageEnabled: false,
    averagingDownEnabled: false,
    requireStopLoss: true,
  },
  scoring: {
    analyseThreshold: 65,
    proposalThreshold: 75,
    priorityThreshold: 85,
  },
});

export function assertPaperMode() {
  if (traderConfig.mode !== 'paper') {
    throw new Error('Live trading is disabled in Trader OS V1.');
  }
}
