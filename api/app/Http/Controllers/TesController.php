<?php

namespace App\Http\Controllers;

use App\Mail\invoiceEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class TesController extends Controller
{
	public function index()
	{
		Mail::to('admin@faycook.my.id')->send(new invoiceEmail());
		return 'hahaha';
	}
}
