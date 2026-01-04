# Plutz App - Quick Reference Card

## 🚀 Start Development

```bash
cd /Users/sandibenec/Desktop/demo-app/plutz-app

# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend  
php artisan serve

# Terminal 3: Queue (for contracts/emails)
php artisan queue:work
```

## 🔑 Login

```
URL: http://localhost:8000
Email: admin@plutz.app
Password: password
```

## 📚 Implementation Guides

Location: `docs/implementation/`

1. **README.md** - Start here
2. **01-INQUIRIES-CALENDAR-ICS.md** - Gigs & calendar (4-6h)
3. **02-MONEY-MODULES.md** - Money tracking (6-8h)
4. **03-CONTRACTS-MODULE.md** - Digital signing (6-8h)

## 🗄️ Database

```bash
# View tables
php artisan db:show

# Reset and reseed
php artisan migrate:fresh --seed

# Check migrations
php artisan migrate:status
```

## 🎨 Icons (TODO)

Replace placeholders in `public/icons/`:
- icon-192.png (192x192px)
- icon-512.png (512x512px)
- icon-192-maskable.png (192x192px)
- icon-512-maskable.png (512x512px)
- apple-touch-icon.png (180x180px)

## 🔧 Common Commands

```bash
# Clear cache
php artisan cache:clear
php artisan config:clear

# Rebuild assets
npm run build

# Check routes
php artisan route:list

# View logs
tail -f storage/logs/laravel.log
```

## 📦 NPM Packages to Install

```bash
# For Inquiries module
npm install @fullcalendar/react @fullcalendar/core @fullcalendar/daygrid @fullcalendar/interaction

# For Contracts module
npm install puppeteer html-pdf-node react-signature-canvas
```

## 🗂️ Key Files

- **Routes:** `routes/web.php`
- **Controllers:** `app/Http/Controllers/`
- **Models:** `app/Models/`
- **React Pages:** `resources/js/Pages/`
- **Layout:** `resources/views/app.blade.php`
- **Config:** `.env`

## 📊 Seeded Data

**Roles:** Admin, BandMember, Viewer

**Performance Types:** Wedding, Concert, Birthday Party, Corporate Event, Private Event

**Band Sizes:** Solo, 2-5 people

**Cost Types:** Fuel, Equipment, Marketing, Rehearsal Room, Maintenance

**Settings:**
- app_timezone: Europe/Ljubljana
- default_duration_minutes: 120

## 🎯 Implementation Order

1. ✅ Scaffold (DONE)
2. ✅ Auth & Permissions (DONE)
3. ✅ PWA Shell (DONE)
4. 📋 Inquiries + Calendar → `01-INQUIRIES-CALENDAR-ICS.md`
5. 📋 Money Modules → `02-MONEY-MODULES.md`
6. 📋 Contracts → `03-CONTRACTS-MODULE.md`

## 🐛 Troubleshooting

**Page not loading?**
```bash
npm run dev
php artisan config:clear
```

**Database error?**
```bash
php artisan migrate:fresh --seed
```

**Permission error?**
```bash
php artisan cache:clear
```

**Queue not working?**
```bash
php artisan queue:work
# Check: storage/logs/laravel.log
```

## 📱 PWA Testing

1. Deploy to HTTPS server (required for PWA)
2. Open in Safari on iPhone
3. Tap Share → Add to Home Screen
4. Test: http://your-domain.com/help/install

## 🔐 Permissions

### Admin (all permissions)
- Full access to everything

### BandMember
- inquiries.view/create/edit
- income.view
- expenses.view/create
- group_costs.view

### Viewer
- inquiries.view
- income.view
- expenses.view
- group_costs.view

## 📞 Support

Check implementation guides for:
- Complete code examples
- Step-by-step instructions
- Troubleshooting sections
- Testing procedures

## 🎸 Good Luck!

Follow the guides in `docs/implementation/` and you'll have a fully functional band management app!

