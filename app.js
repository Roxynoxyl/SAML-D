// =============================================
//  SAML-D — Application Logic
// =============================================

(function () {
    'use strict';

    // --- State ---
    let currentPage = 'dashboard';
    let currentTxnPage = 1;
    const TXN_PER_PAGE = 15;
    let selectedTransaction = null;

    // --- DOM Refs ---
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    // --- Navigation ---
    function initNavigation() {
        $$('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                navigateTo(page);
            });
        });

        $$('.view-all-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                navigateTo(page);
            });
        });

        $('#menu-toggle').addEventListener('click', () => {
            $('#sidebar').classList.toggle('open');
        });
    }

    function navigateTo(page) {
        currentPage = page;

        // Update nav
        $$('.nav-item').forEach(n => n.classList.remove('active'));
        $(`.nav-item[data-page="${page}"]`).classList.add('active');

        // Update pages
        $$('.page').forEach(p => p.classList.add('hidden'));
        $(`#page-${page}`).classList.remove('hidden');

        // Update title
        const titles = {
            dashboard: ['Dashboard', 'Real-time AML transaction monitoring overview'],
            transactions: ['Transactions', 'Monitor and analyze all financial transactions'],
            alerts: ['Alerts', 'Review and investigate suspicious activity alerts'],
            customers: ['Customers', 'Customer risk profiles and due diligence'],
            rules: ['Rules Engine', 'Configure AML detection rules and thresholds'],
            reports: ['Reports', 'Generate regulatory compliance reports']
        };
        const [title, subtitle] = titles[page] || ['Dashboard', ''];
        $('#page-title h1').textContent = title;
        $('.page-subtitle').textContent = subtitle;

        // Close sidebar on mobile
        $('#sidebar').classList.remove('open');
    }

    // --- Dashboard ---
    function renderDashboard() {
        // Stats
        animateCounter('stat-total-value', DATA.transactions.length * 47);
        animateCounter('stat-flagged-value', DATA.transactions.filter(t => t.status === 'flagged').length);
        animateCounter('stat-sar-value', DATA.alerts.filter(a => a.severity === 'critical' && a.status === 'resolved').length);
        animateCounter('stat-risk-value', DATA.customers.filter(c => c.riskLevel === 'critical' || c.riskLevel === 'high').length);

        // Alert badge count
        const newAlerts = DATA.alerts.filter(a => a.status === 'new').length;
        $('#alert-badge').textContent = newAlerts;
        if (newAlerts === 0) $('#alert-badge').style.display = 'none';

        // Recent Alerts
        const recentAlerts = DATA.alerts.slice(0, 5);
        const alertsHtml = recentAlerts.map(a => `
            <div class="alert-item ${a.severity}" data-alert-id="${a.id}">
                <span class="alert-severity-badge badge-${a.severity}">${a.severity}</span>
                <div class="alert-info">
                    <div class="alert-title">${a.title}</div>
                    <div class="alert-meta">${a.customer} · ${a.relatedTransactions} related transactions</div>
                </div>
                <span class="alert-time">${timeAgo(a.date)}</span>
            </div>
        `).join('');
        $('#recent-alerts').innerHTML = alertsHtml;

        // Top Entities
        const topEntities = [...DATA.customers]
            .sort((a, b) => b.riskScore - a.riskScore)
            .slice(0, 5);
        const entitiesHtml = topEntities.map(c => `
            <div class="entity-item">
                <div class="entity-avatar" style="background: ${c.avatarColor}">${c.name.split(' ').map(n => n[0]).join('').substring(0, 2)}</div>
                <div class="entity-info">
                    <div class="entity-name">${c.name}</div>
                    <div class="entity-detail">${c.country} · ${c.type} · ${c.totalTransactions} txns</div>
                </div>
                <span class="entity-score score-${c.riskLevel}">${c.riskScore}</span>
            </div>
        `).join('');
        $('#top-entities').innerHTML = entitiesHtml;

        // Charts
        renderVolumeChart();
        renderRiskChart();
    }

    function animateCounter(elementId, target) {
        const el = $(`#${elementId}`);
        const duration = 1200;
        const start = performance.now();
        const startVal = 0;

        function update(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(startVal + (target - startVal) * eased);
            el.textContent = current.toLocaleString();
            if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    }

    function timeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    }

    // --- Charts ---
    let volumeChartInstance = null;
    let riskChartInstance = null;

    function renderVolumeChart() {
        const ctx = $('#volumeChart').getContext('2d');
        if (volumeChartInstance) volumeChartInstance.destroy();

        const gradient = ctx.createLinearGradient(0, 0, 0, 260);
        gradient.addColorStop(0, 'rgba(108, 137, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(108, 137, 255, 0.0)');

        volumeChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: DATA.chartData.volumeLabels,
                datasets: [
                    {
                        label: 'Transactions',
                        data: DATA.chartData.volumeData,
                        borderColor: '#6c89ff',
                        backgroundColor: gradient,
                        borderWidth: 2.5,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#6c89ff',
                        pointBorderColor: '#0a0e1a',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    },
                    {
                        label: 'Alerts',
                        data: DATA.chartData.alertData,
                        borderColor: '#f87171',
                        backgroundColor: 'rgba(248, 113, 113, 0.05)',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.4,
                        pointBackgroundColor: '#f87171',
                        pointBorderColor: '#0a0e1a',
                        pointBorderWidth: 2,
                        pointRadius: 3,
                        pointHoverRadius: 5,
                        borderDash: [5, 5]
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        align: 'end',
                        labels: {
                            color: '#8892a8',
                            font: { family: 'Inter', size: 11 },
                            usePointStyle: true,
                            pointStyle: 'circle',
                            padding: 16
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
                        ticks: { color: '#5a6478', font: { family: 'Inter', size: 11 } }
                    },
                    y: {
                        grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
                        ticks: { color: '#5a6478', font: { family: 'Inter', size: 11 } }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }

    function renderRiskChart() {
        const ctx = $('#riskChart').getContext('2d');
        if (riskChartInstance) riskChartInstance.destroy();

        const riskCounts = {
            low: DATA.customers.filter(c => c.riskLevel === 'low').length,
            medium: DATA.customers.filter(c => c.riskLevel === 'medium').length,
            high: DATA.customers.filter(c => c.riskLevel === 'high').length,
            critical: DATA.customers.filter(c => c.riskLevel === 'critical').length,
        };

        riskChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Low', 'Medium', 'High', 'Critical'],
                datasets: [{
                    data: [riskCounts.low, riskCounts.medium, riskCounts.high, riskCounts.critical],
                    backgroundColor: ['#34d399', '#fbbf24', '#fb923c', '#f87171'],
                    borderColor: '#141a2e',
                    borderWidth: 3,
                    hoverOffset: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#8892a8',
                            font: { family: 'Inter', size: 11 },
                            usePointStyle: true,
                            pointStyle: 'circle',
                            padding: 16
                        }
                    }
                }
            }
        });
    }

    // --- Transactions Page ---
    function renderTransactions() {
        let filtered = [...DATA.transactions];

        // Apply filters
        const statusFilter = $('#filter-status').value;
        const riskFilter = $('#filter-risk').value;

        if (statusFilter !== 'all') filtered = filtered.filter(t => t.status === statusFilter);
        if (riskFilter !== 'all') filtered = filtered.filter(t => t.riskLevel === riskFilter);

        // Pagination
        const totalPages = Math.ceil(filtered.length / TXN_PER_PAGE);
        const start = (currentTxnPage - 1) * TXN_PER_PAGE;
        const pageData = filtered.slice(start, start + TXN_PER_PAGE);

        const tbody = $('#transactions-tbody');
        tbody.innerHTML = pageData.map(t => `
            <tr data-txn-id="${t.id}">
                <td><span class="txn-id">${t.id}</span></td>
                <td>${DATA.formatDateTime(t.date)}</td>
                <td>${t.sender.name} <small style="color: var(--text-muted)">(${t.sender.country})</small></td>
                <td>${t.receiver.name} <small style="color: var(--text-muted)">(${t.receiver.country})</small></td>
                <td><span class="txn-amount ${t.amount > 50000 ? 'large' : ''}">${DATA.formatCurrency(t.amount)}</span></td>
                <td>${t.type}</td>
                <td>
                    <div class="risk-score-cell">
                        <div class="risk-bar"><div class="risk-bar-fill ${t.riskLevel}" style="width: ${t.riskScore}%"></div></div>
                        <span class="risk-score-num score-${t.riskLevel}">${t.riskScore}</span>
                    </div>
                </td>
                <td><span class="status-badge status-${t.status}">${t.status}</span></td>
                <td>
                    <div class="table-actions">
                        <button class="action-btn" title="View Details" onclick="window.APP.viewTransaction('${t.id}')">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        </button>
                        <button class="action-btn" title="Flag" onclick="window.APP.flagTransaction('${t.id}')">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        // Pagination controls
        const paginationHtml = [];
        paginationHtml.push(`<button class="page-btn" ${currentTxnPage === 1 ? 'disabled' : ''} onclick="window.APP.changeTxnPage(${currentTxnPage - 1})">← Prev</button>`);
        for (let i = 1; i <= totalPages; i++) {
            if (totalPages > 7 && i > 3 && i < totalPages - 2 && Math.abs(i - currentTxnPage) > 1) {
                if (i === 4) paginationHtml.push('<span style="color: var(--text-muted); padding: 0 8px">...</span>');
                continue;
            }
            paginationHtml.push(`<button class="page-btn ${i === currentTxnPage ? 'active' : ''}" onclick="window.APP.changeTxnPage(${i})">${i}</button>`);
        }
        paginationHtml.push(`<button class="page-btn" ${currentTxnPage === totalPages ? 'disabled' : ''} onclick="window.APP.changeTxnPage(${currentTxnPage + 1})">Next →</button>`);
        $('#txn-pagination').innerHTML = paginationHtml.join('');
    }

    // --- Alerts Page ---
    function renderAlerts() {
        let filtered = [...DATA.alerts];

        const sevFilter = $('#filter-alert-severity').value;
        const statusFilter = $('#filter-alert-status').value;

        if (sevFilter !== 'all') filtered = filtered.filter(a => a.severity === sevFilter);
        if (statusFilter !== 'all') filtered = filtered.filter(a => a.status === statusFilter);

        const html = filtered.map(a => `
            <div class="alert-card ${a.severity}">
                <div class="alert-card-header">
                    <div>
                        <span class="alert-severity-badge badge-${a.severity}">${a.severity}</span>
                        <span class="alert-status-badge alert-status-${a.status}" style="margin-left: 8px">${a.status}</span>
                    </div>
                    <span class="alert-card-title">${a.id}</span>
                </div>
                <h4 style="margin-bottom: 8px; font-size: 1.05rem">${a.title}</h4>
                <div class="alert-card-body">${a.description}</div>
                <div class="alert-card-footer">
                    <div class="alert-card-meta">
                        <span>Customer: <strong style="color: var(--text-primary)">${a.customer}</strong></span>
                        <span>Related: <strong style="color: var(--text-primary)">${a.relatedTransactions} txns</strong></span>
                        <span>${DATA.formatDateTime(a.date)}</span>
                    </div>
                    <div class="alert-card-actions">
                        ${a.status === 'new' ? `
                            <button class="btn btn-sm btn-outline" onclick="window.APP.updateAlertStatus('${a.id}', 'investigating')">Investigate</button>
                            <button class="btn btn-sm btn-outline" onclick="window.APP.updateAlertStatus('${a.id}', 'dismissed')">Dismiss</button>
                        ` : a.status === 'investigating' ? `
                            <button class="btn btn-sm btn-primary" onclick="window.APP.updateAlertStatus('${a.id}', 'resolved')">Resolve</button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');

        $('#alerts-container').innerHTML = html || '<p style="text-align:center;color:var(--text-muted);padding:40px">No alerts match the selected filters.</p>';
    }

    // --- Customers Page ---
    function renderCustomers() {
        let filtered = [...DATA.customers];
        const riskFilter = $('#filter-customer-risk').value;
        if (riskFilter !== 'all') filtered = filtered.filter(c => c.riskLevel === riskFilter);

        filtered.sort((a, b) => b.riskScore - a.riskScore);

        const fillColor = (level) => {
            const colors = { low: 'var(--accent-green)', medium: 'var(--accent-yellow)', high: 'var(--accent-orange)', critical: 'var(--accent-red)' };
            return colors[level] || colors.low;
        };

        const html = filtered.map(c => `
            <div class="customer-card">
                <div class="customer-card-top">
                    <div class="customer-avatar" style="background: ${c.avatarColor}">${c.name.split(' ').map(n => n[0]).join('').substring(0, 2)}</div>
                    <div>
                        <div class="customer-name">${c.name}</div>
                        <div class="customer-id">${c.id} · ${c.country} · ${c.type}</div>
                    </div>
                    <span class="status-badge status-${c.riskLevel === 'critical' ? 'blocked' : c.riskLevel === 'high' ? 'flagged' : c.riskLevel === 'medium' ? 'pending' : 'completed'}" style="margin-left:auto">${c.riskLevel}</span>
                </div>
                <div class="customer-stats">
                    <div class="customer-stat">
                        <div class="customer-stat-value">${c.totalTransactions}</div>
                        <div class="customer-stat-label">Transactions</div>
                    </div>
                    <div class="customer-stat">
                        <div class="customer-stat-value">${DATA.formatCurrency(c.totalVolume).split('.')[0]}</div>
                        <div class="customer-stat-label">Volume</div>
                    </div>
                    <div class="customer-stat">
                        <div class="customer-stat-value">${c.flaggedCount}</div>
                        <div class="customer-stat-label">Flagged</div>
                    </div>
                </div>
                <div class="customer-risk-section">
                    <div class="customer-risk-bar">
                        <div class="customer-risk-fill" style="width: ${c.riskScore}%; background: ${fillColor(c.riskLevel)}"></div>
                    </div>
                    <span class="entity-score score-${c.riskLevel}">${c.riskScore}</span>
                </div>
            </div>
        `).join('');

        $('#customers-grid').innerHTML = html;
    }

    // --- Rules Page ---
    function renderRules() {
        const html = DATA.rules.map(r => `
            <div class="rule-card">
                <div class="rule-header">
                    <span class="rule-title">${r.title}</span>
                    <button class="rule-toggle ${r.active ? 'active' : ''}" data-rule-id="${r.id}" onclick="window.APP.toggleRule('${r.id}')"></button>
                </div>
                <div class="rule-description">${r.description}</div>
                <div class="rule-params">
                    ${Object.entries(r.params).map(([k, v]) => `
                        <div class="rule-param">
                            <span class="rule-param-label">${k}:</span>
                            <span class="rule-param-value">${v}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="rule-footer">
                    <span class="rule-stat">Triggered <strong>${r.triggered}</strong> times</span>
                    <span class="rule-stat">Last: <strong>${DATA.formatDate(r.lastTriggered)}</strong></span>
                    <span class="rule-stat" style="color:${r.active ? 'var(--accent-green)' : 'var(--text-muted)'}">● ${r.active ? 'Active' : 'Disabled'}</span>
                </div>
            </div>
        `).join('');

        $('#rules-list').innerHTML = html;
    }

    // --- Reports Page ---
    function initReports() {
        $('#btn-gen-sar').addEventListener('click', () => generateReport('SAR'));
        $('#btn-gen-ctr').addEventListener('click', () => generateReport('CTR'));
        $('#btn-gen-risk').addEventListener('click', () => generateReport('Risk Assessment'));
        $('#btn-gen-audit').addEventListener('click', () => generateReport('Audit Trail'));
        $('#btn-close-report').addEventListener('click', () => {
            $('#generated-report').classList.add('hidden');
        });
        $('#btn-download-report').addEventListener('click', () => {
            showToast('Report downloaded successfully', 'success');
        });
    }

    function generateReport(type) {
        const flaggedTxns = DATA.transactions.filter(t => t.status === 'flagged' || t.status === 'blocked');
        const criticalAlerts = DATA.alerts.filter(a => a.severity === 'critical' || a.severity === 'high');
        const now = new Date();

        let html = '';
        const reportDate = DATA.formatDateTime(now);

        if (type === 'SAR') {
            html = `
                <p><strong>Report Generated:</strong> ${reportDate}</p>
                <p><strong>Reporting Period:</strong> Last 30 Days</p>
                <p><strong>Filing Institution:</strong> SAML-D Compliance Division</p>

                <h4>Summary of Suspicious Activities</h4>
                <p>During the reporting period, ${flaggedTxns.length} transactions were flagged for suspicious activity.
                ${criticalAlerts.length} alerts were raised with high or critical severity.</p>

                <table>
                    <thead><tr><th>Transaction ID</th><th>Amount</th><th>Status</th><th>Risk</th><th>Type</th></tr></thead>
                    <tbody>
                        ${flaggedTxns.slice(0, 10).map(t => `<tr><td>${t.id}</td><td>${DATA.formatCurrency(t.amount)}</td><td>${t.status}</td><td>${t.riskScore}/100</td><td>${t.type}</td></tr>`).join('')}
                    </tbody>
                </table>

                <h4>Recommended Actions</h4>
                <p>1. File SAR with FinCEN for ${flaggedTxns.filter(t => t.riskScore >= 80).length} critical transactions.<br>
                2. Enhanced due diligence required for ${DATA.customers.filter(c => c.riskLevel === 'critical').length} customers.<br>
                3. Block pending transactions from high-risk entities until review complete.</p>
            `;
        } else if (type === 'CTR') {
            const ctrTxns = DATA.transactions.filter(t => t.amount >= 10000 && (t.type === 'Cash Deposit' || t.type === 'Cash Withdrawal'));
            html = `
                <p><strong>Report Generated:</strong> ${reportDate}</p>
                <p><strong>Reporting Period:</strong> Last 30 Days</p>
                <p><strong>CTR Threshold:</strong> $10,000.00</p>

                <h4>Reportable Cash Transactions</h4>
                <p>Total cash transactions exceeding threshold: <strong>${ctrTxns.length}</strong></p>

                <table>
                    <thead><tr><th>Transaction ID</th><th>Customer</th><th>Amount</th><th>Type</th><th>Date</th></tr></thead>
                    <tbody>
                        ${ctrTxns.slice(0, 10).map(t => `<tr><td>${t.id}</td><td>${t.sender.name}</td><td>${DATA.formatCurrency(t.amount)}</td><td>${t.type}</td><td>${DATA.formatDate(t.date)}</td></tr>`).join('')}
                        ${ctrTxns.length === 0 ? '<tr><td colspan="5" style="text-align:center;color:var(--text-muted)">No reportable transactions found</td></tr>' : ''}
                    </tbody>
                </table>
            `;
        } else if (type === 'Risk Assessment') {
            html = `
                <p><strong>Report Generated:</strong> ${reportDate}</p>

                <h4>Customer Risk Distribution</h4>
                <table>
                    <thead><tr><th>Risk Level</th><th>Count</th><th>Percentage</th></tr></thead>
                    <tbody>
                        <tr><td>🟢 Low</td><td>${DATA.customers.filter(c => c.riskLevel === 'low').length}</td><td>${(DATA.customers.filter(c => c.riskLevel === 'low').length / DATA.customers.length * 100).toFixed(1)}%</td></tr>
                        <tr><td>🟡 Medium</td><td>${DATA.customers.filter(c => c.riskLevel === 'medium').length}</td><td>${(DATA.customers.filter(c => c.riskLevel === 'medium').length / DATA.customers.length * 100).toFixed(1)}%</td></tr>
                        <tr><td>🟠 High</td><td>${DATA.customers.filter(c => c.riskLevel === 'high').length}</td><td>${(DATA.customers.filter(c => c.riskLevel === 'high').length / DATA.customers.length * 100).toFixed(1)}%</td></tr>
                        <tr><td>🔴 Critical</td><td>${DATA.customers.filter(c => c.riskLevel === 'critical').length}</td><td>${(DATA.customers.filter(c => c.riskLevel === 'critical').length / DATA.customers.length * 100).toFixed(1)}%</td></tr>
                    </tbody>
                </table>

                <h4>High-Risk Country Exposure</h4>
                <p>Transactions involving FATF high-risk jurisdictions: <strong>${DATA.transactions.filter(t => DATA.highRiskCountries.includes(t.sender.country) || DATA.highRiskCountries.includes(t.receiver.country)).length}</strong></p>

                <h4>Recommendations</h4>
                <p>1. Increase monitoring frequency for ${DATA.customers.filter(c => c.riskLevel === 'critical').length} critical-risk customers.<br>
                2. Schedule enhanced due diligence reviews for high-risk segments.<br>
                3. Update KYC documentation for customers with scores above 60.</p>
            `;
        } else {
            html = `
                <p><strong>Report Generated:</strong> ${reportDate}</p>
                <p><strong>Period:</strong> Last 30 Days</p>

                <h4>System Activity Summary</h4>
                <table>
                    <thead><tr><th>Action</th><th>Count</th></tr></thead>
                    <tbody>
                        <tr><td>Transactions Processed</td><td>${DATA.transactions.length}</td></tr>
                        <tr><td>Alerts Generated</td><td>${DATA.alerts.length}</td></tr>
                        <tr><td>Alerts Resolved</td><td>${DATA.alerts.filter(a => a.status === 'resolved').length}</td></tr>
                        <tr><td>Alerts Dismissed</td><td>${DATA.alerts.filter(a => a.status === 'dismissed').length}</td></tr>
                        <tr><td>Transactions Flagged</td><td>${DATA.transactions.filter(t => t.status === 'flagged').length}</td></tr>
                        <tr><td>Transactions Blocked</td><td>${DATA.transactions.filter(t => t.status === 'blocked').length}</td></tr>
                        <tr><td>Active AML Rules</td><td>${DATA.rules.filter(r => r.active).length} / ${DATA.rules.length}</td></tr>
                    </tbody>
                </table>

                <h4>Compliance Status</h4>
                <p>✅ All CTR filings up to date<br>
                ✅ AML rules engine operational<br>
                ✅ Customer risk profiles updated<br>
                ⚠️ ${DATA.alerts.filter(a => a.status === 'new').length} alerts pending review</p>
            `;
        }

        $('#report-display-title').textContent = `${type} Report`;
        $('#report-display-body').innerHTML = html;
        $('#generated-report').classList.remove('hidden');
        showToast(`${type} report generated successfully`, 'success');
    }

    // --- Actions ---
    function viewTransaction(txnId) {
        const txn = DATA.transactions.find(t => t.id === txnId);
        if (!txn) return;
        selectedTransaction = txn;

        const body = `
            <div class="modal-detail-row"><span class="modal-detail-label">Transaction ID</span><span class="modal-detail-value" style="font-family: monospace; color: var(--accent-blue)">${txn.id}</span></div>
            <div class="modal-detail-row"><span class="modal-detail-label">Date & Time</span><span class="modal-detail-value">${DATA.formatDateTime(txn.date)}</span></div>
            <div class="modal-detail-row"><span class="modal-detail-label">Sender</span><span class="modal-detail-value">${txn.sender.name} (${txn.sender.country})</span></div>
            <div class="modal-detail-row"><span class="modal-detail-label">Receiver</span><span class="modal-detail-value">${txn.receiver.name} (${txn.receiver.country})</span></div>
            <div class="modal-detail-row"><span class="modal-detail-label">Amount</span><span class="modal-detail-value" style="font-size: 1.1rem; font-weight: 800">${DATA.formatCurrency(txn.amount)}</span></div>
            <div class="modal-detail-row"><span class="modal-detail-label">Type</span><span class="modal-detail-value">${txn.type}</span></div>
            <div class="modal-detail-row"><span class="modal-detail-label">Risk Score</span><span class="modal-detail-value"><span class="score-${txn.riskLevel}" style="font-weight:800;font-size:1.2rem">${txn.riskScore}</span> / 100</span></div>
            <div class="modal-detail-row"><span class="modal-detail-label">Status</span><span class="modal-detail-value"><span class="status-badge status-${txn.status}">${txn.status}</span></span></div>
            ${txn.amount > 10000 ? '<div class="modal-detail-row" style="color: var(--accent-orange); font-size: 0.82rem">⚠️ Transaction exceeds CTR reporting threshold ($10,000)</div>' : ''}
            ${DATA.highRiskCountries.includes(txn.sender.country) || DATA.highRiskCountries.includes(txn.receiver.country) ? '<div class="modal-detail-row" style="color: var(--accent-red); font-size: 0.82rem">🚨 High-risk jurisdiction involved</div>' : ''}
        `;

        $('#modal-body').innerHTML = body;
        $('#modal-title').textContent = `Transaction ${txn.id}`;
        $('#modal-overlay').classList.remove('hidden');
    }

    function flagTransaction(txnId) {
        const txn = DATA.transactions.find(t => t.id === txnId);
        if (!txn) return;
        txn.status = 'flagged';
        renderTransactions();
        showToast(`Transaction ${txnId} flagged for review`, 'warning');
    }

    function updateAlertStatus(alertId, newStatus) {
        const alert = DATA.alerts.find(a => a.id === alertId);
        if (!alert) return;
        alert.status = newStatus;
        renderAlerts();
        renderDashboard();
        showToast(`Alert ${alertId} marked as ${newStatus}`, 'success');
    }

    function toggleRule(ruleId) {
        const rule = DATA.rules.find(r => r.id === ruleId);
        if (!rule) return;
        rule.active = !rule.active;
        renderRules();
        showToast(`Rule "${rule.title}" ${rule.active ? 'enabled' : 'disabled'}`, rule.active ? 'success' : 'info');
    }

    // --- AML Scan ---
    function runAMLScan() {
        const overlay = $('#scan-overlay');
        const progress = $('#scan-progress');
        const bar = $('#scan-bar-fill');
        overlay.classList.remove('hidden');

        const steps = [
            'Analyzing transaction patterns...',
            'Checking against FATF watchlists...',
            'Evaluating structuring behavior...',
            'Assessing high-risk jurisdictions...',
            'Computing risk scores...',
            'Generating alerts...',
            'Scan complete!'
        ];

        let step = 0;
        const interval = setInterval(() => {
            step++;
            if (step < steps.length) {
                progress.textContent = steps[step];
                bar.style.width = `${(step / (steps.length - 1)) * 100}%`;
            }
            if (step >= steps.length) {
                clearInterval(interval);
                setTimeout(() => {
                    overlay.classList.add('hidden');
                    bar.style.width = '0';

                    // "Find" some new suspicious transactions
                    let newFlags = 0;
                    DATA.transactions.forEach(t => {
                        if (t.status === 'completed' && t.riskScore > 65 && Math.random() > 0.5) {
                            t.status = 'flagged';
                            newFlags++;
                        }
                    });

                    renderTransactions();
                    renderDashboard();
                    showToast(`AML Scan complete. ${newFlags} new suspicious transactions detected.`, newFlags > 0 ? 'warning' : 'success');
                }, 600);
            }
        }, 800);
    }

    // --- Modal ---
    function initModal() {
        $('#modal-close').addEventListener('click', closeModal);
        $('#modal-overlay').addEventListener('click', (e) => {
            if (e.target === $('#modal-overlay')) closeModal();
        });
        $('#btn-modal-dismiss').addEventListener('click', closeModal);
        $('#btn-modal-flag').addEventListener('click', () => {
            if (selectedTransaction) {
                selectedTransaction.status = 'flagged';
                renderTransactions();
                closeModal();
                showToast(`Transaction flagged for review`, 'warning');
            }
        });
        $('#btn-modal-block').addEventListener('click', () => {
            if (selectedTransaction) {
                selectedTransaction.status = 'blocked';
                renderTransactions();
                closeModal();
                showToast(`Transaction blocked`, 'error');
            }
        });
    }

    function closeModal() {
        $('#modal-overlay').classList.add('hidden');
        selectedTransaction = null;
    }

    // --- Toast ---
    function showToast(message, type = 'info') {
        const container = $('#toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
        `;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    // --- Filters ---
    function initFilters() {
        $('#filter-status').addEventListener('change', () => { currentTxnPage = 1; renderTransactions(); });
        $('#filter-risk').addEventListener('change', () => { currentTxnPage = 1; renderTransactions(); });
        $('#filter-alert-severity').addEventListener('change', renderAlerts);
        $('#filter-alert-status').addEventListener('change', renderAlerts);
        $('#filter-customer-risk').addEventListener('change', renderCustomers);
        $('#btn-scan-transactions').addEventListener('click', runAMLScan);
    }

    // --- Search ---
    function initSearch() {
        let searchTimeout;
        $('#search-input').addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const query = e.target.value.toLowerCase().trim();
                if (!query) return;

                // Search transactions
                const matchedTxn = DATA.transactions.find(t =>
                    t.id.toLowerCase().includes(query) ||
                    t.sender.name.toLowerCase().includes(query) ||
                    t.receiver.name.toLowerCase().includes(query)
                );

                if (matchedTxn) {
                    navigateTo('transactions');
                    setTimeout(() => viewTransaction(matchedTxn.id), 300);
                    return;
                }

                // Search customers
                const matchedCustomer = DATA.customers.find(c =>
                    c.id.toLowerCase().includes(query) ||
                    c.name.toLowerCase().includes(query)
                );

                if (matchedCustomer) {
                    navigateTo('customers');
                    return;
                }

                showToast('No results found for "' + query + '"', 'info');
            }, 500);
        });
    }

    // --- Public API ---
    window.APP = {
        viewTransaction,
        flagTransaction,
        updateAlertStatus,
        toggleRule,
        changeTxnPage: (page) => {
            currentTxnPage = page;
            renderTransactions();
        }
    };

    // --- Initialize ---
    function init() {
        initNavigation();
        initModal();
        initFilters();
        initSearch();
        initReports();

        renderDashboard();
        renderTransactions();
        renderAlerts();
        renderCustomers();
        renderRules();

        // Welcome notification
        setTimeout(() => {
            showToast('SAML-D System initialized. Monitoring active.', 'success');
        }, 1000);
    }

    document.addEventListener('DOMContentLoaded', init);
})();
