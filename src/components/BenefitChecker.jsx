import { useState } from 'react';

const STEPS = ["household","income","children","housing","savings","results"];
const LABELS = ["Household","Income","Children","Housing","Savings","Results"];

function calcBenefits(d) {
  const all = [];
  const inc1=parseFloat(d.income1)||0, inc2=parseFloat(d.income2)||0;
  const total=inc1+inc2, monthly=total/12;
  const sav=parseFloat(d.savings)||0;
  const n=parseInt(d.numChildren)||0;
  const h1=parseFloat(d.hrs1)||0, h2=parseFloat(d.hrs2)||0;
  const couple=d.coupleOrSingle==="couple";
  const rents=d.rent==="yes";
  const ages=d.childAges.map(a=>parseFloat(a)||0);
  const disabled=d.hasDisability===true;
  const already=d.alreadyClaiming||[];

  // 1. UC
  if (sav<16000) {
    const wa=rents?404:673;
    const std=couple?489.23:311.68;
    const ce=n>0?333.33+Math.max(0,n-1)*287.92+(disabled?156.11:0):0;
    const award=Math.max(0,(std+ce)-Math.max(0,monthly-wa)*0.55);
    all.push({name:"Universal Credit",likely:award>0,amount:award>0?`~£${Math.round(award)}/month`:null,
      summary:award>0?`Based on £${Math.round(monthly)}/month household income, you may be entitled to Universal Credit to top up your wages.${disabled?" A disabled child element has been included in this estimate.":""}`
        :"Your earnings are above the UC taper threshold — you're unlikely to qualify.",
      tip:award>0?"UC is available to working families with no minimum hours. Your award reduces by 55p for every £1 earned above your work allowance.":null,
      url:"https://www.gov.uk/universal-credit/eligibility",cta:"Check eligibility on GOV.UK",annualValue:award>0?Math.round(award)*12:0});
  } else {
    all.push({name:"Universal Credit",likely:false,amount:null,summary:"Savings over £16,000 disqualify you from Universal Credit.",tip:null,url:"https://www.gov.uk/universal-credit/eligibility",cta:"Learn more on GOV.UK",annualValue:0});
  }

  // 2. Child Benefit
  if (n>0) {
    const weekly=27.05+Math.max(0,n-1)*17.90;
    const annual=weekly*52;
    const hi=Math.max(inc1,inc2);
    const hicc=hi>60000;
    const charge=hicc?Math.min(annual,Math.floor((hi-60000)/200)*(annual*0.01)):0;
    const net=Math.round(annual-charge);
    all.push({name:"Child Benefit",likely:true,amount:`£${weekly.toFixed(2)}/week${hicc?` (minus ~£${Math.round(charge)} High Income Charge)`:""}`,
      summary:hicc?`You qualify but the High Income Charge applies. Net value ~£${net}/year.`
        :`All families with children qualify regardless of income. Worth £${weekly.toFixed(2)}/week (£${Math.round(annual)}/year).`,
      tip:"Must be actively claimed — not automatic. Claiming also protects your National Insurance record.",
      url:"https://www.gov.uk/child-benefit",cta:"Claim Child Benefit on GOV.UK",annualValue:net});
  }

  // 3. Free School Meals
  const ucOk=all[0]?.likely;
  const infants=ages.filter(a=>a>=4&&a<8).length;
  const schoolKids=ages.filter(a=>a>=5&&a<=16).length;
  if (n>0) {
    if (infants>0) {
      all.push({name:"Universal Infant Free School Meals",likely:true,amount:"Free lunches (~£450/year per child)",
        summary:`All Reception, Year 1 & Year 2 children get free meals automatically — regardless of income. You have ${infants} child${infants>1?"ren":""} in this age range.`,
        tip:"No application needed — your school handles it.",url:"https://www.gov.uk/apply-free-school-meals",cta:"Find out more on GOV.UK",annualValue:infants*450});
    } else if (schoolKids>0&&(ucOk||total<20000)) {
      all.push({name:"Free School Meals",likely:true,amount:"Free lunches (~£450/year per child)",
        summary:"Families on Universal Credit or with net UC income under £7,400 qualify for Free School Meals for children aged 5–16.",
        tip:"Apply via your local council or school — not automatic.",url:"https://www.gov.uk/apply-free-school-meals",cta:"Apply for Free School Meals",annualValue:schoolKids*450});
    }
  }

  // 4. Tax-Free Childcare
  const tfcMax=disabled?4000:2000;
  const youngAll=ages.filter(a=>disabled?a<16:a<12).length;
  const worksEnough=h1>=16&&(couple?h2>=16:true);
  const incOk=total>=1976&&Math.max(inc1,inc2)<100000;
  if (youngAll>0) {
    const elig=worksEnough&&incOk;
    all.push({name:"Tax-Free Childcare",likely:elig,amount:elig?`Up to £${youngAll*tfcMax}/year (£${tfcMax.toLocaleString()} per eligible child)`:null,
      summary:elig?`For every £8 you pay in, the government adds £2${disabled?" — up to £4,000/year for a disabled child":" — up to £2,000/year per child"}. With ${youngAll} eligible child${youngAll>1?"ren":""}, that's up to £${(youngAll*tfcMax).toLocaleString()}/year in top-ups.`
        :worksEnough?"One earner exceeds £100,000 or income is below the minimum threshold.":"Both parents need to work at least 16hrs/week to qualify.",
      tip:elig?"Cannot be used at the same time as Universal Credit childcare element — check which is worth more.":null,
      url:"https://www.gov.uk/tax-free-childcare",cta:elig?"Apply for Tax-Free Childcare":"Check eligibility on GOV.UK",annualValue:elig?youngAll*tfcMax:0});
  }

  // 5. Free Childcare Hours
  const u4=ages.filter(a=>a>=0&&a<4).length;
  if (u4>0) {
    const thirty=worksEnough&&incOk;
    all.push({name:"Free Childcare Hours",likely:true,amount:thirty?"30 hours/week free (38 weeks/year)":"15 hours/week free (38 weeks/year)",
      summary:thirty?`Working parents of 3–4 year olds get 30 free childcare hours/week — worth ~£6,000–£7,000/year per child. You have ${u4} child${u4>1?"ren":""} in this age group.`
        :`All 3 and 4 year olds get 15 free hours/week regardless of income. Working families on the eligible income threshold get 30 hours.`,
      tip:"Apply via Childcare Choices. You'll need a code from HMRC to give your provider.",
      url:"https://www.childcarechoices.gov.uk/",cta:"Apply for free childcare hours",annualValue:thirty?u4*6500:u4*3250});
  }

  // 6. Healthy Start
  if (d.pregnant||ages.some(a=>a<4)) {
    if (ucOk||total<20000) {
      all.push({name:"Healthy Start Vouchers",likely:true,amount:"£4.25/week for food & milk",
        summary:"Pregnant women and parents of children under 4 on qualifying benefits get vouchers for fruit, veg, milk, and vitamins.",
        tip:"Loaded onto a prepaid card every 4 weeks.",url:"https://www.healthystart.nhs.uk/",cta:"Apply for Healthy Start",annualValue:Math.round(4.25*52)});
    }
  }

  // 7. Council Tax Reduction
  const ctOk=total<35000;
  all.push({name:"Council Tax Reduction",likely:ctOk,amount:ctOk?"25–100% off your council tax bill":null,
    summary:ctOk?"Most councils offer Council Tax Reduction for working families on lower incomes. UC claimants often qualify automatically. Amount varies by council."
      :"At your income level you're unlikely to qualify, but rules vary significantly by council — worth a quick check.",
    tip:"Apply directly to your local council — never automatic, even if you claim other benefits.",
    url:"https://www.gov.uk/council-tax-reduction",cta:"Check Council Tax Reduction",annualValue:0});

  // Filter out already-claiming, mark them separately
  const res = all.map(r => ({...r, alreadyClaiming: already.includes(r.name)}));
  return res;
}

