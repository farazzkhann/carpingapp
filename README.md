# Carping

A subscription-based car QR notification platform. Register your car, get a unique QR sticker for your windshield. When someone scans it (parking issue, blocked access, emergency), you get an instant notification — without sharing your phone number.

---

## Tech Stack

- **Backend:** Node.js, Express 5, TypeScript, Prisma 7, PostgreSQL (Neon)
- **Frontend:** React Native, Expo SDK 55, Expo Router, TanStack Query, Zustand
- **Email:** Resend
- **Auth:** JWT (access + refresh tokens)

---

## Prerequisites

- Node.js 18+
- npm
- [Expo Go](https://expo.dev/go) app on your phone (for mobile testing)
- A [Neon](https://neon.tech) PostgreSQL database
- A [Resend](https://resend.com) account (for password reset emails)

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/farazzkhann/carpingapp.git
cd carpingapp
```

### 2. Set up the backend

```bash
cd server
npm install
```

Create a `.env` file in `server/` (copy from `.env.example`):

```bash
cp .env.example .env
```

Fill in your values:

```env
DATABASE_URL="your-neon-postgresql-connection-string"
JWT_ACCESS_SECRET="any-random-string-min-32-chars"
JWT_REFRESH_SECRET="another-random-string-min-32-chars"
PORT=3000
NODE_ENV="development"
RESEND_API_KEY="your-resend-api-key"
FROM_EMAIL="onboarding@resend.dev"
APP_URL="http://localhost:8081"
```

Push the database schema:

```bash
npx prisma generate
npx prisma db push
```

Start the backend:

```bash
npm run dev
```

Backend runs at `http://localhost:3000`.

---

### 3. Set up the frontend

```bash
cd ../carping
npm install
```

Create a `.env` file in `carping/`:

```bash
cp .env.example .env
```

```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_APP_URL=http://localhost:8081
```

> **Note:** If testing on a physical device, replace `localhost` with your machine's local IP address (e.g. `192.168.1.5`).

Start the frontend:

```bash
npx expo start
```

Scan the QR code with Expo Go (Android) or the Camera app (iOS).

---

## Project Structure

```
carpingapp/
├── server/          # Express API backend
│   ├── prisma/      # Database schema
│   └── src/
│       ├── features/   # Auth, Cars, Notifications, QR
│       ├── middleware/
│       └── utils/
└── carping/         # Expo React Native frontend
    ├── app/         # Expo Router screens
    └── src/
        ├── components/
        ├── services/
        ├── store/
        └── theme/
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Login |
| POST | `/api/auth/refresh` | No | Refresh access token |
| POST | `/api/auth/logout` | Yes | Logout |
| GET | `/api/auth/me` | Yes | Get current user |
| POST | `/api/auth/forgot-password` | No | Send reset email |
| POST | `/api/auth/reset-password` | No | Reset password with token |
| PATCH | `/api/auth/profile` | Yes | Update profile |
| POST | `/api/auth/change-password` | Yes | Change password |
| GET | `/api/cars` | Yes | List user's cars |
| POST | `/api/cars` | Yes | Add a car |
| GET | `/api/cars/:id` | Yes | Get car details |
| PUT | `/api/cars/:id` | Yes | Update car |
| DELETE | `/api/cars/:id` | Yes | Delete car |
| GET | `/api/qr/:qrCodeId` | No | Get car info by QR code |
| POST | `/api/qr/:qrCodeId/notify` | No | Send notification via QR scan |
| GET | `/api/notifications` | Yes | List notifications |
| GET | `/api/notifications/unread-count` | Yes | Get unread count |
| PATCH | `/api/notifications/:id/read` | Yes | Mark as read |
| PATCH | `/api/notifications/read-all` | Yes | Mark all as read |

---

## License

MIT
