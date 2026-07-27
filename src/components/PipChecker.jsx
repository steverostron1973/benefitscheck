import { useState, useEffect } from 'react';

const STEPS = ['intro', 'daily-living', 'mobility', 'results'];
const PROGRESS_STEPS = [
  { key: 'daily-living', label: 'Daily Living', stepOf: 'Step 1 of 3' },
  { key: 'mobility', label: 'Mobility', stepOf: 'Step 2 of 3' },
  { key: 'results', label: 'Your Results', stepOf: 'Step 3 of 3' },
];

const CONDITIONS = [
  'Arthritis (rheumatoid or osteoarthritis)',
  'Autism spectrum condition',
  'ADHD',
  'Bipolar disorder',
  'Cancer',
  'Chronic pain',
  "Crohn's disease or IBD",
  'Depression or anxiety',
  'Diabetes',
  'Epilepsy',
  'Fibromyalgia',
  'Motor neurone disease',
  'Multiple sclerosis',
  "Parkinson's disease",
  'Schizophrenia or psychosis',
  'Stroke',
  'Other condition',
];

const INITIAL_STATE = {
  condition: '',
  age: '',
};

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

function ProgressBar({ step }) {
  if (step === 'intro') return null;

  const currentIndex = PROGRESS_STEPS.findIndex((s) => s.key === step);

  return (
    <div className="progress-wrap" aria-label="Checker progress">
      <div className="progress-labels">
        {PROGRESS_STEPS.map((item, i) => {
          let className = 'progress-label';
          if (i < currentIndex) className += ' done';
          if (i === currentIndex) className += ' active';
          return (
            <div key={item.key} className={className}>
              <span className="progress-step-of">{item.stepOf}</span>
              <span className="progress-step-name">{item.label}</span>
            </div>
          );
        })}
      </div>
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${Math.round((currentIndex / (PROGRESS_STEPS.length - 1)) * 100)}%` }}
        />
      </div>
    </div>
  );
}

export default function PipChecker() {
  const [step, setStep] = useState('intro');
  const [d, setD] = useState(INITIAL_STATE);

  const set = (k, v) => setD((prev) => ({ ...prev, [k]: v }));

  const nav = (next) => {
    setStep(next);
    document.querySelector('.right-panel')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const introValid =
    d.condition !== '' &&
    d.age !== '' &&
    Number(d.age) >= 16 &&
    Number(d.age) <= 120;

  useEffect(() => {
    const footerNote = document.getElementById('footer-note');
    if (footerNote) footerNote.style.display = step === 'results' ? 'none' : 'block';
  }, [step]);

  return (
    <div>
      <ProgressBar step={step} />

      {step === 'intro' && (
        <div>
          <h2 className="step-title">Before we start</h2>
          <p className="step-hint">
            Tell us a little about your situation. We&apos;ll use this to personalise guidance as you work through the 12 PIP activities.
          </p>

          <div className="field">
            <label className="field-label" htmlFor="pip-condition">
              What is your main condition?
            </label>
            <select
              id="pip-condition"
              className="sel-input"
              value={d.condition}
              onChange={(e) => set('condition', e.target.value)}
            >
              <option value="">Select a condition</option>
              {CONDITIONS.map((condition) => (
                <option key={condition} value={condition}>
                  {condition}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label className="field-label" htmlFor="pip-age">
              How old are you?
            </label>
            <p className="field-sublabel">
              PIP is normally for people aged 16 to State Pension age. Enter your age in years.
            </p>
            <input
              id="pip-age"
              className="text-input"
              type="number"
              inputMode="numeric"
              min={16}
              max={120}
              placeholder="e.g. 42"
              value={d.age}
              onChange={(e) => set('age', e.target.value)}
            />
          </div>

          <div className="nav">
            <div className="nav-right">
              <Btn disabled={!introValid} onClick={() => nav('daily-living')}>
                Start checker →
              </Btn>
            </div>
          </div>
        </div>
      )}

      {step === 'daily-living' && (
        <div>
          <h2 className="step-title">Daily Living</h2>
          <p className="step-hint">
            Next we&apos;ll ask about the 10 Daily Living activities. This section is coming in Stage 2.
          </p>
          <div className="placeholder-box">
            <p>
              You selected <strong>{d.condition || 'your condition'}</strong>
              {d.age ? `, age ${d.age}` : ''}. Daily Living questions will appear here soon.
            </p>
          </div>
          <div className="nav">
            <Btn ghost onClick={() => nav('intro')}>
              ← Back
            </Btn>
            <div className="nav-right">
              <Btn onClick={() => nav('mobility')}>Continue to Mobility →</Btn>
            </div>
          </div>
        </div>
      )}

      {step === 'mobility' && (
        <div>
          <h2 className="step-title">Mobility</h2>
          <p className="step-hint">
            Next we&apos;ll ask about Planning and following journeys, and Moving around. Coming in a later stage.
          </p>
          <div className="nav">
            <Btn ghost onClick={() => nav('daily-living')}>
              ← Back
            </Btn>
            <div className="nav-right">
              <Btn onClick={() => nav('results')}>See results →</Btn>
            </div>
          </div>
        </div>
      )}

      {step === 'results' && (
        <div>
          <h2 className="step-title">Your Results</h2>
          <p className="step-hint">
            Your Daily Living and Mobility score estimates will appear here once the full checker is built.
          </p>
          <div className="placeholder-box">
            <p>
              Based on <strong>{d.condition || 'your answers'}</strong>
              {d.age ? ` (age ${d.age})` : ''}. Full scoring arrives in Stage 2+.
            </p>
          </div>
          <div className="nav">
            <Btn ghost onClick={() => nav('mobility')}>
              ← Back
            </Btn>
            <div className="nav-right">
              <Btn
                onClick={() => {
                  setD(INITIAL_STATE);
                  nav('intro');
                }}
              >
                Start again
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
