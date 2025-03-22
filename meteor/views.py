from django.shortcuts import render
from django.http import JsonResponse as jsr
# from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.clickjacking import xframe_options_sameorigin as xf_same
import json, uuid

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
    'shape': '<div id="ele-{e[id]}" class="element {tags} element-shape" data-id="{e[id]}" style="{style}"></div>',
}

# 文件数据
f = {
    'name': '示例',
    'height': 1080,
    'width': 1920,
    'pages': [{
        'background': '#ffffff',
        'elements': [{
            'id': str(uuid.uuid4()),
            'type': 'text',    # text 或 shape
            'prop':{
                'content':'欢迎'
            },
            'x': 100,
            'y': 100,
            'width': 200,
            'height': 100,
            'style': {
                'text.color':'#2983cc',
            },
            'tags': []
        }]
    }],
    'tags': {
        'title': {
            'prop':{
                'name':'标题文本'
            },
            'style': {
                'text.fontSize': 80,
                'text.color': '#000000',
                'text.textAlign': 'center',
            }
        }
    }
}

# 属性模板，其中 tag 键方便 js 中元素和标签 loadprop 的共用
props={
    'tag':{
        'name':{
            'name':'标签名称',
            'type':'text',
        }
    },
    'text':{
        'content':{
            'name':'文本',
            'type':'text'
        }
    },
    'shape':{}
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
        'shape':{
            'type':'shape',
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
        }
    }
    ret=allele[type]
    ret['id']=str(uuid.uuid4())
    return ret

def index(req):
    return render(req,'meteor/index.html')

def edit(req,pg):
    # 编辑页面
    return render(req,'meteor/edit.html',{
        'pgid':pg,
        'file':f['pages'][int(pg)],
        'stylem':styleM,
        'props':props,
        'tags':f['tags']
    })

@xf_same
def render_page(req,pg):
    # 渲染嵌套的页面
    html = ''
    i=0
    for element in f['pages'][int(pg)]['elements']:
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
    
    # 处理 tag 样式，以 class 方式设置
    tagscss=''
    for tag in f['tags']:
        tagscss+='.ele-tag-'+tag+'{'+(''.join([
            ('{['+(']['.join(k.split('.')))+'][css]}').format(styleM)
            .format(value=v)
            for k, v in f['tags'][tag]['style'].items()
        ]))+'}'
    return render(req, 'meteor/page.html', {
        'background': f['pages'][0]['background'],
        'elements_html': html,
        'tagscss':tagscss
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