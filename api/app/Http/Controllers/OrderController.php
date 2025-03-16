<?php

namespace App\Http\Controllers;

use App\Helper\Format;
use App\Helper\WhatsappMessage;
use App\Jobs\SendWhatsaap;
use App\Models\Cart;
use App\Models\Order;
use App\Models\Payment;
use App\Models\DeliveryDetail;
use App\Models\OrderDetail;
use App\Models\Product;
use App\Models\ProductReview;
use Exception;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Midtrans\Config;
use Midtrans\Snap;
use Midtrans\Transaction;

class OrderController extends Controller
{
	public function __construct()
	{
		Config::$serverKey = config('midtrans.server_key');
		Config::$isProduction = config('midtrans.is_production', false);
		Config::$isSanitized = config('midtrans.is_sanitized', true);
		Config::$is3ds = config('midtrans.is_3ds', true);
	}

	public function getOrders(Request $request)
	{
		$search = $request->query('search');
		$query = Order::search($search);
		$status = $request->query('status');

		$orders = $query->query(function ($builder) {
			$builder->with('buyer', 'payment', 'orderDetails.product', 'deliveryDetail')
				->orderBy('updated_at', 'desc');
		});

		// $allowedStatuses = ['processing', 'shipped', 'cancelled'];
		// if ($status && !in_array($status, $allowedStatuses)) {
		// 	return response()->json(['error' => 'Invalid status'], 400);
		// }

		if ($status) {
			$orders->where('status', $status);
		}

		if ($orders->get()->count() <= 0) {
			return response()->json([
				'message' => 'orderan tidak ditemukan'
			], 404);
		}

		return response()->json($orders->get(), 200);
	}

	public function getOrderByProduct(Request $request, $productId)
	{
		$penjualanProduct = OrderDetail::query()
			->join('orders', 'order_details.order_id', '=', 'orders.id')
			->where('order_details.product_id', $productId)
			->where('orders.status', 'completed')
			->select(
				'order_details.product_id',
				DB::raw('COUNT(order_details.order_id) as total_orders'),
				DB::raw('SUM(order_details.quantity) as total_quantity_sold'),
				DB::raw('SUM(order_details.quantity * order_details.price) as total_revenue')
			)
			->groupBy('order_details.product_id')
			->first();

		if (!$penjualanProduct) {
			return response()->json(['message' => 'Produk tidak ditemukan atau tidak ada penjualan'], 404);
		}

		$product = Product::find($productId);

		$orders = Order::whereIn('id', function ($query) use ($productId) {
			$query->select('order_id')
				->from('order_details')
				->where('product_id', $productId)
				->where('status', 'completed');
		})->orderBy('updated_at', 'desc')->get();

		$totalReviews = ProductReview::where('product_id', $productId)->count();

		$response = [
			'product_id' => $penjualanProduct->product_id,
			'total_orders' => $penjualanProduct->total_orders,
			'total_quantity_sold' => $penjualanProduct->total_quantity_sold,
			'total_revenue' => $penjualanProduct->total_revenue,
			'product' => $product->load('category'),
			'orders' => $orders->load('payment', 'deliveryDetail'),
			'total_reviews' => $totalReviews,
		];

		return response()->json($response, 200);
	}

	public function laporanPenjualan()
	{
		$data = Order::query()->where('status', 'completed')->with('buyer', 'payment', 'orderDetails.product', 'deliveryDetail')->get();
		return response()->json($data, 200);
	}

	public function getOneOrder(Request $request, $orderCode)
	{
		$order = Order::with('buyer', 'payment', 'orderDetails.product', 'deliveryDetail')->where('order_code', $orderCode)->first();

		if (!$order) {
			return response()->json(['message' => 'Order tidak ditemukan'], 404);
		}

		return response()->json($order, 200);
	}

	public function myOrder(Request $request)
	{
		$user = $request->user();
		$orders = Order::where('user_id', $user->id);

		if ($request->query('status')) {
			$orders->where('status', $request->query('status'));
		}

		$orders = $orders->with('buyer', 'payment', 'orderDetails.product', 'deliveryDetail')->orderBy('updated_at', 'desc')->get();

		return response()->json($orders);
	}

	public function detailOrder(Request $request, $order_code)
	{
		$order = Order::where('order_code', $order_code)->first();
		if (!$order) {
			return response()->json(['message' => 'tidak ditemukan orderan'], 404);
		}
		if ($request->query('status')) {
			if ($request->query('status') != $order->status) {
				return response()->json([
					'message' => 'tidak ditemukan orderan dengan status tersebut',
					'status' => $request->status,
				], 404);
			}
		}

		return response()->json($order->load('buyer', 'payment', 'orderDetails.product', 'deliveryDetail'));
	}

