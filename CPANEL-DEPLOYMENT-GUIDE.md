# 🚀 Plutz App - cPanel Deployment Guide

## Step-by-Step Deployment to cPanel with Git

### Prerequisites
- cPanel account with Git Version Control access
- MySQL database access
- SSH access (recommended but optional)
- Your GitHub repository: `https://github.com/bedigitalsi/plutz-app.git`

---

## Phase 1: Initial Setup (DO THIS FIRST)

### Step 1: Create MySQL Database

1. **Login to cPanel**
2. **Navigate to:** MySQL® Databases
3. **Create a new database:**
   - Database name: `theplutfamily_plutz` (or similar)
   - Click "Create Database"
   - **WRITE DOWN:** Full database name (usually prefixed with your username)

4. **Create a database user:**
   - Username: `theplutfamily_plutz`
   - Password: Generate a strong password
   - Click "Create User"
   - **WRITE DOWN:** Username and password

5. **Add user to database:**
   - Select the user you created
   - Select the database you created
   - Check "ALL PRIVILEGES"
   - Click "Make Changes"

6. **Note your database connection details:**
   ```
   DB_HOST=localhost
   DB_DATABASE=theplutfamily_plutz (your actual database name)
   DB_USERNAME=theplutfamily_plutz (your actual username)
   DB_PASSWORD=your_strong_password
   ```

---

### Step 2: Set Up Git Repository in cPanel

1. **Navigate to:** Git™ Version Control (in cPanel)

2. **Click:** "Create"

3. **Fill in the form:**
   - **Clone URL:** `https://github.com/bedigitalsi/plutz-app.git`
   - **Repository Path:** `/home/theplutfamily/repositories/plutz-app`
     (Or any path under your home directory)
   - **Repository Name:** `plutz-app`

4. **Click:** "Create"

   ⚠️ **Note:** If your repository is private, you'll need to:
   - Generate a GitHub Personal Access Token
   - Use: `https://YOUR_TOKEN@github.com/bedigitalsi/plutz-app.git`

5. **Wait for the clone to complete**

---

### Step 3: Set Up Document Root

Your Laravel app needs special setup because the public folder should be the web root.

**Option A: If you have a separate domain/subdomain (RECOMMENDED)**

1. **Create a subdomain** (or use existing domain):
   - In cPanel → Domains
   - Create: `plutz.yourdomain.com`
   - Document Root: `/home/theplutfamily/repositories/plutz-app/public`

**Option B: If using public_html**

1. **Create a symlink** (requires SSH):
   ```bash
   cd /home/theplutfamily/public_html
   ln -s /home/theplutfamily/repositories/plutz-app/public plutz
   ```
   - Access via: `yourdomain.com/plutz`

---

## Phase 2: Server Configuration

### Step 4: SSH Into Your Server (Required for Next Steps)

```bash
ssh theplutfamily@your-server.com
```

Once connected, navigate to your repository:
```bash
cd /home/theplutfamily/repositories/plutz-app
```

---

### Step 5: Install PHP Dependencies

```bash
# Make sure you're in the app directory
cd /home/theplutfamily/repositories/plutz-app

# Install Composer dependencies
composer install --no-dev --optimize-autoloader
```

**Note:** If Composer is not available globally, you may need to use:
```bash
php /home/theplutfamily/bin/composer.phar install --no-dev --optimize-autoloader
```

Or download Composer:
```bash
curl -sS https://getcomposer.org/installer | php
php composer.phar install --no-dev --optimize-autoloader
```

---

### Step 6: Install Node.js Dependencies and Build Assets

```bash
# Install npm packages
npm install

# Build production assets
npm run build
```

**Note:** If Node.js/npm is not available, contact your hosting provider or use cPanel's Node.js app if available.

---

### Step 7: Configure Environment File

```bash
# Copy the example env file
cp .env.example .env

# Edit the .env file
nano .env  # or use: vi .env
```

**Update these critical settings:**

