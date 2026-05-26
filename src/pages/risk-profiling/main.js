import { escapeHtml, showToast } from '/src/shared/utils/index.js';
import { initInteractive, initKeyboardShortcuts } from '/src/shared/interactive.js';

const $ = (id) => document.getElementById(id);

const state = {
  current: 0,
  answers: [],
  score: 0,
};

const questions = [
  {
    category: "Time Horizon",
    text: "For how many years can you keep most of your invested money untouched?",
    options: [
      { label: "Less than 1 year", score: 5 },
      { label: "1 to 3 years", score: 20 },
      { label: "3 to 7 years", score: 50 },
      { label: "More than 7 years", score: 85 },
    ],
  },
  {
    category: "Market Reaction",
    text: "If your portfolio drops 20% in 6 months, what would you most likely do?",
    options: [
      { label: "Sell everything immediately to stop further losses", score: 5 },
      { label: "Sell a portion and move to safer assets", score: 25 },
      { label: "Hold and wait for recovery", score: 55 },
      { label: "Invest more to buy at lower prices", score: 90 },
    ],
  },
  {
    category: "Income Stability",
    text: "How stable is your primary source of income?",
    options: [
      { label: "Very uncertain (freelance / contract / startup)", score: 10 },
      { label: "Somewhat stable but no guaranteed growth", score: 30 },
      { label: "Stable with modest annual increments", score: 55 },
      { label: "Highly stable (govt / MNC tenure / professional practice)", score: 80 },
    ],
  },
  {
    category: "Investment Experience",
    text: "How many years of experience do you have investing in volatile assets (equity / mutual funds / real estate)?",
    options: [
      { label: "None — this is my first time", score: 5 },
      { label: "Less than 2 years", score: 25 },
      { label: "2 to 7 years", score: 55 },
      { label: "More than 7 years including a market crash", score: 90 },
    ],
  },
  {
    category: "Loss Tolerance",
    text: "What is the maximum portfolio loss you can tolerate in a single year without panic?",
    options: [
      { label: "No loss at all — capital preservation is key", score: 5 },
      { label: "Up to 5%", score: 20 },
      { label: "Up to 15%", score: 50 },
      { label: "Up to 30% or more", score: 85 },
    ],
  },
  {
    category: "Financial Goal",
    text: "What is your primary financial objective right now?",
    options: [
      { label: "Protect existing wealth (retired / near-retirement)", score: 10 },
      { label: "Generate regular income with some growth", score: 35 },
      { label: "Grow wealth steadily for medium-term goals", score: 60 },
      { label: "Maximize long-term wealth accumulation", score: 90 },
    ],
  },
  {
    category: "Behavioral Bias",
    text: "During the last major market crash, how did you actually behave?",
    options: [
      { label: "Exited all equity positions and stayed in cash", score: 5 },
      { label: "Reduced equity exposure significantly", score: 25 },
      { label: "Did nothing — stayed the course", score: 60 },
      { label: "Added to equity investments during the dip", score: 95 },
    ],
  },
  {
    category: "Financial Cushion",
    text: "Do you have an emergency fund covering at least 6 months of expenses and no high-interest debt?",
    options: [
      { label: "No emergency fund and/or high-interest debt exists", score: 10 },
      { label: "3 months saved, manageable debt", score: 35 },
      { label: "6 months saved, no high-interest debt", score: 65 },
      { label: "12+ months saved, fully debt-free", score: 90 },
    ],
  },
];

function renderQuestion() {
  const q = questions[state.current];
  $("qText").textContent = q.text;
  $("qCategory").textContent = q.category;
  $("qCounter").textContent = `Question ${state.current + 1} of ${questions.length}`;

  const pct = ((state.current + 1) / questions.length) * 100;
  $("progressFill").style.width = `${pct}%`;

  const opts = q.options
    .map(
      (opt, i) => `
      <div class="option ${state.answers[state.current] === i ? "selected" : ""}" data-index="${i}">
        <div class="radio"></div>
        <div class="label">${escapeHtml(opt.label)}</div>
      </div>`
    )
    .join("");
  $("optionsArea").innerHTML = opts;

  $("optionsArea").querySelectorAll(".option").forEach((el) => {
    el.addEventListener("click", () => {
      state.answers[state.current] = Number(el.dataset.index);
      renderQuestion();
      $("btnNext").disabled = false;
    });
  });

  $("btnPrev").style.display = state.current === 0 ? "none" : "inline-block";
  $("btnNext").textContent =
    state.current === questions.length - 1 ? "Get Results" : "Next";
  $("btnNext").disabled = state.answers[state.current] === undefined;
}

