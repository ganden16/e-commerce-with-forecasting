<?php

namespace App\Helper;

class Format
{
	public static function OrderDetail($order)
	{
		$formattedOrderDetails = "";
		$totalPrice = 0;

		foreach ($order->orderDetails as $item) {
			$productName = $item['product_name'];
			$productPrice = number_format($item['price'], 0, ',', '.');
			$productQuantity = $item['quantity'];

			$formattedOrderDetails .= "- {$productName} (x{$productQuantity}): Rp{$productPrice}\n";
			$totalPrice += $item['price'] * $item['quantity'];
		}

		$subTotalFormatted = number_format($totalPrice, 0, ',', '.');
		$totalAmountFormatted = number_format($order->payment->amount, 0, ',', '.');

		return [
			'subTotal' => $subTotalFormatted,
			'totalAmount' => $totalAmountFormatted,
			'orderDetail' => $formattedOrderDetails
		];
	}
}
