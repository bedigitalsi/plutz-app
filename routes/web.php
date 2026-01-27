<?php

use App\Http\Controllers\AttachmentController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\ContractController;
use App\Http\Controllers\ContractSigningController;
use App\Http\Controllers\ContractSettingsController;
use App\Http\Controllers\ContractTemplateController;
use App\Http\Controllers\CostTypeController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\GroupCostController;
use App\Http\Controllers\HelpController;
use App\Http\Controllers\IcalFeedController;
use App\Http\Controllers\IncomeController;
use App\Http\Controllers\InquiryController;
use App\Http\Controllers\MailSettingsController;
use App\Http\Controllers\PerformanceTypeController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
        'canResetPassword' => Route::has('password.request'),
        'status' => session('status'),
    ]);
});

// Help routes (public)
Route::get('/help/install', [HelpController::class, 'install'])->name('help.install');

// Public ICS feed (no auth required)
Route::get('/ical/{token}.ics', [IcalFeedController::class, 'show'])->name('ical.show');

// Public contract signing (no auth required)
Route::get('/sign/{token}', [ContractSigningController::class, 'show'])->name('contracts.sign');
Route::post('/sign/{token}', [ContractSigningController::class, 'sign'])->name('contracts.sign.submit');

// Attachment download (auth required)
Route::middleware('auth')->group(function () {
    Route::get('/attachments/{attachment}/download', [AttachmentController::class, 'download'])->name('attachments.download');
});

