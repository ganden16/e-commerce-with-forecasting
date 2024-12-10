<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductQna extends Model
{
	use HasFactory;
	protected $table = 'product_qna';
	protected $guarded = [];

	public function product()
	{
		return $this->belongsTo(Product::class);
	}
	public function answered()
	{
		return $this->belongsTo(User::class, 'answered');
	}
	public function questioner()
	{
		return $this->belongsTo(User::class, 'questioner');
	}
}
