<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductReview;
use Illuminate\Http\Request;

class LandingPageController extends Controller
{
	public function index()
	{
		$productReviews = ProductReview::query()->with('reviewer')->where('stars', 5)->inRandomOrder()->limit(6)->get();
		$latestProduct = Product::query()->orderBy('created_at', 'desc')->limit(6)->get();
		$categories = Category::query()->orderBy('created_at', 'desc')->limit(5)->get();

		return response()->json([
			'productReviews' => $productReviews,
			'latestProduct' => $latestProduct,
			'categories' => $categories,
		], 200);
	}
}
