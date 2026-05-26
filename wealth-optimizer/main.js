// ===== Wealth Optimizer - Main JavaScript =====

// Initialize AOS
AOS.init({
  duration: 800,
  easing: 'ease-out-cubic',
  once: true,
  offset: 50
});

// Global state
let selectedStrategy = 'balanced';
let charts = {};
let calculationResults = {};

// ===== Theme Toggle =====
const themeToggle = document.querySelector('.theme-toggle');
const html = document.documentElement;

// Check for saved theme preference
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
  const icon = themeToggle.querySelector('i');
  if (theme === 'dark') {
    icon.className = 'fas fa-sun';
  } else {
    icon.className = 'fas fa-moon';
  }
}

// ===== Input Synchronization =====
function syncInputs() {
  const inputPairs = [
    ['loanAmount', 'loanAmountRange'],
    ['interestRate', 'interestRateRange'],
    ['loanTenure', 'loanTenureRange'],
    ['extraSavings', 'extraSavingsRange'],
    ['sipAmount', 'sipAmountRange'],
    ['expectedCAGR', 'expectedCAGRRange'],
    ['investmentDuration', 'investmentDurationRange'],
    ['inflationRate', 'inflationRateRange']
  ];

  inputPairs.forEach(([numberId, rangeId]) => {
    const numberInput = document.getElementById(numberId);
    const rangeInput = document.getElementById(rangeId);

    if (numberInput && rangeInput) {
      numberInput.addEventListener('input', () => {
        rangeInput.value = numberInput.value;
      });

      rangeInput.addEventListener('input', () => {
        numberInput.value = rangeInput.value;
      });
    }
  });
}

syncInputs();

// ===== Scroll to Section =====
function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// ===== Strategy Selection =====
function selectStrategy(strategy) {
  selectedStrategy = strategy;
  
  document.querySelectorAll('.strategy-card').forEach(card => {
    card.classList.remove('active');
  });
  
  const selectedCard = document.querySelector(`.strategy-card[data-strategy="${strategy}"]`);
  if (selectedCard) {
    selectedCard.classList.add('active');
  }

  // Recalculate with new strategy
  analyzeStrategies();
}

// ===== Financial Calculations =====
function calculateEMI(principal, annualRate, tenureYears) {
  const monthlyRate = annualRate / 12 / 100;
  const months = tenureYears * 12;
  
  if (monthlyRate === 0) return principal / months;
  
  const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / 
               (Math.pow(1 + monthlyRate, months) - 1);
  return emi;
}

function calculateLoanSchedule(principal, annualRate, tenureYears, emi) {
  const monthlyRate = annualRate / 12 / 100;
  const months = tenureYears * 12;
  const schedule = [];
  let balance = principal;
  let totalInterest = 0;

  for (let month = 1; month <= months; month++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = emi - interestPayment;
    balance -= principalPayment;
    totalInterest += interestPayment;

    if (balance <= 0) {
      balance = 0;
      schedule.push({
        month,
        balance: Math.max(0, balance),
        interestPayment,
        principalPayment,
        totalInterest
      });
      break;
    }

    schedule.push({
      month,
      balance: Math.max(0, balance),
      interestPayment,
      principalPayment,
      totalInterest
    });
  }

  return { schedule, totalInterest, actualMonths: schedule.length };
}

