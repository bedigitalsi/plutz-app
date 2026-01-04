<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Support\MailSettings;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class MailSettingsController extends Controller
{
    public function show()
    {
        return Inertia::render('Settings/Email', [
            'settings' => [
                'mail_from_address' => Setting::getString('mail_from_address', 'info@plutzband.com'),
                'mail_from_name' => Setting::getString('mail_from_name', 'Plutz'),
                'mail_force_from' => Setting::getBool('mail_force_from', true),
                'mail_force_from_name' => Setting::getBool('mail_force_from_name', true),
                'mail_set_return_path' => Setting::getBool('mail_set_return_path', true),
                'mail_host' => Setting::getString('mail_host', 'mail.plutzband.com'),
                'mail_port' => Setting::getInt('mail_port', 465),
                'mail_encryption' => Setting::getString('mail_encryption', 'ssl'),
                'mail_auto_tls' => Setting::getBool('mail_auto_tls', true),
                'mail_auth_enabled' => Setting::getBool('mail_auth_enabled', true),
                'mail_username' => Setting::getString('mail_username', 'info@plutzband.com'),
                'has_password' => Setting::hasEncryptedValue('mail_password'),
                'mail_admin_recipient' => Setting::getString('mail_admin_recipient', 'admin@plutz.app'),
            ],
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'mail_from_address' => 'required|email',
            'mail_from_name' => 'required|string|max:255',
            'mail_force_from' => 'boolean',
            'mail_force_from_name' => 'boolean',
            'mail_set_return_path' => 'boolean',
            'mail_host' => 'required|string|max:255',
            'mail_port' => 'required|integer|min:1|max:65535',
            'mail_encryption' => 'required|in:none,ssl,tls',
            'mail_auto_tls' => 'boolean',
            'mail_auth_enabled' => 'boolean',
            'mail_username' => 'nullable|string|max:255',
            'mail_password' => 'nullable|string',
            'mail_admin_recipient' => 'required|email',
        ]);

        // Save all settings
        Setting::setString('mail_from_address', $validated['mail_from_address']);
        Setting::setString('mail_from_name', $validated['mail_from_name']);
        Setting::setBool('mail_force_from', $validated['mail_force_from'] ?? false);
        Setting::setBool('mail_force_from_name', $validated['mail_force_from_name'] ?? false);
        Setting::setBool('mail_set_return_path', $validated['mail_set_return_path'] ?? false);
        Setting::setString('mail_host', $validated['mail_host']);
        Setting::setInt('mail_port', $validated['mail_port']);
        Setting::setString('mail_encryption', $validated['mail_encryption']);
        Setting::setBool('mail_auto_tls', $validated['mail_auto_tls'] ?? false);
        Setting::setBool('mail_auth_enabled', $validated['mail_auth_enabled'] ?? false);

        // Handle authentication settings
        if ($validated['mail_auth_enabled'] ?? false) {
            Setting::setString('mail_username', $validated['mail_username']);
            
            // Only update password if provided (blank means keep existing)
            if (!empty($validated['mail_password'])) {
                Setting::setEncryptedString('mail_password', $validated['mail_password']);
            }
        } else {
            Setting::setString('mail_username', null);
            Setting::setEncryptedString('mail_password', null);
        }

        Setting::setString('mail_admin_recipient', $validated['mail_admin_recipient']);

        // Clear settings cache
        Setting::clearCache();

        return back()->with('success', 'Email settings saved successfully.');
    }

    public function sendTest(Request $request)
    {
        $validated = $request->validate([
            'test_email' => 'required|email',
        ]);

        try {
            // Apply current settings
            MailSettings::apply();

            // Send test email
            Mail::raw(
                "This is a test email from your Plutz app.\n\nIf you received this, your email settings are working correctly!",
                function ($message) use ($validated) {
                    $message->to($validated['test_email'])
                        ->subject('Test Email - Plutz App');

                    // Apply from overrides
                    if (MailSettings::shouldForceFrom() || MailSettings::shouldForceFromName()) {
                        $message->from(
                            MailSettings::getFromAddress(),
                            MailSettings::getFromName()
                        );
                    }

                    if (MailSettings::shouldSetReturnPath()) {
                        $message->returnPath(MailSettings::getFromAddress());
                    }
                }
            );

            return back()->with('success', 'Test email sent successfully to ' . $validated['test_email']);
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to send test email: ' . $e->getMessage());
        }
    }
}
