<?php

namespace App\Models\Access;

use Illuminate\Database\Eloquent\Model;

class Access extends Model
{
    protected $fillable = [
        "user_id",
        "module_id",
        "create",
        "read",
        "update",
        "delete",
    ];

    protected $casts = [
        "user_id" => 'integer',
        "module_id" => 'integer',
        "create" => 'integer',
        "read" => 'integer',
        "update" => 'integer',
        "delete" => 'integer',
    ];
}
