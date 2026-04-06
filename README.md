# 🛡️ SAML-D — Suspicious Activity Monitoring & Logging Dashboard

**Anti Money Laundering (AML) Transaction Monitoring System**

A real-time web-based dashboard for monitoring financial transactions, detecting suspicious activity patterns, managing compliance alerts, and generating regulatory reports — built for AML compliance teams.

![Dashboard Preview](https://img.shields.io/badge/Status-Active-brightgreen) ![License](https://img.shields.io/badge/License-MIT-blue) ![Version](https://img.shields.io/badge/Version-1.0.0-purple)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
  - [Risk Scoring Metrics](#risk-scoring-metrics)
  - [AML Detection Rules](#aml-detection-rules)
  - [Detection Flow](#detection-flow)
- [Modules](#modules)
- [Technology Stack](#technology-stack)
- [Regulatory Context](#regulatory-context)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Money laundering is the process of making illegally obtained money appear legitimate. It typically involves three stages:

| Stage | Criminal Activity | SAML-D Detection |
|-------|-------------------|------------------|
| **Placement** | Inject dirty money into the financial system | CTR threshold monitoring, cash activity alerts |
| **Layering** | Move money through complex transactions | Rapid fund movement, high-risk jurisdiction tracking |
| **Integration** | Reintroduce "clean" money into the economy | Unusual volume detection, behavioral analysis |

SAML-D provides a comprehensive monitoring dashboard that automates the detection of these activities using **rule-based scoring** and **behavioral pattern analysis**.

---

## Features

| Feature | Description |
|---------|-------------|
| 📊 **Real-time Dashboard** | KPI cards, transaction volume charts, risk distribution, recent alerts |
| 💰 **Transaction Monitoring** | Filterable, paginated transaction table with risk scores and status tracking |
| 🔔 **Alert Management** | Severity-based alerts with Investigate → Resolve/Dismiss workflow |
| 👥 **Customer Risk Profiling** | KYC/CDD-compliant customer cards with risk scores and transaction history |
| ⚙️ **Configurable Rules Engine** | 8 toggleable AML detection rules with tunable parameters |
| 📄 **Regulatory Reports** | Generate SAR, CTR, Risk Assessment, and Audit Trail reports |
| 🔍 **Global Search** | Search across transactions and customers instantly |
| ⚡ **AML Scan Simulation** | Run bulk scans to re-evaluate all transactions against active rules |
| 🔔 **Toast Notifications** | Real-time feedback for all user actions |
| 📱 **Responsive Design** | Works on desktop, tablet, and mobile devices |

---

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Edge, Safari)
- Python 3.x (for local server) **OR** any static file server

### Installation & Running

```bash
# 1. Clone or download the project
cd saml-d

# 2. Start a local server (pick one method)

# Method A: Python
python -m http.server 3000

# Method B: Node.js (if available)
npx serve . -l 3000

# Method C: VS Code Live Server extension
# Right-click index.html → Open with Live Server

# 3. Open in browser
# Navigate to http://localhost:3000
```

No build step required. No dependencies to install. Just serve and open.

---

## Project Structure

```
saml-d/
├── index.html      # Main application layout & all page structures
├── index.css       # Complete design system (dark theme, animations, responsive)
├── data.js         # Sample data generator & AML detection engine
├── app.js          # Application logic, navigation, rendering, interactions
└── README.md       # This file
```

| File | Purpose |
|------|---------|
| `index.html` | Semantic HTML structure with sidebar navigation, 6 page sections, modal, toast container, and scan overlay |
| `index.css` | Premium dark theme with CSS custom properties, glassmorphism, micro-animations, and full responsive breakpoints |
| `data.js` | Generates realistic sample data: 25 customers, 150 transactions, 20 alerts, 8 AML rules with risk scoring logic |
| `app.js` | Handles SPA navigation, Chart.js rendering, table pagination, filtering, modal interactions, AML scan simulation, and report generation |

---

## How It Works

### Risk Scoring Metrics

Every transaction receives an automated **risk score (0–100)** calculated from multiple factors:

| Metric | Condition | Points | Rationale |
|--------|-----------|:------:|-----------|
| **Amount (Tier 1)** | > $10,000 | +15 | Approaches CTR reporting threshold |
| **Amount (Tier 2)** | > $50,000 | +20 | Unusually large volume |
| **Amount (Tier 3)** | > $200,000 | +25 | Extremely high, requires immediate scrutiny |
| **Country Risk** | Sender or receiver in FATF high-risk country | +20 | Weak AML controls in jurisdiction |
| **Transaction Type** | International Wire or Crypto Exchange | +15 | Cross-border, hard to trace |
| **Transaction Type** | Cash Deposit or Cash Withdrawal | +10 | Untraceable physical currency |
| **Sender Profile** | Sender risk score > 60 | +10 | Known risky entity amplifies suspicion |
| **Behavioral Noise** | Random 0–15 | +0–15 | Simulates additional signals (IP, device, timing) |

#### Risk Level Classification

| Score Range | Level | Color | Auto-Action |
|:-----------:|:-----:|:-----:|-------------|
| 0 – 34 | 🟢 Low | Green | Transaction completes normally |
| 35 – 59 | 🟡 Medium | Yellow | Completes, added to monitoring queue |
| 60 – 79 | 🟠 High | Orange | ~50% probability of auto-flag for review |
| 80 – 100 | 🔴 Critical | Red | ~70% flagged, ~30% auto-blocked |

#### High-Risk Country List

Countries flagged as high-risk jurisdictions in the system:

| Code | Country | Reason |
|------|---------|--------|
| KY | Cayman Islands | Offshore financial center, secrecy laws |
| PA | Panama | Weak beneficial ownership transparency |
| VG | British Virgin Islands | Shell company haven |
| BZ | Belize | Limited AML enforcement |
| SC | Seychelles | Offshore company registrations |

---

### AML Detection Rules

The system includes **8 configurable rules** that detect behavioral patterns across multiple transactions:

#### Rule 1: 💵 Currency Transaction Report (CTR) Threshold
- **Purpose:** Comply with Bank Secrecy Act — report cash transactions over $10,000
- **Parameters:** Threshold = $10,000 | Aggregation window = 24 hours | Type = Cash
- **Trigger example:** Customer deposits $12,000 in cash → CTR filing required

#### Rule 2: 🧩 Structuring Detection (Anti-Smurfing)
- **Purpose:** Catch intentional splitting of transactions to avoid CTR thresholds
- **Parameters:** Window = 7 days | Min transactions = 3 | Max per transaction = $9,500
- **Trigger example:** 4 deposits of $9,400 within one week

#### Rule 3: 🌍 High-Risk Jurisdiction Monitoring
- **Purpose:** Enhanced monitoring for FATF-listed countries
- **Parameters:** Countries = FATF List | Threshold = $5,000 | Action = Flag + Review
- **Trigger example:** $8,000 wire transfer to Cayman Islands

#### Rule 4: ⚡ Rapid Fund Movement (Layering Detection)
- **Purpose:** Detect immediate outbound transfers after receiving funds
- **Parameters:** Time window = 24 hours | Min amount = $25,000 | Outflow percentage = 80%
- **Trigger example:** Account receives $100K, transfers $85K out within 6 hours

#### Rule 5: 📈 Unusual Transaction Volume
- **Purpose:** Spot sudden spikes compared to historical behavior
- **Parameters:** Baseline = 90 days | Deviation = 3x normal | Min volume = $50,000
- **Trigger example:** Customer normally transacts $10K/month, suddenly does $150K

#### Rule 6: 🏢 Shell Company Detection
- **Purpose:** Screen against known shell company registries
- **Parameters:** Database = ICIJ + OpenCorporates | Match threshold = 75%
- **Trigger example:** Transfer to entity with no employees, no website, registered in BVI
- **Status:** Disabled by default (requires external API)

#### Rule 7: ₿ Crypto Exchange Monitoring
- **Purpose:** Detect repeated small crypto-to-fiat conversions (layering)
- **Parameters:** Max per transaction = $3,000 | Window = 72 hours | Min count = 5
- **Trigger example:** 7 conversions of $2,800 each within 2 days

#### Rule 8: 💤 Dormant Account Activation
- **Purpose:** Flag reactivated dormant accounts (mule account indicator)
- **Parameters:** Dormancy period = 180 days | Min amount = $10,000
- **Trigger example:** Account silent for 6 months, suddenly receives $50K

---

### Detection Flow

```
        Transaction Received
                │
                ▼
    ┌───────────────────────┐
    │   Calculate Risk Score │  ← Single-transaction metrics
    │   (amount, country,    │     (amount, country, type, sender profile)
    │    type, sender)       │
    └───────────┬───────────┘
                │
                ▼
    ┌───────────────────────┐
    │   Evaluate Against     │  ← Multi-transaction behavioral rules
    │   Active AML Rules     │     (structuring, velocity, volume)
    └───────────┬───────────┘
                │
        ┌───────┴───────┐
        ▼               ▼
    Score < 60       Score ≥ 60
    No rule hit      OR rule triggered
        │               │
        ▼               ▼
    ✅ Cleared      🚨 Alert Created
                        │
                ┌───────┴───────┐
                ▼               ▼
          Compliance        Auto-blocked
          Officer Review    (critical risk)
                │
        ┌───────┼───────┐
        ▼       ▼       ▼
    Dismiss  Resolve   File SAR
```

---

## Modules

### 1. Dashboard (`page-dashboard`)
Real-time overview with 4 KPI stat cards, interactive line chart (Transaction Volume & Alerts over 7/30/90 days), doughnut chart (Risk Distribution), recent alerts list, and top suspicious entities ranking.

### 2. Transactions (`page-transactions`)
Full transaction ledger with:
- Filter by status (Completed / Pending / Flagged / Blocked)
- Filter by risk level (Low / Medium / High / Critical)
- Date range filtering
- Paginated table (15 per page)
- Click-to-view transaction details in modal
- Flag or Block transactions directly
- **Run AML Scan** — bulk re-evaluation with animated progress

### 3. Alerts (`page-alerts`)
Alert management with:
- Filter by severity (Critical / High / Medium / Low)
- Filter by status (New / Investigating / Resolved / Dismissed)
- Action buttons: Investigate → Resolve or Dismiss
- Linked customer and related transaction count

### 4. Customers (`page-customers`)
Customer risk profiles showing:
- Risk score with visual progress bar
- Total transactions, volume, and flagged count
- Country and entity type (Individual / Business)
- Filterable by risk level

### 5. Rules Engine (`page-rules`)
AML rule configuration:
- Toggle rules on/off
- View rule parameters
- Track trigger count and last triggered date
- 8 pre-configured industry-standard rules

### 6. Reports (`page-reports`)
Regulatory report generation:
- **SAR** — Suspicious Activity Report (FinCEN)
- **CTR** — Currency Transaction Report (Bank Secrecy Act)
- **Risk Assessment** — Customer risk distribution analysis
- **Audit Trail** — Complete system action log

---

## Technology Stack

| Technology | Usage |
|------------|-------|
| **HTML5** | Semantic page structure |
| **CSS3** | Custom properties, glassmorphism, grid/flexbox, animations |
| **Vanilla JavaScript** | SPA navigation, rendering, state management |
| **Chart.js 4.4** | Interactive line and doughnut charts (CDN) |
| **Google Fonts (Inter)** | Modern typography |

**Zero build dependencies.** No frameworks, no bundlers, no npm packages. Pure HTML/CSS/JS.

---

## Regulatory Context

This system is designed with the following regulatory frameworks in mind:

| Regulation | Jurisdiction | Relevance |
|------------|-------------|-----------|
| **Bank Secrecy Act (BSA)** | United States | CTR filing for cash > $10,000 |
| **USA PATRIOT Act** | United States | Enhanced due diligence, KYC requirements |
| **FATF Recommendations** | International | High-risk country lists, AML standards |
| **4th/5th/6th EU AML Directives** | European Union | Beneficial ownership, risk-based approach |
| **FinCEN SAR Requirements** | United States | Suspicious Activity Report filing |

---

## Future Enhancements

- [ ] Backend API integration (Node.js/Python Flask)
- [ ] Real database connection (PostgreSQL/MongoDB)
- [ ] Live transaction feed via WebSocket
- [ ] Machine learning anomaly detection
- [ ] Actual FATF/OFAC/PEP watchlist API integration
- [ ] Multi-user authentication & role-based access
- [ ] Email/SMS notifications for critical alerts
- [ ] Export reports to PDF/CSV
- [ ] Transaction network graph visualization
- [ ] Audit log persistence

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-rule`)
3. Commit changes (`git commit -m 'Add new detection rule'`)
4. Push to branch (`git push origin feature/new-rule`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

<p align="center">
  <strong>SAML-D</strong> — Built for AML compliance teams to detect, investigate, and report suspicious financial activity.
</p>
