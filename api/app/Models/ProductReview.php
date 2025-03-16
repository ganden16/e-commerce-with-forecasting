<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductReview extends Model
{
	use HasFactory;
	protected $table = 'product_reviews';
	protected $guarded = [];

	public function reviewer()
	{
		return $this->belongsTo(User::class, 'reviewer');
	}
	public function replyBy()
	{
		return $this->belongsTo(User::class, 'reply_by');
	}
	public function product()
	{
		return $this->belongsTo(Product::class, 'product_id');
	}
	public function order()
	{
		return $this->belongsTo(Order::class, 'order_id');
	}
}
