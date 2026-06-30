import { useState, useEffect } from 'react';

const STEPS = ['household', 'work', 'housing', 'health', 'savings', 'results'];
const LABELS = ['Household', 'Work & income', 'Housing', 'Health & caring', 'Savings', 'Results'];

const INITIAL_STATE = {
  ageEligible: '',
  coupleOrSingle: '',
  age25OrOver: '',
  coupleBothUnder25: '',
  hasChildren: '',
  numChildren: '',
  working: '',
  monthlyPay: '',
  selfEmployed: '',
  housing: '',
  monthlyRent: '',
  healthLimitsWork: '',
  cares35Hours: '',
  savings: '',
};

const RATES = {
  singleUnder25: 316.98,
  single25Plus: 400.14,
  coupleBothUnder25: 496.93,
  coupleOneOrBoth25Plus: 628.1,
  childElement: 287.92,
  workAllowanceWithHousing: 404,
  workAllowanceNoHousing: 673,
  taperRate: 0.55,
  savingsTariffPer250: 4.35,
  savingsTariffThreshold: 6000,
};

const GOV_UC_ELIGIBILITY = 'https://www.gov.uk/universal-credit/eligibility';
const GOV_UC_CLAIM = 'https://www.gov.uk/apply-universal-credit';
const GOV_OTHER_SUPPORT = 'https://www.gov.uk/benefits-calculators';
const GUIDES_UC = '/guides/universal-credit/';
const ESTIMATE_DISCLAIMER =
  'This is an estimate based on simplified calculations and 2026/27 rates. Your actual award may differ — for an exact figure, use the official GOV.UK benefits calculator or contact Citizens Advice.';

function assessEligibility(d) {
  const savings = parseFloat(d.savings) || 0;

  if (d.ageEligible !== 'yes') {
    return {
      status: 'not_eligible',
      reason: 'age',
      headline: "You're not likely to be eligible",
      summary:
        'Universal Credit is for people aged 18 or over who have not reached State Pension age. If you are under 18, you may qualify only in limited circumstances (for example, certain carers or parents). If you have reached State Pension age, Pension Credit and other pensioner benefits may apply instead.',
      tip: 'Check GOV.UK for benefits that may apply to your age group, or contact Citizens Advice for guidance.',
      url: GOV_UC_ELIGIBILITY,
      cta: 'Check UC eligibility on GOV.UK',
    };
  }

  if (savings >= 16000) {
    return {
      status: 'not_eligible',
      reason: 'savings',
      headline: "You're not likely to be eligible",
      summary: `You told us your household has £${savings.toLocaleString()} in savings and capital. Universal Credit is not available when household savings or capital are £16,000 or more. This includes money in bank accounts, ISAs, and most investments — but not your home or pension pots.`,
      tip: 'You may still qualify for other support depending on your circumstances. Use the GOV.UK benefits calculator or speak to Citizens Advice.',
      url: GOV_OTHER_SUPPORT,
      cta: 'Find other support on GOV.UK',
    };
  }

  return {
    status: 'potentially_eligible',
    headline: 'You may be eligible',
    summary:
      'Based on your age and savings, you meet the basic eligibility criteria for Universal Credit. See your estimated monthly payment below.',
    tip: 'You must apply through GOV.UK for a formal decision — this checker provides an estimate only.',
    url: GOV_UC_ELIGIBILITY,
    cta: 'How to claim Universal Credit on GOV.UK',
  };
}

function getStandardAllowance(d) {
  if (d.coupleOrSingle === 'couple') {
    if (d.coupleBothUnder25 === 'yes') {
      return { amount: RATES.coupleBothUnder25, label: 'Couple standard allowance (both under 25)' };
    }
    return { amount: RATES.coupleOneOrBoth25Plus, label: 'Couple standard allowance (one or both aged 25+)' };
  }
  if (d.age25OrOver === 'no') {
    return { amount: RATES.singleUnder25, label: 'Single standard allowance (under 25)' };
  }
  return { amount: RATES.single25Plus, label: 'Single standard allowance (aged 25+)' };
}

