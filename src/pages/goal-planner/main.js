import { escapeHtml, showToast, fmtINR } from '/src/shared/utils/index.js';
import { initInteractive, initKeyboardShortcuts } from '/src/shared/interactive.js';

const $ = (id) => document.getElementById(id);

const state = {
  goals: []
};

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function yearsUntil(currentAge, targetAge) {
  const y = targetAge - currentAge;
  return Math.max(0, y);
}

function inflationAdjusted(amountToday, inflationPct, years) {
  const r = inflationPct / 100;
  return amountToday * Math.pow(1 + r, years);
}

function fvSIP(monthly, annualRatePct, years) {
  const r = annualRatePct / 100;
  const n = Math.round(years * 12);
  if (n <= 0) return 0;
  const rm = r / 12;
  if (rm === 0) return monthly * n;
  return monthly * ((Math.pow(1 + rm, n) - 1) / rm);
}

function requiredMonthlyFromFV(targetFV, annualRatePct, years) {
  const r = annualRatePct / 100;
  const n = Math.round(years * 12);
  if (n <= 0) return Infinity;
  const rm = r / 12;
  if (rm === 0) return targetFV / n;
  return targetFV * (rm / (Math.pow(1 + rm, n) - 1));
}

function weightForRisk(profile) {
  if (profile === "conservative") return { equity: 0.35, debt: 0.55, gold: 0.1 };
  if (profile === "aggressive") return { equity: 0.75, debt: 0.15, gold: 0.1 };
  return { equity: 0.55, debt: 0.35, gold: 0.1 };
}

function capacityMultiplier(capacity) {
  if (capacity === "high") return 1.15;
  if (capacity === "low") return 0.85;
  return 1.0;
}

function allocateForGoal(goalRisk, base, timeToGoalYears) {
  const glide = clamp(timeToGoalYears / 20, 0, 1);
  const riskAdj = goalRisk === "high" ? 1.15 : goalRisk === "low" ? 0.85 : 1.0;

  let equity = base.equity * glide * riskAdj;
  let debt = base.debt + base.equity * (1 - glide) * 0.9;
  let gold = base.gold;

  equity = clamp(equity, 0.05, 0.9);
  debt = clamp(debt, 0.05, 0.95);
  gold = clamp(gold, 0.05, 0.25);

  const sum = equity + debt + gold;
  equity /= sum;
  debt /= sum;
  gold /= sum;

  return { equity, debt, gold };
}

function scoreGoal(goal, currentAge) {
  const years = yearsUntil(currentAge, goal.targetAge);
  const priorityScore = 5 - goal.priority;
  const timeScore = 1 / (1 + years / 5);
  const riskScore = goal.risk === "high" ? 1.05 : goal.risk === "low" ? 0.95 : 1.0;
  return (priorityScore * 10 + timeScore * 10) * riskScore;
}

function validateInputs() {
  const currentAge = Number($("age").value);
  const monthlyIncome = Number($("income").value);
  const inflationPct = Number($("inflation").value);
  const sipMonthly = Number($("sipMonthly").value);
  const sipYears = Number($("sipYears").value);
  const returnRate = Number($("returnRate").value);

  if (!Number.isFinite(currentAge) || currentAge < 18 || currentAge > 100) {
    showToast("Please enter a valid age (18-100)", "error");
    return false;
  }
  if (!Number.isFinite(monthlyIncome) || monthlyIncome < 0) {
    showToast("Please enter a valid monthly income", "error");
    return false;
  }
  if (!Number.isFinite(inflationPct) || inflationPct < 0 || inflationPct > 30) {
    showToast("Please enter a valid inflation rate (0-30%)", "error");
    return false;
  }
  if (!Number.isFinite(sipMonthly) || sipMonthly < 0) {
    showToast("Please enter a valid SIP amount", "error");
    return false;
  }
  if (!Number.isFinite(sipYears) || sipYears < 1 || sipYears > 50) {
    showToast("Please enter valid SIP years (1-50)", "error");
    return false;
  }
  if (!Number.isFinite(returnRate) || returnRate < 0 || returnRate > 30) {
    showToast("Please enter a valid return rate (0-30%)", "error");
    return false;
  }
  return true;
}

