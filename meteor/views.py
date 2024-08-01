from django.shortcuts import render
from django.http import HttpResponseRedirect as hrr
from django.http import FileResponse,HttpResponse
from django.http import JsonResponse as jsr
from types import MappingProxyType as nd
from django.views.decorators.clickjacking import xframe_options_sameorigin as xf_same

f={
    'data':[
        {
            'name':'甲',
            'style':{
                'width':'1920px',
                'height':'1080px',
                'background-color':'#fff',
            },
            'item':[
                {
                    'deled':False,
                    'name':'text',
                    'type':'span',
                    'style':{'font-size':'50px',},
                    'prop':{
                        'cnt':'helloworld',
                    },
                }
            ]
        }
    ],
}

b={
    'p':'<p name="{a[name]}" class="ele-{i}" style="{style}" onclick="window.top.beclicked({i});window.top.stop(event)" ondblclick="window.top.editcnt({i},\'cnt\',\'{a[prop][cnt]}\');window.top.stop(event)">{a[prop][cnt]}</p>',
    'span':'<span name="{a[name]}" class="ele-{i}" style="{style}" onclick="window.top.beclicked({i});window.top.stop(event)" ondblclick="window.top.editcnt({i},\'cnt\',\'{a[prop][cnt]}\');window.top.stop(event);">{a[prop][cnt]}</span>',
    'div':'<div name="{a[name]}" class="ele-{i}" style="{style}" onclick="window.top.beclicked({i});window.top.stop(event)"></div>',
}

op={
    'p':{
        'deled':False,
        'prop':{
            'cnt':'文段',
        },
        'style':{
            'display':'block',
            'position':'relative',
        }
    },
    'span':{
        'deled':False,
        'prop':{
            'cnt':'文本',
        },
        'style':{
            'display':'block',
            'position':'relative',
        }
    },
    'div':{
        'deled':False,
        'prop':{
        },
        'style':{
            'display':'block',
            'position':'relative',
            'height':'20px',
            'width':'20px',
            'background-color':'#3a75dc'
        }
    }
}
op=nd(op)

# edps=[
#     {
#         'name':'定位方式',
#         'code':'position',
#         'type':'choose',
#         'op':[
#             {
#                 'name':'默认铺放',
#                 'code':'static',
#                 'reldel':
#             },
#             {
#                 'name':'页面绝对位置',
#                 'code':'absolute'
#             },
#             {
#                 'name':'屏幕绝对位置',
#                 'code':'fixed'
#             },
#             {
#                 'name':'页面相对位置',
#                 'code':'relative'
#             },
#             {
#                 'name':'粘滞',
#                 'code':'sticky'
#             },
#         ]
#     },
#     {
#         'name':'横左坐标',
#         'code':'left',
#         'type':'length',
#     },
#     {
#         'name':'纵上坐标',
#         'code':'top',
#         'type':'length',
#     },
# ]

def rendcss(c):
    ret=''
    for i in c:
        ret+=f'{i}:{c[i]};'
    return ret

def index(req):
    return render(req,'meteor/index.html')

def edit(req):
    return render(req,'meteor/edit.html',{
        'name':'new',
        'file':f
    })

@xf_same
def rendpage(req,pid):
    pid=int(pid)
    p=f['data'][pid]['item']
    ret=f'<html style="{rendcss(f["data"][pid]["style"])}" onclick="window.top.focpage()">'
    idx=0
    for i in p:
        if i['deled']:
            idx+=1
            continue
        ret+=b[i["type"]].format(a=i,style=rendcss(i["style"]),i=idx)
        idx+=1
    return HttpResponse(ret)

def rendop(req,pid,iid):
    # ret=''
    # st=
    # for i in st:
    #     ret+=f'''<div class="op"><p>{i}</p><input class="inp" type="text" value="{st[i]}" onblur="mostyle(\'{i}\',this.value)" onkeyup="if(event.keyCode==13)mostyle(\'{i}\',this.value)" />
    # <a class="a cir dele" onclick="destyle('{i}')"><i class="bi bi-trash3"></i></a></div>'''
    return jsr(f['data'][int(pid)]['item'][int(iid)])

def rendopp(req,pid):
    # ret=''
    return jsr(f['data'][int(pid)]['style'])


def setop(req,pid,iid,k,v):
    if iid=='-1':
        f['data'][int(pid)]['style'][k]=v
    else:
        f['data'][int(pid)]['item'][int(iid)]['style'][k]=v
    return HttpResponse('well')

def setpr(req,pid,iid,k,v):
    print(f['data'][0])
    if iid=='-1':
        f['data'][int(pid)]['prop'][k]=v
    else:
        f['data'][int(pid)]['item'][int(iid)]['prop'][k]=v
    return HttpResponse('well')

def addele(req,pid,eln):
    nel={
        'name':'ele'+str(len(f['data'][int(pid)]['item'])),
        'type':eln,
        'style':dict(),
        # **dict(op[eln])
    }
    for i in op[eln]:
        if type(op[eln][i])==dict:
            nel[str(i)]=dict(op[eln][i])
        else:
            nel[str(i)]=op[eln][i]
            
    # nel.update(dict(op[eln]))
    # print(op)
    f['data'][int(pid)]['item'].append(nel)
    print(f['data'][0])
    return rendpage(req,pid)

def delele(req,pid,iid):
    f['data'][int(pid)]['item'][int(iid)]['deled']=True
    return rendpage(req,pid)

def delop(req,pid,iid,k):
    try:
        if iid=='-1':
            del f['data'][int(pid)]['style'][k]
        else:
            del f['data'][int(pid)]['item'][int(iid)]['style'][k]
    except KeyError:
        pass
    return rendpage(req,pid)
