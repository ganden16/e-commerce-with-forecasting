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
use App\Models\TrainTestData;
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
			// 'hw',
			'ar',
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
			// 'holt-winters-seasonal',
			'auto-regressive',
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

		$bestMethod = [
			[1, 4, 5],
			[3, 4, 7],
			[1, 7, 2],
			[7, 1, 3],
			[2, 1, 4],
			[7, 2, 4],
			[4, 5, 7],
			[7, 4, 6],
			[5, 4, 2],
			[1, 2, 4],
			[3, 5, 1],
			[5, 4, 3],
			[2, 1, 4],
			[7, 1, 4],
			[4, 7, 6]
		];

		//products
		collect($dataProducts)->each(function ($product, $index) use ($bestMethod) {
			$newProduct = Product::create($product);
			$newProduct->bestForecastingMethod()->attach($bestMethod[$index]);
		});
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

		//TrainTestData
		$trainTestData = collect([
			[42, 38, 40, 35, 32, 36, 39, 37, 41, 43, 39, 42, 40, 49, 53, 57, 51, 59, 55, 58, 64],
			[42, 37, 33, 36, 31, 38, 41, 40, 38, 39, 40, 35, 42, 58, 46, 50, 44, 41, 55, 57, 60],
			[30, 35, 32, 38, 28, 40, 36, 31, 29, 34, 39, 30, 28, 41, 35, 45, 33, 36, 34, 38, 40],
			[34, 45, 28, 38, 31, 30, 42, 41, 35, 47, 39, 42, 22, 38, 33, 40, 28, 32, 36, 42, 39],
			[41, 25, 35, 40, 29, 34, 42, 39, 36, 41, 39, 28, 29, 36, 45, 44, 39, 37, 41, 38, 44],
			[26, 39, 30, 33, 27, 32, 41, 39, 29, 35, 30, 38, 39, 28, 37, 40, 38, 34, 39, 32, 36],
			[38, 28, 55, 50, 40, 39, 42, 37, 34, 46, 38, 40, 44, 41, 45, 48, 52, 46, 52, 49, 54],
			[22, 41, 30, 25, 28, 44, 39, 38, 36, 37, 31, 42, 31, 29, 21, 35, 36, 34, 39, 34, 43],
			[29, 35, 19, 28, 26, 39, 42, 31, 22, 35, 39, 30, 43, 42, 46, 50, 44, 52, 48, 54, 49],
			[25, 30, 44, 40, 38, 36, 31, 40, 32, 41, 45, 38, 48, 47, 51, 55, 49, 57, 53, 59, 52],
			[40, 18, 22, 33, 27, 44, 39, 28, 25, 42, 26, 37, 26, 19, 34, 28, 32, 27, 34, 30, 36],
			[25, 28, 36, 40, 24, 38, 45, 31, 22, 48, 37, 34, 65, 50, 54, 58, 52, 60, 56, 62, 58],
			[48, 20, 30, 41, 25, 28, 35, 42, 29, 47, 40, 34, 46, 36, 49, 54, 47, 54, 42, 44, 48],
			[35, 50, 40, 38, 41, 29, 28, 47, 31, 50, 39, 32, 48, 34, 27, 35, 41, 49, 30, 47, 37],
			[30, 45, 25, 28, 35, 42, 26, 39, 33, 45, 27, 29, 41, 37, 35, 32, 38, 44, 37, 40, 35]
		]);
		$trainTestDataExam = collect(
			[
				[52, 47, 43, 48, 41, 46, 49, 45, 51, 53, 49, 52, 50, 59, 63, 67, 61, 69, 65, 68, 74],
				[52, 47, 43, 48, 41, 46, 49, 45, 51, 53, 49, 52, 50, 58, 64, 66, 60, 68, 64, 67, 72],
				[40, 45, 42, 48, 38, 50, 46, 41, 39, 44, 49, 40, 38, 51, 45, 55, 43, 46, 44, 48, 50],
				[44, 55, 38, 48, 41, 40, 52, 51, 45, 57, 49, 52, 32, 48, 43, 50, 38, 42, 46, 52, 49],
				[51, 35, 45, 50, 39, 44, 52, 49, 46, 51, 49, 38, 39, 46, 55, 54, 49, 47, 51, 48, 54],
				[36, 49, 40, 43, 37, 42, 51, 49, 39, 45, 40, 48, 49, 38, 47, 50, 48, 44, 49, 42, 46],
				[48, 38, 65, 60, 50, 49, 52, 47, 44, 56, 48, 50, 54, 51, 55, 58, 62, 56, 62, 59, 64],
				[32, 51, 40, 35, 38, 54, 49, 48, 46, 47, 41, 52, 41, 39, 31, 45, 46, 44, 49, 44, 53],
				[39, 45, 29, 38, 36, 49, 52, 41, 32, 45, 49, 40, 53, 52, 56, 60, 54, 62, 58, 64, 59],
				[35, 40, 54, 50, 48, 46, 41, 50, 42, 51, 55, 48, 58, 57, 61, 65, 59, 67, 63, 69, 62],
				[50, 28, 32, 43, 37, 54, 49, 38, 35, 52, 36, 47, 36, 29, 44, 38, 42, 37, 44, 40, 46],
				[35, 38, 46, 50, 34, 48, 55, 41, 32, 58, 47, 44, 75, 60, 64, 68, 62, 70, 66, 72, 68],
				[58, 30, 40, 51, 35, 38, 45, 52, 39, 57, 50, 44, 56, 46, 59, 64, 57, 64, 52, 54, 58],
				[45, 60, 50, 48, 51, 39, 38, 57, 41, 60, 49, 42, 58, 44, 37, 45, 51, 59, 40, 57, 47],
				[40, 55, 35, 38, 45, 52, 36, 49, 43, 55, 37, 39, 51, 47, 45, 42, 48, 54, 47, 50, 45]
			]
		);
		$trainTestDataExam->zip($products)->each(function ($pair) {
			TrainTestData::factory(1)->create([
				'train_test_data' => json_encode($pair[0]),
				'product_id' => $pair[1]['id'],
			]);
		});
	}
}
