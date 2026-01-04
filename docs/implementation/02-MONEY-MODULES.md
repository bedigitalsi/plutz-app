# Implementation Guide: Money Modules (Expenses, Income, Distributions, Group Costs, Dashboards)

## Overview
This module handles financial tracking: expenses (invoices you paid), income (money received from gigs), income distribution to band members + mutual fund, group costs, and financial dashboards.

## Prerequisites
- Inquiries module completed
- Can create income from confirmed inquiries

---

## PART 1: EXPENSES (Paid Invoices)

### STEP 1: Complete Expense Model

**File:** `app/Models/Expense.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Expense extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'entered_at',
        'invoice_date',
        'amount',
        'currency',
        'company_name',
        'notes',
        'status',
        'created_by',
    ];

    protected $casts = [
        'entered_at' => 'datetime',
        'invoice_date' => 'date',
        'amount' => 'decimal:2',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($expense) {
            if (empty($expense->entered_at)) {
                $expense->entered_at = now();
            }
        });
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function attachments(): MorphMany
    {
        return $this->morphMany(Attachment::class, 'attachable');
    }
}
```

### STEP 2: Create ExpenseController

**File:** `app/Http/Controllers/ExpenseController.php`

```php
<?php

namespace App\Http\Controllers;

use App\Models\Attachment;
use App\Models\Expense;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        $query = Expense::with(['creator', 'attachments'])
            ->orderBy('invoice_date', 'desc');

        if ($request->has('date_from')) {
            $query->where('invoice_date', '>=', $request->date_from);
        }
        
        if ($request->has('date_to')) {
            $query->where('invoice_date', '<=', $request->date_to);
        }

        if ($request->has('company')) {
            $query->where('company_name', 'like', '%' . $request->company . '%');
        }

        return Inertia::render('Expenses/Index', [
            'expenses' => $query->paginate(20)->withQueryString(),
            'filters' => $request->only(['date_from', 'date_to', 'company']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Expenses/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'invoice_date' => 'required|date',
            'amount' => 'required|numeric|min:0',
            'currency' => 'nullable|string|size:3',
            'company_name' => 'required|string|max:255',
            'notes' => 'nullable|string',
            'status' => 'nullable|in:paid,unpaid',
            'attachment' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:10240', // 10MB
        ]);

        $validated['created_by'] = auth()->id();
        $validated['currency'] = $validated['currency'] ?? 'EUR';
        $validated['status'] = $validated['status'] ?? 'paid';

        $expense = Expense::create($validated);

        // Handle file upload
        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $path = $file->store('expenses', 'local');
            
            Attachment::create([
                'id' => (string) Str::uuid(),
                'attachable_type' => Expense::class,
                'attachable_id' => $expense->id,
                'disk' => 'local',
                'path' => $path,
                'original_name' => $file->getClientOriginalName(),
                'mime' => $file->getMimeType(),
                'size' => $file->getSize(),
                'created_by' => auth()->id(),
            ]);
        }

        return redirect()->route('expenses.index')
            ->with('success', 'Expense created successfully.');
    }

    public function show(Expense $expense)
    {
        $expense->load(['creator', 'attachments']);

        return Inertia::render('Expenses/Show', [
            'expense' => $expense,
        ]);
    }

    public function edit(Expense $expense)
    {
        return Inertia::render('Expenses/Edit', [
            'expense' => $expense,
        ]);
    }

    public function update(Request $request, Expense $expense)
    {
        $validated = $request->validate([
            'invoice_date' => 'required|date',
            'amount' => 'required|numeric|min:0',
            'currency' => 'nullable|string|size:3',
            'company_name' => 'required|string|max:255',
            'notes' => 'nullable|string',
            'status' => 'nullable|in:paid,unpaid',
        ]);

        $expense->update($validated);

        return redirect()->route('expenses.index')
            ->with('success', 'Expense updated successfully.');
    }

    public function destroy(Expense $expense)
    {
        // Delete attachments
        foreach ($expense->attachments as $attachment) {
            Storage::disk($attachment->disk)->delete($attachment->path);
            $attachment->delete();
        }

        $expense->delete();

        return redirect()->route('expenses.index')
            ->with('success', 'Expense deleted successfully.');
    }
}
```

