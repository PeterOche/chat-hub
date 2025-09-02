## Chat Hub - Frontend Architecture Plan (Next.js + Tailwind)

### Stack
- Next.js (App Router, TypeScript)
- Tailwind CSS (with CSS variables for theming)
- axios (API client), js-cookie (visitorId), jwt-decode (manager auth)
- TanStack React Query for client-side data fetching/caching
- Optional: shadcn/ui (components)

### Routing
- Public
  - `/[slug]` — manager profile + “Message Me” form
  - `/[slug]/thread/[convoId]` — visitor thread (uses resume token or visitorId cookie)
- Manager (JWT)
  - `/login`, `/signup`
  - `/dashboard` — conversations list (unread badge)
  - `/dashboard/thread/[convoId]` — chat UI
  - `/settings` — update bio/photo/theme

### Data Flow & Endpoints
- Public
  - GET `/users/:slug` → profile + `theme` JSON
  - POST `/messages/:slug` → send message (sets `visitorId` cookie; returns `{ convoId, resumeUrl }`)
  - GET `/messages/:slug/thread/:convoId` → fetch thread (supports `?token=&cursor=&limit=`)
  - POST `/messages/:slug/thread/:convoId/reply` → visitor reply (with token or cookie)
- Manager (JWT)
  - POST `/auth/signup`, POST `/auth/login`
  - GET `/messages/conversations`, GET `/messages/conversations/:convoId`
  - POST `/messages/reply/:convoId`
  - PATCH `/users/me` → update bio/photo/theme
  - POST `/notifications/subscribe` → save web push subscription
- Archive
  - POST `/messages/archive/:userId/:convoId`, GET `/messages/archive/:userId/:convoId`

### Auth
- Store JWT in localStorage (dev) or httpOnly cookie (prod).
- Auth context/provider exposes `token`, `userId`, helpers; guard `/dashboard/*`.

### API Client
- axios instance with `baseURL = process.env.NEXT_PUBLIC_API_URL`.
- Request interceptor attaches `Authorization: Bearer <token>` when present.
- Response interceptor handles 401 → redirect to `/login`.
- React Query handles caching, retries, background refetch, pagination.

### React Query Usage
- Provider
  - Wrap app root with `QueryClientProvider` and hydrate server data where needed.
- Query keys (deterministic keys enable fine-grained invalidation)
  - `['profile', slug]`
  - `['thread', slug, convoId]`
  - `['conversations', userId]`
  - `['conversation', userId, convoId]`
- Patterns
  - After manager reply (POST `/messages/reply/:convoId`): invalidate `['conversation', userId, convoId]` and `['conversations', userId]`.
  - After visitor message (POST `/messages/:slug`): optionally prefetch `['thread', slug, convoId]` using returned `convoId`.
  - Thread pagination: `useInfiniteQuery` with `cursor`/`limit` params for GET `/messages/:slug/thread/:convoId`.
  - Staleness
    - Profile/theme: `staleTime` ~ 5–10 min
    - Conversations: `staleTime` short (0–30s) for freshness
    - Threads: manual refetch on focus or after mutations

### Theming & Customization
- Theme is persisted in backend `User.theme` (per slug) and applied in FE.
- On page load, map `theme` keys to CSS variables (e.g., `--bg`, `--text`, `--primary`).
- Tailwind uses those variables (e.g., `bg-[var(--bg)]`, `text-[var(--text)]`).
- `/settings` allows editing theme with live preview; on save → PATCH `/users/me`.
- Default theme in FE is merged with backend theme.

### Pages & Components (outline)
- `[slug]/page.tsx` — SSR fetch profile/theme; render hero + message form.
- `[slug]/thread/[convoId]/page.tsx` — client fetch thread (token/cookie), show messages + reply.
- `dashboard/page.tsx` — list conversations; unread badge; pagination.
- `dashboard/thread/[convoId]/page.tsx` — full chat; manager reply; mark unread to 0 on reply.
- `settings/page.tsx` — bio/photo/theme form; live preview.
- `auth/login`, `auth/signup` — forms.
- Shared: `ThemeProvider`, `ApiClient`, `AuthProvider`, `MessageList`, `Composer`.

### Notifications
- In-app badge: compute from GET `/messages/conversations` (sum of `unreadCount`).
- Web push: register subscription; POST to `/notifications/subscribe`; SW handles click → open thread.

### Real-time (optional, phase 2)
- Socket.io to emit `newMessage`, `unreadUpdated`; for MVP use polling/revalidate on focus.

