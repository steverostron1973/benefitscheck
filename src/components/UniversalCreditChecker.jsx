import { useState, useEffect } from 'react';

const STEPS = ['household', 'work', 'housing', 'health', 'savings', 'results'];
const LABELS = ['Household', 'Work & income', 'Housing', 'Health & caring', 'Savings', 'Results'];

const INITIAL_STATE = {
  ageEligible: '',
  coupleOrSingle: '',
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

const GOV_UC_ELIGIBILITY = 'https://www.gov.uk/universal-credit/eligibility';
const GOV_OTHER_SUPPORT = 'https://www.gov.uk/benefits-calculators';

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
      'Based on your age and savings, you meet the basic eligibility criteria for Universal Credit. A full assessment by DWP will also look at your income, housing costs, and household circumstances before deciding your award.',
    tip: 'This is an eligibility check only — your monthly payment amount will be estimated in the next step. You must apply through GOV.UK for a formal decision.',
    url: GOV_UC_ELIGIBILITY,
    cta: 'How to claim Universal Credit on GOV.UK',
  };
}

function Radio({ options, value, onChange }) {
  return (
    <div className="radio-group">
      {options.map((o) => (
        <label
          key={o.v}
          className={`radio-option${value === o.v ? ' selected' : ''}`}
          onClick={() => onChange(o.v)}
        >
          <input
            type="radio"
            checked={value === o.v}
            onChange={() => onChange(o.v)}
            onClick={(e) => e.stopPropagation()}
          />
          {o.l}
        </label>
      ))}
    </div>
  );
}

function Btn({ children, onClick, ghost }) {
  return ghost ? (
    <button type="button" className="btn-ghost" onClick={onClick}>
      {children}
    </button>
  ) : (
    <button type="button" className="btn-primary" onClick={onClick}>
      {children}
    </button>
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
              value={d.coupleOrSingle}
              onChange={(v) => set('coupleOrSingle', v)}
              options={[
                { v: 'single', l: 'Single' },
                { v: 'couple', l: 'In a couple (married, civil partners, or living together)' },
              ]}
            />
          </div>
          <div className="field">
            <label className="field-label">Do you have children you're responsible for?</label>
            <Radio
              value={d.hasChildren}
              onChange={(v) => {
                set('hasChildren', v);
                if (v === 'no') set('numChildren', '');
              }}
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
              <Btn onClick={() => householdValid && nav('work')}>Continue →</Btn>
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
              value={d.working}
              onChange={(v) => {
                set('working', v);
                if (v === 'no') {
                  set('monthlyPay', '');
                  set('selfEmployed', '');
                }
              }}
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
            <Btn onClick={() => workValid && nav('housing')}>Continue →</Btn>
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
              value={d.housing}
              onChange={(v) => {
                set('housing', v);
                if (v !== 'rent') set('monthlyRent', '');
              }}
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
            <Btn onClick={() => housingValid && nav('health')}>Continue →</Btn>
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
            <Btn onClick={() => healthValid && nav('savings')}>Continue →</Btn>
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
            <Btn onClick={() => d.savings !== '' && nav('results')}>See my results →</Btn>
          </div>
        </>
      )}

      {step === 'results' && eligibility && (
        <>
          <div className={`result-banner${!isPotentiallyEligible ? ' none' : ''}`}>
            <div className="result-missing-label">Universal Credit eligibility</div>
            <div className="result-label" style={{ fontSize: '1.35rem', marginBottom: '0.5rem', fontWeight: 600 }}>
              {eligibility.headline}
            </div>
            <div className="result-sublabel">
              {isPotentiallyEligible
                ? 'Basic criteria met — payment estimate coming next'
                : 'Based on the information you provided'}
            </div>
          </div>

          <div className="results-list">
            <div className={`result-card${isPotentiallyEligible ? ' likely' : ''}`}>
              <div className="result-card-head">
                <div>
                  <div className="result-name">Universal Credit</div>
                  {!isPotentiallyEligible && (
                    <div className="result-amount">Not eligible at this stage</div>
                  )}
                </div>
                <span className={`chip ${isPotentiallyEligible ? 'yes' : 'no'}`}>
                  {isPotentiallyEligible ? '✓ Potentially eligible' : '✗ Not eligible'}
                </span>
              </div>
              <p className="result-summary">{eligibility.summary}</p>
              {eligibility.tip && <p className="result-tip">💡 {eligibility.tip}</p>}
              <a
                href={eligibility.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`result-link${isPotentiallyEligible ? '' : ' muted'}`}
              >
                {eligibility.cta} →
              </a>
            </div>
          </div>

          {isPotentiallyEligible && (
            <div className="already-box">
              <div className="already-title">Next step</div>
              <div className="already-list">
                Your monthly Universal Credit estimate will be calculated based on your income, rent, children, and other answers — coming in the next update to this checker.
              </div>
            </div>
          )}

          <div className="disclaimer">
            <strong>Disclaimer:</strong> This tool provides eligibility guidance only, based on the information you enter and 2026/27 rules. It is not financial advice. Your actual entitlement will be determined by DWP. Always verify on GOV.UK or with Citizens Advice before making any claim decisions.
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
