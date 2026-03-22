# DerivX — Options, Futures & Derivatives Learning Platform

> Interactive, gamified learning platform based on **John C. Hull's 11th Edition**.
> Built with Next.js 14, Tailwind CSS, Plotly.js, and Framer Motion.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run development server
npm run dev

# 3. Open http://localhost:3000
```

---

## 📁 Project Structure

```
derivx/
├── app/
│   ├── layout.jsx              # Root layout (fonts, metadata)
│   ├── globals.css             # Global styles + Tailwind
│   ├── page.jsx                # Landing / Book Home page
│   ├── chapters/[id]/page.jsx  # Dynamic chapter page
│   └── progress/page.jsx       # Progress dashboard
│
├── components/
│   ├── ui/
│   │   ├── Sidebar.jsx         # Animated sidebar navigation
│   │   ├── Topbar.jsx          # Top navigation bar with tabs
│   │   ├── Modal.jsx           # Reusable modal dialog
│   │   └── Notification.jsx    # Toast notifications
│   ├── charts/
│   │   ├── PayoffChart.jsx     # Option payoff diagrams (Plotly)
│   │   └── GreeksChart.jsx     # Greeks visualization (Plotly)
│   └── tabs/
│       ├── LearnTab.jsx        # Concept map + ELI5 explanations
│       ├── SimulateTab.jsx     # Interactive simulators (Plotly)
│       ├── TradeTab.jsx        # Virtual trading game
│       ├── FormulasTab.jsx     # Formula sheet
│       ├── SummaryTab.jsx      # Key summary + must-remember
│       ├── ExamplesTab.jsx     # Worked textbook examples
│       ├── ProblemsTab.jsx     # Solved + unsolved practice problems
│       ├── QuizTab.jsx         # Interactive chapter quiz
│       ├── FlashcardsTab.jsx   # Flip flashcard system
│       └── SpeedLearnTab.jsx   # 2-minute speed learn slides
│
├── lib/
│   ├── pricing.js              # Black-Scholes, Greeks, Binomial, Monte Carlo
│   ├── bookData.js             # All chapter content, problems, formulas
│   └── store.js                # Global state with localStorage
│
├── tailwind.config.js
├── next.config.js
├── netlify.toml                # Netlify deployment config
└── package.json
```

---

## 🌐 Deploy to Netlify

### Option A: GitHub + Netlify (Recommended)

1. Push to GitHub:
```bash
git init
git add .
git commit -m "Initial DerivX commit"
git remote add origin https://github.com/YOUR_USERNAME/derivx.git
git push -u origin main
```

2. Go to [netlify.app](https://netlify.app) → **Add new site** → **Import from Git**
3. Select your repository
4. Build settings are auto-detected from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `.next`
5. Click **Deploy site**

### Option B: Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=.next
```

### Option C: Drag and Drop

```bash
npm run build
# Drag the .next folder to netlify.app/drop
```

---

## ➕ Adding New Chapters

To add Chapter 3, edit `lib/bookData.js`:

### 1. Update CHAPTERS array:
```js
{ id: 'ch3', num: 3, title: 'Hedging Strategies Using Futures', status: 'available',
  topics: 'Basis risk, cross hedging, stock index futures',
  desc: 'Real-world hedging strategies using futures contracts.' },
```

### 2. Add CH3_DATA object:
```js
export const CH3_DATA = {
  id: 'ch3',
  num: 3,
  title: 'Hedging Strategies Using Futures',
  formulas: [ /* add formulas */ ],
  summary: { tagline: '...', keyPoints: [], mustRemember: [] },
  examples: [ /* worked examples */ ],
  problems: [ /* textbook problems with solutions */ ],
  unsolvedProblems: [ /* practice exercises */ ],
}
```

### 3. Register in CHAPTER_DATA:
```js
export const CHAPTER_DATA = {
  ch1: CH1_DATA,
  ch2: CH2_DATA,
  ch3: CH3_DATA,  // ← add this
}
```

