<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Searchable;
use Ramsey\Uuid\Uuid;

class Order extends Model
{
	use HasFactory, HasUuids, Searchable;
	protected $table = 'orders';
	protected $guarded = [];

	public function newUniqueId(): string
	{
		return (string) 'ORD' . Uuid::uuid4();
	}
	public function uniqueIds(): array
	{
		return ['order_code'];
	}

	public function buyer()
	{
		return $this->belongsTo(User::class, 'user_id');
	}
	public function payment()
	{
		return $this->hasOne(Payment::class, 'order_id');
	}
	public function orderDetails()
	{
		return $this->hasMany(OrderDetail::class, 'order_id');
	}
	public function deliveryDetail()
	{
		return $this->hasOne(DeliveryDetail::class, 'order_id');
	}
	public function toSearchableArray()
	{
		return [
			'order_code' => $this->order_code,
			'name' => $this->name,
			'whatsaap' => $this->whatsaap,
			'telephone' => $this->telephone,
		];
	}
}
