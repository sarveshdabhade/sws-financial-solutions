import { escapeHtml, showToast, fmtINR } from '/src/shared/utils/index.js';
import { initInteractive, initKeyboardShortcuts } from '/src/shared/interactive.js';

const $ = (id) => document.getElementById(id);

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function pv(fv, rate, years) {
  return fv / Math.pow(1 + rate / 100, years);
}

function fv(pv, rate, years) {
  return pv * Math.pow(1 + rate / 100, years);
}

/* Animate number counting up with ₹ prefix */
function animateValue(el, start, end, duration = 900) {
  if (!Number.isFinite(end)) { el.textContent = "—"; return; }
  const range = end - start;
  const startTime = performance.now();
  function tick(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = start + range * eased;
    el.textContent = "₹" + fmtINR(current);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ===== Core Calculations ===== */

function computeHLV(age, retireAge, annualIncome, personalExp, growth, inflation, discount) {
  const years = retireAge - age;
  if (years <= 0) return 0;
  let hlv = 0;
  for (let i = 1; i <= years; i++) {
    const inc = annualIncome * Math.pow(1 + growth / 100, i);
    const exp = personalExp * Math.pow(1 + inflation / 100, i);
    const net = Math.max(0, inc - exp);
    hlv += net / Math.pow(1 + discount / 100, i);
  }
  return hlv;
}

function computeIncomeReplacement(age, familyExp, spouseIncome, youngestChildAge, inflation, discount, marital) {
  if (marital === 'single') {
    // minimal support for parents / siblings
    return familyExp * 12 * 5; // 5 years basic
  }
  const yearsToChildIndep = Math.max(25 - youngestChildAge, 0);
  const yearsToSpouseRetire = Math.max(60 - age, 10);
  const years = Math.max(yearsToChildIndep, yearsToSpouseRetire, 10);
  const monthlyNet = Math.max(0, familyExp - spouseIncome / 12);
  let total = 0;
  for (let i = 1; i <= years; i++) {
    const yearlyNeed = monthlyNet * 12 * Math.pow(1 + inflation / 100, i);
    total += yearlyNeed / Math.pow(1 + discount / 100, i);
  }
  return total;
}

function computeGoalProtection(age, retireAge, childrenCount, youngestChildAge, eduGoal, marriageGoal, spouseRetireGoal, marital, inflation) {
  let total = 0;
  if (childrenCount > 0 && youngestChildAge < 25) {
    const eduYears = Math.max(18 - youngestChildAge, 0);
    total += pv(eduGoal, inflation, eduYears);
    const marriageYears = Math.max(25 - youngestChildAge, 0);
    total += pv(marriageGoal, inflation, marriageYears);
  }
  if (marital === 'married' && spouseRetireGoal > 0) {
    const retireYears = Math.max(retireAge - age, 0);
    total += pv(spouseRetireGoal, inflation, retireYears);
  }
  return total;
}

function computeLiabilities(home, personal, car, other) {
  return home + personal + car + other;
}

function computeRiskScore(smoking, health, profession, stability, debt, income) {
  let score = 0;
  score += { non: 0, occasional: 15, regular: 30 }[smoking] || 0;
  score += { excellent: 0, good: 10, fair: 25, poor: 45 }[health] || 0;
  score += { low: 0, medium: 15, high: 35 }[profession] || 0;
  score += { stable: 0, moderate: 10, volatile: 25 }[stability] || 0;
  const ratio = debt / Math.max(income, 1);
  if (ratio > 3) score += 25;
  else if (ratio > 2) score += 15;
  else if (ratio > 1) score += 8;
  return score;
}

function classifyRisk(score) {
  if (score <= 40) return { type: 'Low Risk', color: '#0066cc', bg: 'rgba(0,102,204,.08)' };
  if (score <= 80) return { type: 'Medium Risk', color: '#dc2626', bg: 'rgba(220,38,38,.08)' };
  return { type: 'High Risk', color: '#dc2626', bg: 'rgba(220,38,38,.08)' };
}

function wealthProtectionScore(existingCover, totalRequired, assets, familyExp, emergencyMonths, liabilities, income, stability, childrenCount, dependentParents) {
  const insuranceAdequacy = Math.min((existingCover / Math.max(totalRequired, 1)) * 30, 30);

  const monthlyExp = familyExp;
  const emergencyTarget = monthlyExp * Math.max(emergencyMonths, 6);
  const emergencyFund = Math.min((assets / Math.max(emergencyTarget, 1)) * 20, 20);

  const debtRatio = liabilities / Math.max(income, 1);
  const debtBurden = clamp(20 - debtRatio * 6, 0, 20);

  let dependents = 0;
  if (childrenCount > 0) dependents += Math.min(childrenCount * 4, 10);
  if (dependentParents === 'yes') dependents += 5;
  const dependentCoverage = clamp(dependents, 0, 15);

  const stabilityScore = { stable: 15, moderate: 10, volatile: 5 }[stability] || 10;

  return Math.round(insuranceAdequacy + emergencyFund + debtBurden + dependentCoverage + stabilityScore);
}

function protectionLabel(score) {
  if (score >= 80) return { label: 'Highly Protected', color: '#0066cc' };
  if (score >= 60) return { label: 'Moderately Protected', color: '#0066cc' };
  if (score >= 40) return { label: 'Vulnerable', color: '#dc2626' };
  return { label: 'Financially Exposed', color: '#dc2626' };
}

function productRecommendation(age, riskScore, childrenCount, marital, liabilities, totalRequired) {
  const products = [];

  if (age < 40 && totalRequired > 0) {
    products.push('Term Insurance (Pure Protection)');
  } else if (age >= 40 && age < 55) {
    products.push('Term Plan with Critical Illness Rider');
  } else {
    products.push('Term Plan + Annuity Combo');
  }

  if (liabilities > 2000000) {
    products.push('Loan Protector Rider');
  }

  if (childrenCount > 0 && age < 50) {
    products.push('Child Education / Marriage Benefit Rider');
  }

  if (riskScore > 60) {
    products.push('Accidental Death Benefit Rider');
  }

  if (marital === 'married') {
    products.push('Spouse Term Rider');
  }

  return products;
}

function emergencyScenario(assets, existingCover, liabilities, familyExp) {
  const immediateLiquidity = assets + existingCover - liabilities;
  const survivalMonths = immediateLiquidity / Math.max(familyExp, 1);
  return { immediateLiquidity, survivalMonths };
}

/* ===== Validation ===== */
function validateInputs() {
  const age = Number($('age').value);
  const income = Number($('income').value);
  const retireAge = Number($('retireAge').value);
  const growth = Number($('growth').value);
  const inflation = Number($('inflation').value);
  const personalExp = Number($('personalExp').value);
  const assets = Number($('assets').value);
  const existingCover = Number($('existingCover').value);
  const spouseIncome = Number($('spouseIncome').value);
  const childrenCount = Number($('childrenCount').value);
  const youngestChildAge = Number($('youngestChildAge').value);
  const familyExp = Number($('familyExp').value);
  const homeLoan = Number($('homeLoan').value);
  const personalLoan = Number($('personalLoan').value);
  const carLoan = Number($('carLoan').value);
  const otherLoan = Number($('otherLoan').value);
  const eduGoal = Number($('eduGoal').value);
  const marriageGoal = Number($('marriageGoal').value);
  const spouseRetireGoal = Number($('spouseRetireGoal').value);
  const emergencyMonths = Number($('emergencyMonths').value);

  if (!Number.isFinite(age) || age < 18 || age > 100) {
    showToast("Please enter a valid age (18-100)", "error");
    return false;
  }
  if (!Number.isFinite(income) || income < 0) {
    showToast("Please enter a valid annual income", "error");
    return false;
  }
  if (!Number.isFinite(retireAge) || retireAge < 40 || retireAge > 80) {
    showToast("Please enter a valid retirement age (40-80)", "error");
    return false;
  }
  if (retireAge <= age) {
    showToast("Retirement age must be greater than current age", "error");
    return false;
  }
  if (!Number.isFinite(growth) || growth < 0 || growth > 30) {
    showToast("Please enter a valid income growth rate (0-30%)", "error");
    return false;
  }
  if (!Number.isFinite(inflation) || inflation < 0 || inflation > 30) {
    showToast("Please enter a valid inflation rate (0-30%)", "error");
    return false;
  }
  if (!Number.isFinite(personalExp) || personalExp < 0) {
    showToast("Please enter valid personal expenses", "error");
    return false;
  }
  if (!Number.isFinite(assets) || assets < 0) {
    showToast("Please enter valid existing assets", "error");
    return false;
  }
  if (!Number.isFinite(existingCover) || existingCover < 0) {
    showToast("Please enter valid existing life cover", "error");
    return false;
  }
  if (!Number.isFinite(spouseIncome) || spouseIncome < 0) {
    showToast("Please enter valid spouse income", "error");
    return false;
  }
  if (!Number.isFinite(childrenCount) || childrenCount < 0 || childrenCount > 20) {
    showToast("Please enter valid number of children (0-20)", "error");
    return false;
  }
  if (!Number.isFinite(youngestChildAge) || youngestChildAge < 0 || youngestChildAge > 50) {
    showToast("Please enter valid youngest child age (0-50)", "error");
    return false;
  }
  if (!Number.isFinite(familyExp) || familyExp < 0) {
    showToast("Please enter valid monthly family expenses", "error");
    return false;
  }
  if (!Number.isFinite(homeLoan) || homeLoan < 0) {
    showToast("Please enter valid home loan amount", "error");
    return false;
  }
  if (!Number.isFinite(personalLoan) || personalLoan < 0) {
    showToast("Please enter valid personal loan amount", "error");
    return false;
  }
  if (!Number.isFinite(carLoan) || carLoan < 0) {
    showToast("Please enter valid car loan amount", "error");
    return false;
  }
  if (!Number.isFinite(otherLoan) || otherLoan < 0) {
    showToast("Please enter valid other loan amount", "error");
    return false;
  }
  if (!Number.isFinite(eduGoal) || eduGoal < 0) {
    showToast("Please enter valid education goal amount", "error");
    return false;
  }
  if (!Number.isFinite(marriageGoal) || marriageGoal < 0) {
    showToast("Please enter valid marriage goal amount", "error");
    return false;
  }
  if (!Number.isFinite(spouseRetireGoal) || spouseRetireGoal < 0) {
    showToast("Please enter valid spouse retirement goal", "error");
    return false;
  }
  if (!Number.isFinite(emergencyMonths) || emergencyMonths < 0 || emergencyMonths > 60) {
    showToast("Please enter valid emergency corpus months (0-60)", "error");
    return false;
  }
  return true;
}

/* ===== Render ===== */

function render() {
  const age = Number($('age').value);
  const income = Number($('income').value);
  const retireAge = Number($('retireAge').value);
  const growth = Number($('growth').value);
  const inflation = Number($('inflation').value);
  const personalExp = Number($('personalExp').value);
  const assets = Number($('assets').value);
  const existingCover = Number($('existingCover').value);

  const marital = $('marital').value;
  const spouseIncome = Number($('spouseIncome').value);
  const childrenCount = Number($('childrenCount').value);
  const youngestChildAge = Number($('youngestChildAge').value);
  const dependentParents = $('dependentParents').value;
  const familyExp = Number($('familyExp').value);

  const homeLoan = Number($('homeLoan').value);
  const personalLoan = Number($('personalLoan').value);
  const carLoan = Number($('carLoan').value);
  const otherLoan = Number($('otherLoan').value);

  const eduGoal = Number($('eduGoal').value);
  const marriageGoal = Number($('marriageGoal').value);
  const spouseRetireGoal = Number($('spouseRetireGoal').value);
  const emergencyMonths = Number($('emergencyMonths').value);

  const smoking = $('smoking').value;
  const health = $('health').value;
  const profession = $('profession').value;
  const stability = $('stability').value;

  const discount = inflation + 3;

  const hlv = computeHLV(age, retireAge, income, personalExp, growth, inflation, discount);
  const incomeReplace = computeIncomeReplacement(age, familyExp, spouseIncome, youngestChildAge, inflation, discount, marital);
  const goalProtect = computeGoalProtection(age, retireAge, childrenCount, youngestChildAge, eduGoal, marriageGoal, spouseRetireGoal, marital, inflation);
  const liabilities = computeLiabilities(homeLoan, personalLoan, carLoan, otherLoan);

  // Core cover = maximum of HLV or Income Replacement (they overlap in purpose)
  const coreCover = Math.max(hlv, incomeReplace);

  // Total required = core cover + liabilities + goals + emergency corpus - existing assets
  const emergencyCorpus = familyExp * emergencyMonths;
  const totalRequired = Math.round(coreCover + liabilities + goalProtect + emergencyCorpus - assets);
  const finalRequired = Math.max(totalRequired, 0);

  const gap = Math.max(0, finalRequired - existingCover);

  const riskScore = computeRiskScore(smoking, health, profession, stability, liabilities, income);
  const riskProfile = classifyRisk(riskScore);

  const wps = wealthProtectionScore(existingCover, finalRequired, assets, familyExp, emergencyMonths, liabilities, income, stability, childrenCount, dependentParents);
  const wpsLabel = protectionLabel(wps);

  const products = productRecommendation(age, riskScore, childrenCount, marital, liabilities, finalRequired);

  const emergency = emergencyScenario(assets, existingCover, liabilities, familyExp);

  const el = $('results');
  el.innerHTML = '';

  // Build results
  const blocks = [
    {
      title: 'Human Life Value (HLV)',
      items: [
        { k: 'Discount Rate', v: `${discount.toFixed(1)}% p.a.` },
        { k: 'HLV Estimate', v: `₹${fmtINR(hlv)}`, highlight: true },
      ]
    },
    {
      title: 'Income Replacement Need',
      items: [
        { k: 'Monthly Family Net Need', v: `₹${fmtINR(Math.max(0, familyExp - spouseIncome / 12))}` },
        { k: 'Years of Support', v: marital === 'single' ? '5 years (basic)' : `${Math.max(25 - youngestChildAge, 60 - age, 10)} years` },
        { k: 'Income Replacement PV', v: `₹${fmtINR(incomeReplace)}`, highlight: true },
      ]
    },
    {
      title: 'Liability & Goal Protection',
      items: [
        { k: 'Total Liabilities', v: `₹${fmtINR(liabilities)}`, danger: liabilities > income * 2 },
        { k: 'Goal Protection (PV)', v: `₹${fmtINR(goalProtect)}` },
        { k: 'Emergency Corpus Need', v: `₹${fmtINR(emergencyCorpus)}` },
      ]
    },
    {
      title: 'Insurance Gap Analysis',
      items: [
        { k: 'Total Required Cover', v: `₹${fmtINR(finalRequired)}`, highlight: true },
        { k: 'Existing Cover', v: `₹${fmtINR(existingCover)}` },
        { k: 'Protection Gap', v: `₹${fmtINR(gap)}`, danger: gap > 0 },
        { k: 'Existing Assets Offset', v: `₹${fmtINR(assets)}` },
      ]
    },
  ];

  blocks.forEach((blk, idx) => {
    const div = document.createElement('div');
    div.className = 'result-block';
    div.style.animationDelay = `${idx * 120}ms`;
    div.innerHTML = `
      <div class="result-title">${escapeHtml(blk.title)}</div>
      <div class="kv">
        ${blk.items.map(it => `
          <div class="item">
            <div class="k">${escapeHtml(it.k)}</div>
            <div class="v ${it.highlight ? 'highlight' : ''} ${it.danger ? 'danger-text' : ''}" data-animate="${it.v.startsWith('₹') ? it.v.replace(/[₹,]/g, '') : ''}">${escapeHtml(it.v)}</div>
          </div>
        `).join('')}
      </div>
    `;
    el.appendChild(div);
  });

  // Risk & Score block
  const rs = document.createElement('div');
  rs.className = 'result-block';
  rs.style.animationDelay = `${blocks.length * 120}ms`;
  rs.innerHTML = `
    <div class="result-title">Risk Profile & Wealth Protection Score</div>
    <div class="kv">
      <div class="item">
        <div class="k">Risk Classification</div>
        <div class="v">
          <span class="risk-badge" style="color:${riskProfile.color};background:${riskProfile.bg};border-color:${riskProfile.color}30">${riskProfile.type}</span>
        </div>
      </div>
      <div class="item">
        <div class="k">Risk Score</div>
        <div class="v">${riskScore} / 150</div>
      </div>
      <div class="item">
        <div class="k">Wealth Protection Score</div>
        <div class="v" style="color:${wpsLabel.color};font-weight:900">${wps} / 100 — ${wpsLabel.label}</div>
      </div>
      <div class="item">
        <div class="k">Insurance Adequacy</div>
        <div class="v">${(existingCover / Math.max(finalRequired, 1) * 100).toFixed(0)}%</div>
      </div>
    </div>
    <div class="progress" style="margin-top:10px" title="Protection Score">
      <span style="width:0%;background:linear-gradient(90deg, ${wpsLabel.color}, ${wpsLabel.color}80)" data-target="${wps}"></span>
    </div>
  `;
  el.appendChild(rs);

  // Product recommendation
  const prod = document.createElement('div');
  prod.className = 'result-block';
  prod.style.animationDelay = `${(blocks.length + 1) * 120}ms`;
  prod.innerHTML = `
    <div class="result-title">Recommended Products</div>
    <div class="product-list">
      ${products.map((p, i) => `
        <div class="product-item">
          <span class="product-num">${i + 1}</span>
          <span class="product-name">${escapeHtml(p)}</span>
        </div>
      `).join('')}
    </div>
  `;
  el.appendChild(prod);

  // Emergency scenario
  const em = document.createElement('div');
  em.className = 'result-block';
  em.style.animationDelay = `${(blocks.length + 2) * 120}ms`;
  const survColor = emergency.survivalMonths >= 24 ? '#0066cc' : emergency.survivalMonths >= 12 ? '#dc2626' : '#dc2626';
  em.innerHTML = `
    <div class="result-title">Emergency Death Scenario</div>
    <div class="kv">
      <div class="item">
        <div class="k">Immediate Liquidity (Assets + Cover - Loans)</div>
        <div class="v highlight" data-animate="${emergency.immediateLiquidity}">₹${fmtINR(emergency.immediateLiquidity)}</div>
      </div>
      <div class="item">
        <div class="k">Family Survival Duration</div>
        <div class="v" style="color:${survColor};font-weight:900">${emergency.survivalMonths.toFixed(1)} months</div>
      </div>
      <div class="item">
        <div class="k">Monthly Family Burn</div>
        <div class="v" data-animate="${familyExp}">₹${fmtINR(familyExp)}</div>
      </div>
      <div class="item">
        <div class="k">Goal Achievement Probability</div>
        <div class="v">${((existingCover + assets) / Math.max(finalRequired, 1) * 100).toFixed(0)}%</div>
      </div>
    </div>
    <div class="progress" style="margin-top:10px" title="Goal achievement probability">
      <span style="width:0%;background:linear-gradient(90deg, ${survColor}, ${survColor}80)" data-target="${clamp((existingCover + assets) / Math.max(finalRequired, 1) * 100, 0, 100).toFixed(0)}"></span>
    </div>
    <div class="scenario-insight" style="margin-top:10px">
      ${emergency.survivalMonths < 12
        ? '<b style="color:#dc2626">Critical:</b> Family survival is under 1 year. Immediate additional cover strongly recommended.'
        : emergency.survivalMonths < 24
        ? '<b style="color:#dc2626">Warning:</b> Family can survive ~2 years. Consider bridging the gap for long-term security.'
        : '<b style="color:#0066cc">Stable:</b> Family has reasonable liquidity buffer. Focus on goal protection.'}
    </div>
  `;
  el.appendChild(em);

  // Animate progress bars and count-up numbers
  requestAnimationFrame(() => {
    el.querySelectorAll('.progress > span[data-target]').forEach((bar) => {
      requestAnimationFrame(() => {
        bar.style.width = bar.getAttribute('data-target') + '%';
      });
    });
    // Count-up numeric values
    el.querySelectorAll('[data-animate]').forEach((node) => {
      const end = Number(node.getAttribute('data-animate'));
      if (Number.isFinite(end) && end !== 0) {
        node.innerHTML = '';
        const wrapper = document.createElement('span');
        node.appendChild(wrapper);
        animateValue(wrapper, 0, end, 1000);
      }
    });
  });

  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ===== Init ===== */
function init() {
  $('computeBtn').addEventListener('click', () => {
    if (!validateInputs()) return;
    const btn = $('computeBtn');
    const original = btn.innerHTML;
    btn.innerHTML = `<span class="spinner"></span> Analyzing...`;
    btn.disabled = true;
    setTimeout(() => {
      render();
      btn.innerHTML = original;
      btn.disabled = false;
    }, 400);
  });

  initInteractive();
  initKeyboardShortcuts({
    'Ctrl+Enter': () => $('computeBtn').click(),
  });
}

init();