function calculateSIPCorpus(monthlyAmount, annualRate, years) {
  const monthlyRate = annualRate / 12 / 100;
  const months = years * 12;
  
  if (monthlyRate === 0) return monthlyAmount * months;
  
  const corpus = monthlyAmount * (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate;
  return corpus;
}

function calculateSIPGrowth(monthlyAmount, annualRate, years) {
  const monthlyRate = annualRate / 12 / 100;
  const months = years * 12;
  const growth = [];
  let corpus = 0;

  for (let month = 1; month <= months; month++) {
    corpus = (corpus + monthlyAmount) * (1 + monthlyRate);
    growth.push({
      month,
      corpus,
      invested: monthlyAmount * month
    });
  }

  return growth;
}

function calculateInflationAdjustedValue(presentValue, inflationRate, years) {
  const futureValue = presentValue / Math.pow(1 + inflationRate / 100, years);
  return futureValue;
}

// ===== Main Analysis Function =====
function analyzeStrategies() {
  // Get input values
  const loanAmount = parseFloat(document.getElementById('loanAmount').value) || 0;
  const interestRate = parseFloat(document.getElementById('interestRate').value) || 0;
  const loanTenure = parseFloat(document.getElementById('loanTenure').value) || 0;
  const currentEMI = parseFloat(document.getElementById('currentEMI').value) || 0;
  const extraSavings = parseFloat(document.getElementById('extraSavings').value) || 0;
  const sipAmount = parseFloat(document.getElementById('sipAmount').value) || 0;
  const expectedCAGR = parseFloat(document.getElementById('expectedCAGR').value) || 0;
  const investmentDuration = parseFloat(document.getElementById('investmentDuration').value) || 0;
  const inflationRate = parseFloat(document.getElementById('inflationRate').value) || 0;
  const riskAppetite = document.getElementById('riskAppetite').value;
  const incomeStability = document.getElementById('incomeStability').value;

  // Calculate baseline EMI
  const baselineEMI = calculateEMI(loanAmount, interestRate, loanTenure);
  const baselineSchedule = calculateLoanSchedule(loanAmount, interestRate, loanTenure, baselineEMI);

  // Strategy 1: Aggressive Prepayment
  const prepaymentEMI = currentEMI + extraSavings;
  const prepaymentSchedule = calculateLoanSchedule(loanAmount, interestRate, loanTenure, prepaymentEMI);
  const prepaymentMonths = prepaymentSchedule.actualMonths;
  const prepaymentYears = (prepaymentMonths / 12).toFixed(1);
  const interestSaved = baselineSchedule.totalInterest - prepaymentSchedule.totalInterest;

  // Strategy 2: Aggressive Investing
  const investingSchedule = calculateLoanSchedule(loanAmount, interestRate, loanTenure, currentEMI);
  const investingMonths = investingSchedule.actualMonths;
  const investingYears = (investingMonths / 12).toFixed(1);
  const sipGrowth = calculateSIPGrowth(sipAmount, expectedCAGR, investmentDuration);
  const finalSIPCorpus = sipGrowth[sipGrowth.length - 1].corpus;

  // Strategy 3: Balanced (50-50 split)
  const balancedPrepayment = extraSavings * 0.5;
  const balancedSIP = extraSavings * 0.5;
  const balancedEMI = currentEMI + balancedPrepayment;
  const balancedSchedule = calculateLoanSchedule(loanAmount, interestRate, loanTenure, balancedEMI);
  const balancedSIPGrowth = calculateSIPGrowth(balancedSIP, expectedCAGR, investmentDuration);
  const balancedCorpus = balancedSIPGrowth[balancedSIPGrowth.length - 1].corpus;

  // Calculate net worth comparison
  const prepaymentNetWorth = -prepaymentSchedule.totalInterest;
  const investingNetWorth = finalSIPCorpus - investingSchedule.totalInterest;
  const netWorthDifference = investingNetWorth - prepaymentNetWorth;

  // Opportunity cost
  const opportunityCostPrepayment = finalSIPCorpus - (extraSavings * investmentDuration * 12);
  const opportunityCostInvesting = interestSaved;

  // Store results
  calculationResults = {
    prepayment: {
      years: prepaymentYears,
      interestSaved,
      netWorth: prepaymentNetWorth,
      liquidityScore: 40,
      efficiency: 75
    },
    investing: {
      years: investingYears,
      corpus: finalSIPCorpus,
      netWorth: investingNetWorth,
      liquidityScore: 85,
      efficiency: 90
    },
    balanced: {
      years: (balancedSchedule.actualMonths / 12).toFixed(1),
      corpus: balancedCorpus,
      netWorth: balancedCorpus - balancedSchedule.totalInterest,
      liquidityScore: 65,
      efficiency: 85
    },
    opportunityCost: {
      prepayment: opportunityCostPrepayment,
      investing: opportunityCostInvesting
    },
    sipGrowth,
    prepaymentSchedule,
    investingSchedule,
    loanAmount,
    interestRate,
    expectedCAGR,
    inflationRate,
    investmentDuration,
    riskAppetite,
    incomeStability
  };

  // Update UI
  updateDashboard();
  updateCharts();
  updateAIRecommendation();
  updateOpportunityCost();
  updateHealthScore();
  updateRecommendation();

  // Animate counters
  animateCounters();
}

// ===== Update Dashboard =====
function updateDashboard() {
  const { prepayment, investing } = calculationResults;

  // Loan closure time
  const prepaymentTime = document.querySelector('.prepayment-value[data-count]');
  const investingTime = document.querySelectorAll('.investing-value[data-count]')[0];
  if (prepaymentTime) prepaymentTime.textContent = prepayment.years;
  if (investingTime) investingTime.textContent = investing.years;

  // Interest saved
  const interestSaved = document.querySelectorAll('.prepayment-value[data-count]')[1];
  if (interestSaved) interestSaved.textContent = formatCurrency(prepayment.interestSaved);

  // Final SIP corpus
  const sipCorpus = document.querySelectorAll('.investing-value[data-count]')[1];
  if (sipCorpus) sipCorpus.textContent = formatCurrency(investing.corpus);

  // Net worth difference
  const netWorthDiff = document.querySelector('.networth-value[data-count]');
  if (netWorthDiff) netWorthDiff.textContent = formatCurrency(Math.abs(investing.netWorth - prepayment.netWorth));

  // Liquidity score
  const prepaymentLiquidity = document.querySelector('.prepayment-score[data-count]');
  const investingLiquidity = document.querySelector('.investing-score[data-count]');
  if (prepaymentLiquidity) prepaymentLiquidity.textContent = prepayment.liquidityScore;
  if (investingLiquidity) investingLiquidity.textContent = investing.liquidityScore;

  // Financial efficiency
  const prepaymentEfficiency = document.querySelector('.prepayment-efficiency[data-count]');
  const investingEfficiency = document.querySelector('.investing-efficiency[data-count]');
  if (prepaymentEfficiency) prepaymentEfficiency.textContent = prepayment.efficiency;
  if (investingEfficiency) investingEfficiency.textContent = investing.efficiency;
}

// ===== Format Currency =====
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

// ===== Animate Counters =====
function animateCounters() {
  const counters = document.querySelectorAll('[data-count]');
  
  counters.forEach(counter => {
    const target = parseFloat(counter.getAttribute('data-count')) || parseFloat(counter.textContent.replace(/[^0-9.]/g, ''));
    const duration = 2000;
    const start = 0;
    const startTime = performance.now();

    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = start + (target - start) * easeOutQuart;

      if (counter.classList.contains('stat-value')) {
        counter.textContent = Math.floor(current).toLocaleString();
      } else {
        counter.textContent = formatCurrency(current);
      }

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    }

    requestAnimationFrame(updateCounter);
  });
}

