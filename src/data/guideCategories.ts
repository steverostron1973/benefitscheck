export const guideCategories = [
  'universal-credit',
  'pip',
  'carers-allowance',
  'council-tax-reduction',
  'housing-benefit',
  'child-benefit',
  'pension-credit',
  'general',
] as const;

export type GuideCategory = (typeof guideCategories)[number];

export const categoryLabels: Record<GuideCategory, string> = {
  'universal-credit': 'Universal Credit',
  pip: 'PIP',
  'carers-allowance': "Carer's Allowance",
  'council-tax-reduction': 'Council Tax Reduction',
  'housing-benefit': 'Housing Benefit',
  'child-benefit': 'Child Benefit',
  'pension-credit': 'Pension Credit',
  general: 'General',
};

export const categoryIntros: Record<GuideCategory, string> = {
  'universal-credit':
    'Plain-English guides on Universal Credit — who qualifies, how to claim, and how it interacts with other benefits.',
  pip:
    'Guides to Personal Independence Payment (PIP) — eligibility, the assessment process, and what to do if your claim is refused.',
  'carers-allowance':
    "Guides for carers on Carer's Allowance and related support — including what counts as caring and how earnings affect your claim.",
  'council-tax-reduction':
    'Guides on Council Tax Reduction — how to apply through your local council and who may qualify for a discount.',
  'housing-benefit':
    'Guides on Housing Benefit and housing support — who can claim, how amounts are calculated, and how to apply.',
  'child-benefit':
    'Guides on Child Benefit — including the High Income Child Benefit Charge and how to claim for your children.',
  'pension-credit':
    'Guides on Pension Credit — a top-up for pensioners on a low income that can unlock other support too.',
  general:
    'General guides on UK benefits — useful background for anyone trying to understand the system.',
};
