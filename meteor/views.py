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

# 示例文件数据
f = {
    "name": "示例",
    "height": 1080,
    "width": 1920,
    "pages": [
        {
            "background": "#ffffff",
            "elements": [
                {
                    "type": "text",
                    "prop": {
                        "content": "欢迎使用"
                    },
                    "style": {
                        "text.fontSize": "55",
                        "text.color": "#000000",
                        "base.x": 821,
                        "base.y": 438,
                        "base.width": 277,
                        "base.height": 87,
                        "text.font": "inherit",
                        "text.textAlign": "center"
                    },
                    "tags": [],
                    "id": "333b2d4a-1991-4c73-b803-0b0c58ff66aa"
                },
                {
                    "type": "text",
                    "prop": {
                        "content": "Meteor"
                    },
                    "style": {
                        "text.fontSize": "100",
                        "text.color": "#2983cc",
                        "base.x": 754,
                        "base.y": 493,
                        "base.width": 411,
                        "base.height": 158,
                        "text.textAlign": "center"
                    },
                    "tags": [],
                    "id": "2d91178c-dcb1-4124-8c7a-b2a7e59e94a7"
                },
                {
                    "type": "image",
                    "prop": {
                        "src": "/temp/images/acdf2ab7-41f4-4798-a7ab-96186bb0418b.svg",
                        "objectFit": "contain"
                    },
                    "style": {
                        "base.x": 550,
                        "base.y": 427,
                        "base.width": 233,
                        "base.height": 225,
                        "effect.opacity": "0"
                    },
                    "tags": [],
                    "id": "9c4161ac-5b6b-47a4-92f5-b971ea36ccbe"
                },
                {
                    "type": "text",
                    "prop": {
                        "content": "专业的演示文稿制作器，支持 Html 打包"
                    },
                    "style": {
                        "text.fontSize": 30,
                        "text.color": "#000000",
                        "base.x": 837,
                        "base.y": 575,
                        "base.width": 640,
                        "base.height": 51,
                        "effect.opacity": "0"
                    },
                    "tags": [],
                    "id": "c2f43fdc-574a-4e20-b065-ff830977737b"
                }
            ],
            "animation": [
                {
                    "prop": {
                        "when": "click",
                        "duration": 1
                    },
                    "elements": {
                        "333b2d4a-1991-4c73-b803-0b0c58ff66aa": {
                            "base.x": 821,
                            "base.y": 340,
                            "base.width": 277,
                            "base.height": 87,
                            "anim.delay": 0,
                            "anim.duration": "0.45",
                            "effect.opacity": "0",
                            "anim.timingFunction": "ease-in"
                        },
                        "2d91178c-dcb1-4124-8c7a-b2a7e59e94a7": {
                            "base.x": 898,
                            "base.y": 440,
                            "base.width": 411,
                            "base.height": 158,
                            "anim.delay": "0.14",
                            "anim.duration": "0.5",
                            "text.color": "#000000",
                            "text.fontSize": "100"
                        },
                        "9c4161ac-5b6b-47a4-92f5-b971ea36ccbe": {
                            "base.x": 630,
                            "base.y": 427,
                            "base.width": 233,
                            "base.height": 225,
                            "effect.opacity": "100",
                            "anim.delay": 0,
                            "anim.duration": 1,
                            "anim.timingFunction": "ease-out"
                        },
                        "c2f43fdc-574a-4e20-b065-ff830977737b": {
                            "base.x": 937,
                            "base.y": 575,
                            "base.width": 640,
                            "base.height": 51,
                            "anim.duration": "0.59",
                            "effect.opacity": "100",
                            "anim.delay": "0.39",
                            "anim.timingFunction": "ease-out"
                        }
                    }
                }
            ]
        }
    ],
    "tags": {
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
    }
}

filepath=None


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

def render_css(pg):
    css=''
    i = 0
    for ele in f['pages'][pg]['elements']:
        i+=1
        # 复制一份样式，可考虑移除
        style=dict(ele['style'])
        # 利用重复嵌套格式化实现模板填充
        css += f'#ele-{ele["id"]}{{z-index:{i};'+''.join([
            ('{['+(']['.join(k.split('.')))+'][css]}').format(styleM)
            .format(value=v)
            for k, v in style.items()
        ])+'}\n'

    for i,kf in enumerate(f['pages'][pg]['animation']):
        for eleid in kf['elements']:
            ele=kf['elements'][eleid]
            css+=f'.page.active.kf-{i} #ele-{eleid}'+'{'+(''.join([
                ('{['+(']['.join(k.split('.')))+'][css]}').format(styleM)
                .format(value=v)
                for k, v in ele.items()
            ]))+'}\n'
    return css

def render_html(pg):
    html = ''
    for element in f['pages'][pg]['elements']:
            
        html += htmlM[element['type']].format(e=element, tags=' ele-tag-'.join(['']+element.get('tags', [])))
    return html

def getpage(req,pg):
    print(render_css(int(pg)))
    return jsr({
        'background': f['pages'][int(pg)]['background'],
        'elements_html': render_html(int(pg)),
        'tagcss':render_tag_css(),
        'css': render_css(int(pg))
    })

def add_element(req,pg):
    if req.method == 'POST':
        data = json.loads(req.body.decode())
        newele=allele[data['type']]
        newele['id']=str(uuid.uuid4())
        f['pages'][int(pg)]['elements'].append(newele)
        anele=newele
        anele['duration']=0.1
        anele['delay']=0
        for an in f['pages'][int(pg)]['animation']:
            an['elements'][newele['id']]=anele
        return jsr(f['pages'][int(pg)])
    return jsr({'status': 'error'})

def delete_element(req,pg):
    if req.method == 'POST':
        data = json.loads(req.body.decode())
        # data={elements:[{id:...},{id:...}]}
        for el in data['elements']:
            f['pages'][int(pg)]['elements']=[ele for ele in f['pages'][int(pg)]['elements'] if ele['id']!=el['id']]
            for kf in f['pages'][int(pg)]['animation']:
                kf['elements'] = {eid: ele for eid, ele in kf['elements'].items() if eid != el['id']}
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
            'html': render_html(i),
        })
    return render(req, 'meteor/export.html', {
        'pages': pages_html,
        'width': f['width'],
        'height': f['height'],
        'tagcss': render_tag_css(),
        'css': [render_css(i) for i in range(len(f['pages']))],
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
        'css': [render_css(i) for i in range(len(f['pages']))],
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
        'animation':[]
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