// ===== Update Charts =====
function updateCharts() {
  const { sipGrowth, prepaymentSchedule, investingSchedule, investmentDuration } = calculationResults;

  // Destroy existing charts
  Object.values(charts).forEach(chart => {
    if (chart) chart.destroy();
  });

  const chartColors = {
    primary: 'rgba(0, 102, 204, 1)',
    primaryLight: 'rgba(0, 102, 204, 0.2)',
    secondary: 'rgba(220, 38, 38, 1)',
    secondaryLight: 'rgba(220, 38, 38, 0.2)',
    success: 'rgba(22, 163, 74, 1)',
    successLight: 'rgba(22, 163, 74, 0.2)',
    purple: 'rgba(139, 92, 246, 1)',
    purpleLight: 'rgba(139, 92, 246, 0.2)'
  };

  // Chart 1: Loan Balance Reduction
  const loanBalanceCtx = document.getElementById('loanBalanceChart');
  if (loanBalanceCtx) {
    const prepaymentData = prepaymentSchedule.schedule.filter((_, i) => i % 12 === 0).map(s => s.balance);
    const investingData = investingSchedule.schedule.filter((_, i) => i % 12 === 0).map(s => s.balance);
    const labels = prepaymentData.map((_, i) => `Year ${i + 1}`);

    charts.loanBalance = new Chart(loanBalanceCtx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'With Prepayment',
            data: prepaymentData,
            borderColor: chartColors.secondary,
            backgroundColor: chartColors.secondaryLight,
            fill: true,
            tension: 0.4
          },
          {
            label: 'Without Prepayment',
            data: investingData,
            borderColor: chartColors.primary,
            backgroundColor: chartColors.primaryLight,
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
            position: 'bottom'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: value => '₹' + formatCurrency(value)
            }
          }
        }
      }
    });
  }

  // Chart 2: SIP Growth
  const sipGrowthCtx = document.getElementById('sipGrowthChart');
  if (sipGrowthCtx) {
    const yearlyData = sipGrowth.filter((_, i) => i % 12 === 0).map(s => s.corpus);
    const investedData = sipGrowth.filter((_, i) => i % 12 === 0).map(s => s.invested);
    const labels = yearlyData.map((_, i) => `Year ${i + 1}`);

    charts.sipGrowth = new Chart(sipGrowthCtx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Total Corpus',
            data: yearlyData,
            backgroundColor: chartColors.primaryLight,
            borderColor: chartColors.primary,
            borderWidth: 2
          },
          {
            label: 'Amount Invested',
            data: investedData,
            backgroundColor: chartColors.successLight,
            borderColor: chartColors.success,
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: value => '₹' + formatCurrency(value)
            }
          }
        }
      }
    });
  }

  // Chart 3: Net Worth Comparison
  const netWorthCtx = document.getElementById('netWorthChart');
  if (netWorthCtx) {
    const years = Math.min(investmentDuration, 20);
    const labels = Array.from({ length: years }, (_, i) => `Year ${i + 1}`);
    
    const prepaymentNetWorth = labels.map((_, i) => {
      const month = (i + 1) * 12;
      const schedule = prepaymentSchedule.schedule[month - 1];
      return schedule ? -schedule.totalInterest : 0;
    });

    const investingNetWorth = labels.map((_, i) => {
      const month = (i + 1) * 12;
      const schedule = investingSchedule.schedule[month - 1];
      const sip = sipGrowth[month - 1];
      return (sip ? sip.corpus : 0) - (schedule ? schedule.totalInterest : 0);
    });

    charts.netWorth = new Chart(netWorthCtx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Prepayment Strategy',
            data: prepaymentNetWorth,
            borderColor: chartColors.secondary,
            backgroundColor: chartColors.secondaryLight,
            fill: true,
            tension: 0.4
          },
          {
            label: 'Investing Strategy',
            data: investingNetWorth,
            borderColor: chartColors.primary,
            backgroundColor: chartColors.primaryLight,
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
            position: 'bottom'
          }
        },
        scales: {
          y: {
            ticks: {
              callback: value => '₹' + formatCurrency(value)
            }
          }
        }
      }
    });
  }

  // Chart 4: Interest vs Investment Gain
  const interestVsInvestmentCtx = document.getElementById('interestVsInvestmentChart');
  if (interestVsInvestmentCtx) {
    const interestSaved = calculationResults.prepayment.interestSaved;
    const investmentGain = calculationResults.investing.corpus - (calculationResults.investing.corpus * 0.4);

    charts.interestVsInvestment = new Chart(interestVsInvestmentCtx, {
      type: 'doughnut',
      data: {
        labels: ['Interest Saved', 'Investment Gain'],
        datasets: [{
          data: [interestSaved, investmentGain],
          backgroundColor: [chartColors.secondary, chartColors.primary],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  // Chart 5: Wealth Timeline
  const wealthTimelineCtx = document.getElementById('wealthTimelineChart');
  if (wealthTimelineCtx) {
    const years = [5, 10, 15, 20].filter(y => y <= investmentDuration);
    const labels = years.map(y => `${y} Years`);
    
    const wealthProjection = years.map(year => {
      return calculateSIPCorpus(
        parseFloat(document.getElementById('sipAmount').value),
        calculationResults.expectedCAGR,
        year
      );
    });

    charts.wealthTimeline = new Chart(wealthTimelineCtx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Wealth Projection',
          data: wealthProjection,
          borderColor: chartColors.purple,
          backgroundColor: chartColors.purpleLight,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: chartColors.purple,
          pointRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: value => '₹' + formatCurrency(value)
            }
          }
        }
      }
    });
  }
}

