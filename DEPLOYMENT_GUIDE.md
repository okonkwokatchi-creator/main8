# Kavid Plans - Deployment Guide

## Project Overview
**Kavid Plans** is a full-stack business management application with:
- Sales & Expense Management
- Customer Management
- Daily Financial Summary (Auto-calculated)
- Reports & Analytics Dashboard
- User Authentication (Replit Auth)

---

## Deployment on Render.com

### Prerequisites
- GitHub account with repository pushed
- PostgreSQL database (Render provides this)
- Node.js 22+ environment

### Step 1: Create PostgreSQL Database on Render
1. Go to Render Dashboard
2. Click "New" → "PostgreSQL"
3. Name: `kavid-plans-db`
4. Region: Select your region
5. Create database
6. Copy the connection string (you'll need this)

### Step 2: Create Web Service on Render
1. Go to Render Dashboard
2. Click "New" → "Web Service"
3. Connect your GitHub repository: `https://github.com/okonkwokatchi-creator/main8`
4. Configure:
   - **Name**: `kavid-plans`
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free or Starter

### Step 3: Set Environment Variables
In Render dashboard, add these environment variables:

```
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]
NODE_ENV=production
PORT=10000
```

Get `DATABASE_URL` from:
1. Your PostgreSQL instance on Render
2. Click "Connect" → Copy the External Database URL

### Step 4: Deploy
1. Click "Deploy"
2. Wait for build to complete (2-3 minutes)
3. Check logs for any errors
4. Your app will be live at: `https://kavid-plans.onrender.com`

---

## Database Schema Overview

### Tables
1. **users** (from Replit Auth)
   - id, email, firstName, lastName, profileImageUrl

2. **customers**
   - id, name, email, phone, userId, createdAt

3. **sales**
   - id, date, customerId, customerName, product, quantity, price, total, userId, createdAt

4. **expenses**
   - id, date, category, description, amount, userId, createdAt

5. **daily_summaries** (Auto-calculated)
   - id, date, totalSales, totalExpenses, balance, userId, updatedAt

---

## API Endpoints

### Customers
- `GET /api/customers` - List all customers
- `GET /api/customers/:id` - Get customer
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Sales
- `GET /api/sales` - List all sales
- `POST /api/sales` - Create sale (auto-updates daily summary)
- `PUT /api/sales/:id` - Update sale
- `DELETE /api/sales/:id` - Delete sale

### Expenses
- `GET /api/expenses` - List all expenses
- `POST /api/expenses` - Create expense (auto-updates daily summary)
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Daily Summaries
- `GET /api/daily-summaries` - Get all daily summaries
  - Auto-syncs if empty (calculates from sales/expenses)

### Dashboard
- `GET /api/stats/dashboard` - Get dashboard statistics

---

## Features Implemented

### ✅ Core Features
- User Authentication with Replit Auth
- Sales Management (create, edit, delete)
- Expense Management (create, edit, delete)
- Customer Management (CRUD)
- Dark modern theme with Tailwind CSS

### ✅ Daily Financial Summary
- Automatic date-based grouping
- Real-time calculations:
  - Total Daily Sales (sum of all sales for that date)
  - Total Daily Expenses (sum of all expenses for that date)
  - Daily Profit (Sales - Expenses)
- Auto-updates on every transaction
- Persistent storage in database
- Beautiful UI with:
  - Date formatting
  - Color-coded metrics (green for profit, red for loss)
  - Trending indicators (up/down/neutral)
  - Responsive table layout

### ✅ Dashboard Analytics
- Today's Sales, Expenses, Profit
- Monthly metrics
- Yearly metrics
- Recent sales display
- Sales trend chart

### ✅ Reports Page
- Comprehensive financial reporting
- Monthly breakdown
- Export capabilities (coming soon)

---

## Build & Development Commands

### Local Development
```bash
# Install dependencies
npm install

# Development server (with hot reload)
npm run dev

# Check TypeScript errors
npm run check

# Push changes to database
npm run db:push
```

### Production Build
```bash
# Build for production
npm run build

# Start production server
npm start
```

---

## Frontend Stack
- **React 18** - UI Framework
- **TypeScript** - Type safety
- **Tailwind CSS + shadcn/ui** - Styling
- **TanStack Query (React Query)** - Data fetching
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Wouter** - Client-side routing
- **Recharts** - Charts & graphs

---

## Backend Stack
- **Express.js** - Web framework
- **Node.js** - Runtime
- **PostgreSQL** - Database
- **Drizzle ORM** - Type-safe database queries
- **Passport.js** - Authentication
- **Zod** - Data validation

---

## Key Files & Structure

### Frontend
```
client/src/
├── pages/
│   ├── Dashboard.tsx       # Main dashboard
│   ├── Sales.tsx          # Sales management
│   ├── Expenses.tsx       # Expense management
│   ├── Customers.tsx      # Customer management
│   ├── DailySummary.tsx   # Daily financial summary
│   ├── Reports.tsx        # Financial reports
│   └── Landing.tsx        # Public landing page
├── hooks/
│   ├── use-daily-summaries.ts  # Daily summary data
│   ├── use-sales.ts
│   ├── use-expenses.ts
│   ├── use-customers.ts
│   └── use-auth.ts
├── components/
│   ├── Layout.tsx         # Main layout wrapper
│   ├── Sidebar.tsx        # Navigation sidebar
│   └── ui/                # Reusable components
└── lib/
    ├── queryClient.ts     # React Query setup
    └── utils.ts
```

### Backend
```
server/
├── index.ts              # Express app setup
├── routes.ts             # API routes (320 lines)
├── storage.ts            # Database operations
├── db.ts                 # Database connection
├── static.ts             # Static file serving
├── vite.ts               # Vite dev server
└── replit_integrations/
    └── auth/             # Authentication setup
```

### Shared
```
shared/
├── schema.ts             # Database schema + types
├── routes.ts             # API contract definitions
└── models/
    └── auth.ts           # Auth models
```

---

## Important Configuration

### Build Process
The build uses `esbuild` for production bundling:
- Client compiled with Vite
- Server bundled to single `.cjs` file
- Dependencies externalized for faster cold starts
- Output: `dist/index.cjs` and `dist/public/`

### Environment-Specific Behavior
- **Development**: Vite dev server, hot module replacement
- **Production**: Static files served, minified bundle

### Database Migrations
To add new tables or modify schema:
1. Update `shared/schema.ts`
2. Run: `npm run db:push`
3. Drizzle automatically handles migrations

---

## Troubleshooting

### Build Fails: "Cannot find module"
- Run `npm install` to restore node_modules
- Ensure `npm run check` passes locally first

### Database Connection Error
- Verify `DATABASE_URL` is set in environment variables
- Check PostgreSQL is running
- Ensure database URL format is correct

### Authentication Issues
- Verify Replit Auth configuration
- Check req.user.claims.sub is available in routes

### Daily Summaries Not Updating
- Manually sync by calling `GET /api/daily-summaries` first
- Check database for entries in daily_summaries table

---

## Deployment Checklist

Before deploying to production:
- [ ] Run `npm run check` - no TypeScript errors
- [ ] Run `npm run build` - build succeeds
- [ ] Test locally: `npm start`
- [ ] Commit all changes: `git push`
- [ ] Trigger Render deploy
- [ ] Verify DATABASE_URL environment variable is set
- [ ] Check logs for errors
- [ ] Test application features in production

---

## Support & Additional Features

### Ready for Implementation
1. **Invoice Management** - Create invoices from sales
2. **PDF Export** - Export reports to PDF
3. **Email Notifications** - Daily summary emails
4. **Multi-user Teams** - Team management
5. **Budget Tracking** - Set and monitor budgets

### Performance Notes
- Client bundle: 276 KB (gzipped)
- Server bundle: 1.1 MB
- Database queries optimized with indexes
- React Query caching for reduced API calls

---

## Quick Links
- **Repository**: https://github.com/okonkwokatchi-creator/main8
- **Render Dashboard**: https://dashboard.render.com
- **Database**: PostgreSQL on Render

---

**Last Updated**: February 24, 2026
**Version**: 1.0.0
