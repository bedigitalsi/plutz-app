<?php

namespace App\Providers;

use Google\Client;
use Google\Service\Drive;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Vite;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Support\ServiceProvider;
use League\Flysystem\Filesystem;
use Masbug\Flysystem\GoogleDriveAdapter;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        RateLimiter::for('api', function ($request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        Storage::extend('google', function ($app, $config) {
            $client = new Client();
            $client->setAuthConfig($config['serviceAccountJson']);
            $client->addScope(Drive::DRIVE);

            $service = new Drive($client);

            $options = [];
            if (!empty($config['folder'])) {
                $options['sharedFolderId'] = $config['folder'];
            }

            $adapter = new GoogleDriveAdapter($service, '/', $options);

            $driver = new Filesystem($adapter);

            return new FilesystemAdapter($driver, $adapter, $config);
        });
    }
}
