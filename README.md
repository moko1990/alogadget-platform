````markdown
# 📱 Alogadget Platform

An enterprise-level **Multi-Vendor E-commerce Platform** built with modern web technologies, focusing on **scalability**, **performance**, and **security**.

**NestJS · TypeScript · PostgreSQL · Docker · MIT License**

---

## 📖 About The Project

**Alogadget** is designed to handle complex e-commerce scenarios similar to **Digikala** or **Amazon**.  
It features a robust backend architecture using **NestJS** within a **TurboRepo monorepo** structure, ensuring modularity, scalability, and ease of maintenance.

---

## 🌟 Key Features

### 🔐 Security & Authentication
- JWT-based authentication (Access & Refresh Tokens)
- Argon2 password hashing
- HttpOnly cookies for enhanced security

### 🛡️ Authorization
- Role-Based Access Control (RBAC)
- Granular permissions for **Admins**, **Vendors**, and **Customers**

### 📦 Advanced Product Catalog
- Recursive nested categories
- Product variants (Color / Size combinations)
- Dynamic product attributes using **JSONB**

### 🏪 Multi-Vendor System
- Vendor onboarding
- Approval workflows
- Independent product management per vendor

### 🛒 Order Management
- Atomic transactions
- Concurrency-safe inventory locking

### 🚀 Performance
- Redis caching for heavy endpoints (Categories, Products)

### 📂 File Management
- Local file uploads using Multer
- Ready for S3-compatible storage integration

---

## 🛠️ Tech Stack

| Domain | Technologies |
|------|-------------|
| Backend | NestJS, Express, Passport.js |
| Database | PostgreSQL 16, Prisma ORM |
| Caching & Queues | Redis |
| DevOps | Docker, Docker Compose |
| Monorepo | TurboRepo, pnpm |
| Testing | Jest (Unit & Integration) |

---

## 📂 Project Structure

```text
alogadget-platform/
├── apps/
│   ├── backend/        # NestJS API Server (Core Logic)
│   ├── store-web/      # Next.js Storefront (Coming Soon)
│   └── admin-panel/    # React Admin Dashboard (Coming Soon)
├── packages/
│   ├── types/          # Shared TypeScript Interfaces
│   └── ui/             # Shared UI Components (Shadcn)
├── docker-compose.yml  # Infrastructure Setup
└── pnpm-workspace.yaml # Workspace Configuration
````

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### ✅ Prerequisites

* Node.js **v20+**
* pnpm (`npm i -g pnpm`)
* Docker & Docker Compose

### 📦 Installation

#### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/alogadget.git
cd alogadget
```

#### 2. Install dependencies

```bash
pnpm install
```

#### 3. Environment Configuration

Create a `.env` file in `apps/backend/`:

```env
# Database
DATABASE_URL="postgresql://postgres:root@localhost:5432/alogadget?schema=public"

# App Config
PORT=4000
NODE_ENV=development

# Security (Change these in production!)
JWT_SECRET="super-secret-key"
JWT_EXPIRATION="15m"
JWT_REFRESH_SECRET="super-secret-refresh-key"
JWT_REFRESH_EXPIRATION="7d"
```

#### 4. Start Infrastructure (Postgres & Redis)

```bash
docker-compose up -d
```

#### 5. Run Database Migrations

```bash
pnpm --filter backend exec prisma migrate dev
```

#### 6. Create Uploads Directory

```bash
mkdir -p apps/backend/uploads
```

#### 7. Start Development Server

```bash
pnpm --filter backend run start:dev
```

📡 **API will be available at:**
`http://localhost:4000`

---

## 🧪 Running Tests

```bash
pnpm --filter backend test
```

---

## 🗺️ Roadmap

* **Phase 1:** Core Architecture, Auth Module, RBAC
* **Phase 2:** Product Catalog, Categories, Vendor Module, File Upload
* **Phase 3:** Order Management, Inventory Locking
* **Phase 4:** Payment Gateways (ZarinPal), Wallet System
* **Phase 5:** Frontend (Next.js Storefront)
* **Phase 6:** Admin Dashboard & Analytics

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome.
Feel free to fork the repository and submit a pull request.

---

## 📄 License

This project is licensed under the **MIT License**.

```
```
