# Debug Session Summary - Contract Email Issue

## Problem
Contract invitation emails were not being sent when clicking "Send Invitation", even though test emails worked fine.

## Root Cause
The issue had **TWO parts**:

### Part 1: Mail Driver Configuration
- `.env` file had `MAIL_MAILER=log` (default Laravel setting)
- This meant emails were being logged to `storage/logs/laravel.log` instead of sent via SMTP
- Test emails worked because they ran through the web process which called `MailSettings::apply()` correctly

### Part 2: Queue Worker Using Old Code
- The queue worker was started **before** the `MailSettings::apply()` code was added
- Queue workers cache PHP code and don't automatically reload
- Jobs were running but using old code that didn't apply SMTP settings

## Evidence from Debug Logs

**Before fix (with old queue worker):**
- Job dispatched ✅
- Job executed in <12ms (too fast for SMTP)
- Emails logged to file with `From: Laravel <hello@example.com>` (default config)
- No debug logs from instrumented code (old code running)

**After fix (with restarted queue worker):**
- Job dispatched ✅
- `MailSettings::apply()` executed ✅
- Settings loaded: `mail.plutzband.com:465` SSL ✅
- Email sent in ~2 seconds (normal SMTP time) ✅
- From/ReturnPath overrides applied ✅

## Solution
**Restart the queue worker** whenever code changes are made to job classes:

```bash
# Stop the old worker
Ctrl+C

# Start fresh worker
php artisan queue:work
```

## Why This Happened
1. Queue workers are long-running processes that don't auto-reload code
2. When you add instrumentation or change job logic, existing workers still use old code
3. This is a common Laravel development pitfall

## Prevention
For development, use `queue:listen` instead of `queue:work`:
```bash
php artisan queue:listen
```
- `queue:listen` spawns a new process for each job (slower but auto-reloads code)
- `queue:work` is faster but caches code

Or use `queue:work` with `--max-jobs=1` to auto-restart after each job:
```bash
php artisan queue:work --max-jobs=1
```

## Verification
The debug logs confirmed:
- ✅ SMTP configuration loaded correctly from database
- ✅ Email sent successfully via SMTP (took 2+ seconds vs <12ms for log driver)
- ✅ No exceptions thrown
- ✅ From/ReturnPath overrides applied

## Status
**RESOLVED** - Contract emails now send via SMTP using configured settings.

---

**Date:** December 28, 2025  
**Duration:** Debug session with instrumentation  
**Result:** Working correctly after queue worker restart
