<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
	/**
	 * Define the model's default state.
	 *
	 * @return array<string, mixed>
	 */
	public function definition(): array
	{
		$weight = fake()->numberBetween(100, 1200);
		$taste = ['enak', 'gurih', 'manis', 'asin', 'pedas', 'gurih manis', 'asin manis', 'manis enak', 'pedas manis', 'enak gurih', 'terbaik', 'pedas asin', 'manis pedas', 'asam manis', 'pedas gurih', 'gurih asin', 'pedas asam', 'pedas gurih manis', 'manis asam', 'manis legit', 'asin pedas', 'manis gurih', 'gurih pedas', 'kecut', 'manis lembut', 'gurih segar', 'pedas nikmat', 'lezat', 'segar asam', 'manis asin', 'pedas segar', 'gurih renyah', 'pedas kuat', 'gurih lembut', 'manis asam gurih', 'gurih asam', 'asin segar', 'manis segar', 'pedas berani', 'manis lembut gurih', 'asin kecut'];
		$muat = 1000 / $weight >= 1 ? floor(1000 / $weight) : 0;
		$other_detail = [
			// 'berat ' . $weight . ' gram',
			'rasa ' . $taste[array_rand($taste)]
		];
		// if ($muat != 0) {
		// 	$other_detail[] = 'sekali ongkir bisa muat ' . (int)$muat . ' item';
		// }

		return [
			'name' => fake()->name(),
			'description' => fake()->text(300),
			// 'price' => 1,
			'price' => intval(fake()->numberBetween(10000, 100000)),
			'isReadyStock' => fake()->boolean(85),
			'total_sales' => fake()->numberBetween(70, 210),
			'weight' => $weight,
			// 'best_forecasting_method_id' => fake()->numberBetween(1, 18),
			'category_id' => fake()->numberBetween(1, 6),
			'image' => env('APP_URL') . '/storage/seeders/products/' . rand(1, 33) . '.webp',
			'other_detail' => json_encode($other_detail),
		];
	}
}
