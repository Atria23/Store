<?php
namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\User\Affiliator;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'referral_code' => 'required|exists:affiliators,referral_code'
        ]);

        // Buat user baru
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Assign role 'user'
        $user->assignRole('user');

        // Langsung daftarkan jadi affiliator
        $affiliator = new Affiliator();
        $affiliator->user_id = $user->id;
        $affiliator->referral_code = null; // Bisa kamu sesuaikan logikanya

        // Kalau input kode referral teman valid, ambil affiliator id-nya
        if ($request->filled('referral_code')) {
            $parent = Affiliator::where('referral_code', $request->referral_code)->first();
            if ($parent) {
                $affiliator->affiliate_by = $parent->id;
            }
        }    

        $affiliator->save();

        event(new Registered($user));
        Auth::login($user);

        return redirect(route('verification.notice', absolute: false));
    }
}
