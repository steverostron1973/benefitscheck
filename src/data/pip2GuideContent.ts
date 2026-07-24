export type Pip2Descriptor = {
  text: string;
  points: number;
};

export type Pip2ActivityContent = {
  meaning: string;
  assessorsLookFor: string[];
  weakAnswer: string;
  strongAnswer: string;
  evidence: string[];
  mistakes: string[];
  descriptors: Pip2Descriptor[];
};

/** Content for PIP2 walkthrough activities 1–5 (keyed by activity number). */
export const pip2ActivityContent: Record<number, Pip2ActivityContent> = {
  1: {
    meaning:
      'This activity is about preparing and cooking a simple meal for one person using fresh ingredients — peeling, chopping, using a hob or cooker, and serving. It is not about gourmet cooking or batch-cooking for a family. Ready meals alone do not prove you can prepare and cook a simple meal from scratch. DWP is assessing whether you can do this reliably on most days, not whether you ever manage a sandwich.',
    assessorsLookFor: [
      'Whether you can peel, chop, open packaging, and use a hob or cooker safely without burns, cuts, or falls',
      'Whether fatigue, pain, tremor, mental health, or cognitive problems mean you need prompting, supervision, or physical help',
      'Whether you can only use a microwave (not a conventional cooker) — that is a specific 2-point descriptor',
      'How long cooking takes you compared with someone without your condition, and whether you need long recovery afterwards (reliability)',
      'What happens on a typical bad day across the majority of days — not your best day',
    ],
    weakAnswer:
      'I sometimes struggle with cooking and get tired. My partner helps when I’m having a bad day.',
    strongAnswer:
      'On most days I cannot prepare and cook a simple meal from scratch without help. Pain and fatigue mean I cannot stand at the hob for more than a few minutes, and I have burned pans when my concentration drops. My partner has to chop ingredients, supervise the hob, or take over completely on about 5 days out of 7. On the other days I can only reheat food in a microwave. Cooking a simple meal takes me over 45 minutes with several sits-down, then I need to lie down for an hour. Without that help I would not eat a hot meal.',
    evidence: [
      'Occupational therapy reports recommending kitchen aids, perching stool, or meal support',
      'GP or specialist letters describing tremor, neuropathy, fatigue, depression, or cognitive problems affecting cooking',
      'Care plans or carer statements explaining who helps with meals and how often',
      'Photos of aids you use (perching stool, adapted knives, kettle tipper) — optional but helpful',
      'A short diary noting which days you cooked, used only a microwave, or needed someone else to take over',
    ],
    mistakes: [
      'Saying “I can cook” because you reheat ready meals — the test is a simple meal from fresh ingredients',
      'Describing only good days, or forgetting to explain safety risks (burns, leaving the hob on, falls)',
      'Omitting prompting or supervision needs for mental health or cognitive conditions — those can score points even if you have no physical kitchen aids',
    ],
    descriptors: [
      { text: 'Can prepare and cook a simple meal unaided', points: 0 },
      {
        text: 'Needs to use an aid or appliance to be able to either prepare or cook a simple meal',
        points: 2,
      },
      {
        text: 'Cannot cook a simple meal using a conventional cooker but is able to do so using a microwave',
        points: 2,
      },
      {
        text: 'Needs prompting to be able to either prepare or cook a simple meal',
        points: 2,
      },
      {
        text: 'Needs supervision or assistance to either prepare or cook a simple meal',
        points: 4,
      },
      { text: 'Cannot prepare and cook food', points: 8 },
    ],
  },
  2: {
    meaning:
      'This activity is about eating and drinking — getting nutrition into your body — not cooking. It covers cutting up food, using cutlery, conveying food and drink to your mouth, needing supervision or prompting to eat, and using a therapeutic source (for example a feeding tube). DWP is assessing whether you can take nutrition reliably, safely, and to an acceptable standard on most days.',
    assessorsLookFor: [
      'Whether you need adapted cutlery, a non-spill cup, or help cutting food',
      'Whether someone has to prompt you to eat or drink (common with depression, eating disorders, dementia, or cognitive impairment)',
      'Whether you use a therapeutic source such as a PEG or other feeding tube — and whether you need help to manage it',
      'Whether another person has to convey food and drink to your mouth entirely',
      'Choking risk, spills, very slow eating, or needing supervision for safety',
    ],
    weakAnswer:
      'I don’t always feel like eating and sometimes skip meals when my mood is low.',
    strongAnswer:
      'On most days I need prompting to eat. Without my partner sitting with me and reminding me through a meal, I often leave food untouched for hours because of depression and exhaustion. I can physically lift a fork, but I will not start or finish a meal unaided on about 5 days out of 7. When I do eat, it can take over 40 minutes for a small meal and I still leave most of it. I have lost weight and my GP has noted poor nutritional intake. Prompting is not occasional — it is part of almost every meal.',
    evidence: [
      'GP or dietitian notes on weight loss, malnutrition risk, or appetite problems',
      'Mental health records describing prompting needed for meals',
      'Speech and language therapy reports if swallowing or choking is an issue',
      'Evidence of adapted cutlery, plate guards, or feeding equipment',
      'Carer or family statements describing how they cut food, prompt, or feed you',
    ],
    mistakes: [
      'Mixing this up with Preparing food — “I can’t cook” does not score here unless you also cannot eat or drink reliably',
      'Underplaying prompting: “I forget to eat” without saying how often someone has to intervene',
      'Not mentioning therapeutic feeding or help managing a tube when that applies',
    ],
    descriptors: [
      { text: 'Can take nutrition unaided', points: 0 },
      {
        text: 'Needs to use an aid or appliance to take nutrition; or supervision to take nutrition; or assistance to cut up food',
        points: 2,
      },
      { text: 'Needs a therapeutic source to be able to take nutrition', points: 2 },
      { text: 'Needs prompting to be able to take nutrition', points: 4 },
      {
        text: 'Needs assistance to be able to manage a therapeutic source to take nutrition',
        points: 6,
      },
      {
        text: 'Cannot convey food and drink to their mouth and needs another person to do so',
        points: 10,
      },
    ],
  },
  3: {
    meaning:
      'This activity covers managing medication, monitoring a health condition (for example blood glucose or blood pressure), and managing therapy at home (such as physiotherapy exercises, dressings, dialysis support, or nebulisers). “Therapy” for higher points means treatment that takes measurable hours each week with supervision, prompting, or assistance — not simply remembering tablets. DWP is assessing what help you need and, for therapy, how many hours that help takes each week.',
    assessorsLookFor: [
      'Whether you need an aid (dosette box, pill dispenser, alarm) or another person to manage medication safely',
      'Whether you need help monitoring a condition (readings, interpreting results, acting on them)',
      'The weekly hours of supervision, prompting, or assistance needed for therapy — this drives the higher point scores',
      'Risks if help is not given: missed doses, wrong doses, untreated symptoms, infection from unmanaged dressings',
      'Whether your needs apply on the majority of weeks, not only during a short flare',
    ],
    weakAnswer:
      'I take several tablets a day and sometimes forget them. I also do some physio exercises when I remember.',
    strongAnswer:
      'I cannot manage my medication or home therapy unaided. My partner fills a dosette and prompts me twice daily because brain fog and depression mean I miss doses or take them twice. Separately, I need help with physiotherapy and wound care at home. My partner or a carer spends about 5–6 hours a week supervising and assisting those therapy tasks (exercises, dressings, and timing medication around them). Without that help my wounds deteriorate and my pain and mobility worsen. This pattern has been in place for over a year on most weeks.',
    evidence: [
      'Prescription lists, dosette use, pharmacy blister packs, or medication review letters',
      'Care plans showing time spent on medication prompts, monitoring, or home therapy',
      'Physio, district nurse, or dialysis team letters describing help needed at home',
      'GP or specialist notes on consequences of missed medication or unmanaged therapy',
      'A weekly timesheet-style diary of minutes/hours of help with therapy',
    ],
    mistakes: [
      'Listing lots of tablets but not explaining what help you need — volume of medication alone does not score high points',
      'Calling ordinary tablet prompting “therapy hours” — higher descriptors need evidenced therapy time each week',
      'Forgetting monitoring (glucose, oxygen sats, peak flow) when that is a major part of your daily management',
    ],
    descriptors: [
      {
        text: 'Either does not receive medication or therapy or can manage medication or therapy unaided',
        points: 0,
      },
      {
        text: 'Needs either to use an aid or appliance to manage medication; or supervision, prompting or assistance to manage medication or monitor a health condition',
        points: 1,
      },
      {
        text: 'Needs supervision, prompting or assistance to manage therapy that takes no more than 3.5 hours a week',
        points: 2,
      },
      {
        text: 'Needs supervision, prompting or assistance to manage therapy that takes more than 3.5 but no more than 7 hours a week',
        points: 4,
      },
      {
        text: 'Needs supervision, prompting or assistance to manage therapy that takes more than 7 but no more than 14 hours a week',
        points: 6,
      },
      {
        text: 'Needs supervision, prompting or assistance to manage therapy that takes more than 14 hours a week',
        points: 8,
      },
    ],
  },
  4: {
    meaning:
      'This activity is about washing your whole body — including hair — and getting in and out of an unadapted bath or shower. It includes using aids (shower seat, grab rails), needing prompting or supervision (for example because of mental health, confusion, or seizure risk), and needing physical help with different parts of the body. DWP is assessing whether you can wash and bathe reliably and safely on most days.',
    assessorsLookFor: [
      'Aids you already use: shower seat, grab rails, long-handled sponge, bath board',
      'Whether you need prompting to wash at all (depression, cognitive impairment, sensory overload)',
      'Which body areas you cannot wash without another person’s help — hair, below the waist, or between shoulders and waist score differently',
      'Whether you need help getting in or out of the bath or shower',
      'Safety: falls, seizures, dizziness, scalding, or leaving taps running',
    ],
    weakAnswer:
      'I find showers difficult and prefer a wash at the sink when I’m tired.',
    strongAnswer:
      'On most days I cannot wash and bathe unaided. I use a shower seat and grab rails, but I still need my partner to help me wash below the waist and to steady me getting out of the shower because of pain, balance problems, and fatigue. Without that help I skip washing for days or only wipe with a flannel at the sink, which is not a full wash. A shower takes me around 35–40 minutes including rests, and I need to lie down afterwards. This happens on roughly 5–6 days each week; on better days I still need the seat and rails.',
    evidence: [
      'OT assessment recommending bath/shower adaptations',
      'GP or physiotherapy letters about falls risk, balance, pain, or fatigue affecting washing',
      'Mental health evidence if prompting is needed to initiate washing',
      'Photos or council/housing adaptation letters for grab rails or shower seat',
      'Carer statements describing which parts of washing they help with and how often',
    ],
    mistakes: [
      'Saying you “manage with a strip wash” without explaining that you cannot wash your whole body in a bath or shower reliably',
      'Not specifying which body areas need help — that decides between 2, 3, 4, or 8 points',
      'Forgetting supervision/prompting needs where risk or motivation is the main barrier',
    ],
    descriptors: [
      { text: 'Can wash and bathe unaided', points: 0 },
      {
        text: 'Needs to use an aid or appliance to be able to wash or bathe',
        points: 2,
      },
      {
        text: 'Needs supervision or prompting to be able to wash or bathe',
        points: 2,
      },
      {
        text: 'Needs assistance to be able to wash either their hair or body below the waist',
        points: 2,
      },
      {
        text: 'Needs assistance to be able to get in or out of a bath or shower',
        points: 3,
      },
      {
        text: 'Needs assistance to be able to wash their body between the shoulders and waist',
        points: 4,
      },
      {
        text: 'Cannot wash and bathe at all and needs another person to wash their entire body',
        points: 8,
      },
    ],
  },
  5: {
    meaning:
      'This activity covers getting on and off the toilet, cleaning yourself afterwards, and managing incontinence of bladder or bowel (including using pads, catheters, or stoma care where relevant). DWP is assessing whether you need aids, prompting, or another person’s help to manage toilet needs or incontinence reliably and with dignity on most days.',
    assessorsLookFor: [
      'Aids such as raised toilet seats, frames, bottom wipers, pads, bottles, or catheters',
      'Whether you need prompting or supervision to get to the toilet in time or to clean yourself',
      'Whether another person must help you on/off the toilet or with cleaning',
      'Whether you need help managing incontinence — and whether it is bladder, bowel, or both (this changes points)',
      'Frequency, urgency, accidents, night-time needs, and infection or skin problems from poor management',
    ],
    weakAnswer:
      'I sometimes need the toilet urgently and wear pads just in case.',
    strongAnswer:
      'On most days I cannot manage toilet needs and incontinence unaided. I use a raised toilet seat and frames, but I still need my partner’s help to get on and off the toilet when my hips and knees lock with pain, and help cleaning afterwards. I also have urge incontinence and need assistance to change pads and clean skin several times a day — otherwise I develop soreness and infections. Night-time is worse: I need help at least twice most nights. Without that assistance I would have frequent accidents and could not manage hygiene to an acceptable standard.',
    evidence: [
      'Continence service or district nurse assessments',
      'GP or urology/gastroenterology letters about incontinence, catheters, or stomas',
      'Prescriptions for pads, catheter supplies, or barrier creams',
      'OT recommendations for toilet frames, raised seats, or wet rooms',
      'Carer diary of assistance with toilet transfers, cleaning, or pad changes',
    ],
    mistakes: [
      'Mentioning pads without saying whether you need help to manage them — pads alone are usually an aid (2 points) unless assistance is also needed',
      'Being too vague about bladder vs bowel incontinence when both apply — both can score 8 points',
      'Leaving out night-time help, which often shows why assistance is needed repeatedly',
    ],
    descriptors: [
      { text: 'Can manage toilet needs or incontinence unaided', points: 0 },
      {
        text: 'Needs to use an aid or appliance to be able to manage toilet needs or incontinence',
        points: 2,
      },
      {
        text: 'Needs supervision or prompting to be able to manage toilet needs',
        points: 2,
      },
      { text: 'Needs assistance to be able to manage toilet needs', points: 4 },
      {
        text: 'Needs assistance to be able to manage incontinence of either bladder or bowel',
        points: 6,
      },
      {
        text: 'Needs assistance to be able to manage incontinence of both bladder and bowel',
        points: 8,
      },
    ],
  },
};
