
# 所有样式模板
styleM = {
    'base':{
        'height':{
            'css': 'height: {value}px;',
            'type': 'hiden',
        },
        'width':{
            'css': 'width: {value}px;',
            'type': 'hiden',
        },
        'x':{
            'css':' left: {value}px;',
            'type':'hiden',
        },
        'y':{
            'css':' top: {value}px;',
            'type':'hiden',
        },
    },
    'anim':{
        'name':'动画',
        'duration': {
            'css':' transition-duration: {value}s;',
            'name':'持续时间/s',
            'type':'number',
            'default': 0.2
        },
        'delay': {
            'css':' transition-delay: {value}s;',
            'name':'延迟/s',
            'type':'number',
            'default': 0
        },
        'timingFunction': {
            'css':' transition-timing-function: {value};',
            'name':'动画曲线',
            'type':'select',
            'options': [
                {'name': '线性', 'value': 'linear'},
                {'name': '缓入', 'value': 'ease-in'},
                {'name': '缓出', 'value': 'ease-out'},
                {'name': '缓入缓出', 'value': 'ease-in-out'},
            ],
            'default': 'linear'
        }
    },
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
            'name': '文字颜色',
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
    },
    'effect':{
        'name':'效果',
        'opacity':{
            'css':'opacity: {value}%;',
            'name':'透明度/%',
            'type':'number100'
        }
    }
} 

htmlM={
    'text': '<span id="ele-{e[id]}" class="element {tags} element-text" data-id="{e[id]}">{e[prop][content]}</span>',
    'rect': '<div id="ele-{e[id]}" class="element {tags} element-rect" data-id="{e[id]}"></div>',
    'image': '<img id="ele-{e[id]}" class="element {tags} element-image" data-id="{e[id]}" src="{e[prop][src]}" style="object-fit: {e[prop][objectFit]};">',
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
        'when': {
            'name': '何时触发',
            'type': 'select',
            'options':[
                {'name':'单击','value':'click'},
                # {'name':'上一帧后','value':'follow'},
            ],
            'default':'click'
        },
        'duration': {
            'name': '持续时间/s',
            'type': 'number',
            'default': 0.2
        }
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

allele={
    'text':{
        'type':'text',
        'prop':{
            'content':'新文本'
        },
        'style':{
            'text.fontSize':30,
            'text.color':'#000000',
            'base.x':100,
            'base.y':100,
            'base.width':200,
            'base.height':50,
        },
        'tags':[]
    },
    'rect':{
        'type':'rect',
        'prop':{},
        'style':{
            'shape.bgcolor':'#000000',
            'shape.bdrd':0,
            'base.x':100,
            'base.y':100,
            'base.width':100,
            'base.height':50,
        },
        'tags':[]
    },
    'image':{
        'type':'image',
        'prop':{
            'src':'',
            'objectFit':'cover'
        },
        'style':{
            'base.x':100,
            'base.y':100,
            'base.width':200,
            'base.height':150,
        },
        'tags':[]
    }
}


# allanimtype={
#     'in':['fade','no'],
#     'out':['fade','no'],
# }

allanimtype={
    'in':{
        'fade':{
            'name':'淡入',
            'transition':'var(--anim-prop-duration) var(--anim-delay)',
            'change':{
                'before':{
                    'opacity':'0'
                },
                'after':{
                    'opacity':'1'
                }
            }
        },
        'no':{
            'name':'出现',
            'transition':'0ms var(--anim-delay)',
            'change':{
                'before':{
                    'opacity':'0'
                },
                'after':{
                    'opacity':'1'
                }
            }
        }
    },
    'out':{
        'fade':{
            'name':'淡出',
            'transition':'var(--anim-prop-duration) var(--anim-delay)',
            'change':{
                'before':{
                    'opacity':'1'
                },
                'after':{
                    'opacity':'0'
                }
            }
        },
        'no':{
            'name':'消失',
            'transition':'0ms var(--anim-delay)',
            'change':{
                'before':{
                    'opacity':'1'
                },
                'after':{
                    'opacity':'0'
                }
            }
        }
    }
}

# 取allanimtype中每个动画的transition和change
animStyle={'in':{},'out':{}}
for k1,v1 in allanimtype.items():
    for k2,v2 in v1.items():
        animStyle[k1][k2] = {
            'transition':v2['transition'],
            'change':v2['change']
        }