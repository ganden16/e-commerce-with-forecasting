<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Searchable;

class Product extends Model
{
	use HasFactory, Searchable;
	protected $table = 'products';
	protected $guarded = [];

	public function trainTest()
	{
		 return $this->hasOne(TrainTestData::class, 'product_id');
	}

	public function bestForecastingMethod()
	{
		return $this->belongsToMany(ForecastingMethod::class, 'forecasting_method_product', 'product_id', 'forecasting_method_id');
	}

	public function category()
	{
		return $this->belongsTo(Category::class);
	}

	public function orderDetails()
	{
		return $this->hasMany(OrderDetail::class, 'product_id');
	}

	public function toSearchableArray()
	{
		return [
			'name' => $this->name,
			'description' => $this->description,
			'other_detail' => $this->other_detail,
		];
	}
}
