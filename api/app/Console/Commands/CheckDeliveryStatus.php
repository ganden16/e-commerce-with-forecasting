<?php

namespace App\Console\Commands;

use App\Helper\Format;
use App\Helper\WhatsappMessage;
use App\Jobs\SendWhatsaap;
use Illuminate\Console\Command;
use App\Models\Order;
use App\Models\DeliveryDetail;
use App\Models\Product;
use Illuminate\Support\Facades\Http;

class CheckDeliveryStatus extends Command
{
	// Nama command yang akan digunakan di scheduler
	protected $signature = 'delivery:check-status';

	// Deskripsi command
	protected $description = 'Check the delivery status of orders and update them if delivered';

	public function __construct()
	{
		parent::__construct();
	}

	public function handle()
	{
		$orders = Order::where('status', 'shipped')->with('buyer', 'payment', 'orderDetails.product', 'deliveryDetail')->get();

		foreach ($orders as $order) {
			$deliveryDetail = DeliveryDetail::where('order_id', $order->id)->first();

			if (!$deliveryDetail || !$deliveryDetail->resi) {
				continue;
			}

			try {
				$response = Http::withHeaders([
					'key' => env('RAJA_ONGKIR_KEY')
				])->post(env('RAJAONGKIR_URL') . '/waybill', [
					'waybill' => $deliveryDetail->resi,
					'courier' => $deliveryDetail->courier,
				]);

				$data = $response->json();

				if ($data['rajaongkir']['status']['code'] == 200 && isset($data['rajaongkir']['result']['delivery_status'])) {
					$deliveryStatus = $data['rajaongkir']['result']['delivery_status']['status'];

					if (strtoupper($deliveryStatus) === 'DELIVERED') {
						$order->status = 'completed';
						$order->save();

						$receivedDate = $data['rajaongkir']['result']['delivery_status']['pod_date'];
						$deliveryDetail->received_date = $receivedDate;
						$deliveryDetail->save();

						foreach ($order->orderDetails as $detail) {
							$product = Product::query()->where('id', $detail->product_id)->first();
							$product->update([
								'total_sales' => $product->total_sales + $detail->quantity
							]);
						}

						$formatOrderDetail = Format::OrderDetail($order);
						$message = WhatsappMessage::orderCompleted($order->name, $order->order_code, $formatOrderDetail['orderDetail']);
						SendWhatsaap::dispatch($order->whatsaap, $message);

						$this->info("Order {$order->order_code} marked as completed.");
					} else {
						$this->info("Order {$order->order_code} is still in transit.");
					}
				} else {
					$this->error("Failed to retrieve tracking information for order {$order->order_code}.");
				}
			} catch (\Exception $e) {
				$this->error("Error checking delivery status for order {$order->order_code}: " . $e->getMessage());
			}
		}
	}
}
