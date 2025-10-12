<?php

namespace App\Models\Access;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class AccessModule extends Model
{
    public function user_access(): HasOne
    {
        return $this->hasOne(Access::class, 'module_id', 'id');
    }
}
