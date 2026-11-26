<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Public contract signing: the 64-char token in the URL is the secret, so a session CSRF token adds nothing
        // there — and it broke signing (419) when a phone loaded the link twice and ended up with mismatched cookies.
        $middleware->validateCsrfTokens(except: ['sign/*']);

        $middleware->web(append: [
            \App\Http\Middleware\SetLocale::class,
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (\Spatie\Permission\Exceptions\UnauthorizedException $e, $request) {
            if ($request->expectsJson() && !$request->header('X-Inertia')) {
                return response()->json(['message' => 'Forbidden.'], 403);
            }
            if ($request->header('X-Inertia')) {
                return redirect()->back()->with('error', 'You do not have permission to access this page.');
            }
            abort(403, 'You do not have permission to access this page.');
        });
    })->create();
