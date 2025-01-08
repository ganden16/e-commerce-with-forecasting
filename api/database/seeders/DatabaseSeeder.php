<?php

namespace Database\Seeders;

use App\Helper\RajaOngkir;
use App\Models\Cart;
use App\Models\Category;
use App\Models\City;
use App\Models\DeliveryDetail;
use App\Models\ForecastingMethod;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Payment;
use App\Models\Product;
use App\Models\ProductQna;
use App\Models\ProductReview;
use App\Models\Province;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class DatabaseSeeder extends Seeder
{
	public function run(): void
	{
		//forecasting_methods
		$slugs = collect([
			'arima',
			'ses',
			// 'hl',
			'hw',
			// 'lr',
			// 'rf',
			// 'svr',
			// 'xgboost',
			'sma',
			'dma',
			'wma',
			// 'gaussian',
			'lstm',
			// 'bayesian',
			// 'polynomial',
			// 'knn',
			// 'dt',
			// 'gb',
			// 'elasticnet',
			// 'lasso'
		]);
		$names = collect([
			'arima',
			'simple-exponential-smoothing',
			// 'holt-linear',
			'holt-winters-seasonal',
			// 'linear-regression',
			// 'random-forest',
			// 'support-vector-regressor',
			// 'xgboost',
			'single-moving-average',
			'double-moving-average',
			'weighted-moving-average',
			// 'gaussian-process-regression',
			'long-short-term-memory',
			// 'bayesian-regression',
			// 'polynomial-regression',
			// 'k-nearest-neighbors-regression',
			// 'decision-tree-regression',
			// 'gradient-boostin-regression',
			// 'elasticnet-regression',
			// 'lasso-regression'
		]);
		$slugs->zip($names)->each(function ($pair) {
			ForecastingMethod::factory(1)->create([
				'slug' => $pair[0],
				'name' => $pair[1]
			]);
		});
		$forecastingMethods = ForecastingMethod::all();
		$dataProducts = [
			[
				'name' => 'Bolen Keju',
				'category_id' => 2,
				'description' => fake()->text(100),
				'price' => 25000,
				'weight' => 500,
				'total_sales' => 99,
				'other_detail' => json_encode(['harga per box isi 8pcs']),
				'image' => env('APP_URL') . '/storage/seeders/products/faycook/bolen4.jpg'
			],
			[
				'name' => 'Bolen Cokelat',
				'category_id' => 2,
				'description' => fake()->text(100),
				'price' => 20000,
				'weight' => 500,
				'total_sales' => 99,
				'other_detail' => json_encode(['harga per box isi 8pcs']),
				'image' => env('APP_URL') . '/storage/seeders/products/faycook/bolen1.jpg'
			],
			// [
			// 	'name' => 'Bolen Mix Cokelat Keju',
			// 	'category_id' => 2,
			// 	'description' => fake()->text(100),
			// 	'price' => 20000,
			// 	'weight' => 500,
			// 	'total_sales' => 99,
			// 	'image' => env('APP_URL') . '/storage/seeders/products/faycook/bolen6-mix.jpg'
			// ],
			[
				'name' => 'Pie Susu Original',
				'category_id' => 1,
				'description' => fake()->text(100),
				'price' => 20000,
				'weight' => 500,
				'total_sales' => 99,
				'other_detail' => json_encode(['harga per box isi 10pcs']),
				'image' => env('APP_URL') . '/storage/seeders/products/faycook/pie-susu3.jpg'
			],
			[
				'name' => 'Pie Susu Varian Cokelat',
				'category_id' => 1,
				'description' => fake()->text(100),
				'price' => 20000,
				'weight' => 500,
				'total_sales' => 99,
				'other_detail' => json_encode(['harga per box isi 10pcs']),
				'image' => env('APP_URL') . '/storage/seeders/products/faycook/pie-susu1.jpg'
			],
			[
				'name' => 'Keripik Brownies',
				'category_id' => 3,
				'description' => fake()->text(100),
				'price' => 10000,
				'weight' => 500,
				'total_sales' => 99,
				'other_detail' => json_encode(['harga per pcs', 'dengan topping choco chips dan kacang']),
				'image' => env('APP_URL') . '/storage/seeders/products/faycook/brownies-crispy2.jpg'
			],
			[
				'name' => 'Brownies Panggang',
				'category_id' => 3,
				'description' => fake()->text(100),
				'price' => 27000,
				'weight' => 700,
				'total_sales' => 99,
				'other_detail' => json_encode(['harga per box ukuran 20x10', 'beraneka topping']),
				'image' => env('APP_URL') . '/storage/seeders/products/faycook/brownies2.jpg'
			],
			[
				'name' => 'Tart Brownies',
				'category_id' => 3,
				'description' => fake()->text(100),
				'price' => 100000,
				'weight' => 1000,
				'total_sales' => 99,
				'other_detail' => json_encode(['harga per box ukuran 20x20']),
				'image' => env('APP_URL') . '/storage/seeders/products/faycook/brownies1.jpg'
			],
			[
				'name' => 'Donat Bomboloni',
				'category_id' => 4,
				'description' => fake()->text(100),
				'price' => 10000,
				'weight' => 500,
				'total_sales' => 99,
				'other_detail' => json_encode(['harga per box isi 5']),
				'image' => env('APP_URL') . '/storage/seeders/products/faycook/bomboloni2.jpg'
			],
			[
				'name' => 'Donat Susu',
				'category_id' => 4,
				'description' => fake()->text(100),
				'price' => 10000,
				'weight' => 500,
				'total_sales' => 99,
				'other_detail' => json_encode(['harga per box isi 4']),
				'image' => env('APP_URL') . '/storage/seeders/products/faycook/donat-susu3.jpg'
			],
			[
				'name' => 'Palm Cookies',
				'category_id' => 1,
				'description' => fake()->text(100),
				'price' => 35000,
				'weight' => 350,
				'total_sales' => 99,
				'other_detail' => json_encode(['harga per toples']),
				'image' => env('APP_URL') . '/storage/seeders/products/faycook/palm-cookies1.jpg'
			],
			[
				'name' => 'Semprit',
				'category_id' => 1,
				'description' => fake()->text(100),
				'price' => 30000,
				'weight' => 350,
				'total_sales' => 99,
				'other_detail' => json_encode(['harga per toples']),
				'image' => env('APP_URL') . '/storage/seeders/products/faycook/semprit1.jpg'
			],
			[
				'name' => 'Putri Salju',
				'category_id' => 1,
				'description' => fake()->text(100),
				'price' => 35000,
				'weight' => 400,
				'total_sales' => 99,
				'other_detail' => json_encode(['harga per toples']),
				'image' => env('APP_URL') . '/storage/seeders/products/faycook/putri-salju1.jpg'
			],
			[
				'name' => 'Nastar Selai Nanas',
				'category_id' => 1,
				'description' => fake()->text(100),
				'price' => 45000,
				'weight' => 450,
				'total_sales' => 99,
				'other_detail' => json_encode(['harga per toples']),
				'image' => env('APP_URL') . '/storage/seeders/products/faycook/nastar3.jpg'
			],
			[
				'name' => 'Lidah Kucing Keju',
				'category_id' => 1,
				'description' => fake()->text(100),
				'price' => 35000,
				'weight' => 250,
				'total_sales' => 99,
				'other_detail' => json_encode(['harga per toples']),
				'image' => env('APP_URL') . '/storage/seeders/products/faycook/lidah-kucing3.jpg'
			],
			[
				'name' => 'Kastangel',
				'category_id' => 1,
				'description' => fake()->text(100),
				'price' => 50000,
				'weight' => 450,
				'total_sales' => 99,
				'other_detail' => json_encode(['harga per toples']),
				'image' => env('APP_URL') . '/storage/seeders/products/faycook/kastangel1.jpg'
			],
		];
		//products
		collect($dataProducts)->each(function ($product) use ($forecastingMethods) {
			$newProduct = Product::create($product);
			$randomIdForecasting = $forecastingMethods->random(3)->pluck('id')->toArray();
			$newProduct->bestForecastingMethod()->attach($randomIdForecasting);
		});
		// Product::insert($dataProducts);
		// for ($i = 1; $i <= 50; $i++) {
		// 	if ($i <= 10) {
		// 		$randomIdForecasting = $forecastingMethods->random(3)->pluck('id')->toArray();
		// 		$newProduct = Product::factory()->create([
		// 			'name' => 'Produk ' . $i,
		// 		]);
		// 		$newProduct->bestForecastingMethod()->attach($randomIdForecasting);
		// 	} else {
		// 		Product::factory()->create([
		// 			'name' => 'Produk ' . $i,
		// 		]);
		// 	}
		// }
		$products = Product::all();

		//users role admin
		for ($i = 1; $i <= 20; $i++) {
			User::factory()->create([
				'email' => 'admin' . $i . '@mail.com',
				'username' => 'admin' . $i,
				'is_admin' => true,
			]);
		}

		//users role user and carts
		for ($i = 1; $i <= 30; $i++) {
			$user = User::factory()->create([
				'email' => 'user' . $i . '@mail.com',
				'username' => 'user' . $i,
				'is_admin' => false,
			]);
			$usedProductIds = [];
			for ($j = 0; $j < 5; $j++) {
				$product = $products->whereNotIn('id', $usedProductIds)->random();
				Cart::create([
					'user_id' => $user->id,
					'product_id' => $product->id,
					'quantity' => rand(1, 8),
				]);
				$usedProductIds[] = $product->id;
			}
		}
		$users = User::all();
		$customers = User::where('is_admin', false)->get();
		$admins = User::where('is_admin', true)->get();

		// orders cancelled and payment cancel
		foreach ($customers as $customer) {
			Order::factory()
				->has(
					Payment::factory()->count(1)->state(function () {
						return [
							'status' => 'cancel',
						];
					})
				)
				->has(
					DeliveryDetail::factory()->count(1)->state(function () {
						return [
							'resi' => null,
						];
					})
				)
				->has(
					OrderDetail::factory()->count(5)->state(function (array $attributes, Order $order) use ($products) {
						static $orderUsedProductIds = [];
						$orderUsedProductIds[$order->id] = $orderUsedProductIds[$order->id] ?? [];

						$availableProducts = $products->reject(function ($product) use ($orderUsedProductIds, $order) {
							return in_array($product->id, $orderUsedProductIds[$order->id]);
						});

						$selectedProduct = $availableProducts->random();
						$orderUsedProductIds[$order->id][] = $selectedProduct->id;

						return [
							'product_id' => $selectedProduct->id,
							'price' => $selectedProduct->price,
						];
					})
				)
				->count(5)->create([
					'user_id' => $customer->id,
					'status' => 'cancelled',
					'created_at' => fake()->dateTimeBetween('-2 days', 'now'),
				]);
		}

		// orders pending and payment pending
		foreach ($customers as $customer) {
			Order::factory()
				->has(
					Payment::factory()->count(1)->state(function () {
						return [
							'status' => 'pending',
						];
					})
				)
				->has(
					DeliveryDetail::factory()->count(1)->state(function () {
						return [
							'resi' => null,
						];
					})
				)
				->has(
					OrderDetail::factory()->count(5)->state(function (array $attributes, Order $order) use ($products) {
						static $orderUsedProductIds = [];
						$orderUsedProductIds[$order->id] = $orderUsedProductIds[$order->id] ?? [];

						$availableProducts = $products->reject(function ($product) use ($orderUsedProductIds, $order) {
							return in_array($product->id, $orderUsedProductIds[$order->id]);
						});

						$selectedProduct = $availableProducts->random();
						$orderUsedProductIds[$order->id][] = $selectedProduct->id;

						return [
							'product_id' => $selectedProduct->id,
							'price' => $selectedProduct->price,
						];
					})
				)
				->count(5)->create([
					'user_id' => $customer->id,
					'status' => 'pending',
					'created_at' => fake()->dateTimeBetween('-2 days', 'now'),
				]);
		}

		// orders processing and payment settlement
		foreach ($customers as $customer) {
			Order::factory()
				->has(
					Payment::factory()->count(1)->state(function () {
						return [
							'status' => 'settlement',
						];
					})
				)
				->has(
					DeliveryDetail::factory()->count(1)->state(function () {
						return [
							'resi' => null,
						];
					})
				)
				->has(
					OrderDetail::factory()->count(5)->state(function (array $attributes, Order $order) use ($products) {
						static $orderUsedProductIds = [];
						$orderUsedProductIds[$order->id] = $orderUsedProductIds[$order->id] ?? [];
						$availableProducts = $products->reject(function ($product) use ($orderUsedProductIds, $order) {
							return in_array($product->id, $orderUsedProductIds[$order->id]);
						});
						$selectedProduct = $availableProducts->random();
						$orderUsedProductIds[$order->id][] = $selectedProduct->id;
						return [
							'product_id' => $selectedProduct->id,
							'price' => $selectedProduct->price,
						];
					})
				)
				->count(5)->create([
					'user_id' => $customer->id,
					'status' => 'processing',
					'created_at' => fake()->dateTimeBetween('-2 days', 'now'),
				]);
		}

		// orders shipped and payment settlement
		foreach ($customers as $customer) {
			Order::factory()
				->has(
					Payment::factory()->count(1)->state(function () {
						return [
							'status' => 'settlement',
						];
					})
				)
				->has(
					DeliveryDetail::factory()->count(1)->state(function () {
						return [
							'resi' => 'SOCAG00183235715',
							'delivery_date' => now()
						];
					})
				)
				->has(
					OrderDetail::factory()->count(5)->state(function (array $attributes, Order $order) use ($products) {
						static $orderUsedProductIds = [];
						$orderUsedProductIds[$order->id] = $orderUsedProductIds[$order->id] ?? [];

						$availableProducts = $products->reject(function ($product) use ($orderUsedProductIds, $order) {
							return in_array($product->id, $orderUsedProductIds[$order->id]);
						});

						$selectedProduct = $availableProducts->random();
						$orderUsedProductIds[$order->id][] = $selectedProduct->id;

						return [
							'product_id' => $selectedProduct->id,
							'price' => $selectedProduct->price,
						];
					})
				)
				->count(5)->create([
					'user_id' => $customer->id,
					'status' => 'shipped',
					'created_at' => fake()->dateTimeBetween('-2 days', 'now'),
				]);
		}

		// orders completed and payment settlement
		foreach ($customers as $customer) {
			Order::factory()
				->has(
					Payment::factory()->count(1)->state(function () {
						return [
							'status' => 'settlement',
						];
					})
				)
				->has(
					DeliveryDetail::factory()->count(1)->state(function () {
						return [
							'resi' => 'SOCAG00183235715',
							'delivery_date' => fake()->dateTimeBetween('-3 days', 'now'),
							'received_date' => now()
						];
					})
				)
				->has(
					OrderDetail::factory()->count(5)->state(function (array $attributes, Order $order) use ($products) {
						static $orderUsedProductIds = [];
						$orderUsedProductIds[$order->id] = $orderUsedProductIds[$order->id] ?? [];

						$availableProducts = $products->reject(function ($product) use ($orderUsedProductIds, $order) {
							return in_array($product->id, $orderUsedProductIds[$order->id]);
						});

						$selectedProduct = $availableProducts->random();
						$orderUsedProductIds[$order->id][] = $selectedProduct->id;

						return [
							'product_id' => $selectedProduct->id,
							'price' => $selectedProduct->price,
						];
					})
				)
				->count(10)->create([
					'user_id' => $customer->id,
					'status' => 'completed',
					'created_at' => fake()->dateTimeBetween('-2 days', 'now'),
				]);
		}

		$orderCompleted = Order::query()->where('status', 'completed')->with('buyer', 'payment', 'orderDetails.product', 'deliveryDetail')->get();

		// Product review berdasarkan orderan dengan status complete
		foreach ($orderCompleted as $order) {
			foreach ($order->orderDetails as $detail) {
				$reviewProduct = ProductReview::factory()->create([
					'order_id' => $order->id,
					'reviewer' => $order->user_id,
					'product_id' => $detail->product_id,
					'stars' => fake()->numberBetween(1, 5),
					'review' => fake()->sentence(),
					'time_review' => now()
				]);
				$order->update([
					'review_status' => fake()->randomElement(['reviewed', 'edited', null, null])
				]);

				//reply review berdasarkan detail order dengan id 2
				if ($detail->id % 2 == 0) {
					$reviewProduct->update([
						'reply_by' => $admins->random()->id,
						'reply' => fake()->sentence(20),
						'time_reply' => now(),
					]);
				}
			}
		}

		//product_reviews
		// foreach ($orderCompleted as $order) {
		// 	foreach ($products as $product) {
		// 		//not reply
		// 		for ($i = 1; $i <= 5; $i++) {
		// 			ProductReview::create([
		// 				'order_id' => $orderCompleted->random()->id,
		// 				'reviewer' => $customers->random()->id,
		// 				'product_id' => $product->id,
		// 				'stars' => fake()->numberBetween(1, 5),
		// 				'review' => fake()->sentence(20),
		// 				'time_review' => now(),
		// 			]);
		// 		}
		// 		//replied
		// 		for ($i = 1; $i <= 2; $i++) {
		// 			ProductReview::create([
		// 				'order_id' => $orderCompleted->random()->id,
		// 				'reviewer' => $customers->random()->id,
		// 				'reply_by' => $admins->random()->id,
		// 				'reply' => fake()->sentence(20),
		// 				'product_id' => $product->id,
		// 				'stars' => fake()->numberBetween(1, 5),
		// 				'review' => fake()->sentence(20),
		// 				'time_review' => now(),
		// 				'time_reply' => now(),
		// 			]);
		// 		}
		// 	}
		// }

		// update tabel products untuk kolom star_1 hingga star_5
		// foreach ($products as $product) {
		// 	$star1 = ProductReview::where('product_id', $product->id)->where('stars', 1)->count();
		// 	$star2 = ProductReview::where('product_id', $product->id)->where('stars', 2)->count();
		// 	$star3 = ProductReview::where('product_id', $product->id)->where('stars', 3)->count();
		// 	$star4 = ProductReview::where('product_id', $product->id)->where('stars', 4)->count();
		// 	$star5 = ProductReview::where('product_id', $product->id)->where('stars', 5)->count();

		// 	$product->update([
		// 		'star_1' => $star1,
		// 		'star_2' => $star2,
		// 		'star_3' => $star3,
		// 		'star_4' => $star4,
		// 		'star_5' => $star5,
		// 	]);
		// }

		//product qna
		foreach ($products as $product) {
			//answered
			for ($i = 0; $i < 2; $i++) {
				ProductQna::create([
					'product_id' => $product->id,
					'questioner' => $customers->random()->id,
					'answered' => $admins->random()->id,
					'question' => fake()->sentence(10),
					'answer' => fake()->paragraph(3),
					'time_question' => fake()->dateTimeBetween('-2 days', 'now'),
					'time_answer' => fake()->dateTimeBetween('-2 days', 'now'),
				]);
			}

			//unanswered
			for ($i = 0; $i < 1; $i++) {
				ProductQna::create([
					'product_id' => $product->id,
					'questioner' => $customers->random()->id,
					'question' => fake()->sentence(10),
					'time_question' => fake()->dateTimeBetween('-2 days', 'now'),
				]);
			}
		}

		//categories
		$dataCategories = [
			[
				'name' => 'Kue Kering',
				'description' => fake()->text(100),
				'image' => env('APP_URL') . '/storage/seeders/products/faycook/kue-kering1.jpg'
			],
			[
				'name' => 'Bolen',
				'description' => fake()->text(100),
				'image' => env('APP_URL') . '/storage/seeders/products/faycook/bolen2.jpg'
			],
			[
				'name' => 'Brownies',
				'description' => fake()->text(100),
				'image' => env('APP_URL') . '/storage/seeders/products/faycook/brownies2.jpg'
			],
			[
				'name' => 'Donat',
				'description' => fake()->text(100),
				'image' => env('APP_URL') . '/storage/seeders/products/faycook/donat-susu2.jpg'
			],
		];
		collect($dataCategories)->each(function ($category) {
			Category::create($category);
		});
		// Category::insert($dataCategories);
		// for ($i = 1; $i <= 6; $i++) {
		// 	Category::factory()->create([
		// 		'name' => 'Kategori ' . $i,
		// 		'image' => env('APP_URL') . '/storage/seeders/categories/' . $i . '.webp',
		// 	]);
		// }

		//provinces
		$provinces = RajaOngkir::getAllProvinces();
		$provinces->each(function ($province) {
			Province::create([
				'id' => $province['province_id'],
				'name' => $province['province'],
			]);
		});

		//cities
		$cities = RajaOngkir::getAllCities();
		$cities->each(function ($city) {
			City::create([
				'id' => $city['city_id'],
				'province_id' => $city['province_id'],
				'name' => $city['city_name'],
				'type' => $city['type'],
				'postal_code' => $city['postal_code'],
			]);
		});
	}
}
