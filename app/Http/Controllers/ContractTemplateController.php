<?php

namespace App\Http\Controllers;

use App\Models\ContractTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ContractTemplateController extends Controller
{
    public function index()
    {
        $templates = ContractTemplate::orderBy('is_active', 'desc')
            ->orderBy('updated_at', 'desc')
            ->get();

        return Inertia::render('ContractTemplates/Index', [
            'templates' => $templates,
        ]);
    }

    public function create()
    {
        return Inertia::render('ContractTemplates/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'markdown' => 'required|string',
            'is_active' => 'boolean',
        ]);

        // If this template is marked as active, deactivate all others
        if ($validated['is_active'] ?? false) {
            DB::transaction(function () use ($validated) {
                ContractTemplate::where('is_active', true)->update(['is_active' => false]);
                ContractTemplate::create($validated);
            });
        } else {
            ContractTemplate::create($validated);
        }

        return redirect()->route('contract-templates.index')
            ->with('success', 'Template created successfully.');
    }

    public function edit(ContractTemplate $contractTemplate)
    {
        return Inertia::render('ContractTemplates/Edit', [
            'template' => $contractTemplate,
        ]);
    }

    public function update(Request $request, ContractTemplate $contractTemplate)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'markdown' => 'required|string',
        ]);

        $contractTemplate->update($validated);

        return redirect()->route('contract-templates.index')
            ->with('success', 'Template updated successfully.');
    }

    public function activate(ContractTemplate $contractTemplate)
    {
        DB::transaction(function () use ($contractTemplate) {
            // Deactivate all templates
            ContractTemplate::where('is_active', true)->update(['is_active' => false]);
            
            // Activate the selected template
            $contractTemplate->update(['is_active' => true]);
        });

        return back()->with('success', 'Template activated successfully.');
    }

    public function destroy(ContractTemplate $contractTemplate)
    {
        // Check if this is the last template
        $templateCount = ContractTemplate::count();
        
        if ($templateCount <= 1) {
            return back()->with('error', 'Cannot delete the last template. At least one template must exist.');
        }

        // If deleting the active template, activate another one
        if ($contractTemplate->is_active) {
            DB::transaction(function () use ($contractTemplate) {
                $contractTemplate->delete();
                
                // Activate the most recently updated remaining template
                $nextTemplate = ContractTemplate::orderBy('updated_at', 'desc')->first();
                if ($nextTemplate) {
                    $nextTemplate->update(['is_active' => true]);
                }
            });
        } else {
            $contractTemplate->delete();
        }

        return redirect()->route('contract-templates.index')
            ->with('success', 'Template deleted successfully.');
    }
}
