// ===== Debt vs Wealth Creation Decision Intelligence Platform =====

// Global state
let calculationResults = {};
let netWorthChart = null;
let debounceTimer = null;


// ===== Theme Toggle =====
const themeToggle = document.querySelector('.theme-toggle');
const html = document.documentElement;

const savedTheme = localStorage.getItem('theme') || 'light';
html.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

themeToggle.addEventListener('click', () => {
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
  const icon = themeToggle.querySelector('i') || themeToggle;
  if (theme === 'dark') {
    icon.innerHTML = '<i class="fas fa-sun"></i>';
  } else {
    icon.innerHTML = '<i class="fas fa-moon"></i>';
  }
}

// ===== Slider Value Updates =====
function updateSliderValue(sliderId, valueId, suffix = '') {
  const slider = document.getElementById(sliderId);
  const valueDisplay = document.getElementById(valueId);
  
  if (slider && valueDisplay) {
    let value = parseFloat(slider.value);
    
    // Format based on slider type
    if (sliderId === 'loanAmount' || sliderId === 'currentEMI' || sliderId === 'sipAmount' || sliderId === 'extraSavings' || sliderId === 'monthlyIncome') {
      valueDisplay.textContent = '₹' + formatCurrency(value);
    } else if (sliderId === 'interestRate' || sliderId === 'expectedCAGR' || sliderId === 'inflationRate') {
      valueDisplay.textContent = value + '%';
    } else {
      valueDisplay.textContent = value + suffix;
    }
  }
}

// Initialize all sliders
function initializeSliders() {
  const sliders = [
    { id: 'loanAmount', valueId: 'loanAmountValue' },
    { id: 'interestRate', valueId: 'interestRateValue' },
    { id: 'loanTenure', valueId: 'loanTenureValue' },
    { id: 'currentEMI', valueId: 'currentEMIValue' },
    { id: 'sipAmount', valueId: 'sipAmountValue' },
    { id: 'expectedCAGR', valueId: 'expectedCAGRValue' },
    { id: 'investmentDuration', valueId: 'investmentDurationValue' },
    { id: 'inflationRate', valueId: 'inflationRateValue' },
    { id: 'extraSavings', valueId: 'extraSavingsValue' },
    { id: 'riskTolerance', valueId: 'riskToleranceValue', isNumber: true },
    { id: 'liquidityNeed', valueId: 'liquidityNeedValue', isNumber: true },
    { id: 'emergencyFund', valueId: 'emergencyFundValue', isNumber: true },
    { id: 'monthlyIncome', valueId: 'monthlyIncomeValue' }
  ];

  // Debounced calculation for performance
  const debouncedCalculate = debounce(calculateAndUpdate, 150);

  sliders.forEach(({ id, valueId, isNumber }) => {
    const slider = document.getElementById(id);
    if (slider) {
      updateSliderValue(id, valueId, isNumber);
      slider.addEventListener('input', () => {
        updateSliderValue(id, valueId, isNumber);
        debouncedCalculate();
      });
    }
  });

  // Add event listeners for selects
  const selects = ['strategySelection', 'loanType', 'taxDeductible', 'cagrScenario', 'incomeStability'];
  selects.forEach(id => {
    const select = document.getElementById(id);
    if (select) {
      select.addEventListener('change', calculateAndUpdate);
    }
  });

  // Behavioral finance radio buttons
  const radioGroups = ['debtComfort', 'volatilityTolerance', 'guaranteePreference'];
  radioGroups.forEach(groupName => {
    const radios = document.querySelectorAll(`input[name="${groupName}"]`);
    radios.forEach(radio => {
      radio.addEventListener('change', () => {
        analyzeBehavioralProfile();
        calculateAndUpdate();
      });
    });
  });

  // Stress test toggles
  const stressToggles = ['marketCrash', 'jobLoss', 'rateIncrease'];
  stressToggles.forEach(id => {
    const toggle = document.getElementById(id);
    if (toggle) {
      toggle.addEventListener('change', applyStressTest);
    }
  });
}

// Debounce utility function
function debounce(func, delay) {
  return function(...args) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => func.apply(this, args), delay);
  };
}

// ===== Preset Functions =====
const presets = {
  conservative: {
    loanAmount: 2000000,
    interestRate: 8.5,
    loanTenure: 20,
    currentEMI: 17500,
    sipAmount: 10000,
    expectedCAGR: 8,
    investmentDuration: 15,
    inflationRate: 5,
    extraSavings: 10000,
    strategySelection: 'prepayment'
  },
  balanced: {
    loanAmount: 2000000,
    interestRate: 10,
    loanTenure: 15,
    currentEMI: 21500,
    sipAmount: 20000,
    expectedCAGR: 12,
    investmentDuration: 15,
    inflationRate: 6,
    extraSavings: 20000,
    strategySelection: 'balanced'
  },
  aggressive: {
    loanAmount: 2000000,
    interestRate: 10,
    loanTenure: 15,
    currentEMI: 21500,
    sipAmount: 30000,
    expectedCAGR: 15,
    investmentDuration: 20,
    inflationRate: 6,
    extraSavings: 30000,
    strategySelection: 'investing'
  }
};

function applyPreset(presetName) {
  const preset = presets[presetName];
  if (!preset) return;
  
  // Update all inputs
  document.getElementById('loanAmount').value = preset.loanAmount;
  document.getElementById('interestRate').value = preset.interestRate;
  document.getElementById('loanTenure').value = preset.loanTenure;
  document.getElementById('currentEMI').value = preset.currentEMI;
  document.getElementById('sipAmount').value = preset.sipAmount;
  document.getElementById('expectedCAGR').value = preset.expectedCAGR;
  document.getElementById('investmentDuration').value = preset.investmentDuration;
  document.getElementById('inflationRate').value = preset.inflationRate;
  document.getElementById('extraSavings').value = preset.extraSavings;
  document.getElementById('strategySelection').value = preset.strategySelection;
  
  // Update slider value displays
  document.getElementById('loanAmountValue').textContent = '₹' + formatCurrency(preset.loanAmount);
  document.getElementById('interestRateValue').textContent = preset.interestRate + '%';
  document.getElementById('loanTenureValue').textContent = preset.loanTenure;
  document.getElementById('currentEMIValue').textContent = '₹' + formatCurrency(preset.currentEMI);
  document.getElementById('sipAmountValue').textContent = '₹' + formatCurrency(preset.sipAmount);
  document.getElementById('expectedCAGRValue').textContent = preset.expectedCAGR + '%';
  document.getElementById('investmentDurationValue').textContent = preset.investmentDuration;
  document.getElementById('inflationRateValue').textContent = preset.inflationRate + '%';
  document.getElementById('extraSavingsValue').textContent = '₹' + formatCurrency(preset.extraSavings);
  
  // Update active state on buttons
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.preset === presetName) {
      btn.classList.add('active');
    }
  });
  
  // Recalculate
  calculateAndUpdate();
}

