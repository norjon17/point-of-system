<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Models\Access\Access;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'username',
        'access_id',
        'active'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
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
            'access_id' => 'integer',
            'active' => 'integer'
        ];
    }

    public function access_admin(): HasOne
    {
        return $this->hasOne(Access::class, 'user_id', 'id')
            ->where([
                'module_id' => 1, //admin
            ]);
    }
    public function access_admin_access_update(): HasOne
    {
        return $this->hasOne(Access::class, 'user_id', 'id')
            ->where([
                'module_id' => 2, //admin_access
            ]);
    }

    public function access_cashier(): HasOne
    {
        return $this->hasOne(Access::class, 'user_id', 'id')
            ->where([
                'module_id' => 3 //cashier
            ]);
    }
    public function access_cashier_in(): HasOne
    {
        return $this->hasOne(Access::class, 'user_id', 'id')
            ->where([
                'module_id' => 4//cashier_in
            ]);
    }
    public function access_cashier_out(): HasOne
    {
        return $this->hasOne(Access::class, 'user_id', 'id')
            ->where([
                'module_id' => 5//cashier_out
            ]);
    }
    public function access_cashier_turnover(): HasOne
    {
        return $this->hasOne(Access::class, 'user_id', 'id')
            ->where([
                'module_id' => 6//cashier_turnover
            ]);
    }
    public function access_cashier_turnover_logs(): HasOne
    {
        return $this->hasOne(Access::class, 'user_id', 'id')
            ->where([
                'module_id' => 7//cashier_turnover_logs
            ]);
    }

    //------------------PRODUCTS
    public function access_products(): HasOne
    {
        return $this->hasOne(Access::class, 'user_id', 'id')
            ->where([
                'module_id' => 8//products
            ]);
    }
    public function access_products_receive(): HasOne
    {
        return $this->hasOne(Access::class, 'user_id', 'id')
            ->where([
                'module_id' => 9//products_receive
            ]);
    }

    //--------------------------SALES
    public function access_sales(): HasOne
    {
        return $this->hasOne(Access::class, 'user_id', 'id')
            ->where([
                'module_id' => 10//sales
            ]);
    }
    public function access_sales_insert(): HasOne
    {
        return $this->hasOne(Access::class, 'user_id', 'id')
            ->where([
                'module_id' => 11//sales_insert
            ]);
    }
    public function access_sales_lists(): HasOne
    {
        return $this->hasOne(Access::class, 'user_id', 'id')
            ->where([
                'module_id' => 12//sales_list
            ]);
    }

    //----------------------------------RECEIVABLE
    public function access_receivables(): HasOne
    {
        return $this->hasOne(Access::class, 'user_id', 'id')
            ->where([
                'module_id' => 13//receivable
            ]);
    }

    //---------------------------------PAYABLES
    public function access_payables(): HasOne
    {
        return $this->hasOne(Access::class, 'user_id', 'id')
            ->where([
                'module_id' => 14//payables
            ]);
    }
    public function access_payables_update_details(): HasOne
    {
        return $this->hasOne(Access::class, 'user_id', 'id')
            ->where([
                'module_id' => 15//payables_update_details
            ]);
    }
}
