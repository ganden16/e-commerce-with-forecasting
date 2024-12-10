<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\ProductReview;
use Illuminate\Http\Request;

class ProductReviewController extends Controller
{
	
	public function getProductReviews(Request $request)
	{
		$productReviews = ProductReview::query();

		if ($request->query('productId')) {
			$productReviews->where('product_id', $request->query('productId'));
		}
		if ($request->query('notReplied') == 'true') {
			$productReviews->whereNull('reply');
		}

		$productReviews = $productReviews->orderBy('updated_at', 'desc')->get();

		$countStar1 = $productReviews->filter(fn($review) => $review->stars == 1)->count();
		$countStar2 = $productReviews->filter(fn($review) => $review->stars == 2)->count();
		$countStar3 = $productReviews->filter(fn($review) => $review->stars == 3)->count();
		$countStar4 = $productReviews->filter(fn($review) => $review->stars == 4)->count();
		$countStar5 = $productReviews->filter(fn($review) => $review->stars == 5)->count();

		$totalStars = ($countStar1 * 1) +
			($countStar2 * 2) +
			($countStar3 * 3) +
			($countStar4 * 4) +
			($countStar5 * 5);
		$totalReviews = $countStar1 + $countStar2 + $countStar3 + $countStar4 + $countStar5;
		$rating = $totalReviews > 0 ? round($totalStars / $totalReviews) : 0;

		return response()->json([
			'reviews' => $productReviews->load('reviewer', 'product', 'replyBy', 'order'),
			'count_star' => [
				$countStar1,
				$countStar2,
				$countStar3,
				$countStar4,
				$countStar5,
			],
			'rating' => $rating,
			'total_reviews' => $totalReviews
		]);
	}

	public function getReviewsByOrder(Request $request, $orderCode)
	{
		$order = Order::query()->where('order_code', $orderCode)->first();
		$reviewsByOrder = ProductReview::query()->with('reviewer', 'product', 'replyBy')->where('order_id', $order->id)->get();

		if (!$reviewsByOrder) {
			return response()->json([], 404);
		}

		return response()->json($reviewsByOrder);
	}

	public function updateOrCreateReview(Request $request)
	{
		$userId = $request->user()->id;
		$orderCode = $request->input('orderCode');

		$request->validate([
			'reviews' => 'array',
			'reviews.*.product_id' => 'required|exists:products,id',
			'orderCode' => 'required|exists:orders,order_code',
			'reviews.*.stars' => 'numeric|min:1',
			'reviews.*.review' => 'required|max:255'
		], [
			'reviews.array' => 'harus array',
			'max' => 'maksimal :max karakter',
			'reviews.*.product_id.exists' => 'Produk tidak valid',
			'reviews.*.stars.min' => 'Bintang minimal 1',
			'reviews.*.review.required' => 'review anda masih kosong',
		]);

		$reviews = $request->reviews;
		$order = Order::query()->where('order_code', $orderCode)->first();

		if (!$order) {
			return response()->json([
				'message' => 'Order tidak ditemukan'
			], 404);
		}

		if ($order->review_status == 'edited') {
			return response()->json([
				'message' => 'Anda sudah melakukan edit review'
			], 400);
		}

		foreach ($reviews as $reviewData) {
			ProductReview::query()->updateOrCreate(
				[
					'order_id' => $order->id,
					'reviewer' => $userId,
					'product_id' => $reviewData['product_id']
				],
				[
					'stars' => $reviewData['stars'],
					'review' => $reviewData['review'],
					'time_review' => now()
				]
			);
		}

		if ($order->review_status == null) {
			$order->review_status = 'reviewed';
		} elseif ($order->review_status == 'reviewed') {
			$order->review_status = 'edited';
		}
		$order->save();

		return response()->json([
			'message' => 'Berhasil menambahkan review'
		], 201);
	}

	public function updateOrCreateReplyReview(Request $request, $productReviewId)
	{
		$productReview = ProductReview::where('id', $productReviewId)->first();
		$adminId = $request->user()->id;

		$request->validate([
			'reply' => 'required|string',
		], [
			'reply.required' => 'isikan jawaban dulu',
		]);

		$productReview->update([
			'reply_by' => $adminId,
			'reply' => $request->reply,
			'time_reply' => now()
		]);

		return response()->json([
			'message' => 'Berhasil menambahkan tanggapan'
		]);
	}
}
