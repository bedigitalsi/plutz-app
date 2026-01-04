<?php

namespace App\Http\Controllers;

use App\Models\Attachment;
use App\Models\Expense;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ExpenseController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Expense::with(['creator', 'attachments'])
            ->orderBy('invoice_date', 'desc');

        if ($request->has('date_from')) {
            $query->where('invoice_date', '>=', $request->date_from);
        }
        
        if ($request->has('date_to')) {
            $query->where('invoice_date', '<=', $request->date_to);
        }

        if ($request->has('company') && $request->company !== '') {
            $query->where('company_name', 'like', '%' . $request->company . '%');
        }

        return Inertia::render('Expenses/Index', [
            'expenses' => $query->paginate(20)->withQueryString(),
            'filters' => $request->only(['date_from', 'date_to', 'company']),
        ]);
    }

    public function create(): Response
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

        $validated['created_by'] = Auth::id();
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
                'created_by' => Auth::id(),
            ]);
        }

        return Redirect::route('expenses.show', $expense->id)
            ->with('success', 'Expense created successfully.');
    }

    public function show(Expense $expense): Response
    {
        $expense->load(['creator', 'attachments']);

        return Inertia::render('Expenses/Show', [
            'expense' => $expense,
        ]);
    }

    public function destroy(Expense $expense)
    {
        $expense->delete();

        return Redirect::route('expenses.index')
            ->with('success', 'Expense deleted successfully.');
    }
}
