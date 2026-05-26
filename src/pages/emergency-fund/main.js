import { escapeHtml, showToast, fmtINR } from '/src/shared/utils/index.js';
import { initInteractive, initKeyboardShortcuts } from '/src/shared/interactive.js';

const $ = (id) => document.getElementById(id);

function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

function animateValue(el, start, end, duration = 900, prefix = '', suffix = '') {
  if (!Number.isFinite(end)) { el.textContent = '—'; return; }
  const range = end - start;
  const startTime = performance.now();
  function tick(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = start + range * eased;
    el.textContent = prefix + (suffix ? current.toFixed(1) + suffix : fmtINR(current));
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ===== Validation ===== */
function validateInputs() {
  const salary = Number($('salary').value);
  const extraIncome = Number($('extraIncome').value);
  const tenure = Number($('tenure').value);
  const incomeSources = Number($('incomeSources').value);
  const expRent = Number($('expRent').value);
  const expFood = Number($('expFood').value);
  const expUtilities = Number($('expUtilities').value);
  const expHealth = Number($('expHealth').value);
  const expTransport = Number($('expTransport').value);
  const expInternet = Number($('expInternet').value);
  const expEducation = Number($('expEducation').value);
  const expDiscretionary = Number($('expDiscretionary').value);
  const savingsBank = Number($('savingsBank').value);
  const liquidInvestments = Number($('liquidInvestments').value);
  const equityInvestments = Number($('equityInvestments').value);
  const realEstate = Number($('realEstate').value);
  const retirementAssets = Number($('retirementAssets').value);
  const savingsRate = Number($('savingsRate').value);
  const emiHome = Number($('emiHome').value);
  const emiPersonal = Number($('emiPersonal').value);
  const emiCar = Number($('emiCar').value);
  const ccOutstanding = Number($('ccOutstanding').value);
  const emiOther = Number($('emiOther').value);
  const totalLoanOutstanding = Number($('totalLoanOutstanding').value);
  const healthInsurance = Number($('healthInsurance').value);
  const lifeInsurance = Number($('lifeInsurance').value);
  const accidentCover = Number($('accidentCover').value);
  const children = Number($('children').value);
  const dependentParents = Number($('dependentParents').value);
  const familyExpenses = Number($('familyExpenses').value);
  const inflation = Number($('inflation').value);
  const horizon = Number($('horizon').value);
  const targetMonths = Number($('targetMonths').value);

  if (!Number.isFinite(salary) || salary < 0) {
    showToast("Please enter a valid monthly salary", "error");
    return false;
  }
  if (!Number.isFinite(extraIncome) || extraIncome < 0) {
    showToast("Please enter valid extra income", "error");
    return false;
  }
  if (!Number.isFinite(tenure) || tenure < 0 || tenure > 50) {
    showToast("Please enter valid job tenure (0-50 years)", "error");
    return false;
  }
  if (!Number.isFinite(incomeSources) || incomeSources < 1 || incomeSources > 10) {
    showToast("Please enter valid number of income sources (1-10)", "error");
    return false;
  }
  if (!Number.isFinite(expRent) || expRent < 0) {
    showToast("Please enter valid rent expense", "error");
    return false;
  }
  if (!Number.isFinite(expFood) || expFood < 0) {
    showToast("Please enter valid food expense", "error");
    return false;
  }
  if (!Number.isFinite(expUtilities) || expUtilities < 0) {
    showToast("Please enter valid utilities expense", "error");
    return false;
  }
  if (!Number.isFinite(expHealth) || expHealth < 0) {
    showToast("Please enter valid health expense", "error");
    return false;
  }
  if (!Number.isFinite(expTransport) || expTransport < 0) {
    showToast("Please enter valid transport expense", "error");
    return false;
  }
  if (!Number.isFinite(expInternet) || expInternet < 0) {
    showToast("Please enter valid internet expense", "error");
    return false;
  }
  if (!Number.isFinite(expEducation) || expEducation < 0) {
    showToast("Please enter valid education expense", "error");
    return false;
  }
  if (!Number.isFinite(expDiscretionary) || expDiscretionary < 0) {
    showToast("Please enter valid discretionary expense", "error");
    return false;
  }
  if (!Number.isFinite(savingsBank) || savingsBank < 0) {
    showToast("Please enter valid bank savings", "error");
    return false;
  }
  if (!Number.isFinite(liquidInvestments) || liquidInvestments < 0) {
    showToast("Please enter valid liquid investments", "error");
    return false;
  }
  if (!Number.isFinite(equityInvestments) || equityInvestments < 0) {
    showToast("Please enter valid equity investments", "error");
    return false;
  }
  if (!Number.isFinite(realEstate) || realEstate < 0) {
    showToast("Please enter valid real estate value", "error");
    return false;
  }
  if (!Number.isFinite(retirementAssets) || retirementAssets < 0) {
    showToast("Please enter valid retirement assets", "error");
    return false;
  }
  if (!Number.isFinite(savingsRate) || savingsRate < 0 || savingsRate > 100) {
    showToast("Please enter valid savings rate (0-100%)", "error");
    return false;
  }
  if (!Number.isFinite(emiHome) || emiHome < 0) {
    showToast("Please enter valid home loan EMI", "error");
    return false;
  }
  if (!Number.isFinite(emiPersonal) || emiPersonal < 0) {
    showToast("Please enter valid personal loan EMI", "error");
    return false;
  }
  if (!Number.isFinite(emiCar) || emiCar < 0) {
    showToast("Please enter valid car loan EMI", "error");
    return false;
  }
  if (!Number.isFinite(ccOutstanding) || ccOutstanding < 0) {
    showToast("Please enter valid credit card outstanding", "error");
    return false;
  }
  if (!Number.isFinite(emiOther) || emiOther < 0) {
    showToast("Please enter valid other loan EMI", "error");
    return false;
  }
  if (!Number.isFinite(totalLoanOutstanding) || totalLoanOutstanding < 0) {
    showToast("Please enter valid total loan outstanding", "error");
    return false;
  }
  if (!Number.isFinite(healthInsurance) || healthInsurance < 0) {
    showToast("Please enter valid health insurance cover", "error");
    return false;
  }
  if (!Number.isFinite(lifeInsurance) || lifeInsurance < 0) {
    showToast("Please enter valid life insurance cover", "error");
    return false;
  }
  if (!Number.isFinite(accidentCover) || accidentCover < 0) {
    showToast("Please enter valid accident cover", "error");
    return false;
  }
  if (!Number.isFinite(children) || children < 0 || children > 20) {
    showToast("Please enter valid number of children (0-20)", "error");
    return false;
  }
  if (!Number.isFinite(dependentParents) || dependentParents < 0 || dependentParents > 10) {
    showToast("Please enter valid number of dependent parents (0-10)", "error");
    return false;
  }
  if (!Number.isFinite(familyExpenses) || familyExpenses < 0) {
    showToast("Please enter valid family expenses", "error");
    return false;
  }
  if (!Number.isFinite(inflation) || inflation < 0 || inflation > 30) {
    showToast("Please enter valid inflation rate (0-30%)", "error");
    return false;
  }
  if (!Number.isFinite(horizon) || horizon < 1 || horizon > 30) {
    showToast("Please enter valid horizon years (1-30)", "error");
    return false;
  }
  if (!Number.isFinite(targetMonths) || targetMonths < 1 || targetMonths > 60) {
    showToast("Please enter valid target months (1-60)", "error");
    return false;
  }
  return true;
}

/* ===== Core Data Collection ===== */
function gatherInputs() {
  return {
    salary: Number($('salary').value),
    extraIncome: Number($('extraIncome').value),
    profession: $('profession').value,
    incomeStability: $('incomeStability').value,
    tenure: Number($('tenure').value),
    incomeSources: Number($('incomeSources').value),
    expRent: Number($('expRent').value),
    expFood: Number($('expFood').value),
    expUtilities: Number($('expUtilities').value),
    expHealth: Number($('expHealth').value),
    expTransport: Number($('expTransport').value),
    expInternet: Number($('expInternet').value),
    expEducation: Number($('expEducation').value),
    expDiscretionary: Number($('expDiscretionary').value),
    savingsBank: Number($('savingsBank').value),
    liquidInvestments: Number($('liquidInvestments').value),
    equityInvestments: Number($('equityInvestments').value),
    realEstate: Number($('realEstate').value),
    retirementAssets: Number($('retirementAssets').value),
    savingsRate: Number($('savingsRate').value),
    emiHome: Number($('emiHome').value),
    emiPersonal: Number($('emiPersonal').value),
    emiCar: Number($('emiCar').value),
    ccOutstanding: Number($('ccOutstanding').value),
    emiOther: Number($('emiOther').value),
    totalLoanOutstanding: Number($('totalLoanOutstanding').value),
    healthInsurance: Number($('healthInsurance').value),
    lifeInsurance: Number($('lifeInsurance').value),
    accidentCover: Number($('accidentCover').value),
    spouseWorking: $('spouseWorking').value,
    children: Number($('children').value),
    dependentParents: Number($('dependentParents').value),
    specialNeeds: $('specialNeeds').value,
    familyExpenses: Number($('familyExpenses').value),
    spendingDiscipline: $('spendingDiscipline').value,
    lifestyleInflation: $('lifestyleInflation').value,
    withdrawalHistory: $('withdrawalHistory').value,
    inflation: Number($('inflation').value),
    horizon: Number($('horizon').value),
    targetMonths: Number($('targetMonths').value),
  };
}

/* ===== Expense Classification ===== */
function classifyExpenses(d) {
  const essential = d.expRent + d.expFood + d.expUtilities + d.expHealth + d.expTransport;
  const semiEssential = d.expInternet + d.expEducation;
  const discretionary = d.expDiscretionary;
  const total = essential + semiEssential + discretionary;
  return { essential, semiEssential, discretionary, total };
}

/* ===== Liquidity Engine ===== */
function liquidityEngine(d) {
  const assets = [
    { name: 'Savings Account', value: d.savingsBank, liquidity: 'High', liqScore: 5 },
    { name: 'Fixed Deposits / Liquid Funds', value: d.liquidInvestments, liquidity: 'Medium-high', liqScore: 4 },
    { name: 'Stocks / Mutual Funds', value: d.equityInvestments, liquidity: 'Medium', liqScore: 3 },
    { name: 'Real Estate', value: d.realEstate, liquidity: 'Low', liqScore: 2 },
    { name: 'PPF / EPF / NPS', value: d.retirementAssets, liquidity: 'Very low', liqScore: 1 },
  ];
  const immediateLiquidity = d.savingsBank + d.liquidInvestments;
  const mediumLiquidity = immediateLiquidity + d.equityInvestments * 0.7; // 30% haircut for market risk
  const totalAssets = assets.reduce((s, a) => s + a.value, 0);
  const accessibilityScore = totalAssets > 0
    ? Math.round(assets.reduce((s, a) => s + (a.value / totalAssets) * a.liqScore * 20, 0))
    : 0;
  return { assets, immediateLiquidity, mediumLiquidity, totalAssets, accessibilityScore };
}

/* ===== Emergency Corpus & Survival ===== */
function emergencyAnalysis(d, essentialExp) {
  const liquid = liquidityEngine(d);
  const emergencyCorpus = liquid.immediateLiquidity + d.equityInvestments * 0.5; // equity at 50% for emergency
  const survivalMonths = essentialExp > 0 ? emergencyCorpus / essentialExp : 999;
  const totalSurvivalMonths = liquid.totalAssets / Math.max(essentialExp, 1);
  return { emergencyCorpus, survivalMonths, totalSurvivalMonths, liquid };
}

/* ===== Dynamic Recommendation ===== */
function recommendedFundMonths(d) {
  const map = { govt: 4, it: 7, freelance: 15, business: 20 };
  let base = map[d.profession] || 6;
  if (d.incomeStability === 'volatile') base += 4;
  if (d.incomeStability === 'moderate') base += 2;
  if (d.incomeSources > 1) base -= 2;
  if (d.children > 2) base += 2;
  if (d.dependentParents > 0) base += 1;
  if (d.specialNeeds === 'yes') base += 3;
  if (d.spouseWorking === 'no') base += 2;
  return Math.max(3, base);
}

/* ===== Income Stability ===== */
function incomeStabilityAnalysis(d) {
  const totalIncome = d.salary + d.extraIncome;
  const volatilityRatio = d.extraIncome / Math.max(totalIncome, 1);
  let stabilityClass = 'Stable';
  if (d.incomeStability === 'volatile' || volatilityRatio > 0.4 || d.profession === 'freelance' || d.profession === 'business') {
    stabilityClass = 'Highly Unstable';
  } else if (d.incomeStability === 'moderate' || volatilityRatio > 0.15 || d.profession === 'it') {
    stabilityClass = 'Moderately Volatile';
  }
  const diversificationScore = Math.min(d.incomeSources * 15, 30);
  const tenureScore = Math.min(d.tenure * 3, 20);
  return { totalIncome, volatilityRatio, stabilityClass, diversificationScore, tenureScore };
}

/* ===== Cash Flow ===== */
function cashFlowAnalysis(d, totalExp, essentialExp) {
  const totalIncome = d.salary + d.extraIncome;
  const totalEMI = d.emiHome + d.emiPersonal + d.emiCar + d.emiOther;
  const fixedObligations = essentialExp + totalEMI;
  const surplus = totalIncome - totalExp - totalEMI;
  const savingsRateActual = totalIncome > 0 ? ((totalIncome - totalExp - totalEMI) / totalIncome) * 100 : 0;
  const emiRatio = totalIncome > 0 ? (totalEMI / totalIncome) * 100 : 0;
  let status = 'Stable';
  if (surplus < 0) status = 'Critical';
  else if (surplus < totalIncome * 0.1) status = 'Moderate';
  return { totalIncome, totalEMI, fixedObligations, surplus, savingsRateActual, emiRatio, status };
}

/* ===== Debt Analysis ===== */
function debtAnalysis(d, totalIncome) {
  const totalEMI = d.emiHome + d.emiPersonal + d.emiCar + d.emiOther;
  const emiRatio = totalIncome > 0 ? (totalEMI / totalIncome) * 100 : 0;
  const ccRatio = totalIncome > 0 ? (d.ccOutstanding / totalIncome) * 100 : 0;
  let risk = 'Healthy';
  if (emiRatio > 45 || ccRatio > 20) risk = 'Risky';
  else if (emiRatio > 25 || ccRatio > 10) risk = 'Moderate';
  const debtBurdenScore = emiRatio < 25 ? 15 : emiRatio < 45 ? 8 : 2;
  return { totalEMI, emiRatio, ccRatio, risk, debtBurdenScore };
}

/* ===== Insurance Adequacy ===== */
function insuranceAnalysis(d, totalIncome) {
  const annualIncome = totalIncome * 12;
  const healthNeed = Math.max(1000000, annualIncome * 0.5);
  const lifeNeed = Math.max(annualIncome * 10, 5000000);
  const accidentNeed = annualIncome * 2;
  const healthGap = Math.max(0, healthNeed - d.healthInsurance);
  const lifeGap = Math.max(0, lifeNeed - d.lifeInsurance);
  const accidentGap = Math.max(0, accidentNeed - d.accidentCover);
  const healthPct = Math.min((d.healthInsurance / healthNeed) * 100, 100);
  const lifePct = Math.min((d.lifeInsurance / lifeNeed) * 100, 100);
  const accidentPct = Math.min((d.accidentCover / accidentNeed) * 100, 100);
  const avgPct = (healthPct + lifePct + accidentPct) / 3;
  return { healthNeed, lifeNeed, accidentNeed, healthGap, lifeGap, accidentGap, healthPct, lifePct, accidentPct, avgPct };
}

/* ===== Family Dependency ===== */
function dependencyAnalysis(d) {
  const burden = d.children * 8 + d.dependentParents * 6 + (d.specialNeeds === 'yes' ? 15 : 0) + (d.spouseWorking === 'no' ? 10 : 0);
  const maxBurden = 80;
  const dependencyScore = Math.max(0, 10 - (burden / maxBurden) * 10);
  return { burden, dependencyScore };
}

/* ===== Behavioral Layer ===== */
function behavioralScore(d) {
  let score = 50;
  score += { strict: 20, moderate: 10, loose: 0 }[d.spendingDiscipline] || 10;
  score += { low: 15, moderate: 8, high: 0 }[d.lifestyleInflation] || 8;
  score += { none: 15, rare: 8, frequent: 0 }[d.withdrawalHistory] || 8;
  return clamp(score, 0, 100);
}

/* ===== Resilience Scoring Engine ===== */
function resilienceScore(d, survivalMonths, recommendedMonths, emiRatio, insuranceAvg, dependencyScore, cashFlow, behavioral) {
  const emergencyScore = Math.min((survivalMonths / recommendedMonths) * 25, 25);
  const jobStabilityScore = {
    govt: 20, it: 16, freelance: 10, business: 8
  }[d.profession] || 12;
  const stabilityAdj = { stable: 0, moderate: -2, volatile: -5 }[d.incomeStability] || 0;
  const finalJobScore = clamp(jobStabilityScore + stabilityAdj, 0, 20);
  const insuranceScore = Math.min((insuranceAvg / 100) * 20, 20);
  const emiScore = emiRatio < 25 ? 15 : emiRatio < 45 ? 8 : 2;
  const depScore = dependencyScore;
  const incomeVolScore = { stable: 10, moderate: 6, volatile: 2 }[d.incomeStability] || 6;
  const behaviorBonus = behavioral > 70 ? 2 : behavioral > 40 ? 0 : -3;
  const total = clamp(emergencyScore + finalJobScore + insuranceScore + emiScore + depScore + incomeVolScore + behaviorBonus, 0, 100);
  return { total, emergencyScore, finalJobScore, insuranceScore, emiScore, depScore, incomeVolScore, behaviorBonus };
}

/* ===== Inflation Projection ===== */
function inflationProjection(d, essentialExp) {
  const currentCorpus = d.savingsBank + d.liquidInvestments + d.equityInvestments * 0.5;
  const projected = [];
  for (let y = 1; y <= d.horizon; y++) {
    const fvExp = essentialExp * Math.pow(1 + d.inflation / 100, y);
    const fvCorpus = currentCorpus * Math.pow(1 + 0.04, y); // assume 4% return on emergency fund
    projected.push({ year: y, expense: fvExp, corpus: fvCorpus, months: fvCorpus / fvExp });
  }
  return projected;
}

/* ===== Stress Testing ===== */
function stressTests(d, essentialExp, totalExp, totalIncome, emergencyCorpus) {
  const tests = [];
  const totalEMI = d.emiHome + d.emiPersonal + d.emiCar + d.emiOther;
  const baseBurn = essentialExp + totalEMI;

  // Job loss
  const jobLossMonths = emergencyCorpus / baseBurn;
  tests.push({ name: 'Job Loss (Zero Income)', months: jobLossMonths, desc: 'No salary until new job' });

  // 30% salary cut
  const cutIncome = totalIncome * 0.7;
  const cutBurn = Math.max(0, baseBurn + (totalExp - essentialExp) * 0.7 - cutIncome);
  const cutMonths = cutBurn > 0 ? emergencyCorpus / cutBurn : 999;
  tests.push({ name: '30% Salary Cut', months: cutMonths, desc: 'Reduced income, trimmed discretionary' });

  // Medical emergency
  const medicalCost = 300000 + (10000 * 6); // 3L one-time + 10k extra for 6 months
  const postMedical = Math.max(0, emergencyCorpus - medicalCost);
  const medicalMonths = postMedical / baseBurn;
  tests.push({ name: 'Medical Emergency (₹3L)', months: medicalMonths, desc: 'One-time hospitalization + 6mo recovery' });

  // Recession
  const recIncome = totalIncome * 0.6;
  const recExtraBurn = baseBurn + (totalExp - essentialExp) * 0.5 - recIncome;
  const recMonths = recExtraBurn > 0 ? emergencyCorpus / recExtraBurn : 999;
  tests.push({ name: 'Recession (40% Cut)', months: recMonths, desc: 'Severe downturn, job search extended' });

  // Inflation spike
  const spikeBurn = baseBurn * 1.15;
  const spikeMonths = emergencyCorpus / spikeBurn;
  tests.push({ name: 'Inflation Spike (+15%)', months: spikeMonths, desc: 'Sudden cost-of-living increase' });

  // Combined shock
  const comboCorpus = Math.max(0, emergencyCorpus - 200000);
  const comboIncome = totalIncome * 0.5;
  const comboBurn = baseBurn * 1.1 + (totalExp - essentialExp) * 0.5 - comboIncome;
  const comboMonths = comboBurn > 0 ? comboCorpus / comboBurn : 999;
  tests.push({ name: 'Combined Shock', months: comboMonths, desc: 'Income loss + medical + inflation together' });

  return tests;
}

/* ===== Vulnerability Detection ===== */
function vulnerabilityAlerts(d, survivalMonths, emiRatio, insuranceAvg, cashFlowStatus, liquidity) {
  const alerts = [];
  if (survivalMonths < 3) alerts.push({ type: 'critical', text: 'Emergency fund covers less than 3 months. Critical liquidity risk.' });
  if (survivalMonths < 6 && survivalMonths >= 3) alerts.push({ type: 'warning', text: 'Emergency fund below 6 months. Build buffer urgently.' });
  if (emiRatio > 45) alerts.push({ type: 'critical', text: 'EMI burden exceeds 45% of income. Debt trap risk.' });
  if (emiRatio > 25 && emiRatio <= 45) alerts.push({ type: 'warning', text: 'EMI burden is elevated. Reduce discretionary spending.' });
  if (insuranceAvg < 50) alerts.push({ type: 'critical', text: 'Insurance coverage is inadequate. Medical emergencies can wipe out savings.' });
  if (d.incomeStability === 'volatile' && survivalMonths < 12) alerts.push({ type: 'warning', text: 'Volatile income with low emergency fund is a dangerous combination.' });
  if (cashFlowStatus === 'Critical') alerts.push({ type: 'critical', text: 'Negative monthly cash flow. Immediate intervention required.' });
  if (liquidity.accessibilityScore < 40) alerts.push({ type: 'warning', text: 'Low liquidity accessibility. Most wealth is locked in illiquid assets.' });
  if (d.ccOutstanding > d.salary * 0.5) alerts.push({ type: 'warning', text: 'High credit card dependency. Expensive debt erodes resilience.' });
  if (alerts.length === 0) alerts.push({ type: 'safe', text: 'No critical vulnerability flags detected. Continue monitoring.' });
  return alerts;
}

/* ===== Recommendations ===== */
function generateRecommendations(d, survivalMonths, recommendedMonths, essentialExp, emiRatio, insurance, liquidity, cashFlow, behavioral) {
  const recs = [];
  const gap = Math.max(0, recommendedMonths - survivalMonths);
  const gapAmount = gap * essentialExp;

  if (gapAmount > 0) recs.push(`Increase emergency fund by ₹${fmtINR(gapAmount)} to reach ${recommendedMonths} months coverage.`);
  if (d.ccOutstanding > 0) recs.push(`Clear credit card outstanding of ₹${fmtINR(d.ccOutstanding)} — it's the most expensive debt.`);
  if (emiRatio > 35) recs.push(`EMI ratio is ${emiRatio.toFixed(0)}%. Consider refinancing or pre-paying loans to reduce burden.`);
  if (insurance.healthGap > 0) recs.push(`Purchase/add health insurance by ₹${fmtINR(insurance.healthGap)} to avoid medical bankruptcy.`);
  if (insurance.lifeGap > 0) recs.push(`Increase life insurance cover by ₹${fmtINR(insurance.lifeGap)}.`);
  if (d.liquidInvestments < essentialExp * 3) recs.push(`Move 3 months expenses (₹${fmtINR(essentialExp * 3)}) into liquid funds for quick access.`);
  if (d.savingsBank < essentialExp) recs.push(`Keep at least 1 month expenses (₹${fmtINR(essentialExp)}) in savings account for immediate access.`);
  if (behavioral < 50) recs.push(`Improve spending discipline and reduce impulsive withdrawals to protect emergency corpus.`);
  if (d.lifestyleInflation === 'high') recs.push(`Lifestyle inflation is eroding savings capacity. Cap expense growth at inflation rate.`);
  if (cashFlow.savingsRateActual < 10) recs.push(`Current savings rate is ${cashFlow.savingsRateActual.toFixed(0)}%. Target at least 20% for resilience.`);
  if (d.incomeSources === 1 && d.profession === 'freelance') recs.push(`Diversify income streams. Freelancers should have at least 2 clients/sources.`);
  if (recs.length === 0) recs.push('Your financial resilience profile is strong. Maintain current discipline and review annually.');
  return recs;
}

/* ===== Anxiety Indicator ===== */
function anxietyIndicator(d, survivalMonths, emiRatio, liquidity, cashFlowStatus, insuranceAvg) {
  let probability = 0.5;
  if (survivalMonths >= 12) probability += 0.25;
  else if (survivalMonths >= 6) probability += 0.1;
  else probability -= 0.2;

  if (emiRatio < 25) probability += 0.1;
  else if (emiRatio > 45) probability -= 0.15;

  if (liquidity.accessibilityScore >= 60) probability += 0.1;
  else probability -= 0.1;

  if (cashFlowStatus === 'Stable') probability += 0.1;
  else if (cashFlowStatus === 'Critical') probability -= 0.2;

  if (insuranceAvg >= 70) probability += 0.1;
  else probability -= 0.1;

  if (d.incomeStability === 'stable') probability += 0.05;
  else if (d.incomeStability === 'volatile') probability -= 0.1;

  return clamp(Math.round(probability * 100), 0, 100);
}

/* ===== Goal Tracker ===== */
function goalTracker(d, survivalMonths, recommendedMonths, essentialExp) {
  const currentCorpus = d.savingsBank + d.liquidInvestments + d.equityInvestments * 0.5;
  const targetCorpus = essentialExp * recommendedMonths;
  const gap = Math.max(0, targetCorpus - currentCorpus);
  const monthlySave = (d.salary + d.extraIncome) * (d.savingsRate / 100);
  const monthsToGoal = monthlySave > 0 ? Math.ceil(gap / monthlySave) : 999;
  const progressPct = targetCorpus > 0 ? Math.min((currentCorpus / targetCorpus) * 100, 100) : 100;
  return { currentCorpus, targetCorpus, gap, monthlySave, monthsToGoal, progressPct };
}

/* ===== Render Helpers ===== */
function colorForMonths(m) {
  if (m < 3) return '#dc2626';
  if (m < 6) return '#dc2626';
  if (m < 12) return '#0066cc';
  return '#0066cc';
}

function scoreLabel(s) {
  if (s >= 85) return { label: 'Highly Resilient', color: '#0066cc', bg: 'rgba(0,102,204,.08)' };
  if (s >= 65) return { label: 'Moderately Safe', color: '#0066cc', bg: 'rgba(0,102,204,.08)' };
  if (s >= 40) return { label: 'Vulnerable', color: '#dc2626', bg: 'rgba(220,38,38,.08)' };
  return { label: 'Financially Fragile', color: '#dc2626', bg: 'rgba(220,38,38,.08)' };
}

/* ===== Main Render ===== */
function render() {
  const d = gatherInputs();
  const expenses = classifyExpenses(d);
  const income = incomeStabilityAnalysis(d);
  const cashFlow = cashFlowAnalysis(d, expenses.total, expenses.essential);
  const debt = debtAnalysis(d, income.totalIncome);
  const liquidity = liquidityEngine(d);
  const emergency = emergencyAnalysis(d, expenses.essential);
  const recommendedMonths = recommendedFundMonths(d);
  const insurance = insuranceAnalysis(d, income.totalIncome);
  const dependency = dependencyAnalysis(d);
  const behavioral = behavioralScore(d);
  const resilience = resilienceScore(d, emergency.survivalMonths, recommendedMonths, debt.emiRatio, insurance.avgPct, dependency.dependencyScore, cashFlow, behavioral);
  const projected = inflationProjection(d, expenses.essential);
  const stress = stressTests(d, expenses.essential, expenses.total, income.totalIncome, emergency.emergencyCorpus);
  const alerts = vulnerabilityAlerts(d, emergency.survivalMonths, debt.emiRatio, insurance.avgPct, cashFlow.status, liquidity);
  const recs = generateRecommendations(d, emergency.survivalMonths, recommendedMonths, expenses.essential, debt.emiRatio, insurance, liquidity, cashFlow, behavioral);
  const anxiety = anxietyIndicator(d, emergency.survivalMonths, debt.emiRatio, liquidity, cashFlow.status, insurance.avgPct);
  const tracker = goalTracker(d, emergency.survivalMonths, recommendedMonths, expenses.essential);
  const label = scoreLabel(resilience.total);

  const el = $('results');
  el.innerHTML = '';

  let idx = 0;
  function nextDelay() { return (idx++) * 120; }

  // Alerts
  const alertBlock = document.createElement('div');
  alertBlock.className = 'result-block';
  alertBlock.style.animationDelay = nextDelay() + 'ms';
  alertBlock.innerHTML = `
    <div class="result-title">Vulnerability Alerts</div>
    ${alerts.map(a => `
      <div class="alert-banner ${a.type}">${escapeHtml(a.text)}</div>
    `).join('')}
  `;
  el.appendChild(alertBlock);

  // Emergency Fund Sufficiency
  const suffBlock = document.createElement('div');
  suffBlock.className = 'result-block';
  suffBlock.style.animationDelay = nextDelay() + 'ms';
  suffBlock.innerHTML = `
    <div class="result-title">Emergency Fund Sufficiency</div>
    <div class="kv">
      <div class="item">
        <div class="k">Current Emergency Corpus</div>
        <div class="v highlight" data-animate="${emergency.emergencyCorpus}">₹${fmtINR(emergency.emergencyCorpus)}</div>
      </div>
      <div class="item">
        <div class="k">Monthly Essential Expenses</div>
        <div class="v" data-animate="${expenses.essential}">₹${fmtINR(expenses.essential)}</div>
      </div>
      <div class="item">
        <div class="k">Survival Months (Essential)</div>
        <div class="v" style="color:${colorForMonths(emergency.survivalMonths)};font-weight:900">${emergency.survivalMonths.toFixed(1)} months</div>
      </div>
      <div class="item">
        <div class="k">Recommended Months</div>
        <div class="v">${recommendedMonths} months</div>
      </div>
      <div class="item">
        <div class="k">Gap to Target</div>
        <div class="v ${tracker.gap > 0 ? 'danger-text' : 'success-text'}" data-animate="${tracker.gap}">₹${fmtINR(tracker.gap)}</div>
      </div>
      <div class="item">
        <div class="k">Status</div>
        <div class="v">
          <span class="risk-badge" style="color:${colorForMonths(emergency.survivalMonths)};background:${colorForMonths(emergency.survivalMonths)}12;border-color:${colorForMonths(emergency.survivalMonths)}30">
            ${emergency.survivalMonths < 3 ? 'High Risk' : emergency.survivalMonths < 6 ? 'Adequate' : 'Strong Resilience'}
          </span>
        </div>
      </div>
    </div>
    <div class="progress" style="margin-top:10px" title="Fund adequacy vs target">
      <span style="width:0%;background:linear-gradient(90deg, ${colorForMonths(emergency.survivalMonths)}, ${colorForMonths(emergency.survivalMonths)}80)" data-target="${Math.min((emergency.survivalMonths / recommendedMonths) * 100, 100).toFixed(0)}"></span>
    </div>
  `;
  el.appendChild(suffBlock);

  // Expense Classification
  const expBlock = document.createElement('div');
  expBlock.className = 'result-block';
  expBlock.style.animationDelay = nextDelay() + 'ms';
  expBlock.innerHTML = `
    <div class="result-title">Expense Classification</div>
    <div class="kv">
      <div class="item">
        <div class="k">Essential</div>
        <div class="v danger-text" data-animate="${expenses.essential}">₹${fmtINR(expenses.essential)}</div>
      </div>
      <div class="item">
        <div class="k">Semi-Essential</div>
        <div class="v" data-animate="${expenses.semiEssential}">₹${fmtINR(expenses.semiEssential)}</div>
      </div>
      <div class="item">
        <div class="k">Discretionary</div>
        <div class="v highlight" data-animate="${expenses.discretionary}">₹${fmtINR(expenses.discretionary)}</div>
      </div>
      <div class="item">
        <div class="k">Total Monthly</div>
        <div class="v" data-animate="${expenses.total}">₹${fmtINR(expenses.total)}</div>
      </div>
    </div>
    <div class="runway-bar" style="margin-top:10px">
      <div class="runway-segment" style="width:${(expenses.essential/expenses.total*100).toFixed(1)}%;background:#dc2626" data-label="Essential"></div>
      <div class="runway-segment" style="width:${(expenses.semiEssential/expenses.total*100).toFixed(1)}%;background:#dc2626" data-label="Semi"></div>
      <div class="runway-segment" style="width:${(expenses.discretionary/expenses.total*100).toFixed(1)}%;background:#0066cc" data-label="Discretionary"></div>
    </div>
  `;
  el.appendChild(expBlock);

  // Resilience Score with ring
  const resBlock = document.createElement('div');
  resBlock.className = 'result-block';
  resBlock.style.animationDelay = nextDelay() + 'ms';
  resBlock.innerHTML = `
    <div class="result-title">Financial Resilience Score</div>
    <div class="score-ring-wrap">
      <div class="score-ring" style="--ring-color:${label.color};--ring-pct:${resilience.total}%">
        <div class="score-ring-inner">
          <div class="score-ring-value" style="color:${label.color}">${resilience.total}</div>
          <div class="score-ring-label">${label.label}</div>
        </div>
      </div>
      <div class="kv" style="flex:1;min-width:220px">
        <div class="item"><div class="k">Emergency Savings (25%)</div><div class="v">${resilience.emergencyScore.toFixed(1)} / 25</div></div>
        <div class="item"><div class="k">Job Stability (20%)</div><div class="v">${resilience.finalJobScore.toFixed(1)} / 20</div></div>
        <div class="item"><div class="k">Insurance (20%)</div><div class="v">${resilience.insuranceScore.toFixed(1)} / 20</div></div>
        <div class="item"><div class="k">EMI Burden (15%)</div><div class="v">${resilience.emiScore.toFixed(1)} / 15</div></div>
        <div class="item"><div class="k">Dependents (10%)</div><div class="v">${resilience.depScore.toFixed(1)} / 10</div></div>
        <div class="item"><div class="k">Income Volatility (10%)</div><div class="v">${resilience.incomeVolScore.toFixed(1)} / 10</div></div>
      </div>
    </div>
  `;
  el.appendChild(resBlock);

  // Cash Flow & Debt
  const cashBlock = document.createElement('div');
  cashBlock.className = 'result-block';
  cashBlock.style.animationDelay = nextDelay() + 'ms';
  const cashColor = cashFlow.status === 'Stable' ? '#0066cc' : cashFlow.status === 'Moderate' ? '#dc2626' : '#dc2626';
  cashBlock.innerHTML = `
    <div class="result-title">Cash Flow &amp; Debt Analysis</div>
    <div class="kv">
      <div class="item"><div class="k">Monthly Surplus / Deficit</div><div class="v ${cashFlow.surplus < 0 ? 'danger-text' : 'success-text'}" data-animate="${cashFlow.surplus}">₹${fmtINR(cashFlow.surplus)}</div></div>
      <div class="item"><div class="k">Cash Flow Status</div><div class="v" style="color:${cashColor};font-weight:900">${cashFlow.status}</div></div>
      <div class="item"><div class="k">EMI-to-Income Ratio</div><div class="v ${debt.emiRatio > 45 ? 'danger-text' : debt.emiRatio > 25 ? 'highlight' : 'success-text'}">${debt.emiRatio.toFixed(1)}%</div></div>
      <div class="item"><div class="k">Debt Risk</div><div class="v"><span class="risk-badge" style="color:${debt.risk === 'Healthy' ? '#0066cc' : debt.risk === 'Moderate' ? '#dc2626' : '#dc2626'};background:${debt.risk === 'Healthy' ? 'rgba(0,102,204,.08)' : debt.risk === 'Moderate' ? 'rgba(220,38,38,.08)' : 'rgba(220,38,38,.08)'};border-color:${debt.risk === 'Healthy' ? '#0066cc30' : debt.risk === 'Moderate' ? '#dc262630' : '#dc262630'}">${debt.risk}</span></div></div>
      <div class="item"><div class="k">Actual Savings Rate</div><div class="v">${cashFlow.savingsRateActual.toFixed(1)}%</div></div>
      <div class="item"><div class="k">Fixed Obligations</div><div class="v" data-animate="${cashFlow.fixedObligations}">₹${fmtINR(cashFlow.fixedObligations)}</div></div>
    </div>
  `;
  el.appendChild(cashBlock);

  // Liquidity Classification
  const liqBlock = document.createElement('div');
  liqBlock.className = 'result-block';
  liqBlock.style.animationDelay = nextDelay() + 'ms';
  const liqColor = liquidity.accessibilityScore >= 60 ? '#0066cc' : liquidity.accessibilityScore >= 40 ? '#dc2626' : '#dc2626';
  liqBlock.innerHTML = `
    <div class="result-title">Liquidity Classification</div>
    <table class="liq-table">
      <thead><tr><th>Asset</th><th>Value</th><th>Liquidity</th></tr></thead>
      <tbody>
        ${liquidity.assets.map(a => `
          <tr>
            <td>${escapeHtml(a.name)}</td>
            <td data-animate="${a.value}">₹${fmtINR(a.value)}</td>
            <td><span class="liq-tag ${a.liquidity === 'High' ? 'high' : a.liquidity === 'Medium-high' ? 'med-high' : a.liquidity === 'Medium' ? 'medium' : a.liquidity === 'Low' ? 'low' : 'very-low'}">${escapeHtml(a.liquidity)}</span></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <div class="kv" style="margin-top:10px">
      <div class="item"><div class="k">Immediate Liquidity</div><div class="v highlight" data-animate="${liquidity.immediateLiquidity}">₹${fmtINR(liquidity.immediateLiquidity)}</div></div>
      <div class="item"><div class="k">Medium-Term Liquidity</div><div class="v" data-animate="${liquidity.mediumLiquidity}">₹${fmtINR(liquidity.mediumLiquidity)}</div></div>
      <div class="item"><div class="k">Accessibility Score</div><div class="v" style="color:${liqColor};font-weight:900">${liquidity.accessibilityScore} / 100</div></div>
      <div class="item"><div class="k">Total Net Worth</div><div class="v" data-animate="${liquidity.totalAssets}">₹${fmtINR(liquidity.totalAssets)}</div></div>
    </div>
  `;
  el.appendChild(liqBlock);

  // Insurance Adequacy
  const insBlock = document.createElement('div');
  insBlock.className = 'result-block';
  insBlock.style.animationDelay = nextDelay() + 'ms';
  insBlock.innerHTML = `
    <div class="result-title">Insurance Adequacy Check</div>
    <div class="kv">
      <div class="item"><div class="k">Health Cover</div><div class="v ${insurance.healthPct < 70 ? 'danger-text' : 'success-text'}">₹${fmtINR(d.healthInsurance)} / ₹${fmtINR(insurance.healthNeed)} (${insurance.healthPct.toFixed(0)}%)</div></div>
      <div class="item"><div class="k">Life Cover</div><div class="v ${insurance.lifePct < 70 ? 'danger-text' : 'success-text'}">₹${fmtINR(d.lifeInsurance)} / ₹${fmtINR(insurance.lifeNeed)} (${insurance.lifePct.toFixed(0)}%)</div></div>
      <div class="item"><div class="k">Accident Cover</div><div class="v ${insurance.accidentPct < 70 ? 'danger-text' : 'success-text'}">₹${fmtINR(d.accidentCover)} / ₹${fmtINR(insurance.accidentNeed)} (${insurance.accidentPct.toFixed(0)}%)</div></div>
      <div class="item"><div class="k">Overall Adequacy</div><div class="v" style="color:${insurance.avgPct >= 70 ? '#0066cc' : insurance.avgPct >= 40 ? '#dc2626' : '#dc2626'};font-weight:900">${insurance.avgPct.toFixed(0)}%</div></div>
    </div>
    <div class="progress" style="margin-top:10px"><span style="width:0%;background:linear-gradient(90deg, ${insurance.avgPct >= 70 ? '#0066cc' : insurance.avgPct >= 40 ? '#dc2626' : '#dc2626'}, ${insurance.avgPct >= 70 ? '#0066cc' : insurance.avgPct >= 40 ? '#dc2626' : '#dc2626'}80)" data-target="${insurance.avgPct.toFixed(0)}"></span></div>
  `;
  el.appendChild(insBlock);

  // Stress Tests
  const stressBlock = document.createElement('div');
  stressBlock.className = 'result-block';
  stressBlock.style.animationDelay = nextDelay() + 'ms';
  stressBlock.innerHTML = `
    <div class="result-title">Scenario-Based Stress Testing</div>
    <div class="scenario-grid">
      ${stress.map(s => `
        <div class="scenario-card">
          <div class="scenario-name">${escapeHtml(s.name)}</div>
          <div class="scenario-value" style="color:${colorForMonths(s.months)}">${s.months >= 999 ? '∞' : s.months.toFixed(1) + ' months'}</div>
          <div class="scenario-desc">${escapeHtml(s.desc)}</div>
        </div>
      `).join('')}
    </div>
    <div class="scenario-insight" style="margin-top:12px">
      Combined shock survival: <b style="color:${colorForMonths(stress[stress.length-1].months)}">${stress[stress.length-1].months >= 999 ? 'Indefinite' : stress[stress.length-1].months.toFixed(1) + ' months'}</b>.
      ${stress[stress.length-1].months < 6 ? 'This household is fragile under simultaneous shocks.' : stress[stress.length-1].months < 12 ? 'Moderate resilience — consider increasing buffer.' : 'Household can absorb multi-shock scenarios.'}
    </div>
  `;
  el.appendChild(stressBlock);

  // Inflation Projection
  const infBlock = document.createElement('div');
  infBlock.className = 'result-block';
  infBlock.style.animationDelay = nextDelay() + 'ms';
  infBlock.innerHTML = `
    <div class="result-title">Inflation-Adjusted Emergency Planning</div>
    <div class="kv">
      ${projected.slice(0, 5).map(p => `
        <div class="item">
          <div class="k">Year ${p.year} — Monthly Need</div>
          <div class="v" data-animate="${p.expense}">₹${fmtINR(p.expense)}</div>
          <div class="k" style="margin-top:4px">Survival Months</div>
          <div class="v" style="color:${colorForMonths(p.months)};font-weight:900">${p.months.toFixed(1)}</div>
        </div>
      `).join('')}
    </div>
    <div class="disclaimer" style="margin-top:10px">Assumes 4% annual return on emergency corpus and ${d.inflation}% annual expense inflation.</div>
  `;
  el.appendChild(infBlock);

  // Behavioral Finance
  const behBlock = document.createElement('div');
  behBlock.className = 'result-block';
  behBlock.style.animationDelay = nextDelay() + 'ms';
  const behColor = behavioral >= 70 ? '#0066cc' : behavioral >= 45 ? '#dc2626' : '#dc2626';
  behBlock.innerHTML = `
    <div class="result-title">Behavioral Finance Layer</div>
    <div class="kv">
      <div class="item"><div class="k">Spending Discipline</div><div class="v">${d.spendingDiscipline.charAt(0).toUpperCase() + d.spendingDiscipline.slice(1)}</div></div>
      <div class="item"><div class="k">Lifestyle Inflation</div><div class="v ${d.lifestyleInflation === 'high' ? 'danger-text' : ''}">${d.lifestyleInflation.charAt(0).toUpperCase() + d.lifestyleInflation.slice(1)}</div></div>
      <div class="item"><div class="k">Withdrawal History</div><div class="v">${d.withdrawalHistory.charAt(0).toUpperCase() + d.withdrawalHistory.slice(1)}</div></div>
      <div class="item"><div class="k">Behavioral Score</div><div class="v" style="color:${behColor};font-weight:900">${behavioral} / 100</div></div>
    </div>
    <div class="progress" style="margin-top:10px"><span style="width:0%;background:linear-gradient(90deg, ${behColor}, ${behColor}80)" data-target="${behavioral}"></span></div>
  `;
  el.appendChild(behBlock);

  // Anxiety Indicator
  const anxBlock = document.createElement('div');
  anxBlock.className = 'result-block';
  anxBlock.style.animationDelay = nextDelay() + 'ms';
  const anxColor = anxiety >= 70 ? '#0066cc' : anxiety >= 45 ? '#dc2626' : '#dc2626';
  anxBlock.innerHTML = `
    <div class="result-title">Financial Anxiety Indicator</div>
    <div class="score-ring-wrap">
      <div class="score-ring" style="--ring-color:${anxColor};--ring-pct:${anxiety}%">
        <div class="score-ring-inner">
          <div class="score-ring-value" style="color:${anxColor}">${anxiety}%</div>
          <div class="score-ring-label">Survival Probability</div>
        </div>
      </div>
      <div style="flex:1;min-width:200px">
        <div class="scenario-insight">
          There is an estimated <b>${anxiety}% probability</b> that this household can survive 12 months without falling into debt, based on current liquidity, debt burden, income stability, and insurance coverage.
        </div>
        <div class="scenario-insight" style="margin-top:8px">
          ${anxiety >= 80 ? 'This is a strong position. Maintain discipline and review annually.' : anxiety >= 60 ? 'Reasonable resilience, but gaps exist. Address recommendations above.' : 'High financial fragility detected. Immediate action recommended.'}
        </div>
      </div>
    </div>
  `;
  el.appendChild(anxBlock);

  // Goal Tracker
  const trackBlock = document.createElement('div');
  trackBlock.className = 'result-block';
  trackBlock.style.animationDelay = nextDelay() + 'ms';
  trackBlock.innerHTML = `
    <div class="result-title">Emergency Goal Tracker</div>
    <div class="kv">
      <div class="item"><div class="k">Current Corpus</div><div class="v highlight" data-animate="${tracker.currentCorpus}">₹${fmtINR(tracker.currentCorpus)}</div></div>
      <div class="item"><div class="k">Target Corpus</div><div class="v" data-animate="${tracker.targetCorpus}">₹${fmtINR(tracker.targetCorpus)}</div></div>
      <div class="item"><div class="k">Monthly Savings</div><div class="v" data-animate="${tracker.monthlySave}">₹${fmtINR(tracker.monthlySave)}</div></div>
      <div class="item"><div class="k">Months to Goal</div><div class="v ${tracker.monthsToGoal > 24 ? 'danger-text' : 'success-text'}">${tracker.monthsToGoal >= 999 ? '∞' : tracker.monthsToGoal + ' months'}</div></div>
    </div>
    <div class="progress" style="margin-top:10px" title="Progress to target">
      <span style="width:0%;background:linear-gradient(90deg, #0066cc, #3b82f6)" data-target="${tracker.progressPct.toFixed(0)}"></span>
    </div>
    <div style="margin-top:6px;font-size:12px;color:var(--muted);font-weight:600;text-align:right">${tracker.progressPct.toFixed(1)}% complete</div>
  `;
  el.appendChild(trackBlock);

  // Recommendations
  const recBlock = document.createElement('div');
  recBlock.className = 'result-block';
  recBlock.style.animationDelay = nextDelay() + 'ms';
  recBlock.innerHTML = `
    <div class="result-title">AI-Based Recommendations</div>
    <div class="rec-list">
      ${recs.map((r, i) => `
        <div class="rec-item">
          <span class="rec-icon">${i + 1}</span>
          <span class="rec-text">${escapeHtml(r)}</span>
        </div>
      `).join('')}
    </div>
  `;
  el.appendChild(recBlock);

  // Animate
  requestAnimationFrame(() => {
    el.querySelectorAll('.progress > span[data-target]').forEach((bar) => {
      requestAnimationFrame(() => {
        bar.style.width = bar.getAttribute('data-target') + '%';
      });
    });
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
