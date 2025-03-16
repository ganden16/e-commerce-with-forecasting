<?php

namespace App\Helper;

class WhatsappMessage
{
	public static function otpForgotPassword($name, $otp, $minutes)
	{
		$appBrand = env('APP_BRAND');

		return "Hai {$name} 👋

Berikut kode OTP kamu untuk reset password: *{$otp}* 🔒

Kode ini berlaku cuma *{$minutes} menit*. Ingat, jangan bagikan kode ini ke orang lain ya!

Kalau kamu tidak merasa meminta reset password, cukup abaikan pesan ini.

Salam dari tim *$appBrand* ✨";
	}

	public static function paymentNotification($name, $orderCode, $paymentMethod, $orderDetails, $subTotal, $totalPay)
	{
		$appBrand = env('APP_BRAND');

		return "Hai $name 👋\n\n" .
			"Kami telah menerima pembayaran kamu! 🎉\n\n" .
			"🆔 *Nomor Order:*\n *{$orderCode}*\n\n" .
			"💳 *Metode Pembayaran:* *{$paymentMethod}*\n\n" .
			"🛒 *Rincian Pesanan:*\n" .
			"{$orderDetails}\n\n" .
			"💰 *Sub Total:* *Rp{$subTotal}*\n\n" .
			"💰 *Total Dibayar:* *Rp{$totalPay}*\n\n" .
			"📦 *Status:* *Pesanan Diproses*\n\n" .
			"Terima kasih telah melakukan pembayaran. Pesanan kamu sedang diproses dan akan segera dikirim. Kamu akan menerima notifikasi lagi ketika pesanan sudah dikirim. 🚚\n\n" .
			"Jika ada pertanyaan lebih lanjut atau kamu ingin melacak status pesanan, silakan hubungi customer service kami.\n\n" .
			"Salam dari tim *$appBrand* ✨";
	}

	public static function orderShipped($name, $orderCode, $orderDetails, $address, $address_detail, $subdistrict, $city, $province, $trackingNumber)
	{
		$appBrand = env('APP_BRAND');

		return "Hai {$name} 👋\n\n" .
			"Pesanan kamu sudah diserahkan ke kurir! 🚚 Berikut adalah detail pesanan kamu:\n\n" .
			"🆔 *Nomor Order:*\n *{$orderCode}*\n\n" .
			"🛒 *Rincian Pesanan:*\n" .
			"{$orderDetails}\n\n" .
			"📦 *Status:* *Sedang Dikirim*\n\n" .
			"Kami akan segera mengirimkan pesanan ke alamat:\n" .
			"📍 *{$address}*\n\n" .
			"📍 *{$address_detail}*\n\n" .
			"📍 *$subdistrict, $city - $province*\n\n" .
			"Nomor resi pengiriman kamu adalah: *{$trackingNumber}*. Kamu bisa melacak status pengiriman menggunakan nomor ini.\n\n" .
			"Pastikan untuk tetap memantau paket kamu ya! Jika ada pertanyaan atau masalah, jangan ragu untuk menghubungi customer service kami.\n\n" .
			"Terima kasih telah berbelanja di *{$appBrand}* ✨\n\n" .
			"Salam dari tim *{$appBrand}*";
	}

	public static function orderCompleted($name, $orderCode, $orderDetails)
	{
		$appBrand = env('APP_BRAND');

		return "Hai {$name} 👋\n\n" .
			"Kami senang mendengar bahwa pesanan kamu telah diterima dengan baik! 🎉 Berikut adalah detail pesanan kamu:\n\n" .
			"🆔 *Nomor Order:*\n *{$orderCode}*\n\n" .
			"🛒 *Rincian Pesanan:*\n" .
			"{$orderDetails}\n\n" .
			"📦 *Status:* *Pesanan Diterima*\n\n" .
			"Terima kasih telah berbelanja di *{$appBrand}* dan kami harap kamu puas dengan produk kami. Jika kamu punya waktu, kami akan sangat menghargai ulasan kamu mengenai pesanan ini.\n\n" .
			"Jangan ragu untuk menghubungi kami jika ada pertanyaan atau masalah dengan pesanan kamu. Kami selalu siap membantu! 😊\n\n" .
			"Salam hangat dari tim *{$appBrand}* ✨";
	}
}
