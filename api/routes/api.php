<?php

use App\Helper\RajaOngkir;
use App\Helper\Whatsaap;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ForecastingController;
use App\Http\Controllers\LandingPageController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProductQnaController;
use App\Http\Controllers\ProductReviewController;
use App\Http\Controllers\ShipmentController;
use App\Http\Controllers\UserController;
use App\Mail\invoiceEmail;
use App\Models\City;
use App\Models\Province;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Route;
use Laravel\Socialite\Facades\Socialite;

Route::get('/tes-email', function () {
	try {
		Mail::to('alvindian85@gmail.com')->send(new invoiceEmail());
		return 'sip';
	} catch (\Throwable $th) {
		return $th;
	}
});


Route::get('/info', function  () {
	return  phpinfo();
});

Route::get('/dashboard', [DashboardController::class, 'index'])->middleware('auth:sanctum');
Route::post('/payment/check-transaction-token', [PaymentController::class, 'checkTransactionToken'])->middleware('auth:sanctum');
Route::post('/payment/continue-payment', [PaymentController::class, 'continuePayment'])->middleware('auth:sanctum');
Route::post('/midtrans/notification', [PaymentController::class, 'handleNotification']);

Route::prefix('auth')->group(function () {
	Route::get('/me', [AuthController::class, 'me'])->middleware('auth:sanctum');
	Route::post('/login', [AuthController::class, 'login']);
	Route::post('/register', [AuthController::class, 'register']);
	Route::post('/add-admin', [AuthController::class, 'addAdmin']);
	Route::put('/update-profile', [AuthController::class, 'updateProfile'])->middleware('auth:sanctum');
	Route::put('/change-password', [AuthController::class, 'changePassword'])->middleware('auth:sanctum');
	Route::delete('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

	Route::post('/send-otp-forgot-password', [AuthController::class, 'sendOtpForgotPassword']);
	Route::get('/otp-expiry', [AuthController::class, 'getOtpExpiry']);
	Route::put('/confirm-forgot-password', [AuthController::class, 'confirmForgotPassword']);

	Route::get('/google', function () {
		return Socialite::driver('google')->stateless()->redirect();
	});
	Route::get('/google/redirect', [AuthController::class, 'googleRedirectLogin']);
	Route::post('/complete-profile', [AuthController::class, 'completeProfile'])->middleware('auth:sanctum');
});

Route::prefix('region')->group(function () {

	//info: jatim=11, sidoarjo=409, gedangan=5634, 5631-5648
	Route::get('/province', function () {
		$province = Province::all();
		return response()->json($province);
	});
	Route::get('/city/{provinceId}', function ($provinceId) {
		$city = City::where('province_id', $provinceId)->get();
		return response()->json($city);
	});
	Route::get('/subdistrict', function (Request $request) {
		$cityId = $request->query('cityId') ?? null;
		$subdistrictId = $request->query('subdistrictId') ?? null;
		$subdistricts = RajaOngkir::getAllSubdistricts($cityId, $subdistrictId);
		return response()->json($subdistricts);
	});
});

Route::prefix('landing-page')->group(function () {
	Route::get('/', [LandingPageController::class, 'index']);
});

Route::prefix('cart')->middleware('auth:sanctum')->group(function () {
	Route::get('/', [CartController::class, 'getAllCarts']);
	Route::post('/buy-again', [CartController::class, 'buyAgain']);
	Route::post('/', [CartController::class, 'addCart']);
	Route::put('/', [CartController::class, 'updateQuantity']);
	Route::delete('/{cartId}', [CartController::class, 'deleteCart']);
});

Route::prefix('shipment')->group(function () {
	Route::post('/cost', [ShipmentController::class, 'cost']);
	Route::post('/tracking', [ShipmentController::class, 'tracking']);
});

Route::prefix('order')->group(function () {
	Route::get('/orders', [OrderController::class, 'getOrders'])->middleware('auth:sanctum');
	Route::get('/by-product/{productId}', [OrderController::class, 'getOrderByproduct'])->middleware('auth:sanctum');
	Route::get('/laporan', [OrderController::class, 'laporanPenjualan'])->middleware('auth:sanctum');
	Route::get('/orders/{orderCode}', [OrderController::class, 'getOneOrder'])->middleware('auth:sanctum');
	Route::get('/my-order', [OrderController::class, 'myOrder'])->middleware('auth:sanctum');
	Route::post('/create-order', [OrderController::class, 'createOrder'])->middleware('auth:sanctum');
	Route::put('/shipping-order/{orderCode}', [OrderController::class, 'shippingOrder'])->middleware('auth:sanctum');
	Route::put('/complete-order/{orderCode}', [OrderController::class, 'completeOrder'])->middleware('auth:sanctum');
	Route::put('/cancel-order-and-refund', [OrderController::class, 'cancelOrderAndRefund'])->middleware('auth:sanctum');
	Route::get('/detail/{order_code}', [OrderController::class, 'detailOrder'])->middleware('auth:sanctum');
});

Route::prefix('forecast')->group(function () {
	Route::get('/', [ForecastingController::class, 'getAllMethods']);
	Route::post('/all-method', [ForecastingController::class, 'all']);
	Route::post('/best-method', [ForecastingController::class, 'bestMethod']);
	Route::post('/modelling', [ForecastingController::class, 'modelling']);
	Route::get('/all-train-test-data', [ForecastingController::class, 'getAllTrainTestData']);
	Route::get('/train-test-data/{product_id}', [ForecastingController::class, 'getTrainTestData']);
	Route::post('/train-test-data', [ForecastingController::class, 'updateOrCreateTrainTestData']);
	Route::put('/product-forecasting-method/{product}', [ForecastingController::class, 'updateProductForecastingMethod']);
	Route::post('/{method}', [ForecastingController::class, 'index']);
});

Route::apiResource('product', ProductController::class);

Route::prefix('review')->group(function () {
	Route::get('/', [ProductReviewController::class, 'getProductReviews']);
	Route::get('/by-order/{orderCode}', [ProductReviewController::class, 'getReviewsByOrder']);
	Route::post('/', [ProductReviewController::class, 'updateOrCreateReview'])->middleware('auth:sanctum');
	Route::put('/{productReviewId}', [ProductReviewController::class, 'updateOrCreateReplyReview'])->middleware('auth:sanctum');
});

Route::prefix('qna')->group(function () {
	// Route::get('/', [ProductQnaController::class, 'getAllQna']);
	Route::get('/', [ProductQnaController::class, 'getProductQna']);
	Route::post('/', [ProductQnaController::class, 'addQuestion'])->middleware('auth:sanctum');
	Route::put('/{productQnaId}', [ProductQnaController::class, 'updateOrCreateAnswer'])->middleware('auth:sanctum');
});

Route::apiResource('category', CategoryController::class);

Route::prefix('users')->group(function () {
	Route::get('/user', [UserController::class, 'getAllUsers']);
	Route::get('/user/{id}', [UserController::class, 'showUser']);
	Route::get('/admin', [UserController::class, 'getAllAdmins']);
	Route::get('/admin/{id}', [UserController::class, 'showAdmin']);
	Route::post('/admin', [UserController::class, 'addAdmin']);
});
