from django.shortcuts import render
from django.http import JsonResponse as jsr, HttpResponse
from django.views.decorators.clickjacking import xframe_options_sameorigin as xf_same
import json, uuid, os, base64, mimetypes
from pathlib import Path
from django.shortcuts import redirect
# from django.http import FileResponse
import htmlmin
import tkinter as tk
from tkinter import filedialog

from .spec import *

# 文件数据
f = {
    'name': '示例',
    'height': 1080,
    'width': 1920,
    'pages': [{
        'background': '#ffffff',
        'elements': [
            {
                'id': 'uuidcode1',
                'type': 'rect',
                'prop':{},
                'x': 560,
                'y': 270,
                'width': 800,
                'height': 490,
                'style': {
                    'shape.bgcolor':'#f7f397',
                    'shape.bdrd':'40'
                },
                'tags': []
            },
            {
                'id': 'uuidcode3',
                'type': 'text',
                'prop':{
                    'content':'欢迎使用'
                },
                'x': 710,
                'y': 330,
                'width': 500,
                'height': 170,
                'style': {
                    'text.color':'#000000',
                },
                'tags': ['title']
            },
            {
                'id': 'uuidcode2',
                'type': 'text',
                'prop':{
                    'content':'Meteor'
                },
                'x': 460,
                'y': 420,
                'width': 1000,
                'height': 300,
                'style': {
                    'text.color':'#2983cc',
                    'text.fontSize':190
                },
                'tags': ['title']
            },
        ],
        'animation':{
            
            'onload':[ # 直接为动画，省去节点名称
                # onload为页面展示时立即播放的动画
                {
                    'target':'uuidcode1',
                    'type':'fade',
                    'action':'in',
                    'delay':0.5,
                    'prop':{
                        'duration':0.5
                    }
                }
            ],
            'onclick':[
                {
                    # 点击节点 1
                    'name':'显示文字',
                    'actions':[
                        # 同时播放
                        {
                            'target':'uuidcode3',
                            'type':'fade',
                            'action':'in',
                            'delay':0,
                            'prop':{
                                'duration':0.5
                            }
                        },
                        {
                            'target':'uuidcode2',
                            'type':'fade',
                            'action':'in',
                            'delay':0.2,
                            'prop':{
                                'duration':1
                            }
                        }
                    ]
                },
                {
                    # 节点 2
                    'name':'淡出背景',
                    'actions':[
                        {
                            'target':'uuidcode1',
                            'type':'fade',
                            'action':'out',
                            'delay':0,
                            'prop':{
                                'duration':0.5
                            }
                        }
                    ]
                }
            ]
        }
    }],
    'tags': {
        'title': {
            'prop':{
                'name':'标题样式'
            },
            'style': {
                'text.fontSize': 100,
                'text.color': '#000000',
                'text.textAlign': 'center',
            }
        },
        'yuanjiao':{
            'prop':{
                'name':'圆角'
            },
            'style':{
                'shape.bdrd':30
            }
        }
    },
}

filepath=None

def getnewele(type):
    ret=allele[type]
    ret['id']=str(uuid.uuid4())
    return ret

def index(req):
    return render(req,'meteor/index.html')

def edit(req,pg):
    # 编辑页面
    if len(f['pages'])==0:
        return render(req,'meteor/edit.html',{
            'pgid':0,
            'file':dict(),
            'stylem':styleM,
            'props':props,
            'tags':f['tags'],
            'allanimtype':(allanimtype),
            'pgnum':len(f['pages'])
        })
    if int(pg) >= len(f['pages']):
        return redirect('/edit/'+str(len(f['pages'])-1))
    if int(pg) < 0:
        return redirect('/edit/0')
    return render(req,'meteor/edit.html',{
        'pgid':pg,
        'file':f['pages'][int(pg)],
        'stylem':styleM,
        'props':props,
        'tags':f['tags'],
        'allanimtype':(allanimtype),
        'pgnum':len(f['pages'])
    })

