<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
	/**
	 * Run the migrations.
	 */
	public function up(): void
	{
		Schema::create('products', function (Blueprint $table) {
			$table->id();
			$table->foreignId('best_forecasting_method_id')->nullable();
			$table->foreignId('category_id')->nullable();
			$table->string('name');
			$table->text('description');
			$table->unsignedInteger('price');
			$table->unsignedInteger('weight');
			$table->boolean('isReadyStock')->default(true);
			$table->unsignedInteger('total_sales')->nullable();
			$table->json('other_detail')->nullable();
			$table->string('image')->nullable();
			
			$table->timestamps();
		});
	}

	/**
	 * Reverse the migrations.
	 */
	public function down(): void
	{
		Schema::dropIfExists('products');
	}
};
