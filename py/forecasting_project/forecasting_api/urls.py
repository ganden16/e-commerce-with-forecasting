from django.urls import path
from . import views

urlpatterns = [
	 path('', views.check_api_status, name='check_api_status'),
    path('forecast/arima', views.arima_forecast, name='arima_forecast'),
    path('forecast/ses', views.simple_exponential_smoothing_forecast, name='simple_exponential_smoothing_forecast'),
    path('forecast/ar', views.auto_regressive_forecast, name='auto_regressive_forecast'),
   #  path('forecast/hw', views.holt_winters_forecast, name='holt_winters_forecast'),
   #  path('forecast/lr', views.linear_regression_forecast, name='linear_regression_forecast'),
   #  path('forecast/rf', views.random_forest_forecast, name='random_forest_forecast'),
   #  path('forecast/svr', views.svr_forecast, name='svr_forecast'),
   #  path('forecast/xgboost', views.xgboost_forecast, name='xgboost_forecast'),
    path('forecast/sma', views.single_moving_average_forecast, name='single_moving_average_forecast'),
    path('forecast/dma', views.double_moving_average_forecast, name='double_moving_average_forecast'),
    path('forecast/wma', views.weighted_moving_average_forecast, name='weighted_moving_average_forecast'),
   #  path('forecast/least-square', views.least_squares_forecast, name='least_squares_forecast'), sama dengan linear regression
   #  path('forecast/gaussian', views.gpr_forecast, name='gpr_forecast'),
    path('forecast/lstm', views.lstm_forecast, name='lstm_forecast'),
   #  path('forecast/bayesian', views.bayesian_regression_forecast, name='bayesian_regression_forecast'),
   #  path('forecast/polynomial', views.polynomial_regression_forecast, name='polynomial_regression_forecast'),
   #  path('forecast/knn', views.knn_forecast, name='knn_forecast'),
   #  path('forecast/dt', views.decision_tree_forecast, name='decision_tree_forecast'),
   #  path('forecast/gb', views.gradient_boosting_forecast, name='gradient_boosting_forecast'),
   #  path('forecast/elasticnet', views.elasticnet_forecast, name='elasticnet_forecast'),
   #  path('forecast/lasso', views.lasso_forecast, name='lasso_forecast'),
    path('forecast/modelling', views.modelling, name='modelling'),
    path('forecast/all', views.all_forecast, name='all_forecast'),
    path('forecast/best-method', views.best_method_forecast, name='best_method_forecast'),
]