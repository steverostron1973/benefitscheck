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

const CONDITION_GUIDES = {
  Fibromyalgia: { href: '/guides/pip-fibromyalgia/' },
  'Arthritis (rheumatoid or osteoarthritis)': { href: '/guides/pip-arthritis/' },
  'Depression or anxiety': { href: '/guides/pip-depression-anxiety/' },
  'Autism spectrum condition': { href: '/guides/pip-autism/' },
  ADHD: { href: '/guides/pip-adhd/' },
  'Multiple sclerosis': { href: '/guides/pip-ms/' },
  'Chronic pain': { href: '/guides/pip-chronic-pain/' },
  Diabetes: { href: '/guides/pip-diabetes/' },
  Epilepsy: { href: '/guides/pip-epilepsy/' },
  "Crohn's disease or IBD": { href: '/guides/pip-crohns-ibd/' },
  'Bipolar disorder': { href: '/guides/pip-bipolar/' },
  'Schizophrenia or psychosis': { href: '/guides/pip-schizophrenia/' },
  Cancer: { href: '/guides/pip-cancer/' },
  'Motor neurone disease': { href: '/guides/pip-motor-neurone-disease/' },
  "Parkinson's disease": { href: '/guides/pip-parkinsons/' },
  Stroke: { href: '/guides/pip-stroke/' },

  // Catch-all for not listed
  'Other condition': { href: '/guides/pip/' },
};

const RATES = {
  dailyLiving: { standard: 72.65, enhanced: 108.55 },
  mobility: { standard: 28.7, enhanced: 75.75 },
};

const RELIABILITY_HINT =
  'You are only treated as able to do an activity if you can do it safely, to an acceptable standard, repeatedly, and in a reasonable time (no more than twice as long as someone without your condition). Choose the highest descriptor that fits on the majority of days.';

const DAILY_LIVING = [
  {
    id: 'preparingFood',
    name: 'Preparing food',
    blurb: 'Preparing and cooking a simple meal for one using fresh ingredients — not just reheating ready meals.',
    insight:
      'Focus on whether you can prepare a simple meal safely and repeatedly — not whether you manage on good days only.',
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
    insight:
      'Include prompting to eat, help cutting food, and any need for adapted cutlery or feeding support.',
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
    insight:
      'Count the hours of help you need each week for therapy, monitoring, or medication management.',
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
    insight:
      'Think about getting in and out of the bath or shower, and which parts of your body you need help to wash.',
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
    insight:
      'Include incontinence management and any need for help getting on or off the toilet.',
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
    insight:
      'Cover upper and lower body separately, plus prompting to choose appropriate clothing.',
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
    insight:
      'Describe whether you need support for basic or complex verbal information on most days.',
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
    insight:
      'Glasses alone do not score points — only other aids or prompting to understand written information.',
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
    insight:
      'Include social anxiety, prompting, or needing someone with you to engage face to face.',
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
    insight:
      'Simple decisions include everyday spending; complex ones include bills, rent, and budgeting over weeks.',
    descriptors: [
      { id: '0', label: 'Can manage complex budgeting decisions unaided', points: 0 },
      { id: '1', label: 'Needs prompting or assistance for complex budgeting decisions', points: 2 },
      { id: '2', label: 'Needs prompting or assistance for simple budgeting decisions', points: 4 },
      { id: '3', label: 'Cannot make any budgeting decisions at all', points: 6 },
    ],
  },
];

const MOBILITY = [
  {
    id: 'planningJourneys',
    name: 'Planning and following journeys',
    blurb: 'Planning a route and following it — including journeys that cause overwhelming psychological distress.',
    insight:
      'Psychological distress that stops you leaving home can score highly, even if you can physically walk.',
    descriptors: [
      { id: '0', label: 'Can plan and follow the route of a journey unaided', points: 0 },
      {
        id: '1',
        label: 'Needs prompting to undertake any journey to avoid overwhelming psychological distress',
        points: 4,
      },
      { id: '2', label: 'Cannot plan the route of a journey', points: 8 },
      {
        id: '3',
        label:
          'Cannot follow the route of an unfamiliar journey without another person, assistance dog or orientation aid',
        points: 10,
      },
      {
        id: '4',
        label: 'Cannot undertake any journey because it would cause overwhelming psychological distress',
        points: 10,
      },
      {
        id: '5',
        label:
          'Cannot follow the route of a familiar journey without another person, assistance dog or orientation aid',
        points: 12,
      },
    ],
  },
  {
    id: 'movingAround',
    name: 'Moving around',
    blurb: 'Standing and then moving a distance on level ground — with or without an aid.',
    insight:
      'Distances are on level ground. Include how far you can reliably move on most days, not your best day.',
    descriptors: [
      {
        id: '0',
        label: 'Can stand and then move more than 200 metres, either aided or unaided',
        points: 0,
      },
      {
        id: '1',
        label: 'Can stand and then move more than 50 metres but no more than 200 metres',
        points: 4,
      },
      {
        id: '2',
        label: 'Can stand and then move unaided more than 20 metres but no more than 50 metres',
        points: 8,
      },
      {
        id: '3',
        label: 'Can stand and then move using an aid more than 20 metres but no more than 50 metres',
        points: 8,
      },
      {
        id: '4',
        label: 'Can stand and then move more than 1 metre but no more than 20 metres',
        points: 10,
      },
      { id: '5', label: 'Cannot stand and then move more than 1 metre', points: 12 },
    ],
  },
];

