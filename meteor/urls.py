from django.urls import re_path as path
from . import views

urlpatterns = [
    path(r'^lib/(?P<filename>.+)$', lambda req,filename:views.FileResponse(open('./templates/lib/'+filename,'rb'))),
    path(r'^$', views.index),
    path(r'^edit$', views.edit),
    path(r'^edit/(?P<pid>\d+)$', views.rendpage),
    path(r'^edit/(?P<pid>\d+)/get/(?P<iid>\d+)$', views.rendop),
    path(r'^edit/(?P<pid>\d+)/getpg$', views.rendopp),
    path(r'^edit/(?P<pid>\d+)/set/(?P<iid>[\d-]+)/(?P<k>[^/]+)/(?P<v>[^/]*)$', views.setop),
    path(r'^edit/(?P<pid>\d+)/setp/(?P<iid>[\d-]+)/(?P<k>[^/]+)/(?P<v>[^/]*)$', views.setpr),
    path(r'^edit/(?P<pid>\d+)/del/(?P<iid>[\d-]+)/(?P<k>[^/]+)$', views.delop),
    path(r'^edit/(?P<pid>\d+)/add/(?P<eln>[^/]+)$', views.addele),
    path(r'^edit/(?P<pid>\d+)/dele/(?P<iid>[\d]+)$', views.delele),
]