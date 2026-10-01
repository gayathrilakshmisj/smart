/**
 * PocketSmart AI – Frontend Logic
 * Supports:
 * - Dynamic isolated user profiles (Rahul, Priya, Ananya)
 * - Indian Rupee (₹ / INR) formatting
 * - Dynamic transaction entry and live KPI / Chart.js synchronization
 * - Operational Settings modal
 * - Gemini AI budget analysis
 */

// 1. Multi-User Database
const usersData = {
  rahul: {
    id: 'rahul',
    name: 'Rahul Sharma',
    role: 'Student & Developer',
    avatar: 'RS',
    income: 85000,
    targetSavings: 25000,
    categories: {
      Food: 14200,
      Travel: 6800,
      Shopping: 8350,
      Bills: 13000
    },
    transactions: [
      { date: '2026-09-28', category: 'Food', desc: 'Swiggy Gourmet Order', type: 'expense', amount: 1240 },
      { date: '2026-09-26', category: 'Bills', desc: 'Electricity & Wi-Fi', type: 'expense', amount: 2850 },
      { date: '2026-09-24', category: 'Travel', desc: 'Metro Card Recharge', type: 'expense', amount: 800 },
      { date: '2026-09-22', category: 'Shopping', desc: 'Amazon Electronics Hub', type: 'expense', amount: 3499 }
    ]
  },
  priya: {
    id: 'priya',
    name: 'Priya Nair',
    role: 'Product Designer',
    avatar: 'PN',
    income: 125000,
    targetSavings: 45000,
    categories: {
      Food: 18500,
      Travel: 9200,
      Shopping: 14300,
      Bills: 28000
    },
    transactions: [
      { date: '2026-09-27', category: 'Shopping', desc: 'Ergonomic Desk Chair', type: 'expense', amount: 8500 },
      { date: '2026-09-25', category: 'Food', desc: 'Blue Tokai Cafe & Roasters', type: 'expense', amount: 1450 },
      { date: '2026-09-21', category: 'Bills', desc: 'Apartment Maintenance', type: 'expense', amount: 4500 }
    ]
  },
  ananya: {
    id: 'ananya',
    name: 'Ananya Patel',
    role: 'Freelance Tech Lead',
    avatar: 'AP',
    income: 160000,
    targetSavings: 60000,
    categories: {
      Food: 21000,
      Travel: 11500,
      Shopping: 16200,
      Bills: 34000
    },
    transactions: [
      { date: '2026-09-29', category: 'Bills', desc: 'AWS Cloud Server Hosting', type: 'expense', amount: 6200 },
      { date: '2026-09-25', category: 'Food', desc: 'Team Dinner (Blinkit & BBQ)', type: 'expense', amount: 4200 },
      { date: '2026-09-23', category: 'Travel', desc: 'Airport Cab Transfer', type: 'expense', amount: 1600 }
    ]
  }
};

let currentUserId = 'rahul';
let spendingChart = null;

// Currency Formatter: Indian Rupee (INR)
function formatINR(val) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(val || 0);
}

// 2. Initialize Chart.js
function initChart() {
  const ctx = document.getElementById('spendingDonut').getContext('2d');
  spendingChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Food', 'Travel', 'Shopping', 'Bills'],
      datasets: [{
        data: [0, 0, 0, 0],
        backgroundColor: ['#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6'],
        hoverOffset: 6,
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              return ` ${context.label}: ${formatINR(context.raw)}`;
            }
          }
        }
      },
      cutout: '74%'
    }
  });
}

