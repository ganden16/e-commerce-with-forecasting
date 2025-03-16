<?php

namespace App\Http\Controllers;

use App\Models\ProductQna;
use Illuminate\Http\Request;

class ProductQnaController extends Controller
{
	public function getAllQna()
	{
		$data = ProductQna::with('product', 'questioner', 'answered')->orderBy('updated_at', 'desc')->get();
		return response()->json($data);
	}
	public function getProductQna(Request $request)
	{
		$productQna = ProductQna::query();
		if ($request->query('productId')) {
			$productQna->where('product_id', $request->query('productId'));
		}
		if ($request->query('notAnswered') == 'true') {
			$productQna->whereNull('answer');
		}

		return response()->json($productQna->orderBy('updated_at', 'desc')->get()->load('questioner', 'answered', 'product'));
	}
	public function addQuestion(Request $request)
	{
		$userId = $request->user()->id;

		$request->validate([
			'question' => 'required|string|max:255',
		], [
			'question.required' => 'tuliskan pertanyaanmu dulu',
			'max' => 'pertanyaanmu terlalu panjang, maksimal :max karakter'
		]);

		ProductQna::create([
			'product_id' => $request->productId,
			'questioner' => $userId,
			'question' => $request->question,
			'time_question' => now()
		]);

		return response()->json([
			'message' => 'Berhasil menambahkan pertanyaan'
		]);
	}
	public function updateOrCreateAnswer(Request $request, $productQnaId)
	{
		$productQna = ProductQna::where('id', $productQnaId)->first();
		$adminId = $request->user()->id;

		$request->validate([
			'answer' => 'required|string',
		], [
			'answer.required' => 'isikan jawaban dulu',
		]);

		$productQna->update([
			'answered' => $adminId,
			'answer' => $request->answer,
			'time_answer' => now()
		]);

		return response()->json([
			'message' => 'Berhasil menambahkan jawaban'
		]);
	}
}