function nextQuestion() {
  if (state.answers[state.current] === undefined) return;
  if (state.current < questions.length - 1) {
    state.current++;
    renderQuestion();
  } else {
    computeResults();
  }
}

function prevQuestion() {
  if (state.current > 0) {
    state.current--;
    renderQuestion();
  }
}

function computeResults() {
  let rawScore = 0;
  let maxPossible = 0;
  questions.forEach((q, i) => {
    const ans = q.options[state.answers[i]];
    rawScore += ans.score;
    maxPossible += Math.max(...q.options.map((o) => o.score));
  });

  const normalized = Math.round((rawScore / maxPossible) * 100);
  state.score = normalized;

  showResults();
}

function classifyRisk(score) {
  if (score <= 35) return { type: "Conservative", color: "#0066cc", bg: "rgba(0,102,204,.08)" };
  if (score <= 65) return { type: "Moderate", color: "#0066cc", bg: "rgba(0,102,204,.08)" };
  return { type: "Aggressive", color: "#dc2626", bg: "rgba(220,38,38,.08)" };
}

function getAllocation(score) {
  if (score <= 35) {
    return { equity: 25, debt: 65, gold: 10 };
  }
  if (score <= 65) {
    return { equity: 50, debt: 40, gold: 10 };
  }
  return { equity: 75, debt: 15, gold: 10 };
}

function getInsights(score) {
  const insights = [];

  if (score <= 35) {
    insights.push({
      title: "Capital Preservation Priority",
      body: "You show a strong preference for safety over returns. Avoid equity-heavy portfolios regardless of market FOMO. Focus on debt mutual funds, FDs, and sovereign gold bonds.",
    });
    insights.push({
      title: "Behavioral Watchout: Loss Aversion",
      body: "Research shows conservative investors often panic-sell during downturns. Set up SIPs in hybrid funds instead of direct equity to reduce emotional decisions.",
    });
  } else if (score <= 65) {
    insights.push({
      title: "Balanced Growth Approach",
      body: "You can tolerate moderate volatility but value stability. A 50:40:10 equity-debt-gold mix aligns well. Rebalance annually to prevent drift.",
    });
    insights.push({
      title: "Behavioral Watchout: Regret Aversion",
      body: "Moderate investors sometimes regret not being aggressive in bull markets. Stick to your glide path — your risk profile is tuned to your life stage, not market cycles.",
    });
  } else {
    insights.push({
      title: "Long-Term Wealth Maximization",
      body: "You have the temperament and capacity for high equity exposure. Maintain 70–80% equity but ensure 6+ month emergency funds exist before increasing risk.",
    });
    insights.push({
      title: "Behavioral Watchout: Overconfidence",
      body: "Aggressive investors often overestimate their ability to time markets. Use index funds / ETFs for core equity exposure and limit speculative bets to <10% of portfolio.",
    });
  }

  const cushionAns = questions[7].options[state.answers[7]];
  if (cushionAns && cushionAns.score < 50) {
    insights.push({
      title: "Financial Cushion Alert",
      body: "Your emergency fund or debt profile suggests lower risk capacity than your score indicates. Consider reducing equity by 10–15% until cushion improves.",
    });
  }

  const horizonAns = questions[0].options[state.answers[0]];
  if (horizonAns && horizonAns.score < 30 && state.score > 50) {
    insights.push({
      title: "Horizon Mismatch",
      body: "Your risk tolerance is moderate–aggressive but your time horizon is short. Reduce equity allocation by 15% to avoid sequencing risk near your goal date.",
    });
  }

  return insights;
}

