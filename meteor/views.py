from django.shortcuts import render
from django.http import JsonResponse as jsr, HttpResponse
# from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.clickjacking import xframe_options_sameorigin as xf_same
import json, uuid, os, base64, mimetypes
from pathlib import Path
from django.shortcuts import redirect
# from django.http import FileResponse
import htmlmin
import tkinter as tk
from tkinter import filedialog

# 所有样式模板
styleM = {
    'text': {
        'name':'文本样式',
        'font': {
            'css': 'font-family: \'{value}\';',
            'name': '字体',
            'type': 'select',
            'options': [
                {'name': '预设', 'value': 'inherit'},
                {'name': '宋体', 'value': '宋体'},
                {'name': '仿宋', 'value': '仿宋'}
            ]
        },
        'fontSize': {
            'css': 'font-size: {value}px;',
            'name': '字体大小',
            'type': 'number',
        },
        'color': {
            'css': 'color: {value};',
            'name': '颜色',
            'type': 'color'
        },
        'textAlign': {
            'css': 'text-align: {value};',
            'name': '对齐方式',
            'type': 'select',
            'options': [
                {'name': '靠左', 'value': 'left'},
                {'name': '置中', 'value': 'center'},
                {'name': '靠右', 'value': 'right'}
            ]
        }
    },
    'shape': {
        'name':'形状样式',
        'bgcolor': {
            'css': 'background-color: {value};',
            'name': '背景色',
            'type': 'color'
        },
        'bdrd': {
            'css': 'border-radius: {value}px;',
            'name': '圆角',
            'type': 'number',
        }
    }
} 

htmlM={
    'text': '<span id="ele-{e[id]}" class="element {tags} element-text" data-id="{e[id]}" style="{style}">{e[prop][content]}</span>',
    'rect': '<div id="ele-{e[id]}" class="element {tags} element-rect" data-id="{e[id]}" style="{style}"></div>',
    'image': '<img id="ele-{e[id]}" class="element {tags} element-image" data-id="{e[id]}" style="{style}" src="{e[prop][src]}">',
}

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
                'x': 100,
                'y': 100,
                'width': 1000,
                'height': 500,
                'style': {
                    'shape.bgcolor':'#f2e0ff',
                },
                'tags': []
            },
            {
                'id': 'uuidcode2',
                'type': 'text',
                'prop':{
                    'content':'欢迎'
                },
                'x': 200,
                'y': 200,
                'width': 400,
                'height': 300,
                'style': {
                    'text.color':'#2983cc',
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
                    'delay':0,
                    'prop':{
                        'duration':1
                    }
                }
            ],
            'onclick':[
                {
                    # 点击节点 1
                    'name':'展示背景',
                    'actions':[
                        # 同时播放
                        {
                            'target':'uuidcode2',
                            'type':'fade',
                            'action':'in',
                            'delay':0,
                            'prop':{
                                'duration':1
                            }
                        }
                    ]
                },
                {
                    # 节点 2
                    'name':'淡出内容',
                    'actions':[
                        {
                            'target':'uuidcode1',
                            'type':'fade',
                            'action':'out',
                            'delay':0,
                            'prop':{
                                'duration':1
                            }
                        },
                        {
                            'target':'uuidcode2',
                            'type':'fade',
                            'action':'out',
                            'delay':2,
                            'prop':{
                                'duration':2
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
                'text.fontSize': 150,
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

allanimtype={
    'in':['fade','no'],
    'out':['fade','no'],
}

# 属性模板，其中 tag 键方便 js 中元素和标签 loadprop 的共用
props={
    'tag':{
        'name':{
            'name':'标签名称',
            'type':'text',
        }
    },
    'anim':{
        'in':{
            'fade':{
                'duration': {
                    'name': '持续时间/s',
                    'type': 'number',
                    'default': 0.2
                }
            },
            'no':{
            }
        },
        'out':{
            'fade':{
                'duration': {
                    'name': '持续时间/s',
                    'type': 'number',
                    'default': 0.2
                }
            },
            'no':{
            }
        },
        # 'flyin':{
        #     'direction':{
        #         'name':'方向',
        #         'type':'select',
        #         'options':[
        #             {'name':'上','value':'top'},
        #             {'name':'下','value':'bottom'},
        #             {'name':'左','value':'left'},
        #             {'name':'右','value':'right'}
        #         ]
        #     }
        # },
        # 'flyout':{
        #     'direction':{
        #         'name':'方向',
        #         'type':'select',
        #         'options':[
        #             {'name':'上','value':'top'},
        #             {'name':'下','value':'bottom'},
        #             {'name':'左','value':'left'},
        #             {'name':'右','value':'right'}
        #         ]
        #     }
        # }
    },
    'text':{
        'content':{
            'name':'文本',
            'type':'text'
        }
    },
    'rect':{},
    'image':{
        'src':{
            'name':'图片路径',
            'type':'text'
        },
        'objectFit': {
            'name': '填充方式',
            'type': 'select',
            'options': [
                {'name': '拉伸', 'value': 'fill'},
                {'name': '适应', 'value': 'contain'},
                {'name': '覆盖', 'value': 'cover'},
            ]
        }
    }
}

def getnewele(type):
    allele={
        'text':{
            'type':'text',
            'prop':{
                'content':'新文本'
            },
            'x':100,
            'y':100,
            'width':200,
            'height':50,
            'style':{
                'text.fontSize':30,
                'text.color':'#000000',
            },
            'tags':[]
        },
        'rect':{
            'type':'rect',
            'prop':{},
            'x':100,
            'y':100,
            'width':100,
            'height':50,
            'style':{
                'shape.bgcolor':'#000000',
                'shape.bdrd':0,
            },
            'tags':[]
        },
        'image':{
            'type':'image',
            'prop':{
                'src':'',
                'objectFit':'contain'
            },
            'x':100,
            'y':100,
            'width':200,
            'height':150,
            'style':{},
            'tags':[]
        }
    }
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
    # 渲染嵌套的页面
    # html = render_html(pg)
    # tagscss = render_tag_css()
    # return render(req, 'meteor/page.html', {
    #     'background': f['pages'][0]['background'],
    #     'elements_html': html,
    #     'tagscss':tagscss
    # })
    return render(req,'meteor/page.html',{
        'pg':pg
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
        f['pages'][int(pg)]['elements']=[ele for ele in f['pages'][int(pg)]['elements'] if ele['id']!=data['id']]
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
        'data':f['pages']
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
        'data': f['pages']
    })
    return htmlmin.minify(response, remove_comments=False, remove_empty_space=True)

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