function computeRoadmap() {
  const currentAge = Number($("age").value);
  const monthlyIncome = Number($("income").value);
  const inflationPct = Number($("inflation").value);
  const risk = $("risk").value;
  const capacity = $("capacity").value;

  const sipMonthly = Number($("sipMonthly").value);
  const sipYears = Number($("sipYears").value);
  const returnRate = Number($("returnRate").value);

  const base0 = weightForRisk(risk);
  const cap = capacityMultiplier(capacity);

  const base = {
    equity: clamp(base0.equity * cap, 0.15, 0.9),
    gold: base0.gold,
    debt: 0
  };
  base.debt = clamp(1 - base.equity - base.gold, 0.05, 0.85);

  const goals = [...state.goals];
  goals.forEach((g) => {
    g.yearsToGoal = yearsUntil(currentAge, g.targetAge);
    g.inflAdjValue = inflationAdjusted(g.amountToday, inflationPct, g.yearsToGoal);
  });

  goals.sort((a, b) => scoreGoal(b, currentAge) - scoreGoal(a, currentAge));

  const totalTargetFV = goals.reduce((s, g) => s + g.inflAdjValue, 0);
  const sipFV = fvSIP(sipMonthly, returnRate, sipYears);

  const weights = goals.map((g) => {
    const share = g.share === "auto" ? null : Number(g.share);
    const priorityBoost = (5 - g.priority) / 4;
    if (share !== null && Number.isFinite(share)) return share;
    if (totalTargetFV <= 0) return 1;
    return (g.inflAdjValue / totalTargetFV) * (0.6 + 0.4 * priorityBoost);
  });

  const sumW = weights.reduce((s, w) => s + w, 0) || 1;
  const normalized = weights.map((w) => w / sumW);

  const results = [];
  let portfolioEquityTarget = 0;
  let portfolioDebtTarget = 0;
  let portfolioGoldTarget = 0;

  goals.forEach((g, idx) => {
    const allocation = allocateForGoal(g.risk, base, g.yearsToGoal);

    const effectiveReturn =
      allocation.equity * returnRate +
      allocation.debt * (returnRate * 0.55) +
      allocation.gold * (returnRate * 0.6);

    const effectiveRate = Math.max(0, effectiveReturn);
    const requiredMonthly = requiredMonthlyFromFV(g.inflAdjValue, effectiveRate, g.yearsToGoal);

    portfolioEquityTarget += normalized[idx] * allocation.equity;
    portfolioDebtTarget += normalized[idx] * allocation.debt;
    portfolioGoldTarget += normalized[idx] * allocation.gold;

    results.push({
      ...g,
      allocation,
      effectiveRate,
      requiredMonthly
    });
  });

  const retirementGoal = goals.find((g) => g.type === "retirement") || null;
  const retirementAge = retirementGoal ? retirementGoal.targetAge : 60;
  const yearsToRetirement = yearsUntil(currentAge, retirementAge);

  const retirementInflAdj = retirementGoal
    ? retirementGoal.inflAdjValue
    : inflationAdjusted(0, inflationPct, yearsToRetirement);

  const retirementAllocation = allocateForGoal(
    retirementGoal ? retirementGoal.risk : "medium",
    base,
    yearsToRetirement
  );

  const effRetRate =
    retirementAllocation.equity * returnRate +
    retirementAllocation.debt * (returnRate * 0.55) +
    retirementAllocation.gold * (returnRate * 0.6);

  const retirementSIPYears = Math.min(sipYears, yearsToRetirement);
  const retirementFV = fvSIP(sipMonthly, effRetRate, retirementSIPYears);
  const retirementGap = retirementGoal ? retirementInflAdj - retirementFV : null;

  return {
    profile: {
      currentAge,
      monthlyIncome,
      risk,
      inflationPct,
      sipMonthly,
      sipYears,
      returnRate,
      capacity
    },
    sipFV,
    goals: results,
    portfolioAllocation: {
      equity: portfolioEquityTarget,
      debt: portfolioDebtTarget,
      gold: portfolioGoldTarget
    },
    retirement: {
      retirementAge,
      yearsToRetirement,
      inflationAdjTarget: retirementGoal ? retirementInflAdj : null,
      retirementSIPYears,
      retirementFV,
      gap: retirementGoal ? retirementGap : null,
      allocation: retirementAllocation,
      effectiveRate: effRetRate
    }
  };
}

function goalDotColor(risk) {
  if (risk === "high") return "#dc2626";
  if (risk === "low") return "#0066cc";
  return "#0066cc";
}

