# ChessHub Academy — Final Platform Audit Report

**Audit Date:** March 5, 2026  
**Auditor:** Senior Software Architect  
**Platform Version:** 2.0  
**Report Classification:** Internal — Technical Audit

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Overview](#2-system-overview)
3. [Architecture Diagram](#3-architecture-diagram)
4. [Project Structure Analysis](#4-project-structure-analysis)
5. [Database Schema Explanation](#5-database-schema-explanation)
6. [Feature Breakdown](#6-feature-breakdown)
7. [Security Review](#7-security-review)
8. [Performance Review](#8-performance-review)
9. [Scalability Analysis](#9-scalability-analysis)
10. [Product System Review](#10-product-system-review)
11. [Technical Debt](#11-technical-debt)
12. [Recommended Roadmap](#12-recommended-roadmap)
13. [Appendix — File Inventory](#appendix--file-inventory)

---

## 1. Executive Summary

ChessHub Academy is an online chess coaching platform built with **React 19.2 + Vite 7.2 + Supabase**. The platform serves as a marketing site, student management system, and admin CMS for a chess coaching business targeting the Indian market.

### Key Metrics

| Metric | Value |
|--------|-------|
| Total source files | ~85 |
| React components | 55+ |
| API modules | 15 |
| Service modules | 4 |
| Supabase tables | 22 |
| Database migrations | 4 SQL files |
| Edge Functions | 1 (email service) |
| Build modules | ~1,434 |
| Lint/compile errors | 47 across 20 files |
| Test coverage | 0% (no tests exist) |

### Overall Platform Score

| Category | Score | Assessment |
|----------|-------|------------|
| Functionality | 7/10 | Wide feature set; many features are mocked/placeholder |
| Security | 3/10 | Critical credential exposure, XSS vectors, weak RLS |
| Code Quality | 4.5/10 | 47 lint errors, inconsistent patterns, dead code |
| Performance | 6/10 | Code splitting exists but heavy 3D/animation deps |
| Architecture | 5.5/10 | Clean separation but data layer is fragmented |
| Testing | 0/10 | No test files, no test framework configured |
| Accessibility | 3/10 | Keyboard navigation gaps, no ARIA labels |
| SEO | 7.5/10 | Strong meta tags, Schema.org, Open Graph |
| **Overall** | **4.5/10** | **Functional prototype with significant production gaps** |

---

## 2. System Overview

### Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend Framework | React | 19.2.0 |
| Build Tool | Vite | 7.2.4 |
| Routing | react-router-dom | 7.13.0 |
| Backend/Database | Supabase (PostgreSQL + Auth + Storage + Edge Functions) | 2.93.3 |
| State Management | React Context (AuthContext) | — |
| Charts | Recharts | 3.7.0 |
| Chess Engine | chess.js + react-chessboard | 1.4.0 / 5.8.6 |
| 3D Rendering | Three.js + @react-three/fiber + @react-three/drei | 0.182.0 |
| Animation | Framer Motion | 12.29.2 |
| Internationalization | i18next + react-i18next | 25.8.0 |
| Tour/Onboarding | react-joyride | 2.9.3 |
| External API | Lichess API | — |
| Email | Resend (via Edge Function) | — |
| Sheets Integration | Google Apps Script webhook | — |

### Platform Capabilities

The platform provides:
- **Public Marketing Site** — Hero, features, courses, testimonials, FAQ, coach profiles, demo booking
- **Student Portal** — Dashboard, courses, sessions, homework, training tools
- **Admin CMS** — Full CRUD management for all platform entities (18 admin panels)
- **Ebook Marketplace** — Listing, UPI payment, admin approval, download
- **Tournament System** — Registration, payment, admin management
- **Blog/SEO** — CMS-managed blog with slug routing and meta tags
- **Interactive Chess Tools** — Board, puzzles, analysis, variants, opening trainer
- **Gamification** — XP system, levels, streaks, daily challenges, leaderboard
- **Analytics** — Event tracking, daily aggregates, admin dashboard
- **Email Notifications** — 6 transactional email templates via Resend

### Data Flow

```
User Browser
    │
    ├── React SPA (Vite bundled)
    │       │
    │       ├── src/api/*         → Supabase Client SDK → PostgreSQL
    │       ├── src/services/     → supabase.js (client init)
    │       │                     → lichessApi.js (external API)
    │       │                     → googleSheets.js (Apps Script webhook)
    │       │                     → emailService.js (Edge Function caller)
    │       ├── src/contexts/     → AuthContext (Supabase Auth)
    │       ├── src/utils/        → XPSystem.js (localStorage)
    │       │                     → OpeningBook.js (static data)
    │       └── localStorage      → Fallback storage for many features
    │
    ├── Supabase Platform
    │       ├── PostgreSQL (22 tables, RLS policies)
    │       ├── Auth (JWT, email/password)
    │       ├── Storage (payment screenshots)
    │       └── Edge Functions (send-email → Resend API)
    │
    └── External Services
            ├── Lichess API (daily puzzles)
            ├── Google Sheets (booking webhook)
            ├── Resend (transactional email)
            └── chess-results.com (tournament iframe)
```

---

## 3. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT (React 19 SPA)                        │
├──────────────┬──────────────┬──────────────┬───────────────────────┤
│   Pages (7)  │ Components   │  Admin (18)  │  Contexts / Hooks     │
│              │   (22+)      │              │                       │
│ BlogPage     │ Navbar       │ Dashboard    │ AuthContext            │
│ BlogPost     │ Hero         │ Bookings     │ useChessGame (unused)  │
│ EbookStore   │ CoursesPreview│ Courses     │                       │
│ TournamentPg │ Testimonials │ Coaches      │  Utils                 │
│ LoginPage    │ FAQ          │ Ebooks       │ XPSystem.js            │
│ SignupPage   │ DemoBooking  │ Blog         │ OpeningBook.js         │
│ StudentDash  │ ChessFeatures│ Tournaments  │                       │
│              │ + 15 more    │ + 10 more    │                       │
├──────────────┴──────────────┴──────────────┴───────────────────────┤
│                        API Layer (15 modules)                       │
│  analyticsApi │ blogApi │ bookingApi │ coachApi │ contentApi        │
│  courseApi │ ebookApi │ leaderboardApi │ referralApi │ reportApi    │
│  sessionApi │ statsApi │ studentApi │ tournamentApi │ trainingApi  │
├─────────────────────────────────────────────────────────────────────┤
│                     Service Layer (4 modules)                       │
│        supabase.js │ lichessApi.js │ emailService.js │ googleSheets│
├───────────────┬─────────────────────────────┬───────────────────────┤
│   Supabase    │      External APIs          │   Local Storage       │
│ PostgreSQL    │ Lichess (puzzles)           │ Bookings fallback     │
│ Auth          │ Google Sheets (webhook)     │ Coach data            │
│ Storage       │ Resend (email)              │ XP/Level/Streak       │
│ Edge Fns      │ chess-results.com (iframe)  │ Settings              │
└───────────────┴─────────────────────────────┴───────────────────────┘
```

### Component Hierarchy

```
main.jsx
└── StrictMode
    └── BrowserRouter
        └── AuthProvider
            └── App
                ├── Route "/" → HomePage
                │   ├── Navbar
                │   ├── Hero → ChessScene3D (3D, lazy)
                │   ├── AnimatedStats
                │   ├── WhyChooseUs
                │   ├── ChessFeatures (lazy)
                │   │   ├── ChessBoard
                │   │   ├── DailyPuzzle
                │   │   ├── PuzzleStreakTracker
                │   │   ├── PuzzleLeaderboard
                │   │   ├── DailyChallenges
                │   │   ├── LevelProgressBar
                │   │   ├── ChessVariants
                │   │   ├── FontSizeControl
                │   │   ├── TutorialWalkthrough
                │   │   ├── GameAnalysis (lazy)
                │   │   ├── DemoAssessment (lazy)
                │   │   └── AntiComputerTraining (lazy)
                │   ├── CoursesPreview
                │   ├── StudentAchievements
                │   ├── Testimonials
                │   ├── CoachProfiles
                │   ├── TournamentCalendar (lazy)
                │   ├── YouTubeSection
                │   ├── FAQ
                │   ├── DemoBooking
                │   └── Footer
                ├── Route "/ebooks" → EbookStore (lazy)
                ├── Route "/tournaments" → TournamentPage (lazy)
                ├── Route "/blog" → BlogPage (lazy)
                ├── Route "/blog/:slug" → BlogPost (lazy)
                ├── Route "/login" → LoginPage (lazy)
                ├── Route "/signup" → SignupPage (lazy)
                ├── Route "/dashboard" → ProtectedRoute → StudentDashboard (lazy)
                └── Route "/admin/*" → AdminView (lazy)
                    ├── AdminDashboard
                    ├── AdminBookings
                    ├── AdminCourses
                    ├── AdminCoaches
                    ├── AdminContent
                    ├── AdminEbooks
                    ├── AdminEbookOrders
                    ├── AdminTournaments
                    ├── AdminBlog
                    ├── AdminReferrals
                    ├── AdminContentManager
                    ├── AdminVideos
                    ├── AdminStudents
                    ├── AdminSessions
                    ├── AdminHomework
                    ├── AdminReports
                    ├── AdminAnalytics
                    └── AdminSettings
```

### Routing System

| Route | Component | Protection | Lazy |
|-------|-----------|------------|------|
| `/` | HomePage | None | No |
| `/ebooks` | EbookStore | None | Yes |
| `/tournaments` | TournamentPage | None | Yes |
| `/blog` | BlogPage | None | Yes |
| `/blog/:slug` | BlogPost | None | Yes |
| `/login` | LoginPage | None | Yes |
| `/signup` | SignupPage | None | Yes |
| `/dashboard` | StudentDashboard | ProtectedRoute (student) | Yes |
| `/admin/*` | AdminView | Internal login gate (NOT ProtectedRoute) | Yes |

**Critical Finding:** The `/admin/*` route is NOT wrapped in `ProtectedRoute`. It has its own internal login check inside `AdminView.jsx`, but this means the admin bundle is downloaded before any authentication occurs.

---

## 4. Project Structure Analysis

### Directory Layout

```
chesshub-academy/
├── .env                          # Environment variables (CONTAINS CREDENTIALS)
├── .env.example                  # Template with placeholders
├── .gitignore                    # Standard ignores (.env included)
├── index.html                    # SPA entry with comprehensive SEO meta
├── package.json                  # Dependencies and scripts
├── vite.config.js                # Build config with manual chunk splitting
├── eslint.config.js              # ESLint flat config
│
├── public/
│   ├── manifest.json             # PWA manifest
│   ├── sw.js                     # Service worker (dead — not registered)
│   └── vite.svg                  # Default Vite asset
│
├── supabase/
│   └── functions/
│       └── send-email/
│           └── index.ts          # Resend email Edge Function
│
├── supabase_schema.sql           # v1: demo_assessments, leaderboard, user_stats
├── supabase_migration_v2.sql     # v2: bookings, coaches, courses, newsletter
├── supabase_migration_v3.sql     # v3: ebooks, tournaments, referrals, blog, CMS
├── supabase_migration_v4.sql     # v4: student system, training, analytics
│
└── src/
    ├── main.jsx                  # Entry point: StrictMode + BrowserRouter + AuthProvider
    ├── App.jsx                   # Route definitions, HomePage composition
    ├── App.css                   # Global styles
    ├── index.css                 # Root CSS
    │
    ├── api/                      # 15 API modules (Supabase CRUD wrappers)
    │   ├── analyticsApi.js
    │   ├── blogApi.js
    │   ├── bookingApi.js
    │   ├── coachApi.js
    │   ├── contentApi.js
    │   ├── courseApi.js
    │   ├── ebookApi.js
    │   ├── leaderboardApi.js
    │   ├── referralApi.js
    │   ├── reportApi.js
    │   ├── sessionApi.js
    │   ├── statsApi.js           # Partially dead (duplicated in supabase.js)
    │   ├── studentApi.js
    │   ├── tournamentApi.js
    │   └── trainingApi.js
    │
    ├── services/                 # External service integrations
    │   ├── supabase.js           # Client init + legacy DB helpers
    │   ├── lichessApi.js         # Lichess REST API wrapper
    │   ├── emailService.js       # Edge Function email caller
    │   └── googleSheets.js       # Apps Script webhook
    │
    ├── contexts/
    │   └── AuthContext.jsx        # Auth state + login/signup/logout
    │
    ├── hooks/
    │   └── useChessGame.js        # Chess game state hook (UNUSED)
    │
    ├── utils/
    │   ├── XPSystem.js            # Gamification: XP, levels, rewards
    │   └── OpeningBook.js         # ECO opening lookup database
    │
    ├── i18n/
    │   └── i18n.js                # i18next config (English only)
    │
    ├── components/                # 22 top-level + 13 subdirectory components
    │   ├── Navbar.jsx
    │   ├── Hero.jsx
    │   ├── AnimatedStats.jsx
    │   ├── WhyChooseUs.jsx
    │   ├── CoursesPreview.jsx
    │   ├── StudentAchievements.jsx
    │   ├── Testimonials.jsx
    │   ├── FAQ.jsx
    │   ├── DemoBooking.jsx
    │   ├── CoachProfiles.jsx
    │   ├── Footer.jsx
    │   ├── ErrorBoundary.jsx
    │   ├── YouTubeSection.jsx
    │   ├── ProtectedRoute.jsx
    │   ├── SEOSchemas.jsx
    │   ├── ChessFeatures.jsx
    │   ├── TournamentCalendar.jsx
    │   ├── LoadingScreen.jsx
    │   ├── Features.jsx           # DEAD — duplicates WhyChooseUs
    │   ├── ChessPuzzle.jsx        # DEAD — superseded by DailyPuzzle
    │   ├── LanguageSwitcher.jsx   # DEAD — not integrated anywhere
    │   ├── ProgressCharts.jsx     # DEAD — not routed/rendered
    │   ├── ChessScene3D.jsx
    │   ├── AdminView.jsx          # Admin shell with login + routing
    │   │
    │   ├── admin/                 # 18 admin sub-panels + CSS files
    │   ├── Accessibility/         # FontSizeControl
    │   ├── Analysis/              # GameAnalysis
    │   ├── Assessment/            # DemoAssessment
    │   ├── ChessBoard/            # ChessBoard
    │   ├── Gamification/          # DailyChallenges, LevelProgressBar
    │   ├── Opening/               # OpeningDisplay (unused outside ChessFeatures)
    │   ├── Puzzles/               # DailyPuzzle, PuzzleStreakTracker, PuzzleLeaderboard
    │   ├── Training/              # AntiComputerTraining
    │   ├── Tutorial/              # TutorialWalkthrough
    │   └── Variants/              # ChessVariants
    │
    └── pages/                     # 7 route-level pages
        ├── BlogPage.jsx
        ├── BlogPost.jsx
        ├── EbookStore.jsx
        ├── LoginPage.jsx
        ├── SignupPage.jsx
        ├── StudentDashboard.jsx
        └── TournamentPage.jsx
```

### API Layer Organization

The API layer follows a consistent pattern across 15 modules:

```javascript
import { supabase } from '../services/supabase';

export async function getEntity() {
    if (!supabase) return fallback; // Present in 10/15 files
    const { data, error } = await supabase.from('table').select('*');
    if (error) throw error;        // Or console.error + return fallback
    return data;
}
```

**Null guard coverage:**

| Has Guards (10 files) | Missing Guards (5 files) |
|---|---|
| blogApi, bookingApi, coachApi, contentApi, courseApi, ebookApi, leaderboardApi, referralApi, statsApi, tournamentApi | reportApi, sessionApi, studentApi, trainingApi, analyticsApi (partial — 1 of 5 functions) |

The 5 files without guards will **crash with TypeError** if Supabase is not configured.

### Service Layer

| Service | Purpose | Status |
|---------|---------|--------|
| supabase.js | Client initialization + legacy helpers | Active, but has **duplicate exports** (getLeaderboard, getUserStats, updateLeaderboardEntry) that overlap with api/ modules |
| lichessApi.js | Lichess REST API wrapper (puzzles, users, games, tournaments) | Active but most functions unused |
| emailService.js | Calls Supabase Edge Function for transactional email | Active but **never called** from any component |
| googleSheets.js | Fire-and-forget booking webhook to Google Apps Script | Active, wired into bookingApi |

---

## 5. Database Schema Explanation

### Schema Evolution

The database evolved across 4 migration files:

| Migration | Tables Added | Focus Area |
|-----------|-------------|------------|
| v1 (schema.sql) | demo_assessments, leaderboard, user_stats | Core gamification |
| v2 | bookings, coaches, courses, newsletter_subscribers | Business operations |
| v3 | ebooks, ebook_orders, tournaments, tournament_registrations, referrals, blog_posts, site_content, youtube_videos | Product ecosystem |
| v4 | student_profiles, student_courses, student_progress, homework_assignments, sessions, puzzle_history, game_analysis_history, opening_training_progress, progress_reports, analytics_events, analytics_daily | Student platform + analytics |

### Complete Table Documentation

#### 5.1 — student_profiles

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Core student identity table linked to Supabase Auth |
| **Key Fields** | id (UUID PK), user_id (FK → auth.users), full_name, email, phone, age, chess_rating, level, parent_name, parent_email, parent_phone |
| **Indexes** | user_id, email |
| **RLS** | Students: view/update own profile. Admins: full access. |
| **Relationships** | Parent of student_courses, student_progress, homework_assignments, sessions, puzzle_history, game_analysis_history, opening_training_progress, progress_reports |

#### 5.2 — sessions

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Coaching session scheduling and tracking |
| **Key Fields** | id (UUID PK), coach_id, student_id (FK → student_profiles, SET NULL), title, date, start_time, duration, meeting_link, status, notes |
| **Indexes** | student_id, coach_id, date |
| **RLS** | Students: view own sessions. Admins: full access. |
| **Relationships** | References student_profiles. coach_id has NO FK constraint (type mismatch — UUID vs BIGSERIAL). |

#### 5.3 — ebooks

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Digital ebook product catalog |
| **Key Fields** | id (UUID PK), title, description, price (NUMERIC 10,2), cover_image, drive_link, preview_images (JSONB), is_free |
| **Indexes** | None specific |
| **RLS** | Public: read. Admins: full CRUD. |
| **Relationships** | Parent of ebook_orders. |

#### 5.4 — ebook_orders

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Purchase orders for ebooks with payment verification |
| **Key Fields** | id (UUID PK), ebook_id (FK → ebooks, CASCADE), name, email, phone, payment_screenshot, status (pending/approved/rejected) |
| **Indexes** | status |
| **RLS** | Public: insert + read (overly permissive — reads ALL orders). Admins: full access. |
| **Relationships** | References ebooks. |

#### 5.5 — tournaments

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Chess tournament event management |
| **Key Fields** | id (UUID PK), name, description, date, entry_fee (NUMERIC 10,2), registration_deadline, result_link |
| **Indexes** | None specific |
| **RLS** | Public: read. Admins: full CRUD. |
| **Relationships** | Parent of tournament_registrations. |

#### 5.6 — tournament_registrations

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Tournament sign-ups with payment verification |
| **Key Fields** | id (UUID PK), tournament_id (FK → tournaments, CASCADE), name, email, phone, payment_screenshot, status (pending/approved/rejected) |
| **Indexes** | status |
| **RLS** | Public: insert + read (overly permissive — reads ALL registrations). Admins: full access. |
| **Relationships** | References tournaments. |

#### 5.7 — referrals

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Track student referral program |
| **Key Fields** | id (UUID PK), referrer_user_id (UUID, NO FK), referred_email, status (pending/enrolled) |
| **Indexes** | None |
| **RLS** | Public: insert + read (overly permissive). Admins: full access. |
| **Relationships** | referrer_user_id SHOULD reference auth.users but has NO constraint. |

#### 5.8 — blog_posts

| Attribute | Detail |
|-----------|--------|
| **Purpose** | SEO blog content management |
| **Key Fields** | id (UUID PK), title, slug (UNIQUE), content (HTML), featured_image, meta_title, meta_description, published |
| **Indexes** | slug |
| **RLS** | Public: read published only. Admins: full CRUD. |
| **Relationships** | None. |

#### 5.9 — site_content

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Generic CMS for dynamic website sections (testimonials, stats, etc.) |
| **Key Fields** | id (UUID PK), content_type, content_data (JSONB), sort_order, is_active |
| **Indexes** | content_type |
| **RLS** | Public: read active only. Admins: full CRUD. |
| **Relationships** | None. |

#### 5.10 — youtube_videos

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Manage YouTube video embeds on the site |
| **Key Fields** | id (UUID PK), title, video_id, sort_order, is_active |
| **Indexes** | None |
| **RLS** | Public: read active only. Admins: full CRUD. |
| **Relationships** | None. |

#### 5.11 — bookings

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Demo class booking requests |
| **Key Fields** | id (BIGSERIAL PK), name, email, phone, preferred_date, preferred_time, message, status |
| **Indexes** | email, status, created_at DESC |
| **RLS** | Public: insert. Authenticated: read/update/delete. |
| **Relationships** | None. |

#### 5.12 — coaches

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Coach profile storage |
| **Key Fields** | id (BIGSERIAL PK), name, title, rating, email, phone, specialization, experience, hourly_rate, availability, students, total_hours, rating_avg, bio, achievements, languages, photo_url |
| **Indexes** | None |
| **RLS** | Public: read. Authenticated: write/update/delete. |
| **Relationships** | Logically related to sessions/homework via coach_id but NO FK due to PK type mismatch (BIGSERIAL vs UUID). |

#### 5.13 — courses

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Course catalog with pricing |
| **Key Fields** | id (BIGSERIAL PK), title, level, duration, price, original_price, discount, rating, students, icon, color, status, description, curriculum (JSONB), features (JSONB), target_audience |
| **Indexes** | None |
| **RLS** | Public: read. Authenticated: write/update. |
| **Relationships** | Logically related to student_courses.course_id but NO FK due to PK type mismatch (BIGSERIAL vs UUID). |

#### 5.14 — student_courses

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Student enrollment records |
| **Key Fields** | id (UUID PK), student_id (FK → student_profiles, CASCADE), course_id (UUID, NO FK), enrolled_at, status, progress_pct, completed_at. UNIQUE(student_id, course_id). |
| **Indexes** | student_id |
| **RLS** | Students: view own. Admins: full access. |
| **Relationships** | References student_profiles. course_id SHOULD reference courses but type mismatch prevents FK. |

#### 5.15 — student_progress

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Time-series metrics for student performance tracking |
| **Key Fields** | id (UUID PK), student_id (FK → student_profiles), metric_type (rating/puzzles_solved/games_played/streak/lesson_completed), metric_value, recorded_at |
| **Indexes** | student_id, (student_id + metric_type), recorded_at |
| **RLS** | Students: view/insert own. Admins: full access. |
| **Relationships** | References student_profiles. |

#### 5.16 — homework_assignments

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Homework assignment, submission, and review workflow |
| **Key Fields** | id (UUID PK), student_id (FK → student_profiles), coach_id (UUID, NO FK), title, description, due_date, status, submission_text, submission_url, coach_feedback, grade, assigned_at, submitted_at, reviewed_at |
| **Indexes** | student_id, status |
| **RLS** | Students: view own + submit (update) own. Admins: full access. |
| **Relationships** | References student_profiles. coach_id has NO constraint. |

#### 5.17 — puzzle_history

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Record of puzzle attempts with performance data |
| **Key Fields** | id (UUID PK), student_id (FK → student_profiles), puzzle_id, puzzle_fen, solved, time_taken, rating_change, attempted_at |
| **Indexes** | student_id |
| **RLS** | Students: view/insert own. Admins: full access. |

#### 5.18 — game_analysis_history

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Saved game analysis results |
| **Key Fields** | id (UUID PK), student_id (FK → student_profiles), pgn, opponent, result, accuracy, blunders, mistakes, inaccuracies, best_moves, analysis_data (JSONB), analyzed_at |
| **Indexes** | student_id |
| **RLS** | Students: view/insert own. Admins: full access. |

#### 5.19 — opening_training_progress

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Track opening repertoire mastery |
| **Key Fields** | id (UUID PK), student_id (FK → student_profiles), opening_name, opening_eco, color (white/black), mastery_pct, times_practiced, last_practiced. UNIQUE(student_id, opening_name, color). |
| **Indexes** | student_id |
| **RLS** | Students: view/insert/update own. Admins: full access. |

#### 5.20 — progress_reports

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Coach-generated periodic progress reports for parents |
| **Key Fields** | id (UUID PK), student_id (FK → student_profiles), report_period, attendance_pct, sessions_attended, sessions_total, puzzles_solved, rating_start, rating_end, improvement_areas (TEXT[]), strengths (TEXT[]), coach_notes, recommended_exercises (TEXT[]), generated_by, generated_at |
| **Indexes** | student_id |
| **RLS** | Students: view own. Admins: full access. |

#### 5.21 — analytics_events

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Raw event tracking for site analytics |
| **Key Fields** | id (UUID PK), event_type, event_data (JSONB), page_path, user_id, session_id, created_at |
| **Indexes** | event_type, created_at, page_path |
| **RLS** | Public: insert (anyone can log events). Admins: read. |

#### 5.22 — analytics_daily

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Aggregated daily analytics summaries |
| **Key Fields** | id (UUID PK), date (UNIQUE), visitors, page_views, demo_bookings, ebook_sales, tournament_registrations, new_signups, top_pages (JSONB) |
| **Indexes** | date |
| **RLS** | Admins only: full access. |

### Additional Tables (not in migrations but referenced)

| Table | Referenced By | Status |
|-------|---------------|--------|
| demo_assessments | supabase.js | Defined in v1 schema |
| leaderboard | leaderboardApi.js, supabase.js | Defined in v1 schema |
| user_stats | statsApi.js, supabase.js | Defined in v1 schema |
| newsletter_subscribers | Footer.jsx | Defined in v2 migration |

### Key Database Issues

| # | Issue | Severity | Detail |
|---|-------|----------|--------|
| 1 | **PK type mismatch** | HIGH | v1/v2 tables use BIGSERIAL PKs; v3/v4 use UUID. This prevents FK constraints between `courses ↔ student_courses` and `coaches ↔ sessions/homework`. |
| 2 | **Missing FK constraints** | HIGH | `student_courses.course_id`, `homework_assignments.coach_id`, `sessions.coach_id`, `referrals.referrer_user_id`, `progress_reports.generated_by`, `analytics_events.user_id` — all lack referential integrity. |
| 3 | **Overly permissive RLS** | HIGH | `ebook_orders`, `tournament_registrations`, `referrals` policies named "read own" actually use `USING (true)` — any user can read ALL records. |
| 4 | **Inconsistent admin role checks** | MEDIUM | Three different patterns across migrations: v2 uses `TO authenticated`, v3 checks JWT claims, v4 queries `auth.users.raw_app_meta_data`. |
| 5 | **Duplicate trigger functions** | LOW | `update_updated_at_column()` (v1) and `update_updated_at()` (v3/v4) do the same thing. |
| 6 | **Missing updated_at triggers** | LOW | Most v4 tables lack updated_at triggers (only student_profiles has one). |
| 7 | **No RPC functions** | MEDIUM | Only `get_top_pages` mentioned (called by analyticsApi) but not defined in migrations. |

---

## 6. Feature Breakdown

### 6.1 — Student Platform

**Components:** LoginPage, SignupPage, StudentDashboard, ProtectedRoute, AuthContext

**Workflow:**
1. Student signs up via `/signup` (email + password + optional parent info)
2. Supabase Auth creates user → AuthContext creates student_profile
3. Student logs in → redirected to `/dashboard`
4. Dashboard shows 5 tabs: Overview, Courses, Sessions, Homework, Training
5. Each tab fetches data from respective API modules

**Assessment:** Functional core flow. Dashboard is comprehensive with real API integration. Auth context properly manages session state. Missing: password reset, email verification enforcement, profile editing.

### 6.2 — Admin Platform

**Components:** AdminView (shell + login + routing), 18 admin sub-panels

**Workflow:**
1. Admin accesses `/admin` or clicks hidden footer link
2. AdminView checks auth state — shows login form if not authenticated
3. Fallback login uses env var credentials (`VITE_ADMIN_ID` / `VITE_ADMIN_PASSWORD`)
4. Authenticated admin sees sidebar with 18 navigation items
5. Each sub-panel provides CRUD operations via API layer

**Admin Panel Inventory:**

| Panel | CRUD | API Source | Issues |
|-------|------|-----------|--------|
| Dashboard | Read | localStorage | Uses localStorage not API; hardcoded chart data |
| Bookings | R, U, D + Bulk | bookingApi | CSV injection risk in export |
| Courses | R, U | courseApi | No create/delete |
| Coaches | C, R, D | coachApi | "Edit" button shows alert ("coming soon") |
| Content (old) | None | None | Entirely dummy/hardcoded — should be removed |
| Ebooks | C, R, U, D | ebookApi | Minimal validation |
| Ebook Orders | R, U | ebookApi | No error handling |
| Tournaments | C, R, U, D | tournamentApi | No participant count display |
| Blog | C, R, U, D | blogApi | No rich text editor |
| Referrals | R, U | referralApi | Truncated referrer IDs |
| Content Manager | C, R, U, D | contentApi | Functional replacement for old AdminContent |
| Videos | C, R, U, D | contentApi | No video preview |
| Students | R | studentApi | Read-only — cannot edit/manage |
| Sessions | C, R, U, D | sessionApi | Single coach assumption |
| Homework | C, R + Review | studentApi | No update/delete |
| Reports | C, R, D | reportApi | No update; no send-to-parent |
| Analytics | R | analyticsApi | Silent error swallowing |
| Settings | R, U | localStorage | Saves to localStorage only; toggles are cosmetic |

**Assessment:** Unusually comprehensive admin panel with 18 sub-sections. Core CRUD operations work. Major gaps: AdminDashboard reads from localStorage instead of API, AdminSettings doesn't persist to database, AdminContent is entirely dead code, and several panels silently swallow errors.

### 6.3 — Ebook Marketplace

**Components:** EbookStore (public), AdminEbooks + AdminEbookOrders (admin)

**Workflow:**
1. Admin creates ebook (title, description, price, cover image, Google Drive link, preview images)
2. Public users browse `/ebooks` page
3. User selects ebook → views preview images → clicks "Buy"
4. Order form: name, email, phone → UPI payment (hardcoded ID: `clubchess259@okaxis`)
5. User uploads payment screenshot (Supabase Storage)
6. Order created with status "pending"
7. Admin reviews in AdminEbookOrders → approves or rejects
8. User checks download access by entering email → if approved, gets Google Drive link

**Assessment:** Complete manual payment verification flow suitable for early-stage business. No online payment gateway integration. UPI ID is hardcoded in the frontend.

### 6.4 — Tournament System

**Components:** TournamentPage (public), AdminTournaments (admin), TournamentCalendar (homepage embed)

**Workflow:**
1. Admin creates tournament (name, date, entry fee, deadline, result link)
2. Public users browse `/tournaments` — see upcoming and past events
3. User registers → fills form + UPI payment + screenshot upload
4. Admin reviews registrations → approves/rejects
5. Homepage embeds chess-results.com iframe for additional tournament data

**Assessment:** Mirrors the ebook payment flow. Registration is simple and functional. Missing: participant count limits, automatic deadline enforcement, bracket/pairing management.

### 6.5 — Referral System

**Components:** AdminReferrals (admin only — no public-facing referral page)

**Workflow:**
1. Referral code generated from user ID: `'CH-' + userId.substring(0,8)`
2. Admin views referrals list → can mark as "enrolled"
3. No public UI for submitting or tracking referrals

**Assessment:** Backend schema exists but no student-facing UI. The referral code generation is a pure function with no database tracking of the code itself. System is incomplete — requires a public referral entry page.

### 6.6 — Blog System

**Components:** BlogPage, BlogPost (public), AdminBlog (admin), SEOSchemas

**Workflow:**
1. Admin creates blog posts with title, slug (auto-generated), HTML content, featured image, meta tags, published flag
2. BlogPage fetches all published posts → displays grid
3. BlogPost fetches by slug → renders HTML content → sets OpenGraph meta tags

**Assessment:** Functional CMS-driven blog with SEO capabilities. Content is stored as raw HTML and rendered via `dangerouslySetInnerHTML` — XSS risk if admin accounts are compromised. No rich text editor in admin — requires raw HTML entry.

### 6.7 — Analytics System

**Components:** AdminAnalytics (admin), analyticsApi (API)

**Workflow:**
1. `trackEvent()` logs events to `analytics_events` table with session ID
2. `aggregateDaily()` rolls up event counts into `analytics_daily`
3. AdminAnalytics displays charts (AreaChart, BarChart, LineChart) with 7/30/90 day range selector
4. Shows KPIs: visitors, bookings, ebook sales, signups, tournament registrations, conversion rate

**Assessment:** Architecture is sound but `trackEvent()` is never called from any component — the analytics system has no data flowing into it. The admin panel will show empty charts until event tracking is wired into user actions.

### 6.8 — Training System

**Components:** ChessBoard, DailyPuzzle, PuzzleStreakTracker, PuzzleLeaderboard, DailyChallenges, LevelProgressBar, ChessVariants, GameAnalysis, DemoAssessment, AntiComputerTraining, OpeningDisplay, FontSizeControl, TutorialWalkthrough

**Workflow:**
1. Homepage's ChessFeatures section houses all training tools in a tabbed interface
2. DailyPuzzle fetches from Lichess API
3. Gamification (XP, levels, streaks) tracked in localStorage via XPSystem.js
4. Leaderboard syncs to Supabase
5. Analysis and Assessment use mock (random) data — no real engine

**Assessment:** Impressive feature breadth but many tools are smoke-and-mirrors:
- GameAnalysis claims "Stockfish-powered" but generates random data
- DailyPuzzle has a solution-format mismatch (UCI vs SAN) preventing validation
- AntiComputerTraining has only 1 position per mode
- ChessVariants is purely informational (no playable variants)
- DailyChallenges don't track real activity

### 6.9 — Session Scheduling

**Components:** AdminSessions (admin), StudentDashboard/SessionsTab (student)

**Workflow:**
1. Admin creates session (title, student, date, time, duration, meeting link)
2. Student sees upcoming sessions in dashboard
3. Admin can mark sessions as completed/no-show/cancelled
4. Sessions support notes

**Assessment:** Functional scheduler. Missing: recurring session support, calendar view, coach assignment (assumes single coach), Zoom/Meet integration, session reminders (email service exists but is never wired in).

### 6.10 — Email Notifications

**Components:** emailService.js (service), send-email/index.ts (Edge Function)

**Workflow:**
1. emailService.js provides 6 functions: sendDemoBookingConfirmation, sendSessionReminder, sendEbookApproval, sendTournamentConfirmation, sendProgressReport, sendWelcomeEmail
2. Each calls the Supabase Edge Function with template type + data
3. Edge Function uses Resend API to send formatted HTML emails
4. Gracefully mocks if Resend API key is not configured

**Assessment:** Well-designed email system with proper template structure and mock fallback. **Critical issue: emailService.js is never imported or called from any component.** The entire email notification system exists in code but is completely disconnected.

---

## 7. Security Review

### 7.1 — Credential Exposure

| Finding | Severity | Detail |
|---------|----------|--------|
| **Admin credentials in client bundle** | 🔴 CRITICAL | `VITE_ADMIN_ID` and `VITE_ADMIN_PASSWORD` use the `VITE_` prefix, which means Vite bundles them into the client JavaScript. Anyone can extract `chesshub7008` / `Animesh@1` from the built JS files. |
| **Supabase anon key in .env** | 🟡 MEDIUM | The anon key is designed to be public, but combined with overly permissive RLS policies, it grants too much access. |
| **Lichess API token placeholder** | 🟢 LOW | .env.example has a placeholder; actual .env doesn't include it. No exposure. |
| **Google Sheet ID in source** | 🟡 MEDIUM | `SHEET_ID` constant is hardcoded in googleSheets.js. Not strictly secret but reveals the sheet URL. |

### 7.2 — Authentication & Authorization

| Finding | Severity | Detail |
|---------|----------|--------|
| **Admin route not protected** | 🔴 CRITICAL | `/admin/*` is NOT wrapped in `ProtectedRoute`. The `AdminView` component has an internal login gate, but the entire admin bundle (~18 components) is downloaded before any auth check. |
| **Fallback admin login bypasses Supabase** | 🔴 CRITICAL | When Supabase is unavailable, admin login accepts env-var credentials directly with `role: 'admin'` set in a fake user object. This bypasses all server-side auth. |
| **No email verification** | 🟡 MEDIUM | Students can sign up and immediately access the dashboard without verifying their email. |
| **No password complexity requirements** | 🟡 MEDIUM | Only enforces minimum 6 characters. No uppercase, number, or special character requirements. |
| **No session expiry** | 🟡 MEDIUM | No explicit session timeout. Relies on Supabase default JWT expiry (1 hour with auto-refresh). |
| **No rate limiting** | 🟠 HIGH | No rate limiting on login attempts, signup, booking creation, or any public endpoint. |

### 7.3 — Data Security

| Finding | Severity | Detail |
|---------|----------|--------|
| **XSS via dangerouslySetInnerHTML** | 🔴 CRITICAL | BlogPost.jsx renders `post.content` as raw HTML. If the admin account is compromised (which is likely given credential exposure), an attacker can inject scripts into blog posts that execute for all visitors. |
| **CSV injection in export** | 🟠 HIGH | AdminBookings CSV export doesn't sanitize field values. Malicious booking names containing `=`, `+`, `-`, or `@` can execute formulas when opened in Excel/Sheets. |
| **Overly permissive RLS policies** | 🟠 HIGH | `ebook_orders`, `tournament_registrations`, `referrals` allow ANY authenticated user to read ALL records (named "read own" but use `USING (true)`). This exposes emails, phone numbers, and payment data of all users. |
| **No file upload validation** | 🟠 HIGH | EbookStore and TournamentPage upload payment screenshots to Supabase Storage with `accept="image/*"` on the input but no server-side validation. An attacker can upload any file type. |
| **UPI ID exposed in frontend** | 🟡 MEDIUM | `clubchess259@okaxis` is hardcoded and visible to anyone inspecting the source. |

### 7.4 — Infrastructure Security

| Finding | Severity | Detail |
|---------|----------|--------|
| **No Content Security Policy** | 🟡 MEDIUM | index.html has no CSP headers. Allows inline scripts, external resource loading, and iframe embedding without restrictions. |
| **Dead service worker** | 🟢 LOW | sw.js exists in public/ but is never registered by the application. References non-existent icon files (icon-192.png, icon-512.png). Not a security risk but a dead asset. |
| **No HTTPS enforcement** | 🟡 MEDIUM | No redirect from HTTP to HTTPS configured. Relies on hosting provider. |

### Security Risk Summary

| Risk Level | Count | Examples |
|------------|-------|---------|
| 🔴 Critical | 4 | Admin creds in bundle, unprotected admin route, XSS in blog, fallback auth bypass |
| 🟠 High | 3 | CSV injection, permissive RLS, no file validation |
| 🟡 Medium | 6 | No email verification, weak passwords, no CSP, no HTTPS enforcement, no session timeout, exposed UPI |
| 🟢 Low | 2 | Dead service worker, API token placeholder |

---

## 8. Performance Review

### 8.1 — Bundle Analysis

**Build Configuration (vite.config.js):**

```javascript
manualChunks: {
    'react-vendor': ['react', 'react-dom', 'react-router-dom'],
    'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
    'chess-vendor': ['chess.js', 'react-chessboard'],
    'charts-vendor': ['recharts'],
    'supabase-vendor': ['@supabase/supabase-js'],
    'animation-vendor': ['framer-motion'],
}
```

Manual chunking is properly configured with 6 vendor bundles. This enables parallel loading and cache optimization.

**Heavy Dependencies:**

| Package | Estimated Size | Usage |
|---------|---------------|-------|
| three.js + fiber + drei | ~600KB min | Hero 3D scene only |
| recharts | ~250KB min | Admin analytics + ProgressCharts |
| framer-motion | ~120KB min | Various animations |
| chess.js + react-chessboard | ~80KB min | Interactive board |
| @supabase/supabase-js | ~50KB min | All API calls |
| react-joyride | ~40KB min | Tutorial (rarely used) |
| i18next | ~30KB min | i18n (English only) |
| stockfish.js | ~300KB+ | Listed in deps but never imported |

**Key Finding:** `stockfish.js` is listed as a dependency but never imported anywhere in the codebase. This dead dependency adds to `node_modules` but shouldn't affect the bundle since it's tree-shaken. However, it should be removed from `package.json`.

### 8.2 — Code Splitting

| Technique | Implementation | Assessment |
|-----------|----------------|------------|
| Route-based splitting | `lazy()` on 10 route components | Good |
| Component-level splitting | `lazy()` on ChessFeatures, TournamentCalendar sub-components | Good |
| Vendor chunking | 6 manual chunks defined | Good |
| Dynamic imports | Used for heavy components (GameAnalysis, DemoAssessment, AntiComputerTraining) | Good |

**Not split (loaded on homepage):**
- Navbar, Hero, AnimatedStats, WhyChooseUs, CoursesPreview, StudentAchievements, Testimonials, CoachProfiles, FAQ, DemoBooking, Footer, YouTubeSection — all eagerly imported in `App.jsx`

These 12 homepage components are bundled into the main chunk, making the initial page load heavier than necessary.

### 8.3 — Runtime Performance Concerns

| Issue | Severity | Detail |
|-------|----------|--------|
| **3D scene on every load** | HIGH | ChessScene3D renders 200 particles + 8 animated meshes + 3 glowing orbs using requestAnimationFrame. This runs continuously on the homepage even when scrolled past. |
| **Aggressive localStorage polling** | MEDIUM | LevelProgressBar polls every 1 second. PuzzleStreakTracker polls every 2 seconds. Both use `setInterval` instead of event-driven updates. |
| **Parallax scroll listener** | LOW | HomePage uses `requestAnimationFrame` on scroll for hero parallax. Properly throttled with `ticking` flag. |
| **IntersectionObserver** | GOOD | AnimatedStats uses IntersectionObserver for visibility-based animation — efficient pattern. |
| **No image optimization** | MEDIUM | No lazy loading (`loading="lazy"`) on images. No WebP/AVIF optimization. Coach photos, ebook covers, and blog images load eagerly. |
| **Fake loading screen** | LOW | LoadingScreen shows a 1.5-second fake progress bar (2% every 30ms) that doesn't reflect actual load state. Adds artificial delay. |

### 8.4 — Database Query Efficiency

| Issue | Detail |
|-------|--------|
| `analyticsApi.getTopPages` | Attempts RPC `get_top_pages` → falls back to client-side aggregation if RPC doesn't exist. Fetches ALL analytics_events and processes in browser — O(n) for every page load of admin analytics. |
| `leaderboardApi.getLeaderboard` time filtering | Calculates date boundaries client-side, then uses `.gte('updated_at', date)` — functional but could be a DB function. |
| No pagination | BlogPage, AdminStudents, AdminBookings load ALL records at once. |
| No connection pooling | Using Supabase JS client's built-in connection management. |
| Over-fetching | Many queries use `.select('*')` instead of specific columns. |

### 8.5 — Caching Opportunities

| Resource | Current State | Recommendation |
|----------|--------------|----------------|
| Blog posts | Fetched on every visit | Cache with SWR/React Query (stale-while-revalidate) |
| Course list | Fetched on every visit | Cache with long TTL (courses rarely change) |
| Coach profiles | Read from localStorage | Already cached (but inconsistent with DB) |
| Lichess daily puzzle | Fetched on every visit | Cache for 24 hours (changes daily) |
| YouTube videos | Fetched on every visit | Cache with medium TTL |
| Static data (FAQ, achievements, features) | Hardcoded in components | Already "cached" by being static |

---

## 9. Scalability Analysis

### Current Architecture Limits

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│  100 Students │ 500 Students │ 1K Students  │ 10K Students │
├──────────────┼──────────────┼──────────────┼──────────────┤
│ ✅ Works     │ ⚠️ Stress    │ 🔴 Breaking  │ 🔴 Failed    │
│ as-is       │ points       │ point        │              │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

### 100 Students — VIABLE ✅

| Aspect | Assessment |
|--------|------------|
| Database | Well within Supabase free/pro tier limits |
| Auth | Supabase handles auth tokens efficiently |
| API | Direct client-to-DB queries work fine |
| Admin | Single-page lists of 100 students load instantly |
| Storage | Payment screenshots manageable |
| Sessions | ~100-400 sessions/month — manageable |

**No changes needed for 100 students.**

### 500 Students — STRESS POINTS ⚠️

| Aspect | Issue | Mitigation |
|--------|-------|------------|
| Admin panels | AdminStudents, AdminBookings load ALL records — 500+ row tables get slow | Add server-side pagination |
| Analytics | `getTopPages()` fetches all events client-side | Implement proper RPC aggregation |
| Email | 500 welcome emails + session reminders — emailService not wired | Must connect emailService |
| Storage | ~1000+ payment screenshots | Implement cleanup/archival policy |
| Coach management | Single-coach assumption breaks | Add coach assignment to sessions |
| Leaderboard | Client-side ranking of 500 users | Works but add server-side ranking |

### 1,000 Students — BREAKING POINT 🔴

| Aspect | Breaking Issue |
|--------|---------------|
| **Database** | No query pagination — SELECT * on 1K-row tables with JOINs |
| **RLS policies** | v4 admin policies query `auth.users` table for every row — O(n) policy check per query |
| **Real-time** | No real-time subscriptions — admin must manually refresh to see new data |
| **Concurrent** | Multiple admins editing the same entity — no optimistic locking |
| **Homework** | Reviewing 1000 students' homework without filtering/sorting |
| **Reports** | Generating reports for 1000 students — no batch capability |
| **Search** | Client-side filtering breaks down — need full-text search |

### 10,000 Students — INFRASTRUCTURE FAILURE 🔴

| Aspect | Required Changes |
|--------|-----------------|
| **Architecture** | Move to SSR (Next.js) or split into microservices |
| **Database** | Connection pooling, read replicas, materialized views |
| **Caching** | Redis or CDN-based caching layer |
| **Search** | Elasticsearch or Supabase full-text search |
| **Storage** | CDN for static assets, image optimization pipeline |
| **Email** | Queue-based email processing (Bull, RabbitMQ) |
| **Analytics** | Dedicated analytics service (PostHog, Mixpanel) |
| **Payment** | Razorpay/Stripe integration (manual UPI unscalable) |
| **Multi-tenant** | Multiple coaches, branch offices, role-based access |
| **Monitoring** | APM, error tracking (Sentry), uptime monitoring |

### Scalability Roadmap

| Milestone | Key Actions |
|-----------|-------------|
| 100 → 250 | Wire email service, add pagination to admin, fix RLS policies |
| 250 → 500 | Add server-side search, implement caching, payment gateway |
| 500 → 1K | Add real-time subscriptions, batch operations, multi-coach support |
| 1K → 5K | Move to SSR, add read replicas, CDN, queue-based processing |
| 5K → 10K | Microservices, Elasticsearch, dedicated analytics, APM |

---

## 10. Product System Review

### 10.1 — Revenue Generation Systems

#### Ebook Sales Flow

```
Admin creates ebook → User browses → User pays UPI → Uploads screenshot
→ Admin approves → User enters email → Gets Google Drive link
```

| Metric | Assessment |
|--------|------------|
| Conversion friction | HIGH — manual UPI + screenshot upload + admin approval |
| Revenue tracking | None — no order totals, no financial reports |
| Scalability | LOW — manual approval doesn't scale past ~50 orders/month |
| Improvement | Integrate Razorpay UPI autopay for instant delivery |

#### Demo Booking Flow

```
User fills Google Form → Data goes to Google Sheets → Admin manages externally
```

| Metric | Assessment |
|--------|------------|
| Lead capture | Good — Google Form is reliable and familiar |
| CRM integration | None — bookings in Google Sheets, disconnected from admin panel |
| Follow-up | None — email confirmations never sent (emailService not wired) |
| Improvement | Wire bookings back to Supabase for unified admin view |

#### Tournament Registration

```
Admin creates tournament → User registers + pays UPI → Uploads screenshot
→ Admin approves/rejects
```

| Metric | Assessment |
|--------|------------|
| Revenue per event | Entry fees collected via manual UPI |
| Participant management | Basic — no bracket generation, no result tracking |
| Improvement | Integrate Lichess API for tournament creation, auto-pairing |

### 10.2 — Lead Generation Systems

| System | Mechanism | Lead Quality | Status |
|--------|-----------|-------------|--------|
| Demo Booking | Google Form → Google Sheets | High (intent-based) | ✅ Active |
| Demo Assessment | Play game → collect PII | Medium (engagement-based) | ⚠️ Assessment is mocked |
| Newsletter | Footer email signup | Low (passive) | ✅ Active (Supabase) |
| Blog SEO | Organic search → blog → CTA | Medium (content-based) | ✅ Active but needs content |
| Referrals | Student code → friend sign up | High (social proof) | ❌ No public UI |

### 10.3 — Business Intelligence

| Capability | Status | Detail |
|------------|--------|--------|
| Revenue reporting | ❌ Missing | No financial dashboards, order totals, or revenue tracking |
| Student retention | ❌ Missing | No churn tracking, no engagement scoring |
| Course performance | ⚠️ Partial | AdminCourses shows enrollment counts but no completion rates |
| Marketing analytics | ⚠️ Partial | Analytics infrastructure exists but `trackEvent()` is never called |
| Coach performance | ❌ Missing | No session completion rates, student ratings of coaches |
| Conversion funnel | ❌ Missing | No tracking from visit → demo → enrollment → retention |

---

## 11. Technical Debt

### 11.1 — Dead Code

#### Dead Files (7 files — can be safely deleted)

| File | Reason |
|------|--------|
| `src/components/Features.jsx` | Duplicate of WhyChooseUs.jsx. Same `id="features"` anchor. |
| `src/components/Features.css` | CSS for dead Features component |
| `src/components/ChessPuzzle.jsx` | Superseded by Puzzles/DailyPuzzle.jsx |
| `src/components/ChessPuzzle.css` | CSS for dead ChessPuzzle component |
| `src/components/LanguageSwitcher.jsx` | Not imported by any component |
| `src/components/LanguageSwitcher.css` | CSS for dead LanguageSwitcher component |
| `src/hooks/useChessGame.js` | Custom hook never imported anywhere |

#### Dead Components (unreferenced but not files — used within dead parents)

| Component | Reason |
|-----------|--------|
| `ProgressCharts.jsx` | Never rendered in any route or page |
| `Opening/OpeningDisplay.jsx` + CSS | Only used inside ChessFeatures but tab for it doesn't exist |
| `admin/AdminContent.jsx` + CSS | Superseded by AdminContentManager.jsx — entirely hardcoded |

#### Dead Dependencies

| Package | Reason |
|---------|--------|
| `stockfish.js` | Listed in package.json but never imported |
| `workbox-webpack-plugin` | Only works with webpack, not Vite |
| `workbox-window` | Companion to workbox-webpack-plugin; unused |

#### Dead Exports (~40+ across API layer)

The `emailService.js` exports 6 functions — none are ever imported. The `supabase.js` service exports `getLeaderboard`, `updateLeaderboardEntry`, `getUserStats`, `updateUserStats` — but these are also independently implemented in `leaderboardApi.js` and `statsApi.js` (duplicates).

### 11.2 — Duplicated Logic

| Duplication | Files |
|-------------|-------|
| Same stats (500+ students, 50+ coaches, 98%) hardcoded in 3 places | Hero.jsx, AnimatedStats.jsx, WhyChooseUs.jsx |
| Default courses defined twice | courseApi.js (`DEFAULT_COURSES`) and CoursesPreview.jsx (hardcoded) |
| Default coaches defined twice | coachApi.js (`DEFAULT_COACHES`) and CoachProfiles.jsx (`defaultCoaches`) |
| Leaderboard functions duplicated | supabase.js and leaderboardApi.js |
| User stats functions duplicated | supabase.js and statsApi.js |
| XP/streak logic duplicated | XPSystem.js and DailyPuzzle.jsx local functions |
| `update_updated_at` trigger function | Defined twice in migrations (v1 and v3) |

### 11.3 — Inconsistent Patterns

| Pattern | Inconsistency |
|---------|---------------|
| CSS approach | Mix of external CSS files (8), embedded `<style>` tags (8), inline JS style objects (6), and no styles at all (some components) |
| Error handling | Some API files throw errors, others console.error + return fallback, others silently return |
| Field naming | Mix of camelCase (`preferredDate`) and snake_case (`preferred_date`) across API/components |
| PK types | BIGSERIAL in v1/v2 vs UUID in v3/v4 |
| Admin RLS checks | 3 different patterns across migrations |
| Null guards | 10/15 API files have them, 5 don't |
| Function declarations | Mix of `function load() {}` and `const load = async () => {}` — ESLint flags the function declaration pattern when used after `useEffect` |

### 11.4 — Missing Tests

| Category | Test Files | Coverage |
|----------|-----------|----------|
| Unit tests | 0 | 0% |
| Integration tests | 0 | 0% |
| E2E tests | 0 | 0% |
| API tests | 0 | 0% |
| Snapshot tests | 0 | 0% |

**No testing framework is configured** — no vitest, jest, cypress, or playwright in devDependencies.

### 11.5 — Lint Errors (47 total)

| Error Pattern | Count | Files |
|---------------|-------|-------|
| `Cannot access variable before it is declared` (function hoisting with const/let) | 18 | StudentDashboard, EbookStore, TournamentPage, BlogPost, ProgressCharts, AdminEbooks, AdminEbookOrders, AdminTournaments, AdminBlog, AdminReferrals, AdminContentManager, AdminVideos, AdminSessions, AdminHomework, AdminStudents, AdminReports, AdminAnalytics |
| `React Hook useEffect has missing dependencies` | 4 | StudentDashboard, AdminContentManager, AdminAnalytics, ProgressCharts |
| `'variable' is assigned but never used` | 2 | StudentDashboard (`user`), googleSheets.js (`response`) |
| TypeScript errors in Edge Function (Deno types) | 12 | send-email/index.ts |
| Other | 11 | Various |

The 18 "function accessed before declaration" errors follow a single anti-pattern:

```javascript
// CURRENT (causes error):
useEffect(() => { loadData(); }, []);
const loadData = async () => { /* ... */ };

// SHOULD BE:
const loadData = async () => { /* ... */ };
useEffect(() => { loadData(); }, []);
```

### 11.6 — Data Desynchronization

A significant architectural issue: **public-facing components use hardcoded data while admin panels modify Supabase data**. Changes made in the admin panel are not reflected on the public website.

| Public Component | Data Source | Admin Panel | Data Source | Synced? |
|-----------------|-------------|-------------|-------------|---------|
| CoursesPreview | Hardcoded (4 courses) | AdminCourses | Supabase `courses` | ❌ NO |
| CoachProfiles | localStorage → hardcoded defaults | AdminCoaches | Supabase `coaches` | ❌ NO |
| AnimatedStats | Hardcoded (500/50/10K/98) | — | — | N/A |
| Testimonials | Hardcoded (5 testimonials) | AdminContentManager | Supabase `site_content` | ❌ NO |
| StudentAchievements | Hardcoded (6 profiles) | — | — | N/A |
| FAQ | Hardcoded (10 Q&A) | — | — | N/A |
| Hero stats | Hardcoded | — | — | N/A |
| WhyChooseUs stats | Hardcoded | — | — | N/A |
| YouTubeSection | API → hardcoded fallback | AdminVideos | Supabase `youtube_videos` | ✅ YES (if DB has data) |
| Blog | API | AdminBlog | Supabase `blog_posts` | ✅ YES |
| Ebooks | API | AdminEbooks | Supabase `ebooks` | ✅ YES |
| Tournaments | API | AdminTournaments | Supabase `tournaments` | ✅ YES |

### 11.7 — i18n Gaps

- Only English translations exist — Hindi, Tamil, Telugu placeholders are defined in `LanguageSwitcher.jsx` but no translation keys exist for those languages.
- A typo in the English translation file: `"chess. puzzle"` (space before "puzzle").
- Most UI text is hardcoded in components rather than using `useTranslation()`.
- `LanguageSwitcher` component exists but is not rendered in Navbar or anywhere else.

---

## 12. Recommended Roadmap

### Priority 1 — Critical Fixes (Security & Stability)

| # | Task | Effort | Impact |
|---|------|--------|--------|
| 1.1 | **Remove admin credentials from client bundle** — Move `VITE_ADMIN_ID`/`VITE_ADMIN_PASSWORD` to server-side (Supabase RPC or Edge Function). Remove the `VITE_` prefix so they aren't bundled. | 4h | Critical security fix |
| 1.2 | **Protect admin route** — Wrap `/admin/*` in `ProtectedRoute` with `requireAdmin={true}` so the admin bundle isn't downloaded for unauthenticated users. | 1h | Critical security fix |
| 1.3 | **Sanitize blog HTML** — Install DOMPurify and sanitize `post.content` before passing to `dangerouslySetInnerHTML`. | 2h | XSS prevention |
| 1.4 | **Fix RLS policies** — Update `ebook_orders`, `tournament_registrations`, and `referrals` SELECT policies to properly filter by user (`auth.uid()` matches the record owner). | 3h | Data privacy |
| 1.5 | **Add Supabase null guards** — Add `if (!supabase) return [];` to the 5 unguarded API files: reportApi, sessionApi, studentApi, trainingApi, analyticsApi. | 1h | Crash prevention |
| 1.6 | **Fix CSV injection** — Sanitize CSV export fields in AdminBookings (prefix cells starting with `=`, `+`, `-`, `@` with a single quote). | 1h | Data integrity |
| 1.7 | **Add file upload validation** — Server-side file type and size validation for payment screenshots. | 2h | Security |

**Estimated total: ~14 hours**

### Priority 2 — Stability Improvements

| # | Task | Effort | Impact |
|---|------|--------|--------|
| 2.1 | **Fix 47 lint errors** — Reorder function declarations before `useEffect` calls (18 files). Add missing `useEffect` dependencies. Fix unused variables. | 3h | Code quality |
| 2.2 | **Connect email service** — Wire `emailService.js` functions into booking creation, session creation, ebook approval, tournament registration, and signup flows. | 4h | User experience |
| 2.3 | **Wire analytics tracking** — Call `trackEvent()` in key user actions: page views, demo bookings, ebook purchases, sign-ups, tournament registrations. | 3h | Business intelligence |
| 2.4 | **Fix data desynchronization** — Replace hardcoded data in CoursesPreview, CoachProfiles, and Testimonials with API calls to Supabase. | 6h | Data consistency |
| 2.5 | **Remove dead code** — Delete 7 dead files, 3 unused dependencies, dead exports in supabase.js, and the obsolete AdminContent component. | 2h | Codebase hygiene |
| 2.6 | **Fix LoginPage/SignupPage navigate anti-pattern** — Replace render-time `navigate()` calls with `useEffect` or `<Navigate>`. | 1h | React best practices |
| 2.7 | **Add 404 route** — Add a catch-all `<Route path="*">` for unmatched URLs. | 1h | User experience |
| 2.8 | **Fix AdminDashboard data source** — Replace localStorage reads with API calls to bookingApi for accurate dashboard data. | 2h | Admin reliability |
| 2.9 | **Fix DailyPuzzle solution validation** — Convert Lichess UCI solution format to SAN before comparing with user moves. | 2h | Feature correctness |

**Estimated total: ~24 hours**

### Priority 3 — Scaling Improvements

| # | Task | Effort | Impact |
|---|------|--------|--------|
| 3.1 | **Add pagination** — Implement server-side pagination for AdminStudents, AdminBookings, BlogPage, and all list views with 50+ records. | 8h | Scalability |
| 3.2 | **Implement caching** — Add React Query or SWR for API data caching with stale-while-revalidate pattern. | 6h | Performance |
| 3.3 | **Integrate payment gateway** — Replace manual UPI with Razorpay for ebook and tournament payments. Auto-approve on payment confirmation. | 16h | Revenue ops |
| 3.4 | **Add testing framework** — Set up Vitest + React Testing Library. Write tests for critical paths: auth flow, booking creation, ebook purchase. | 16h | Reliability |
| 3.5 | **Fix PK type mismatch** — Migrate v1/v2 tables (coaches, courses) to UUID PKs and establish proper FK constraints. | 8h | Data integrity |
| 3.6 | **Standardize CSS approach** — Migrate all inline styles and `<style>` tags to CSS modules or a consistent CSS-in-JS solution. | 12h | Maintainability |
| 3.7 | **Add real-time subscriptions** — Use Supabase real-time for admin panels to auto-refresh when data changes. | 6h | Admin UX |
| 3.8 | **Lazy load homepage sections** — Use `IntersectionObserver` to lazy-load below-fold sections (CoursesPreview, Testimonials, FAQ, etc.). | 4h | Performance |
| 3.9 | **Optimize 3D scene** — Add a visibility check to pause the 3D render loop when the hero section is not visible. | 2h | Performance |
| 3.10 | **Standardize admin RLS** — Unify the three admin role-check patterns into a single Supabase RPC function. | 4h | Security consistency |

**Estimated total: ~82 hours**

### Priority 4 — Advanced Features

| # | Task | Effort | Impact |
|---|------|--------|--------|
| 4.1 | **Multi-coach support** — Add coach assignment UI, per-coach session calendars, and coach-specific dashboards. | 20h | Business scaling |
| 4.2 | **Real chess analysis** — Integrate Stockfish WASM for actual engine analysis. Replace mock data in GameAnalysis and DemoAssessment. | 16h | Product quality |
| 4.3 | **Parent portal** — Build a parent-facing view with progress reports, session schedules, and payment history. | 20h | Stakeholder engagement |
| 4.4 | **Revenue dashboard** — Build financial reporting: order totals, monthly revenue, payment gateway reconciliation. | 12h | Business intelligence |
| 4.5 | **Advanced referral system** — Public referral page, unique shareable links, reward tracking, and discount code integration. | 12h | Growth |
| 4.6 | **Multi-language support** — Complete Hindi/Tamil/Telugu translations, wire LanguageSwitcher into Navbar. | 16h | Market expansion |
| 4.7 | **PWA activation** — Register service worker, add offline support, push notifications for session reminders. | 12h | Engagement |
| 4.8 | **Student video lessons** — Pre-recorded lesson content with progress tracking, bookmarks, and quizzes. | 24h | Product expansion |
| 4.9 | **Mobile app** — React Native companion app for student dashboard and push notifications. | 40h+ | Platform expansion |
| 4.10 | **Automated session scheduling** — Self-service booking widget with coach availability calendar and Calendly-style flow. | 16h | Operational efficiency |

**Estimated total: ~188 hours**

---

## Appendix — File Inventory

### Source File Count by Directory

| Directory | Files | Purpose |
|-----------|-------|---------|
| src/api/ | 15 | Supabase CRUD wrappers |
| src/components/ | 22 top-level + 4 CSS | Homepage + shared components |
| src/components/admin/ | 18 JSX + 6 CSS | Admin panel sub-pages |
| src/components/Accessibility/ | 1 JSX + 1 CSS | Font size control |
| src/components/Analysis/ | 1 JSX + 1 CSS | Game analysis |
| src/components/Assessment/ | 1 JSX + 1 CSS | Demo assessment |
| src/components/ChessBoard/ | 1 JSX + 1 CSS | Interactive chessboard |
| src/components/Gamification/ | 2 JSX + 2 CSS | Daily challenges, level bar |
| src/components/Opening/ | 1 JSX + 1 CSS | Opening display |
| src/components/Puzzles/ | 3 JSX + 3 CSS | Daily puzzle, streak, leaderboard |
| src/components/Training/ | 1 JSX + 1 CSS | Anti-computer training |
| src/components/Tutorial/ | 1 JSX + 1 CSS | Onboarding walkthrough |
| src/components/Variants/ | 1 JSX + 1 CSS | Chess variants |
| src/pages/ | 7 | Route-level pages |
| src/services/ | 4 | External integrations |
| src/contexts/ | 1 | Auth context |
| src/hooks/ | 1 | Chess game hook (unused) |
| src/utils/ | 2 | XP system, opening book |
| src/i18n/ | 1 | i18next config |
| public/ | 3 | Manifest, SW, favicon |
| supabase/functions/ | 1 | Email edge function |
| root/ | 4 SQL + 7 config/docs | Migrations, config |
| **Total** | **~100** | |

### Supabase Tables Summary

| # | Table | Migration | PK Type | RLS | FK Count |
|---|-------|-----------|---------|-----|----------|
| 1 | demo_assessments | v1 | BIGSERIAL | ✅ | 0 |
| 2 | leaderboard | v1 | BIGSERIAL | ✅ | 0 |
| 3 | user_stats | v1 | BIGSERIAL | ✅ | 0 |
| 4 | bookings | v2 | BIGSERIAL | ✅ | 0 |
| 5 | coaches | v2 | BIGSERIAL | ✅ | 0 |
| 6 | courses | v2 | BIGSERIAL | ✅ | 0 |
| 7 | newsletter_subscribers | v2 | BIGSERIAL | ✅ | 0 |
| 8 | ebooks | v3 | UUID | ✅ | 0 |
| 9 | ebook_orders | v3 | UUID | ⚠️ | 1 |
| 10 | tournaments | v3 | UUID | ✅ | 0 |
| 11 | tournament_registrations | v3 | UUID | ⚠️ | 1 |
| 12 | referrals | v3 | UUID | ⚠️ | 0 |
| 13 | blog_posts | v3 | UUID | ✅ | 0 |
| 14 | site_content | v3 | UUID | ✅ | 0 |
| 15 | youtube_videos | v3 | UUID | ✅ | 0 |
| 16 | student_profiles | v4 | UUID | ✅ | 1 |
| 17 | student_courses | v4 | UUID | ✅ | 1 |
| 18 | student_progress | v4 | UUID | ✅ | 1 |
| 19 | homework_assignments | v4 | UUID | ✅ | 1 |
| 20 | sessions | v4 | UUID | ✅ | 1 |
| 21 | puzzle_history | v4 | UUID | ✅ | 1 |
| 22 | game_analysis_history | v4 | UUID | ✅ | 1 |
| 23 | opening_training_progress | v4 | UUID | ✅ | 1 |
| 24 | progress_reports | v4 | UUID | ✅ | 1 |
| 25 | analytics_events | v4 | UUID | ✅ | 0 |
| 26 | analytics_daily | v4 | UUID | ✅ | 0 |

*(Note: 26 total including newsletter_subscribers; 22 was the earlier count excluding it and the demo_assessments/leaderboard/user_stats from v1)*

---

**End of Audit Report**

*This report was generated through a comprehensive review of all ~100 source files, 4 SQL migration files, 1 Edge Function, and the complete dependency chain. No code was modified during this audit.*
