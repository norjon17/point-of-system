<?php

namespace App\Utils;

use Illuminate\Support\Facades\Log;

class SystemLogging
{
  public static function error($title, $fnc, $th)
  {
    Log::error($title, ['message' => "Error Function Ref: $fnc", 'error_message' => $th->getMessage(), 'file' => $th->getFile(), 'line' => $th->getLine()]);
  }
}