---

## PART 2: INCOME + DISTRIBUTIONS

### STEP 3: Complete Income Model

**File:** `app/Models/Income.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Income extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'income_date',
        'amount',
        'currency',
        'invoice_issued',
        'performance_type_id',
        'contact_person',
        'notes',
        'inquiry_id',
        'created_by',
    ];

    protected $casts = [
        'income_date' => 'date',
        'amount' => 'decimal:2',
        'invoice_issued' => 'boolean',
    ];

    public function performanceType(): BelongsTo
    {
        return $this->belongsTo(PerformanceType::class);
    }

    public function inquiry(): BelongsTo
    {
        return $this->belongsTo(Inquiry::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function distributions(): HasMany
    {
        return $this->hasMany(IncomeDistribution::class);
    }

    public function getTotalDistributedAttribute()
    {
        return $this->distributions->sum('amount');
    }

    public function getRemainingAttribute()
    {
        return $this->amount - $this->getTotalDistributedAttribute();
    }
}
```

### STEP 4: Complete IncomeDistribution Model

**File:** `app/Models/IncomeDistribution.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IncomeDistribution extends Model
{
    use HasFactory;

    protected $fillable = [
        'income_id',
        'recipient_type',
        'recipient_user_id',
        'amount',
        'note',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    public function income(): BelongsTo
    {
        return $this->belongsTo(Income::class);
    }

    public function recipientUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recipient_user_id');
    }
}
```

### STEP 5: Create IncomeController

**File:** `app/Http/Controllers/IncomeController.php`

```php
<?php

namespace App\Http\Controllers;

use App\Models\Income;
use App\Models\IncomeDistribution;
use App\Models\Inquiry;
use App\Models\PerformanceType;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class IncomeController extends Controller
{
    public function index(Request $request)
    {
        $query = Income::with(['performanceType', 'inquiry', 'creator', 'distributions'])
            ->orderBy('income_date', 'desc');

        if ($request->has('date_from')) {
            $query->where('income_date', '>=', $request->date_from);
        }
        
        if ($request->has('date_to')) {
            $query->where('income_date', '<=', $request->date_to);
        }

        return Inertia::render('Income/Index', [
            'incomes' => $query->paginate(20)->withQueryString(),
            'filters' => $request->only(['date_from', 'date_to']),
        ]);
    }

    public function create(Request $request)
    {
        $inquiry = null;
        
        if ($request->has('inquiry_id')) {
            $inquiry = Inquiry::with(['performanceType'])->findOrFail($request->inquiry_id);
        }

        return Inertia::render('Income/Create', [
            'performanceTypes' => PerformanceType::where('is_active', true)->get(),
            'inquiry' => $inquiry,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'income_date' => 'required|date',
            'amount' => 'required|numeric|min:0',
            'currency' => 'nullable|string|size:3',
            'invoice_issued' => 'boolean',
            'performance_type_id' => 'nullable|exists:performance_types,id',
            'contact_person' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'inquiry_id' => 'nullable|exists:inquiries,id',
        ]);

        $validated['created_by'] = auth()->id();
        $validated['currency'] = $validated['currency'] ?? 'EUR';

        Income::create($validated);

        return redirect()->route('income.index')
            ->with('success', 'Income created successfully.');
    }

    public function show(Income $income)
    {
        $income->load(['performanceType', 'inquiry', 'creator', 'distributions.recipientUser']);

        $bandMembers = User::where('is_band_member', true)->get();

        return Inertia::render('Income/Show', [
            'income' => $income,
            'bandMembers' => $bandMembers,
            'totalDistributed' => $income->getTotalDistributedAttribute(),
            'remaining' => $income->getRemainingAttribute(),
        ]);
    }

    public function storeDistribution(Request $request, Income $income)
    {
        $validated = $request->validate([
            'distributions' => 'required|array',
            'distributions.*.recipient_type' => 'required|in:user,mutual_fund',
            'distributions.*.recipient_user_id' => 'nullable|exists:users,id',
            'distributions.*.amount' => 'required|numeric|min:0',
            'distributions.*.note' => 'nullable|string',
        ]);

        DB::transaction(function () use ($income, $validated) {
            // Delete existing distributions
            $income->distributions()->delete();

            // Create new distributions
            foreach ($validated['distributions'] as $distribution) {
                IncomeDistribution::create([
                    'income_id' => $income->id,
                    'recipient_type' => $distribution['recipient_type'],
                    'recipient_user_id' => $distribution['recipient_user_id'] ?? null,
                    'amount' => $distribution['amount'],
                    'note' => $distribution['note'] ?? null,
                ]);
            }
        });

        return back()->with('success', 'Distribution updated successfully.');
    }
}
```

