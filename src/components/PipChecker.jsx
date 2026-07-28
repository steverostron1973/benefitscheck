import { useMemo, useState, useEffect } from 'react';

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

const RELIABILITY_HINT =
  'You are only treated as able to do an activity if you can do it safely, to an acceptable standard, repeatedly, and in a reasonable time (no more than twice as long as someone without your condition). Choose the highest descriptor that fits on the majority of days.';

const DAILY_LIVING = [
  {
    id: 'preparingFood',
    name: 'Preparing food',
    blurb: 'Preparing and cooking a simple meal for one using fresh ingredients — not just reheating ready meals.',
    descriptors: [
      { id: '0', label: 'Can prepare and cook a simple meal unaided', points: 0 },
      { id: '1', label: 'Needs to use an aid or appliance', points: 2 },
      { id: '2', label: 'Cannot cook using a microwave', points: 2 },
      { id: '3', label: 'Needs prompting', points: 2 },
      { id: '4', label: 'Needs supervision', points: 4 },
      { id: '5', label: 'Needs assistance', points: 4 },
      { id: '6', label: 'Cannot prepare and cook food', points: 8 },
    ],
  },
  {
    id: 'takingNutrition',
    name: 'Taking nutrition',
    blurb: 'Eating and drinking — cutting food, using cutlery, and getting food and drink to your mouth.',
    descriptors: [
      { id: '0', label: 'Can take nutrition unaided', points: 0 },
      { id: '1', label: 'Needs an aid or appliance', points: 2 },
      { id: '2', label: 'Needs prompting', points: 4 },
      { id: '3', label: 'Needs assistance', points: 6 },
      { id: '4', label: 'Cannot take nutrition', points: 10 },
    ],
  },
  {
    id: 'managingTherapy',
    name: 'Managing therapy or monitoring a health condition',
    blurb: 'Managing medication, monitoring a condition, or getting help with therapy at home.',
    descriptors: [
      { id: '0', label: 'Can manage unaided or no therapy needed', points: 0 },
      { id: '1', label: 'Needs aid or appliance', points: 1 },
      { id: '2', label: 'Needs supervision/prompting/assistance less than 3.5 hrs/week', points: 1 },
      { id: '3', label: 'Needs supervision/prompting/assistance 3.5-7 hrs/week', points: 2 },
      { id: '4', label: 'Needs supervision/prompting/assistance 7-14 hrs/week', points: 4 },
      { id: '5', label: 'Needs supervision/prompting/assistance 14+ hrs/week', points: 8 },
    ],
  },
  {
    id: 'washingBathing',
    name: 'Washing and bathing',
    blurb: 'Washing your whole body, including hair, and getting in and out of a bath or shower.',
    descriptors: [
      { id: '0', label: 'Can wash and bathe unaided', points: 0 },
      { id: '1', label: 'Needs aid or appliance', points: 2 },
      { id: '2', label: 'Needs supervision or prompting', points: 2 },
      { id: '3', label: 'Needs assistance to wash between shoulders and waist', points: 2 },
      { id: '4', label: 'Needs assistance to wash below waist', points: 4 },
      { id: '5', label: 'Needs assistance to get in or out of bath/shower', points: 3 },
      { id: '6', label: 'Cannot wash and bathe at all', points: 8 },
    ],
  },
  {
    id: 'toiletNeeds',
    name: 'Managing toilet needs or incontinence',
    blurb: 'Getting on and off the toilet, cleaning yourself, and managing incontinence if it applies.',
    descriptors: [
      { id: '0', label: 'Can manage unaided', points: 0 },
      { id: '1', label: 'Needs aid or appliance', points: 2 },
      { id: '2', label: 'Needs supervision or prompting', points: 2 },
      { id: '3', label: 'Needs assistance to manage toilet needs', points: 4 },
      { id: '4', label: 'Needs assistance to get on or off toilet', points: 4 },
      { id: '5', label: 'Cannot manage toilet needs at all', points: 8 },
    ],
  },
  {
    id: 'dressing',
    name: 'Dressing and undressing',
    blurb: 'Putting on and taking off clothes and shoes, including choosing appropriate clothing.',
    descriptors: [
      { id: '0', label: 'Can dress and undress unaided', points: 0 },
      { id: '1', label: 'Needs aid or appliance', points: 2 },
      { id: '2', label: 'Needs prompting to dress or select appropriate clothing', points: 2 },
      { id: '3', label: 'Needs assistance to dress or undress lower body', points: 2 },
      { id: '4', label: 'Needs assistance to dress or undress upper body', points: 4 },
      { id: '5', label: 'Cannot dress or undress at all', points: 8 },
    ],
  },
  {
    id: 'communicating',
    name: 'Communicating verbally',
    blurb: 'Expressing yourself in speech and understanding what other people say.',
    descriptors: [
      { id: '0', label: 'Can express and understand verbal information unaided', points: 0 },
      { id: '1', label: 'Needs aid or appliance', points: 2 },
      { id: '2', label: 'Needs communication support for complex verbal information', points: 4 },
      { id: '3', label: 'Needs communication support for basic verbal information', points: 8 },
      { id: '4', label: 'Cannot express or understand verbal information at all', points: 12 },
    ],
  },
  {
    id: 'reading',
    name: 'Reading and understanding signs, symbols and words',
    blurb: 'Reading and understanding basic and complex written information, including signs and labels.',
    descriptors: [
      {
        id: '0',
        label: 'Can read and understand basic and complex written information unaided or with glasses',
        points: 0,
      },
      { id: '1', label: 'Needs aid or appliance other than glasses', points: 2 },
      { id: '2', label: 'Needs prompting to read or understand complex written information', points: 2 },
      { id: '3', label: 'Needs prompting to read or understand basic written information', points: 4 },
      { id: '4', label: 'Cannot read or understand signs, symbols or words at all', points: 8 },
    ],
  },
  {
    id: 'engaging',
    name: 'Engaging with other people face to face',
    blurb: 'Meeting, talking to, and coping with other people in person.',
    descriptors: [
      { id: '0', label: 'Can engage with other people unaided', points: 0 },
      { id: '1', label: 'Needs prompting', points: 2 },
      { id: '2', label: 'Needs social support', points: 4 },
      { id: '3', label: 'Cannot engage with other people', points: 8 },
    ],
  },
  {
    id: 'budgeting',
    name: 'Making budgeting decisions',
    blurb: 'Understanding and deciding how to spend and manage money — from simple purchases to complex bills.',
    descriptors: [
      { id: '0', label: 'Can manage complex budgeting decisions unaided', points: 0 },
      { id: '1', label: 'Needs prompting or assistance for complex budgeting decisions', points: 2 },
      { id: '2', label: 'Needs prompting or assistance for simple budgeting decisions', points: 4 },
      { id: '3', label: 'Cannot make any budgeting decisions at all', points: 6 },
    ],
  },
];