```env
# Application
APP_NAME="Plutz"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://plutz.yourdomain.com

# Database (use the details from Step 1)
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=theplutfamily_plutz
DB_USERNAME=theplutfamily_plutz
DB_PASSWORD=your_strong_password

# Mail Configuration (IMPORTANT for contracts!)
MAIL_MAILER=smtp
MAIL_HOST=mail.yourdomain.com
MAIL_PORT=465
MAIL_USERNAME=noreply@yourdomain.com
MAIL_PASSWORD=your_email_password
MAIL_ENCRYPTION=ssl
MAIL_FROM_ADDRESS=noreply@yourdomain.com
MAIL_FROM_NAME="${APP_NAME}"

# Queue Configuration
QUEUE_CONNECTION=database

# Session
SESSION_DRIVER=database
SESSION_LIFETIME=120

# Cache
CACHE_STORE=database

# Filesystem
FILESYSTEM_DISK=local
```

**Save and exit** (in nano: Ctrl+X, then Y, then Enter)

---

### Step 8: Generate Application Key

```bash
php artisan key:generate
```

This will automatically update the `APP_KEY` in your `.env` file.

---

### Step 9: Set Correct Permissions

```bash
# Set proper permissions for storage and cache
chmod -R 775 storage
chmod -R 775 bootstrap/cache

# Change ownership to web server user (usually nobody or your username)
chown -R theplutfamily:theplutfamily storage
chown -R theplutfamily:theplutfamily bootstrap/cache
```

---

### Step 10: Run Database Migrations and Seeders

```bash
# Run migrations to create all tables
php artisan migrate --force

# Run seeders to create initial data (roles, permissions, admin user)
php artisan db:seed --class=InitialDataSeeder --force
```

**Default admin credentials:**
- Email: `admin@plutz.app`
- Password: `password`

⚠️ **CHANGE THIS PASSWORD IMMEDIATELY AFTER FIRST LOGIN!**

---

### Step 11: Optimize Laravel for Production

```bash
# Cache configuration
php artisan config:cache

# Cache routes
php artisan route:cache

# Cache views
php artisan view:cache

# Optimize autoloader
composer dump-autoload --optimize
```

---

### Step 12: Set Up .htaccess (if not already present)

The `public/.htaccess` should already exist. Verify it has this content:

```bash
cat public/.htaccess
```

If missing, create it:

```apache
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Redirect Trailing Slashes If Not A Folder...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Send Requests To Front Controller...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
```

---

## Phase 3: Queue Worker Setup (CRITICAL for Contracts!)

The app uses queues for:
- PDF generation (contracts)
- Email sending

You need a queue worker running continuously.

### Step 13: Set Up Cron Job for Queue Worker

1. **In cPanel → Cron Jobs**

2. **Add a new cron job:**
   - **Common Settings:** Every Minute (* * * * *)
   - **Command:**
   ```bash
   cd /home/theplutfamily/repositories/plutz-app && /usr/bin/php artisan schedule:run >> /dev/null 2>&1
   ```

3. **Add queue worker to schedule:**

Edit `app/Console/Kernel.php` (if not already configured):

```php
protected function schedule(Schedule $schedule): void
{
    $schedule->command('queue:work --stop-when-empty')->everyMinute();
}
```

**Alternative: Use a persistent queue worker** (if your host allows):

Add another cron job that runs every 5 minutes:
```bash
cd /home/theplutfamily/repositories/plutz-app && /usr/bin/php artisan queue:work --tries=3 --timeout=60 --stop-when-empty >> /dev/null 2>&1
```

---

## Phase 4: Testing

### Step 14: Test the Application

1. **Visit your domain:** `https://plutz.yourdomain.com`

2. **Login with default credentials:**
   - Email: `admin@plutz.app`
   - Password: `password`

3. **Change the admin password:**
   - Go to Profile → Update Password

4. **Test key features:**
   - [ ] Create an inquiry
   - [ ] View calendar
   - [ ] Create an expense (test file upload)
   - [ ] Create income and distribution
   - [ ] Create a contract
   - [ ] Send a contract for signing (test email)
   - [ ] Sign the contract (test PDF generation)

---

## Phase 5: Security & Final Configuration

### Step 15: Update Admin Email

```bash
php artisan tinker
```

Then in tinker:
```php
$admin = App\Models\User::where('email', 'admin@plutz.app')->first();
$admin->email = 'your-real-email@yourdomain.com';
$admin->name = 'Your Real Name';
$admin->save();
exit
```

---

### Step 16: SSL Certificate

1. **In cPanel → SSL/TLS Status**
2. **Run AutoSSL** for your domain
3. **Verify HTTPS** is working
4. **Update APP_URL** in `.env` to use `https://`

```bash
nano .env
# Change APP_URL to https://plutz.yourdomain.com
php artisan config:clear
php artisan config:cache
```