function getChildElement(d) {
  const totalChildren = parseInt(d.numChildren, 10) || 0;
  if (d.hasChildren !== 'yes' || totalChildren === 0) {
    return { amount: 0, counted: 0, notes: [] };
  }

  const counted = Math.min(totalChildren, 2);
  const amount = counted * RATES.childElement;
  const notes = [
    'Child element uses £287.92 per child (2026/27 rate for children born on or after 6 April 2017). Your first child could be £333.33/month if born before that date — we do not collect birth dates here.',
  ];
  if (totalChildren > 2) {
    notes.push(
      'If you have 3+ children, some exceptions to the two-child limit may apply — use the full calculator on GOV.UK for an exact figure.',
    );
  }

  return { amount, counted, totalChildren, notes };
}

export function calcUcEstimate(d) {
  const savings = parseFloat(d.savings) || 0;
  const monthlyPay = parseFloat(d.monthlyPay) || 0;
  const renting = d.housing === 'rent';
  const housingElement = renting ? parseFloat(d.monthlyRent) || 0 : 0;

  const standard = getStandardAllowance(d);
  const child = getChildElement(d);

  const qualifiesForWorkAllowance =
    d.hasChildren === 'yes' || d.healthLimitsWork === 'yes';
  const workAllowance = qualifiesForWorkAllowance
    ? housingElement > 0
      ? RATES.workAllowanceWithHousing
      : RATES.workAllowanceNoHousing
    : 0;

  let taperDeduction = 0;
  if (d.working === 'yes') {
    const excess = Math.max(0, monthlyPay - workAllowance);
    taperDeduction = excess * RATES.taperRate;
  }

  let savingsTariff = 0;
  if (savings > RATES.savingsTariffThreshold && savings < 16000) {
    const excess = savings - RATES.savingsTariffThreshold;
    const units = Math.ceil(excess / 250);
    savingsTariff = units * RATES.savingsTariffPer250;
  }

  const maxAward = standard.amount + child.amount + housingElement;
  const estimatedMonthly = Math.max(0, maxAward - taperDeduction - savingsTariff);

  const notes = [...child.notes];
  if (housingElement > 0) {
    notes.push(
      'Housing element uses your rent as a simple proxy. Real Universal Credit uses Local Housing Allowance rates for your area, so your actual housing element may be lower.',
    );
  }

  return {
    estimatedMonthly: Math.round(estimatedMonthly * 100) / 100,
    breakdown: {
      standardAllowance: standard.amount,
      standardLabel: standard.label,
      childElement: child.amount,
      childrenCounted: child.counted,
      housingElement,
      maxAward: Math.round(maxAward * 100) / 100,
      workAllowance,
      monthlyPay: d.working === 'yes' ? monthlyPay : 0,
      taperDeduction: Math.round(taperDeduction * 100) / 100,
      savingsTariff: Math.round(savingsTariff * 100) / 100,
    },
    notes,
  };
}

function Radio({ name, options, value, onChange }) {
  return (
    <div className="radio-group" role="radiogroup" aria-label={name}>
      {options.map((o) => {
        const id = `${name}-${o.v}`;
        const checked = value === o.v;
        return (
          <label
            key={o.v}
            htmlFor={id}
            className={`radio-option${checked ? ' selected' : ''}`}
          >
            <input
              id={id}
              type="radio"
              name={name}
              value={o.v}
              checked={checked}
              onChange={() => onChange(o.v)}
            />
            <span>{o.l}</span>
          </label>
        );
      })}
    </div>
  );
}