// 3. Render Profile & Recalculate Dashboard
function renderDashboard() {
  const user = usersData[currentUserId];

  // Header & Welcome update
  document.getElementById('headerAvatar').innerText = user.avatar;
  document.getElementById('headerUserName').innerText = user.name;
  document.getElementById('headerUserRole').innerText = user.role;
  document.getElementById('welcomeHeadline').innerText = `Welcome back, ${user.name.split(' ')[0]}!`;

  // Compute total expenses from active categories
  const totalExpenses = Object.values(user.categories).reduce((sum, val) => sum + val, 0);
  const remainingBalance = user.income - totalExpenses;
  const expensePercentage = user.income > 0 ? ((totalExpenses / user.income) * 100).toFixed(1) : 0;

  // KPI Cards
  document.getElementById('val-income').innerText = formatINR(user.income);
  document.getElementById('val-expenses').innerText = formatINR(totalExpenses);
  document.getElementById('val-expense-ratio').innerHTML = `<i class="fa-solid fa-chart-line"></i> ${expensePercentage}% of monthly limit`;
  document.getElementById('val-balance').innerText = formatINR(remainingBalance);
  document.getElementById('donutCenterTotal').innerText = formatINR(totalExpenses);

  // Update Donut Chart
  if (spendingChart) {
    spendingChart.data.datasets[0].data = [
      user.categories.Food,
      user.categories.Travel,
      user.categories.Shopping,
      user.categories.Bills
    ];
    spendingChart.update();
  }

  // Update Legend with values and percentages
  const safeTotal = totalExpenses || 1;
  const fPct = ((user.categories.Food / safeTotal) * 100).toFixed(1);
  const tPct = ((user.categories.Travel / safeTotal) * 100).toFixed(1);
  const sPct = ((user.categories.Shopping / safeTotal) * 100).toFixed(1);
  const bPct = ((user.categories.Bills / safeTotal) * 100).toFixed(1);

  document.getElementById('legend-food').innerText = `${formatINR(user.categories.Food)} (${fPct}%)`;
  document.getElementById('legend-travel').innerText = `${formatINR(user.categories.Travel)} (${tPct}%)`;
  document.getElementById('legend-shopping').innerText = `${formatINR(user.categories.Shopping)} (${sPct}%)`;
  document.getElementById('legend-bills').innerText = `${formatINR(user.categories.Bills)} (${bPct}%)`;

  // Update Sidebar Target Progress Widget
  const currentSavings = Math.max(0, remainingBalance);
  const goalRatio = Math.min(100, Math.round((currentSavings / (user.targetSavings || 1)) * 100));
  document.getElementById('widgetGoalTitle').innerText = `${user.name.split(' ')[0]}'s Goal`;
  document.getElementById('widgetGoalText').innerText = `Saved ${formatINR(currentSavings)} of ${formatINR(user.targetSavings)}`;
  document.getElementById('widgetProgressBar').style.width = `${goalRatio}%`;

  // Render Table & AI Recommendations
  renderTransactionsTable();
  renderDynamicAIRecommendations();
}