---

## PART 3: GROUP COSTS

### STEP 6: Complete GroupCost Model

**File:** `app/Models/GroupCost.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class GroupCost extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'cost_date',
        'cost_type_id',
        'amount',
        'currency',
        'is_paid',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'cost_date' => 'date',
        'amount' => 'decimal:2',
        'is_paid' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($cost) {
            if (empty($cost->cost_date)) {
                $cost->cost_date = now()->toDateString();
            }
        });
    }

    public function costType(): BelongsTo
    {
        return $this->belongsTo(CostType::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
```

### STEP 7: Create GroupCostController

**File:** `app/Http/Controllers/GroupCostController.php`

```php
<?php

namespace App\Http\Controllers;

use App\Models\CostType;
use App\Models\GroupCost;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GroupCostController extends Controller
{
    public function index(Request $request)
    {
        $query = GroupCost::with(['costType', 'creator'])
            ->orderBy('cost_date', 'desc');

        if ($request->has('date_from')) {
            $query->where('cost_date', '>=', $request->date_from);
        }
        
        if ($request->has('date_to')) {
            $query->where('cost_date', '<=', $request->date_to);
        }

        return Inertia::render('GroupCosts/Index', [
            'costs' => $query->paginate(20)->withQueryString(),
            'filters' => $request->only(['date_from', 'date_to']),
        ]);
    }

    public function create()
    {
        return Inertia::render('GroupCosts/Create', [
            'costTypes' => CostType::where('is_active', true)->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'cost_date' => 'required|date',
            'cost_type_id' => 'nullable|exists:cost_types,id',
            'cost_type_name' => 'nullable|string|max:255', // For quick-add
            'amount' => 'required|numeric|min:0',
            'currency' => 'nullable|string|size:3',
            'is_paid' => 'boolean',
            'notes' => 'nullable|string',
        ]);

        // Quick-add cost type if provided
        if (!empty($validated['cost_type_name']) && empty($validated['cost_type_id'])) {
            $costType = CostType::firstOrCreate([
                'name' => $validated['cost_type_name']
            ]);
            $validated['cost_type_id'] = $costType->id;
        }

        unset($validated['cost_type_name']);

        $validated['created_by'] = auth()->id();
        $validated['currency'] = $validated['currency'] ?? 'EUR';

        GroupCost::create($validated);

        return redirect()->route('group-costs.index')
            ->with('success', 'Group cost created successfully.');
    }

    public function update(Request $request, GroupCost $groupCost)
    {
        $validated = $request->validate([
            'cost_date' => 'required|date',
            'cost_type_id' => 'nullable|exists:cost_types,id',
            'amount' => 'required|numeric|min:0',
            'currency' => 'nullable|string|size:3',
            'is_paid' => 'boolean',
            'notes' => 'nullable|string',
        ]);

        $groupCost->update($validated);

        return redirect()->route('group-costs.index')
            ->with('success', 'Group cost updated successfully.');
    }

    public function destroy(GroupCost $groupCost)
    {
        $groupCost->delete();

        return redirect()->route('group-costs.index')
            ->with('success', 'Group cost deleted successfully.');
    }
}
```