/* Animate number counting up */
function animateValue(el, start, end, duration = 800, prefix = "") {
  if (!Number.isFinite(end)) { el.textContent = prefix + "—"; return; }
  const range = end - start;
  const startTime = performance.now();
  function tick(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = start + range * eased;
    el.textContent = prefix + fmtINR(current);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* Donut chart HTML */
function donutChartHTML(equity, debt, gold, colors) {
  const c1 = colors[0];
  const c2 = colors[1];
  const c3 = colors[2];
  const a1 = equity;
  const a2 = equity + debt;
  return `
    <div class="donut-wrap">
      <div class="donut" style="--p1:${c1};--a1:${a1}deg;--p2:${c2};--a2:${a2}deg;--p3:${c3};"></div>
      <div class="donut-center">${(equity / 3.6).toFixed(0)}%</div>
    </div>
  `;
}

/* Empty state helper */
function emptyGoalsHTML() {
  return `
    <tr>
      <td colspan="8">
        <div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
          <div>No goals added yet. Fill the form above and click <b>Add Goal</b>.</div>
        </div>
      </td>
    </tr>
  `;
}

function renderGoals() {
  const tbody = $("goalsTbody");
  tbody.innerHTML = "";

  const currentAge = Number($("age").value || 0);
  const inflationPct = Number($("inflation").value || 0);

  if (state.goals.length === 0) {
    tbody.innerHTML = emptyGoalsHTML();
    return;
  }

  state.goals.forEach((g, idx) => {
    const y = yearsUntil(currentAge, g.targetAge);
    const adj = inflationAdjusted(g.amountToday, inflationPct, y);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td data-label="#">${idx + 1}</td>
      <td data-label="Goal">
        <div class="goal-pill">
          <span class="dot" style="background:${goalDotColor(g.risk)}"></span>
          <div>
            <div style="font-weight:800">${escapeHtml(g.name)}</div>
            <div style="color:#6b7280;font-size:12px">${escapeHtml(g.type)}</div>
          </div>
        </div>
      </td>
      <td data-label="Target Age">${g.targetAge}</td>
      <td data-label="Priority">${g.priority}</td>
      <td data-label="Risk">${escapeHtml(g.risk)}</td>
      <td data-label="Amount Today (₹)">${fmtINR(g.amountToday)}</td>
      <td data-label="Inflation Adj. (₹)">${fmtINR(adj)}</td>
      <td data-label="">
        <div class="goal-actions">
          <button class="btn-small danger" data-del="${g.id}">Remove</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll("button[data-del]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-del");
      state.goals = state.goals.filter((g) => g.id !== id);
      renderGoals();
      $("results").innerHTML = "";
    });
  });
}

