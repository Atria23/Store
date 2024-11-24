<?php

// namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
// use Illuminate\Notifications\Notifiable;
// use Illuminate\Database\Eloquent\Casts\Attribute;
// use Illuminate\Database\Eloquent\Factories\HasFactory;
// use Illuminate\Foundation\Auth\User as Authenticatable;
// use Spatie\Permission\Traits\HasRoles;
// use Illuminate\Database\Eloquent\Relations\HasMany;


// class User extends Authenticatable implements MustVerifyEmail
// {
//     use HasFactory, HasRoles, Notifiable;

//     /**
//      * The attributes that are mass assignable.
//      *
//      * @var array<int, string>
//      */
//     protected $fillable = [
//         'name',
//         'email',
//         'password',
//         'avatar',
//         'username',
//         'phone_number',
//         'profile_image',
//         'pin',
//         'saldo',
//         'membership_status',
//         'points',
//         'referral_code',
//     ];

//     /**
//      * The attributes that should be hidden for serialization.
//      *
//      * @var array<int, string>
//      */
//     protected $hidden = [
//         'password',
//         'pin',
//         'remember_token',
//     ];

//     /**
//      * Get the attributes that should be cast.
//      *
//      * @return array<string, string>
//      */
//     protected function casts(): array
//     {
//         return [
//             'email_verified_at' => 'datetime',
//             'password' => 'hashed',
//         ];
//     }

//     /**
//      * Accessor for the avatar.
//      */
//     protected function avatar(): Attribute
//     {
//         return Attribute::make(
//             get: fn ($value) => $value != null ? asset('/storage/avatars/' . $value) : asset('avatar.png'),
//         );
//     }

//     /**
//      * Accessor for the profile_image.
//      */
//     protected function profileImage(): Attribute
//     {
//         return Attribute::make(
//             get: fn ($value) => $value != null ? asset('/storage/profile_images/' . $value) : asset('default-profile.png'),
//         );
//     }

//     /**
//      * Get all permissions for the user.
//      */
//     public function getPermissions()
//     {
//         return $this->getAllPermissions()->mapWithKeys(function ($permission) {
//             return [
//                 $permission['name'] => true,
//             ];
//         });
//     }

//     /**
//      * Check if the user is a super admin.
//      */
//     public function isSuperAdmin()
//     {
//         return $this->hasRole('super-admin');
//     }
// }




















namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Database\Eloquent\Relations\HasMany;


class User extends Authenticatable implements MustVerifyEmail
{
    use HasFactory, HasRoles, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'avatar',
        'username',
        'phone_number',
        'profile_image',
        'pin',
        'saldo',
        'membership_status',
        'points',
        'referral_code',
    ];

    // Relasi ke deposit
    public function deposits()
    {
        return $this->hasMany(Deposit::class);
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'pin',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Accessor for the avatar.
     */
    protected function avatar(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => $value != null ? asset('/storage/avatars/' . $value) : asset('avatar.png'),
        );
    }

    /**
     * Accessor for the profile_image.
     */
    protected function profileImage(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => $value != null ? asset('/storage/profile_images/' . $value) : asset('default-profile.png'),
        );
    }

    /**
     * Get all permissions for the user.
     */
    public function getPermissions()
    {
        return $this->getAllPermissions()->mapWithKeys(function ($permission) {
            return [
                $permission['name'] => true,
            ];
        });
    }

    /**
     * Check if the user is a super admin.
     */
    public function isSuperAdmin()
    {
        return $this->hasRole('super-admin');
    }
}