	public function createOrder(Request $request)
	{
		$user = $request->user();
		$validated = $request->validate([
			'name' => 'required|string',
			'whatsaap' => 'required|numeric',
			'telephone' => 'required|numeric',
			'email' => 'required|email',
			'gross_amount' => 'required|numeric',
			'details' => 'required|array',
			'details.*.product_id' => 'required|integer',
			'details.*.product_name' => 'required|string',
			'details.*.quantity' => 'required|integer|min:1',
			'details.*.price' => 'required|numeric|min:0',
			'shipping_cost' => 'required|numeric',
			'courier_name' => 'required|string',
			// 'courier_service' => 'required|string',
			// 'courier_description' => 'required|string',
			'province' => 'required|string',
			'city' => 'required|string',
			'subdistrict' => 'required|string',
			'postal_code' => 'nullable|string',
			'address' => 'required|string',
			'address_detail' => 'required|string|max:255',
		], [
			'required' => 'tidak boleh kosong',
			'numeric' => 'harus berupa angka.',
			'email.email' => 'format email tidak valid.',
			'address_detail.max' => 'detail alamat maksimal 255 karakter.',
		]);

		try {
			DB::beginTransaction();

			$order = Order::create([
				'user_id' => $user->id,
				// 'order_code' => strtoupper(uniqid('ORD-')),
				'name' => $validated['name'],
				'whatsaap' => $validated['whatsaap'],
				'telephone' => $validated['telephone'],
				'email' => $validated['email'],
				'gross_amount' => intval($validated['gross_amount']),
				'status' => 'pending',
			]);

			$courierCodes = [
				'J&T Express' => 'jnt',
				'Jalur Nugraha Ekakurir (JNE)' => 'jne',
				'POS Indonesia (POS)' => 'pos',
				'SiCepat Express' => 'sicepat',
				'Anteraja' => 'anteraja',
				'Ninja Xpress' => 'ninja',
			];

			// Ambil kode kurir berdasarkan nama kurir yang ada di $request
			$request['courier_code'] = $courierCodes[$validated['courier_name']] ?? null;

			$deliveryDetail = DeliveryDetail::create([
				'order_id' => $order->id,
				'province' => $validated['province'],
				'city' => $validated['city'],
				'subdistrict' => $validated['subdistrict'],
				'postal_code' => $validated['postal_code'],
				'address' => $validated['address'],
				'address_detail' => $validated['address_detail'],
				'courier_code' => $request['courier_code'],
				'courier_name' => $validated['courier_name'],
				'courier_service' => $request['courier_service'],
				'courier_description' => $request['courier_description'],
				'shipping_cost' => $validated['shipping_cost'],
			]);

			$payment = Payment::create([
				'order_id' => $order->id,
				'amount' => intval($validated['gross_amount']),
				'status' => 'pending',
				'expire_page' => now()->addMinutes(5),
			]);

			$orderDetails = [];
			foreach ($validated['details'] as $detail) {
				$orderDetails[] = [
					'order_id' => $order->id,
					'product_id' => $detail['product_id'],
					'product_name' => $detail['product_name'],
					'quantity' => $detail['quantity'],
					'price' => intval($detail['price']),
				];

				Cart::query()->where('user_id', $order->user_id)->where('product_id', $detail['product_id'])->delete();
			}

			OrderDetail::insert($orderDetails);

			$transactionDetails = [
				'order_id' => $order->order_code,
				'gross_amount' => intval($order->gross_amount),
			];

			$customerDetails = [
				'first_name' => $order->name,
				'email' => $order->email,
				'phone' => $order->telephone,
				'shipping_address' => [
					'first_name' => $order->name,
					'address' => $deliveryDetail->address,
					'city' => $deliveryDetail->city,
					'postal_code' => $validated['postal_code'],
					'phone' => $order->telephone,
				],
			];

			$itemDetails = [];
			foreach ($validated['details'] as $detail) {
				$itemDetails[] = [
					'id' => $detail['product_id'],
					// 'price' => intval($detail['price']),
					'price' => 1,
					'quantity' => $detail['quantity'],
					'name' => $detail['product_name'],
				];
			}

			$itemDetails[] = [
				'id' => 'ONGKIR',
				// 'price' => intval($validated['shipping_cost']),
				'price' => 1,
				'quantity' => 1,
				'name' => 'Ongkos Kirim'
			];

			$itemDetails[] = [
				'id' => 'APP_FEE',
				'price' => 1,
				// 'price' => 1000,
				'quantity' => 1,
				'name' => 'Biaya Aplikasi'
			];

			$transaction = [
				'transaction_details' => $transactionDetails,
				'customer_details' => $customerDetails,
				'item_details' => $itemDetails,
				'custom_field1' => $order->whatsaap,
			];

			$snapToken = Snap::getSnapToken($transaction, ['verify' => false]);

			$payment->snap_token = $snapToken;
			$payment->save();

			DB::commit();

			return response()->json([
				'message' => 'Order berhasil dibuat!',
				'order_code' => $order->order_code,
				// 'details' => $order->orderDetails,
				// 'payment' => $payment,
				// 'delivery' => $deliveryDetail,
				'snap_token' => $snapToken,
			], 201);
		} catch (\Exception $e) {
			DB::rollBack();
			return response()->json([
				'message' => 'Gagal membuat order!',
				'error' => $e->getMessage()
			], 500);
		}
	}