function initializePresets() {
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      applyPreset(btn.dataset.preset);
    });
  });
  
  // Reset button
  const resetBtn = document.getElementById('resetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', resetToDefaults);
  }
  
  // Share button
  const shareBtn = document.getElementById('shareBtn');
  if (shareBtn) {
    shareBtn.addEventListener('click', shareResults);
  }
  
  // Copy button
  const copyBtn = document.getElementById('copyBtn');
  if (copyBtn) {
    copyBtn.addEventListener('click', copySummary);
  }
  
  // Set balanced as default active
  document.querySelector('.preset-btn[data-preset="balanced"]').classList.add('active');
}

function resetToDefaults() {
  const defaults = {
    loanAmount: 2000000,
    interestRate: 10,
    loanTenure: 15,
    currentEMI: 21500,
    sipAmount: 20000,
    expectedCAGR: 12,
    investmentDuration: 15,
    inflationRate: 6,
    extraSavings: 20000,
    strategySelection: 'balanced'
  };
  
  // Update all inputs
  document.getElementById('loanAmount').value = defaults.loanAmount;
  document.getElementById('interestRate').value = defaults.interestRate;
  document.getElementById('loanTenure').value = defaults.loanTenure;
  document.getElementById('currentEMI').value = defaults.currentEMI;
  document.getElementById('sipAmount').value = defaults.sipAmount;
  document.getElementById('expectedCAGR').value = defaults.expectedCAGR;
  document.getElementById('investmentDuration').value = defaults.investmentDuration;
  document.getElementById('inflationRate').value = defaults.inflationRate;
  document.getElementById('extraSavings').value = defaults.extraSavings;
  document.getElementById('strategySelection').value = defaults.strategySelection;
  
  // Update slider value displays
  document.getElementById('loanAmountValue').textContent = '₹' + formatCurrency(defaults.loanAmount);
  document.getElementById('interestRateValue').textContent = defaults.interestRate + '%';
  document.getElementById('loanTenureValue').textContent = defaults.loanTenure;
  document.getElementById('currentEMIValue').textContent = '₹' + formatCurrency(defaults.currentEMI);
  document.getElementById('sipAmountValue').textContent = '₹' + formatCurrency(defaults.sipAmount);
  document.getElementById('expectedCAGRValue').textContent = defaults.expectedCAGR + '%';
  document.getElementById('investmentDurationValue').textContent = defaults.investmentDuration;
  document.getElementById('inflationRateValue').textContent = defaults.inflationRate + '%';
  document.getElementById('extraSavingsValue').textContent = '₹' + formatCurrency(defaults.extraSavings);
  
  // Clear preset active states
  document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));
  
  // Recalculate
  calculateAndUpdate();
}

function shareResults() {
  const { prepayment, investing, returnSpread, strategySelection } = calculationResults;
  const winner = investing.netWorth > prepayment.netWorth ? 'Investing' : 'Prepayment';
  
  const shareText = `Debt vs Wealth Analysis\n\n` +
    `Strategy: ${strategySelection}\n` +
    `Winner: ${winner}\n` +
    `Investing Net Worth: ₹${formatCurrency(investing.netWorth)}\n` +
    `Prepayment Net Worth: ₹${formatCurrency(prepayment.netWorth)}\n` +
    `Return Spread: ${returnSpread.toFixed(1)}%\n\n` +
    `Generated by SWS Financial Solutions`;
  
  if (navigator.share) {
    navigator.share({
      title: 'Debt vs Wealth Analysis',
      text: shareText
    }).catch(err => console.log('Share failed:', err));
  } else {
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(shareText).then(() => {
      alert('Results copied to clipboard!');
    }).catch(err => console.log('Copy failed:', err));
  }
}

function copySummary() {
  const { prepayment, investing, returnSpread, healthScore, strategySelection } = calculationResults;
  const winner = investing.netWorth > prepayment.netWorth ? 'Investing' : 'Prepayment';
  const diff = Math.abs(investing.netWorth - prepayment.netWorth);
  
  const summary = `Debt vs Wealth Creation Analysis\n` +
    `================================\n\n` +
    `Strategy: ${strategySelection.toUpperCase()}\n` +
    `Recommended: ${winner}\n\n` +
    `KEY METRICS:\n` +
    `• Investing Net Worth: ₹${formatCurrency(investing.netWorth)}\n` +
    `• Prepayment Net Worth: ₹${formatCurrency(prepayment.netWorth)}\n` +
    `• Net Worth Difference: ₹${formatCurrency(diff)} (${winner} leads)\n` +
    `• Return Spread: ${returnSpread.toFixed(1)}%\n` +
    `• Financial Health Score: ${Math.round(healthScore)}/100\n\n` +
    `Generated by SWS Financial Solutions`;
  
  navigator.clipboard.writeText(summary).then(() => {
    alert('Summary copied to clipboard!');
  }).catch(err => console.log('Copy failed:', err));
}

// ===== Financial Calculation Functions =====

// Calculate EMI
function calculateEMI(principal, annualRate, tenureYears) {
  const monthlyRate = annualRate / 12 / 100;
  const months = tenureYears * 12;
  
  if (monthlyRate === 0) return principal / months;
  
  const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / 
               (Math.pow(1 + monthlyRate, months) - 1);
  return emi;
}