### 4. Add concepts to LearnTab.jsx:
```js
// In components/tabs/LearnTab.jsx
const CH3_CONCEPTS = [
  { id: 'basis_risk', icon: '📊', name: 'Basis Risk', short: '...', body: '...', eli5: '...' },
  // ...
]
const CONCEPT_MAP = { ch1: CH1_CONCEPTS, ch2: CH2_CONCEPTS, ch3: CH3_CONCEPTS }
```

### 5. Add quiz questions to QuizTab.jsx:
```js
const CH3_QUIZ = [ /* 10 questions */ ]
const QUIZ_MAP = { ch1: CH1_QUIZ, ch2: CH2_QUIZ, ch3: CH3_QUIZ }
```

### 6. Add flashcards to FlashcardsTab.jsx and speed slides to SpeedLearnTab.jsx

---

## 🎮 Features

| Tab | Description |
|-----|-------------|
| 📚 **Learn** | Interactive concept map with ELI5 toggle and XP rewards |
| 📊 **Simulate** | Live Plotly charts: forward payoff, options, arbitrage, margin |
| 🎮 **Trade** | Virtual trading game with ₹50,000 starting balance |
| 📐 **Formulas** | Complete formula sheet with variables and examples |
| 📋 **Summary** | Key points, must-remember bullets, chapter connections |
| 🔢 **Examples** | Worked textbook examples from Hull with step-by-step solutions |
| ✏️ **Problems** | Textbook problems (with solutions) + unsolved practice exercises |
| 🧠 **Quiz** | 10-question quiz with instant feedback and score tracking |
| 🃏 **Cards** | Flip flashcard system with mastery tracking |
| ⚡ **Speed** | 2-minute speed learn slides |
| 🏆 **Progress** | XP system, level badges, achievement tracking |

---

## 🏆 Gamification System

- **XP**: Earned for reading concepts (3-15 XP), solving problems (30 XP), quiz answers (20 XP/question), achievements (25 XP)
- **Levels**: 8 levels from Intern → Legend (100 XP per level)
- **Achievements**: 14 badges including "Ch.1 Master", "Quiz Ace", "Problem Solver", "Arbitrageur"
- **Persistence**: All progress saved to localStorage automatically

---

## 📐 Pricing Models (lib/pricing.js)

```js
import { blackScholes, greeks, binomialTree, monteCarlo, impliedVolatility } from '@/lib/pricing'

// Black-Scholes
const { price, d1, d2 } = blackScholes(S=100, K=100, T=0.5, r=0.05, sigma=0.25, 'call')

// Greeks
const { delta, gamma, theta, vega, rho } = greeks(100, 100, 0.5, 0.05, 0.25, 'call')

// Binomial Tree
const { price, u, d, p, allNodes } = binomialTree(100, 100, 0.5, 0.05, 0.25, 10, 'call', false)

// Monte Carlo
const { price, samplePaths } = monteCarlo(100, 100, 0.5, 0.05, 0.25, 'call', 10000)

// Implied Volatility
const iv = impliedVolatility(marketPrice=10, S=100, K=100, T=0.5, r=0.05, 'call')
```

---

## 🎨 Customization

### Change theme colors (tailwind.config.js):
```js
colors: {
  bg: { DEFAULT: '#080c18', 2: '#0d1120', 3: '#111827', 4: '#161e30' },
  accent: { DEFAULT: '#5b8dff', 2: '#8b5cf6' },
  // ...
}
```

### Add a new tab to a chapter:
1. Create `components/tabs/MyNewTab.jsx`
2. Add to TABS array in `app/chapters/[id]/page.jsx`
3. Import and add the component: `{activeTab === 'mynew' && <MyNewTab {...tabProps} />}`

---

## 📦 Tech Stack

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 14.2.5 | React framework with App Router |
| `react` | 18 | UI library |
| `framer-motion` | 11 | Animations and transitions |
| `plotly.js-dist-min` | 2.34 | Interactive charts |
| `tailwindcss` | 3.4 | Utility CSS framework |

---

## 📝 License

Educational use. Based on Hull's "Options, Futures, and Other Derivatives" 11th Edition (Pearson).