// ===== AI Recommendation Engine =====
function updateAIRecommendation() {
  const { interestRate, expectedCAGR, riskAppetite, incomeStability, prepayment, investing } = calculationResults;
  
  const aiMessage = document.getElementById('aiRecommendation');
  const confidenceFill = document.getElementById('confidenceFill');
  const confidenceValue = document.getElementById('confidenceValue');
  const advisorNotes = document.getElementById('advisorNotes');

  let recommendation = '';
  let confidence = 0;
  let notes = '';

  const returnSpread = expectedCAGR - interestRate;
  const emiBurden = (parseFloat(document.getElementById('currentEMI').value) / parseFloat(document.getElementById('monthlyIncome').value)) * 100;

  if (returnSpread > 4 && riskAppetite === 'aggressive' && incomeStability === 'stable') {
    recommendation = 'Based on your high expected investment returns significantly exceeding loan interest, and your stable income with aggressive risk profile, investing surplus funds may generate substantially higher long-term wealth. Consider the SIP strategy for maximum growth potential.';
    confidence = 92;
    notes = 'Client has strong risk tolerance and stable income. Market-linked investments are likely to outperform debt repayment. Recommend maintaining adequate emergency fund before aggressive investing.';
  } else if (returnSpread > 2 && riskAppetite !== 'conservative') {
    recommendation = 'Your expected investment returns moderately exceed loan interest. A balanced approach splitting surplus between investment and prepayment may optimize both wealth creation and debt reduction.';
    confidence = 85;
    notes = 'Moderate return advantage suggests balanced allocation. Client should monitor market conditions and adjust strategy based on performance.';
  } else if (emiBurden > 40 || incomeStability === 'unstable') {
    recommendation = 'Due to high EMI burden relative to income and/or unstable cash flow, aggressive loan prepayment may significantly improve financial security and reduce stress. Prioritize debt reduction before aggressive investing.';
    confidence = 88;
    notes = 'High debt burden detected. Recommend focusing on liquidity improvement and debt reduction. Consider building larger emergency fund first.';
  } else if (interestRate > expectedCAGR) {
    recommendation = 'Since your loan interest rate exceeds expected investment returns, loan prepayment provides guaranteed returns equivalent to the interest rate. This is a risk-free strategy that improves financial health.';
    confidence = 90;
    notes = 'Debt cost exceeds expected returns. Prepayment is mathematically optimal. Client should prioritize high-interest debt repayment.';
  } else {
    recommendation = 'A balanced allocation strategy may optimize both liquidity maintenance and long-term growth. This approach provides flexibility while building wealth over time.';
    confidence = 78;
    notes = 'Return differential is marginal. Balanced approach provides flexibility. Client should review strategy annually based on changing circumstances.';
  }

  aiMessage.textContent = recommendation;
  confidenceFill.style.width = confidence + '%';
  confidenceValue.textContent = confidence + '%';
  advisorNotes.textContent = notes;
}

