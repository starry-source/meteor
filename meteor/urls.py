from django.urls import re_path as path
from . import views
from django.http import FileResponse

urlpatterns = [
    path(r'^lib/(?P<filename>.+)$', lambda req,filename:FileResponse(open('./templates/lib/'+filename,'rb'))),
    path(r'^$', views.index),
    path(r'^edit/(?P<pg>\d+)$', views.edit),
    path(r'^render/(?P<pg>\d+)$', views.render_page),
    path(r'^api/(?P<pg>\d+)/update$', views.update_file),
    path(r'^api/(?P<pg>\d+)/add$', views.add_element),
    path(r'^api/(?P<pg>\d+)/delete$', views.delete_element),
    path(r'^api/tags$', views.get_tags),
    path(r'^api/updatetag$', views.update_tag),
    path(r'^api/addtag$', views.add_tag)
]