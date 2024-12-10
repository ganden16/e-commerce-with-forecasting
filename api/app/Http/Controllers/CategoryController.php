<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class CategoryController extends Controller
{
	public function index()
	{
		return response()->json(Category::all());
	}

	public function store(Request $request)
	{
		Validator::make($request->all(), [
			'name' => 'required',
			'description' => 'required|min:10',
			'fileImage' => 'image|max:5000',
		], [
			'required' => 'tidak boleh kosong',
			'min' => 'minimal :min karakter',
			'fileImage' => 'file harus gambar (jpeg, png, bmp, gif, or svg) dan ukuran maksimal 5 MB.',
		])->validate();

		$url = null;
		if ($request->hasFile('fileImage')) {
			$path = $request->fileImage->store('images/categories');
			$url = Storage::url($path);
		}
		$newCategory = Category::create([
			'name' => $request->name,
			'description' => $request->description,
			'image' => $url,
		]);
		return response()->json([
			'message' => 'Data kategori berhasil ditambahkan',
			'data' => $newCategory,
		], 201);
	}

	public function show(Category $category)
	{
		return response()->json($category->load('products'), 200);
	}

	public function update(Request $request, Category $category)
	{
		Validator::make($request->all(), [
			'name' => 'required',
			'description' => 'required|min:10',
			'fileImage' => 'image|max:5000',
		], [
			'required' => 'tidak boleh kosong',
			'min' => 'minimal :min karakter',
			'fileImage' => 'file harus gambar (jpeg, png, bmp, gif, or svg) dan ukuran maksimal 5 MB.',
		])->validate();
		$image = $category->image ?? null;
		if ($request->hasFile('fileImage')) {
			if ($category->image && !strpos($image, '/seeders')) {
				$urlImage = explode("/storage", $image, 2);
				$path =  $urlImage[1];
				Storage::delete($path);
			}
			$path = $request->fileImage->store('images/categories');
			$image = Storage::url($path);
		}
		$category->update([
			'name' => $request->name,
			'description' => $request->description,
			'image' => $image,
		]);
		$updatedCategory = Category::find($category->id)->load('products');
		return response()->json([
			'message' => 'Data kategori berhasil diupdate',
			'data' => $updatedCategory,
		], 200);
	}

	public function destroy(Category $category)
	{
		$urlImage = $category->image ?? '';
		if ($urlImage != null && !strpos($urlImage, '/seeders')) {
			$url = explode("/storage", $urlImage, 2);
			$path =  $url[1];
			Storage::delete($path);
		}
		$category->delete();
		return response()->json([
			'message' => 'Data kategori berhasil dihapus',
		], 200);
	}
}