function Btn({ children, onClick, ghost, disabled }) {
  return ghost ? (
    <button type="button" className="btn-ghost" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ) : (
    <button type="button" className="btn-primary" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

function formatMoney(amount) {
  return amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function BreakdownRow({ label, amount, variant = 'add' }) {
  let display;
  if (variant === 'deduction') display = `−£${formatMoney(amount)}`;
  else if (variant === 'add') display = `+£${formatMoney(amount)}`;
  else display = `£${formatMoney(amount)}`;

  return (
    <div className={`breakdown-row breakdown-row--${variant}`}>
      <span className="breakdown-label">{label}</span>
      <span className="breakdown-value">{display}</span>
    </div>
  );
}

function EstimateBreakdown({ estimate }) {
  const b = estimate.breakdown;

  return (
    <div className="estimate-breakdown">
      <h3 className="estimate-breakdown-heading">How your estimate was calculated</h3>
      <div className="breakdown-table">
        <BreakdownRow label="Standard allowance" amount={b.standardAllowance} />
        {b.childElement > 0 && (
          <BreakdownRow
            label={`Child element (${b.childrenCounted} child${b.childrenCounted !== 1 ? 'ren' : ''})`}
            amount={b.childElement}
          />
        )}
        {b.housingElement > 0 && (
          <BreakdownRow label="Housing element (rent estimate)" amount={b.housingElement} />
        )}
        <BreakdownRow label="Maximum award before deductions" amount={b.maxAward} variant="subtotal" />
        {b.taperDeduction > 0 && (
          <BreakdownRow
            label={`Earnings taper (55% above £${b.workAllowance} work allowance)`}
            amount={b.taperDeduction}
            variant="deduction"
          />
        )}
        {b.savingsTariff > 0 && (
          <BreakdownRow label="Savings tariff deduction" amount={b.savingsTariff} variant="deduction" />
        )}
        <BreakdownRow label="Estimated monthly payment" amount={estimate.estimatedMonthly} variant="final" />
      </div>
    </div>
  );
}

function NextSteps({ isPotentiallyEligible }) {
  return (
    <div className="next-steps-box">
      <div className="next-steps-title">Next steps</div>
      <p className="next-steps-intro">
        {isPotentiallyEligible
          ? 'If this estimate looks right for your situation, you can apply online through GOV.UK. Read our guides first if you want more detail on how Universal Credit works.'
          : 'You may still qualify for other support. Use the links below to check your options or read our Universal Credit guides.'}
      </p>
      <div className="next-steps-links">
        {isPotentiallyEligible && (
          <a
            href={GOV_UC_CLAIM}
            target="_blank"
            rel="noopener noreferrer"
            className="next-steps-link next-steps-link--primary"
          >
            Claim Universal Credit on GOV.UK →
          </a>
        )}
        <a href={GUIDES_UC} className="next-steps-link">
          Read Universal Credit guides →
        </a>
        {!isPotentiallyEligible && (
          <a
            href={GOV_OTHER_SUPPORT}
            target="_blank"
            rel="noopener noreferrer"
            className="next-steps-link"
          >
            Find other support on GOV.UK →
          </a>
        )}
      </div>
    </div>
  );
}

function App() {
  const [step, setStep] = useState('household');
  const [d, setD] = useState(INITIAL_STATE);

  const set = (k, v) => setD((prev) => ({ ...prev, [k]: v }));

  const nav = (next) => {
    setStep(next);
    document.querySelector('.right-panel')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const reset = () => {
    setStep('household');
    setD(INITIAL_STATE);
  };

  const idx = STEPS.indexOf(step);
  const pct = Math.round((idx / (STEPS.length - 1)) * 100);

  useEffect(() => {
    const footerNote = document.getElementById('footer-note');
    if (footerNote) footerNote.style.display = step === 'results' ? 'none' : 'block';
  }, [step]);

  const householdValid =
    d.ageEligible &&
    d.coupleOrSingle &&
    (d.coupleOrSingle === 'single' ? d.age25OrOver : d.coupleBothUnder25) &&
    d.hasChildren &&
    (d.hasChildren === 'no' || d.numChildren);

  const workValid =
    d.working &&
    (d.working === 'no' || (d.monthlyPay !== '' && d.selfEmployed));

  const housingValid =
    d.housing && (d.housing !== 'rent' || d.monthlyRent !== '');

  const healthValid = d.healthLimitsWork && d.cares35Hours;

  const eligibility = step === 'results' ? assessEligibility(d) : null;
  const isPotentiallyEligible = eligibility?.status === 'potentially_eligible';
  const estimate = isPotentiallyEligible ? calcUcEstimate(d) : null;

  return (
    <div>
      {step !== 'results' && (
        <div className="progress-wrap">
          <div className="progress-labels">
            {LABELS.map((l, i) => (
              <span
                key={l}
                className={`progress-label${i === idx ? ' active' : i < idx ? ' done' : ''}`}
              >
                {l}
              </span>
            ))}
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      {step === 'household' && (
        <>
          <h2 className="step-title">Your household</h2>
          <p className="step-hint">Universal Credit is assessed on your household — including your partner if you live together.</p>
          <div className="field">
            <label className="field-label">Are you 18 or over and under State Pension age?</label>
            <p className="field-sublabel">Universal Credit is generally for people of working age — from 18 up to State Pension age</p>
            <Radio
              name="ageEligible"
              value={d.ageEligible}
              onChange={(v) => set('ageEligible', v)}
              options={[
                { v: 'yes', l: 'Yes' },
                { v: 'no', l: 'No' },
              ]}
            />
          </div>
          <div className="field">
            <label className="field-label">Are you single or in a couple?</label>
            <Radio
              name="coupleOrSingle"
              value={d.coupleOrSingle}
              onChange={(v) =>
                setD((prev) => ({
                  ...prev,
                  coupleOrSingle: v,
                  age25OrOver: '',
                  coupleBothUnder25: '',
                }))
              }
              options={[
                { v: 'single', l: 'Single' },
                { v: 'couple', l: 'In a couple (married, civil partners, or living together)' },
              ]}
            />
          </div>
          {d.coupleOrSingle === 'single' && (
            <div className="field">
              <label className="field-label">Are you 25 or over?</label>
              <Radio
                name="age25OrOver"
                value={d.age25OrOver}
                onChange={(v) => set('age25OrOver', v)}
                options={[
                  { v: 'yes', l: 'Yes — aged 25 or over' },
                  { v: 'no', l: 'No — under 25' },
                ]}
              />
            </div>
          )}
          {d.coupleOrSingle === 'couple' && (
            <div className="field">
              <label className="field-label">Are you and your partner both under 25?</label>
              <Radio
                name="coupleBothUnder25"
                value={d.coupleBothUnder25}
                onChange={(v) => set('coupleBothUnder25', v)}
                options={[
                  { v: 'yes', l: 'Yes — both under 25' },
                  { v: 'no', l: 'No — at least one of us is 25 or over' },
                ]}
              />
            </div>
          )}
          <div className="field">
            <label className="field-label">Do you have children you're responsible for?</label>
            <Radio
              name="hasChildren"
              value={d.hasChildren}
              onChange={(v) =>
                setD((prev) => ({
                  ...prev,
                  hasChildren: v,
                  numChildren: v === 'no' ? '' : prev.numChildren,
                }))
              }
              options={[
                { v: 'yes', l: 'Yes' },
                { v: 'no', l: 'No' },
              ]}
            />
          </div>
          {d.hasChildren === 'yes' && (
            <div className="field">
              <label className="field-label">How many children?</label>
              <select
                className="sel-input"
                value={d.numChildren}
                onChange={(e) => set('numChildren', e.target.value)}
              >
                <option value="">Select...</option>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="nav">
            <div className="nav-right">
              <Btn onClick={() => nav('work')} disabled={!householdValid}>
                Continue →
              </Btn>
            </div>
          </div>
        </>
      )}

      {step === 'work' && (
        <>
          <h2 className="step-title">Work and income</h2>
          <p className="step-hint">UC can top up low wages — your earnings affect how much you receive.</p>
          <div className="field">
            <label className="field-label">Are you currently working?</label>
            <Radio
              name="working"
              value={d.working}
              onChange={(v) =>
                setD((prev) => ({
                  ...prev,
                  working: v,
                  monthlyPay: v === 'no' ? '' : prev.monthlyPay,
                  selfEmployed: v === 'no' ? '' : prev.selfEmployed,
                }))
              }
              options={[
                { v: 'yes', l: 'Yes' },
                { v: 'no', l: 'No' },
              ]}
            />
          </div>
          {d.working === 'yes' && (
            <>
              <div className="field">
                <label className="field-label">Monthly take-home pay (£)</label>
                <p className="field-sublabel">After tax and National Insurance — for you (and partner if applicable)</p>
                <input
                  className="text-input"
                  type="number"
                  min="0"
                  placeholder="e.g. 1200"
                  value={d.monthlyPay}
                  onChange={(e) => set('monthlyPay', e.target.value)}
                />
              </div>
              <div className="field">
                <label className="field-label">Are you self-employed?</label>
                <Radio
                  name="selfEmployed"
                  value={d.selfEmployed}
                  onChange={(v) => set('selfEmployed', v)}
                  options={[
                    { v: 'yes', l: 'Yes' },
                    { v: 'no', l: 'No — employed (PAYE)' },
                  ]}
                />
              </div>
            </>
          )}
          <div className="nav">
            <Btn ghost onClick={() => nav('household')}>← Back</Btn>
            <Btn onClick={() => nav('housing')} disabled={!workValid}>
              Continue →
            </Btn>
          </div>
        </>
      )}

      {step === 'housing' && (
        <>
          <h2 className="step-title">Housing</h2>
          <p className="step-hint">Your housing costs can affect your Universal Credit housing element.</p>
          <div className="field">
            <label className="field-label">Do you pay rent or a mortgage?</label>
            <Radio
              name="housing"
              value={d.housing}
              onChange={(v) =>
                setD((prev) => ({
                  ...prev,
                  housing: v,
                  monthlyRent: v !== 'rent' ? '' : prev.monthlyRent,
                }))
              }
              options={[
                { v: 'rent', l: 'I pay rent' },
                { v: 'mortgage', l: 'I pay a mortgage' },
                { v: 'neither', l: 'Neither — I live rent-free or am a homeowner with no mortgage' },
              ]}
            />
          </div>
          {d.housing === 'rent' && (
            <div className="field">
              <label className="field-label">Monthly rent (£)</label>
              <p className="field-sublabel">Your total monthly rent before any housing benefit</p>
              <input
                className="text-input"
                type="number"
                min="0"
                placeholder="e.g. 850"
                value={d.monthlyRent}
                onChange={(e) => set('monthlyRent', e.target.value)}
              />
            </div>
          )}
          <div className="nav">
            <Btn ghost onClick={() => nav('work')}>← Back</Btn>
            <Btn onClick={() => nav('health')} disabled={!housingValid}>
              Continue →
            </Btn>
          </div>
        </>
      )}

      {step === 'health' && (
        <>
          <h2 className="step-title">Health and caring</h2>
          <p className="step-hint">These can add extra elements to your Universal Credit award.</p>
          <div className="field">
            <label className="field-label">Do you have a health condition or disability that limits your ability to work?</label>
            <Radio
              name="healthLimitsWork"
              value={d.healthLimitsWork}
              onChange={(v) => set('healthLimitsWork', v)}
              options={[
                { v: 'yes', l: 'Yes' },
                { v: 'no', l: 'No' },
              ]}
            />
          </div>
          <div className="field">
            <label className="field-label">Do you care for someone for 35+ hours a week?</label>
            <Radio
              name="cares35Hours"
              value={d.cares35Hours}
              onChange={(v) => set('cares35Hours', v)}
              options={[
                { v: 'yes', l: 'Yes' },
                { v: 'no', l: 'No' },
              ]}
            />
          </div>
          <div className="nav">
            <Btn ghost onClick={() => nav('housing')}>← Back</Btn>
            <Btn onClick={() => nav('savings')} disabled={!healthValid}>
              Continue →
            </Btn>
          </div>
        </>
      )}

      {step === 'savings' && (
        <>
          <h2 className="step-title">Savings</h2>
          <p className="step-hint">Savings over £16,000 usually disqualify you from Universal Credit. Exclude your home and pension.</p>
          <div className="field">
            <label className="field-label">Total savings and capital (£)</label>
            <p className="field-sublabel">
              For you{d.coupleOrSingle === 'couple' ? ' and your partner' : ''} — bank accounts, ISAs, investments combined
            </p>
            <input
              className="text-input"
              type="number"
              min="0"
              placeholder="e.g. 3000"
              value={d.savings}
              onChange={(e) => set('savings', e.target.value)}
            />
          </div>
          <div className="nav">
            <Btn ghost onClick={() => nav('health')}>← Back</Btn>
            <Btn onClick={() => nav('results')} disabled={d.savings === ''}>
              See my results →
            </Btn>
          </div>
        </>
      )}

      {step === 'results' && eligibility && (
        <>
          <div className={`result-banner${!isPotentiallyEligible ? ' none' : ''}`}>
            {isPotentiallyEligible && estimate ? (
              <>
                <div className="result-missing-label">Your Universal Credit estimate</div>
                <div className="result-total">
                  £{formatMoney(estimate.estimatedMonthly)}
                </div>
                <div className="result-total-sub">per month · 2026/27 rates</div>
                <p className="result-headline">
                  Based on what you've told us, you could be entitled to approximately{' '}
                  <strong>£{formatMoney(estimate.estimatedMonthly)} per month</strong> in Universal Credit
                </p>
              </>
            ) : (
              <>
                <div className="result-missing-label">Universal Credit eligibility</div>
                <div className="result-ineligible-headline">{eligibility.headline}</div>
                <div className="result-sublabel">Based on the information you provided</div>
              </>
            )}
          </div>

          {isPotentiallyEligible && estimate && <EstimateBreakdown estimate={estimate} />}

          <div className="results-list">
            <div className={`result-card${isPotentiallyEligible ? ' likely' : ''}`}>
              <div className="result-card-head">
                <div className="result-name">Universal Credit</div>
                <span className={`chip ${isPotentiallyEligible ? 'yes' : 'no'}`}>
                  {isPotentiallyEligible ? '✓ Potentially eligible' : '✗ Not eligible'}
                </span>
              </div>
              <p className="result-summary">{eligibility.summary}</p>
              {eligibility.tip && <p className="result-tip">💡 {eligibility.tip}</p>}
              {estimate?.notes.map((note) => (
                <p key={note} className="result-tip">💡 {note}</p>
              ))}
            </div>
          </div>

          <NextSteps isPotentiallyEligible={isPotentiallyEligible} />

          <div className="disclaimer">
            <strong>Disclaimer:</strong>{' '}
            {isPotentiallyEligible ? ESTIMATE_DISCLAIMER : 'This tool provides eligibility guidance only, based on the information you enter and 2026/27 rules. It is not financial advice. Your actual entitlement will be determined by DWP. Always verify on GOV.UK or with Citizens Advice before making any claim decisions.'}
          </div>

          <div className="nav" style={{ marginTop: '1.5rem' }}>
            <Btn ghost onClick={() => nav('savings')}>← Amend answers</Btn>
            <Btn ghost onClick={reset}>↺ Start again</Btn>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
