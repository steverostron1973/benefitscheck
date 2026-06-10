import { useState, useEffect } from 'react';

const STEPS = ["about","income","family","health","existing","results"];
const LABELS = ["About","Income","Family","Health","Already claiming","Results"];

function calcBenefits(d) {
  const all = [];
  const annualProfit = parseFloat(d.annualProfit)||0;
  const age = parseInt(d.age)||0;
  const savings = parseFloat(d.savings)||0;
  const isPregnant = d.isPregnant === "yes";
  const hasChildren = d.hasChildren === "yes";
  const childAges = d.childAges||[];
  const isIll = d.isIll === "yes";
  const rents = d.housing === "rent";
  const weeksRegistered = parseInt(d.weeksRegistered)||0;
  const alreadyClaiming = d.alreadyClaiming||[];
  const smallProfitsThreshold = 7105;
  const class2Paid = annualProfit >= smallProfitsThreshold;

  // Weekly profit for UC calculation
  const monthlyProfit = annualProfit / 12;

  // 1. Universal Credit
  const ucSavingsOk = savings < 16000;
  const ucStandard = age >= 25 ? 311.68 : 265.31;
  // UC for self-employed uses minimum income floor after 12 months
  const mif = 1569; // approx monthly NMW x 25hrs for 2026/27
  const assessedIncome = Math.max(monthlyProfit, annualProfit < 12000 ? monthlyProfit : mif);
  const workAllowance = rents ? 404 : 673;
  const ucAward = Math.max(0, ucStandard - Math.max(0, monthlyProfit - workAllowance/12*0) * 0.55);
  const ucEligible = ucSavingsOk && annualProfit < 15000;

  all.push({
    name: "Universal Credit",
    likely: ucEligible,
    amount: ucEligible ? `From £${Math.round(ucAward)}/month (before minimum income floor applies)` : null,
    summary: ucEligible
      ? `Self-employed people on low profits may qualify for Universal Credit. In your first 12 months of self-employment there's no minimum income floor, so UC is calculated on your actual profits of £${Math.round(annualProfit)}/year.`
      : annualProfit >= 15000 ? "Your profit level is likely above the UC threshold for a single person — you're unlikely to qualify."
      : "Savings over £16,000 disqualify you from Universal Credit.",
    tip: ucEligible ? "After 12 months of self-employment, DWP applies a Minimum Income Floor (as if you earn NMW for your expected hours) which can reduce or remove UC. Worth claiming now if profits are low." : null,
    url: "https://www.gov.uk/universal-credit/self-employed-people",
    cta: "Check UC for self-employed on GOV.UK",
    annualValue: ucEligible ? Math.round(ucAward * 12) : 0
  });

  // 2. Maternity Allowance
  const maEligible = isPregnant && weeksRegistered >= 26;
  const maRate = class2Paid ? 194.32 : 27;
  all.push({
    name: "Maternity Allowance",
    likely: maEligible,
    amount: maEligible ? `£${maRate}/week for 39 weeks (£${Math.round(maRate*39).toLocaleString()} total)` : null,
    summary: maEligible
      ? class2Paid
        ? `As a self-employed person registered for ${weeksRegistered}+ weeks with profits above £7,105/year, you qualify for Maternity Allowance at the full rate of £194.32/week for 39 weeks — worth £7,578 in total.`
        : `You qualify for Maternity Allowance at the reduced rate of £27/week. To get the full £194.32/week, you can make voluntary Class 2 NI contributions (£3.65/week) when you apply.`
      : !isPregnant ? "Maternity Allowance is for self-employed people who are pregnant or have recently had a baby."
      : "You need to have been registered as self-employed for at least 26 weeks in the 66 weeks before your due date.",
    tip: maEligible ? "Claim using form MA1 from GOV.UK. You can claim from 26 weeks pregnant. Payments start 11 weeks before your due date. You can do up to 10 'keeping in touch' days of self-employed work without losing MA." : null,
    url: "https://www.gov.uk/maternity-allowance",
    cta: "Claim Maternity Allowance on GOV.UK",
    annualValue: maEligible ? Math.round(maRate * 39) : 0
  });

  // 3. New Style ESA
  const esaEligible = isIll && class2Paid;
  all.push({
    name: "New Style ESA",
    likely: esaEligible,
    amount: esaEligible ? "£95.55/week while unable to work" : null,
    summary: esaEligible
      ? "If illness or disability is preventing you from working, New Style ESA pays £95.55/week. As a self-employed person who has paid Class 2 NI, you may qualify — you'll need a fit note from your GP."
      : isIll && !class2Paid ? "New Style ESA requires Class 2 NI contributions. With profits below £7,105/year, you may need to make voluntary contributions (£3.65/week) to qualify."
      : "New Style ESA is for people unable to work due to illness or disability.",
    tip: esaEligible ? "You cannot claim New Style ESA and Maternity Allowance at the same time. ESA requires regular fit notes from your GP — ask for these as soon as you become unable to work." : null,
    url: "https://www.gov.uk/employment-support-allowance",
    cta: "Check ESA eligibility on GOV.UK",
    annualValue: esaEligible ? Math.round(95.55 * 52) : 0
  });

  // 4. Tax-Free Childcare
  const youngKids = childAges.filter(a => parseFloat(a) < 12).length;
  const tfcEligible = hasChildren && youngKids > 0 && annualProfit >= 1976 && annualProfit < 100000;
  all.push({
    name: "Tax-Free Childcare",
    likely: tfcEligible,
    amount: tfcEligible ? `Up to £${youngKids * 2000}/year (£2,000 per child under 12)` : null,
    summary: tfcEligible
      ? `Self-employed parents qualify for Tax-Free Childcare — for every £8 you pay in, the government adds £2, up to £2,000/year per child under 12. With ${youngKids} eligible child${youngKids > 1 ? "ren" : ""}, that's up to £${youngKids * 2000}/year.`
      : !hasChildren || youngKids === 0 ? "Tax-Free Childcare is for parents of children under 12."
      : annualProfit < 1976 ? "You need to earn at least £1,976/year (equivalent to 16hrs at NMW) to qualify."
      : "Your profit level exceeds the £100,000 individual limit for Tax-Free Childcare.",
    tip: tfcEligible ? "Self-employed people can use Tax-Free Childcare — you just need to earn at least the equivalent of 16 hours at National Minimum Wage per week. Cannot be used at the same time as UC childcare element." : null,
    url: "https://www.gov.uk/tax-free-childcare",
    cta: "Apply for Tax-Free Childcare",
    annualValue: tfcEligible ? youngKids * 2000 : 0
  });

  // 5. Free Childcare Hours
  const under4s = childAges.filter(a => parseFloat(a) >= 0 && parseFloat(a) < 4).length;
  if (hasChildren && under4s > 0) {
    const thirtyHours = annualProfit >= 1976 && annualProfit < 100000;
    all.push({
      name: "Free Childcare Hours",
      likely: true,
      amount: thirtyHours ? "30 hours/week free (38 weeks/year)" : "15 hours/week free (38 weeks/year)",
      summary: thirtyHours
        ? `Self-employed parents of 3-4 year olds qualify for 30 free childcare hours/week — worth around £6,000-£7,000/year per child. You have ${under4s} child${under4s > 1 ? "ren" : ""} in this age group.`
        : "All 3 and 4 year olds get 15 free hours/week regardless of income. Working parents meeting the earnings threshold get 30 hours.",
      tip: "Self-employed parents qualify on the same terms as employed parents. Apply via Childcare Choices and get a code from HMRC for your provider.",
      url: "https://www.childcarechoices.gov.uk/",
      cta: "Apply for free childcare hours",
      annualValue: thirtyHours ? under4s * 6500 : under4s * 3250
    });
  }

  // 6. Council Tax Reduction
  const ctrEligible = annualProfit < 20000 || ucEligible;
  all.push({
    name: "Council Tax Reduction",
    likely: ctrEligible,
    amount: ctrEligible ? "25–100% off your council tax bill" : null,
    summary: ctrEligible
      ? "Self-employed people on lower incomes or Universal Credit often qualify for Council Tax Reduction. The amount varies by council but can be significant."
      : "At your income level you're unlikely to qualify, but rules vary by council — worth checking.",
    tip: "Apply directly to your local council. Self-employed income may be assessed differently to employed income — provide your most recent accounts or tax return.",
    url: "https://www.gov.uk/council-tax-reduction",
    cta: "Check Council Tax Reduction",
    annualValue: ctrEligible ? 800 : 0
  });

  // 7. New Style JSA (if winding down)
  const jsaEligible = d.windingDown === "yes" && class2Paid;
  if (d.windingDown === "yes") {
    all.push({
      name: "New Style JSA (if closing your business)",
      likely: jsaEligible,
      amount: jsaEligible ? `£${age >= 25 ? 95.55 : 75.65}/week for up to 6 months` : null,
      summary: jsaEligible
        ? "If you're closing your self-employed business, you may qualify for New Style JSA while you look for employed work. Class 2 NI contributions count towards eligibility."
        : "New Style JSA for self-employed people requires sufficient Class 2 NI contributions. With profits below the Small Profits Threshold, you may not have built up enough entitlement.",
      tip: jsaEligible ? "Claim within 3 months of closing your business. You'll need to show you're actively looking for employed work and available to start immediately." : null,
      url: "https://www.gov.uk/jobseekers-allowance",
      cta: "Check JSA eligibility on GOV.UK",
      annualValue: jsaEligible ? Math.round((age >= 25 ? 95.55 : 75.65) * 26) : 0
    });
  }

  // 8. NHS Prescription Exemptions
  const nhsEligible = ucEligible || annualProfit < 15000;
  all.push({
    name: "NHS Prescription & Health Cost Exemptions",
    likely: nhsEligible,
    amount: nhsEligible ? "Free or reduced cost prescriptions, dental & eye tests" : null,
    summary: nhsEligible
      ? "Self-employed people on Universal Credit or low incomes qualify for free NHS prescriptions and may get help with dental treatment, sight tests, and glasses through the NHS Low Income Scheme."
      : "NHS health cost exemptions are available to those on qualifying benefits or low incomes.",
    tip: "Apply for an HC1 form to check eligibility for the NHS Low Income Scheme — this covers prescriptions, dental, sight tests, wigs, and fabric supports.",
    url: "https://www.nhs.uk/nhs-services/help-with-health-costs/",
    cta: "Check NHS health cost exemptions",
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
    age:"", annualProfit:"", savings:"", weeksRegistered:"",
    housing:"", isPregnant:"no", hasChildren:"no", childAges:[],
    isIll:"no", windingDown:"no", alreadyClaiming:[]
  });
  const [results, setResults] = useState(null);

  const set = (k,v) => setD(prev=>({...prev,[k]:v}));
  const setAge = (i,v) => { const a=[...d.childAges]; a[i]=v; set("childAges",a); };
  const ensureAges = n => { const a=Array.from({length:parseInt(n)||0},(_,i)=>d.childAges[i]||""); set("childAges",a); };

  const nav = next => {
    if (next==="results") setResults(calcBenefits(d));
    setStep(next);
    document.querySelector('.right-panel')?.scrollTo({top:0,behavior:'smooth'});
  };
  const reset = () => {
    setStep("about");
    setD({age:"",annualProfit:"",savings:"",weeksRegistered:"",housing:"",isPregnant:"no",hasChildren:"no",childAges:[],isIll:"no",windingDown:"no",alreadyClaiming:[]});
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
            <input className="text-input" type="number" placeholder="e.g. 34" value={d.age} onChange={e=>set("age",e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label">How long have you been registered as self-employed?</label>
            <Radio value={d.weeksRegistered} onChange={v=>set("weeksRegistered",v)} options={[
              {v:"0",l:"Less than 26 weeks"},
              {v:"26",l:"26 weeks to 1 year"},
              {v:"52",l:"More than 1 year"}
            ]} />
          </div>
          <div className="field">
            <label className="field-label">Are you thinking of closing your business?</label>
            <Radio value={d.windingDown} onChange={v=>set("windingDown",v)} options={[
              {v:"no",l:"No — still trading"},
              {v:"yes",l:"Yes — considering or in the process of closing"}
            ]} />
          </div>
          <div className="nav"><div className="nav-right"><Btn onClick={()=>d.age&&d.weeksRegistered&&d.windingDown&&nav("income")}>Continue →</Btn></div></div>
        </>
      )}

      {step==="income" && (
        <>
          <h2 className="step-title">Your income</h2>
          <p className="step-hint">Use your profit after business expenses, not your turnover.</p>
          <div className="field">
            <label className="field-label">Annual profit (£)</label>
            <p className="field-sublabel">Your self-employed profit after allowable business expenses. Use your best estimate if accounts aren't finalised.</p>
            <input className="text-input" type="number" placeholder="e.g. 18000" value={d.annualProfit} onChange={e=>set("annualProfit",e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label">Total savings (£)</label>
            <p className="field-sublabel">All savings accounts and investments. Over £16,000 disqualifies you from Universal Credit.</p>
            <input className="text-input" type="number" placeholder="e.g. 4000" value={d.savings} onChange={e=>set("savings",e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label">Housing situation</label>
            <Radio value={d.housing} onChange={v=>set("housing",v)} options={[
              {v:"own",l:"Own my home (outright or with mortgage)"},
              {v:"rent",l:"Rent privately or from housing association"},
              {v:"council",l:"Rent from the council"},
              {v:"other",l:"Live with family or other arrangement"}
            ]} />
          </div>
          <div className="nav">
            <Btn ghost onClick={()=>nav("about")}>← Back</Btn>
            <Btn onClick={()=>d.annualProfit!==''&&d.savings!==''&&d.housing&&nav("family")}>Continue →</Btn>
          </div>
        </>
      )}

      {step==="family" && (
        <>
          <h2 className="step-title">Family</h2>
          <div className="field">
            <label className="field-label">Do you have dependent children?</label>
            <Radio value={d.hasChildren} onChange={v=>{set("hasChildren",v); if(v==="no")set("childAges",[]);}} options={[
              {v:"no",l:"No"},
              {v:"yes",l:"Yes"}
            ]} />
          </div>
          {d.hasChildren==="yes" && (
            <div className="field">
              <label className="field-label">How many children and their ages?</label>
              <p className="field-sublabel">Enter whole years. Use 0 for under 1.</p>
              <select className="sel-input" style={{marginBottom:"8px"}} onChange={e=>ensureAges(e.target.value)}>
                <option value="">How many children?</option>
                {[1,2,3,4,5,6].map(n=><option key={n} value={n}>{n}</option>)}
              </select>
              {d.childAges.length > 0 && (
                <div style={{display:"flex",flexWrap:"wrap",gap:"8px",marginTop:"8px"}}>
                  {d.childAges.map((_,i)=>(
                    <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"4px"}}>
                      <input className="text-input" style={{width:"80px",textAlign:"center"}} type="number" min="0" max="18" step="1" placeholder="Age" value={d.childAges[i]||""} onChange={e=>setAge(i,e.target.value)} />
                      <span style={{fontSize:"10px",color:"#6a7a8a",fontWeight:"600",textTransform:"uppercase",letterSpacing:"0.03em"}}>Child {i+1}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          <div className="field">
            <label className="field-label">Are you pregnant?</label>
            <Radio value={d.isPregnant} onChange={v=>set("isPregnant",v)} options={[
              {v:"no",l:"No"},
              {v:"yes",l:"Yes"}
            ]} />
          </div>
          <div className="nav">
            <Btn ghost onClick={()=>nav("income")}>← Back</Btn>
            <Btn onClick={()=>nav("health")}>Continue →</Btn>
          </div>
        </>
      )}

      {step==="health" && (
        <>
          <h2 className="step-title">Health</h2>
          <div className="field">
            <label className="field-label">Do you have a health condition affecting your ability to work?</label>
            <p className="field-sublabel">This affects eligibility for New Style ESA</p>
            <Radio value={d.isIll} onChange={v=>set("isIll",v)} options={[
              {v:"no",l:"No"},
              {v:"yes",l:"Yes — a health condition is affecting my ability to work"}
            ]} />
          </div>
          <div className="nav">
            <Btn ghost onClick={()=>nav("family")}>← Back</Btn>
            <Btn onClick={()=>d.isIll&&nav("existing")}>Continue →</Btn>
          </div>
        </>
      )}

      {step==="existing" && (
        <>
          <h2 className="step-title">Already claiming</h2>
          <p className="step-hint">Tick anything you're already receiving — we'll skip these in your results.</p>
          <div className="field">
            <div className="checkbox-group">
              {["Universal Credit","Maternity Allowance","New Style ESA","Tax-Free Childcare","Free Childcare Hours","Council Tax Reduction","New Style JSA (if closing your business)","NHS Prescription & Health Cost Exemptions"].map(b => (
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
            <Btn ghost onClick={()=>nav("health")}>← Back</Btn>
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
                  <div className="result-missing-label">You could be missing out on</div>
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
                  <div className="result-sublabel">Estimates based on 2026/27 rates</div>
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
                <strong>Disclaimer:</strong> This tool provides estimates only, based on 2026/27 rates. UC calculations for self-employed are complex — after 12 months, a Minimum Income Floor applies which may significantly reduce or remove entitlement. Always verify on GOV.UK or with Citizens Advice before making any claim decisions.
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