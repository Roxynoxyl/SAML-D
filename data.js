// =============================================
//  SAML-D — Sample Data & AML Detection Engine
// =============================================

const DATA = (() => {
    // --- Helpers ---
    const randomId = (prefix = 'TXN') => `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const randomDate = (daysBack = 30) => {
        const d = new Date();
        d.setDate(d.getDate() - Math.floor(Math.random() * daysBack));
        d.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), Math.floor(Math.random() * 60));
        return d;
    };
    const formatCurrency = (n) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const formatDate = (d) => d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const formatDateTime = (d) => d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

    // --- Names & Entities ---
    const firstNames = ['James', 'Maria', 'Ahmed', 'Li', 'Sarah', 'Carlos', 'Yuki', 'Ivan', 'Priya', 'Omar', 'Elena', 'Wei', 'Fatima', 'Hans', 'Amara', 'David', 'Sofia', 'Raj', 'Nadia', 'Chen'];
    const lastNames = ['Thompson', 'Garcia', 'Al-Rashid', 'Wang', 'Mitchell', 'Rodriguez', 'Tanaka', 'Petrov', 'Sharma', 'Hassan', 'Sokolova', 'Zhang', 'Al-Farsi', 'Mueller', 'Okonkwo', 'Kim', 'Andersson', 'Patel', 'Kozlov', 'Liu'];
    const companies = ['Apex Trading LLC', 'Global Ventures Inc', 'Silk Road Imports', 'Atlas Holdings', 'Pacific Rim Corp', 'Northern Star Ltd', 'Delta Financial', 'Omega Markets', 'Phoenix Capital', 'Zenith Group'];
    const countries = ['US', 'UK', 'AE', 'SG', 'CH', 'HK', 'DE', 'JP', 'IN', 'BR', 'KY', 'PA', 'VG', 'BZ', 'SC'];
    const highRiskCountries = ['KY', 'PA', 'VG', 'BZ', 'SC'];
    const txnTypes = ['Wire Transfer', 'ACH', 'Check Deposit', 'Cash Deposit', 'Cash Withdrawal', 'International Wire', 'Crypto Exchange', 'Internal Transfer'];
    const statuses = ['completed', 'pending', 'flagged', 'blocked'];

    // --- Generate Customers ---
    const customers = [];
    for (let i = 0; i < 25; i++) {
        const first = pick(firstNames);
        const last = pick(lastNames);
        const country = pick(countries);
        const isHighRiskCountry = highRiskCountries.includes(country);
        let riskScore = Math.floor(Math.random() * 60) + 10;
        if (isHighRiskCountry) riskScore = Math.min(100, riskScore + 30);

        customers.push({
            id: `CUS-${(1000 + i).toString()}`,
            name: Math.random() > 0.3 ? `${first} ${last}` : pick(companies),
            type: Math.random() > 0.3 ? 'Individual' : 'Business',
            country,
            riskScore,
            riskLevel: riskScore >= 80 ? 'critical' : riskScore >= 60 ? 'high' : riskScore >= 35 ? 'medium' : 'low',
            totalTransactions: Math.floor(Math.random() * 200) + 5,
            totalVolume: Math.floor(Math.random() * 5000000) + 10000,
            flaggedCount: Math.floor(Math.random() * (riskScore > 60 ? 15 : 5)),
            joinDate: randomDate(365),
            avatarColor: `hsl(${Math.floor(Math.random() * 360)}, 60%, 50%)`
        });
    }

    // --- Generate Transactions ---
    const transactions = [];
    for (let i = 0; i < 150; i++) {
        const sender = pick(customers);
        let receiver = pick(customers);
        while (receiver.id === sender.id) receiver = pick(customers);

        const amount = (() => {
            const r = Math.random();
            if (r < 0.5) return Math.floor(Math.random() * 5000) + 100;
            if (r < 0.8) return Math.floor(Math.random() * 50000) + 5000;
            if (r < 0.95) return Math.floor(Math.random() * 500000) + 50000;
            return Math.floor(Math.random() * 2000000) + 500000;
        })();

        const type = pick(txnTypes);
        const date = randomDate(30);

        // Calculate risk score based on rules
        let riskScore = 0;
        if (amount > 10000) riskScore += 15;
        if (amount > 50000) riskScore += 20;
        if (amount > 200000) riskScore += 25;
        if (highRiskCountries.includes(sender.country) || highRiskCountries.includes(receiver.country)) riskScore += 20;
        if (type === 'International Wire' || type === 'Crypto Exchange') riskScore += 15;
        if (type === 'Cash Deposit' || type === 'Cash Withdrawal') riskScore += 10;
        if (sender.riskScore > 60) riskScore += 10;
        riskScore += Math.floor(Math.random() * 15);
        riskScore = Math.min(100, riskScore);

        let status = 'completed';
        if (riskScore >= 80) status = Math.random() > 0.3 ? 'flagged' : 'blocked';
        else if (riskScore >= 60) status = Math.random() > 0.5 ? 'flagged' : 'completed';
        else if (Math.random() < 0.1) status = 'pending';

        transactions.push({
            id: `TXN-${(10000 + i).toString()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
            date,
            sender: { id: sender.id, name: sender.name, country: sender.country },
            receiver: { id: receiver.id, name: receiver.name, country: receiver.country },
            amount,
            type,
            riskScore,
            riskLevel: riskScore >= 80 ? 'critical' : riskScore >= 60 ? 'high' : riskScore >= 35 ? 'medium' : 'low',
            status,
            notes: ''
        });
    }
    transactions.sort((a, b) => b.date - a.date);

    // --- Generate Alerts ---
    const alertTemplates = [
        { title: 'Structuring Detection', desc: 'Multiple transactions just below the reporting threshold detected for {entity}. Pattern suggests intentional structuring to avoid CTR filing.' },
        { title: 'High-Value International Wire', desc: 'Unusual high-value wire transfer of {amount} from {entity} to a high-risk jurisdiction ({country}). No prior relationship with recipient entity.' },
        { title: 'Rapid Movement of Funds', desc: 'Funds received by {entity} were transferred out within 24 hours to multiple accounts. Total volume: {amount}.' },
        { title: 'Unusual Cash Activity', desc: '{entity} has made {count} cash deposits totaling {amount} in the past 7 days, significantly above normal patterns.' },
        { title: 'Shell Company Transfer', desc: 'Transfer detected to entity flagged as potential shell company. Amount: {amount}. Beneficial ownership unclear.' },
        { title: 'Crypto Exchange Pattern', desc: 'Repeated crypto-to-fiat conversions by {entity} totaling {amount}. Pattern consistent with layering technique.' },
        { title: 'Geographic Risk Alert', desc: 'Transaction from {entity} routed through multiple high-risk jurisdictions: {country}. Final destination obscured.' },
        { title: 'Dormant Account Activity', desc: 'Account for {entity} dormant for 6+ months now showing sudden large volume activity. Total: {amount}.' },
        { title: 'Round Amount Pattern', desc: '{entity} has made {count} transactions with perfectly round amounts totaling {amount}. Consistent with smurfing behavior.' },
        { title: 'Beneficiary Pattern Alert', desc: '{entity} sending funds to {count} new beneficiaries in the past 48 hours. Combined: {amount}.' },
    ];

    const alerts = [];
    const alertStatuses = ['new', 'investigating', 'resolved', 'dismissed'];
    for (let i = 0; i < 20; i++) {
        const template = pick(alertTemplates);
        const customer = pick(customers);
        const amount = formatCurrency(Math.floor(Math.random() * 500000) + 10000);
        const severity = pick(['critical', 'high', 'medium', 'low']);
        const alertStatus = i < 5 ? 'new' : pick(alertStatuses);

        alerts.push({
            id: `ALT-${(5000 + i).toString()}`,
            title: template.title,
            description: template.desc
                .replace('{entity}', customer.name)
                .replace('{amount}', amount)
                .replace('{country}', pick(highRiskCountries))
                .replace('{count}', Math.floor(Math.random() * 10) + 3),
            severity,
            status: alertStatus,
            customer: customer.name,
            customerId: customer.id,
            date: randomDate(14),
            relatedTransactions: Math.floor(Math.random() * 8) + 1
        });
    }
    alerts.sort((a, b) => b.date - a.date);

    // --- AML Rules ---
    const rules = [
        {
            id: 'RULE-001',
            title: 'Currency Transaction Report (CTR) Threshold',
            description: 'Flag all cash transactions exceeding $10,000 as required by the Bank Secrecy Act. Includes aggregation of multiple transactions by the same customer within a single business day.',
            active: true,
            params: { threshold: '$10,000', aggregation: '24 hours', type: 'Cash' },
            triggered: Math.floor(Math.random() * 50) + 10,
            lastTriggered: randomDate(3)
        },
        {
            id: 'RULE-002',
            title: 'Structuring Detection',
            description: 'Detect patterns of transactions deliberately kept below reporting thresholds. Analyzes transaction frequency, amounts, and timing for structured deposits or withdrawals.',
            active: true,
            params: { window: '7 days', minTxns: '3', maxAmount: '$9,500' },
            triggered: Math.floor(Math.random() * 30) + 5,
            lastTriggered: randomDate(5)
        },
        {
            id: 'RULE-003',
            title: 'High-Risk Jurisdiction Monitoring',
            description: 'Monitor all transactions involving countries identified as high-risk by FATF. Apply enhanced due diligence for amounts exceeding $5,000.',
            active: true,
            params: { countries: 'FATF List', threshold: '$5,000', action: 'Flag + Review' },
            triggered: Math.floor(Math.random() * 40) + 15,
            lastTriggered: randomDate(2)
        },
        {
            id: 'RULE-004',
            title: 'Rapid Fund Movement',
            description: 'Alert when funds received are moved out of an account within 24 hours. Identifies potential layering activity in money laundering schemes.',
            active: true,
            params: { timeWindow: '24 hours', minAmount: '$25,000', percentage: '80%' },
            triggered: Math.floor(Math.random() * 20) + 3,
            lastTriggered: randomDate(7)
        },
        {
            id: 'RULE-005',
            title: 'Unusual Transaction Volume',
            description: 'Detect sudden spikes in transaction volume for individual accounts. Compares current activity against 90-day historical baseline.',
            active: true,
            params: { baseline: '90 days', deviation: '3x', minVolume: '$50,000' },
            triggered: Math.floor(Math.random() * 25) + 8,
            lastTriggered: randomDate(4)
        },
        {
            id: 'RULE-006',
            title: 'Shell Company Detection',
            description: 'Screen transactions against known shell company registries and flag entities with unclear beneficial ownership structures.',
            active: false,
            params: { database: 'ICIJ + OpenCorporates', matchThreshold: '75%' },
            triggered: Math.floor(Math.random() * 10),
            lastTriggered: randomDate(14)
        },
        {
            id: 'RULE-007',
            title: 'Crypto Exchange Monitoring',
            description: 'Monitor conversion patterns between cryptocurrency and fiat currency. Flag repeated small conversions that may indicate layering.',
            active: true,
            params: { maxTxn: '$3,000', window: '72 hours', minCount: '5' },
            triggered: Math.floor(Math.random() * 15) + 2,
            lastTriggered: randomDate(6)
        },
        {
            id: 'RULE-008',
            title: 'Dormant Account Activation',
            description: 'Alert when accounts inactive for 6+ months show sudden large-volume activity. May indicate account takeover or mule account usage.',
            active: true,
            params: { dormancyPeriod: '180 days', minAmount: '$10,000' },
            triggered: Math.floor(Math.random() * 8) + 1,
            lastTriggered: randomDate(10)
        }
    ];

    // --- Chart Data ---
    const chartData = {
        volumeLabels: [],
        volumeData: [],
        alertData: [],
    };
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        chartData.volumeLabels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        chartData.volumeData.push(Math.floor(Math.random() * 200) + 100);
        chartData.alertData.push(Math.floor(Math.random() * 15) + 2);
    }

    return {
        customers,
        transactions,
        alerts,
        rules,
        chartData,
        formatCurrency,
        formatDate,
        formatDateTime,
        pick,
        highRiskCountries
    };
})();
