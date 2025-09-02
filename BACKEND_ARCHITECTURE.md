## Chat Hub - Backend Architecture Plan (Nest.js + MongoDB)

### Overview
- **Goal**: Multi-manager messaging platform with personalized public pages and reply-enabled visitor threads, built simply and well-engineered.
- **Stack**: Nest.js (TypeScript), MongoDB (Atlas free tier), JWT for managers, optional WebSockets, web push for notifications.
- **Key choices**: Denormalized conversations embedded in `User`; visitor resumability via `visitorId` cookie with `convoId` fallback.

### Core Principles
- **Type safety & modularity**: Feature modules, DTO validation, dependency injection.
- **Security**: Throttling, sanitization, CORS, httpOnly cookies, least data exposure.
- **Performance guardrails**: Indexes, pagination, soft caps, archiving.
- **DX & Reliability**: Centralized error handling, structured logging, tests.

### Modules
- **AppModule**: Config, DB, throttling, global pipes/filters, logging.
- **UsersModule**: Public profile by `slug`, manager settings.
- **AuthModule**: Manager signup/login, JWT guard/strategy.
- **MessagesModule**: Public send/resume, visitor thread fetch/reply, manager list/reply/archive.
- **NotificationsModule**: In-app unread counters, web push (VAPID).
- **SecurityModule**: Sanitization service, CAPTCHA adapter (extensible).
- **WebsocketsModule (optional)**: Real-time updates for dashboards.

### Data Model (Mongoose)
- **User**
  - `email` (unique), `passwordHash`, `slug` (unique), `bio`, `photoUrl`, `theme: Record<string,string>`
  - `conversations: Conversation[]`
    - `_id: ObjectId`
    - `visitorInfo: { visitorId: string; name?: string; email?: string }`
    - `messages: { sender: 'manager'|'visitor'; content: string; timestamp: Date }[]`
    - `archivedAt?: Date` (null when active; set when archived)
    - `lastMessageAt: Date`
    - `unreadCount: number` (for manager)
- **Indexes**
  - `{ slug: 1 }`
  - `{ 'conversations._id': 1 }`
  - `{ 'conversations.lastMessageAt': -1 }`
  - `{ slug: 1, 'conversations.visitorInfo.visitorId': 1 }` (scoped visitor lookups)
  - `{ slug: 1, 'conversations._id': 1 }` (scoped thread lookups)
  - Optional partial index for active threads: `{ 'conversations.archivedAt': 1, 'conversations.lastMessageAt': -1 }` with filter `archivedAt: { $exists: false }`