### Error Handling & Security
- Central toast system for API errors.
- Mirror backend DTO constraints client-side (lengths, emails).
- Sanitize any user-rendered content (defense-in-depth; backend already sanitizes).

### Env
- `NEXT_PUBLIC_API_URL=http://localhost:3000`
- VAPID public key for push if enabled (and service worker at `public/sw.js`).

### Milestones
1) Scaffold Next.js app (TS, Tailwind), axios client, providers (Auth/Theme/QueryClient).
2) Public pages: `[slug]`, message form; thread page with `useInfiniteQuery` + token/cookie.
3) Manager: login/signup; dashboard list with React Query; thread view; reply; invalidate queries; unread badge.
4) Settings: edit bio/photo/theme; apply CSS variables; persist via PATCH; re-fetch profile on save.
5) Notifications: register push subscription (optional dev toggle).
6) Polish: loading states, empty states, error handling; basic tests.

### Main Components (based on backend)
- Providers
  - QueryClientProvider (TanStack React Query root)
  - AuthProvider (JWT storage/guard)
  - ThemeProvider (apply CSS variables from `User.theme`)
- API & Hooks
  - ApiClient (axios instance with interceptors)
  - useProfile(slug), useSendMessage(slug), useThread(slug, convoId) [infinite], useVisitorReply(slug, convoId)
  - useConversations(userId), useConversation(userId, convoId), useManagerReply(convoId)
  - useUpdateProfile(), useSubscribePush()
- Public pages
  - `[slug]` → ProfileHeader, PortfolioGrid (opt), MessageForm
  - `[slug]/thread/[convoId]` → ThreadHeader, MessageList, LoadMoreButton, MessageComposer (visitor)
- Manager pages
  - Auth: LoginForm, SignupForm
  - Dashboard: SidebarNav, ConversationList, UnreadBadge
  - Thread: ThreadHeader, MessageList, MessageComposer (manager), ThreadActions (archive/copy link)
  - Settings: ProfileForm, ThemeEditor (ThemePreview, ThemeControls, SaveThemeButton)
- Shared UI
  - Button, Input, Textarea, Select, Avatar, Card, Modal, Tooltip, Toasts
  - Spinner/Loader, EmptyState, ErrorBoundary, PillBadge, TimeAgo
- Utilities
  - theme.ts (map theme → CSS vars), cookies.ts (visitorId), auth.ts (decode/guard), formatting.ts
- Guards & SSR helpers
  - RequireAuth (client guard), server prefetch + hydration for `[slug]`
- Service worker (optional)
  - sw.js for push registration/handling; registerPush()
- React Query rules
  - Keys: ['profile', slug], ['thread', slug, convoId], ['conversations', userId], ['conversation', userId, convoId]
  - Invalidate on manager reply; prefetch thread after visitor message; useInfiniteQuery for thread
  - StaleTime: profile/theme 5–10m; conversations 0–30s; threads refetch on focus/mutation
- Accessibility/Security: sanitize displays, keyboard navigation, aria-live toasts

### Gotchas & important tradeoffs (and fixes)
- Cookie visibility vs security
  - Keep `visitorId` as httpOnly cookie (not readable by JS). Return a signed, short-lived `resumeToken` + `resumeUrl` in POST `/messages/:slug` for client resume UX. Never expose raw identifiers.
- JWT storage and CSRF
  - Dev: localStorage. Prod: httpOnly cookie + SameSite=Strict + CSRF token (double-submit cookie or server-generated token sent via `X-CSRF-Token`).
- Server vs Client Components
  - SSR fetch for `/[slug]` (profile/theme) for SEO/FCP; compose client components for forms and live chat. Pass SSR data as props to avoid flicker.
- Thread pagination & ordering
  - Cursor-based pagination (`before=<timestamp|messageId>&limit=25`), newest at bottom, fetch older on scroll-up.
- Optimistic updates
  - Add temp message with UUID; reconcile on server response to avoid duplicates and preserve order.
- Resume token security
  - Sign with HMAC, set expiry, validate server-side for `/[slug]/thread/:convoId?token=...` access.
- Push registration UX
  - Ask permission only on explicit user action; handle denied/blocked states.
- Uploads (future)
  - Use presigned uploads (S3/Cloudinary) rather than proxying through backend.
- Timezones & timestamps
  - Backend sends ISO UTC; client formats via Intl/date-fns; show relative times with absolute on hover.
- SEO & a11y
  - `/[slug]` SSR with meta tags; accessible forms, focus management, keyboard nav; `aria-live` for new message toasts.


