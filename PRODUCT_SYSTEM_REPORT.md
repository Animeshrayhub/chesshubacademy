# ChessHub Product Ecosystem – System Report

## Overview

The ChessHub platform has been expanded from a single-page academy website into a full digital product ecosystem with ebook sales, tournament management, referral tracking, SEO blog, YouTube integration, and a comprehensive admin CMS. All new data is stored in Supabase. The admin panel manages everything.

---

## Database Schema (supabase_migration_v3.sql)

### New Tables

| Table | Purpose | Key Columns |
|---|---|---|
| `ebooks` | Ebook catalog | title, description, price, cover_image, drive_link, preview_images (text[]), is_free |
| `ebook_orders` | Purchase tracking with payment proof | ebook_id (FK), buyer_name, buyer_email, payment_screenshot, status (pending/approved/rejected) |
| `tournaments` | Tournament listings | title, description, date, deadline, entry_fee, result_link |
| `tournament_registrations` | Registration + payment proof | tournament_id (FK), player_name, player_email, payment_screenshot, status |
| `referrals` | Affiliate tracking | referrer_id, referred_email, referral_code, status (pending/enrolled) |
| `blog_posts` | SEO blog articles | title, slug (unique), content (HTML), featured_image, meta_title, meta_description, published |
| `site_content` | Dynamic CMS content | content_type, title, content_data (JSONB), sort_order, is_active |
| `youtube_videos` | YouTube video embeds | title, video_id, description, sort_order, is_active |

All tables have RLS policies, indexes on frequently queried columns, and `updated_at` triggers where appropriate.

---

## API Layer

| File | Functions |
|---|---|
| `src/api/ebookApi.js` | getEbooks, getEbook, createEbook, updateEbook, deleteEbook, createEbookOrder, getEbookOrders, updateEbookOrderStatus, getApprovedOrder |
| `src/api/tournamentApi.js` | getTournaments, createTournament, updateTournament, deleteTournament, createRegistration, getRegistrations, updateRegistrationStatus |
| `src/api/referralApi.js` | getReferrals, getAllReferrals, createReferral, updateReferralStatus, generateReferralCode |
| `src/api/blogApi.js` | getBlogPosts, getAllBlogPosts, getBlogBySlug, createBlogPost, updateBlogPost, deleteBlogPost |
| `src/api/contentApi.js` | getContentByType, getAllContent, createContent, updateContent, deleteContent, getYoutubeVideos, getAllYoutubeVideos, createYoutubeVideo, updateYoutubeVideo, deleteYoutubeVideo |

---

## Public Pages & Routes

| Route | Component | Description |
|---|---|---|
| `/` | HomePage | Original homepage with all sections + new YouTubeSection |
| `/ebooks` | EbookStore | Ebook catalog with preview modal, UPI payment flow, download access |
| `/tournaments` | TournamentPage | Upcoming/past tournaments, registration with payment, results |
| `/blog` | BlogPage | Blog listing with cards, featured images, excerpts |
| `/blog/:slug` | BlogPost | Individual post with SEO meta tags (OpenGraph) |
| `/admin/*` | AdminView | Full admin panel (auth-protected) |

### Navigation
- **Navbar**: Added Ebooks, Tournaments, Blog links (react-router `<Link>`)
- **Footer**: Admin link navigates to `/admin`

---

## Admin Panel Routes

| Route | Component | Purpose |
|---|---|---|
| `/admin/dashboard` | AdminDashboard | Overview (existing) |
| `/admin/bookings` | AdminBookings | Booking management (existing) |
| `/admin/courses` | AdminCourses | Course management (existing) |
| `/admin/coaches` | AdminCoaches | Coach management (existing) |
| `/admin/content` | AdminContent | Content management (existing) |
| `/admin/ebooks` | AdminEbooks | Ebook CRUD (cover, drive link, preview images, is_free) |
| `/admin/ebook-orders` | AdminEbookOrders | Order management with approve/reject, payment screenshot preview |
| `/admin/tournaments` | AdminTournaments | Tournament CRUD + registration management with approve/reject |
| `/admin/blog` | AdminBlog | Blog post CRUD with auto-slug, HTML editor, SEO fields |
| `/admin/referrals` | AdminReferrals | Referral tracking, mark enrolled |
| `/admin/site-content` | AdminContentManager | CMS for testimonials, statistics, coach profiles, courses |
| `/admin/videos` | AdminVideos | YouTube video CRUD with URL parser |
| `/admin/settings` | AdminSettings | Settings (existing) |

---

## User Flows

### Ebook Purchase Flow
1. User browses ebook grid at `/ebooks`
2. Clicks preview to see sample images in modal
3. Clicks Buy → sees UPI payment instructions (UPI ID: `clubchess259@okaxis`)
4. Uploads payment screenshot → order created with `pending` status
5. Admin approves/rejects in `/admin/ebook-orders`
6. User returns to `/ebooks`, enters email in "Already Purchased?" section
7. If approved, download link is revealed
8. Free ebooks bypass payment flow entirely

### Tournament Registration Flow
1. User views upcoming tournaments at `/tournaments`
2. Clicks Register → fills name/email, uploads payment screenshot
3. Admin approves/rejects in `/admin/tournaments`
4. Past tournaments display result links

### Blog/SEO Flow
1. Admin creates posts with HTML content, meta tags, featured images
2. Published posts appear at `/blog`
3. Individual posts at `/blog/:slug` inject OpenGraph meta tags for social sharing
4. Meta tags cleaned up on component unmount

---

## Architecture Changes

### Routing
- **Before**: `BrowserRouter` only inside AdminView (nested router), homepage rendered directly by App.jsx with `showAdmin` state toggle
- **After**: `BrowserRouter` at `main.jsx` level wrapping the entire app. App.jsx uses `<Routes>` for all page-level routing. AdminView uses relative routes under `/admin/*`.

### Code Splitting
All new pages are lazy-loaded via `React.lazy()`:
- EbookStore, TournamentPage, BlogPage, BlogPost loaded on demand
- Admin components loaded as part of the AdminView chunk

### Payment Screenshots
Uploaded to Supabase Storage bucket `payment-screenshots` for both ebook orders and tournament registrations.

---

## File Inventory

### New Files Created
- `supabase_migration_v3.sql`
- `src/api/ebookApi.js`
- `src/api/tournamentApi.js`
- `src/api/referralApi.js`
- `src/api/blogApi.js`
- `src/api/contentApi.js`
- `src/pages/EbookStore.jsx`
- `src/pages/TournamentPage.jsx`
- `src/pages/BlogPage.jsx`
- `src/pages/BlogPost.jsx`
- `src/components/YouTubeSection.jsx`
- `src/components/admin/AdminEbooks.jsx`
- `src/components/admin/AdminEbookOrders.jsx`
- `src/components/admin/AdminTournaments.jsx`
- `src/components/admin/AdminBlog.jsx`
- `src/components/admin/AdminReferrals.jsx`
- `src/components/admin/AdminContentManager.jsx`
- `src/components/admin/AdminVideos.jsx`

### Files Modified
- `src/main.jsx` — Added BrowserRouter wrapper
- `src/App.jsx` — Replaced state-based rendering with Routes, added lazy imports for new pages, extracted HomePage component, added YouTubeSection
- `src/components/AdminView.jsx` — Removed nested BrowserRouter, added 7 new admin component imports, 7 new sidebar items, 7 new routes
- `src/components/Navbar.jsx` — Added react-router Link import, added Ebooks/Tournaments/Blog nav links

---

## Build Status

✅ Build successful — 1418 modules, no errors. New pages properly code-split into separate chunks.