function renderRoadmap(roadmap) {
  const el = $("results");
  el.innerHTML = "";

  const alloc = roadmap.portfolioAllocation;
  const equityPct = alloc.equity * 100;
  const debtPct = alloc.debt * 100;
  const goldPct = alloc.gold * 100;

  const allocPct = [
    { name: "Equity", pct: alloc.equity, color: "#0066cc" },
    { name: "Debt", pct: alloc.debt, color: "#dc2626" },
    { name: "Gold", pct: alloc.gold, color: "#D4AF37" }
  ];

  const legend = allocPct
    .map(
      (x) => `
      <div class="legend-item">
        <div class="left"><span class="swatch" style="background:${x.color}"></span><span class="name">${x.name}</span></div>
        <div class="pct">${(x.pct * 100).toFixed(0)}%</div>
      </div>`
    )
    .join("");

  const top = document.createElement("div");
  top.className = "result-block";
  top.style.animationDelay = "0ms";

  const colors = ["#0066cc", "#dc2626", "#D4AF37"];

  top.innerHTML = `
    <div class="result-title">Portfolio Allocation (blended)</div>
    <div class="alloc-grid">
      <div>
        <div class="muted" style="margin-bottom:6px">Recommended allocation based on risk profile + goal mix + glide path</div>
        ${donutChartHTML(equityPct * 3.6, debtPct * 3.6, goldPct * 3.6, colors)}
        <div class="chart-legend" style="margin-top:10px">${legend}</div>
      </div>
      <div>
        <div class="kv">
          <div class="item">
            <div class="k">SIP FV (your inputs)</div>
            <div class="v" data-animate="${roadmap.sipFV}">₹${fmtINR(roadmap.sipFV)}</div>
          </div>
          <div class="item">
            <div class="k">Return assumption</div>
            <div class="v">${roadmap.profile.returnRate}% p.a.</div>
          </div>
        </div>
        <div class="progress" title="Equity share">
          <span style="width:0%" data-target="${equityPct.toFixed(0)}"></span>
        </div>
        <div class="muted" style="margin-top:6px;font-size:12px">Higher equity can boost growth; debt/gold stabilize.</div>
      </div>
    </div>
  `;

  el.appendChild(top);

  roadmap.goals.forEach((g, idx) => {
    const a = g.allocation;
    const required = g.requiredMonthly;
    const priorityLabel = g.priority === 1 ? "High" : g.priority === 2 ? "Medium" : "Lower";

    const blk = document.createElement("div");
    blk.className = "result-block";
    blk.style.animationDelay = `${(idx + 1) * 120}ms`;

    blk.innerHTML = `
      <div class="result-title">${idx + 1}. ${escapeHtml(g.name)} — ${escapeHtml(g.type)}</div>
      <div class="kv">
        <div class="item"><div class="k">Target Age</div><div class="v">${g.targetAge}</div></div>
        <div class="item"><div class="k">Priority</div><div class="v">${g.priority} (${priorityLabel})</div></div>
        <div class="item"><div class="k">Inflation-adjusted target</div><div class="v" data-animate="${g.inflAdjValue}">₹${fmtINR(g.inflAdjValue)}</div></div>
        <div class="item"><div class="k">Time horizon</div><div class="v">${g.yearsToGoal.toFixed(0)} years</div></div>
      </div>
      <div class="divider"></div>
      <div class="kv">
        <div class="item"><div class="k">Effective return (allocation-weighted)</div><div class="v">${g.effectiveRate.toFixed(1)}% p.a.</div></div>
        <div class="item"><div class="k">Required monthly SIP (approx)</div><div class="v" data-animate="${Number.isFinite(required) ? required : 0}">₹${Number.isFinite(required) ? fmtINR(required) : "∞"}</div></div>
      </div>
      <div class="divider"></div>
      <div class="alloc-grid">
        <div>
          <div class="muted" style="margin-bottom:8px">Recommended allocation for this goal</div>
          <div class="chart-legend">
            <div class="legend-item"><div class="left"><span class="swatch" style="background:#0066cc"></span><span class="name">Equity</span></div><div class="pct">${(a.equity * 100).toFixed(0)}%</div></div>
            <div class="legend-item"><div class="left"><span class="swatch" style="background:#dc2626"></span><span class="name">Debt</span></div><div class="pct">${(a.debt * 100).toFixed(0)}%</div></div>
            <div class="legend-item"><div class="left"><span class="swatch" style="background:#D4AF37"></span><span class="name">Gold</span></div><div class="pct">${(a.gold * 100).toFixed(0)}%</div></div>
          </div>
        </div>
        <div>
          <div class="muted" style="margin-bottom:8px">Gap intuition (based on your single SIP plan)</div>
          <div class="kv">
            <div class="item"><div class="k">Your SIP FV</div><div class="v" data-animate="${roadmap.sipFV}">₹${fmtINR(roadmap.sipFV)}</div></div>
            <div class="item"><div class="k">Goal inflation-adjusted</div><div class="v" data-animate="${g.inflAdjValue}">₹${fmtINR(g.inflAdjValue)}</div></div>
          </div>
          <div class="progress" title="Coverage ratio">
            <span style="width:0%" data-target="${clamp((roadmap.sipFV / g.inflAdjValue) * 100, 0, 100).toFixed(0)}"></span>
          </div>
          <div class="muted" style="margin-top:6px;font-size:12px">Coverage ≈ ${(g.inflAdjValue > 0 ? (roadmap.sipFV / g.inflAdjValue) : 0).toFixed(2)}×</div>
        </div>
      </div>
    `;

    el.appendChild(blk);
  });

  const ret = roadmap.retirement;
  const rb = document.createElement("div");
  rb.className = "result-block";
  rb.style.animationDelay = `${(roadmap.goals.length + 1) * 120}ms`;

  rb.innerHTML = `
    <div class="result-title">Retirement Projection</div>
    <div class="kv">
      <div class="item"><div class="k">Retirement Age</div><div class="v">${ret.retirementAge}</div></div>
      <div class="item"><div class="k">Horizon</div><div class="v">${ret.yearsToRetirement.toFixed(0)} years</div></div>
      <div class="item"><div class="k">Effective return</div><div class="v">${ret.effectiveRate.toFixed(1)}% p.a.</div></div>
      <div class="item"><div class="k">Projected retirement corpus</div><div class="v" data-animate="${ret.retirementFV}">₹${fmtINR(ret.retirementFV)}</div></div>
    </div>
    <div class="divider"></div>
    <div class="kv">
      <div class="item"><div class="k">Allocation at retirement</div><div class="v">Equity ${(ret.allocation.equity * 100).toFixed(0)}% · Debt ${(ret.allocation.debt * 100).toFixed(0)}% · Gold ${(ret.allocation.gold * 100).toFixed(0)}%</div></div>
      <div class="item"><div class="k">Inflation-adjusted retirement target</div><div class="v">${ret.inflationAdjTarget ? `<span data-animate="${ret.inflationAdjTarget}">₹${fmtINR(ret.inflationAdjTarget)}</span>` : "—"}</div></div>
    </div>
    ${ret.gap !== null ? `
      <div style="margin-top:10px" class="muted">Gap ≈ <b style="color:${ret.gap >= 0 ? "#0066cc" : "#dc2626"}">₹${fmtINR(ret.gap)}</b> (target - projected corpus)</div>
    ` : ""}
  `;

  el.appendChild(rb);

  // Trigger animations after paint
  requestAnimationFrame(() => {
    el.querySelectorAll(".progress > span[data-target]").forEach((bar) => {
      requestAnimationFrame(() => {
        bar.style.width = bar.getAttribute("data-target") + "%";
      });
    });

    el.querySelectorAll("[data-animate]").forEach((node) => {
      const end = Number(node.getAttribute("data-animate"));
      node.innerHTML = "";
      const wrapper = document.createElement("span");
      node.appendChild(wrapper);
      animateValue(wrapper, 0, end, 900, "₹");
    });
  });
}