// ===== Opportunity Cost Analysis =====
function updateOpportunityCost() {
  const { opportunityCost, inflationRate, investmentDuration } = calculationResults;

  const prepaymentCost = document.querySelector('.prepayment-cost .opportunity-amount');
  const investingCost = document.querySelector('.investing-cost .opportunity-amount');
  const inflationMessage = document.getElementById('inflationMessage');

  if (prepaymentCost) {
    prepaymentCost.textContent = formatCurrency(opportunityCost.prepayment);
    prepaymentCost.setAttribute('data-count', opportunityCost.prepayment);
  }

  if (investingCost) {
    investingCost.textContent = formatCurrency(opportunityCost.investing);
    investingCost.setAttribute('data-count', opportunityCost.investing);
  }

  if (inflationMessage) {
    const corpus = 10000000; // 1 crore
    const purchasingPower = calculateInflationAdjustedValue(corpus, inflationRate, investmentDuration);
    inflationMessage.innerHTML = `Your corpus of <span class="highlight">₹1 crore</span> after <span class="highlight">${investmentDuration} years</span> may have purchasing power of only <span class="highlight">₹${formatCurrency(purchasingPower)}</span> today.`;
  }
}

// ===== Financial Health Score =====
function updateHealthScore() {
  const { interestRate, expectedCAGR, riskAppetite, prepayment, investing } = calculationResults;
  
  const healthScore = document.getElementById('healthScore');
  const gaugeFill = document.getElementById('gaugeFill');
  
  const debtBurden = document.getElementById('debtBurden');
  const investmentPotential = document.getElementById('investmentPotential');
  const liquidityBuffer = document.getElementById('liquidityBuffer');
  const riskAlignment = document.getElementById('riskAlignment');

  // Calculate health score components
  const returnSpread = expectedCAGR - interestRate;
  let score = 50;

  if (returnSpread > 4) score += 20;
  else if (returnSpread > 2) score += 10;
  else if (returnSpread < 0) score -= 10;

  if (riskAppetite === 'aggressive' && returnSpread > 2) score += 10;
  if (riskAppetite === 'conservative' && returnSpread < 0) score += 10;

  score = Math.min(100, Math.max(0, score));

  // Update gauge
  const circumference = 251;
  const offset = circumference - (score / 100) * circumference;
  gaugeFill.style.strokeDashoffset = offset;
  healthScore.textContent = score;

  // Update metrics
  const debtScore = Math.min(100, Math.max(0, 100 - (interestRate * 2)));
  const investmentScore = Math.min(100, Math.max(0, expectedCAGR * 5));
  const liquidityScore = selectedStrategy === 'investing' ? 85 : selectedStrategy === 'balanced' ? 65 : 40;
  const riskScore = riskAppetite === 'aggressive' ? 90 : riskAppetite === 'moderate' ? 70 : 50;

  debtBurden.style.width = debtScore + '%';
  investmentPotential.style.width = investmentScore + '%';
  liquidityBuffer.style.width = liquidityScore + '%';
  riskAlignment.style.width = riskScore + '%';
}

