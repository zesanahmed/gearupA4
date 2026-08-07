# GearUp 🏋️ — Rent Sports & Outdoor Gear Instantly

Backend API for a sports and outdoor equipment rental platform. Customers browse and rent gear, providers manage inventory and fulfill orders, and admins oversee the platform.

Built for Programming Hero's **Next Level AI-Driven Software Engineering Bootcamp — Level 2, Assignment 4**.

---

## 🚀 Live Deployment

- **API Base URL:** `https://gear-up-a4-gamma.vercel.app/`
- **GitHub Repo:** https://github.com/zesanahmed/gearupA4

---

## 🔑 Admin Credentials

| Field    | Value              |
| -------- | ------------------ |
| Email    | `admin@gearup.com` |
| Password | `Admin@123456`     |

> Created via the seed script (`npm run db:seed`). Can be overridden with `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env` before seeding.

---

## 🛠️ Tech Stack

| Layer      | Technology                                          |
| ---------- | --------------------------------------------------- |
| Runtime    | Node.js, Express.js, TypeScript                     |
| Database   | PostgreSQL (hosted on Neon)                         |
| ORM        | Prisma 7 (with `@prisma/adapter-pg` driver adapter) |
| Auth       | JWT (`jsonwebtoken`) + `bcryptjs`                   |
| Validation | Zod v4                                              |
| Payments   | Stripe (Checkout Sessions + Webhooks)               |
| API Docs   | Postman Collection                                  |
| Deployment | Vercel                                              |

---

## ✨ Features

**Public**

- Browse all gear with search, filter (category, brand, price), and pagination
- View gear details with specs and reviews
- View gear categories

**Customer**

- Register / login
- Create multi-item rental orders (with date validation and live stock checks)
- Pay via Stripe Checkout
- View rental & payment history
- Cancel a placed order (stock is automatically restored)
- Leave a review — only for gear actually rented and returned

**Provider**

- Register / login
- Full CRUD on own gear listings (ownership enforced — providers cannot modify each other's listings)
- View incoming orders for their gear
- Move orders through the status flow: `CONFIRMED → PICKED_UP → RETURNED`

**Admin**

- View and manage all users (suspend / activate)
- View all gear listings and rental orders across the platform
- Manage gear categories

---

## 📐 Architecture

Feature-based modular structure — each domain owns its full stack (validation → controller → service → route):

```
src/
├── config/            # Zod-validated environment config (fails fast on missing/invalid env vars)
├── generated/prisma/   # Prisma client output (gitignored, regenerated on build)
├── lib/                # Prisma client instance, Stripe client instance
├── middlewares/        # authenticate, authorize, validate, globalErrorHandler
├── modules/
│   ├── auth/
│   ├── category/
│   ├── gear/
│   ├── rentalOrder/
│   ├── payment/
│   ├── review/
│   └── admin/
├── types/              # Express Request type augmentation (req.user, req.validated)
├── utils/              # ApiError, ApiResponse, catchAsync
├── app.ts
└── server.ts

prisma/
├── schema/              # Split schema files (one per model + enums)
├── migrations/
└── seed.ts
```

Each module follows the same layering:

- **`*.validation.ts`** — Zod schemas for `body` / `query` / `params`
- **`*.controller.ts`** — HTTP layer only (calls service, shapes response)
- **`*.service.ts`** — business logic, ownership checks, Prisma queries
- **`*.route.ts`** — wires middleware + controller to Express routes
- **`*.constants.ts` / `*.mapper.ts`** — shared lookup tables and Prisma input builders (kept DRY across create/update)

---

## ⚙️ Local Setup

### 1. Clone & install

```bash
git clone https://github.com/zesanahmed/gearupA4.git
cd gearupA4
npm install
```

### 2. Environment variables

Create a `.env` file in the project root:

```env
NODE_ENV=development
PORT=5000

DATABASE_URL=postgresql://<user>:<password>@<host>/<db>?sslmode=require

JWT_ACCESS_SECRET=<a long random string>
JWT_ACCESS_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10

ADMIN_EMAIL=admin@gearup.com
ADMIN_PASSWORD=Admin@123456

STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CURRENCY=usd
CLIENT_SUCCESS_URL=http://localhost:3000/payment/success
CLIENT_CANCEL_URL=http://localhost:3000/payment/cancel
```

Generate a JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Database

```bash
npx prisma generate
npx prisma migrate dev
npm run db:seed
```

### 4. Run

```bash
npm run dev
```

Server starts at `http://localhost:5000`.

### 5. (Optional) Test Stripe webhooks locally

```bash
stripe login
stripe listen --forward-to localhost:5000/api/payments/confirm
```

Copy the `whsec_...` value it prints into `STRIPE_WEBHOOK_SECRET` in `.env`.

---

## 📬 API Documentation

A full Postman collection is included at `postman/gearup.postman_collection.json`, with a matching environment file at `postman/gearup.postman_environment.json`.

**Import steps:**

1. Postman → Import → select both JSON files
2. Select the **"GearUp Local"** environment (top-right dropdown)
3. Run requests top-to-bottom inside the **"1. Auth"** folder first — tokens and IDs are captured automatically into environment variables and reused by later requests
4. Continue through the remaining folders in order (Categories → Gear → Rental Orders → Payments → Reviews → Admin)

The collection covers all endpoints plus common error cases (validation errors, role restrictions, ownership violations, invalid status transitions).

---

## 🔒 Error Response Format

All errors return a consistent shape:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "errorDetails": {}
}
```

All success responses:

```json
{
  "success": true,
  "message": "Human-readable success message",
  "data": {}
}
```

---

## 🧠 Key Design Decisions

- **Single-provider orders.** A rental order's items must all belong to the same provider. This keeps the confirm/pickup/return status flow unambiguous (one provider acting on one order). Splitting a cart across providers into separate orders is a natural extension for a future version.
- **Server-computed pricing.** `totalAmount` is always calculated server-side from the gear's current `pricePerDay`, requested quantity, and rental duration — never trusted from the client — to prevent price tampering.
- **Stock reservation.** Stock is decremented when an order is placed and restored if the order is cancelled, both inside a Prisma transaction, to prevent overselling under concurrent requests.
- **Status transitions are whitelisted.** A lookup table defines exactly which status can move to which next status (e.g. a provider cannot jump an order straight from `PLACED` to `PICKED_UP`), enforced server-side regardless of what the client requests.
- **Payment currency.** Stripe Checkout is configured with USD (`STRIPE_CURRENCY`) since Stripe does not natively support BDT payouts. A production deployment targeting Bangladesh would likely pair this with SSLCommerz for local currency support.
- **Admin cannot self-suspend.** A safety guard prevents an admin from accidentally revoking their own access.
- **Review eligibility.** A review can only be created for a gear item the customer has actually rented **and** whose order reached `RETURNED` status — preventing fabricated reviews.
- **Registration cannot create admins.** The public `/api/auth/register` endpoint only accepts `CUSTOMER` or `PROVIDER`. The admin account is provisioned exclusively through the seed script.

---

## 📦 Available Scripts

| Script                | Description                                    |
| --------------------- | ---------------------------------------------- |
| `npm run dev`         | Start dev server with hot reload               |
| `npm run build`       | Generate Prisma client + bundle for production |
| `npm run db:generate` | Regenerate Prisma client                       |
| `npm run db:migrate`  | Run Prisma migrations (dev)                    |
| `npm run db:seed`     | Seed the admin user                            |
| `npm run deploy`      | Deploy to Vercel                               |

---

## 👤 Author

**Zesan Ahmed**
Programming Hero — Level 2, Next Level AI-Driven Software Engineering Bootcamp
