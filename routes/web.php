<?php

use Illuminate\Support\Facades\Route;

//Handle all react-router
Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '.*');