// ===== Stress Testing =====
function applyStressTest() {
  const marketCrash = document.getElementById('marketCrash').checked;
  const jobLoss = document.getElementById('jobLoss').checked;
  const salaryReduction = document.getElementById('salaryReduction').checked;
  const inflationSpike = document.getElementById('inflationSpike').checked;
  const rateIncrease = document.getElementById('rateIncrease').checked;

  const survivalImpact = document.getElementById('survivalImpact');
  const liquidityPressure = document.getElementById('liquidityPressure');
  const investmentDownside = document.getElementById('investmentDownside');

  let riskLevel = 'Low Risk';
  let liquidity = 'Minimal';
  let downside = '-5%';

  if (marketCrash) {
    downside = '-30%';
    riskLevel = 'Moderate Risk';
  }

  if (jobLoss) {
    liquidity = 'High Pressure';
    riskLevel = 'High Risk';
  }

  if (salaryReduction) {
    liquidity = 'Moderate Pressure';
    riskLevel = 'Moderate Risk';
  }

  if (inflationSpike) {
    downside = '-20%';
    riskLevel = 'Moderate Risk';
  }

  if (rateIncrease) {
    riskLevel = 'High Risk';
    liquidity = 'High Pressure';
  }

  survivalImpact.textContent = riskLevel;
  liquidityPressure.textContent = liquidity;
  investmentDownside.textContent = downside;

  // Update charts with stress factors
  if (Object.keys(charts).length > 0) {
    updateCharts();
  }
}

