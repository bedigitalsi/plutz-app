# CLAUDE.md - Plutz Band Management App

## Working Guidelines

- First think through the problem, read the codebase for relevant files.
- Before you make any major changes, check in with me and I will verify the plan.
- Please every step of the way just give me a high level explanation of what changes you made.
- Make every task and code change you do as simple as possible. We want to avoid making any massive or complex changes. Every change should impact as little code as possible. Everything is about simplicity.
- Maintain a documentation file that describes how the architecture of the app works inside and out.
- Never speculate about code you have not opened. If the user references a specific file, you MUST read the file before answering. Make sure to investigate and read relevant files BEFORE answering questions about the codebase. Never make any claims about code before investigating unless you are certain of the correct answer - give grounded and hallucination-free answers.

## Project Overview

Plutz is a band management and financial tracking application built with Laravel 12 and React/Inertia.js. It helps bands organize gigs (inquiries), track income/expenses, manage contracts with electronic signatures, and handle financial distributions among band members.

## Tech Stack

**Backend:** Laravel 12, PHP 8.2+, Eloquent ORM, Spatie Permission
**Frontend:** React 18 + TypeScript, Inertia.js 2.0, Tailwind CSS 3.2, FullCalendar
**Database:** SQLite (dev), MySQL/PostgreSQL (prod)
**PDF Generation:** Puppeteer + html-pdf-node fallback
**Signatures:** react-signature-canvas

## Common Commands

```bash
# Development
composer dev              # Start all services (serve, queue, logs, vite)
npm run dev               # Vite dev server only
php artisan serve         # Laravel server only

# Building
npm run build             # Production build

# Database
php artisan migrate       # Run migrations
php artisan migrate:fresh --seed  # Reset and seed database

# Testing
composer test             # Run PHPUnit tests
php artisan test          # Alternative test command

# Queue
php artisan queue:work    # Process queue jobs
php artisan queue:listen  # Queue worker with auto-reload

# Utilities
php artisan route:list    # List all routes
php artisan cache:clear   # Clear cache
php artisan pail          # Real-time log viewer
```

## Project Structure

```
app/
├── Http/Controllers/     # 20 controllers (Auth, Inquiry, Income, Expense, Contract, etc.)
├── Models/               # 15 Eloquent models
├── Jobs/                 # Queue jobs (PDF generation, email sending)
└── Support/              # Helper classes (ContractPlaceholders, MailSettings)

resources/js/
├── Pages/                # 50 React pages organized by feature
├── Components/           # 21 reusable React components
└── Layouts/              # AuthenticatedLayout, GuestLayout

database/
├── migrations/           # 20 migrations
└── seeders/              # Initial data seeding

routes/
├── web.php               # Main routes with permission middleware
└── auth.php              # Auth scaffolding

tools/
└── render-contract-pdf.cjs  # Node.js PDF renderer
```

## Key Models & Relationships

- **User** - Band members with Spatie roles/permissions (`is_band_member` flag)
- **Inquiry** - Gig requests (hasOne Income, belongsTo PerformanceType, BandSize)
- **Income** - Revenue linked to inquiries (hasMany IncomeDistribution)
- **IncomeDistribution** - Splits income to users or mutual fund
- **Expense** - Spending records with file attachments
- **GroupCost** - Shared band expenses (deducted from mutual fund)
- **Contract** - Digital agreements with ContractSignToken for signing
- **ContractTemplate** - Reusable markdown templates with placeholders
- **Attachment** - Polymorphic file storage for Inquiries, Expenses, Contracts

## Permission System

Uses Spatie Laravel Permission. Key permissions:
- `inquiries.*` - view, create, edit, change_status
- `income.*` - view, create, distribute
- `expenses.*` - view, create
- `group_costs.*` - view, create, edit
- `contracts.*` - manage, send
- `settings.manage`, `users.manage`, `calendar.integrations.manage`

Routes are protected with `permission:` middleware in `routes/web.php`.

## Contract Signing Flow

1. Create contract from template with placeholder substitution
2. `SendContractInvitation` job sends token-based signing link
3. Public `/sign/{token}` endpoint for signature capture
4. `GenerateSignedContractPdf` job creates PDF with embedded signature
5. `SendSignedContractEmails` job delivers signed PDF to parties

Contract placeholders: `[NAROČNIK]`, `[DATUM_NASTOPA]`, `[LOKACIJA]`, etc.

## Queue Jobs

All async processing uses database queue driver:
- `GenerateSignedContractPdf` - PDF generation via Puppeteer
- `SendContractInvitation` - Sends signing link emails
- `SendSignedContractEmails` - Delivers signed contracts

Run with: `php artisan queue:work` or included in `composer dev`

## Testing

PHPUnit with in-memory SQLite. Tests in `tests/Feature/` cover auth flows, CRUD operations.

```bash
composer test
```

## Environment Setup

Copy `.env.example` to `.env`. Key settings:
- `DB_CONNECTION=sqlite` (default) or `mysql`/`pgsql`
- `QUEUE_CONNECTION=database`
- `MAIL_MAILER=log` (dev) or configure SMTP

## Default Credentials

```
Email: admin@plutz.app
Password: password
```

## Code Conventions

- Controllers use form requests for validation (`app/Http/Requests/`)
- Inertia pages receive props from controllers, use TypeScript interfaces
- File uploads stored in `storage/app/attachments/` and `storage/app/contracts/`
- Soft deletes enabled on major models
- Money amounts stored as integers (cents) in database

## Deployment

See `COMPLETE-DEPLOYMENT-GUIDE.md` and `CPANEL-DEPLOYMENT-GUIDE.md` for production setup.
