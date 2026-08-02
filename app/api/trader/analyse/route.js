import { NextResponse } from 'next/server';
import { scoreOpportunity } from '../../../../lib/trader/scoring';
import { reviewRisk } from '../../../../lib/trader/risk';
import { assertPaperMode } from '../../../../lib/trader/config';

export async function POST(request) {
  try {
    assertPaperMode();
    const body = await request.json();
    const opportunity = scoreOpportunity(body.signals || {});

    const riskReview = opportunity.score >= 75
      ? reviewRisk(body.trade || {})
      : { approved: false, reasons: ['score_below_proposal_threshold'], quantity: 0, riskAmount: 0 };

    return NextResponse.json({
      mode: 'paper',
      opportunity,
      riskReview,
      executable: false,
      message: riskReview.approved
        ? 'Proposition éligible au paper trading après validation humaine.'
        : 'Aucun ordre préparé : contrôles non validés.',
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