// ===== Final Recommendation =====
function updateRecommendation() {
  const { prepayment, investing, balanced, investmentDuration } = calculationResults;
  
  const recommendedStrategy = document.getElementById('recommendedStrategy');
  const reasoningList = document.getElementById('reasoningList');
  const projection5y = document.getElementById('projection5y');
  const projection10y = document.getElementById('projection10y');
  const projection15y = document.getElementById('projection15y');

  let strategy = 'Balanced Allocation';
  let reasoning = [];

  const returnSpread = calculationResults.expectedCAGR - calculationResults.interestRate;
  const emiBurden = (parseFloat(document.getElementById('currentEMI').value) / parseFloat(document.getElementById('monthlyIncome').value)) * 100;

  if (returnSpread > 4 && calculationResults.riskAppetite === 'aggressive') {
    strategy = 'Aggressive Investing';
    reasoning = [
      'Expected returns significantly exceed loan interest',
      'Aggressive risk profile matches market-linked investments',
      'Long investment horizon for compounding benefits',
      'Stable income supports investment commitment'
    ];
  } else if (emiBurden > 40 || calculationResults.incomeStability === 'unstable') {
    strategy = 'Aggressive Loan Repayment';
    reasoning = [
      'High EMI burden requires debt reduction priority',
      'Income instability necessitates lower debt obligations',
      'Guaranteed returns through interest savings',
      'Improved financial security and reduced stress'
    ];
  } else {
    strategy = 'Balanced Allocation';
    reasoning = [
      'Moderate debt burden with manageable EMI',
      'Stable income source with good growth potential',
      'Long investment horizon for compounding',
      'Adequate liquidity buffer maintained'
    ];
  }

  recommendedStrategy.textContent = strategy;
  reasoningList.innerHTML = reasoning.map(r => `<li>${r}</li>`).join('');

  // Update projections
  const sipAmount = parseFloat(document.getElementById('sipAmount').value);
  const cagr = calculationResults.expectedCAGR;

  projection5y.textContent = '₹' + formatCurrency(calculateSIPCorpus(sipAmount, cagr, 5));
  projection10y.textContent = '₹' + formatCurrency(calculateSIPCorpus(sipAmount, cagr, 10));
  projection15y.textContent = '₹' + formatCurrency(calculateSIPCorpus(sipAmount, cagr, 15));
}

// ===== Action Functions =====
function downloadReport() {
  alert('Report download feature coming soon! This will generate a PDF summary of your analysis.');
}

function saveStrategy() {
  localStorage.setItem('wealthOptimizerStrategy', JSON.stringify({
    selectedStrategy,
    calculationResults,
    timestamp: new Date().toISOString()
  }));
  alert('Strategy saved successfully!');
}

function recalculate() {
  analyzeStrategies();
  alert('Calculations updated with current parameters.');
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

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
  // Run initial analysis
  setTimeout(() => {
    analyzeStrategies();
  }, 500);
});
