<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use Illuminate\Http\Request;

class CartController extends Controller
{
	public function getAllCarts(Request $request)
	{
		$carts = Cart::with('product')->where('user_id', $request->user()->id)->get();
		return response()->json($carts, 200);
	}

	public function addCart(Request $request)
	{
		$request->validate([
			'product_id' => 'required|exists:products,id',
			'quantity' => 'required|integer|min:1',
		]);

		$user = $request->user();

		$cart = Cart::where('user_id', $user->id)
			->where('product_id', $request->product_id)
			->first();

		if ($cart) {
			$cart->quantity += $request->quantity;
			$cart->save();
			return response()->json([
				'message' => 'Produk berhasil ditambahkan ke keranjang',
			], 201);
		} else {
			$newCart = Cart::create([
				'user_id' => $user->id,
				'product_id' => $request->product_id,
				'quantity' => $request->quantity,
			]);
			return response()->json([
				'message' => 'Produk berhasil ditambahkan ke keranjang',
				'new_cart' => $newCart->load('product', 'user')
			], 201);
		}
	}

	public function buyAgain(Request $request)
	{
		$userId = $request->user()->id;
		$cartItems = $request->input('cartItems');

		foreach ($cartItems as $item) {
			$cart = Cart::where('user_id', $userId)
				->where('product_id', $item['product_id'])
				->first();

			if ($cart) {
				$cart->quantity += $item['quantity'];
				$cart->save();
			} else {
				Cart::create([
					'user_id' => $userId,
					'product_id' => $item['product_id'],
					'quantity' => $item['quantity'],
				]);
			}
		}

		return response()->json(['message' => 'Berhasil menambahkan ke keranjang belanja'], 201);
	}


	public function updateQuantity(Request $request)
	{
		$cart = Cart::find($request->cartId);
		$cart->quantity = $request->quantity;

		if ($cart->quantity < 1) {
			return response()->json(['message' => 'Jumlah produk tidak boleh kurang dari 1'], 400);
		}

		$cart->save();

		return response()->json([
			'message' => 'Jumlah produk diupdate',
			'quantity' => $cart->quantity
		], 200);
	}

	public function deleteCart(Request $request, $cartId)
	{
		$cart = Cart::where('id', $cartId)->where('user_id', $request->user()->id)->first();

		if (!$cart) {
			return response()->json([
				'message' => 'Produk tidak ditemukan'
			], 404);
		}

		$cart->delete();
		return response()->json([
			'message' => 'Produk berhasil dihapus dari keranjang'
		], 200);
	}
}