function animateValue(el, start, end, duration = 900) {
  const startTime = performance.now();
  function step(now) {
    const t = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(start + (end - start) * eased);
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function donutChartHTML(equity, debt, gold) {
  const colors = ["#0066cc", "#dc2626", "#D4AF37"];
  const a1 = equity * 3.6;
  const a2 = a1 + debt * 3.6;
  return `
    <div class="donut-wrap">
      <div class="donut" style="--p1:${colors[0]};--a1:${a1}deg;--p2:${colors[1]};--a2:${a2}deg;--p3:${colors[2]}"></div>
      <div class="donut-center">Allocation<br><strong>${equity}% Eq</strong></div>
    </div>
  `;
}

function showResults() {
  $("introCard").style.display = "none";
  $("quizCard").style.display = "none";
  $("resultsCard").style.display = "block";
  $("resultsCard").scrollIntoView({ behavior: "smooth", block: "start" });

  const profile = classifyRisk(state.score);
  const alloc = getAllocation(state.score);

  // Score number animation
  animateValue($("scoreNumber"), 0, state.score, 1000);

  // Score ring animation
  const circle = $("scoreCircle");
  const circumference = 2 * Math.PI * 70; // ~440
  const offset = circumference - (state.score / 100) * circumference;
  circle.style.strokeDashoffset = circumference; // reset
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      circle.style.strokeDashoffset = offset;
    });
  });

  // Update badge
  const badge = $("typeBadge");
  badge.textContent = profile.type;
  badge.style.color = profile.color;
  badge.style.background = profile.bg;
  badge.style.borderColor = profile.color + "30";

  // SVG gradient update
  const svgEl = document.querySelector(".score-ring");
  let defs = svgEl.querySelector("defs");
  if (!defs) {
    defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    svgEl.prepend(defs);
  }
  defs.innerHTML = `
    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${profile.color}" />
      <stop offset="100%" stop-color="${profile.color === '#0066cc' ? '#3b82f6' : profile.color === '#0066cc' ? '#3b82f6' : '#ef4444'}" />
    </linearGradient>
  `;

  // Allocation donut
  $("allocationDonut").outerHTML = donutChartHTML(alloc.equity, alloc.debt, alloc.gold);
  $("donutCenter").innerHTML = `Allocation<br><strong>${alloc.equity}% Eq</strong>`;

  // Allocation legend
  const legendItems = [
    { name: "Equity", pct: alloc.equity, color: "#0066cc" },
    { name: "Debt", pct: alloc.debt, color: "#dc2626" },
    { name: "Gold", pct: alloc.gold, color: "#D4AF37" },
  ];
  $("allocLegend").innerHTML = legendItems
    .map(
      (x) => `
      <div class="legend-item">
        <div class="left"><span class="swatch" style="background:${x.color}"></span><span>${x.name}</span></div>
        <div class="pct">${x.pct}%</div>
      </div>`
    )
    .join("");

  // Insights
  const insights = getInsights(state.score);
  $("insightsArea").innerHTML = insights
    .map(
      (ins) => `
      <div class="insight-card">
        <div class="title">${escapeHtml(ins.title)}</div>
        <div class="body">${escapeHtml(ins.body)}</div>
      </div>`
    )
    .join("");
}

function resetQuiz() {
  state.current = 0;
  state.answers = [];
  state.score = 0;
  $("resultsCard").style.display = "none";
  $("quizCard").style.display = "none";
  $("introCard").style.display = "block";
  $("introCard").scrollIntoView({ behavior: "smooth", block: "start" });
}

function init() {
  $("btnStart").addEventListener("click", () => {
    $("introCard").style.display = "none";
    $("quizCard").style.display = "block";
    renderQuestion();
    $("quizCard").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  $("btnNext").addEventListener("click", nextQuestion);
  $("btnPrev").addEventListener("click", prevQuestion);
  $("btnRetake").addEventListener("click", resetQuiz);

  document.addEventListener("keydown", (e) => {
    if ($("quizCard").style.display === "none") return;
    if (e.key === "ArrowRight" || e.key === "Enter") {
      if (!$('btnNext').disabled) nextQuestion();
    }
    if (e.key === "ArrowLeft") prevQuestion();
  });

  initInteractive();
  initKeyboardShortcuts({
    's': () => $("btnStart").click(),
    'r': () => $("btnRetake").click(),
  });
}

init();