function init() {
  const addGoal = () => {
    const name = $("goalName").value.trim();
    const type = $("goalType").value;
    const targetAge = Number($("goalAge").value);
    const amountToday = Number($("goalAmountToday").value);
    const priority = Number($("goalPriority").value);
    const risk = $("goalRisk").value;
    const share = $("goalShare").value;

    if (!name) return showToast("Goal name is required", "error");
    if (!Number.isFinite(targetAge) || targetAge < 0 || targetAge > 100) return showToast("Enter a valid target age (0-100)", "error");
    if (!Number.isFinite(amountToday) || amountToday < 0) return showToast("Enter a valid target amount", "error");

    state.goals.push({
      id: crypto.randomUUID(),
      name,
      type,
      targetAge,
      amountToday,
      priority,
      risk,
      share
    });

    renderGoals();
    $("results").innerHTML = "";
    showToast("Goal added successfully", "success");
  };

  $("addGoalBtn").addEventListener("click", addGoal);

  // Enter key in goal form inputs triggers add
  ["goalName", "goalAge", "goalAmountToday"].forEach((id) => {
    $(id).addEventListener("keydown", (e) => {
      if (e.key === "Enter") addGoal();
    });
  });

  $("clearGoalsBtn").addEventListener("click", () => {
    state.goals = [];
    renderGoals();
    $("results").innerHTML = "";
    showToast("Goals cleared", "success");
  });

  $("computeBtn").addEventListener("click", () => {
    if (state.goals.length === 0) return showToast("Add at least one goal", "error");
    if (!validateInputs()) return;

    const btn = $("computeBtn");
    const originalText = btn.innerHTML;
    btn.innerHTML = `<span class="spinner"></span>Computing...`;
    btn.disabled = true;

    // Small delay so the spinner is visible and the UI feels responsive
    setTimeout(() => {
      const roadmap = computeRoadmap();
      renderRoadmap(roadmap);
      btn.innerHTML = originalText;
      btn.disabled = false;

      // Smooth scroll to results
      $("results").scrollIntoView({ behavior: "smooth", block: "start" });
    }, 350);
  });

  ["age", "inflation"].forEach((id) => {
    $(id).addEventListener("input", () => {
      renderGoals();
    });
  });

  renderGoals();

  initInteractive();
  initKeyboardShortcuts({
    'Ctrl+Enter': () => $("computeBtn").click(),
    'Ctrl+g': () => $("addGoalBtn").click(),
  });
}

init();