const DEFAULT_DAILY_LIVING = Object.fromEntries(
  DAILY_LIVING.map((activity) => [activity.id, activity.descriptors[0].id])
);

const INITIAL_STATE = {
  condition: '',
  age: '',
  dailyLiving: DEFAULT_DAILY_LIVING,
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

function getActivityPoints(activity, selectedId) {
  const match = activity.descriptors.find((d) => d.id === selectedId);
  return match ? match.points : 0;
}

function sumDailyLiving(dailyLiving) {
  return DAILY_LIVING.reduce(
    (total, activity) => total + getActivityPoints(activity, dailyLiving[activity.id]),
    0
  );
}

function ActivityCard({ activity, index, selectedId, onChange }) {
  return (
    <fieldset className="pip-activity">
      <legend className="pip-activity-name">
        {index + 1}. {activity.name}
      </legend>
      <p className="pip-activity-blurb">{activity.blurb}</p>

      <details className="pip-hint">
        <summary>What does this mean?</summary>
        <p>{RELIABILITY_HINT}</p>
      </details>

      <div className="radio-group" role="radiogroup" aria-label={activity.name}>
        {activity.descriptors.map((descriptor) => {
          const inputId = `${activity.id}-${descriptor.id}`;
          const checked = selectedId === descriptor.id;
          return (
            <label
              key={descriptor.id}
              htmlFor={inputId}
              className={`radio-option${checked ? ' selected' : ''}`}
            >
              <input
                id={inputId}
                type="radio"
                name={activity.id}
                value={descriptor.id}
                checked={checked}
                onChange={() => onChange(descriptor.id)}
              />
              <span className="radio-option-text">{descriptor.label}</span>
              <span className="radio-option-pts">
                {descriptor.points} {descriptor.points === 1 ? 'pt' : 'pts'}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export default function PipChecker() {
  const [step, setStep] = useState('intro');
  const [d, setD] = useState(INITIAL_STATE);

  const set = (k, v) => setD((prev) => ({ ...prev, [k]: v }));

  const setDailyLiving = (activityId, descriptorId) => {
    setD((prev) => ({
      ...prev,
      dailyLiving: { ...prev.dailyLiving, [activityId]: descriptorId },
    }));
  };

  const nav = (next) => {
    setStep(next);
    document.querySelector('.right-panel')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const introValid =
    d.condition !== '' &&
    d.age !== '' &&
    Number(d.age) >= 16 &&
    Number(d.age) <= 120;

  const dailyLivingTotal = useMemo(() => sumDailyLiving(d.dailyLiving), [d.dailyLiving]);

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
            For each activity, choose the descriptor that best matches how you are on the <strong>majority of days</strong>. Only the highest descriptor per activity counts.
          </p>

          <div className="pip-activity-list">
            {DAILY_LIVING.map((activity, index) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                index={index}
                selectedId={d.dailyLiving[activity.id]}
                onChange={(descriptorId) => setDailyLiving(activity.id, descriptorId)}
              />
            ))}
          </div>

          <div className="pip-score-bar" aria-live="polite">
            <div>
              <span className="pip-score-label">Your Daily Living score so far</span>
              <strong className="pip-score-value">
                {dailyLivingTotal} {dailyLivingTotal === 1 ? 'point' : 'points'}
              </strong>
            </div>
            <p className="pip-score-thresholds">
              Thresholds: 8+ Standard (£72.65/week) · 12+ Enhanced (£108.55/week)
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
          <div className="placeholder-box">
            <p>
              Daily Living total saved: <strong>{dailyLivingTotal} points</strong>
              {d.condition ? ` · ${d.condition}` : ''}.
            </p>
          </div>
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
            Your Daily Living and Mobility score estimates will appear here once Mobility scoring is built.
          </p>
          <div className="placeholder-box">
            <p>
              Daily Living: <strong>{dailyLivingTotal} points</strong>
              {d.condition ? ` · ${d.condition}` : ''}
              {d.age ? ` · age ${d.age}` : ''}.
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
