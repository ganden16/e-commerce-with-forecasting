<?php

use App\Http\Controllers\TesController;
use App\Mail\invoiceEmail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
	return view('welcome');
});

Route::get('/email', [TesController::class, 'index']);
