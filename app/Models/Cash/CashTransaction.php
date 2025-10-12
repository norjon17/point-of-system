<?php

namespace App\Models\Cash;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CashTransaction extends Model
{
    protected $fillable = [
        "type_id",
        "user_id",
        "details",
        'name',
        'created_at',
        'updated_at',
        'gcash_ref'
    ];
    protected $casts = [
        "type_id" => 'integer',
        "user_id" => 'integer',
        'id' => 'integer',
    ];

    protected $appends = ['amount', 'last_transaction'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
    public function type(): BelongsTo
    {
        return $this->belongsTo(CashTransactionType::class);
    }

    public function denominations(): HasMany
    {
        return $this->hasMany(CashDenomination::class, 'ct_id', 'id');
    }

    // Define the accessor for amount
    public function getAmountAttribute()
    {
        return $this->denominations->sum(fn($data) => $data->denomination * $data->quantity);
    }

    public function getLastTransactionAttribute()
    {
        return $this->created_at->diffForHumans();
    }
}
