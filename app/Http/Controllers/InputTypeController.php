<?php

namespace App\Http\Controllers;

use App\Models\InputType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InputTypeController extends Controller
{
    public function index()
    {
        return Inertia::render('ManageInputType', [
            'inputTypes' => InputType::all()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|unique:input_types,name',
            'formula' => 'required',
            'example' => 'required',
        ]);

        InputType::create($request->all());
        return redirect()->route('input-types.index')->with('success', 'Tipe Input berhasil ditambahkan.');
    }

    public function update(Request $request, InputType $inputType)
    {
        $request->validate([
            'name' => 'required|unique:input_types,name,' . $inputType->id,
            'formula' => 'required',
            'example' => 'required',
        ]);

        $inputType->update($request->all());
        return redirect()->route('input-types.index')->with('success', 'Tipe Input berhasil diperbarui.');
    }

    public function destroy(InputType $inputType)
    {
        $inputType->delete();
        return redirect()->route('input-types.index')->with('success', 'Tipe Input berhasil dihapus.');
    }
}