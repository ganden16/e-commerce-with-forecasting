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
		Schema::create('product_qna', function (Blueprint $table) {
			$table->id();
			$table->foreignId('product_id');
			$table->foreignId('questioner');
			$table->foreignId('answered')->nullable();
			$table->string('question');
			$table->text('answer')->nullable();
			$table->dateTime('time_question');
			$table->dateTime('time_answer')->nullable();
			$table->timestamps();
		});
	}

	/**
	 * Reverse the migrations.
	 */
	public function down(): void
	{
		Schema::dropIfExists('product_qnas');
	}
};