Route::get('/dashboard', [DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Inquiries - permission gated
Route::middleware(['auth', 'permission:inquiries.view'])->group(function () {
    Route::get('/inquiries', [InquiryController::class, 'index'])->name('inquiries.index');
});

Route::middleware(['auth', 'permission:inquiries.create'])->group(function () {
    Route::get('/inquiries/create', [InquiryController::class, 'create'])->name('inquiries.create');
    Route::post('/inquiries', [InquiryController::class, 'store'])->name('inquiries.store');
});

Route::middleware(['auth', 'permission:inquiries.edit'])->group(function () {
    Route::get('/inquiries/{inquiry}/edit', [InquiryController::class, 'edit'])->name('inquiries.edit');
    Route::patch('/inquiries/{inquiry}', [InquiryController::class, 'update'])->name('inquiries.update');
    Route::delete('/inquiries/{inquiry}', [InquiryController::class, 'destroy'])->name('inquiries.destroy');
});

Route::middleware(['auth', 'permission:inquiries.view'])->group(function () {
    Route::get('/inquiries/{inquiry}', [InquiryController::class, 'show'])->name('inquiries.show');
});

Route::middleware(['auth', 'permission:inquiries.change_status'])->group(function () {
    Route::patch('/inquiries/{inquiry}/status', [InquiryController::class, 'updateStatus'])->name('inquiries.update-status');
});

// Calendar - permission gated
Route::middleware(['auth', 'permission:inquiries.view'])->group(function () {
    Route::get('/calendar', [CalendarController::class, 'index'])->name('calendar.index');
    Route::get('/calendar/events', [CalendarController::class, 'events'])->name('calendar.events');
});

// ICS Feeds - admin only
Route::middleware(['auth', 'permission:calendar.integrations.manage'])->group(function () {
    Route::get('/ical-feeds', [IcalFeedController::class, 'index'])->name('ical-feeds.index');
    Route::post('/ical-feeds', [IcalFeedController::class, 'store'])->name('ical-feeds.store');
    Route::delete('/ical-feeds/{icalFeed}', [IcalFeedController::class, 'destroy'])->name('ical-feeds.destroy');
});

// Settings Hub - settings.manage permission
Route::middleware(['auth', 'permission:settings.manage'])->group(function () {
    Route::get('/settings', function () {
        return \Inertia\Inertia::render('Settings/Index');
    })->name('settings.index');
    
    // Email settings
    Route::get('/settings/email', [MailSettingsController::class, 'show'])->name('settings.email');
    Route::post('/settings/email', [MailSettingsController::class, 'update'])->name('settings.email.update');
    Route::post('/settings/email/test', [MailSettingsController::class, 'sendTest'])->name('settings.email.test');

    // Contract settings
    Route::get('/settings/contracts', [ContractSettingsController::class, 'show'])->name('settings.contracts');
    Route::post('/settings/contracts', [ContractSettingsController::class, 'update'])->name('settings.contracts.update');
    
    // Contract Templates
    Route::get('/settings/contract-templates', [ContractTemplateController::class, 'index'])->name('contract-templates.index');
    Route::get('/settings/contract-templates/create', [ContractTemplateController::class, 'create'])->name('contract-templates.create');
    Route::post('/settings/contract-templates', [ContractTemplateController::class, 'store'])->name('contract-templates.store');
    Route::get('/settings/contract-templates/{contractTemplate}/edit', [ContractTemplateController::class, 'edit'])->name('contract-templates.edit');
    Route::patch('/settings/contract-templates/{contractTemplate}', [ContractTemplateController::class, 'update'])->name('contract-templates.update');
    Route::delete('/settings/contract-templates/{contractTemplate}', [ContractTemplateController::class, 'destroy'])->name('contract-templates.destroy');
    Route::patch('/settings/contract-templates/{contractTemplate}/activate', [ContractTemplateController::class, 'activate'])->name('contract-templates.activate');
});

// Expenses - permission gated
Route::middleware(['auth', 'permission:expenses.view'])->group(function () {
    Route::get('/expenses', [ExpenseController::class, 'index'])->name('expenses.index');
});

Route::middleware(['auth', 'permission:expenses.create'])->group(function () {
    Route::get('/expenses/create', [ExpenseController::class, 'create'])->name('expenses.create');
    Route::post('/expenses', [ExpenseController::class, 'store'])->name('expenses.store');
    Route::get('/expenses/{expense}/edit', [ExpenseController::class, 'edit'])->name('expenses.edit');
    Route::patch('/expenses/{expense}', [ExpenseController::class, 'update'])->name('expenses.update');
    Route::delete('/expenses/{expense}', [ExpenseController::class, 'destroy'])->name('expenses.destroy');
});

Route::middleware(['auth', 'permission:expenses.view'])->group(function () {
    Route::get('/expenses/{expense}', [ExpenseController::class, 'show'])->name('expenses.show');
});

// Incomes - permission gated
Route::middleware(['auth', 'permission:income.view'])->group(function () {
    Route::get('/incomes', [IncomeController::class, 'index'])->name('incomes.index');
});

Route::middleware(['auth', 'permission:income.create'])->group(function () {
    Route::get('/incomes/create', [IncomeController::class, 'create'])->name('incomes.create');
    Route::post('/incomes', [IncomeController::class, 'store'])->name('incomes.store');
    Route::delete('/incomes/{income}', [IncomeController::class, 'destroy'])->name('incomes.destroy');
});

Route::middleware(['auth', 'permission:income.view'])->group(function () {
    Route::get('/incomes/{income}', [IncomeController::class, 'show'])->name('incomes.show');
});

Route::middleware(['auth', 'permission:income.distribute'])->group(function () {
    Route::post('/incomes/{income}/distribute', [IncomeController::class, 'distribute'])->name('incomes.distribute');
});

// Group Costs - permission gated
Route::middleware(['auth', 'permission:group_costs.view'])->group(function () {
    Route::get('/group-costs', [GroupCostController::class, 'index'])->name('group-costs.index');
});

Route::middleware(['auth', 'permission:group_costs.create'])->group(function () {
    Route::get('/group-costs/create', [GroupCostController::class, 'create'])->name('group-costs.create');
    Route::post('/group-costs', [GroupCostController::class, 'store'])->name('group-costs.store');
});

Route::middleware(['auth', 'permission:group_costs.edit'])->group(function () {
    Route::get('/group-costs/{groupCost}/edit', [GroupCostController::class, 'edit'])->name('group-costs.edit');
    Route::patch('/group-costs/{groupCost}', [GroupCostController::class, 'update'])->name('group-costs.update');
    Route::delete('/group-costs/{groupCost}', [GroupCostController::class, 'destroy'])->name('group-costs.destroy');
});

// Cost Types - settings.manage permission
Route::middleware(['auth', 'permission:settings.manage'])->group(function () {
    Route::get('/cost-types', [CostTypeController::class, 'index'])->name('cost-types.index');
    Route::get('/cost-types/create', [CostTypeController::class, 'create'])->name('cost-types.create');
    Route::post('/cost-types', [CostTypeController::class, 'store'])->name('cost-types.store');
    Route::get('/cost-types/{costType}/edit', [CostTypeController::class, 'edit'])->name('cost-types.edit');
    Route::patch('/cost-types/{costType}', [CostTypeController::class, 'update'])->name('cost-types.update');
    Route::delete('/cost-types/{costType}', [CostTypeController::class, 'destroy'])->name('cost-types.destroy');
});

// Performance Types - settings.manage permission
Route::middleware(['auth', 'permission:settings.manage'])->group(function () {
    Route::get('/performance-types', [PerformanceTypeController::class, 'index'])->name('performance-types.index');
    Route::get('/performance-types/create', [PerformanceTypeController::class, 'create'])->name('performance-types.create');
    Route::post('/performance-types', [PerformanceTypeController::class, 'store'])->name('performance-types.store');
    Route::get('/performance-types/{performanceType}/edit', [PerformanceTypeController::class, 'edit'])->name('performance-types.edit');
    Route::patch('/performance-types/{performanceType}', [PerformanceTypeController::class, 'update'])->name('performance-types.update');
    Route::delete('/performance-types/{performanceType}', [PerformanceTypeController::class, 'destroy'])->name('performance-types.destroy');
});

// User Management - users.manage permission
Route::middleware(['auth', 'permission:users.manage'])->group(function () {
    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::get('/users/create', [UserController::class, 'create'])->name('users.create');
    Route::post('/users', [UserController::class, 'store'])->name('users.store');
    Route::get('/users/{user}/edit', [UserController::class, 'edit'])->name('users.edit');
    Route::patch('/users/{user}', [UserController::class, 'update'])->name('users.update');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
});

// Contracts - permission gated
Route::middleware(['auth', 'permission:contracts.manage'])->group(function () {
    Route::resource('contracts', ContractController::class);
    Route::post('contracts/{contract}/send', [ContractController::class, 'sendInvitation'])
        ->name('contracts.send')
        ->middleware('permission:contracts.send');
});

require __DIR__.'/auth.php';