// Calculate Loan Schedule
function calculateLoanSchedule(principal, annualRate, tenureYears, emi) {
  const monthlyRate = annualRate / 12 / 100;
  const months = tenureYears * 12;
  let balance = principal;
  let totalInterest = 0;
  let actualMonths = 0;

  for (let month = 1; month <= months; month++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = emi - interestPayment;
    balance -= principalPayment;
    totalInterest += interestPayment;
    actualMonths = month;

    if (balance <= 0) {
      balance = 0;
      break;
    }
  }

  return { totalInterest, actualMonths };
}

// Calculate SIP Corpus
function calculateSIPCorpus(monthlyAmount, annualRate, years) {
  const monthlyRate = annualRate / 12 / 100;
  const months = years * 12;
  let corpus = 0;
  let invested = 0;

  for (let month = 1; month <= months; month++) {
    corpus = (corpus + monthlyAmount) * (1 + monthlyRate);
    invested += monthlyAmount;
  }

  return { corpus, invested, wealthGenerated: corpus - invested };
}

// Calculate Inflation-Adjusted Value
function calculateInflationAdjustedValue(presentValue, inflationRate, years) {
  const futureValue = presentValue / Math.pow(1 + inflationRate / 100, years);
  return futureValue;
}

// Calculate Tax Impact
function calculateTaxImpact(interestSavings, investmentReturns, taxDeductible) {
  let postTaxInterestSavings = interestSavings;
  let postTaxInvestmentReturns = investmentReturns;

  // Loan interest tax deduction (Section 24(b) for home loan)
  if (taxDeductible === 'yes') {
    const maxDeduction = 200000;
    const taxBenefit = Math.min(interestSavings, maxDeduction) * 0.3;
    postTaxInterestSavings = interestSavings + taxBenefit;
  }

  // Investment tax treatment (simplified LTCG)
  const ltcgThreshold = 100000;
  const taxableAmount = Math.max(0, investmentReturns - ltcgThreshold);
  const ltcgTax = taxableAmount * 0.10;
  postTaxInvestmentReturns = investmentReturns - ltcgTax;

  return { postTaxInterestSavings, postTaxInvestmentReturns };
}

// Calculate Financial Health Score
function calculateFinancialHealthScore(interestRate, expectedCAGR, strategySelection) {
  let score = 50;
  const returnSpread = expectedCAGR - interestRate;

  if (returnSpread > 4) score += 20;
  else if (returnSpread > 2) score += 10;
  else if (returnSpread < 0) score -= 15;

  if (strategySelection === 'investing') score += 10;
  if (strategySelection === 'balanced') score += 5;

  return Math.min(100, Math.max(0, score));
}

// ===== Dynamic Strategy Optimization =====
function calculateOptimalAllocation(interestRate, expectedCAGR, riskTolerance, liquidityNeed) {
  const returnSpread = expectedCAGR - interestRate;
  let prepaymentPercent = 50;
  let investmentPercent = 50;

  // Base allocation based on return spread
  if (returnSpread > 4) {
    prepaymentPercent = 20;
    investmentPercent = 80;
  } else if (returnSpread > 2) {
    prepaymentPercent = 35;
    investmentPercent = 65;
  } else if (returnSpread > 0) {
    prepaymentPercent = 50;
    investmentPercent = 50;
  } else if (returnSpread > -2) {
    prepaymentPercent = 65;
    investmentPercent = 35;
  } else {
    prepaymentPercent = 80;
    investmentPercent = 20;
  }

  // Adjust based on risk tolerance (1 = conservative, 5 = aggressive)
  const riskAdjustment = (riskTolerance - 3) * 10;
  prepaymentPercent -= riskAdjustment;
  investmentPercent += riskAdjustment;

  // Adjust based on liquidity need (1 = low need, 5 = high need)
  const liquidityAdjustment = (liquidityNeed - 3) * 8;
  prepaymentPercent += liquidityAdjustment;
  investmentPercent -= liquidityAdjustment;

  // Ensure percentages are within valid range
  prepaymentPercent = Math.max(10, Math.min(90, prepaymentPercent));
  investmentPercent = 100 - prepaymentPercent;

  return {
    prepaymentPercent: Math.round(prepaymentPercent),
    investmentPercent: Math.round(investmentPercent),
    strategy: prepaymentPercent > 60 ? 'Conservative' : prepaymentPercent > 40 ? 'Balanced' : 'Aggressive Growth'
  };
}

// ===== Real Return Calculation =====
function calculateRealReturn(nominalReturn, inflationRate) {
  // Fisher equation: (1 + nominal) = (1 + real) * (1 + inflation)
  // Real = (1 + nominal) / (1 + inflation) - 1
  const realReturn = ((1 + nominalReturn / 100) / (1 + inflationRate / 100) - 1) * 100;
  return realReturn;
}

// ===== Risk-Adjusted Return Calculation =====
function calculateRiskAdjustedReturn(expectedReturn, riskLevel) {
  // Risk penalty: higher risk = lower risk-adjusted return
  const riskPenalty = {
    'very_low': 0,
    'low': 0.5,
    'moderate': 1.5,
    'high': 3,
    'very_high': 5
  };
  
  const penalty = riskPenalty[riskLevel] || 1.5;
  return expectedReturn - penalty;
}

// ===== Liquidity Score Calculation =====
function calculateLiquidityScore(emergencyFundMonths, liquidAssets, monthlyExpenses) {
  let score = 0;
  
  // Emergency fund adequacy
  if (emergencyFundMonths >= 6) score += 40;
  else if (emergencyFundMonths >= 3) score += 25;
  else if (emergencyFundMonths >= 1) score += 10;
  
  // Liquid assets ratio
  const liquidRatio = liquidAssets / (monthlyExpenses * 12);
  if (liquidRatio >= 2) score += 30;
  else if (liquidRatio >= 1) score += 20;
  else if (liquidRatio >= 0.5) score += 10;
  
  // Base score
  score += 30;
  
  return Math.min(100, score);
}

