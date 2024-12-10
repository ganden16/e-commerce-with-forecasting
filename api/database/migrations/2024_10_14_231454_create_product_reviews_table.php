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
		Schema::create('product_reviews', function (Blueprint $table) {
			$table->id();
			$table->foreignId('order_id');
			$table->foreignId('reviewer')->nullable();
			$table->foreignId('reply_by')->nullable();
			$table->foreignId('product_id');
			$table->unsignedInteger('stars');
			$table->string('review');
			$table->string('reply')->nullable();
			$table->dateTime('time_review')->nullable();
			$table->dateTime('time_reply')->nullable();
			$table->timestamps();
		});
	}

	/**
	 * Reverse the migrations.
	 */
	public function down(): void
	{
		Schema::dropIfExists('product_reviews');
	}
};
