<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ForecastingMethod extends Model
{
	use HasFactory;
	protected $table = 'forecasting_methods';
	protected $guarded = [];

	public function products()
	{
		return $this->belongsToMany(Product::class, 'forecasting_method_product', 'forecasting_method_id', 'product_id');
	}
}
