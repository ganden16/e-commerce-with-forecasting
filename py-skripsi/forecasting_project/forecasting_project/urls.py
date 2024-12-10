from django.urls import path, include

urlpatterns = [
    path('api/', include('forecasting_api.urls')),
]