// ===== Financial Stress Score Calculation =====
function calculateFinancialStressScore(emiRatio, emergencyFundMonths, incomeStability, dependents) {
  let stressScore = 0;
  
  // EMI burden (inverse - higher EMI = higher stress)
  if (emiRatio <= 20) stressScore += 0;
  else if (emiRatio <= 30) stressScore += 15;
  else if (emiRatio <= 40) stressScore += 30;
  else stressScore += 50;
  
  // Emergency fund (inverse - lower fund = higher stress)
  if (emergencyFundMonths >= 6) stressScore += 0;
  else if (emergencyFundMonths >= 3) stressScore += 15;
  else if (emergencyFundMonths >= 1) stressScore += 30;
  else stressScore += 50;
  
  // Income stability
  if (incomeStability === 'stable') stressScore += 0;
  else if (incomeStability === 'moderate') stressScore += 15;
  else stressScore += 30;
  
  // Dependents
  if (dependents === 0) stressScore += 0;
  else if (dependents <= 2) stressScore += 10;
  else stressScore += 20;
  
  return Math.min(100, stressScore);
}

// ===== Financial Freedom Calculation =====
function calculateFinancialFreedomDate(currentNetWorth, annualSavings, targetFI, expectedReturn) {
  const yearsToFIRaw = Math.log(targetFI / currentNetWorth) / Math.log(1 + expectedReturn / 100);
  const yearsToFI = Math.max(0, yearsToFIRaw);
  
  const currentYear = new Date().getFullYear();
  const fiYear = Math.round(currentYear + yearsToFI);
  
  return {
    yearsToFI: yearsToFI.toFixed(1),
    fiYear: fiYear,
    passiveIncome: targetFI * 0.04 // 4% withdrawal rule
  };
}

// ===== Behavioral Finance Analysis =====
function analyzeBehavioralProfile() {
  const debtComfort = parseFloat(document.querySelector('input[name="debtComfort"]:checked')?.value) || 3;
  const volatilityTolerance = parseFloat(document.querySelector('input[name="volatilityTolerance"]:checked')?.value) || 3;
  const guaranteePreference = parseFloat(document.querySelector('input[name="guaranteePreference"]:checked')?.value) || 3;
  
  const totalScore = debtComfort + volatilityTolerance + guaranteePreference;
  const avgScore = totalScore / 3;
  
  let persona, description;
  
  if (avgScore <= 2) {
    persona = 'Security Seeker';
    description = 'You emotionally prefer being debt-free and value guaranteed outcomes. Consider higher prepayment allocation.';
  } else if (avgScore <= 3) {
    persona = 'Balanced Planner';
    description = 'Your profile suggests a balanced approach to financial decisions. A 50/50 split may work well.';
  } else if (avgScore <= 4) {
    persona = 'Growth Seeker';
    description = 'You are comfortable with market risk and prefer growth potential. Consider higher investment allocation.';
  } else {
    persona = 'Wealth Maximizer';
    description = 'You have high risk tolerance and prioritize wealth maximization. Aggressive investing may suit you.';
  }
  
  document.getElementById('behavioralType').textContent = persona;
  document.getElementById('behavioralDesc').textContent = description;
  
  return {
    persona,
    avgScore,
    debtComfort,
    volatilityTolerance,
    guaranteePreference
  };
}

