import { useState, useEffect } from 'react';
const STEPS = ["about","work","family","housing","existing","results"];
const LABELS = ["About","Work","Family","Housing","Already claiming","Results"];

function calcBenefits(d) {
  const all = [];
  const age = parseInt(d.age)||0;
  const weeklyPay = parseFloat(d.weeklyPay)||0;
  const employed = d.employed === "employed";
  const selfEmployed = d.employed === "selfemployed";
  const notWorking = d.employed === "notworking";
  const weeksEmployed = parseInt(d.weeksEmployed)||0;
  const savings = parseFloat(d.savings)||0;
  const babyAge = parseInt(d.babyAge)||0; // weeks old
  const isFirstChild = d.isFirstChild === "yes";
  const onBenefits = d.onBenefits === "yes";
  const rents = d.housing === "rent" || d.housing === "council";
  const partnerWorking = d.partnerWorking === "yes";
  const already = d.alreadyClaiming||[];
  const niQualifies = weeklyPay >= 129 && weeksEmployed >= 26;

  // 1. SMP
  const smpEligible = employed && niQualifies && babyAge <= 52;
  const smpWeekly = Math.min(weeklyPay * 0.9, 194.32);
  const smpTotal = Math.round((weeklyPay * 0.9 * 6) + (194.32 * 33));
  all.push({
    name: "Statutory Maternity Pay (SMP)",
    likely: smpEligible,
    amount: smpEligible ? `90% pay for 6 weeks, then £194.32/week for 33 weeks (up to ~£${smpTotal.toLocaleString()} total)` : null,
    summary: smpEligible
      ? `Based on your weekly pay of £${weeklyPay} and employment history, you should qualify for SMP. Your employer pays this — the first 6 weeks at 90% of your average pay, then £194.32/week for 33 weeks.`
      : employed && !niQualifies ? "SMP requires at least 26 weeks employment with the same employer and average weekly earnings of £129+. You may qualify for Maternity Allowance instead."
      : !employed ? "SMP is only for employed people. Check Maternity Allowance below."
      : "Based on the information provided, SMP may not apply.",
    tip: smpEligible ? "SMP is taxable. You can start maternity leave 11 weeks before your due date. Your employer must confirm your SMP entitlement in writing." : null,
    url: "https://www.gov.uk/maternity-pay-leave",
    cta: "Check SMP on GOV.UK",
    annualValue: 0
  });

  // 2. Maternity Allowance
  const maEligible = !employed && babyAge <= 52;
  all.push({
    name: "Maternity Allowance",
    likely: maEligible,
    amount: maEligible ? "Up to £194.32/week for 39 weeks" : null,
    summary: maEligible
      ? "Maternity Allowance is for people who don't qualify for SMP — including self-employed, recently employed, or those between jobs. The rate is up to £194.32/week for 39 weeks."
      : "Maternity Allowance is for those who don't qualify for SMP. As an employed person, SMP should apply.",
    tip: maEligible ? "Claim using form MA1 from GOV.UK. Can be claimed from 26 weeks pregnant. Tax-free." : null,
    url: "https://www.gov.uk/maternity-allowance",
    cta: "Check Maternity Allowance on GOV.UK",
    annualValue: 0
  });

  // 3. Sure Start Maternity Grant
  const ssmgEligible = onBenefits && isFirstChild && babyAge <= 11;
  all.push({
    name: "Sure Start Maternity Grant",
    likely: ssmgEligible,
    amount: ssmgEligible ? "£500 one-off payment (tax-free, never repaid)" : null,
    summary: ssmgEligible
      ? "The Sure Start Maternity Grant is a £500 tax-free one-off payment for families on qualifying benefits having their first baby. It doesn't need to be repaid and doesn't affect other benefits."
      : !isFirstChild ? "The Sure Start Maternity Grant is only available for your first child (unless you're having twins or more, or have no children under 16 in your household)."
      : !onBenefits ? "The Sure Start Maternity Grant requires you or your partner to be receiving a qualifying benefit such as Universal Credit, Child Tax Credit, or Income Support."
      : "The Sure Start Maternity Grant must be claimed within 11 weeks of your baby's birth.",
    tip: ssmgEligible ? "⚠️ Must be claimed within 11 weeks of birth — don't delay. Apply using form SF100 from GOV.UK or your local Jobcentre Plus." : null,
    url: "https://www.gov.uk/sure-start-maternity-grant",
    cta: "Apply for Sure Start Maternity Grant",
    annualValue: ssmgEligible ? 500 : 0
  });

  // 4. Child Benefit
  const cbEligible = babyAge <= 52 * 16;
  const cbAmount = 27.05;
  all.push({
    name: "Child Benefit",
    likely: cbEligible,
    amount: cbEligible ? `£${cbAmount}/week (£1,406/year) for your child` : null,
    summary: cbEligible
      ? `Child Benefit pays £27.05/week (£1,406/year) for your child. It's not means-tested — anyone can claim regardless of income or savings. However, if either parent earns over £60,000 some may be clawed back via the High Income Child Benefit Charge.`
      : "Child Benefit is available for all children under 16.",
    tip: "Claim as soon as possible — can be backdated by up to 3 months. Even if you're a higher earner, claiming protects your NI record. You can always opt out of payments later.",
    url: "https://www.gov.uk/child-benefit",
    cta: "Claim Child Benefit on GOV.UK",
    annualValue: cbEligible ? Math.round(cbAmount * 52) : 0
  });

  // 5. Universal Credit child element
  const ucEligible = savings < 16000 && !partnerWorking;
  all.push({
    name: "Universal Credit — Child Element",
    likely: ucEligible,
    amount: ucEligible ? "£287.92–£333.33/month per child added to your UC" : null,
    summary: ucEligible
      ? "If you're on Universal Credit, a child element of £287.92–£333.33/month should be added for your new baby. Make sure DWP knows about your new child — it's not added automatically."
      : "Universal Credit child element is means-tested. At higher income levels or with significant savings you may not qualify.",
    tip: ucEligible ? "Report your new baby to DWP as soon as possible via your UC journal. The child element is added from the date you report, not from birth." : null,
    url: "https://www.gov.uk/universal-credit/what-youll-get",
    cta: "Report new child to DWP",
    annualValue: ucEligible ? Math.round(287.92 * 12) : 0
  });

  // 6. Healthy Start Vouchers
  const healthyStartEligible = onBenefits && babyAge <= 52;
  all.push({
    name: "Healthy Start Vouchers",
    likely: healthyStartEligible,
    amount: healthyStartEligible ? "£8.50/week for children under 1 on qualifying benefits" : null,
    summary: healthyStartEligible
      ? "Healthy Start provides £8.50/week in vouchers for families on qualifying benefits with a child under 1. The vouchers can be spent on milk, fruit, vegetables, and vitamins."
      : "Healthy Start is for pregnant women and families with children under 4 on qualifying benefits (UC, Child Tax Credit, or Income Support).",
    tip: "Apply at healthystart.nhs.uk — many eligible families don't know about this scheme.",
    url: "https://www.healthystart.nhs.uk/",
    cta: "Apply for Healthy Start vouchers",
    annualValue: healthyStartEligible ? Math.round(8.50 * 52) : 0
  });

  // 7. Statutory Paternity Pay
  const sppEligible = d.partnerEmployed === "yes" && babyAge <= 8;
  if (d.partnerEmployed !== "") {
    all.push({
      name: "Statutory Paternity Pay",
      likely: sppEligible,
      amount: sppEligible ? "£194.32/week for up to 2 weeks" : null,
      summary: sppEligible
        ? "Your partner may be entitled to up to 2 weeks of Statutory Paternity Pay at £194.32/week — they must claim within 56 days of the birth."
        : "Statutory Paternity Pay requires the partner to have been employed for 26+ weeks and earned £129+/week on average.",
      tip: sppEligible ? "Your partner must give their employer 28 days notice. SPP must be taken within 56 days of birth — it cannot be saved for later." : null,
      url: "https://www.gov.uk/paternity-pay-leave",
      cta: "Check Statutory Paternity Pay",
      annualValue: sppEligible ? Math.round(194.32 * 2) : 0
    });
  }

  // 8. Free childcare hours (15hrs from 9 months)
  const freeChildcareEligible = babyAge >= 36; // 9 months
  if (babyAge >= 36) {
    all.push({
      name: "Free Childcare Hours",
      likely: true,
      amount: "15 hours/week free from 9 months (30 hours for working parents)",
      summary: "From 9 months old, all children in England qualify for 15 free childcare hours per week (38 weeks/year). Working parents earning over £1,976/year each qualify for 30 hours. This is worth £3,000–£6,000/year per child.",
      tip: "Apply via Childcare Choices at least 3 months before you want to start — codes expire quarterly. Check if your provider accepts the hours.",
      url: "https://www.childcarechoices.gov.uk/",
      cta: "Apply for free childcare hours",
      annualValue: 4500
    });
  }

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
    age:"", babyAge:"", isFirstChild:"", onBenefits:"",
    employed:"", weeksEmployed:"", weeklyPay:"", partnerEmployed:"", partnerWorking:"",
    savings:"", housing:"", alreadyClaiming:[]
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
    setD({age:"",babyAge:"",isFirstChild:"",onBenefits:"",employed:"",weeksEmployed:"",weeklyPay:"",partnerEmployed:"",partnerWorking:"",savings:"",housing:"",alreadyClaiming:[]});
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
          <h2 className="step-title">About your baby</h2>
          <div className="field">
            <label className="field-label">How old is your baby?</label>
            <p className="field-sublabel">Enter in weeks. Enter 0 if not yet born.</p>
            <input className="text-input" type="number" placeholder="e.g. 4" value={d.babyAge} onChange={e=>set("babyAge",e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label">Is this your first child?</label>
            <Radio value={d.isFirstChild} onChange={v=>set("isFirstChild",v)} options={[
              {v:"yes",l:"Yes — this is my first child"},
              {v:"no",l:"No — I have other children"}
            ]} />
          </div>
          <div className="field">
            <label className="field-label">Are you or your partner receiving any benefits?</label>
            <p className="field-sublabel">e.g. Universal Credit, Child Tax Credit, Income Support, Pension Credit</p>
            <Radio value={d.onBenefits} onChange={v=>set("onBenefits",v)} options={[
              {v:"no",l:"No"},
              {v:"yes",l:"Yes"}
            ]} />
          </div>
          <div className="field">
            <label className="field-label">Your age</label>
            <input className="text-input" type="number" placeholder="e.g. 29" value={d.age} onChange={e=>set("age",e.target.value)} />
          </div>
          <div className="nav"><div className="nav-right"><Btn onClick={()=>d.babyAge!==''&&d.isFirstChild&&d.onBenefits&&d.age&&nav("work")}>Continue →</Btn></div></div>
        </>
      )}

      {step==="work" && (
        <>
          <h2 className="step-title">Your work situation</h2>
          <div className="field">
            <label className="field-label">Your employment status</label>
            <Radio value={d.employed} onChange={v=>set("employed",v)} options={[
              {v:"employed",l:"Employed"},
              {v:"selfemployed",l:"Self-employed"},
              {v:"notworking",l:"Not currently working"}
            ]} />
          </div>
          {d.employed==="employed" && (<>
            <div className="field">
              <label className="field-label">How long have you worked for your current employer?</label>
              <Radio value={d.weeksEmployed} onChange={v=>set("weeksEmployed",v)} options={[
                {v:"0",l:"Less than 26 weeks"},
                {v:"26",l:"26 weeks or more"}
              ]} />
            </div>
            <div className="field">
              <label className="field-label">Your average weekly earnings (£)</label>
              <p className="field-sublabel">Gross pay before tax. Minimum £129/week to qualify for SMP.</p>
              <input className="text-input" type="number" placeholder="e.g. 450" value={d.weeklyPay} onChange={e=>set("weeklyPay",e.target.value)} />
            </div>
          </>)}
          <div className="field">
            <label className="field-label">Is your partner employed?</label>
            <Radio value={d.partnerEmployed} onChange={v=>set("partnerEmployed",v)} options={[
              {v:"no",l:"No partner / partner not employed"},
              {v:"yes",l:"Yes — partner is employed"}
            ]} />
          </div>
          <div className="nav">
            <Btn ghost onClick={()=>nav("about")}>← Back</Btn>
            <Btn onClick={()=>d.employed&&d.partnerEmployed&&nav("family")}>Continue →</Btn>
          </div>
        </>
      )}

      {step==="family" && (
        <>
          <h2 className="step-title">Family & income</h2>
          <div className="field">
            <label className="field-label">Is your partner currently working?</label>
            <Radio value={d.partnerWorking} onChange={v=>set("partnerWorking",v)} options={[
              {v:"no",l:"No — not working or on parental leave"},
              {v:"yes",l:"Yes — working"}
            ]} />
          </div>
          <div className="field">
            <label className="field-label">Total household savings (£)</label>
            <p className="field-sublabel">All savings and investments. Over £16,000 affects Universal Credit.</p>
            <input className="text-input" type="number" placeholder="e.g. 5000" value={d.savings} onChange={e=>set("savings",e.target.value)} />
          </div>
          <div className="nav">
            <Btn ghost onClick={()=>nav("work")}>← Back</Btn>
            <Btn onClick={()=>d.partnerWorking&&d.savings!==''&&nav("housing")}>Continue →</Btn>
          </div>
        </>
      )}

      {step==="housing" && (
        <>
          <h2 className="step-title">Housing</h2>
          <div className="field">
            <label className="field-label">Your housing situation</label>
            <Radio value={d.housing} onChange={v=>set("housing",v)} options={[
              {v:"own",l:"Own my home (outright or with mortgage)"},
              {v:"rent",l:"Rent privately or from housing association"},
              {v:"council",l:"Rent from the council"},
              {v:"other",l:"Live with family or other arrangement"}
            ]} />
          </div>
          <div className="nav">
            <Btn ghost onClick={()=>nav("family")}>← Back</Btn>
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
              {["Statutory Maternity Pay (SMP)","Maternity Allowance","Sure Start Maternity Grant","Child Benefit","Universal Credit — Child Element","Healthy Start Vouchers","Statutory Paternity Pay","Free Childcare Hours"].map(b => (
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
            <strong>Disclaimer:</strong> Estimates only, based on 2026/27 rates. Always verify on GOV.UK or with Citizens Advice before making claim decisions.
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
