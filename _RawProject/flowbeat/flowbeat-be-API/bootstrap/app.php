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
        // Pasang header keamanan pada semua permintaan API
        $middleware->api(append: [
            \App\Http\Middleware\SecurityHeaders::class,
            \App\Http\Middleware\RequestLogger::class,
        ]);

        // Daftarkan alias middleware
        $middleware->alias([
            'security.headers' => \App\Http\Middleware\SecurityHeaders::class,
            'abilities'        => \Laravel\Sanctum\Http\Middleware\CheckAbilities::class,
            'ability'          => \Laravel\Sanctum\Http\Middleware\CheckForAnyAbility::class,
        ]);
    })

    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
