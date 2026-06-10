import { useState, useEffect } from 'react';

const STEPS = ["about","job","finances","housing","existing","results"];
const LABELS = ["About","Your job","Finances","Housing","Already claiming","Results"];

function calcStatRedundancy(age, yearsService, weeklyPay) {
  const cappedPay = Math.min(weeklyPay, 751);
  let weeks = 0;
  for (let y = 1; y <= yearsService; y++) {
    const ageAtYear = age - yearsService + y;
    if (ageAtYear < 22) weeks += 0.5;
    else if (ageAtYear < 41) weeks += 1;
    else weeks += 1.5;
  }
  return Math.round(weeks * cappedPay);
}

function calcBenefits(d) {
  const all = [];
  const age = parseInt(d.age)||0;
  const yearsService = parseFloat(d.yearsService)||0;
  const weeklyPay = parseFloat(d.weeklyPay)||0;
  const savings = parseFloat(d.savings)||0;
  const redundancyPay = parseFloat(d.redundancyPay)||0;
  const hasMortgage = d.housing === "mortgage";
  const rents = d.housing === "rent";
  const hasChildren = d.hasChildren === "yes";
  const hasNIContribs = d.hasNIContribs === "yes";
  const isIll = d.isIll === "yes";
  const alreadyClaiming = d.alreadyClaiming||[];
  const leftVoluntarily = d.leftHow === "voluntary";

  // 1. Statutory Redundancy Pay
  const statRedundancyAmount = calcStatRedundancy(age, yearsService, weeklyPay);
  const redundancyEligible = yearsService >= 2 && !leftVoluntarily;
  all.push({
    name: "Statutory Redundancy Pay",
    likely: redundancyEligible,
    amount: redundancyEligible ? `~£${statRedundancyAmount.toLocaleString()} (estimate)` : null,
    summary: redundancyEligible
      ? `Based on ${yearsService} years of service, age ${age}, and weekly pay of £${weeklyPay}, your estimated statutory redundancy pay is £${statRedundancyAmount.toLocaleString()}. Your employer may offer more than the statutory minimum.`
      : yearsService < 2 ? "You need at least 2 years continuous service to qualify for statutory redundancy pay."
      : "Statutory redundancy pay only applies if you were made redundant — not if you left voluntarily.",
    tip: redundancyEligible ? "Your employer must pay this — if they refuse or you disagree with the amount, contact ACAS or the Employment Tribunal. Redundancy pay up to £30,000 is tax-free." : null,
    url: "https://www.gov.uk/calculate-your-redundancy-pay",
    cta: "Check redundancy pay on GOV.UK",
    annualValue: 0
  });

  // 2. New Style JSA
  const jsaRate = age >= 25 ? 95.55 : 75.65;
  const jsaAnnual = Math.round(jsaRate * 26); // max 26 weeks
  const jsaEligible = hasNIContribs && !leftVoluntarily;
  all.push({
    name: "New Style JSA",
    likely: jsaEligible,
    amount: jsaEligible ? `£${jsaRate}/week (up to 6 months)` : null,
    summary: jsaEligible
      ? `New Style JSA pays £${jsaRate}/week (2026/27) for up to 6 months while you actively look for work. It's based on your National Insurance contributions — not your savings or partner's income. You can claim this alongside Universal Credit.`
      : !hasNIContribs ? "New Style JSA requires sufficient Class 1 National Insurance contributions in the last 2-3 tax years. You may still be eligible for Universal Credit."
      : "If you left voluntarily, JSA may be delayed by up to 13 weeks — Jobcentre Plus will assess your reasons for leaving.",
    tip: jsaEligible ? "⚠️ Claim JSA within 3 months of losing your job — you cannot backdate it. Don't delay even if you expect to find work quickly." : null,
    url: "https://www.gov.uk/jobseekers-allowance",
    cta: "Claim New Style JSA on GOV.UK",
    annualValue: jsaEligible ? jsaAnnual : 0
  });

  // 3. Universal Credit
  const ucSavingsOk = savings < 16000;
  // Redundancy pay treated as capital for UC purposes
  const totalCapital = savings + (redundancyPay > 30000 ? redundancyPay - 30000 : 0);
  const ucCapitalOk = totalCapital < 16000;
  const ucEligible = ucCapitalOk;
  const ucStandard = age >= 25 ? 311.68 : 265.31;
  all.push({
    name: "Universal Credit",
    likely: ucEligible,
    amount: ucEligible ? `From £${ucStandard.toFixed(2)}/month (plus any housing, child, or other elements)` : null,
    summary: ucEligible
      ? `Universal Credit can top up your income while you're out of work. The standard allowance is £${ucStandard.toFixed(2)}/month. Additional amounts are available for housing costs, children, and health conditions. Your redundancy pay may affect payments temporarily.`
      : "Savings or capital over £16,000 disqualify you from Universal Credit temporarily. Once savings drop below £16,000, you can claim.",
    tip: ucEligible ? "Claim UC as soon as possible — it cannot be backdated. You can claim UC and New Style JSA at the same time. Redundancy pay over £30,000 counts as capital and may temporarily reduce UC." : null,
    url: "https://www.gov.uk/universal-credit",
    cta: "Claim Universal Credit on GOV.UK",
    annualValue: ucEligible ? Math.round(ucStandard * 12) : 0
  });

  // 4. New Style ESA
  const esaEligible = isIll && hasNIContribs;
  all.push({
    name: "New Style ESA",
    likely: esaEligible,
    amount: esaEligible ? "£95.55/week while unable to work due to illness" : null,
    summary: esaEligible
      ? "If you're too ill or disabled to work, New Style ESA may be more appropriate than JSA. It pays £95.55/week and is based on your NI contributions. You'll need a fit note from your GP."
      : isIll ? "New Style ESA requires sufficient National Insurance contributions in the last 2-3 tax years."
      : "New Style ESA is for people who cannot work due to illness or disability.",
    tip: esaEligible ? "You cannot claim JSA and ESA at the same time — choose the one that applies to your situation. If your health improves, you can switch to JSA." : null,
    url: "https://www.gov.uk/employment-support-allowance",
    cta: "Check ESA eligibility on GOV.UK",
    annualValue: esaEligible ? Math.round(95.55 * 52) : 0
  });

  // 5. Support for Mortgage Interest (SMI)
  const smiEligible = hasMortgage && ucEligible;
  all.push({
    name: "Support for Mortgage Interest (SMI)",
    likely: smiEligible,
    amount: smiEligible ? "Government loan covering mortgage interest payments" : null,
    summary: smiEligible
      ? "SMI is a government loan that covers the interest on up to £200,000 of your mortgage while you're on Universal Credit. You must be on UC for 3 months before SMI kicks in. The loan is repaid when you sell your home."
      : !hasMortgage ? "SMI is only available to homeowners with a mortgage."
      : "SMI requires you to be receiving Universal Credit.",
    tip: smiEligible ? "SMI is a loan, not a grant — it's repaid with interest when your home is sold. Make sure you understand this before applying. Contact your mortgage lender to discuss payment holidays as an alternative." : null,
    url: "https://www.gov.uk/support-for-mortgage-interest",
    cta: "Check SMI eligibility on GOV.UK",
    annualValue: 0
  });

  // 6. Council Tax Reduction
  const ctrEligible = ucEligible || jsaEligible;
  all.push({
    name: "Council Tax Reduction",
    likely: ctrEligible,
    amount: ctrEligible ? "Up to 100% off your council tax bill" : null,
    summary: ctrEligible
      ? "Most councils offer significant Council Tax Reduction to people on Universal Credit or JSA. The amount varies by council but can be up to 100% while you're out of work."
      : "Council Tax Reduction is means-tested — contact your local council to check.",
    tip: "Apply directly to your local council — not automatic, even if you claim UC or JSA. Do this as soon as you lose your job.",
    url: "https://www.gov.uk/council-tax-reduction",
    cta: "Apply for Council Tax Reduction",
    annualValue: ctrEligible ? 1200 : 0
  });

  // 7. Free School Meals
  if (hasChildren) {
    const fsmEligible = ucEligible;
    all.push({
      name: "Free School Meals",
      likely: fsmEligible,
      amount: fsmEligible ? "Free lunches (~£450/year per child)" : null,
      summary: fsmEligible
        ? "Families on Universal Credit with net UC income under £7,400 qualify for Free School Meals. This is worth around £450/year per child aged 5-16."
        : "Free School Meals are means-tested — apply via your local council or school.",
      tip: "Apply through your local council or school — not automatic, even when claiming UC.",
      url: "https://www.gov.uk/apply-free-school-meals",
      cta: "Apply for Free School Meals",
      annualValue: fsmEligible ? 450 : 0
    });
  }

  // 8. NHS Prescription Exemptions
  const nhsEligible = ucEligible || jsaEligible;
  all.push({
    name: "NHS Prescription & Dental Exemptions",
    likely: nhsEligible,
    amount: nhsEligible ? "Free prescriptions and NHS dental treatment" : null,
    summary: nhsEligible
      ? "People on Universal Credit or JSA qualify for free NHS prescriptions and free NHS dental treatment. Apply for an HC2 certificate to access these."
      : "NHS exemptions are available to those on qualifying benefits.",
    tip: "Apply for an HC1 form from your Jobcentre or GP surgery to claim free health costs. This covers prescriptions, dental, sight tests, and more.",
    url: "https://www.nhs.uk/nhs-services/help-with-health-costs/",
    cta: "Check NHS exemptions",
    annualValue: nhsEligible ? 350 : 0
  });

  return all.map(r => ({...r, alreadyClaiming: alreadyClaiming.includes(r.name)}));
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
    age:"", leftHow:"", weeklyPay:"", yearsService:"",
    hasNIContribs:"", isIll:"no", savings:"", redundancyPay:"0",
    housing:"", hasChildren:"", alreadyClaiming:[]
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
    setD({age:"",leftHow:"",weeklyPay:"",yearsService:"",hasNIContribs:"",isIll:"no",savings:"",redundancyPay:"0",housing:"",hasChildren:"",alreadyClaiming:[]});
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
          <div className="urgent-box">
            ⚠️ <strong>Act quickly.</strong> New Style JSA must be claimed within 3 months of losing your job. Don't wait — even if you expect to find work soon.
          </div>
          <div className="field">
            <label className="field-label">Your age</label>
            <input className="text-input" type="number" placeholder="e.g. 38" value={d.age} onChange={e=>set("age",e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label">How did you leave your job?</label>
            <Radio value={d.leftHow} onChange={v=>set("leftHow",v)} options={[
              {v:"redundancy",l:"I was made redundant"},
              {v:"endofcontract",l:"My contract ended"},
              {v:"voluntary",l:"I resigned or left voluntarily"},
              {v:"dismissed",l:"I was dismissed"}
            ]} />
          </div>
          <div className="field">
            <label className="field-label">Do you have any health conditions that prevent you from working?</label>
            <Radio value={d.isIll} onChange={v=>set("isIll",v)} options={[
              {v:"no",l:"No — I'm able to look for work"},
              {v:"yes",l:"Yes — a health condition is affecting my ability to work"}
            ]} />
          </div>
          <div className="field">
            <label className="field-label">Do you have dependent children?</label>
            <Radio value={d.hasChildren} onChange={v=>set("hasChildren",v)} options={[
              {v:"no",l:"No"},
              {v:"yes",l:"Yes"}
            ]} />
          </div>
          <div className="nav"><div className="nav-right"><Btn onClick={()=>d.age&&d.leftHow&&d.isIll&&d.hasChildren&&nav("job")}>Continue →</Btn></div></div>
        </>
      )}

      {step==="job" && (
        <>
          <h2 className="step-title">Your job</h2>
          <p className="step-hint">This helps us calculate your statutory redundancy pay and JSA entitlement.</p>
          <div className="field">
            <label className="field-label">How many years did you work for your employer?</label>
            <p className="field-sublabel">Only continuous service counts. Round down to complete years.</p>
            <input className="text-input" type="number" placeholder="e.g. 5" value={d.yearsService} onChange={e=>set("yearsService",e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label">Your gross weekly pay (£)</label>
            <p className="field-sublabel">Your weekly salary before tax. Capped at £751/week for redundancy calculations.</p>
            <input className="text-input" type="number" placeholder="e.g. 600" value={d.weeklyPay} onChange={e=>set("weeklyPay",e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label">Did you pay Class 1 National Insurance contributions in the last 2-3 years?</label>
            <p className="field-sublabel">If you were employed and paid NI, answer yes. Self-employed NI doesn't count for JSA.</p>
            <Radio value={d.hasNIContribs} onChange={v=>set("hasNIContribs",v)} options={[
              {v:"yes",l:"Yes — I was employed and paid NI contributions"},
              {v:"no",l:"No — I was self-employed, or haven't worked recently"}
            ]} />
          </div>
          <div className="nav">
            <Btn ghost onClick={()=>nav("about")}>← Back</Btn>
            <Btn onClick={()=>d.yearsService&&d.weeklyPay&&d.hasNIContribs&&nav("finances")}>Continue →</Btn>
          </div>
        </>
      )}

      {step==="finances" && (
        <>
          <h2 className="step-title">Your finances</h2>
          <p className="step-hint">Savings affect Universal Credit eligibility. Redundancy pay may temporarily count as capital.</p>
          <div className="field">
            <label className="field-label">Total savings (£)</label>
            <p className="field-sublabel">All savings accounts and investments. Savings over £16,000 disqualify you from UC temporarily.</p>
            <input className="text-input" type="number" placeholder="e.g. 5000" value={d.savings} onChange={e=>set("savings",e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label">Redundancy pay received (£)</label>
            <p className="field-sublabel">Enter 0 if not yet received. The first £30,000 is tax-free and doesn't affect JSA, but may affect UC.</p>
            <input className="text-input" type="number" placeholder="e.g. 8000" value={d.redundancyPay} onChange={e=>set("redundancyPay",e.target.value)} />
          </div>
          <div className="nav">
            <Btn ghost onClick={()=>nav("job")}>← Back</Btn>
            <Btn onClick={()=>d.savings!==''&&nav("housing")}>Continue →</Btn>
          </div>
        </>
      )}

      {step==="housing" && (
        <>
          <h2 className="step-title">Your housing</h2>
          <div className="field">
            <label className="field-label">Your housing situation</label>
            <Radio value={d.housing} onChange={v=>set("housing",v)} options={[
              {v:"mortgage",l:"I own my home with a mortgage"},
              {v:"own",l:"I own my home outright (no mortgage)"},
              {v:"rent",l:"I rent privately or from a housing association"},
              {v:"council",l:"I rent from the council"},
              {v:"other",l:"I live with family or other arrangement"}
            ]} />
          </div>
          <div className="nav">
            <Btn ghost onClick={()=>nav("finances")}>← Back</Btn>
            <Btn onClick={()=>d.housing&&nav("existing")}>Continue →</Btn>
          </div>
        </>
      )}

      {step==="existing" && (
        <>
          <h2 className="step-title">Already claiming</h2>
          <p className="step-hint">Tick anything you're already receiving — we'll skip these in your results.</p>
          <div className="field">
            <div className="checkbox-group">
              {["Statutory Redundancy Pay","New Style JSA","Universal Credit","New Style ESA","Support for Mortgage Interest (SMI)","Council Tax Reduction","Free School Meals","NHS Prescription & Dental Exemptions"].map(b => (
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
            <Btn ghost onClick={()=>nav("housing")}>← Back</Btn>
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
            const statRed = likelyNew.find(r=>r.name==="Statutory Redundancy Pay");
            return (<>
              <div className={`result-banner${likelyNew.length===0?' none':''}`}>
                {totalValue>0 ? (<>
                  <div className="result-missing-label">You could be entitled to</div>
                  <div className="result-total">£{totalValue.toLocaleString()}</div>
                  <div className="result-total-sub">in support — plus{statRed?` ~£${parseInt(statRed.amount.replace(/[^0-9]/g,'') || 0).toLocaleString()} statutory redundancy pay`:""}</div>
                  <hr className="result-divider" />
                  <div className="result-count-row">
                    <div className="result-count">{likelyNew.length}</div>
                    <div className="result-label">entitlement{likelyNew.length!==1?"s":""} to claim</div>
                  </div>
                  <div className="result-sublabel">Based on 2026/27 rates — claim as soon as possible</div>
                </>) : (<>
                  <div className={`result-count${likelyNew.length===0?' none':''}`}>{likelyNew.length}</div>
                  <div className="result-label">entitlement{likelyNew.length!==1?"s":""} to claim</div>
                  <div className="result-sublabel">Based on 2026/27 rates</div>
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
                    {r.tip && <p className="result-tip">{r.tip}</p>}
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
                <strong>Disclaimer:</strong> This tool provides estimates only, based on 2026/27 rates. Statutory redundancy pay calculations are estimates — your actual entitlement depends on your exact employment history. Always verify on GOV.UK or with ACAS/Citizens Advice before making decisions.
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