---

## PART 4: DASHBOARDS

### STEP 8: Create DashboardController

**File:** `app/Http/Controllers/DashboardController.php`

```php
<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\GroupCost;
use App\Models\Income;
use App\Models\IncomeDistribution;
use App\Models\Inquiry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $dateFrom = $request->input('date_from', now()->startOfYear()->toDateString());
        $dateTo = $request->input('date_to', now()->endOfYear()->toDateString());

        // Inquiry stats
        $inquiryStats = [
            'total' => Inquiry::whereBetween('performance_date', [$dateFrom, $dateTo])->count(),
            'confirmed' => Inquiry::whereBetween('performance_date', [$dateFrom, $dateTo])->where('status', 'confirmed')->count(),
            'pending' => Inquiry::whereBetween('performance_date', [$dateFrom, $dateTo])->where('status', 'pending')->count(),
            'rejected' => Inquiry::whereBetween('performance_date', [$dateFrom, $dateTo])->where('status', 'rejected')->count(),
            'total_value' => Inquiry::whereBetween('performance_date', [$dateFrom, $dateTo])->sum('price_amount'),
            'confirmed_value' => Inquiry::whereBetween('performance_date', [$dateFrom, $dateTo])->where('status', 'confirmed')->sum('price_amount'),
            'pending_value' => Inquiry::whereBetween('performance_date', [$dateFrom, $dateTo])->where('status', 'pending')->sum('price_amount'),
        ];

        // Income stats
        $incomeStats = [
            'total' => Income::whereBetween('income_date', [$dateFrom, $dateTo])->sum('amount'),
            'with_invoice' => Income::whereBetween('income_date', [$dateFrom, $dateTo])->where('invoice_issued', true)->sum('amount'),
            'without_invoice' => Income::whereBetween('income_date', [$dateFrom, $dateTo])->where('invoice_issued', false)->sum('amount'),
        ];

        // Expense stats
        $expenseStats = [
            'total' => Expense::whereBetween('invoice_date', [$dateFrom, $dateTo])->sum('amount'),
            'count' => Expense::whereBetween('invoice_date', [$dateFrom, $dateTo])->count(),
        ];

        // Mutual fund calculations
        $mutualFundInflow = IncomeDistribution::where('recipient_type', 'mutual_fund')
            ->whereHas('income', function($q) use ($dateFrom, $dateTo) {
                $q->whereBetween('income_date', [$dateFrom, $dateTo]);
            })
            ->sum('amount');

        $groupCostsTotal = GroupCost::whereBetween('cost_date', [$dateFrom, $dateTo])
            ->where('is_paid', true)
            ->sum('amount');

        $mutualFundBalance = $mutualFundInflow - $groupCostsTotal;

        return Inertia::render('Dashboard', [
            'inquiryStats' => $inquiryStats,
            'incomeStats' => $incomeStats,
            'expenseStats' => $expenseStats,
            'mutualFundInflow' => $mutualFundInflow,
            'groupCostsTotal' => $groupCostsTotal,
            'mutualFundBalance' => $mutualFundBalance,
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ]);
    }

    public function userDashboard(Request $request)
    {
        $user = auth()->user();

        $dateFrom = $request->input('date_from', now()->startOfYear()->toDateString());
        $dateTo = $request->input('date_to', now()->endOfYear()->toDateString());

        // Calculate user's total received
        $totalReceived = IncomeDistribution::where('recipient_type', 'user')
            ->where('recipient_user_id', $user->id)
            ->whereHas('income', function($q) use ($dateFrom, $dateTo) {
                $q->whereBetween('income_date', [$dateFrom, $dateTo]);
            })
            ->sum('amount');

        // Monthly breakdown
        $monthlyBreakdown = IncomeDistribution::select(
                DB::raw('DATE_FORMAT(incomes.income_date, "%Y-%m") as month'),
                DB::raw('SUM(income_distributions.amount) as total')
            )
            ->join('incomes', 'incomes.id', '=', 'income_distributions.income_id')
            ->where('income_distributions.recipient_type', 'user')
            ->where('income_distributions.recipient_user_id', $user->id)
            ->whereBetween('incomes.income_date', [$dateFrom, $dateTo])
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return Inertia::render('Dashboard/User', [
            'totalReceived' => $totalReceived,
            'monthlyBreakdown' => $monthlyBreakdown,
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ]);
    }
}
```