	public function shippingOrder(Request $request, $orderCode)
	{
		$request->validate([
			'resi' => 'required',
		], [
			'required' => 'resi tidak boleh kosong'
		]);

		$order = Order::query()->where('order_code', $orderCode)->with('buyer', 'payment', 'orderDetails.product', 'deliveryDetail')->first();
		$deliveryDetail = DeliveryDetail::query()->where('order_id', $order->id)->first();

		if (!$order) {
			return response()->json([
				'message' => 'Order tidak ditemukan'
			], 404);
		}

		$order->update([
			'status' => 'shipped'
		]);

		$deliveryDetail->update([
			'delivery_date' => now(),
			'resi' => $request['resi']
		]);

		$formatOrderDetail = Format::OrderDetail($order);
		$message = WhatsappMessage::orderShipped($order->name, $orderCode, $formatOrderDetail['orderDetail'], $deliveryDetail->address, $deliveryDetail->address_detail, $deliveryDetail->subdistrict, $deliveryDetail->city, $deliveryDetail->province, $request->resi);
		SendWhatsaap::dispatch($order->whatsaap, $message);

		return response()->json([
			'message' => 'Pesanan telah diserahkan ke kurir'
		], 200);
	}

	public function completeOrder($orderCode)
	{
		$order = Order::query()->where('order_code', $orderCode)->with('buyer', 'payment', 'orderDetails.product', 'deliveryDetail')->first();
		if (!$order) {
			return response()->json([
				'message' => 'Orderan tidak ditemukan'
			], 404);
		}
		$orderDetail = OrderDetail::query()->where('order_id', $order->id)->get();
		$deliveryDetail = DeliveryDetail::query()->where('order_id', $order->id)->first();

		$order->update([
			'status' => 'completed'
		]);

		$deliveryDetail->update([
			'received_date' => now()
		]);

		foreach ($orderDetail as $detail) {
			$product = Product::query()->where('id', $detail->product_id)->first();
			$product->update([
				'total_sales' => $product->total_sales + $detail->quantity
			]);
		}

		$formatOrderDetail = Format::OrderDetail($order);
		$message = WhatsappMessage::orderCompleted($order->name, $order->order_code, $formatOrderDetail['orderDetail']);
		SendWhatsaap::dispatch($order->whatsaap, $message);

		return response()->json([
			'message' => 'Pesanan telah berhasil diselesaikan'
		], 200);
	}

	public function cancelOrderAndRefund(Request $request)
	{
		$request->validate([
			'order_code' => 'required|string',
			'amount' => 'required|numeric',
		]);

		try {
			$params = [
				'payment_type' => 'refund',
				'order_id' => $request->order_code,
				'amount' => $request->amount,
				'reason' => 'Customer requested a refund',
			];

			$response = Transaction::refund($request->order_code, $params);

			$order = Order::query()->with('payment')->where('order_code', $request->orderCode)->first();
			$order->update([
				'status' => 'cancelled'
			]);
			$order->payment->update([
				'status' => 'refund'
			]);

			return response()->json([
				'success' => true,
				'message' => 'Orderan berhasil dibatalkan dan dana telah dikembalikan',
				'refund_id' => $response['refund_id'] ?? null,
			]);
		} catch (Exception $e) {
			return response()->json([
				'success' => false,
				'message' => 'Refund failed: ' . $e->getMessage(),
			], 500);
		}
	}
}
