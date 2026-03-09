# Carping — Full-Stack Car QR Notification App

## What is Carping?

A subscription-based car notification platform. Users register their car and get a unique QR code sticker for their windshield. When someone scans the QR code (parking issues, blocked access, accidents, emergencies), the car owner gets an instant notification without sharing their phone number.

---

## WHAT'S ALREADY BUILT (Do NOT recreate these)

### Backend (server/) — WORKING

- Express 5.2.1 + TypeScript (ESM) running on port 3000
- Prisma 7.4.2 with PostgreSQL adapter connected to Neon (Singapore)
- All 4 database tables created: User, Car, Notification, RefreshToken
- Zod-validated environment variables (config/env.ts)
- Prisma singleton with SSL + pg Pool (config/prisma.ts)
- Global error handler with ApiError class (middleware/error-handler.ts)
- JWT auth middleware (middleware/auth.ts)
- Zod validation middleware (middleware/validate.ts)
- Password hashing with bcryptjs (utils/hash.ts)
- JWT access + refresh token generation (utils/jwt.ts)
- Standardized API responses (utils/api-response.ts)
- Express Request type extended with user (types/express.d.ts)

### Auth Feature (server/src/features/auth/) — WORKING & TESTED

- POST /api/auth/register — creates user, returns tokens
- POST /api/auth/login — validates credentials, returns tokens
- POST /api/auth/refresh — refreshes access token
- POST /api/auth/logout — revokes refresh token
- GET /api/auth/me — returns authenticated user (protected)
- POST /api/auth/forgot-password — mock reset (returns success message)
- All routes have Zod validation with field-level errors
- Test user exists: ali@test.com / Test1234

### Frontend (carping/) — SCAFFOLDED ONLY

- Expo SDK 54 project created with default template (includes Expo Router)
- Dependencies installed: zustand, @tanstack/react-query, zod, expo-font, @expo-google-fonts/inter, expo-secure-store
- NO screens built yet

---

## TECH STACK (Exact versions installed)

### Backend (server/)

- Express 5.2.1, TypeScript 5.9.3, tsx 4.21.0
- Prisma 7.4.2 with @prisma/adapter-pg, pg driver
- Zod 4.3.6, jsonwebtoken 9.0.3, bcryptjs 3.0.3
- Node.js ESM ("type": "module" in package.json)
- All imports use .js extensions (ESM convention)

### Frontend (carping/)

- Expo SDK 54, React Native 0.81, TypeScript
- Expo Router (file-based routing)
- Zustand, TanStack Query, Zod
- Inter font via @expo-google-fonts/inter
- expo-secure-store for JWT persistence

### Database

- Neon PostgreSQL 17 (Singapore region)
- Connection string in server/.env
- SSL required: { rejectUnauthorized: false } in pg Pool config

---

## BACKEND FILE STRUCTURE (Already exists)

```
server/
├── prisma/
│   └── schema.prisma              ✅ All models defined
├── prisma.config.ts               ✅ Prisma 7 config (datasource URL here, NOT in schema)
├── .env                           ✅ DATABASE_URL, JWT secrets, PORT
├── package.json                   ✅ ESM, all scripts defined
├── tsconfig.json                  ✅ ESM config
└── src/
    ├── server.ts                  ✅ Entry point, DB connection test
    ├── app.ts                     ✅ Express setup, auth routes wired
    ├── config/
    │   ├── env.ts                 ✅ Zod-validated env
    │   └── prisma.ts              ✅ Prisma 7 + pg adapter + SSL
    ├── middleware/
    │   ├── auth.ts                ✅ JWT Bearer verification
    │   ├── validate.ts            ✅ Zod request validation
    │   └── error-handler.ts       ✅ Global error handler + ApiError
    ├── utils/
    │   ├── jwt.ts                 ✅ Token gen/verify (15min access, 7d refresh)
    │   ├── hash.ts                ✅ bcrypt hash/compare
    │   └── api-response.ts        ✅ sendSuccess/sendError helpers
    ├── types/
    │   └── express.d.ts           ✅ Request.user type extension
    └── features/
        ├── auth/                  ✅ COMPLETE
        │   ├── auth.schema.ts     ✅ Zod schemas (register, login, refresh, forgotPassword)
        │   ├── auth.service.ts    ✅ Business logic (register, login, refresh, logout, getMe)
        │   ├── auth.controller.ts ✅ HTTP handlers
        │   └── auth.routes.ts     ✅ Route wiring
        ├── cars/                  ❌ NOT BUILT
        ├── notifications/         ❌ NOT BUILT
        └── qr/                    ❌ NOT BUILT
```

---

## FRONTEND FILE STRUCTURE (To be built)