@xf_same
def render_page(req,pg):
    return render(req,'meteor/page.html',{
        'pg':pg,
        'animStyle':animStyle,
    })

def render_tag_css():
    tagscss=''
    for tag in f['tags']:
        tagscss+='.ele-tag-'+tag+'{'+(''.join([
            ('{['+(']['.join(k.split('.')))+'][css]}').format(styleM)
            .format(value=v)
            for k, v in f['tags'][tag]['style'].items()
        ]))+'}'
        
    return tagscss

def render_html(pg):
    html = ''
    i = 0
    for element in f['pages'][pg]['elements']:
        i+=1
        # 复制一份样式
        style=dict(element['style'])
        
        style_str = f'''
            left: {element['x']}px;
            top: {element['y']}px;
            width: {element['width']}px;
            height: {element['height']}px;
            z-index: {i};
        '''
        # 利用重复嵌套格式化实现模板填充，for tag 中同
        style_str += ''.join([
            ('{['+(']['.join(k.split('.')))+'][css]}').format(styleM)
            .format(value=v)
            for k, v in style.items()
        ])
            
        html += htmlM[element['type']].format(e=element, tags=' ele-tag-'.join(['']+element.get('tags', [])), style=style_str)
    return html

def getpage(req,pg):
    return jsr({
        'background': f['pages'][int(pg)]['background'],
        'elements_html': render_html(int(pg)),
        'tagcss':render_tag_css()
    })

def add_element(req,pg):
    if req.method == 'POST':
        data = json.loads(req.body.decode())
        f['pages'][int(pg)]['elements'].append(getnewele(data['type']))
        return jsr(f['pages'][int(pg)])
    return jsr({'status': 'error'})

def delete_element(req,pg):
    if req.method == 'POST':
        data = json.loads(req.body.decode())
        for el in data['elements']:
            # 删除元素
            f['pages'][int(pg)]['elements']=[ele for ele in f['pages'][int(pg)]['elements'] if ele['id']!=el['id']]
        return jsr(f['pages'][int(pg)])
    return jsr({'status': 'error'})

def update_file(req,pg):
    # 更新页面元素，同步更改
    if req.method == 'POST':
        global f
        data = json.loads(req.body.decode())
        f['pages'][int(pg)]=data
        return jsr({'status': 'ok'})
    return jsr({'status': 'error'})

def update_tag(req):
    # 同步文档中的 tag 样式的更改
    if req.method == 'POST':
        global f
        data = json.loads(req.body.decode())
        f['tags']=data
        return jsr({'status': 'ok'})
    return jsr({'status': 'error'})

def get_tags(req):
    return jsr(f['tags'])

def upload_image(req):
    if req.method == 'POST' and req.FILES.get('image'):
        image = req.FILES['image']
        # 创建临时文件夹
        upload_dir = Path('temp/images')
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        # 保存文件
        filename = str(uuid.uuid4()) + os.path.splitext(image.name)[1]
        filepath = upload_dir / filename
        with open(filepath, 'wb+') as f:
            for chunk in image.chunks():
                f.write(chunk)
                
        return jsr({
            'status': 'ok',
            'url': f'/temp/images/{filename}'
        })
    return jsr({'status': 'error'})

def play(req):
    pages_html = []
    for i in range(len(f['pages'])):
        pages_html.append({
            'background': f['pages'][i]['background'],
            'html': render_html(i)
        })
    return render(req, 'meteor/export.html', {
        'pages': pages_html,
        'width': f['width'],
        'height': f['height'],
        'tagcss': render_tag_css(),
        'data':f['pages'],
        'animStyle':animStyle,
    })