---

### Step 17: Set Up Backups

**Database Backups:**
1. cPanel → Backup Wizard
2. Set up automated daily backups

**File Backups:**
- Use cPanel backup tools
- Consider setting up off-site backups for `storage/app/private` (contracts and attachments)

---

## Phase 6: Updating the Application

### Step 18: How to Update After Pushing Changes to GitHub

1. **SSH into your server**
2. **Navigate to repository:**
   ```bash
   cd /home/theplutfamily/repositories/plutz-app
   ```

3. **Use cPanel Git interface:**
   - Go to Git™ Version Control
   - Click "Manage" on your repository
   - Click "Pull or Deploy" → "Update from Remote"

   **OR via SSH:**
   ```bash
   git pull origin main
   ```

4. **After pulling changes:**
   ```bash
   # Install any new dependencies
   composer install --no-dev --optimize-autoloader
   npm install
   npm run build

   # Run any new migrations
   php artisan migrate --force

   # Clear and rebuild caches
   php artisan config:clear
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

---

## Troubleshooting

### Common Issues

**500 Internal Server Error**
- Check storage permissions: `chmod -R 775 storage`
- Check `.env` file exists and is configured
- Check `storage/logs/laravel.log` for errors

**Database Connection Error**
- Verify database credentials in `.env`
- Test connection: `php artisan migrate --pretend`
- Check if database exists in cPanel

**Assets Not Loading**
- Run: `npm run build`
- Clear cache: `php artisan cache:clear`
- Check `public/build` directory exists

**Emails Not Sending**
- Verify MAIL settings in `.env`
- Check cPanel email accounts exist
- Test: `php artisan tinker` → `Mail::raw('test', fn($m) => $m->to('test@example.com')->subject('test'));`
- Check queue is running: `php artisan queue:work --once`

**PDFs Not Generating**
- Check Node.js is installed: `node --version`
- Install Puppeteer: `npm install puppeteer`
- Check storage permissions
- Check queue worker is running

**Contracts Stuck in "Sending" Status**
- Queue worker is not running
- Run manually: `php artisan queue:work --stop-when-empty`
- Check failed jobs: `php artisan queue:failed`

---

## Important Files & Locations

```
/home/theplutfamily/repositories/plutz-app/
├── .env                          # Environment configuration
├── storage/
│   ├── logs/laravel.log         # Application logs
│   ├── app/private/             # Uploaded files (receipts, attachments)
│   └── app/contracts/           # Generated contract PDFs
├── public/                       # Web root (point domain here)
└── database/database.sqlite      # Database (if using SQLite - not for production)
```

---

## Useful Commands

```bash
# View logs in real-time
tail -f storage/logs/laravel.log

# Clear all caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Run queue manually (for testing)
php artisan queue:work --once

# Check failed jobs
php artisan queue:failed
php artisan queue:retry all

# Database
php artisan migrate:status
php artisan db:show

# List all routes
php artisan route:list
```

---

## Post-Deployment Checklist

- [ ] Database created and user configured
- [ ] Git repository cloned
- [ ] Composer dependencies installed
- [ ] NPM dependencies installed and built
- [ ] .env file configured
- [ ] APP_KEY generated
- [ ] Permissions set correctly
- [ ] Migrations run
- [ ] Seeders run
- [ ] Caches optimized
- [ ] Cron job for queue worker set up
- [ ] SSL certificate installed
- [ ] Admin email/password changed
- [ ] Email delivery tested
- [ ] PDF generation tested
- [ ] Backups configured
- [ ] All features tested

---

## Production Environment Variables Reminder

Make sure these are set correctly in `.env`:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://plutz.yourdomain.com
DB_CONNECTION=mysql
QUEUE_CONNECTION=database
SESSION_DRIVER=database
MAIL_MAILER=smtp
```

---

## Support & Logs

**Check logs:**
- Laravel: `storage/logs/laravel.log`
- cPanel: Error logs in cPanel → Errors
- PHP: cPanel → PHP Error Log

**Debug mode (ONLY for troubleshooting, disable after):**
```env
APP_DEBUG=true
```

---

## 🎉 You're Live!

Once all steps are complete, your Plutz app should be fully functional on your cPanel server!

**Next Steps:**
1. Train your band members
2. Start managing inquiries, income, and contracts
3. Monitor logs for any issues
4. Set up regular backups

**Rock on! 🎸**