```
carping/
├── app/                              # Expo Router routes
│   ├── _layout.tsx                   # Root: fonts, providers, auth gate
│   ├── index.tsx                     # Splash redirect
│   ├── (auth)/
│   │   ├── _layout.tsx               # Stack for auth
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx               # Bottom tabs
│   │   ├── index.tsx                 # Home dashboard
│   │   ├── cars/
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx             # Cars list
│   │   │   ├── add.tsx
│   │   │   └── [id].tsx              # Car detail
│   │   ├── notifications.tsx
│   │   └── profile.tsx
│   ├── qr/
│   │   └── [code].tsx                # Public QR scan (no auth)
│   └── car/
│       └── [id]/
│           └── qrcode.tsx
├── src/
│   ├── components/common/            # Button, Input, Card, Badge, EmptyState, LoadingScreen
│   ├── services/                     # API fetch wrapper + feature services
│   │   ├── api.ts                    # Base client with JWT from SecureStore
│   │   ├── auth.ts
│   │   ├── cars.ts
│   │   └── notifications.ts
│   ├── store/                        # Zustand stores
│   │   ├── auth-store.ts
│   │   ├── cars-store.ts
│   │   └── notifications-store.ts
│   ├── hooks/                        # TanStack Query hooks
│   ├── theme/                        # colors, typography, spacing
│   ├── types/
│   ├── utils/                        # Zod schemas, date formatting
│   └── constants/                    # Mock data (if needed)
├── app.config.ts                     # Dynamic config with scheme: 'carping'
└── .env                              # EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

---

## DESIGN SYSTEM

### Colors

Primary: #1A73E8 (blue), Primary Light: #4A9AFF, Primary Dark: #0D47A1
Accent: #00C853 (green), Background: #FFFFFF, Background Secondary: #F5F7FA
Text Primary: #1A1A2E, Text Secondary: #6B7280, Text Light: #9CA3AF
Border: #E5E7EB, Error: #EF4444, Warning: #FFB300, Success: #00C853

### Spacing (4px grid)

xs:4 sm:8 md:12 base:16 lg:20 xl:24 xxl:32 xxxl:40 huge:48

### Border Radius

sm:6 md:10 lg:14 xl:20 full:9999

### Typography (Inter font)

h1: Bold 32/40 | h2: Bold 24/32 | h3: SemiBold 20/28
bodyLarge: Regular 16/24 | body: Regular 14/20 | bodySmall: Regular 12/16
button: SemiBold 16/24 | label: Medium 14/20 | caption: Regular 12/16

### Style: Clean & minimal (Uber/WhatsApp). White-dominant. Blue actions, green success.

---

## API ENDPOINTS

### Auth ✅ DONE

POST /api/auth/register, POST /api/auth/login, POST /api/auth/refresh
POST /api/auth/logout, GET /api/auth/me (protected), POST /api/auth/forgot-password

### Cars ❌ TO BUILD (all protected)

GET /api/cars, GET /api/cars/:id, POST /api/cars, PUT /api/cars/:id, DELETE /api/cars/:id

### Notifications ❌ TO BUILD (protected except send)

GET /api/notifications, GET /api/notifications/car/:carId
PATCH /api/notifications/:id/read, PATCH /api/notifications/read-all
GET /api/notifications/unread-count

### QR ❌ TO BUILD (public — no auth)

GET /api/qr/:qrCodeId, POST /api/qr/:qrCodeId/notify

---

## REMAINING BUILD STEPS (Vertical Slices)

### STEP 2 (continued): Auth Frontend

Build the frontend auth screens connected to the working backend:

1. Create src/theme/ (colors, typography, spacing with `as const`)
2. Create base components: Button (4 variants, Pressable, Record maps), Input (label, error, icons)
3. Create src/services/api.ts — fetch wrapper with JWT from expo-secure-store, 401 → refresh → retry
4. Create src/services/auth.ts — register(), login(), logout(), refreshToken(), getMe()
5. Create src/store/auth-store.ts — Zustand: user, token, isAuthenticated
6. Create app.config.ts with scheme: 'carping', typedRoutes: true
7. Create Expo Router layouts: root \_layout.tsx (fonts, providers, auth gate), (auth) group, (tabs) group
8. Build Login screen: email + password inputs, validation, calls real API, stores token, redirects
9. Build Register screen: name, email, password, phone, validation, calls real API
10. Build Forgot Password screen (calls real API)
    Verify: Register → Login → see tabs. Close app → reopen → still authenticated.

### STEP 3: Cars (Backend + Frontend)

Backend: Create features/cars/ (schema, service, controller, routes). Wire into app.ts.
Frontend: Cars list, Add car form, Car detail. All connected to real API.

### STEP 4: QR Code (Backend + Frontend)

Backend: Create features/qr/ (public endpoints, no auth).
Frontend: QR code display (react-native-qrcode-svg), public scan page.
Install: npx expo install react-native-qrcode-svg react-native-svg expo-sharing expo-file-system expo-media-library

### STEP 5: Notifications (Backend + Frontend)

Backend: Create features/notifications/ (CRUD + unread count).
Frontend: Notifications list with type badges, read/unread, pull-to-refresh.
Also build Home Dashboard with greeting, stat cards, recent notifications.
Install: npx expo install date-fns

### STEP 6: Profile (Backend + Frontend)

Backend: Add updateProfile, changePassword to auth service.
Frontend: Profile screen with settings list, logout.

### STEP 7: Polish

Error boundaries, loading skeletons, keyboard handling, haptics, app icon.

---

## CODING CONVENTIONS (STRICT)

- No React.FC — plain function declarations
- Pressable over TouchableOpacity
- No any — use unknown and narrow
- No inline styles — StyleSheet.create()
- Record<> maps for variant styles (no dynamic StyleSheet keys)
- as const on config objects
- Zod for ALL form validation
- Accessibility labels on all interactive elements
- Components under 150 lines
- Named exports (default exports only for Expo Router pages)
- ESM imports with .js extensions in backend

## PRISMA 7 NOTES (Important for Claude Code)

- Database URL is in prisma.config.ts, NOT in schema.prisma
- schema.prisma datasource block has provider only, no url
- PrismaClient requires adapter: new PrismaPg(pool)
- pg Pool needs ssl: { rejectUnauthorized: false } for Neon
- Run npx prisma db push after schema changes (not migrate dev for prototyping)
- Run npx prisma generate after schema changes

## COMMANDS

Backend: cd server && npm run dev (runs on port 3000)
Frontend: cd carping && npx expo start
Database: cd server && npx prisma studio (opens at localhost:5555)
