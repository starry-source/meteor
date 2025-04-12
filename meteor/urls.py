from django.urls import re_path as path
from . import views
from django.http import FileResponse

base_path = '.'
try:
    import sys
    base_path = sys._MEIPASS
except Exception:
    pass

urlpatterns = [
    # 一行代码实现 assets
    path(r'^lib/(?P<filename>.+)$',
        lambda req,filename:FileResponse(open(base_path+'/templates/lib/'+filename,'rb'))),
    
    path(r'^$', views.index),
    path(r'^edit/(?P<pg>\d+)$', views.edit),
    path(r'^render/(?P<pg>\d+)$', views.render_page),
    path(r'^get/(?P<pg>\d+)$', views.getpage),
    
    path(r'^new$',views.newfile),
    path(r'^open$',views.openfile),
    path(r'^save$',views.savefile),
    
    
    path(r'^api/reorderpages$', views.reorder_pages),
    path(r'^api/(?P<pg>\d+)/update$', views.update_file),
    path(r'^api/(?P<pg>\d+)/add$', views.add_element),
    path(r'^api/(?P<pg>\d+)/delete$', views.delete_element),
    path(r'^api/newpage$', views.newpage),
    path(r'^api/deletepage$', views.deletepage),
    path(r'^api/copypage$', views.copypage),
    
    path(r'^play$', views.play),
    path(r'^export$', views.export_file),
    
    path(r'^api/tags$', views.get_tags),
    path(r'^api/updatetag$', views.update_tag),
    path(r'^api/addtag$', views.add_tag),
    path(r'^api/upload$', views.upload_image),
    path(r'^temp/(?P<filename>.+)$',
        lambda req,filename:FileResponse(open('temp/'+filename,'rb')))
]