# Plutz App Implementation Guide

## Project Status

### ✅ Completed (Ready to Use)
- **Scaffolding:** Laravel 12 + Breeze + Inertia/React + Tailwind installed and configured
- **Database:** All migrations created and executed (15 tables with relationships, indexes, UUIDs)
- **Authentication:** User authentication with Laravel Breeze
- **Permissions:** Spatie permission system configured with roles (Admin, BandMember, Viewer) and 19 permissions
- **PWA:** Manifest, icons, Apple meta tags configured for iPhone installation
- **Initial Data:** Settings, performance types, band sizes, cost types, admin user seeded
- **Models:** All Eloquent models created (need relationships added)

### 📋 To Implement (Follow Guides)
1. **Inquiries + Calendar + ICS** - See `01-INQUIRIES-CALENDAR-ICS.md`
2. **Money Modules** - See `02-MONEY-MODULES.md`
3. **Contracts** - See `03-CONTRACTS-MODULE.md`

---

## Quick Start

### 1. Login Credentials

```
Email: admin@plutz.app
Password: password
```

### 2. Start Development Servers

```bash
# Terminal 1: Vite dev server
npm run dev

# Terminal 2: Laravel server
php artisan serve

# Terminal 3: Queue worker (needed for contracts)
php artisan queue:work
```

### 3. Access Application

- App: http://localhost:8000
- PWA Install Guide: http://localhost:8000/help/install

---

## Implementation Order

Follow the guides in this order:

### Phase 1: Inquiries Module (Essential)
**File:** `docs/implementation/01-INQUIRIES-CALENDAR-ICS.md`

**What it does:**
- Manage gig inquiries (pending/confirmed/rejected)
- Calendar view with FullCalendar
- ICS feed for Apple Calendar sync

**Estimated time:** 4-6 hours

**Key files to create:**
- Controllers: `InquiryController`, `CalendarController`, `IcalFeedController`
- Pages: `Inquiries/Index.tsx`, `Inquiries/Create.tsx`, `Inquiries/Show.tsx`, `Calendar/Index.tsx`
- Routes: Added to `routes/web.php`

**Dependencies:**
```bash
npm install @fullcalendar/react @fullcalendar/core @fullcalendar/daygrid @fullcalendar/interaction
```

---

### Phase 2: Money Modules (Finance Tracking)
**File:** `docs/implementation/02-MONEY-MODULES.md`

**What it does:**
- Track expenses (invoices paid) with photo/PDF upload
- Track income from gigs
- Distribute income to band members + mutual fund
- Group costs management
- Financial dashboards

**Estimated time:** 6-8 hours

**Key files to create:**
- Controllers: `ExpenseController`, `IncomeController`, `GroupCostController`, `DashboardController`
- Pages: Multiple pages for each module
- Routes: Added to `routes/web.php`

---

### Phase 3: Contract Management (Digital Signing)
**File:** `docs/implementation/03-CONTRACTS-MODULE.md`

**What it does:**
- Create contracts from templates
- Send signing links via email
- Client signing portal with signature capture
- PDF generation with signatures
- Email confirmations

**Estimated time:** 6-8 hours

**Key files to create:**
- Controllers: `ContractController`, `ContractSigningController`
- Jobs: `GenerateSignedContractPdf`, `SendContractInvitation`, `SendSignedContractEmails`
- Node script: `tools/render-contract-pdf.js`
- Pages: Contract management and signing pages

**Dependencies:**
```bash
npm install puppeteer html-pdf-node react-signature-canvas
```

---

## Database Schema Overview

### Users & Permissions
- `users` - Added `is_band_member` flag
- `roles`, `permissions`, `model_has_roles`, `model_has_permissions` - Spatie package

### Settings & Types
- `settings` - Key-value configuration (timezone, SMTP, etc.)
- `performance_types` - Wedding, Concert, etc.
- `band_sizes` - Solo, 2 people, etc.
- `cost_types` - Fuel, Equipment, etc.

### Core Business
- `inquiries` - Gig requests with status tracking
- `incomes` - Money received from gigs
- `income_distributions` - Split income to members + mutual fund
- `expenses` - Invoices you paid
- `group_costs` - Costs from mutual fund
- `attachments` - Polymorphic file storage

### Calendar Integration
- `ical_feeds` - ICS feed tokens for Apple Calendar

### Contracts
- `contract_templates` - Reusable contract templates
- `contracts` - Contract instances with client details
- `contract_sign_tokens` - One-time signing links

---

## Architecture Notes

### Timezone Handling
- **Storage:** All datetimes in UTC
- **Display:** Europe/Ljubljana (configurable via settings)
- **Inquiries:** Date is local date, time is local time
- **ICS:** Emits timezone-aware DTSTART/DTEND

### File Uploads
- **Disk:** Local in dev (configurable for S3 in production)
- **Attachments:** Polymorphic relationship, works for expenses, contracts, inquiries
- **Mobile:** Camera capture with `<input type="file" accept="image/*" capture="environment">`