def export_file(req):
    pages_html = []
    for i in range(len(f['pages'])):
        # 收集所有图片,转换为 data URI
        html = render_html(i)
        for element in f['pages'][i]['elements']:
            if element['type'] == 'image' and element['prop']['src'].startswith('/temp/'):
                try:
                    with open('.' + element['prop']['src'], 'rb') as img:
                        content = base64.b64encode(img.read()).decode()
                        mime = mimetypes.guess_type(element['prop']['src'])[0]
                        data_uri = f'data:{mime};base64,{content}'
                        html = html.replace(element['prop']['src'], data_uri)
                except:
                    pass
                    
        pages_html.append({
            'background': f['pages'][i]['background'],
            'html': html 
        })

    response = render(req, 'meteor/export.html', {
        'pages': pages_html,
        'width': f['width'],
        'height': f['height'],
        'tagcss': render_tag_css(),
        'data': f['pages'],
        'animStyle':animStyle,
    }).content.decode()
    return HttpResponse(htmlmin.minify(response, remove_comments=False, remove_empty_space=True))

def add_tag(req):
    if req.method == 'POST':
        global f
        data = json.loads(req.body.decode())
        if data['name'] not in f['tags']:
            f['tags'][data['name']]={
                'prop':{
                    'name':data['name']
                },
                'style':{
                }
            }
            return jsr({'status': 'ok'})
    return jsr({'status': 'error'})

def newpage(req):
    # 新建页面
    global f
    # data = json.loads(req.body.decode())
    f['pages'].append({
        'background': f['pages'][-1]['background'] if len(f['pages'])>0 else '#ffffff',
        'elements': [],
        'animation':{
            'onload':[],
            'onclick':[]
        }
    })
    return redirect('/edit/'+str(len(f['pages'])-1))
def deletepage(req):
    if req.method == 'POST':
        global f
        data = json.loads(req.body.decode())
        f['pages']=[ele for i,ele in enumerate(f['pages']) if i!=data['page']]
        return jsr({'status': 'ok'})
    return jsr({'status': 'error'})

def copypage(req):
    # 复制页面
    if req.method == 'POST':
        global f
        data = json.loads(req.body.decode())
        # f['pages'].append(f['pages'][data['page']])
        f['pages'].insert(data['page']+1,f['pages'][data['page']])
        return jsr({'status': 'ok'})
    return jsr({'status': 'error'})

def reorder_pages(req):
    if req.method == 'POST':
        global f
        data = json.loads(req.body.decode())
        new_pages = []
        for i in data['order']:
            new_pages.append(f['pages'][i])
        f['pages'] = new_pages
        return jsr({'status': 'ok'})
    return jsr({'status': 'error'})

def newfile(req):
    # 新建文件
    global f
    f={
        'name': '新文件',
        'height': 1080,
        'width': 1920,
        'pages': [],
        'tags': {}
    }
    return redirect('/edit/0')

def _select_file():
    root = tk.Tk()
    root.withdraw()  # 隐藏主窗口
    root.attributes("-topmost", True)
    root.update()

    file_path = filedialog.askopenfilename(
        title="选择文件",
        filetypes=(("Json 文件", "*.json"), ("All files", "*.*"))
    )
    root.destroy()
    return file_path

def openfile(req):
    # 展示选取窗口，浏览并打开文件
    global f
    
    path=_select_file()
    if not path:
        return jsr({'status': 'cancelled'})
    
    try:
        with open(path, 'r', encoding='utf-8') as file:
            f = json.loads(file.read())
        return jsr({'status': 'ok'})
    except Exception as e:
        return jsr({'status': 'error', 'message': str(e)})
            

def _select_path():
    root = tk.Tk()
    root.withdraw()  # 隐藏主窗口
    root.attributes("-topmost", True)
    root.update()

    file_path = filedialog.asksaveasfilename(
        title="保存文件",
        defaultextension=".json",
        filetypes=(("Json 文件", "*.json"), ("All files", "*.*"))
    )
    root.destroy()
    return file_path

def savefile(req):
    global filepath
    if filepath is None:
        # 展示选取窗口，浏览并保存文件
        filepath=_select_path()
        if not filepath:
            return jsr({'status': 'cancelled'})
    open(filepath, 'w', encoding='utf-8').write(json.dumps(f,ensure_ascii=False,indent=4))
    return jsr({'status': 'ok'})