// ===== Main Calculation Function =====
function calculateAndUpdate() {
  // Get input values
  const loanAmount = parseFloat(document.getElementById('loanAmount').value) || 0;
  const interestRate = parseFloat(document.getElementById('interestRate').value) || 0;
  const loanTenure = parseFloat(document.getElementById('loanTenure').value) || 0;
  const currentEMI = parseFloat(document.getElementById('currentEMI').value) || 0;
  const extraSavings = parseFloat(document.getElementById('extraSavings').value) || 0;
  const sipAmount = parseFloat(document.getElementById('sipAmount').value) || 0;
  let expectedCAGR = parseFloat(document.getElementById('expectedCAGR').value) || 0;
  const investmentDuration = parseFloat(document.getElementById('investmentDuration').value) || 0;
  const inflationRate = parseFloat(document.getElementById('inflationRate').value) || 0;
  const strategySelection = document.getElementById('strategySelection').value;
  const taxDeductible = document.getElementById('taxDeductible').value;
  
  // Advanced parameters
  const riskTolerance = parseFloat(document.getElementById('riskTolerance').value) || 3;
  const liquidityNeed = parseFloat(document.getElementById('liquidityNeed').value) || 3;
  const emergencyFund = parseFloat(document.getElementById('emergencyFund').value) || 3;
  const monthlyIncome = parseFloat(document.getElementById('monthlyIncome').value) || 100000;
  const incomeStability = document.getElementById('incomeStability').value;
  const cagrScenario = document.getElementById('cagrScenario').value;
  
  // Adjust CAGR based on scenario
  const cagrAdjustments = {
    'pessimistic': 7,
    'moderate': 11,
    'optimistic': 15
  };
  if (cagrScenario !== 'custom') {
    expectedCAGR = cagrAdjustments[cagrScenario] || expectedCAGR;
    document.getElementById('expectedCAGR').value = expectedCAGR;
    document.getElementById('expectedCAGRValue').textContent = expectedCAGR + '%';
  }

  // Calculate baseline loan EMI if not provided
  const baselineEMI = currentEMI > 0 ? currentEMI : calculateEMI(loanAmount, interestRate, loanTenure);
  const baselineSchedule = calculateLoanSchedule(loanAmount, interestRate, loanTenure, baselineEMI);

  // Strategy 1: Aggressive Prepayment (all extra to loan)
  const prepaymentEMI = baselineEMI + extraSavings;
  const prepaymentSchedule = calculateLoanSchedule(loanAmount, interestRate, loanTenure, prepaymentEMI);
  const prepaymentYears = (prepaymentSchedule.actualMonths / 12).toFixed(1);
  const interestSaved = baselineSchedule.totalInterest - prepaymentSchedule.totalInterest;
  const prepaymentNetWorth = interestSaved; // Interest saved is the gain

  // Strategy 2: Aggressive Investing (all extra to SIP)
  const investingEMI = baselineEMI;
  const investingSchedule = calculateLoanSchedule(loanAmount, interestRate, loanTenure, investingEMI);
  const investingYears = (investingSchedule.actualMonths / 12).toFixed(1);
  const totalSIPInvested = (sipAmount + extraSavings) * investmentDuration * 12;
  const sipResult = calculateSIPCorpus(sipAmount + extraSavings, expectedCAGR, investmentDuration);
  const investingNetWorth = sipResult.corpus - investingSchedule.totalInterest;

  // Strategy 3: Balanced (50-50 split)
  const balancedPrepayment = extraSavings * 0.5;
  const balancedSIP = sipAmount + (extraSavings * 0.5);
  const balancedEMI = baselineEMI + balancedPrepayment;
  const balancedSchedule = calculateLoanSchedule(loanAmount, interestRate, loanTenure, balancedEMI);
  const balancedSIPResult = calculateSIPCorpus(balancedSIP, expectedCAGR, investmentDuration);
  const balancedInterestSaved = baselineSchedule.totalInterest - balancedSchedule.totalInterest;
  const balancedNetWorth = balancedSIPResult.corpus - balancedSchedule.totalInterest + balancedInterestSaved;

  // Strategy 4: Optimal (AI-calculated allocation)
  const optimalAllocation = calculateOptimalAllocation(interestRate, expectedCAGR, riskTolerance, liquidityNeed);
  const optimalPrepayment = extraSavings * (optimalAllocation.prepaymentPercent / 100);
  const optimalSIP = sipAmount + (extraSavings * (optimalAllocation.investmentPercent / 100));
  const optimalEMI = baselineEMI + optimalPrepayment;
  const optimalSchedule = calculateLoanSchedule(loanAmount, interestRate, loanTenure, optimalEMI);
  const optimalSIPResult = calculateSIPCorpus(optimalSIP, expectedCAGR, investmentDuration);
  const optimalInterestSaved = baselineSchedule.totalInterest - optimalSchedule.totalInterest;
  const optimalNetWorth = optimalSIPResult.corpus - optimalSchedule.totalInterest + optimalInterestSaved;

  // Use optimal strategy if selected
  let finalPrepayment, finalInvesting, finalBalanced;
  if (strategySelection === 'optimal') {
    finalPrepayment = { netWorth: optimalNetWorth, interestSaved: optimalInterestSaved, years: (optimalSchedule.actualMonths / 12).toFixed(1) };
    finalInvesting = { netWorth: investingNetWorth, corpus: sipResult.corpus, years: investingYears };
    finalBalanced = { netWorth: balancedNetWorth };
  } else {
    finalPrepayment = { netWorth: prepaymentNetWorth, interestSaved: interestSaved, years: prepaymentYears };
    finalInvesting = { netWorth: investingNetWorth, corpus: sipResult.corpus, years: investingYears };
    finalBalanced = { netWorth: balancedNetWorth };
  }

  // Tax impact
  const taxImpact = calculateTaxImpact(interestSaved, sipResult.wealthGenerated, taxDeductible);

  // Real return calculations
  const realLoanReturn = calculateRealReturn(interestRate, inflationRate);
  const realInvestmentReturn = calculateRealReturn(expectedCAGR, inflationRate);

  // Risk-adjusted returns
  const riskAdjustedLoanReturn = calculateRiskAdjustedReturn(interestRate, 'very_low');
  const riskAdjustedInvestmentReturn = calculateRiskAdjustedReturn(expectedCAGR, 'high');

  // Liquidity score
  const liquidityScore = calculateLiquidityScore(emergencyFund, sipResult.corpus, currentEMI);

  // Financial stress score
  const emiRatio = (currentEMI / monthlyIncome) * 100;
  const financialStressScore = calculateFinancialStressScore(emiRatio, emergencyFund, incomeStability, 0);

  // Health score calculation
  const returnSpread = expectedCAGR - interestRate;
  const healthScore = calculateFinancialHealthScore(interestRate, expectedCAGR, strategySelection);

  // Store results
  calculationResults = {
    prepayment: finalPrepayment,
    investing: finalInvesting,
    balanced: finalBalanced,
    optimal: {
      netWorth: optimalNetWorth,
      allocation: optimalAllocation
    },
    taxImpact,
    healthScore,
    returnSpread,
    interestRate,
    expectedCAGR,
    strategySelection,
    investmentDuration,
    inflationRate,
    realLoanReturn,
    realInvestmentReturn,
    riskAdjustedLoanReturn,
    riskAdjustedInvestmentReturn,
    liquidityScore,
    financialStressScore,
    loanAmount,
    extraSavings,
    sipAmount
  };

  // Update UI
  updateSummaryCards();
  updateComparisonTable();
  updateAdvancedMetrics();
  updateFinancialFreedom();
  updateChart();
  validateInputs();
}

// ===== Animated Counter Function =====
function animateValue(element, start, end, duration, isCurrency = true) {
  const startTime = performance.now();
  const startValue = start;
  const endValue = end;
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function for smooth animation
    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
    const currentValue = startValue + (endValue - startValue) * easeOutQuart;
    
    if (isCurrency) {
      element.textContent = '₹' + formatCurrency(Math.round(currentValue));
    } else {
      element.textContent = currentValue.toFixed(1);
    }
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  
  requestAnimationFrame(update);
}

// ===== Chart Functions =====
function initializeChart() {
  const ctx = document.getElementById('netWorthChart');
  if (!ctx) return;
  
  netWorthChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        {
          label: 'Prepayment Strategy',
          data: [],
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Investing Strategy',
          data: [],
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: 'var(--text)',
            font: { size: 13, weight: 600 }
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: function(context) {
              return context.dataset.label + ': ₹' + formatCurrency(context.raw);
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Years',
            color: 'var(--muted)',
            font: { weight: 600 }
          },
          ticks: { color: 'var(--muted)' },
          grid: { color: 'var(--border)' }
        },
        y: {
          title: {
            display: true,
            text: 'Net Worth (₹)',
            color: 'var(--muted)',
            font: { weight: 600 }
          },
          ticks: { 
            color: 'var(--muted)',
            callback: function(value) {
              return '₹' + formatCurrency(value);
            }
          },
          grid: { color: 'var(--border)' }
        }
      }
    }
  });
}

