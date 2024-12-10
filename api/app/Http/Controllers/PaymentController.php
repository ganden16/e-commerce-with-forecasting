<?php

namespace App\Http\Controllers;

use App\Helper\Format;
use App\Helper\WhatsappMessage;
use App\Jobs\SendWhatsaap;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Midtrans\Config;
use Midtrans\Notification;
use Midtrans\Transaction;
use GuzzleHttp\Exception\RequestException;


class PaymentController extends Controller
{
	public function __construct()
	{
		Config::$serverKey = config('midtrans.server_key');
		Config::$isProduction = config('midtrans.is_production', false);
		Config::$isSanitized = config('midtrans.is_sanitized', true);
		Config::$is3ds = config('midtrans.is_3ds', true);
	}

	public function handleNotification(Request $request)
	{
		$notification = new Notification();

		$transactionStatus = $notification->transaction_status;
		$orderId = $notification->order_id;
		$paymentType = $notification->payment_type;
		$fraudStatus = $notification->fraud_status;

		$order = Order::where('order_code', $orderId)->first();
		$payment = $order->payment;

		if (!$order) {
			return response()->json(['message' => 'Order not found'], 404);
		}

		if (!$payment) {
			return response()->json(['message' => 'Payment not found'], 404);
		}

		switch ($transactionStatus) {
			case 'capture':
				if ($paymentType === 'credit_card') {
					$payment->status = ($fraudStatus === 'challenge') ? 'capture' : 'settlement';
					if ($fraudStatus !== 'challenge') {
						$payment->payment_date = now();
						$order->status = 'processing';
					}
				}
				break;

			case 'settlement':
				$payment->status = 'settlement';
				$payment->payment_date = now();
				$order->status = 'processing';

				$formatOrderDetail = Format::OrderDetail($order);

				$message = WhatsappMessage::paymentNotification($order->name, $order->order_code, $paymentType, $formatOrderDetail['orderDetail'], $formatOrderDetail['subTotal'], $formatOrderDetail['totalAmount']);
				SendWhatsaap::dispatch($order->whatsaap, $message);
				break;

			case 'pending':
				$payment->status = 'pending';
				$order->status = 'pending';
				break;

			case 'deny':
			case 'expire':
			case 'cancel':
				$payment->status = $transactionStatus;
				$order->status = 'cancelled';
				break;

			default:
				return response()->json(['message' => 'Unhandled transaction status'], 400);
		}

		if ($transactionStatus !== 'pending') {
			$payment->payment_method = $paymentType;
		}

		$payment->save();
		$order->save();

		return response()->json(['message' => 'Notification handled successfully']);
	}

	public function checkTransactionToken(Request $request)
	{
		$request->validate([
			'orderCode' => 'required|string',
		]);

		try {
			$order = Order::where('order_code', $request->orderCode)->first();

			if (!$order) {
				return response()->json(['message' => 'Order not found.'], 404);
			}

			$status = Transaction::status($order->order_code);
			if ($status['transaction_status'] == 'pending') {
				return response()->json([
					'message' => 'Token masih valid.',
					'snapToken' => $order->payment->snap_token,
				], 200);
			}
		} catch (RequestException $e) {
		} catch (\Exception $e) {
			// Tangkap generic exception
			$statusCode = method_exists($e, 'getCode') ? $e->getCode() : 500;
			if ($statusCode == 404) {
				$order->payment->status = 'expire';
				$order->payment->save();

				$order->status = 'cancelled';
				$order->save();

				return response()->json(['message' => 'Pembayaran sudah kadaluarsa.'], 400);
			} else {
				return response()->json(['message' => $e->getMessage()], $statusCode);
			}
		}
	}

	public function continuePayment(Request $request)
	{
		$request->validate([
			'orderCode' => 'required|string',
		]);

		$order = Order::with('payment')->where('order_code', $request->orderCode)->first();

		if (!$order) {
			return response()->json([
				'message' => 'tidak ditemukan order'
			], 404);
		}

		if ($order->payment->expire_page < now()) {
			$order->status = 'cancelled';
			$order->payment->status = 'expire';
			$order->save();
			$order->payment->save();

			return response()->json([
				'message' => 'Pembayaran kadaluarsa, orderan telah dibatalkan'
			], 400);
		}

		return response()->json([
			'message' => 'lanjutkan bayar'
		], 200);
	}

	
}
