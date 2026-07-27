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
  6: {
    meaning:
      'This activity is about dressing and undressing — putting on and taking off clothes and shoes, managing fastenings, and choosing clothing that is appropriate for the weather and situation. It is not only about physical reach and dexterity; prompting because of mental health, cognitive problems, or sensory issues also counts. DWP is assessing whether you can dress and undress reliably on most days, including within a reasonable time and without unsafe struggle.',
    assessorsLookFor: [
      'Aids you use: dressing sticks, button hooks, sock aids, velcro adaptations, shoe horns',
      'Whether you need prompting or help to choose clothes that are clean, suitable, and weather-appropriate',
      'Whether help is needed for lower body (trousers, underwear, socks, shoes), upper body (tops, bras, coats), or both',
      'How long dressing takes, how many rests you need, and whether you give up mid-way',
      'Pain, stiffness, tremor, breathlessness, sensory overload, or motivational barriers on the majority of days',
    ],
    weakAnswer:
      'I get stiff in the mornings so dressing can take a while, but I usually manage somehow.',
    strongAnswer:
      'On most days I cannot dress and undress unaided. Pain and limited shoulder movement mean I need my partner’s physical help with tops, bras, and coats (upper body), and I use a sock aid and shoe horn for lower body but still need help with trousers and shoes when my hips seize. Choosing clothes is also a problem on low-mood days — without prompting I wear yesterday’s clothes or go out underdressed. Dressing takes 35–45 minutes with rests, then I need to recover. This pattern applies on about 5–6 days a week.',
    evidence: [
      'Occupational therapy reports recommending dressing aids or assistance',
      'GP, rheumatology, neurology, or physio letters about upper/lower limb limitation, pain, or fatigue',
      'Mental health evidence where prompting to dress or select clothing is needed',
      'Carer statements describing which garments they help with and how often',
      'A short diary of dressing time, aids used, and days you could not finish without help',
    ],
    mistakes: [
      'Saying “I can dress” because you manage in loose joggers on a good day — describe majority days and full outfits including fastenings and shoes',
      'Not separating lower-body and upper-body help — those are different descriptors',
      'Forgetting prompting for appropriate clothing when depression, psychosis, dementia, or cognitive impairment is relevant',
    ],
    descriptors: [
      { text: 'Can dress and undress unaided', points: 0 },
      {
        text: 'Needs to use an aid or appliance to be able to dress or undress',
        points: 2,
      },
      {
        text: 'Needs either prompting or assistance to be able to select appropriate clothing',
        points: 2,
      },
      {
        text: 'Needs assistance to be able to dress or undress their lower body',
        points: 2,
      },
      {
        text: 'Needs assistance to be able to dress or undress their upper body',
        points: 2,
      },
      { text: 'Cannot dress or undress at all', points: 8 },
    ],
  },
  7: {
    meaning:
      'This activity is about expressing and understanding spoken information — talking and being understood, and understanding what others say. It includes using aids such as hearing aids, and needing communication support (another person who helps you understand or be understood). “Basic” verbal information is simple, and “complex” is longer or more detailed. DWP is assessing reliable face-to-face verbal communication on most days, not whether you can send a text message.',
    assessorsLookFor: [
      'Whether you need hearing aids, a voice amplifier, or similar to speak or hear',
      'Whether you need another person for complex conversations (appointments, instructions, explanations)',
      'Whether you need support even for basic verbal information (simple questions and answers)',
      'Whether communication fails entirely even with support',
      'Fatigue, breathlessness, stammering, cognitive overload, or sensory issues that make conversation unreliable',
    ],
    weakAnswer:
      'I sometimes struggle to follow conversations when there is background noise and I prefer texts.',
    strongAnswer:
      'On most days I cannot manage spoken communication unaided. Even with hearing aids I miss key words and need my partner to repeat and rephrase what people say in appointments and shops. For anything beyond a simple yes/no exchange I need communication support — my partner explains complex information to me and helps me express my answers, otherwise I agree to things I have not understood. Without that support I leave appointments confused and distressed. This happens on the majority of days when I have to speak with people face to face.',
    evidence: [
      'Audiology reports, hearing-aid prescriptions, or ENT letters',
      'Speech and language therapy assessments',
      'Neurology, stroke, learning disability, or mental health reports affecting speech or comprehension',
      'Evidence of British Sign Language, lip-speaking, or interpreter needs where relevant',
      'Companion/carer statements describing how they support conversations',
    ],
    mistakes: [
      'Relying only on “I wear hearing aids” without explaining what you still cannot do reliably with them',
      'Confusing preference for written messages with inability to manage basic or complex spoken information',
      'Not explaining the difference between needing help for complex talk (4 points) versus basic talk (8 points)',
    ],
    descriptors: [
      {
        text: 'Can express and understand verbal information unaided',
        points: 0,
      },
      {
        text: 'Needs to use an aid or appliance to be able to speak or hear',
        points: 2,
      },
      {
        text: 'Needs communication support to be able to express or understand complex verbal information',
        points: 4,
      },
      {
        text: 'Needs communication support to be able to express or understand basic verbal information',
        points: 8,
      },
      {
        text: 'Cannot express or understand verbal information at all even with communication support',
        points: 12,
      },
    ],
  },
  8: {
    meaning:
      'This activity is about reading and understanding written information — signs, symbols, and words — including basic information (simple notices or labels) and complex information (letters, forms, longer text). Ordinary spectacles or contact lenses alone do not score as the relevant aid. DWP is assessing whether you can read and understand reliably, not whether someone else can read things out for convenience.',
    assessorsLookFor: [
      'Aids other than standard glasses: magnifiers, screen readers, large-print devices, coloured overlays',
      'Whether prompting is needed to understand complex written information (letters, forms, instructions)',
      'Whether prompting is needed even for basic written information (signs, simple labels)',
      'Vision problems, dyslexia, cognitive impairment, brain injury, or learning disability effects',
      'Whether you cannot read or understand written information at all on most days',
    ],
    weakAnswer:
      'I find official letters confusing and usually ask my daughter to look at them when she visits.',
    strongAnswer:
      'On most days I cannot understand complex written information without prompting. Even with reading glasses, DWP letters, hospital appointments, and forms make no sense to me because of cognitive problems after my stroke — I mix up dates and miss key instructions. My daughter has to sit with me, go through each paragraph, and check I have understood before I reply. Basic signs in shops are usually manageable with large print, but anything letter-length needs prompting on the majority of days. Without that help I miss appointments and deadlines.',
    evidence: [
      'Ophthalmology or low-vision clinic reports; evidence of magnifiers or assistive software',
      'Neuropsychology, stroke, learning disability, or education/psychology reports on reading comprehension',
      'Dyslexia assessments where relevant',
      'Examples of missed appointments or errors caused by not understanding letters (redacted)',
      'Statements from people who regularly read and explain written information to you',
    ],
    mistakes: [
      'Thinking ordinary glasses count toward the “aid or appliance” descriptor — they usually do not',
      'Describing dislike of paperwork rather than inability to read or understand on most days',
      'Not saying whether the difficulty is with complex text, basic text, or both',
    ],
    descriptors: [
      {
        text: 'Can read and understand basic and complex written information either unaided or using spectacles or contact lenses',
        points: 0,
      },
      {
        text: 'Needs to use an aid or appliance, other than spectacles or contact lenses, to be able to read or understand either basic or complex written information',
        points: 2,
      },
      {
        text: 'Needs prompting to be able to read or understand complex written information',
        points: 2,
      },
      {
        text: 'Needs prompting to be able to read or understand basic written information',
        points: 4,
      },
      {
        text: 'Cannot read or understand signs, symbols or words at all',
        points: 8,
      },
    ],
  },
  9: {
    meaning:
      'This activity is about engaging with other people face to face — establishing relationships, interacting appropriately, and coping with social contact. It includes needing prompting (encouragement to engage) or social support (an experienced person present to help you engage safely and appropriately). The highest descriptor applies where engagement causes overwhelming psychological distress or a substantial risk of harm. DWP is assessing real-world face-to-face contact on most days, not online chat.',
    assessorsLookFor: [
      'Whether you need prompting to answer the door, speak in appointments, or stay in a conversation',
      'Whether you need social support — someone who knows your needs present during interactions',
      'Panic, aggression risk, shutdown, or overwhelming distress caused by face-to-face engagement',
      'How often you avoid people entirely because you cannot engage reliably',
      'Evidence from mental health, autism, learning disability, or brain injury services',
    ],
    weakAnswer:
      'I’m shy and don’t like meeting new people. I prefer to stay at home.',
    strongAnswer:
      'On most days I cannot engage with people face to face without social support. If someone comes to the door or I must speak in a shop or waiting room, I freeze, shake, and often leave. My support worker or partner has to stay with me, speak for me at first, and help me manage distress so I do not break down or walk out. Without that person present I avoid almost all face-to-face contact and miss appointments. Prompting alone is not enough — I need someone experienced with me for engagement on the majority of days.',
    evidence: [
      'Psychiatry, psychology, CMHT, or autism/ADHD diagnostic and support reports',
      'Care plans describing social support needed for appointments and daily interactions',
      'Crisis or incident records linked to social contact where relevant and safe to share',
      'Support worker or carer statements about what happens without them present',
      'Evidence of missed appointments due to inability to engage face to face',
    ],
    mistakes: [
      'Treating ordinary shyness as enough — explain distress, risk, or need for another person',
      'Confusing prompting (encouragement) with social support (an experienced person helping you engage)',
      'Only describing strangers — include neighbours, shop staff, clinicians, and household visitors if relevant',
    ],
    descriptors: [
      { text: 'Can engage with other people unaided', points: 0 },
      {
        text: 'Needs prompting to be able to engage with other people',
        points: 2,
      },
      {
        text: 'Needs social support to be able to engage with other people',
        points: 4,
      },
      {
        text: 'Cannot engage with other people due to such engagement causing either overwhelming psychological distress to the claimant; or the claimant to exhibit behaviour which would result in a substantial risk of harm to the claimant or another person',
        points: 8,
      },
    ],
  },
  10: {
    meaning:
      'This activity is about making budgeting decisions — understanding and deciding how to spend and manage money. Simple budgeting means basic transactions (paying a single bill, calculating change). Complex budgeting means things like household budgeting, sorting out debts, or working out monthly bills. DWP is assessing decision-making ability, not whether you are poor or whether someone else prefers to handle the accounts for convenience.',
    assessorsLookFor: [
      'Whether you can manage complex decisions (monthly budget, comparing tariffs, dealing with priority debts) alone',
      'Whether you need prompting or assistance for complex decisions but can still do simple ones',
      'Whether even simple budgeting decisions need help',
      'Cognitive impairment, learning disability, mental health, addiction, or brain injury effects on money decisions',
      'Risks when unaided: unpaid rent, unopened bills, impulsive spending you cannot control, scams',
    ],
    weakAnswer:
      'I’m not great with paperwork so my partner usually pays the bills online.',
    strongAnswer:
      'On most days I cannot make complex budgeting decisions unaided. Since my brain injury I cannot work out a monthly budget, prioritise rent against other debts, or understand bill breakdowns without my partner sitting with me and prompting each step. I can sometimes buy a simple item with change if someone has already told me exactly what to do, but sorting post, due dates, and payment amounts needs assistance every week. When I have tried alone I have missed rent and direct debits. This is not preference — it is lack of ability on the majority of days.',
    evidence: [
      'Neuropsychology, learning disability, or mental health reports affecting financial decision-making',
      'Appointee, deputy, or DWP Alternative Payment Arrangement evidence where relevant',
      'Debt advice letters describing inability to manage budgeting without support',
      'Examples of consequences when unaided (arrears, disconnection) with sensitive details minimised',
      'Carer statements about prompting/assistance for bills and budgeting',
    ],
    mistakes: [
      'Describing a couple’s division of chores (“my partner does the bills”) without explaining why you cannot do it',
      'Mixing lack of money with inability to make budgeting decisions',
      'Not distinguishing simple decisions (4 points if help needed) from complex ones (2 points if help needed)',
    ],
    descriptors: [
      { text: 'Can manage complex budgeting decisions unaided', points: 0 },
      {
        text: 'Needs prompting or assistance to be able to make complex budgeting decisions',
        points: 2,
      },
      {
        text: 'Needs prompting or assistance to be able to make simple budgeting decisions',
        points: 4,
      },
      { text: 'Cannot make any budgeting decisions at all', points: 6 },
    ],
  },
  11: {
    meaning:
      'This mobility activity is about planning and following journeys — working out a route and actually undertaking travel to go somewhere. It includes psychological distress that prevents journeys, needing prompting to go out, being unable to plan a route, and needing another person, an assistance dog, or an orientation aid to follow unfamiliar or familiar routes. It is not about how far you can walk (that is Moving around). DWP is assessing orientation, navigation, and the psychological ability to travel on most days.',
    assessorsLookFor: [
      'Whether overwhelming psychological distress stops you going out, or means you need prompting to go at all',
      'Whether you can plan a route yourself (maps, apps, steps in order)',
      'Whether you can follow unfamiliar routes alone, or need another person, dog, or orientation aid',
      'Whether you also cannot follow familiar routes alone',
      'Evidence of getting lost, panic attacks on transport, or never leaving without support',
    ],
    weakAnswer:
      'I get anxious on buses sometimes and prefer someone with me when I can.',
    strongAnswer:
      'On most days I cannot follow the route of an unfamiliar journey without another person. Anxiety and cognitive problems mean I cannot plan a route reliably — I panic, lose track of stops, and have got off at the wrong place repeatedly. Even for familiar journeys to the GP I often need my partner with me; on worse days I cannot leave the house at all because the thought of the journey causes overwhelming distress and I freeze at the door. Prompting alone is not enough for unfamiliar routes. Without someone with me I do not complete those journeys safely.',
    evidence: [
      'Mental health records describing agoraphobia, panic, PTSD, or journey-related distress',
      'Neurology, vision, or cognitive assessments affecting navigation and route-following',
      'Orientation aid / assistance dog evidence where relevant',
      'Incident examples: getting lost, emergency calls, abandoned journeys',
      'Carer statements about needing to accompany you on familiar and unfamiliar journeys',
    ],
    mistakes: [
      'Writing about walking distance here — distance belongs in Moving around',
      'Only describing unfamiliar journeys when familiar journeys are also affected (that can be 12 points)',
      'Underplaying psychological distress that prevents any journey — that is a specific 10-point descriptor',
    ],
    descriptors: [
      { text: 'Can plan and follow the route of a journey unaided', points: 0 },
      {
        text: 'Needs prompting to be able to undertake any journey to avoid overwhelming psychological distress to the claimant',
        points: 4,
      },
      { text: 'Cannot plan the route of a journey', points: 8 },
      {
        text: 'Cannot follow the route of an unfamiliar journey without another person, assistance dog or orientation aid',
        points: 10,
      },
      {
        text: 'Cannot undertake any journey because it would cause overwhelming psychological distress to the claimant',
        points: 10,
      },
      {
        text: 'Cannot follow the route of a familiar journey without another person, assistance dog or orientation aid',
        points: 12,
      },
    ],
  },
  12: {
    meaning:
      'This mobility activity is about standing and then moving — how far you can walk (or move using an aid) after standing, repeatedly and safely, on most days. Distances are absolute thresholds: more than 200m, up to 200m, up to 50m, up to 20m, or only up to 1m. Using an aid can change which descriptor applies between 20 and 50 metres. Wheelchair users are assessed on the distance they can move. DWP is assessing reliable walking/moving distance, not a one-off push on assessment day.',
    assessorsLookFor: [
      'The furthest you can reliably stand and then move on most days without stopping, and what happens if you push further',
      'Whether you need aids (stick, crutches, frame, wheelchair) and how that affects the 20–50 metre descriptors',
      'Pain, breathlessness, balance, weakness, or need to stop and recover',
      'Whether you can repeat the distance as often as reasonably required in a day',
      'Falls, near-falls, and safety risks when moving',
    ],
    weakAnswer:
      'I can’t walk far these days and need to pace myself. Some days are better than others.',
    strongAnswer:
      'On most days, after standing, I cannot move more than about 40 metres even with a walking stick. Beyond that my hip and lower back pain spike, my leg weakens, and I must stop and hold on or I risk falling. Without the stick I manage even less. I cannot repeat short walks throughout the day without long recovery sits. On my worst days — around 3 days a week — I struggle to move more than 20 metres between rests indoors. I do not manage 50–200 metres reliably on the majority of days.',
    evidence: [
      'Physiotherapy or orthopaedic reports with walking distances and aids prescribed',
      'GP or consultant letters about mobility, falls, breathlessness, or claudication',
      'Evidence of walking aids, wheelchair prescription, or blue badge / mobility scheme where relevant',
      'OT or falls clinic assessments',
      'A diary of distances you can manage before needing to stop, on good and bad days',
    ],
    mistakes: [
      'Giving only “I can’t walk far” without approximate metres on majority days',
      'Describing your best day at the assessment centre as typical',
      'Forgetting aids — moving 20–50 metres with an aid is a different descriptor from doing it unaided',
    ],
    descriptors: [
      {
        text: 'Can stand and then move more than 200 metres, either aided or unaided',
        points: 0,
      },
      {
        text: 'Can stand and then move more than 50 metres but no more than 200 metres, either aided or unaided',
        points: 4,
      },
      {
        text: 'Can stand and then move unaided more than 20 metres but no more than 50 metres',
        points: 8,
      },
      {
        text: 'Can stand and then move using an aid or appliance more than 20 metres but no more than 50 metres',
        points: 10,
      },
      {
        text: 'Can stand and then move more than 1 metre but no more than 20 metres, either aided or unaided',
        points: 12,
      },
      {
        text: 'Cannot, either aided or unaided, — (i) stand; or (ii) move more than 1 metre',
        points: 12,
      },
    ],
  },
};