function updateChart() {
  if (!netWorthChart) return;
  
  const { prepayment, investing, investmentDuration, loanAmount, interestRate, extraSavings, sipAmount, expectedCAGR } = calculationResults;
  const years = Math.ceil(investmentDuration);
  const labels = [];
  const prepaymentNetWorthData = [];
  const investingNetWorthData = [];
  const prepaymentAssetsData = [];
  const investingAssetsData = [];
  const prepaymentLiabilitiesData = [];
  const investingLiabilitiesData = [];
  
  // Generate yearly data points with assets vs liabilities
  for (let year = 0; year <= years; year++) {
    labels.push('Year ' + year);
    
    // Prepayment trajectory
    const prepaymentEMI = calculateEMI(loanAmount, interestRate, investmentDuration) + extraSavings;
    const prepaymentMonths = Math.min(year * 12, investmentDuration * 12);
    const prepaymentLoanBalance = calculateLoanBalance(loanAmount, interestRate, prepaymentEMI, prepaymentMonths);
    const prepaymentSIPCorpus = calculateSIPCorpus(sipAmount, expectedCAGR, year);
    const prepaymentNetWorth = prepaymentSIPCorpus.corpus - prepaymentLoanBalance;
    
    // Investing trajectory
    const investingEMI = calculateEMI(loanAmount, interestRate, investmentDuration);
    const investingMonths = Math.min(year * 12, investmentDuration * 12);
    const investingLoanBalance = calculateLoanBalance(loanAmount, interestRate, investingEMI, investingMonths);
    const investingSIPCorpus = calculateSIPCorpus(sipAmount + extraSavings, expectedCAGR, year);
    const investingNetWorth = investingSIPCorpus.corpus - investingLoanBalance;
    
    prepaymentNetWorthData.push(Math.max(0, prepaymentNetWorth));
    investingNetWorthData.push(Math.max(0, investingNetWorth));
    prepaymentAssetsData.push(Math.max(0, prepaymentSIPCorpus.corpus));
    investingAssetsData.push(Math.max(0, investingSIPCorpus.corpus));
    prepaymentLiabilitiesData.push(Math.max(0, prepaymentLoanBalance));
    investingLiabilitiesData.push(Math.max(0, investingLoanBalance));
  }
  
  netWorthChart.data.labels = labels;
  netWorthChart.data.datasets[0].data = prepaymentNetWorthData;
  netWorthChart.data.datasets[1].data = investingNetWorthData;
  netWorthChart.update('none');
}

// Calculate loan balance at specific month
function calculateLoanBalance(principal, annualRate, emi, months) {
  const monthlyRate = annualRate / 12 / 100;
  if (monthlyRate === 0) return Math.max(0, principal - (emi * months));
  
  const remainingMonths = months;
  if (remainingMonths <= 0) return principal;
  
  const balance = principal * Math.pow(1 + monthlyRate, remainingMonths) - 
                  emi * (Math.pow(1 + monthlyRate, remainingMonths) - 1) / monthlyRate;
  
  return Math.max(0, balance);
}

// ===== Input Validation =====
function validateInputs() {
  const loanAmount = parseFloat(document.getElementById('loanAmount').value) || 0;
  const interestRate = parseFloat(document.getElementById('interestRate').value) || 0;
  const currentEMI = parseFloat(document.getElementById('currentEMI').value) || 0;
  const sipAmount = parseFloat(document.getElementById('sipAmount').value) || 0;
  const expectedCAGR = parseFloat(document.getElementById('expectedCAGR').value) || 0;
  
  const warnings = [];
  
  // Validate loan amount
  if (loanAmount > 10000000) {
    warnings.push('Loan amount exceeds ₹1 Cr - consider lower loan');
  }
  
  // Validate interest rate
  if (interestRate > 20) {
    warnings.push('Interest rate is very high (>20%) - consider refinancing');
  }
  
  // Validate EMI vs SIP
  if (currentEMI > 100000) {
    warnings.push('EMI is very high - ensure sufficient income');
  }
  
  if (sipAmount > currentEMI * 0.8) {
    warnings.push('SIP amount is close to EMI - ensure liquidity');
  }
  
  // Validate expected CAGR
  if (expectedCAGR > 18) {
    warnings.push('Expected CAGR is optimistic (>18%) - consider conservative estimates');
  }
  
  // Show/hide warnings
  showWarnings(warnings);
}

