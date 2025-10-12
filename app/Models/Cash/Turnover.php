<?php

namespace App\Models\Cash;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Turnover extends Model
{
    protected $fillable = [
        "turnover_from_id",
        "acceptedby_id",
    ];
    protected $casts = [
        "turnover_from_id" => 'integer',
        "acceptedby_id" => 'integer',
    ];

    protected $appends = ['amount'];

    public function turnover_from(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
    public function accepted_by(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function denominations(): HasMany
    {
        return $this->hasMany(TurnoverDenomination::class, 'turnover_id', 'id');
    }

    // Define the accessor for amount
    public function getAmountAttribute()
    {
        return $this->denominations->sum(fn($data) => $data->denomination * $data->quantity);
    }
}
