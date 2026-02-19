<div align="center">

# TANZEEM

### Smart School Pickup Management System

**Reimagining school dismissal logistics for Dubai's Roads & Transport Authority (RTA)**

[![3rd Place — RTA Hackathon](https://img.shields.io/badge/RTA_Hackathon-3rd_Place-FFD700?style=for-the-badge&logo=trophy&logoColor=white)](#)
[![Next.js](https://img.shields.io/badge/Next.js_14-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/Zustand-443E38?style=for-the-badge&logo=react&logoColor=white)](https://zustand-demo.pmnd.rs/)

---

**3rd Place Winner** at the RTA Dubai Hackathon — a functional prototype demonstrating a complete pickup management ecosystem with a parent-facing mobile app and operations dashboard.

[Getting Started](#-getting-started) · [Features](#-features) · [Architecture](#-architecture) · [Demo Guide](#-demo-walkthrough)

</div>

---

## The Problem

School dismissal in Dubai creates daily traffic congestion, safety concerns, and operational chaos. Parents idle in pickup zones, children wait unsupervised, and schools lack tools to manage the flow. Current systems rely on manual coordination with no accountability, no data, and no alternatives to on-site pickup.

## The Solution

**TANZEEM** (Arabic: تنظيم — "organization") introduces a three-tier pickup model with built-in compliance, real-time tracking, and community-driven alternatives:

| Mode | Description | Key Benefit |
|:-----|:------------|:------------|
| **On-site Pickup** | Traditional school gate collection with enforced 5-min time limits | Progressive fee schedule discourages idling |
| **Smart Zones** | Designated neighbourhood pickup points with shuttle service | Reduces school-gate congestion by up to 60% |
| **Neighbourhood Van** | Subscription-based door-to-neighbourhood shuttle | Zero parent travel required |

---

## Key Features

### Parent Mobile App

- **Real-time Pickup Timer** — 5-minute countdown with automatic overrun detection
- **Progressive Fee Enforcement** — 3 warnings → escalating fees (AED 20, 40, 60…)
- **Smart Zone Selection** — First-come, first-served zone enrollment locked per semester
- **Live Pickup Tracking** — Step-by-step status from classroom release to parent handoff
- **QR Verification** — Cryptographic pickup confirmation ensuring child safety
- **Custody Timeline** — Immutable, timestamped audit trail of every handoff event
- **Community Carpooling** — AI-matched neighbourhood families with compatibility scoring
- **Van Subscription** — Next-semester signup for neighbourhood shuttle service

### Operations Dashboard

- **Live KPI Monitoring** — Parent count, mode distribution, overrun rates, revenue
- **Zone Capacity Management** — Real-time enrollment tracking with capacity alerts
- **Compliance Risk List** — Flagged parents exceeding warning thresholds
- **Mode Distribution Analytics** — Visual breakdown of pickup method adoption
- **Fee Revenue Tracking** — Semester-level fee collection for infrastructure funding

---

## Architecture

```
tanzeem/
├── app/
│   ├── layout.tsx              # Root layout with Inter font + metadata
│   ├── page.tsx                # Landing — role selection (Parent / Ops)
│   ├── globals.css             # Design tokens + government-grade styling
│   ├── parent/
│   │   └── page.tsx            # Parent app — 8 interactive screens
│   └── ops/
│       └── page.tsx            # Operations dashboard with KPIs
├── components/
│   └── ui/
│       ├── button.tsx          # CVA-powered button with 8 variants
│       ├── card.tsx            # Composable card primitives
│       ├── badge.tsx           # Status indicator badges
│       └── dialog.tsx          # Modal dialog system
├── lib/
│   ├── store.ts                # Zustand store — state, actions, computed metrics
│   └── utils.ts                # cn() helper, time formatting utilities
├── tailwind.config.js          # RTA brand tokens + custom design system
├── next.config.js              # Next.js configuration
└── tsconfig.json               # TypeScript strict mode
```

### Design Decisions

| Decision | Rationale |
|:---------|:----------|
| **Zustand with localStorage persistence** | Lightweight state management that survives page refreshes — ideal for demo environments without a backend |
| **Single-page parent app with screen state** | Mobile-native feel with bottom navigation; avoids full page reloads for fluid UX |
| **CVA (Class Variance Authority)** | Type-safe component variants ensuring consistent styling across button/badge states |
| **RTA brand colour system** | Custom Tailwind tokens (`rta-primary`, `rta-accent`, etc.) matching government design guidelines |
| **Computed ops metrics** | Derived dashboard data from store state + mock baselines — demonstrates real analytics capability |

---

## Tech Stack

| Layer | Technology | Purpose |
|:------|:-----------|:--------|
| **Framework** | Next.js 14 (App Router) | Server-side rendering, file-based routing |
| **Language** | TypeScript (strict) | Type safety across components and store |
| **Styling** | Tailwind CSS 3.4 | Utility-first CSS with custom design tokens |
| **State** | Zustand 4.5 | Minimal, performant global state with persistence |
| **Components** | CVA + Radix patterns | Accessible, variant-driven UI primitives |
| **Icons** | Lucide React | Consistent, lightweight icon system |
| **Date Utils** | date-fns 3.6 | Locale-aware date formatting (en-AE) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Kazemkhani/tanzeem.git
cd tanzeem

# Install dependencies
npm install

# Start development server
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** to view the application.

### Build for Production

```bash
npm run build
npm start
```

---

## Demo Walkthrough

> **Total demo time: ~3 minutes**

### 1. On-site Pickup & Progressive Fees *(45s)*

Navigate to **Parent App → Start Timer**. The 5-minute countdown enforces pickup discipline. Use "Record Overrun Now" to simulate violations:

- Overruns 1–3: Warnings issued
- Overrun 4+: Escalating fees (AED 20 → 40 → 60…)
- View full history in **Strikes & Fees History**

### 2. Smart Zone Enrollment *(30s)*

Navigate to **Zones** tab. Three zones with real-time capacity:

- **Zone A** — 12 spots remaining
- **Zone B** — 31 spots remaining
- **Zone C** — Full (locked out)

Select a zone → confirm → locked for the semester. No zone-hopping.

### 3. Zone Pickup with QR Verification *(30s)*

After zone enrollment, track the pickup lifecycle:

`Child Released → Boarded Shuttle → Arrived at Zone → QR Verified → Complete`

Every step timestamped. QR scan creates verified custody handoff.

### 4. Custody Timeline *(15s)*

View the **Custody Timeline** for a complete audit trail — every event with timestamps and verification badges.

### 5. Community Features *(20s)*

- **Carpool**: AI-matched families in your zone with compatibility scores
- **Van**: Subscribe for next semester's neighbourhood shuttle (AED 350/mo)

### 6. Operations Dashboard *(30s)*

Switch to **Operations Dashboard** for the RTA admin view:

- 247 parents in pilot program
- Mode split visualization (On-site / Zone / Van)
- Zone capacity monitoring
- Compliance risk flagging

---

## System Rules

| Rule | Implementation |
|:-----|:---------------|
| One zone per semester | Zone locks on confirmation; UI prevents changes |
| First-come, first-served | Capacity counter decrements in real-time |
| 5-minute on-site limit | Countdown timer with automatic overrun detection |
| 3 free warnings per semester | Fee calculator returns `warning` for overruns 1–3 |
| Progressive fees (AED 20 increments) | `(overrunNumber - 3) × 20` formula |
| No forced mid-semester reassignment | Info prompts suggest alternatives for *next* semester |
| QR-verified custody handoff | Simulated cryptographic verification with timeline entry |
| Immutable audit trail | Append-only timeline with verified/unverified states |

---

## Design System

The application follows a government-grade design language aligned with RTA branding:

| Token | Hex | Usage |
|:------|:----|:------|
| `rta-primary` | `#1a365d` | Headers, primary actions |
| `rta-secondary` | `#2c5282` | Hover states |
| `rta-accent` | `#3182ce` | Links, interactive elements |
| `rta-success` | `#38a169` | Confirmations, zone availability |
| `rta-warning` | `#d69e2e` | Warnings, on-site mode indicators |
| `rta-danger` | `#e53e3e` | Fees, full capacity, errors |

### Design Principles

- **Government-grade clarity** — Minimal, calm, high information density
- **No visual noise** — Every element serves a functional purpose
- **Clear hierarchy** — Status first, then actions, then details
- **Immediate feedback** — All interactions update state visibly

---

## Contributing

Contributions are welcome for extending the prototype:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/pickup-analytics`)
3. Commit your changes (`git commit -m 'Add pickup analytics module'`)
4. Push to the branch (`git push origin feature/pickup-analytics`)
5. Open a Pull Request

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Built with purpose for Dubai's future of school transportation.**

*TANZEEM — تنظيم*

</div>
