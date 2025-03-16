<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class ProductController extends Controller
{
	public function index(Request $request)
	{
		$search = $request->query('search');
		$category = $request->query('kategori');
		$products = null;

		if ($category) {
			$products = Product::query()->whereHas('category', function ($query) use ($category) {
				$query->where('name', $category);
			});
			if ($products->get()->count() < 1) {
				return response()->json([
					'message' => 'Tidak ditemukan produk'
				], 404);
			}
			return response()->json($products->get(), 200);
		} else {
			$products = Product::search($search)->query(function ($builder) {
				$builder->with(['bestForecastingMethod', 'category', 'trainTest'])
					->orderBy('updated_at', 'desc');
			});
			if ($products->get()->count() < 1) {
				return response()->json([
					'message' => 'Tidak ditemukan produk'
				], 404);
			}
			return response()->json($products->get(), 200);
		}
	}

	public function store(Request $request)
	{
		$isReadyStock = $request->readyStock == 'true' ? true : false;
		$bestMethod = $request->best_forecasting_method_id;

		Validator::make($request->all(), [
			'name' => 'required',
			'category_id' => 'required|numeric',
			'description' => 'required|min:10',
			'price' => 'required|numeric',
			'weight' => 'required|numeric',
			'fileImage' => 'image|max:5000',
			'other_detail' => 'required|json',
		], [
			'required' => 'tidak boleh kosong',
			'numeric' => 'harus berupa angka',
			'fileImage' => 'file harus gambar (jpeg, png, bmp, gif, or svg) dan ukuran maksimal 5 MB.',
			'min' => 'minimal :min karakter',
			'json' => 'other_detail harus dalam format JSON yang valid.',

		])->validate();

		$otherDetails = json_decode($request->input('other_detail'), true);

		if (!is_array($otherDetails) || empty($otherDetails)) {
			throw ValidationException::withMessages([
				'other_detail' => 'Detail produk tidak boleh kosong.'
			]);
		}

		foreach ($otherDetails as $detail) {
			if (!is_string($detail) || strlen($detail) < 1) {
				throw ValidationException::withMessages([
					'other_detail' => "Pastikan input detail lainnya tidak ada yang kosong"
				]);
			}
		}

		$url = null;
		if ($request->hasFile('fileImage')) {
			$path = $request->fileImage->store('images/products');
			$url = Storage::url($path);
		}
		$newProduct = Product::create([
			'name' => $request->name,
			// 'best_forecasting_method_id' => $bestMethod,
			'category_id' => $request->category_id,
			'description' => $request->description,
			'price' => doubleval($request->price),
			'other_detail' => json_encode($otherDetails),
			'weight' => doubleval($request->weight),
			'isReadyStock' => $isReadyStock,
			'image' => $url,
		])->load('bestForecastingMethod');

		if (!empty(json_decode($bestMethod))) {
			$newProduct->bestForecastingMethod()->sync(($bestMethod));
		}

		return response()->json([
			'message' => 'Data produk berhasil ditambahkan',
			'data' => $newProduct,
		], 201);
	}

	public function show(Product $product)
	{
		return response()->json($product->load(['bestForecastingMethod', 'category']), 200);
	}

	public function update(Request $request, Product $product)
	{
		$isReadyStock = $request->readyStock == 'true' ? true : false;
		$bestMethod = $request->best_forecasting_method_id;

		Validator::make($request->all(), [
			'name' => 'required',
			'description' => 'required|min:10',
			'category_id' => 'required',
			'price' => 'required|numeric',
			'weight' => 'required|numeric',
			'fileImage' => 'image|max:5000',
			'other_detail' => 'required|json',
		], [
			'required' => 'tidak boleh kosong',
			'numeric' => 'harus berupa angka',
			'fileImage' => 'file harus gambar (jpeg, png, bmp, gif, or svg) dan ukuran maksimal 5 MB.',
			'min' => 'minimal :min karakter',
			'json' => 'other_detail harus dalam format JSON yang valid.',
		])->validate();

		$otherDetails = json_decode($request->input('other_detail'), true);

		if (!is_array($otherDetails) || empty($otherDetails)) {
			throw ValidationException::withMessages([
				'other_detail' => 'Detail produk tidak boleh kosong.'
			]);
		}

		foreach ($otherDetails as $detail) {
			if (!is_string($detail) || strlen($detail) < 1) {
				throw ValidationException::withMessages([
					'other_detail' => "Pastikan input detail lainnya tidak ada yang kosong"
				]);
			}
		}

		$image = $product->image ?? null;
		if ($request->hasFile('fileImage')) {
			if ($product->image && !strpos($image, '/seeders')) {
				$urlImage = explode("/storage", $image, 2);
				$path =  $urlImage[1];
				Storage::delete($path);
			}
			$path = $request->fileImage->store('images/products');
			$image = Storage::url($path);
		}
		$product->update([
			'name' => $request->name,
			'category_id' => $request->category_id,
			'isReadyStock' => $isReadyStock,
			// 'best_forecasting_method_id' => $bestMethod,
			'description' => $request->description,
			'price' => doubleval($request->price),
			'weight' => doubleval($request->weight),
			'image' => $image,
			'other_detail' => json_encode($otherDetails),
		]);

		if (!empty(json_decode($bestMethod))) {
			$product->bestForecastingMethod()->sync(json_decode($bestMethod));
		}

		$updatedProduct = Product::find($product->id)->load('bestForecastingMethod');
		return response()->json([
			'message' => 'Data produk berhasil diupdate',
			'data' => $updatedProduct,
		], 200);
	}

	public function destroy(Product $product)
	{
		$urlImage = $product->image ?? '';
		if ($urlImage != null && !strpos($urlImage, '/seeders')) {
			$url = explode("/storage", $urlImage, 2);
			$path =  $url[1];
			Storage::delete($path);
		}
		$product->delete();
		return response()->json([
			'message' => 'Data produk berhasil dihapus',
		], 200);
	}
}
