<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\ProductReview;
use App\Models\User;

class DashboardController extends Controller
{
	public function index()
	{
		$totalPayment = Payment::where('status', 'settlement')->sum('amount');
		$totalOmzet = Order::whereIn('status', ['completed', 'shipped', 'processing'])->join('order_details', 'orders.id', '=', 'order_details.order_id')
			->selectRaw('SUM(order_details.price * order_details.quantity) + (COUNT(DISTINCT orders.id) * 1000) as total_omzet')
			->value('total_omzet');
		$totalReview = ProductReview::count();
		$totalSales = Product::sum('total_sales');

		$recentOrders = Order::query()->whereIn('status', ['processing', 'shipped'])
			->with('buyer', 'payment', 'orderDetails.product', 'deliveryDetail')
			->orderBy('created_at', 'desc')
			->limit(10)
			->get();

		$recentUsers = User::where('is_admin', false)
			->orderBy('created_at', 'desc')
			->limit(10)
			->get();

		$recentReviews = ProductReview::orderBy('created_at', 'desc')->with('reviewer', 'product', 'replyBy', 'order')
			->limit(15)
			->get();

		// $completedOrders = Order::where('status', 'completed')
		// 	->orderBy('updated_at', 'desc')->with('buyer', 'payment', 'orderDetails.product', 'deliveryDetail')
		// 	->get();

		$statistic = [
			['name' => 'Total Pembayaran', 'value' => $totalPayment],
			['name' => 'Omzet', 'value' => $totalOmzet],
			['name' => 'Total Review', 'value' => $totalReview],
			['name' => 'Produk Terjual', 'value' => $totalSales],
		];

		return response()->json([
			'statistic' => $statistic,
			'recent_orders' => $recentOrders,
			'recent_users' => $recentUsers,
			'recent_reviews' => $recentReviews,
			// 'completed_orders' => $completedOrders,
		], 200);
	}
}
