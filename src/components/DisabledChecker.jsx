import { useState, useEffect } from 'react';
const STEPS = ["about","condition","work","finances","existing","results"];
const LABELS = ["About","Condition","Work","Finances","Already claiming","Results"];

function calcBenefits(d) {
  const all = [];
  const age = parseInt(d.age)||0;
  const employed = d.employed === "yes";
  const selfEmployed = d.employed === "selfemployed";
  const weeklyPay = parseFloat(d.weeklyPay)||0;
  const savings = parseFloat(d.savings)||0;
  const hasNI = d.hasNI === "yes";
  const affectsDailyLiving = d.affectsDailyLiving === "yes";
  const affectsMobility = d.affectsMobility === "yes";
  const needsWorkSupport = d.needsWorkSupport === "yes";
  const workHours = parseInt(d.workHours)||0;
  const onUC = d.onUC === "yes";
  const limitedCapacity = d.limitedCapacity === "yes";
  const hasVehicle = d.hasVehicle === "yes";
  const already = d.alreadyClaiming||[];

  // 1. PIP
  const pipEligible = (affectsDailyLiving || affectsMobility) && age >= 16 && age < 66;
  let pipAmount = 0;
  if (affectsDailyLiving && affectsMobility) pipAmount = 194.60;
  else if (affectsDailyLiving) pipAmount = 114.60;
  else if (affectsMobility) pipAmount = 80.00;
  all.push({
    name: "Personal Independence Payment (PIP)",
    likely: pipEligible,
    amount: pipEligible ? `£${affectsDailyLiving ? "76.70–£114.60" : "30.30–£80.00"}/week — up to £194.60/week if both components` : null,
    summary: pipEligible
      ? `PIP helps with extra costs arising from a disability or long-term health condition. It's not means-tested — your income, savings, and whether you work don't affect it. The daily living component (£76.70–£114.60/week) and mobility component (£30.30–£80.00/week) can be awarded separately or together.`
      : age >= 66 ? "PIP is for people aged 16–65. Over 66, Attendance Allowance may apply instead."
      : "PIP applies if your condition affects your daily living and/or mobility.",
    tip: pipEligible ? "You can work any number of hours and still receive PIP. PIP assessments focus on how your condition affects you, not your diagnosis. Consider getting help from Citizens Advice when completing the form." : null,
    url: "https://www.gov.uk/pip",
    cta: "Check PIP eligibility on GOV.UK",
    annualValue: pipEligible ? Math.round(pipAmount * 52) : 0
  });

  // 2. Access to Work
  const atwEligible = (employed || selfEmployed) && (affectsDailyLiving || needsWorkSupport);
  all.push({
    name: "Access to Work",
    likely: atwEligible,
    amount: atwEligible ? "Up to £66,000/year grant for workplace adjustments and support" : null,
    summary: atwEligible
      ? "Access to Work is a government grant that can pay for specialist equipment, support workers, travel to work, mental health support, and other adjustments that help you stay in or start work. It's not means-tested and doesn't appear on your payslip."
      : "Access to Work is for employed or self-employed people whose disability or health condition affects their ability to work.",
    tip: atwEligible ? "Apply before starting a new job or as soon as you need support. Your employer doesn't need to be involved in the initial application. The grant can cover things your employer is already providing if they're struggling to fund it." : null,
    url: "https://www.gov.uk/access-to-work",
    cta: "Apply for Access to Work on GOV.UK",
    annualValue: 0
  });

  // 3. UC health element
  const ucHealthEligible = onUC && limitedCapacity;
  all.push({
    name: "Universal Credit — Health/Disability Element",
    likely: ucHealthEligible,
    amount: ucHealthEligible ? "£97/week extra if existing claimant, £50/week for new claimants from 2026/27" : null,
    summary: ucHealthEligible
      ? "If you have limited capability for work due to a health condition, you should receive the UC health element. For existing claimants this is £97/week. For new claimants from 2026/27 this has been reduced to £50/week — a significant change announced in the government's welfare reforms."
      : !onUC ? "The UC health element is for people already receiving Universal Credit with limited capability for work."
      : "A Work Capability Assessment is required to receive the UC health element.",
    tip: ucHealthEligible ? "Request a Work Capability Assessment (WCA) from DWP if you haven't already had one. You'll need fit notes from your GP. The assessment determines whether you're placed in the 'limited capability for work' or 'limited capability for work-related activity' group." : null,
    url: "https://www.gov.uk/universal-credit/what-youll-get",
    cta: "Check UC health element on GOV.UK",
    annualValue: ucHealthEligible ? Math.round(97 * 52) : 0
  });

  // 4. Statutory Sick Pay
  const sspEligible = employed && weeklyPay >= 129 && hasNI;
  all.push({
    name: "Statutory Sick Pay (SSP)",
    likely: sspEligible,
    amount: sspEligible ? "£123.25/week for up to 28 weeks" : null,
    summary: sspEligible
      ? "If you're employed and too ill to work, your employer must pay SSP of £123.25/week for up to 28 weeks. You need to have been off sick for at least 4 days in a row."
      : !employed ? "SSP is only available to employees. Self-employed people should check New Style ESA."
      : weeklyPay < 129 ? "SSP requires average weekly earnings of at least £129. Below this threshold you don't qualify."
      : "SSP eligibility depends on your employment status and earnings.",
    tip: sspEligible ? "Tell your employer on day 1 of illness — most require a fit note from your GP after 7 days. SSP is taxable. After 28 weeks you may be able to claim New Style ESA." : null,
    url: "https://www.gov.uk/statutory-sick-pay",
    cta: "Check SSP on GOV.UK",
    annualValue: 0
  });

  // 5. Council Tax Reduction / disability discount
  const ctrEligible = pipEligible || onUC || (savings < 16000 && weeklyPay < 500);
  all.push({
    name: "Council Tax Reduction & Disability Discounts",
    likely: ctrEligible,
    amount: ctrEligible ? "Up to 100% off council tax, plus possible disability discount" : null,
    summary: ctrEligible
      ? "People on PIP or low incomes may qualify for Council Tax Reduction. Additionally, if your home has been adapted for a disability (e.g. a wheelchair, extra bathroom), you may qualify for a Band Reduction, effectively dropping you into a lower council tax band."
      : "Council Tax discounts for disability are available regardless of income if your home has been adapted for a disability.",
    tip: "The disability band reduction is separate from Council Tax Reduction — you can get both. Contact your local council to apply for both schemes.",
    url: "https://www.gov.uk/council-tax-disabled-band-reduction",
    cta: "Check council tax disability discounts",
    annualValue: ctrEligible ? 900 : 0
  });

  // 6. Blue Badge
  const blueEligible = affectsMobility || (pipEligible && affectsMobility);
  all.push({
    name: "Blue Badge",
    likely: blueEligible,
    amount: blueEligible ? "Free or heavily discounted parking — worth hundreds per year" : null,
    summary: blueEligible
      ? "A Blue Badge allows you to park closer to your destination, including in disabled bays, on yellow lines, and free in many pay and display areas. You automatically qualify if you receive the enhanced mobility component of PIP."
      : "A Blue Badge is for people with significant mobility difficulties.",
    tip: "You automatically qualify for a Blue Badge if you receive the enhanced rate of the PIP mobility component. Apply through your local council — there's a £10 fee in England.",
    url: "https://www.gov.uk/apply-blue-badge",
    cta: "Apply for a Blue Badge",
    annualValue: blueEligible ? 500 : 0
  });

  // 7. Disabled Person's Railcard
  const railcardEligible = pipEligible;
  all.push({
    name: "Disabled Person's Railcard",
    likely: railcardEligible,
    amount: railcardEligible ? "1/3 off rail fares — worth £30/year (£70 for 3 years)" : null,
    summary: railcardEligible
      ? "PIP recipients automatically qualify for a Disabled Person's Railcard, giving 1/3 off most rail fares for you and one adult companion. The railcard costs £30/year or £70 for 3 years."
      : "The Disabled Person's Railcard is available to PIP recipients and others with qualifying disabilities.",
    tip: "Your companion also gets 1/3 off — the railcard effectively gives two people a third off rail travel.",
    url: "https://www.disabledpersons-railcard.co.uk/",
    cta: "Apply for Disabled Person's Railcard",
    annualValue: railcardEligible ? 300 : 0
  });

  // 8. NHS prescription exemptions
  const nhsEligible = pipEligible || onUC;
  all.push({
    name: "NHS Prescription & Health Cost Exemptions",
    likely: nhsEligible,
    amount: nhsEligible ? "Free prescriptions, dental treatment & sight tests" : null,
    summary: nhsEligible
      ? "PIP recipients and those on Universal Credit qualify for free NHS prescriptions. You may also qualify for free dental treatment and sight tests, plus vouchers towards glasses or contact lenses."
      : "NHS exemptions are available to those on qualifying benefits.",
    tip: "Apply for an HC1 form from your GP or Jobcentre to check eligibility for the NHS Low Income Scheme, which covers prescriptions, dental, sight tests, and more.",
    url: "https://www.nhs.uk/nhs-services/help-with-health-costs/",
    cta: "Check NHS health cost exemptions",
    annualValue: nhsEligible ? 400 : 0
  });

  return all.map(r => ({...r, alreadyClaiming: already.includes(r.name)}));
}

