from django.shortcuts import render
from django.http import JsonResponse as jsr
# from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.clickjacking import xframe_options_sameorigin as xf_same
import json, uuid
from django.shortcuts import redirect

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
            # 此页动画
            'onload':[ # 直接为动画，省去节点名称
                {
                    'target':'uuidcode1',
                    'type':'fadein',
                    'delay':0,
                    'prop':{
                        'duration':1
                    }
                }
            ],
            'onclick':[
                {
                    # 节点 1
                    'name':'展示背景',
                    'actions':[
                        # 同时播放
                        {
                            'target':'uuidcode2',
                            'type':'fadein',
                            'delay':0,
                            'prop':{
                                'duration':1
                                # 'direction':'left',
                                # 从左飞入
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
                            'type':'fadeout',
                            'delay':0,
                            'prop':{
                                'duration':1
                            }
                        },
                        {
                            'target':'uuidcode2',
                            'type':'fadeout',
                            'delay':0,
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
                'name':'标题文本'
            },
            'style': {
                'text.fontSize': 150,
                'text.color': '#000000',
                'text.textAlign': 'center',
            }
        }
    },
}

allanimtype=['fadein','fadeout','show','hide']

# 属性模板，其中 tag 键方便 js 中元素和标签 loadprop 的共用
props={
    'tag':{
        'name':{
            'name':'标签名称',
            'type':'text',
        }
    },
    'anim':{
        'fadein':{
            'duration': {
                'name': '持续时间/s',
                'type': 'number',
                'default': 0.2
            }
        },
        'fadeout':{
            'duration': {
                'name': '持续时间/s',
                'type': 'number',
                'default': 0.2
            }
        },
        'show':{
        },
        'hide':{
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
    'rect':{}
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

def export_file(req):
    # 导出为独立HTML文件
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