### Permissions
- **Middleware:** `permission:permission.name` on routes
- **Policies:** Can be added for fine-grained control
- **Roles:** Admin (all), BandMember (limited), Viewer (read-only)

### Queue System
- **Required for:** PDF generation, email sending
- **Configuration:** Database driver (already set up)
- **Start worker:** `php artisan queue:work`
- **Production:** Use Supervisor

### PDF Generation
- **Method:** Node.js script called from Laravel Job
- **Primary:** Puppeteer (best quality)
- **Fallback:** html-pdf-node
- **Storage:** PDFs stored as attachments

---

## Mobile-First Considerations

### Already Implemented
- PWA manifest and meta tags
- Responsive viewport
- Apple PWA support

### To Add in Each Module
- Bottom sheets/drawers for mobile actions
- Card-based layouts for small screens
- Large tap targets (min 44x44px)
- Sticky action buttons
- Date/time pickers optimized for mobile
- Camera capture for file uploads

---

## Development Tips

### Testing Workflow
1. Create test data in each module
2. Test on actual iPhone (PWA install)
3. Test file uploads from mobile
4. Test calendar sync with Apple Calendar
5. Test contract signing on mobile

### Code Organization
- **Controllers:** Keep thin, use services for complex logic
- **Jobs:** All async tasks (PDF, email) should be queued
- **Components:** Create reusable React components
- **Validation:** Use Form Request classes for complex validation

### Common Patterns

**Date filtering in controllers:**
```php
if ($request->has('date_from')) {
    $query->where('date_field', '>=', $request->date_from);
}
```

**Permissions in routes:**
```php
Route::middleware(['auth', 'permission:resource.view'])->group(function () {
    // Routes
});
```

**Inertia response:**
```php
return Inertia::render('Page/Name', [
    'data' => $data,
]);
```

**File upload handling:**
```php
if ($request->hasFile('attachment')) {
    $path = $request->file('attachment')->store('folder', 'disk');
}
```

---

## Troubleshooting

### "Class not found" errors
```bash
composer dump-autoload
```

### React page not loading
```bash
npm run build
# Or for dev:
npm run dev
```

### Queue jobs not processing
```bash
php artisan queue:work
# Check logs:
tail -f storage/logs/laravel.log
```

### Database errors
```bash
php artisan migrate:fresh --seed
```

### Permission errors
```bash
php artisan cache:clear
php artisan config:clear
```

---

## Next Steps After Implementation

### Enhancements
1. Add filters UI to all list pages
2. Implement bulk actions
3. Add export functionality (CSV/PDF)
4. Implement activity log (spatie/laravel-activitylog)
5. Add charts to dashboards
6. Implement advanced search
7. Add email templates
8. Implement notifications

### Production Checklist
1. Configure production .env (APP_ENV=production, APP_DEBUG=false)
2. Set up proper SMTP for emails
3. Configure S3 or similar for file storage
4. Set up queue with Redis + Supervisor
5. Configure proper database (MySQL/PostgreSQL)
6. Set up SSL certificate
7. Configure backup system
8. Set up monitoring (Laravel Telescope, Sentry)
9. Performance optimization (caching, CDN)
10. Security audit

---

## Support & Resources

### Laravel Documentation
- https://laravel.com/docs/12.x
- https://inertiajs.com/
- https://spatie.be/docs/laravel-permission

### React/UI Libraries
- https://react.dev/
- https://tailwindcss.com/
- https://fullcalendar.io/docs

### Need Help?
1. Check implementation guides in `docs/implementation/`
2. Review Laravel logs: `storage/logs/laravel.log`
3. Check browser console for React errors
4. Verify database structure: `php artisan db:show`
5. Test routes: `php artisan route:list`

---

## File Structure Reference

```
plutz-app/
├── app/
│   ├── Http/Controllers/     # API controllers
│   ├── Jobs/                 # Queue jobs
│   ├── Models/               # Eloquent models
│   └── Policies/             # Authorization policies
├── database/
│   ├── migrations/           # Database migrations (complete)
│   └── seeders/              # Data seeders
├── docs/
│   └── implementation/       # Implementation guides (YOU ARE HERE)
├── public/
│   ├── icons/                # PWA icons (add real images)
│   └── manifest.webmanifest  # PWA manifest
├── resources/
│   ├── js/
│   │   ├── Components/       # Reusable React components
│   │   ├── Layouts/          # Layout components
│   │   └── Pages/            # Inertia pages (create per guide)
│   └── views/
│       └── app.blade.php     # Main layout (PWA meta tags added)
├── routes/
│   └── web.php               # Routes (add per guide)
├── storage/
│   └── app/                  # File storage
└── tools/
    └── render-contract-pdf.js  # Node PDF script (create per guide)
```

---

## Congratulations!

You now have a solid foundation for the Plutz app. Follow the implementation guides in order, and you'll have a fully functional band management system with:

✅ Inquiry management
✅ Calendar integration
✅ Financial tracking
✅ Digital contracts
✅ PWA support
✅ Mobile-first design
✅ Role-based permissions

Good luck with your implementation! 🎸🎵

