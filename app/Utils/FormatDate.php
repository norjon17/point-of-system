<?php

namespace App\Utils;
use Carbon\Carbon;

class FormatDate
{

  public static function formatDateTime($value)
  {

    if (!$value || empty($value)) {
      return null;
    }
    // Assuming $value is your date string
    $date = Carbon::parse($value); // Parse the date string into a Carbon object

    // Set the timezone
    $date->setTimezone(config('app.timezone')); // Now this will work because $date is a Carbon object

    // Format the date to a string for output
    $formattedDate = $date->format('Y-m-d H:i');

    return $formattedDate;
  }

  public static function formatDateLong($value)
  {

    if (!$value || empty($value)) {
      return null;
    }
    // Assuming $value is your date string
    $date = Carbon::parse($value); // Parse the date string into a Carbon object

    // Set the timezone
    $date->setTimezone(config('app.timezone')); // Now this will work because $date is a Carbon object

    // Format the date to a string for output
    $formattedDate = $date->format('l, F d, Y');

    return $formattedDate;
  }
  public static function formatDateTimeLong($value)
  {

    if (!$value || empty($value)) {
      return null;
    }
    // Assuming $value is your date string
    $date = Carbon::parse($value); // Parse the date string into a Carbon object

    // Set the timezone
    $date->setTimezone(config('app.timezone')); // Now this will work because $date is a Carbon object

    // Format the date to a string for output
    $formattedDate = $date->format('l, F d, Y H:i');

    return $formattedDate;
  }
  public static function formatDate($value)
  {
    if (!$value || empty($value)) {
      return null;
    }
    // Assuming $value is your date string
    $date = Carbon::parse($value); // Parse the date string into a Carbon object

    // Set the timezone
    $date->setTimezone(config('app.timezone')); // Now this will work because $date is a Carbon object

    // Format the date to a string for output
    $formattedDate = $date->format('Y-m-d');

    return $formattedDate;
  }

  public static function setTime($value, $hour, $minute, $second)
  {

    if (!$value || empty($value)) {
      return null;
    }
    // Assuming $value is your date string
    $date = Carbon::parse($value); // Parse the date string into a Carbon object

    // Set the timezone
    $date->setTimezone(config('app.timezone')); // Now this will work because $date is a Carbon object

    // Format the date to a string for output
    $formattedDate = $date->setTime($hour, $minute, $second)->format('Y-m-d H:i:s');

    return $formattedDate;
  }
  public static function setTimeFrom($value, $now)
  {

    if (!$value || empty($value)) {
      return null;
    }
    // Assuming $value is your date string
    $date = Carbon::parse($value); // Parse the date string into a Carbon object

    // Set the timezone
    $date->setTimezone(config('app.timezone')); // Now this will work because $date is a Carbon object

    // Format the date to a string for output
    $formattedDate = $date->setTimeFrom($now)->format('Y-m-d H:i:s');

    return $formattedDate;
  }
  public static function timeNow()
  {

    // Use Carbon to get the current time
    $now = Carbon::now();

    // Set the timezone to the application's configured timezone
    $now->setTimezone(config('app.timezone'));

    // Return the properly formatted datetime string
    return $now->format('Y-m-d H:i:s');
  }

}