<?php

namespace App\Utils;

class GetErrorValidator
{
  public static function getError(object $errors): string|null
  {
    $errorMessage = '';

    foreach ($errors->all() as $message) {
      $errorMessage .= $message . ' ';
    }

    return empty($errorMessage) ? null : $errorMessage;
  }
}