---

## STEP 9: Add Routes

**File:** `routes/web.php`

Add before `require __DIR__.'/auth.php';`:

```php
// Update dashboard route
Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::get('/dashboard/user', [\App\Http\Controllers\DashboardController::class, 'userDashboard'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard.user');

// Expenses
Route::middleware(['auth', 'permission:expenses.view'])->group(function () {
    Route::resource('expenses', \App\Http\Controllers\ExpenseController::class);
});

// Income
Route::middleware(['auth', 'permission:income.view'])->group(function () {
    Route::resource('income', \App\Http\Controllers\IncomeController::class);
    Route::post('income/{income}/distribute', [\App\Http\Controllers\IncomeController::class, 'storeDistribution'])
        ->name('income.distribute')
        ->middleware('permission:income.distribute');
});

// Group Costs
Route::middleware(['auth', 'permission:group_costs.view'])->group(function () {
    Route::resource('group-costs', \App\Http\Controllers\GroupCostController::class);
});
```

---

## STEP 10: Create React Pages

You need to create these pages (simplified structure):

1. **Expenses:**
   - `resources/js/Pages/Expenses/Index.tsx` - List with upload button
   - `resources/js/Pages/Expenses/Create.tsx` - Form with file upload (`<input type="file" accept="image/*,application/pdf" capture="environment">`)

2. **Income:**
   - `resources/js/Pages/Income/Index.tsx` - List with link to inquiry
   - `resources/js/Pages/Income/Create.tsx` - Form (prefill from inquiry if provided)
   - `resources/js/Pages/Income/Show.tsx` - Detail with distribution form

3. **Group Costs:**
   - `resources/js/Pages/GroupCosts/Index.tsx` - List
   - `resources/js/Pages/GroupCosts/Create.tsx` - Form with quick-add cost type

4. **Dashboard:**
   - Update `resources/js/Pages/Dashboard.tsx` - Main dashboard with stats cards
   - `resources/js/Pages/Dashboard/User.tsx` - User-specific dashboard

---

## STEP 11: File Upload Handling

For mobile camera capture, use:

```tsx
<input
    type="file"
    accept="image/*,application/pdf"
    capture="environment" // Opens camera on mobile
    onChange={(e) => {
        const file = e.target.files?.[0];
        // Handle file
    }}
/>
```

---

## STEP 12: Income Distribution UI

On the Income Show page, create a form like:

```tsx
const [distributions, setDistributions] = useState([
    ...bandMembers.map(member => ({
        recipient_type: 'user',
        recipient_user_id: member.id,
        amount: 0,
        note: '',
    })),
    {
        recipient_type: 'mutual_fund',
        recipient_user_id: null,
        amount: 0,
        note: 'Mutual Fund',
    },
]);

// Show remaining: income.amount - sum(distributions.amount)
// Validate total equals income amount before submit
```

---

## STEP 13: Test

1. Create an expense with file upload
2. Mark an inquiry as paid → creates income
3. Distribute income to band members + mutual fund
4. Add group costs
5. View dashboard with calculations
6. Check user dashboard

---

## Next Steps

- Move to `03-CONTRACTS-MODULE.md`
- Add proper validation
- Implement mobile-responsive forms
- Add charts to dashboard
- Add export functionality

---

## Troubleshooting

**File upload not working?**
- Check `php.ini`: `upload_max_filesize` and `post_max_size`
- Verify storage directory is writable: `php artisan storage:link`

**Distributions not summing correctly?**
- Check decimal precision in validation
- Use `bcmath` for precise calculations

**Dashboard showing 0?**
- Check date range filters
- Verify data exists in range
- Check timezone conversions

