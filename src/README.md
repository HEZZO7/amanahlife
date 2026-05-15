# AmanahLife

**AmanahLife** is an intelligent Islamic life companion app — a comprehensive personal dashboard for Muslims integrating spiritual tracking, financial management, family coordination, wellness, learning, and AI-powered insights.

🌐 Domain: [amanahlife.com](https://amanahlife.com)

---

## Features

- **Dashboard** — Life score, daily tasks, prayer summary, finance snapshot, AI insights
- **Finance** — Income/expense tracking, budget management, Zakat calculator, halal finance
- **Goals** — Personal, spiritual, financial, family and health goals with milestone tracking
- **Planner** — Daily, weekly, and agenda views with recurring tasks
- **Spiritual** — Prayer tracker, Qur'an log, charity log, streaks, heatmap
- **Ramadan** — Fasting log, Suhoor/Iftar tracker, 30-day grid, Eid planning
- **Family** — Shared tasks, family calendar, goal coordination
- **Learning** — Course progress tracking with milestones
- **Work** — Projects, invoices, client management
- **Wellness** — Mood, sleep, hydration, stress tracking with trend charts
- **Analytics** — Finance trends, prayer completion, mood graphs (Premium)
- **AI Assistant** — Context-aware chat with full user data injection

---

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, shadcn/ui, Framer Motion, Recharts
- **Backend:** Base44 Platform (entities, backend functions, automations, AI integrations)
- **Languages:** English + Arabic (full RTL support)
- **Themes:** Light and Dark modes

---

## Setup

### Prerequisites

- Node.js 18+
- A [Base44](https://base44.com) account with an app created

### Installation

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

### Environment Variables

See `.env.example` for all required variables. Copy it and fill in your values:

```bash
cp .env.example .env
```

---

## Project Structure

```
src/
├── pages/          # Route-level page components
├── components/     # Reusable UI components
│   ├── navigation/ # Sidebar, BottomTabs, AppLayout
│   ├── finance/    # Finance module components
│   ├── goals/      # Goals module components
│   ├── planner/    # Planner/calendar components
│   ├── spiritual/  # Spiritual tracking components
│   ├── onboarding/ # Multi-step onboarding flow
│   ├── dashboard/  # Dashboard widgets
│   ├── settings/   # Settings section components
│   └── monetization/ # Paywall, usage banners
├── lib/            # Services, utilities, context
│   ├── i18n.jsx           # Translation system (EN/AR)
│   ├── financeService.js  # Finance data aggregation
│   ├── goalsService.js    # Goals data
│   ├── spiritualService.js # Prayer/spiritual data
│   ├── wellnessService.js # Wellness metrics
│   ├── dashboardService.js # Dashboard aggregation
│   ├── aiContextBuilder.js # AI context injection
│   ├── exportService.js   # PDF/CSV export
│   ├── ThemeContext.jsx   # Dark/light theme
│   └── UserSettingsContext.jsx # Global settings
├── functions/      # Base44 backend functions (Deno)
│   └── notificationTriggers.js
├── agents/         # AI agent definitions
├── entities/       # Data schemas (JSON)
└── api/
    └── base44Client.js  # SDK initialization
```

---

## Entities

| Entity | Purpose |
|---|---|
| Settings | User preferences, theme, language, subscription |
| Task | Personal & family tasks with recurrence |
| Goal | Goals with category and progress tracking |
| Transaction | Income and expense records |
| Budget | Monthly spending limits by category |
| PrayerLog | Daily prayer completion tracking |
| RamadanLog | Fasting, Suhoor, Iftar, Qur'an pages |
| CharityLog | Sadaqah and Zakat donations |
| ZakatRecord | Zakat calculations |
| WellnessLog | Mood, sleep, hydration, stress |
| Event | Calendar events (personal, family, religious) |
| Family | Family group |
| FamilyMember | Family membership and roles |
| CourseLog | Learning course progress |
| CourseMilestone | Course milestones |
| WorkProject | Work/business projects |
| WorkInvoice | Client invoices |
| AIInsight | AI-generated insights |

---

## Automations

Eight automated notification triggers are configured:
1. Task overdue
2. Goal completed (celebration email)
3. Budget exceeded
4. Invoice overdue
5. Zakat due
6. Goal progress milestone (25%, 50%, 75%)
7. Wellness 7-day streak
8. Low savings rate alert

---

## Subscription Tiers

| Feature | Free | Premium | Family |
|---|---|---|---|
| Core tracking | ✅ | ✅ | ✅ |
| AI insights | 3/month | Unlimited | Unlimited |
| Analytics | ❌ | ✅ | ✅ |
| Family features | ❌ | ❌ | ✅ |
| Data export | ❌ | ✅ | ✅ |