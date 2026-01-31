<?php

namespace App\Support;

use App\Models\Setting;
use Illuminate\Support\Facades\Mail;

class MailSettings
{
    /**
     * Apply mail settings from database to runtime configuration
     */
    public static function apply(): void
    {
        // Load settings from database
        $fromAddress = Setting::getString('mail_from_address', config('mail.from.address'));
        $fromName = Setting::getString('mail_from_name', config('mail.from.name'));
        $host = Setting::getString('mail_host', config('mail.mailers.smtp.host'));
        $port = Setting::getInt('mail_port', config('mail.mailers.smtp.port'));
        $encryption = Setting::getString('mail_encryption', 'tls');
        $authEnabled = Setting::getBool('mail_auth_enabled', true);
        $username = $authEnabled ? Setting::getString('mail_username') : null;
        $password = $authEnabled ? Setting::getEncryptedString('mail_password') : null;

        // Map encryption to scheme
        $scheme = null;
        if ($encryption === 'ssl') {
            $scheme = 'smtps';
        }

        // Set mail configuration
        config([
            'mail.default' => 'smtp',
            'mail.mailers.smtp.transport' => 'smtp',
            'mail.mailers.smtp.scheme' => $scheme,
            'mail.mailers.smtp.host' => $host,
            'mail.mailers.smtp.port' => $port,
            'mail.mailers.smtp.username' => $username,
            'mail.mailers.smtp.password' => $password,
            'mail.from.address' => $fromAddress,
            'mail.from.name' => $fromName,
        ]);

        // Force Laravel to rebuild mailer instances with new config
        Mail::forgetMailers();
    }

    /**
     * Check if email sending is enabled
     */
    public static function isEnabled(): bool
    {
        return Setting::getBool('mail_enabled', true);
    }

    /**
     * Get the configured from address
     */
    public static function getFromAddress(): string
    {
        return Setting::getString('mail_from_address', config('mail.from.address'));
    }

    /**
     * Get the configured from name
     */
    public static function getFromName(): string
    {
        return Setting::getString('mail_from_name', config('mail.from.name'));
    }

    /**
     * Check if "force from" is enabled
     */
    public static function shouldForceFrom(): bool
    {
        return Setting::getBool('mail_force_from', false);
    }

    /**
     * Check if "force from name" is enabled
     */
    public static function shouldForceFromName(): bool
    {
        return Setting::getBool('mail_force_from_name', false);
    }

    /**
     * Check if "set return path" is enabled
     */
    public static function shouldSetReturnPath(): bool
    {
        return Setting::getBool('mail_set_return_path', false);
    }

    /**
     * Get the admin recipient email
     */
    public static function getAdminRecipient(): string
    {
        return Setting::getString('mail_admin_recipient', 'admin@plutz.app');
    }
}