function showWarnings(warnings) {
  // Remove existing warnings
  const existingWarnings = document.querySelectorAll('.input-warning');
  existingWarnings.forEach(w => w.remove());
  
  if (warnings.length === 0) return;
  
  // Create warning container
  const warningContainer = document.createElement('div');
  warningContainer.className = 'warning-container';
  
  warnings.forEach(warning => {
    const warningEl = document.createElement('div');
    warningEl.className = 'input-warning';
    warningEl.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${warning}`;
    warningContainer.appendChild(warningEl);
  });
  
  // Insert after strategy section
  const strategySection = document.querySelector('.strategy-section');
  if (strategySection) {
    strategySection.after(warningContainer);
  }
}

// ===== Update UI Functions =====

function updateSummaryCards() {
  const { prepayment, investing, balanced, returnSpread, healthScore, strategySelection } = calculationResults;
  
  let prepNetWorth, investNetWorth, diffNetWorth, winner;
  
  if (strategySelection === 'prepayment') {
    prepNetWorth = prepayment.netWorth;
    investNetWorth = investing.netWorth;
  } else if (strategySelection === 'investing') {
    prepNetWorth = prepayment.netWorth;
    investNetWorth = investing.netWorth;
  } else {
    prepNetWorth = balanced.netWorth;
    investNetWorth = investing.netWorth;
  }
  
  diffNetWorth = investNetWorth - prepNetWorth;
  winner = diffNetWorth > 0 ? 'Investing' : 'Prepayment';
  
  // Animate result cards
  const prepEl = document.getElementById('prepaymentSummary');
  const investEl = document.getElementById('investingSummary');
  const diffEl = document.getElementById('netWorthDiff');
  const healthEl = document.getElementById('healthScoreValue');
  const diffLabel = document.getElementById('diffLabel');
  const winnerEl = document.getElementById('winnerStrategy');
  
  // Get current values for animation
  const currentPrep = parseFloat(prepEl.textContent.replace(/[₹,]/g, '')) || 0;
  const currentInvest = parseFloat(investEl.textContent.replace(/[₹,]/g, '')) || 0;
  const currentDiff = parseFloat(diffEl.textContent.replace(/[₹,]/g, '')) || 0;
  const currentHealth = parseFloat(healthEl.textContent) || 0;
  
  animateValue(prepEl, currentPrep, Math.abs(prepNetWorth), 500);
  animateValue(investEl, currentInvest, investNetWorth, 500);
  animateValue(diffEl, currentDiff, Math.abs(diffNetWorth), 500);
  animateValue(healthEl, currentHealth, healthScore, 500, false);
  
  document.getElementById('returnSpreadValue').textContent = returnSpread.toFixed(1) + '%';
  
  // Color-code results based on winner
  if (diffNetWorth > 0) {
    // Investing wins
    diffLabel.textContent = 'Investing leads by';
    diffLabel.style.color = '#10b981';
    winnerEl.textContent = strategySelection === 'balanced' ? 'Balanced' : 'Investing';
    winnerEl.style.color = '#10b981';
  } else {
    // Prepayment wins
    diffLabel.textContent = 'Prepayment leads by';
    diffLabel.style.color = '#ef4444';
    winnerEl.textContent = strategySelection === 'balanced' ? 'Balanced' : 'Prepayment';
    winnerEl.style.color = '#ef4444';
  }
  
  // Color-code return spread
  const returnSpreadEl = document.getElementById('returnSpreadValue');
  if (returnSpread > 0) {
    returnSpreadEl.style.color = '#10b981';
  } else if (returnSpread < 0) {
    returnSpreadEl.style.color = '#ef4444';
  } else {
    returnSpreadEl.style.color = 'var(--primary)';
  }
  
  // Color-code health score
  if (healthScore >= 80) {
    healthEl.style.color = '#10b981';
  } else if (healthScore >= 60) {
    healthEl.style.color = '#f59e0b';
  } else {
    healthEl.style.color = '#ef4444';
  }
}

function updateComparisonTable() {
  const { prepayment, investing, investmentDuration } = calculationResults;
  
  document.getElementById('prepInterestSaved').textContent = '₹' + formatCurrency(prepayment.interestSaved);
  document.getElementById('investCorpus').textContent = '₹' + formatCurrency(investing.corpus);
  document.getElementById('prepLoanFreedom').textContent = prepayment.years + ' yrs';
  document.getElementById('investLoanFreedom').textContent = investing.years + ' yrs';
  
  // Update progress bars
  const prepProgress = Math.min(100, (parseFloat(prepayment.years) / investmentDuration) * 100);
  const investProgress = Math.min(100, (parseFloat(investing.years) / investmentDuration) * 100);
  
  document.getElementById('prepProgressPercent').textContent = Math.round(prepProgress) + '%';
  document.getElementById('prepProgressBar').style.width = prepProgress + '%';
  
  document.getElementById('investProgressPercent').textContent = Math.round(investProgress) + '%';
  document.getElementById('investProgressBar').style.width = investProgress + '%';
  
  // Update timeline
  updateTimeline();
}

function updateAdvancedMetrics() {
  const { realLoanReturn, realInvestmentReturn, riskAdjustedLoanReturn, riskAdjustedInvestmentReturn, liquidityScore, financialStressScore } = calculationResults;
  
  document.getElementById('realLoanReturnValue').textContent = realLoanReturn.toFixed(1) + '%';
  document.getElementById('realInvestReturnValue').textContent = realInvestmentReturn.toFixed(1) + '%';
  document.getElementById('riskAdjustedLoanReturnValue').textContent = riskAdjustedLoanReturn.toFixed(1) + '%';
  document.getElementById('riskAdjustedInvestReturnValue').textContent = riskAdjustedInvestmentReturn.toFixed(1) + '%';
  document.getElementById('liquidityScoreValue').textContent = Math.round(liquidityScore);
  document.getElementById('financialStressScoreValue').textContent = Math.round(financialStressScore);
  
  // Color-code liquidity score
  const liquidityEl = document.getElementById('liquidityScoreValue');
  if (liquidityScore >= 70) {
    liquidityEl.style.color = '#10b981';
  } else if (liquidityScore >= 40) {
    liquidityEl.style.color = '#f59e0b';
  } else {
    liquidityEl.style.color = '#ef4444';
  }
  
  // Color-code stress score (inverse - lower is better)
  const stressEl = document.getElementById('financialStressScoreValue');
  if (financialStressScore <= 20) {
    stressEl.style.color = '#10b981';
  } else if (financialStressScore <= 50) {
    stressEl.style.color = '#f59e0b';
  } else {
    stressEl.style.color = '#ef4444';
  }
}

function updateFinancialFreedom() {
  const { prepayment, investing, expectedCAGR, monthlyIncome, extraSavings, sipAmount } = calculationResults;
  
  // Assume FI target is 25x annual expenses (simplified)
  const annualExpenses = monthlyIncome * 12;
  const targetFI = annualExpenses * 25;
  
  // Current net worth (simplified - starting from 0 for this calculation)
  const currentNetWorth = 0;
  
  // Annual savings for each strategy
  const prepaymentAnnualSavings = sipAmount * 12;
  const investingAnnualSavings = (sipAmount + extraSavings) * 12;
  
  // Calculate FI dates
  const prepaymentFI = calculateFinancialFreedomDate(currentNetWorth, prepaymentAnnualSavings, targetFI, expectedCAGR);
  const investingFI = calculateFinancialFreedomDate(currentNetWorth, investingAnnualSavings, targetFI, expectedCAGR);
  
  // Update UI
  document.getElementById('fiYearsPrepayment').textContent = prepaymentFI.yearsToFI + ' yrs';
  document.getElementById('fiYearPrepayment').textContent = 'Year ' + prepaymentFI.fiYear;
  document.getElementById('fiYearsInvesting').textContent = investingFI.yearsToFI + ' yrs';
  document.getElementById('fiYearInvesting').textContent = 'Year ' + investingFI.fiYear;
  document.getElementById('passiveIncomeValue').textContent = '₹' + formatCurrency(investingFI.passiveIncome / 12) + '/month';
  
  // Calculate advantage
  const advantage = parseFloat(prepaymentFI.yearsToFI) - parseFloat(investingFI.yearsToFI);
  const advantageEl = document.getElementById('fiAdvantage');
  const advantageLabelEl = document.getElementById('fiAdvantageLabel');
  
  if (advantage > 0) {
    advantageEl.textContent = advantage.toFixed(1) + ' yrs';
    advantageLabelEl.textContent = 'Investing faster';
    advantageEl.style.color = '#10b981';
  } else if (advantage < 0) {
    advantageEl.textContent = Math.abs(advantage).toFixed(1) + ' yrs';
    advantageLabelEl.textContent = 'Prepayment faster';
    advantageEl.style.color = '#ef4444';
  } else {
    advantageEl.textContent = '0 yrs';
    advantageLabelEl.textContent = 'Equal';
    advantageEl.style.color = 'var(--primary)';
  }
}

function updateTimeline() {
  const { prepayment, investing, investmentDuration } = calculationResults;
  
  const prepYears = parseFloat(prepayment.years);
  const investYears = parseFloat(investing.years);
  const maxYears = Math.max(prepYears, investYears, investmentDuration);
  const difference = Math.abs(investYears - prepYears);
  
  // Calculate positions (0-100%)
  const prepPosition = (prepYears / maxYears) * 100;
  const investPosition = (investYears / maxYears) * 100;
  
  // Update timeline bar fills
  const loanFill = document.getElementById('loanTimelineFill');
  const investmentFill = document.getElementById('investmentTimelineFill');
  
  if (loanFill) {
    loanFill.style.width = prepPosition + '%';
  }
  
  if (investmentFill) {
    investmentFill.style.width = investPosition + '%';
  }
  
  // Update timeline point positions
  const loanPoint = document.getElementById('loanTimelinePoint');
  const investmentPoint = document.getElementById('investmentTimelinePoint');
  
  if (loanPoint) {
    loanPoint.style.left = prepPosition + '%';
  }
  
  if (investmentPoint) {
    investmentPoint.style.left = investPosition + '%';
  }
  
  // Update year labels in cards
  document.getElementById('prepTimelineYear').textContent = prepYears.toFixed(1) + ' yrs';
  document.getElementById('investTimelineYear').textContent = investYears.toFixed(1) + ' yrs';
  
  // Update point values
  document.getElementById('loanPointValue').textContent = prepYears.toFixed(1) + ' yrs';
  document.getElementById('investmentPointValue').textContent = investYears.toFixed(1) + ' yrs';
  
  // Update difference
  document.getElementById('timelineDifference').textContent = difference.toFixed(1) + ' years';
}

// ===== Stress Testing =====
function applyStressTest() {
  const marketCrash = document.getElementById('marketCrash').checked;
  const jobLoss = document.getElementById('jobLoss').checked;
  const rateIncrease = document.getElementById('rateIncrease').checked;

  let riskLevel = 'Low Risk';

  if (marketCrash || rateIncrease) {
    riskLevel = 'Moderate Risk';
  }

  if (jobLoss) {
    riskLevel = 'High Risk';
  }

  document.getElementById('survivalImpact').textContent = riskLevel;
}

// ===== Utility Functions =====

function formatCurrency(value) {
  if (value >= 10000000) {
    return (value / 10000000).toFixed(2) + ' Cr';
  } else if (value >= 100000) {
    return (value / 100000).toFixed(2) + ' L';
  } else if (value >= 1000) {
    return (value / 1000).toFixed(2) + ' K';
  }
  return value.toFixed(0);
}

// ===== Back to Top Button =====
const backToTop = document.querySelector('.back-to-top');

window.addEventListener('scroll', () => {
  if (window.scrollY > 500) {
    backToTop.classList.add('visible');
  } else {
    backToTop.classList.remove('visible');
  }
});

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===== Page Transition =====
const pageTransition = document.querySelector('.page-transition');
const links = document.querySelectorAll('a[href]');

links.forEach(link => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (href.startsWith('/') && !href.startsWith('#')) {
      e.preventDefault();
      pageTransition.classList.add('active');
      setTimeout(() => {
        window.location.href = href;
      }, 400);
    }
  });
});

window.addEventListener('load', () => {
  pageTransition.classList.remove('active');
});

// ===== Accordion Functionality =====
function initializeAccordion() {
  const accordionItems = document.querySelectorAll('.accordion-item');
  
  accordionItems.forEach(item => {
    const header = item.querySelector('.accordion-header');
    
    header.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      // Close all items
      accordionItems.forEach(i => i.classList.remove('active'));
      
      // Open clicked item if it wasn't active
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
}

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
  initializeSliders();
  initializeChart();
  initializePresets();
  initializeKeyboardShortcuts();
  analyzeBehavioralProfile();
  setTimeout(() => {
    calculateAndUpdate();
  }, 100);
});

// ===== Keyboard Shortcuts =====
function initializeKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ignore if user is typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
      return;
    }
    
    // R - Reset to defaults
    if (e.key === 'r' || e.key === 'R') {
      e.preventDefault();
      resetToDefaults();
    }
    
    // 1 - Conservative preset
    if (e.key === '1') {
      e.preventDefault();
      applyPreset('conservative');
    }
    
    // 2 - Balanced preset
    if (e.key === '2') {
      e.preventDefault();
      applyPreset('balanced');
    }
    
    // 3 - Aggressive preset
    if (e.key === '3') {
      e.preventDefault();
      applyPreset('aggressive');
    }
    
    // S - Share results
    if (e.key === 's' || e.key === 'S') {
      e.preventDefault();
      shareResults();
    }
    
    // C - Copy summary
    if (e.key === 'c' || e.key === 'C') {
      e.preventDefault();
      copySummary();
    }
  });
}
