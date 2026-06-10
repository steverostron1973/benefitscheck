import { useState, useEffect } from 'react';

const STEPS = ["about","caring","income","existing","results"];
const LABELS = ["About","Caring","Income","Already claiming","Results"];

function calcBenefits(d) {
  const all = [];
  const self = d.checkingFor === "myself";
  const age = parseInt(d.age)||0;
  const hoursPerWeek = parseInt(d.hoursPerWeek)||0;
  const weeklyEarnings = parseFloat(d.weeklyEarnings)||0;
  const receives = d.alreadyClaiming||[];
  const onUC = d.onUC === "yes";
  const onPensionCredit = d.onPensionCredit === "yes" || receives.includes("Pension Credit");
  const onStatePension = d.onStatePension === "yes";
  const statePensionAmount = parseFloat(d.statePensionAmount)||0;
  const inScotland = d.country === "scotland";
  const careReceivesBenefit = d.careReceivesBenefit === "yes";
  const inFullTimeEducation = d.fullTimeEducation === "yes";

  // Eligibility basics
  const ageOk = age >= 16;
  const hoursOk = hoursPerWeek >= 35;
  const earningsOk = weeklyEarnings <= 204;
  const educationOk = !inFullTimeEducation;
  const careQualifies = careReceivesBenefit;

  // 1. Carer's Allowance
  const caBasicEligible = ageOk && hoursOk && earningsOk && educationOk && careQualifies;
  // Overlapping benefit rule — State Pension ≥ £86.45/week blocks payment
  const statesPensionBlocks = onStatePension && statePensionAmount >= 86.45;
  const caPayable = caBasicEligible && !statesPensionBlocks;
  const caUnderlyingEntitlement = caBasicEligible && statesPensionBlocks;

  all.push({
    name: "Carer's Allowance",
    likely: caBasicEligible,
    amount: caPayable ? "£86.45/week (£4,495/year)" : caUnderlyingEntitlement ? "Underlying entitlement only (not payable — State Pension overlap)" : null,
    summary: caPayable
      ? `${self?"You":"They"} appear to meet all the criteria for Carer's Allowance — caring for 35+ hours/week for someone on a qualifying benefit, with earnings under £204/week. Worth £86.45/week (£4,495/year).`
      : caUnderlyingEntitlement
      ? `${self?"Your":"Their"} State Pension (£${statePensionAmount}/week) means Carer's Allowance cannot be paid on top — but ${self?"you":"they"} should still apply to establish underlying entitlement. This unlocks thousands in extra Pension Credit.`
      : !hoursOk ? `Carer's Allowance requires at least 35 hours of care per week. ${self?"You're":"They're"} currently providing ${hoursPerWeek} hours.`
      : !earningsOk ? `The earnings limit is £204/week net. With earnings of £${weeklyEarnings}/week, ${self?"you":"they"} exceed this threshold. Note: some expenses can be deducted.`
      : !careQualifies ? "The person being cared for needs to be receiving a qualifying disability benefit (PIP, DLA, Attendance Allowance, etc.)."
      : !educationOk ? "Carer's Allowance is not available to those in full-time education (21+ hours/week)."
      : "Carer's Allowance criteria not met based on the information provided.",
    tip: caPayable ? "Carer's Allowance is taxable if your total income exceeds £12,570/year. It also earns you National Insurance credits towards your State Pension." 
      : caUnderlyingEntitlement ? "Even though Carer's Allowance can't be paid, applying is essential — it unlocks the Pension Credit carer addition worth £48.15/week (£2,503/year)." : null,
    url: "https://www.gov.uk/carers-allowance",
    cta: "Check Carer's Allowance on GOV.UK",
    annualValue: caPayable ? 4495 : 0
  });

  // 2. Carer's Credit
  const creditEligible = hoursOk && careQualifies && !caPayable;
  all.push({
    name: "Carer's Credit",
    likely: creditEligible,
    amount: creditEligible ? "National Insurance credits (protects your State Pension)" : null,
    summary: creditEligible
      ? `${self?"You":"They"} may qualify for Carer's Credit — free National Insurance credits for carers who can't receive Carer's Allowance. These protect ${self?"your":"their"} State Pension entitlement.`
      : caPayable ? "Carer's Allowance already includes NI credits — Carer's Credit is not needed on top."
      : "Carer's Credit is for people who care for 20+ hours/week but don't qualify for Carer's Allowance.",
    tip: creditEligible ? "Carer's Credit is not automatic — you must apply separately even if you already get other benefits." : null,
    url: "https://www.gov.uk/carers-credit",
    cta: "Apply for Carer's Credit",
    annualValue: 0
  });

  // 3. UC Carer Element
  const ucCarerEligible = onUC && caBasicEligible;
  all.push({
    name: "Universal Credit — Carer Element",
    likely: ucCarerEligible,
    amount: ucCarerEligible ? "£209.34/month extra on top of UC" : null,
    summary: ucCarerEligible
      ? `As a carer on Universal Credit, ${self?"you":"they"} should receive the carer element of £209.34/month on top of the standard UC allowance. Carer's Allowance counts as income but the carer element broadly offsets it.`
      : !onUC ? "This applies to carers who also receive Universal Credit."
      : "The UC carer element requires meeting the same basic caring criteria as Carer's Allowance.",
    tip: ucCarerEligible ? "Make sure the UC claim includes the carer element — it's not always added automatically. Report your caring role to DWP." : null,
    url: "https://www.gov.uk/universal-credit/what-youll-get",
    cta: "Check UC carer element on GOV.UK",
    annualValue: ucCarerEligible ? Math.round(209.34*12) : 0
  });

  // 4. Pension Credit Carer Addition
  const pcCarerEligible = (onPensionCredit || age >= 66) && caBasicEligible;
  all.push({
    name: "Pension Credit — Carer Addition",
    likely: pcCarerEligible,
    amount: pcCarerEligible ? "£48.15/week extra (£2,503/year)" : null,
    summary: pcCarerEligible
      ? `If ${self?"you":"they"} receive Pension Credit or are of Pension Credit age, the carer addition of £48.15/week (£2,503/year) should be included. This applies even if Carer's Allowance can't be paid due to the State Pension overlap.`
      : age < 66 ? "The Pension Credit carer addition is for those of Pension Credit age (66+)."
      : "This addition requires underlying entitlement to Carer's Allowance and receiving Pension Credit.",
    tip: pcCarerEligible ? "This is one of the most commonly missed entitlements — many pensioners caring for a spouse or relative have no idea they qualify for this extra £2,503/year." : null,
    url: "https://www.gov.uk/pension-credit",
    cta: "Check Pension Credit carer addition",
    annualValue: pcCarerEligible ? 2503 : 0
  });

  // 5. Council Tax Reduction
  const ctrEligible = caPayable || onUC || onPensionCredit;
  all.push({
    name: "Council Tax Reduction",
    likely: ctrEligible,
    amount: ctrEligible ? "25–100% off your council tax bill" : null,
    summary: ctrEligible
      ? `Carers on Carer's Allowance, Universal Credit, or Pension Credit often qualify for significant Council Tax Reduction. The amount varies by local council but can be up to 100%.`
      : "Council Tax Reduction is means-tested and varies by council. Worth checking directly with your local council.",
    tip: "Apply directly to your local council — never automatic. Also, if you live alone with the person you care for, a single person discount (25% off) may apply.",
    url: "https://www.gov.uk/council-tax-reduction",
    cta: "Check Council Tax Reduction",
    annualValue: ctrEligible ? 800 : 0
  });

  // 6. Carer's Allowance Supplement (Scotland only)
  if (inScotland) {
    const casEligible = caBasicEligible;
    all.push({
      name: "Carer's Support Payment / Carer's Allowance Supplement",
      likely: casEligible,
      amount: casEligible ? "£293.50 twice a year (£587/year extra)" : null,
      summary: casEligible
        ? "In Scotland, Carer's Allowance is being replaced by Carer Support Payment. Scottish carers also receive the Carer's Allowance Supplement of £293.50 twice a year — an additional £587/year on top of the standard rate."
        : "Carer's Allowance Supplement is only available in Scotland to those receiving Carer's Allowance.",
      tip: "Carer Support Payment is being rolled out across Scotland. Contact Social Security Scotland to check which payment applies to you.",
      url: "https://www.socialsecurity.gov.scot/claim-online/carer-support-payment",
      cta: "Check Carer Support Payment",
      annualValue: casEligible ? 587 : 0
    });
  }

  // 7. NHS prescription exemptions
  const nhsEligible = caPayable || onUC || onPensionCredit;
  all.push({
    name: "NHS Prescription & Dental Exemptions",
    likely: nhsEligible,
    amount: nhsEligible ? "Free prescriptions and dental treatment" : null,
    summary: nhsEligible
      ? `Carers on Carer's Allowance, Universal Credit, or Pension Credit qualify for free NHS prescriptions and may qualify for free dental treatment and sight tests.`
      : "NHS exemptions are available to those on qualifying benefits.",
    tip: "Apply for an HC1 form to claim free or reduced cost health services. This is separate from prescription exemptions.",
    url: "https://www.nhs.uk/nhs-services/help-with-health-costs/",
    cta: "Check NHS health cost exemptions",
    annualValue: nhsEligible ? 350 : 0
  });

  // 8. Employment support / breaks from caring
  all.push({
    name: "Carer's Assessment & Local Support",
    likely: hoursOk,
    amount: hoursOk ? "Free carer's assessment + possible respite support" : null,
    summary: hoursOk
      ? `As someone providing substantial care, ${self?"you":"they"} have a legal right to a free Carer's Assessment from the local council. This can unlock respite care, emergency support, and local carer services.`
      : "A Carer's Assessment is available to anyone providing regular care.",
    tip: "A Carer's Assessment is free and doesn't affect benefits. Contact your local council's adult social care team to request one.",
    url: "https://www.carersuk.org/help-and-advice/practical-support/getting-a-carers-assessment/",
    cta: "Find out about Carer's Assessment",
    annualValue: 0
  });

  return all.map(r => ({...r, alreadyClaiming: receives.includes(r.name)}));
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
    checkingFor:"", age:"", country:"england",
    hoursPerWeek:"", careReceivesBenefit:"", fullTimeEducation:"no",
    weeklyEarnings:"", onUC:"", onPensionCredit:"", onStatePension:"", statePensionAmount:"",
    alreadyClaiming:[]
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
    setD({checkingFor:"",age:"",country:"england",hoursPerWeek:"",careReceivesBenefit:"",fullTimeEducation:"no",weeklyEarnings:"",onUC:"",onPensionCredit:"",onStatePension:"",statePensionAmount:"",alreadyClaiming:[]});
    setResults(null);
  };

  const idx = STEPS.indexOf(step);
  const pct = Math.round((idx/(STEPS.length-1))*100);
  const self = d.checkingFor === "myself";
  const they = self ? "you" : "they";
  const their = self ? "your" : "their";
  const Their = self ? "Your" : "Their";

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
          <h2 className="step-title">About the carer</h2>
          <div className="field">
            <label className="field-label">Who are you checking for?</label>
            <Radio value={d.checkingFor} onChange={v=>set("checkingFor",v)} options={[
              {v:"myself",l:"Myself — I am the carer"},
              {v:"relative",l:"Someone else — a family member or friend who is a carer"}
            ]} />
          </div>
          <div className="field">
            <label className="field-label">{Their} age</label>
            <input className="text-input" type="number" placeholder="e.g. 45" value={d.age} onChange={e=>set("age",e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label">{self?"Do you":"Do they"} live in Scotland?</label>
            <p className="field-sublabel">Scottish carers may be eligible for additional support through Carer Support Payment</p>
            <Radio value={d.country} onChange={v=>set("country",v)} options={[
              {v:"england",l:"No — England, Wales, or Northern Ireland"},
              {v:"scotland",l:"Yes — Scotland"}
            ]} />
          </div>
          <div className="nav"><div className="nav-right"><Btn onClick={()=>d.checkingFor&&d.age&&nav("caring")}>Continue →</Btn></div></div>
        </>
      )}

      {step==="caring" && (
        <>
          <h2 className="step-title">The caring role</h2>
          <div className="field">
            <label className="field-label">How many hours per week {self?"do you":"do they"} spend caring?</label>
            <p className="field-sublabel">Include all time spent helping with personal care, medication, appointments, and supervision</p>
            <input className="text-input" type="number" placeholder="e.g. 40" value={d.hoursPerWeek} onChange={e=>set("hoursPerWeek",e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label">Does the person being cared for receive a disability benefit?</label>
            <p className="field-sublabel">e.g. PIP (daily living), DLA (middle/highest care), Attendance Allowance, or similar</p>
            <Radio value={d.careReceivesBenefit} onChange={v=>set("careReceivesBenefit",v)} options={[
              {v:"yes",l:"Yes — they receive PIP, DLA, Attendance Allowance or similar"},
              {v:"no",l:"No — they don't currently receive a disability benefit"},
              {v:"unknown",l:"Not sure"}
            ]} />
          </div>
          <div className="field">
            <label className="field-label">{self?"Are you":"Are they"} in full-time education?</label>
            <p className="field-sublabel">Full-time education means 21 or more hours of study per week</p>
            <Radio value={d.fullTimeEducation} onChange={v=>set("fullTimeEducation",v)} options={[
              {v:"no",l:"No"},
              {v:"yes",l:"Yes — in full-time education (21+ hours/week)"}
            ]} />
          </div>
          <div className="nav">
            <Btn ghost onClick={()=>nav("about")}>← Back</Btn>
            <Btn onClick={()=>d.hoursPerWeek&&d.careReceivesBenefit&&nav("income")}>Continue →</Btn>
          </div>
        </>
      )}

      {step==="income" && (
        <>
          <h2 className="step-title">{Their} income & benefits</h2>
          <div className="field">
            <label className="field-label">{Their} weekly earnings (£)</label>
            <p className="field-sublabel">Net earnings after tax and NI. Enter 0 if not working. Allowable expenses (childcare, equipment) can be deducted from this figure.</p>
            <input className="text-input" type="number" placeholder="e.g. 150" value={d.weeklyEarnings} onChange={e=>set("weeklyEarnings",e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label">{self?"Do you":"Do they"} currently receive Universal Credit?</label>
            <Radio value={d.onUC} onChange={v=>set("onUC",v)} options={[
              {v:"no",l:"No"},
              {v:"yes",l:"Yes"}
            ]} />
          </div>
          {parseInt(d.age) >= 66 && (<>
            <div className="field">
              <label className="field-label">{self?"Do you":"Do they"} receive a State Pension?</label>
              <Radio value={d.onStatePension} onChange={v=>set("onStatePension",v)} options={[
                {v:"no",l:"No"},
                {v:"yes",l:"Yes"}
              ]} />
            </div>
            {d.onStatePension==="yes" && (
              <div className="field">
                <label className="field-label">Weekly State Pension amount (£)</label>
                <p className="field-sublabel">This affects whether Carer's Allowance can be paid — the full new State Pension is £230.25/week</p>
                <input className="text-input" type="number" placeholder="e.g. 230" value={d.statePensionAmount} onChange={e=>set("statePensionAmount",e.target.value)} />
              </div>
            )}
            {d.onStatePension==="yes" && (
              <div className="field">
                <label className="field-label">{self?"Do you":"Do they"} receive Pension Credit?</label>
                <Radio value={d.onPensionCredit} onChange={v=>set("onPensionCredit",v)} options={[
                  {v:"no",l:"No"},
                  {v:"yes",l:"Yes"},
                  {v:"unknown",l:"Not sure"}
                ]} />
              </div>
            )}
          </>)}
          <div className="nav">
            <Btn ghost onClick={()=>nav("caring")}>← Back</Btn>
            <Btn onClick={()=>{
              const age = parseInt(d.age)||0;
              const basicOk = d.weeklyEarnings!=='' && d.onUC;
              const pensionOk = age < 66 || (d.onStatePension && (d.onStatePension==="no" || d.onPensionCredit));
              if(basicOk && pensionOk) nav("existing");
            }}>Continue →</Btn>
          </div>
        </>
      )}

      {step==="existing" && (
        <>
          <h2 className="step-title">Already claiming</h2>
          <p className="step-hint">{self?"Tick anything you're":"Tick anything they're"} already receiving — we'll skip these in your results.</p>
          <div className="field">
            <div className="checkbox-group">
              {["Carer's Allowance","Carer's Credit","Universal Credit — Carer Element","Pension Credit — Carer Addition","Council Tax Reduction","Carer's Support Payment / Carer's Allowance Supplement","NHS Prescription & Dental Exemptions","Carer's Assessment & Local Support"].map(b => (
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
            <Btn ghost onClick={()=>nav("income")}>← Back</Btn>
            <Btn onClick={()=>nav("results")}>See my results →</Btn>
          </div>
        </>
      )}

      {step==="results" && results && (
        <>
          {(() => {
            const newBenefits = results.filter(r=>!r.alreadyClaiming);
            const skipped = results.filter(r=>r.alreadyClaiming);
            const likelyNew = newBenefits.filter(r=>r.likely);
            const unlikelyNew = newBenefits.filter(r=>!r.likely);
            const totalValue = likelyNew.reduce((sum,r)=>sum+(r.annualValue||0),0);
            return (<>
              <div className={`result-banner${likelyNew.length===0?' none':''}`}>
                {totalValue>0 ? (<>
                  <div className="result-missing-label">{d.checkingFor==="myself"?"You could be missing out on":"They could be missing out on"}</div>
                  <div className="result-total">£{totalValue.toLocaleString()}</div>
                  <div className="result-total-sub">per year in unclaimed support</div>
                  <hr className="result-divider" />
                  <div className="result-count-row">
                    <div className="result-count">{likelyNew.length}</div>
                    <div className="result-label">benefit{likelyNew.length!==1?"s":""} likely unclaimed</div>
                  </div>
                  <div className="result-sublabel">Estimates based on 2026/27 rates — verify each one below</div>
                </>) : (<>
                  <div className={`result-count${likelyNew.length===0?' none':''}`}>{likelyNew.length}</div>
                  <div className="result-label">benefit{likelyNew.length!==1?"s":""} likely unclaimed</div>
                  <div className="result-sublabel">Estimates based on 2026/27 rates — verify each one below</div>
                </>)}
              </div>

              <div className="results-list">
                {likelyNew.map(r => (
                  <div key={r.name} className="result-card likely">
                    <div className="result-card-head">
                      <div>
                        <div className="result-name">{r.name}</div>
                        {r.amount && <div className="result-amount">{r.amount}</div>}
                      </div>
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
                <strong>Disclaimer:</strong> This tool provides estimates only, based on the information entered and 2026/27 benefit rates. It is not financial advice. Always verify entitlement on GOV.UK or with Citizens Advice before making any claim decisions.
              </div>

              <div className="nav" style={{marginTop:"1.5rem"}}>
                <Btn ghost onClick={()=>nav("existing")}>← Amend answers</Btn>
                <Btn ghost onClick={reset}>↺ Start again</Btn>
              </div>
            </>);
          })()}
        </>
      )}
    </div>
  );
}

export default App;