function Radio({options, value, onChange}) {
  return (
    <div className="radio-group">
      {options.map(o => (
        <label key={o.v} className={`radio-option${value===o.v?' selected':''}`} onClick={()=>onChange(o.v)}>
          <input type="radio" checked={value===o.v} onChange={()=>onChange(o.v)} onClick={e=>e.stopPropagation()} />
          <span>{o.l}</span>
        </label>
      ))}
    </div>
  );
}

function Btn({children, onClick, ghost}) {
  return ghost
    ? <button className="btn-ghost" onClick={onClick}>{children}</button>
    : <button className="btn-primary" onClick={onClick}>{children}</button>;
}

function App() {
  const [step, setStep] = useState("about");
  const [d, setD] = useState({
    age:"", employed:"", weeklyPay:"", workHours:"", hasNI:"",
    affectsDailyLiving:"", affectsMobility:"", needsWorkSupport:"", limitedCapacity:"",
    onUC:"", savings:"", hasVehicle:"", alreadyClaiming:[]
  });
  const [results, setResults] = useState(null);
  const set = (k,v) => setD(prev=>({...prev,[k]:v}));
  const nav = next => {
    if (next==="results") setResults(calcBenefits(d));
    setStep(next);
    document.querySelector('.right-panel')?.scrollTo({top:0,behavior:'smooth'});
  };
  const reset = () => {
    setStep("about");
    setD({age:"",employed:"",weeklyPay:"",workHours:"",hasNI:"",affectsDailyLiving:"",affectsMobility:"",needsWorkSupport:"",limitedCapacity:"",onUC:"",savings:"",hasVehicle:"",alreadyClaiming:[]});
    setResults(null);
  };
  const idx = STEPS.indexOf(step);
  const pct = Math.round((idx/(STEPS.length-1))*100);

  useEffect(() => {
    const footerNote = document.getElementById('footer-note');
    if (footerNote) footerNote.style.display = step === 'results' ? 'none' : 'block';
  }, [step]);

  return (
    <div>
      {step!=="results" && (
        <div className="progress-wrap">
          <div className="progress-labels">
            {LABELS.map((l,i) => <span key={l} className={`progress-label${i===idx?' active':i<idx?' done':''}`}>{l}</span>)}
          </div>
          <div className="progress-track"><div className="progress-fill" style={{width:`${pct}%`}} /></div>
        </div>
      )}

      {step==="about" && (
        <>
          <h2 className="step-title">About you</h2>
          <div className="field">
            <label className="field-label">Your age</label>
            <input className="text-input" type="number" placeholder="e.g. 42" value={d.age} onChange={e=>set("age",e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label">Are you currently working?</label>
            <Radio value={d.employed} onChange={v=>set("employed",v)} options={[
              {v:"yes",l:"Yes — employed"},
              {v:"selfemployed",l:"Yes — self-employed"},
              {v:"no",l:"No — not currently working"}
            ]} />
          </div>
          <div className="field">
            <label className="field-label">Are you currently on Universal Credit?</label>
            <Radio value={d.onUC} onChange={v=>set("onUC",v)} options={[
              {v:"no",l:"No"},
              {v:"yes",l:"Yes"}
            ]} />
          </div>
          <div className="nav"><div className="nav-right"><Btn onClick={()=>d.age&&d.employed&&d.onUC&&nav("condition")}>Continue →</Btn></div></div>
        </>
      )}

      {step==="condition" && (
        <>
          <h2 className="step-title">Your condition</h2>
          <p className="step-hint">These questions determine your eligibility for PIP and other support. You don't need a formal diagnosis.</p>
          <div className="field">
            <label className="field-label">Does your condition affect your daily living?</label>
            <p className="field-sublabel">e.g. preparing food, washing, dressing, managing medication, engaging with others</p>
            <Radio value={d.affectsDailyLiving} onChange={v=>set("affectsDailyLiving",v)} options={[
              {v:"no",l:"No"},
              {v:"yes",l:"Yes — it affects my daily living activities"}
            ]} />
          </div>
          <div className="field">
            <label className="field-label">Does your condition affect your mobility?</label>
            <p className="field-sublabel">e.g. moving around, planning and following journeys, getting in/out of a vehicle</p>
            <Radio value={d.affectsMobility} onChange={v=>set("affectsMobility",v)} options={[
              {v:"no",l:"No"},
              {v:"yes",l:"Yes — it affects my mobility"}
            ]} />
          </div>
          <div className="field">
            <label className="field-label">Does your condition limit your ability to work?</label>
            <Radio value={d.limitedCapacity} onChange={v=>set("limitedCapacity",v)} options={[
              {v:"no",l:"No — I can work without significant limitation"},
              {v:"yes",l:"Yes — my condition significantly limits what work I can do"}
            ]} />
          </div>
          <div className="field">
            <label className="field-label">Do you need extra support or equipment to do your job?</label>
            <p className="field-sublabel">e.g. specialist software, a support worker, adapted equipment, help with travel</p>
            <Radio value={d.needsWorkSupport} onChange={v=>set("needsWorkSupport",v)} options={[
              {v:"no",l:"No"},
              {v:"yes",l:"Yes — I need workplace adjustments or support"}
            ]} />
          </div>
          <div className="nav">
            <Btn ghost onClick={()=>nav("about")}>← Back</Btn>
            <Btn onClick={()=>d.affectsDailyLiving&&d.affectsMobility&&d.limitedCapacity&&d.needsWorkSupport&&nav("work")}>Continue →</Btn>
          </div>
        </>
      )}

      {step==="work" && (
        <>
          <h2 className="step-title">Work & NI</h2>
          {(d.employed==="yes" || d.employed==="selfemployed") && (
            <div className="field">
              <label className="field-label">Your weekly earnings (£)</label>
              <p className="field-sublabel">Gross pay before tax. Used to assess SSP eligibility (£129/week minimum).</p>
              <input className="text-input" type="number" placeholder="e.g. 500" value={d.weeklyPay} onChange={e=>set("weeklyPay",e.target.value)} />
            </div>
          )}
          <div className="field">
            <label className="field-label">Have you paid National Insurance contributions in the last 2-3 years?</label>
            <Radio value={d.hasNI} onChange={v=>set("hasNI",v)} options={[
              {v:"yes",l:"Yes — I've been employed and paid NI"},
              {v:"no",l:"No or unsure"}
            ]} />
          </div>
          <div className="nav">
            <Btn ghost onClick={()=>nav("condition")}>← Back</Btn>
            <Btn onClick={()=>d.hasNI&&nav("finances")}>Continue →</Btn>
          </div>
        </>
      )}

      {step==="finances" && (
        <>
          <h2 className="step-title">Finances</h2>
          <div className="field">
            <label className="field-label">Total savings (£)</label>
            <p className="field-sublabel">All savings and investments. Affects Universal Credit eligibility.</p>
            <input className="text-input" type="number" placeholder="e.g. 3000" value={d.savings} onChange={e=>set("savings",e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label">Do you have a vehicle?</label>
            <p className="field-sublabel">This affects Blue Badge and Motability eligibility</p>
            <Radio value={d.hasVehicle} onChange={v=>set("hasVehicle",v)} options={[
              {v:"no",l:"No"},
              {v:"yes",l:"Yes"}
            ]} />
          </div>
          <div className="nav">
            <Btn ghost onClick={()=>nav("work")}>← Back</Btn>
            <Btn onClick={()=>d.savings!==''&&d.hasVehicle&&nav("existing")}>Continue →</Btn>
          </div>
        </>
      )}

      {step==="existing" && (
        <>
          <h2 className="step-title">Already claiming</h2>
          <p className="step-hint">Tick anything you're already receiving — we'll skip these in your results.</p>
          <div className="field">
            <div className="checkbox-group">
              {["Personal Independence Payment (PIP)","Access to Work","Universal Credit — Health/Disability Element","Statutory Sick Pay (SSP)","Council Tax Reduction & Disability Discounts","Blue Badge","Disabled Person's Railcard","NHS Prescription & Health Cost Exemptions"].map(b => (
                <label key={b} className="checkbox-option">
                  <input type="checkbox" checked={d.alreadyClaiming.includes(b)} onChange={e=>{
                    const next = e.target.checked ? [...d.alreadyClaiming,b] : d.alreadyClaiming.filter(x=>x!==b);
                    set("alreadyClaiming",next);
                  }} />
                  {b}
                </label>
              ))}
            </div>
          </div>
          <div className="nav">
            <Btn ghost onClick={()=>nav("finances")}>← Back</Btn>
            <Btn onClick={()=>nav("results")}>See my results →</Btn>
          </div>
        </>
      )}

      {step==="results" && results && (() => {
        const newB = results.filter(r=>!r.alreadyClaiming);
        const skipped = results.filter(r=>r.alreadyClaiming);
        const likelyNew = newB.filter(r=>r.likely);
        const unlikelyNew = newB.filter(r=>!r.likely);
        const totalValue = likelyNew.reduce((sum,r)=>sum+(r.annualValue||0),0);
        return (<>
          <div className={`result-banner${likelyNew.length===0?' none':''}`}>
            {totalValue>0 ? (<>
              <div className="result-missing-label">You could be missing out on</div>
              <div className="result-total">£{totalValue.toLocaleString()}</div>
              <div className="result-total-sub">per year in unclaimed support</div>
              <hr className="result-divider" />
              <div className="result-count-row">
                <div className="result-count">{likelyNew.length}</div>
                <div className="result-label">benefit{likelyNew.length!==1?"s":""} likely unclaimed</div>
              </div>
              <div className="result-sublabel">Based on 2026/27 rates — verify each one below</div>
            </>) : (<>
              <div className={`result-count${likelyNew.length===0?' none':''}`}>{likelyNew.length}</div>
              <div className="result-label">benefit{likelyNew.length!==1?"s":""} unclaimed</div>
            </>)}
          </div>
          <div className="results-list">
            {likelyNew.map(r => (
              <div key={r.name} className="result-card likely">
                <div className="result-card-head">
                  <div><div className="result-name">{r.name}</div>{r.amount && <div className="result-amount">{r.amount}</div>}</div>
                  <span className="chip yes">✓ Likely eligible</span>
                </div>
                <p className="result-summary">{r.summary}</p>
                {r.tip && <p className="result-tip">💡 {r.tip}</p>}
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="result-link">{r.cta} →</a>
              </div>
            ))}
          </div>
          {unlikelyNew.length>0 && (<>
            <div className="unlikely-heading">Also checked — unlikely to apply</div>
            <div className="results-list">
              {unlikelyNew.map(r => (
                <div key={r.name} className="result-card">
                  <div className="result-card-head">
                    <div><div className="result-name">{r.name}</div></div>
                    <span className="chip no">✗ Unlikely</span>
                  </div>
                  <p className="result-summary">{r.summary}</p>
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="result-link muted">{r.cta} →</a>
                </div>
              ))}
            </div>
          </>)}
          {skipped.length>0 && (
            <div className="already-box">
              <div className="already-title">Already claiming</div>
              <div className="already-list">{skipped.map(r=>r.name).join(" · ")}</div>
            </div>
          )}
          <div className="disclaimer">
            <strong>Disclaimer:</strong> Estimates only, based on 2026/27 rates. PIP eligibility depends on a formal assessment — results here are indicative only. Always verify on GOV.UK or with Citizens Advice.
          </div>
          <div className="nav" style={{marginTop:"1.5rem"}}>
            <Btn ghost onClick={()=>nav("existing")}>← Amend answers</Btn>
            <Btn ghost onClick={reset}>↺ Start again</Btn>
          </div>
        </>);
      })()}
    </div>
  );
}

export default App;