### Configuration (.env via @nestjs/config)
- `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`
- `RATE_LIMIT_TTL`, `RATE_LIMIT_LIMIT`, `NODE_ENV`, `CORS_ORIGIN`
- `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `PUSH_SUBJECT`

### Global Wiring
- `ValidationPipe` with `{ whitelist: true, forbidNonWhitelisted: true, transform: true }`
- Throttler: sensible defaults; override on hot endpoints.
- Global exception filter: normalized error shapes; hide internals.
- CORS: allow Next.js origin; credentials for cookies.

### Visitor Resumability
- **Primary**: On first message, generate `visitorId` (UUID v4) and set as httpOnly, sameSite=strict cookie (secure in prod). Subsequent posts match by `visitorId`.
- **Fallback**: Return `convoId` and a signed `resumeToken`, expose `resumeUrl` like `/slug/thread/:convoId?token=xyz`. Works cross-device without cookies.
- **Routes**
  - Public GET `/messages/:slug/thread/:convoId` → sanitized thread
  - Public POST `/messages/:slug/thread/:convoId/reply` → append visitor reply
  - Token handling: if `token` present, validate signature (HMAC) against convo; else fall back to `visitorId` cookie.

### Endpoints
- **Public**
  - GET `/users/:slug` → public profile (bio, photoUrl, theme)
  - POST `/messages/:slug` → start/resume; sets `visitorId` cookie; returns `{ convoId, resumeUrl }`
  - GET `/messages/:slug/thread/:convoId` → visitor thread fetch (supports `?token=...&cursor=&limit=`)
  - POST `/messages/:slug/thread/:convoId/reply` → visitor reply
- **Auth (Manager)**
  - POST `/auth/signup`
  - POST `/auth/login`
- **Manager (JWT)**
  - GET `/messages/conversations?cursor=&limit=` → list (sorted by `lastMessageAt`)
  - GET `/messages/conversations/:convoId` → full thread
  - POST `/messages/reply/:convoId` → manager reply
  - POST `/messages/archive/:convoId` → archive
  - PATCH `/users/me` → update bio/photo/theme
  - POST `/notifications/subscribe` → save web push subscription

### DTOs (representative)
- Auth: `CreateUserDto { email; password }`, `LoginDto { email; password }`
- Messages:
  - `SendMessageDto { content; name?; email?; visitorId?; convoId? }`
  - `VisitorReplyDto { content; visitorId? }`
  - `ManagerReplyDto { content }`
- Users: `UpdateProfileDto { bio?; photoUrl?; theme? }`
- Notifications: `SubscribeDto { endpoint; keys: { p256dh; auth } }`

### Services: Key Behaviors
- **MessageService**
  - `addMessage(slug, dto, sender)`
    - Resolve user by `slug`.
    - Match convo by `dto.convoId` (or signed token) → else `dto.visitorId` → else create new with new `visitorId`.
    - Sanitize `content`.
    - Use atomic updates (`findOneAndUpdate`) with `$push` (with `$each/$slice` if trimming), `$inc` for `unreadCount`, `$set` for `lastMessageAt` to avoid drift under concurrency.
    - Trigger notifications (badge + optional push/websocket).
    - Return `{ convoId, visitorId, resumeUrl }`.
  - `listConversations(userId, pagination)` → summaries (snippet, unread, lastMessageAt).
  - `getConversation(userId, convoId)` → full thread (supports message pagination).
  - `replyAsManager(userId, convoId, content)` → append; reset unread; notify.
  - `archiveConversation(userId, convoId)` → set `archivedAt` timestamp; allow unarchive by clearing it.
  - `enforceSoftCaps(convo)` → if messages ≥ cap, move entire convo to cold storage and mark archived; insert system note.
- **NotificationsService**
  - Interface-based provider; default VAPID web push. Swappable to Firebase/OneSignal later.
  - Save subscription per manager; send push on visitor message.
- **UsersService**
  - Public profile by `slug`; update profile (validated, sanitized).

### Security & Abuse Controls
- Throttling: e.g., POST message endpoints limited (e.g., 5/min/IP).
- Sanitization: server-side HTML allowlist (e.g., sanitize-html).
- Cookies: httpOnly, sameSite=strict, secure in prod.
- Optional CAPTCHA: adapter allowing swap (e.g., reCAPTCHA/Turnstile) without code sprawl.

### Pagination & Indexing
- Conversations: cursor or page+limit; sort by `lastMessageAt` desc.
- Messages: offset/limit within a convo (newest last). Apply to visitor thread fetch too.
- Indexes as listed to keep lookups O(1)-ish.

### Notifications
- In-app badge: maintain `unreadCount` per convo and aggregate total; increment on visitor message; zero on manager read.
- Web push via abstraction: store subscriptions; on new visitor message, send payload `{ title, bodySnippet, url }`.
- Optional WebSocket gateway: emit `newMessage`, `unreadUpdated` to manager clients.

### Limits & Archiving
- Soft cap: default 1000 messages per conversation.
- Behavior on exceed: move entire conversation to a `ConversationsArchive` collection (cold storage) and set `archivedAt` on the active copy; leave a system message indicating archival and provide link to archived view. Cold storage documents are queryable via separate endpoints.
- Allow unarchive: either restore from cold storage or clear `archivedAt` if retained in-place.
- Optional max conversations per user (e.g., 10k) with archival policy.

### Cold Storage Schema (Archive)
- `ConversationsArchive` collection
  - `userId`, `convoId`, `visitorInfo`, `messages[]`, `archivedAt`, `lastMessageAt`
  - Indexes: `{ userId: 1, convoId: 1 }`, `{ archivedAt: -1 }`

### Error Handling & Logging
- Global exception filter → consistent JSON errors, safe messages.
- Structured logging (request ID, user ID, route, latency). Prefer pino/Nest logger.

### Testing Strategy
- Unit: services with mocked models (jest), sanitization tests, throttling logic.
- E2E: Supertest for public (send/resume, visitor thread) and protected (list/reply/archive) flows.
- Security: XSS payloads sanitized; throttling enforced; cookie behavior verified.

### Milestones (Build Order)
1) Bootstrap project, config, DB, global pipes/filters/throttler.
2) Users module (schema + slug index + GET `/users/:slug`).
3) Auth module (signup/login/JWT guard).
4) Messages core: POST `/messages/:slug` with cookie + `{ convoId }`; manager list/fetch/reply with unread/lastMessageAt.
5) Visitor thread routes (GET/POST by `convoId`).
6) Sanitization + rate limiting finalized.
7) Notifications: subscription save + push on visitor messages; in-app badge updates.
8) Optional WebSockets for live dashboard updates.
9) Tests (unit + E2E), hardening, small load test.
10) Deploy (Render + Atlas); smoke test.

### Acceptance Criteria
- Visitors can start/resume without auth; `visitorId` cookie set/used; `convoId` fallback works.
- Managers can list, open, reply, archive; unread badge updates accurately.
- Inputs validated and sanitized; rate limits effective; indexes present.
- Web push received by subscribed managers on visitor message.
- Soft caps enforced with predictable archival/trimming behavior.


