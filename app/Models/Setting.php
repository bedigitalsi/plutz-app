<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

class Setting extends Model
{
    protected $fillable = ['key', 'value', 'type'];

    private static $cache = [];

    /**
     * Get a string setting value
     */
    public static function getString(string $key, ?string $default = null): ?string
    {
        if (isset(self::$cache[$key])) {
            return self::$cache[$key];
        }

        $setting = self::where('key', $key)->first();
        $value = $setting ? $setting->value : $default;
        
        self::$cache[$key] = $value;
        return $value;
    }

    /**
     * Set a string setting value
     */
    public static function setString(string $key, ?string $value): void
    {
        self::updateOrCreate(
            ['key' => $key],
            ['value' => $value, 'type' => 'string']
        );
        
        self::$cache[$key] = $value;
    }

    /**
     * Get an integer setting value
     */
    public static function getInt(string $key, ?int $default = null): ?int
    {
        $value = self::getString($key);
        
        if ($value === null) {
            return $default;
        }
        
        return (int) $value;
    }

    /**
     * Set an integer setting value
     */
    public static function setInt(string $key, ?int $value): void
    {
        self::updateOrCreate(
            ['key' => $key],
            ['value' => $value !== null ? (string) $value : null, 'type' => 'integer']
        );
        
        self::$cache[$key] = $value !== null ? (string) $value : null;
    }

    /**
     * Get a boolean setting value
     */
    public static function getBool(string $key, bool $default = false): bool
    {
        $value = self::getString($key);
        
        if ($value === null) {
            return $default;
        }
        
        return filter_var($value, FILTER_VALIDATE_BOOLEAN);
    }

    /**
     * Set a boolean setting value
     */
    public static function setBool(string $key, bool $value): void
    {
        self::updateOrCreate(
            ['key' => $key],
            ['value' => $value ? '1' : '0', 'type' => 'boolean']
        );
        
        self::$cache[$key] = $value ? '1' : '0';
    }

    /**
     * Get an encrypted string setting value
     */
    public static function getEncryptedString(string $key, ?string $default = null): ?string
    {
        $encrypted = self::getString($key);
        
        if ($encrypted === null) {
            return $default;
        }
        
        try {
            return Crypt::decryptString($encrypted);
        } catch (\Exception $e) {
            return $default;
        }
    }

    /**
     * Set an encrypted string setting value
     */
    public static function setEncryptedString(string $key, ?string $value): void
    {
        if ($value === null) {
            self::setString($key, null);
            return;
        }
        
        $encrypted = Crypt::encryptString($value);
        self::setString($key, $encrypted);
    }

    /**
     * Check if an encrypted setting has a value
     */
    public static function hasEncryptedValue(string $key): bool
    {
        return !empty(self::getString($key));
    }

    /**
     * Clear the settings cache
     */
    public static function clearCache(): void
    {
        self::$cache = [];
    }
}