const ALL_ACTIVITIES = [...DAILY_LIVING, ...MOBILITY];

const DEFAULT_DAILY_LIVING = Object.fromEntries(
  DAILY_LIVING.map((activity) => [activity.id, activity.descriptors[0].id])
);
const DEFAULT_MOBILITY = Object.fromEntries(
  MOBILITY.map((activity) => [activity.id, activity.descriptors[0].id])
);

const INITIAL_STATE = {
  condition: '',
  age: '',
  dailyLiving: DEFAULT_DAILY_LIVING,
  mobility: DEFAULT_MOBILITY,
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

function sumActivities(list, selections) {
  return list.reduce(
    (total, activity) => total + getActivityPoints(activity, selections[activity.id]),
    0
  );
}

function getAwardLevel(points) {
  if (points >= 12) return 'Enhanced rate';
  if (points >= 8) return 'Standard rate';
  return 'Below threshold';
}

function getWeeklyAmount(component, points) {
  if (points >= 12) return RATES[component].enhanced;
  if (points >= 8) return RATES[component].standard;
  return 0;
}

function formatMoney(amount) {
  return `£${amount.toFixed(2)}`;
}

function getConditionGuide(condition) {
  // Ensure we always return an absolute path starting with `/`.
  return CONDITION_GUIDES[condition] || { href: '/guides/pip/' };
}

function getTopActivities(dailyLiving, mobility) {
  const selections = { ...dailyLiving, ...mobility };
  return ALL_ACTIVITIES.map((activity, index) => ({
    number: index + 1,
    name: activity.name,
    points: getActivityPoints(activity, selections[activity.id]),
    insight: activity.insight,
  }))
    .sort((a, b) => b.points - a.points || a.number - b.number)
    .slice(0, 3);
}

function ActivityCard({ activity, number, selectedId, onChange }) {
  return (
    <fieldset className="pip-activity">
      <legend className="pip-activity-name">
        {number}. {activity.name}
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

function ScoreBox({ title, points, level }) {
  const levelClass =
    level === 'Enhanced rate'
      ? 'enhanced'
      : level === 'Standard rate'
        ? 'standard'
        : 'below';

  return (
    <div className={`pip-result-score ${levelClass}`}>
      <span className="pip-result-score-title">{title}</span>
      <strong className="pip-result-score-points">
        {points} {points === 1 ? 'point' : 'points'}
      </strong>
      <span className={`pip-result-score-level ${levelClass}`}>{level}</span>
    </div>
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

  const setMobility = (activityId, descriptorId) => {
    setD((prev) => ({
      ...prev,
      mobility: { ...prev.mobility, [activityId]: descriptorId },
    }));
  };

  const nav = (next) => {
    setStep(next);
    requestAnimationFrame(() => {
      const panel = document.querySelector('.right-panel');
      if (panel) {
        panel.scrollTo({ top: 0, behavior: 'smooth' });
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  const introValid =
    d.condition !== '' &&
    d.age !== '' &&
    Number(d.age) >= 16 &&
    Number(d.age) <= 120;

  const dailyLivingTotal = useMemo(() => sumActivities(DAILY_LIVING, d.dailyLiving), [d.dailyLiving]);
  const mobilityTotal = useMemo(() => sumActivities(MOBILITY, d.mobility), [d.mobility]);

  const dlLevel = getAwardLevel(dailyLivingTotal);
  const mobLevel = getAwardLevel(mobilityTotal);
  const dlWeekly = getWeeklyAmount('dailyLiving', dailyLivingTotal);
  const mobWeekly = getWeeklyAmount('mobility', mobilityTotal);
  const combinedWeekly = dlWeekly + mobWeekly;

  const topActivities = useMemo(
    () => getTopActivities(d.dailyLiving, d.mobility),
    [d.dailyLiving, d.mobility]
  );

  const conditionGuide = getConditionGuide(d.condition);
  const guideLinkText =
    d.condition && d.condition !== 'Other condition'
      ? `Read our guide to PIP for ${d.condition} →`
      : 'Read our PIP guides →';

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
                number={index + 1}
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
              Thresholds: 8+ Standard ({formatMoney(RATES.dailyLiving.standard)}/week) · 12+ Enhanced ({formatMoney(RATES.dailyLiving.enhanced)}/week)
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
            Choose the descriptor that best matches how you are on the <strong>majority of days</strong> for each mobility activity.
          </p>

          <div className="pip-activity-list">
            {MOBILITY.map((activity, index) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                number={11 + index}
                selectedId={d.mobility[activity.id]}
                onChange={(descriptorId) => setMobility(activity.id, descriptorId)}
              />
            ))}
          </div>

          <div className="pip-score-bar" aria-live="polite">
            <div>
              <span className="pip-score-label">Your Mobility score so far</span>
              <strong className="pip-score-value">
                {mobilityTotal} {mobilityTotal === 1 ? 'point' : 'points'}
              </strong>
            </div>
            <p className="pip-score-thresholds">
              Thresholds: 8+ Standard ({formatMoney(RATES.mobility.standard)}/week) · 12+ Enhanced ({formatMoney(RATES.mobility.enhanced)}/week)
            </p>
          </div>

          <div className="nav">
            <Btn ghost onClick={() => nav('daily-living')}>
              ← Back
            </Btn>
            <div className="nav-right">
              <Btn onClick={() => nav('results')}>See my results →</Btn>
            </div>
          </div>
        </div>
      )}

      {step === 'results' && (
        <div>
          <h2 className="step-title">Your Results</h2>
          <p className="step-hint">
            Based on the descriptors you selected
            {d.condition ? ` for ${d.condition}` : ''}
            {d.age ? ` (age ${d.age})` : ''}.
          </p>

          <div className="pip-result-scores">
            <ScoreBox title="Daily Living" points={dailyLivingTotal} level={dlLevel} />
            <ScoreBox title="Mobility" points={mobilityTotal} level={mobLevel} />
          </div>

          <div className="pip-result-weekly">
            <span className="pip-result-weekly-label">Estimated weekly amount</span>
            <strong className="pip-result-weekly-value">{formatMoney(combinedWeekly)}/week</strong>
            <ul className="pip-result-weekly-breakdown">
              <li>
                Daily Living:{' '}
                {dlWeekly > 0
                  ? `${formatMoney(dlWeekly)}/week (${dlLevel})`
                  : '£0 (below threshold)'}
              </li>
              <li>
                Mobility:{' '}
                {mobWeekly > 0
                  ? `${formatMoney(mobWeekly)}/week (${mobLevel})`
                  : '£0 (below threshold)'}
              </li>
            </ul>
          </div>

          <section className="pip-result-section">
            <h3 className="pip-result-heading">Personalised insights</h3>
            <ol className="pip-insight-list">
              {topActivities.map((activity) => (
                <li key={activity.name}>
                  <strong>
                    {activity.name} — {activity.points}{' '}
                    {activity.points === 1 ? 'point' : 'points'}
                  </strong>
                  <p>{activity.insight}</p>
                </li>
              ))}
            </ol>

            {dailyLivingTotal >= 5 && dailyLivingTotal <= 7 && (
              <div className="pip-warning" role="status">
                You&apos;re just below the Daily Living threshold. You may be underscoring on some
                activities — check the activities where you scored 2–4 points and consider whether
                you&apos;ve described your worst days accurately.
              </div>
            )}

            {mobilityTotal >= 5 && mobilityTotal <= 7 && (
              <div className="pip-warning" role="status">
                You&apos;re just below the Mobility threshold. You may be underscoring on some
                activities — check the activities where you scored 2–4 points and consider whether
                you&apos;ve described your worst days accurately.
              </div>
            )}
          </section>

          <section className="pip-result-section">
            <h3 className="pip-result-heading">Condition-specific guide</h3>
            <a className="pip-guide-link" href={conditionGuide.href}>
              {guideLinkText}
            </a>
          </section>

          <section className="pip-result-section">
            <h3 className="pip-result-heading">Next steps</h3>
            <div className="pip-next-cards">
              <a className="pip-next-card" href="/guides/pip2-form-guide/">
                <strong>Complete the PIP2 form</strong>
                <span>Use our activity-by-activity guide to describe how your condition affects you.</span>
              </a>
              <a className="pip-next-card" href="/pip-answer-helper/">
                <strong>Draft a stronger answer</strong>
                <span>
                  Turn your own description of an activity into a clearer first-person starting point —
                  then review and edit before you use it.
                </span>
              </a>
              <div className="pip-next-card static">
                <strong>If you&apos;re starting a claim</strong>
                <span>
                  Call the DWP PIP new claims line on <strong>0800 917 2222</strong> (Monday to Friday,
                  9am to 5pm) or claim online via GOV.UK where available.
                </span>
              </div>
              <a className="pip-next-card" href="/guides/how-to-appeal-benefit-decision/">
                <strong>If you&apos;ve been refused</strong>
                <span>Find out how to request a Mandatory Reconsideration and appeal a decision.</span>
              </a>
            </div>
          </section>

          <p className="pip-disclaimer">
            This checker provides an indication only based on the descriptors you selected. Your
            actual PIP award is determined by DWP following a full assessment. Scores may differ
            based on how a healthcare professional assesses your functional ability. Always describe
            how your condition affects you on the majority of days — not just on good days.
          </p>

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