function Radio({options, value, onChange}) {
  return (
    <div className="radio-group">
      {options.map(o => (
        <label key={o.v} className={`radio-option${value===o.v?' selected':''}`} onClick={()=>onChange(o.v)}>
          <input type="radio" checked={value===o.v} onChange={()=>onChange(o.v)} onClick={e=>e.stopPropagation()} />
          {o.l}
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
  const [step, setStep] = useState("household");
  const [d, setD] = useState({coupleOrSingle:"",partnerWorks:"",income1:"",income2:"",hrs1:"",hrs2:"",numChildren:"",childAges:[],pregnant:false,hasDisability:false,alreadyClaiming:[],rent:"",savings:""});
  const [results, setResults] = useState(null);

  const set = (k,v) => setD(prev=>({...prev,[k]:v}));
  const setAge = (i,v) => { const a=[...d.childAges]; a[i]=v; set("childAges",a); };
  const setChildren = n => { const a=Array.from({length:parseInt(n)||0},(_,i)=>d.childAges[i]||""); set("numChildren",n); set("childAges",a); };
  const nav = next => {
    if (next==="results") setResults(calcBenefits(d));
    setStep(next);
    document.querySelector('.right-panel')?.scrollTo({top:0,behavior:'smooth'});
  };
  const reset = () => { setStep("household"); setD({coupleOrSingle:"",partnerWorks:"",income1:"",income2:"",hrs1:"",hrs2:"",numChildren:"",childAges:[],pregnant:false,hasDisability:false,alreadyClaiming:[],rent:"",savings:""}); setResults(null); };

  const idx = STEPS.indexOf(step);
  const pct = Math.round((idx/(STEPS.length-1))*100);
  const likelyCount = results ? results.filter(r=>r.likely&&!r.alreadyClaiming).length : 0;

  const footerNote = document.getElementById('footer-note');
  if (footerNote) footerNote.style.display = step==='results'?'none':'block';

  return (
    <div>
      {step !== "results" && (
        <div className="progress-wrap">
          <div className="progress-labels">
            {LABELS.map((l,i) => <span key={l} className={`progress-label${i===idx?' active':i<idx?' done':''}`}>{l}</span>)}
          </div>
          <div className="progress-track"><div className="progress-fill" style={{width:`${pct}%`}} /></div>
        </div>
      )}

      {step === "household" && (
        <>
          <h2 className="step-title">Your household</h2>
          <div className="field">
            <label className="field-label">Single parent or couple?</label>
            <Radio value={d.coupleOrSingle} onChange={v=>set("coupleOrSingle",v)} options={[{v:"single",l:"Single parent"},{v:"couple",l:"Couple (married, civil partners, or living together)"}]} />
          </div>
          {d.coupleOrSingle==="couple" && (
            <div className="field">
              <label className="field-label">Is your partner also working?</label>
              <Radio value={d.partnerWorks} onChange={v=>set("partnerWorks",v)} options={[{v:"yes",l:"Yes"},{v:"no",l:"No"}]} />
            </div>
          )}
          <div className="nav"><div className="nav-right"><Btn onClick={()=>d.coupleOrSingle&&nav("income")}>Continue →</Btn></div></div>
        </>
      )}

      {step === "income" && (
        <>
          <h2 className="step-title">Income & hours</h2>
          <p className="step-hint">Use annual gross income before tax. Estimates are fine.</p>
          <div className="field">
            <label className="field-label">Your annual income (£)</label>
            <p className="field-sublabel">Include salary, self-employment, and any other earnings</p>
            <input className="text-input" type="number" placeholder="e.g. 28000" value={d.income1} onChange={e=>set("income1",e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label">Your average hours worked per week</label>
            <input className="text-input" type="number" placeholder="e.g. 35" value={d.hrs1} onChange={e=>set("hrs1",e.target.value)} />
          </div>
          {d.coupleOrSingle==="couple" && d.partnerWorks==="yes" && (<>
            <hr className="divider" />
            <div className="field">
              <label className="field-label">Partner's annual income (£)</label>
              <input className="text-input" type="number" placeholder="e.g. 22000" value={d.income2} onChange={e=>set("income2",e.target.value)} />
            </div>
            <div className="field">
              <label className="field-label">Partner's average hours per week</label>
              <input className="text-input" type="number" placeholder="e.g. 20" value={d.hrs2} onChange={e=>set("hrs2",e.target.value)} />
            </div>
          </>)}
          <div className="nav">
            <Btn ghost onClick={()=>nav("household")}>← Back</Btn>
            <Btn onClick={()=>d.income1&&nav("children")}>Continue →</Btn>
          </div>
        </>
      )}

      {step === "children" && (
        <>
          <h2 className="step-title">Your children</h2>
          <div className="field">
            <label className="field-label">How many dependent children?</label>
            <select className="sel-input" value={d.numChildren} onChange={e=>setChildren(e.target.value)}>
              <option value="">Select...</option>
              {[1,2,3,4,5,6].map(n=><option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          {parseInt(d.numChildren)>0 && (
            <div className="field">
              <label className="field-label">Age of each child (years)</label>
              <p className="field-sublabel">Enter whole years. Use 0 for children under 1.</p>
              <div className="age-row">
                {Array.from({length:parseInt(d.numChildren)}).map((_,i)=>(
                  <div key={i} className="age-wrap">
                    <input className="age-input" type="number" min="0" max="18" step="1" placeholder="0" value={d.childAges[i]??""} onChange={e=>setAge(i,e.target.value)} />
                    <span className="age-label">Child {i+1}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="field">
            <label className="field-label">Are you currently pregnant?</label>
            <Radio value={d.pregnant?"yes":"no"} onChange={v=>set("pregnant",v==="yes")} options={[{v:"no",l:"No"},{v:"yes",l:"Yes"}]} />
          </div>
          <div className="field">
            <label className="field-label">Does any child have a disability or long-term health condition?</label>
            <p className="field-sublabel">This may entitle you to higher rates of Tax-Free Childcare and Universal Credit</p>
            <Radio value={d.hasDisability?"yes":"no"} onChange={v=>set("hasDisability",v==="yes")} options={[{v:"no",l:"No"},{v:"yes",l:"Yes — at least one child has a disability or long-term condition"}]} />
          </div>
          <div className="field">
            <label className="field-label">Are you already claiming any of these?</label>
            <p className="field-sublabel">We'll skip anything you're already receiving</p>
            <div className="checkbox-group">
              {["Universal Credit","Child Benefit","Free School Meals","Tax-Free Childcare","Free Childcare Hours","Healthy Start Vouchers","Council Tax Reduction"].map(b => (
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
            <Btn onClick={()=>d.numChildren&&nav("housing")}>Continue →</Btn>
          </div>
        </>
      )}

      {step === "housing" && (
        <>
          <h2 className="step-title">Housing</h2>
          <div className="field">
            <label className="field-label">Do you pay rent?</label>
            <p className="field-sublabel">This affects your Universal Credit work allowance</p>
            <Radio value={d.rent} onChange={v=>set("rent",v)} options={[{v:"yes",l:"Yes, I rent"},{v:"no",l:"No — I own or live rent-free"}]} />
          </div>
          <div className="nav">
            <Btn ghost onClick={()=>nav("children")}>← Back</Btn>
            <Btn onClick={()=>d.rent&&nav("savings")}>Continue →</Btn>
          </div>
        </>
      )}

      {step === "savings" && (
        <>
          <h2 className="step-title">Savings</h2>
          <p className="step-hint">Only affects Universal Credit eligibility. Exclude your home and pension.</p>
          <div className="field">
            <label className="field-label">Total household savings (£)</label>
            <p className="field-sublabel">All savings accounts, ISAs, and investments combined</p>
            <input className="text-input" type="number" placeholder="e.g. 5000" value={d.savings} onChange={e=>set("savings",e.target.value)} />
          </div>
          <div className="nav">
            <Btn ghost onClick={()=>nav("housing")}>← Back</Btn>
            <Btn onClick={()=>nav("results")}>See my results →</Btn>
          </div>
        </>
      )}

      {step === "results" && results && (
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
              <div className="result-total-sub">per year in unclaimed benefits</div>
              <hr className="result-divider" />
              <div className="result-count-row">
                <div className="result-count">{likelyNew.length}</div>
                <div className="result-label">benefit{likelyNew.length!==1?"s":""} you're likely entitled to</div>
              </div>
              <div className="result-sublabel">Estimates based on 2026/27 rates — verify each one below</div>
            </>) : (<>
              <div className={`result-count${likelyNew.length===0?' none':''}`}>{likelyNew.length}</div>
              <div className="result-label">benefit{likelyNew.length!==1?"s":""} you're likely entitled to</div>
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
          </>);
          })()}

          <div className="disclaimer">
            <strong>Disclaimer:</strong> This tool provides estimates only, based on the information you've entered and 2026/27 benefit rates. It is not financial advice. Your actual entitlement will be determined by DWP and HMRC. Always verify on GOV.UK or with Citizens Advice before making any claim decisions.
          </div>

          <div className="nav" style={{marginTop:"1.5rem"}}>
            <Btn ghost onClick={()=>nav("savings")}>← Amend answers</Btn>
            <Btn ghost onClick={reset}>↺ Start again</Btn>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
