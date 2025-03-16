<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TrainTestData extends Model
{
	use HasFactory;
	protected $table = 'train_test_data';
	protected $guarded = [];

	public function product()
	{
		return $this->belongsTo(Product::class, 'product_id');
	}
}
