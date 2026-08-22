# White Board SAT — Digital SAT Preparation Platform

White Board SAT is a Next.js Digital SAT Preparation application featuring adaptive practice engines, full-length timed mock test simulators, structured course modules, advanced progress analytics, and administrator management.

## Tech Stack
- **Framework**: Next.js 16 (App Router & Turbopack)
- **Library**: React 19, TypeScript
- **Styling**: Tailwind CSS v4, KaTeX (Math typesetting)
- **Icons & Motion**: Lucide React, Motion, Canvas Confetti

## Getting Started

### Prerequisites
- Node.js 18+ or 20+
- npm, pnpm, yarn, or bun

### Development Server
Run the local dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm run start
```

## Project Structure
- `app/page.tsx` - Main client view outlet and root layout runner
- `app/layout.tsx` - Root HTML layout with Google Geist fonts and global metadata
- `app/globals.css` - Custom styling tokens, design system, micro-animations, and KaTeX styles
- `app/services/store.ts` - Central application state management and local storage persistence
- `app/components/` - Global reusable UI components (Navbar, Footer, AuthModal, PaymentModal, MathRenderer, Calculator, QuestionCard, QuestionNavigator)
- `app/features/` - Feature hubs (Landing Page, Practice Hub, Mock Tests Hub, Courses Hub, Student Dashboard, Progress Analytics, Admin Panel)
- `app/types.ts` - Complete TypeScript interface definitions
