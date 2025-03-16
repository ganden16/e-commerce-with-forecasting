<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DeliveryDetail extends Model
{
	use HasFactory;
	protected $table = 'delivery_details';
	protected $guarded = [];

	public function order()
	{
		return $this->belongsTo(Order::class, 'order_id');
	}
	// public function province()
	// {
	// 	return $this->belongsTo(Province::class, 'province_id');
	// }
	// public function city()
	// {
	// 	return $this->belongsTo(City::class, 'city_id');
	// }
}