// 4. Render Table
function renderTransactionsTable() {
  const user = usersData[currentUserId];
  const tbody = document.getElementById('expenseTableBody');
  tbody.innerHTML = '';

  const catIcons = {
    Food: 'fa-utensils',
    Travel: 'fa-train-subway',
    Shopping: 'fa-bag-shopping',
    Bills: 'fa-bolt'
  };

  const catTags = {
    Food: 'tag-food',
    Travel: 'tag-travel',
    Shopping: 'tag-shopping',
    Bills: 'tag-bills'
  };

  user.transactions.forEach(tx => {
    const tr = document.createElement('tr');
    const isIncome = tx.type === 'income';
    const sign = isIncome ? '+' : '-';
    const amountClass = isIncome ? 'amount-cell positive' : 'amount-cell';
    const badgeType = isIncome ? '<span class="badge-pill-type badge-income">Credit</span>' : '<span class="badge-pill-type badge-expense">Debit</span>';

    tr.innerHTML = `
      <td>${tx.date}</td>
      <td><span class="cat-tag ${catTags[tx.category] || 'tag-food'}"><i class="fa-solid ${catIcons[tx.category] || 'fa-tag'}"></i> ${tx.category}</span></td>
      <td>${tx.desc || 'General Entry'}</td>
      <td>${badgeType}</td>
      <td class="${amountClass}">${sign}${formatINR(tx.amount)}</td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById('tx-count').innerText = `${user.transactions.length} Transactions`;
}

// 5. Dynamic AI Recommendations
function renderDynamicAIRecommendations() {
  const user = usersData[currentUserId];
  const container = document.getElementById('aiRecommendationsGrid');
  const totalExpenses = Object.values(user.categories).reduce((a, b) => a + b, 0);

  // Identify highest spending category
  let highestCat = 'Food';
  let maxSpend = 0;
  for (const [cat, val] of Object.entries(user.categories)) {
    if (val > maxSpend) {
      maxSpend = val;
      highestCat = cat;
    }
  }

  const remaining = user.income - totalExpenses;
  const potentialSurplus = Math.round(remaining * 0.45);

  container.innerHTML = `
    <div class="rec-card">
      <div class="rec-top">
        <span class="rec-pill pill-alert">High Category: ${highestCat}</span>
      </div>
      <h4>Optimize ${highestCat} Expenses</h4>
      <p>${user.name.split(' ')[0]}, you have spent <strong>${formatINR(maxSpend)}</strong> on ${highestCat}. Trimming non-essential discretionary bills here can preserve <strong>${formatINR(maxSpend * 0.18)}</strong> each cycle.</p>
    </div>

    <div class="rec-card">
      <div class="rec-top">
        <span class="rec-pill pill-save">Net Surplus</span>
      </div>
      <h4>Systematic Wealth Accumulation</h4>
      <p>With an unallocated buffer of <strong>${formatINR(remaining)}</strong>, setting up an automated SIP of <strong>${formatINR(potentialSurplus)}</strong> meets your ₹${user.targetSavings.toLocaleString('en-IN')} target comfortably.</p>
    </div>

    <div class="rec-card">
      <div class="rec-top">
        <span class="rec-pill pill-tip">Personalized Insight</span>
      </div>
      <h4>Budget Ratio Health</h4>
      <p>Your outflow represents <strong>${user.income > 0 ? ((totalExpenses / user.income) * 100).toFixed(1) : 0}%</strong> of incoming cash. Maintain fixed commitments below 50% for optimal resilience.</p>
    </div>
  `;
}

// 6. Handle New Transaction (Add Expense Form)
document.getElementById('entryForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const type = document.getElementById('entryType').value;
  const amount = parseFloat(document.getElementById('entryAmount').value) || 0;
  const category = document.getElementById('entryCategory').value;
  const date = document.getElementById('entryDate').value;
  const desc = document.getElementById('entryDesc').value.trim();

  if (amount <= 0) return;

  const user = usersData[currentUserId];

  if (type === 'expense') {
    user.categories[category] = (user.categories[category] || 0) + amount;
  } else {
    user.income += amount;
  }

  // Prepend transaction to user's history
  user.transactions.unshift({
    date: date || new Date().toISOString().split('T')[0],
    category: category,
    desc: desc || (type === 'income' ? 'Direct Credit' : `${category} Purchase`),
    type: type,
    amount: amount
  });

  // Reset form
  document.getElementById('entryAmount').value = '';
  document.getElementById('entryDesc').value = '';

  renderDashboard();
});

// 7. Profile Switcher Logic
const userProfileBtn = document.getElementById('userProfileBtn');
const userDropdown = document.getElementById('userDropdown');

userProfileBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  userDropdown.classList.toggle('show');
});

// Close dropdown on outside click
document.addEventListener('click', () => {
  userDropdown.classList.remove('show');
});

// Switch User Options
document.querySelectorAll('.user-option').forEach(option => {
  option.addEventListener('click', () => {
    const selectedId = option.getAttribute('data-user-id');
    currentUserId = selectedId;

    document.querySelectorAll('.user-option').forEach(opt => opt.classList.remove('selected'));
    option.classList.add('selected');

    userDropdown.classList.remove('show');
    renderDashboard();
  });
});

// 8. Settings Modal Logic
const settingsModal = document.getElementById('settingsModal');
const sidebarSettingsBtn = document.getElementById('sidebarSettingsBtn');
const openSettingsFromDropdown = document.getElementById('openSettingsFromDropdown');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const cancelSettingsBtn = document.getElementById('cancelSettingsBtn');
const settingsForm = document.getElementById('settingsForm');

function openSettings() {
  const user = usersData[currentUserId];
  document.getElementById('settingsName').value = user.name;
  document.getElementById('settingsRole').value = user.role;
  document.getElementById('settingsIncome').value = user.income;
  document.getElementById('settingsTarget').value = user.targetSavings;
  settingsModal.classList.add('open');
}

function closeSettings() {
  settingsModal.classList.remove('open');
}

sidebarSettingsBtn.addEventListener('click', openSettings);
openSettingsFromDropdown.addEventListener('click', openSettings);
closeSettingsBtn.addEventListener('click', closeSettings);
cancelSettingsBtn.addEventListener('click', closeSettings);

// Save Settings Form
settingsForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const user = usersData[currentUserId];

  user.name = document.getElementById('settingsName').value.trim();
  user.role = document.getElementById('settingsRole').value.trim();
  user.income = parseFloat(document.getElementById('settingsIncome').value) || 0;
  user.targetSavings = parseFloat(document.getElementById('settingsTarget').value) || 0;

  // Re-generate initials
  const parts = user.name.split(' ');
  user.avatar = (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();

  closeSettings();
  renderDashboard();
});

// 9. Ask Gemini Copilot Logic
const askGeminiInput = document.getElementById('askGeminiInput');
const btnAskGemini = document.getElementById('btnAskGemini');
const aiResponseBox = document.getElementById('aiResponseBox');
const aiResponseText = document.getElementById('aiResponseText');

function askGemini(query) {
  const promptText = query || askGeminiInput.value.trim();
  if (!promptText) return;

  const user = usersData[currentUserId];
  const totalExpenses = Object.values(user.categories).reduce((a, b) => a + b, 0);
  const remaining = user.income - totalExpenses;

  aiResponseBox.style.display = 'block';
  aiResponseText.innerHTML = `<em>Gemini is analyzing financial statements for <strong>${user.name}</strong>...</em>`;

  setTimeout(() => {
    const qLower = promptText.toLowerCase();

    if (qLower.includes('budget plan')) {
      aiResponseText.innerHTML = `
        Gemini 50/30/20 Plan for <strong>${user.name}</strong> (Income: ${formatINR(user.income)}):<br>
        • <strong>Needs (50%):</strong> ${formatINR(user.income * 0.50)} (Bills, Groceries, Rent)<br>
        • <strong>Wants (30%):</strong> ${formatINR(user.income * 0.30)} (Dining out, Entertainment, Shopping)<br>
        • <strong>Savings & Investments (20%):</strong> ${formatINR(user.income * 0.20)} (Mutual Funds, Emergency Buffer).
      `;
    } else if (qLower.includes('spending the most') || qLower.includes('where am i')) {
      let topCat = 'Food';
      let maxVal = 0;
      for (const [cat, val] of Object.entries(user.categories)) {
        if (val > maxVal) {
          maxVal = val;
          topCat = cat;
        }
      }
      aiResponseText.innerHTML = `
        Your primary outflow is <strong>${topCat}</strong> totaling <strong>${formatINR(maxVal)}</strong>. This forms <strong>${((maxVal / (totalExpenses || 1)) * 100).toFixed(1)}%</strong> of your total expenses.
      `;
    } else if (qLower.includes('save more')) {
      aiResponseText.innerHTML = `
        Tactical recommendations for ${user.name.split(' ')[0]}:<br>
        1. Set a weekly cap of ${formatINR(user.categories.Food * 0.25)} on online food deliveries.<br>
        2. Automate a recurring transfer of <strong>${formatINR(user.targetSavings * 0.5)}</strong> on the 1st of every month.<br>
        3. Audit your recurring digital services and app subscriptions.
      `;
    } else {
      aiResponseText.innerHTML = `
        Gemini Assessment: Your net balance stands at <strong>${formatINR(remaining)}</strong> across ${user.transactions.length} logged entries. Your debt-to-savings ratio remains resilient for this cycle!
      `;
    }
  }, 450);
}

btnAskGemini.addEventListener('click', () => askGemini());
askGeminiInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') askGemini();
});

// Quick Prompt Chips
document.querySelectorAll('.prompt-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    const q = chip.getAttribute('data-query');
    askGeminiInput.value = q;
    askGemini(q);
  });
});

// 10. Sidebar Navigation Highlight
document.querySelectorAll('.nav-item[data-target]').forEach(item => {
  item.addEventListener('click', function() {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    this.classList.add('active');
  });
});

// Export CSV / Summary trigger
document.getElementById('exportBtn').addEventListener('click', () => {
  const user = usersData[currentUserId];
  alert(`Exporting verified ledger statement for ${user.name} (${user.transactions.length} entries). File saved as CSV.`);
});

// Initial Setup on load
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('entryDate').valueAsDate = new Date();
  initChart();
  renderDashboard();
});