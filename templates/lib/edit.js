let selected=null;
let selectedIndex=null;


function copy(obj){
    return JSON.parse(JSON.stringify(obj));
}

/* 文件数据模板，供参考
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
file = {
    'background': '#ffffff',
    'elements': [{
        'id': str(uuid.uuid4()),
        'type': 'text',
        'prop':{
            'content':'你好'
        },
        'x': 100,
        'y': 100,
        'width': 200,
        'height': 50,
        'style': {
            'text.fontSize':30,
            'text.color':'#000000',
        },
        'tags': []
    }]
}

tags={
    'title': {
        'prop':{
            'name':'标题'
        },
        'style': {
            'text.fontSize': 48,
            'text.color': '#000000',
            'text.textAlign': 'center',
        }
    }
}

props={
    'text':{
        'content':{
            'name':'文本',
            'type':'text'
        }
    },
    'shape':{}
}
    */


function updatePosition(id, x, y) {
    file.elements.forEach(element => {
        if (element.id == id) {
            element.x = x;
            element.y = y;
        }
    });
    $.post(`/api/${pg}/update`, JSON.stringify(file));

}
function updateSize(id, w,h) {
    file.elements.forEach(element => {
        if (element.id == id) {
            element.height = h;
            element.width=w;
        }
    });
    $.post(`/api/${pg}/update`, JSON.stringify(file));

}

function updateElementsOrder(elementid, type) {
    const elementIndex = file.elements.findIndex(element => element.id === elementid);
    if (elementIndex === -1) {
        // 如果找不到元素，返回错误
        throw new Error("Element not found");
    }
    // 获取元素并从原位置删除
    const [element] = file.elements.splice(elementIndex, 1);

    // 根据type插入元素
    switch (type) {
        case 'top':
            file.elements.push(element);
            break;
        case 'up':
            if (elementIndex < file.elements.length) {
                file.elements.splice(elementIndex + 1, 0, element);
            } else {
                file.elements.push(element);
            }
            break;
        case 'down':
            if (elementIndex > 0) {
                file.elements.splice(elementIndex - 1, 0, element);
            } else {
                file.elements.unshift(element);
            }
            break;
        case 'bottom':
            file.elements.unshift(element);
            break;
    }
    
    // 更新服务器
    $.post(`/api/${pg}/update`, JSON.stringify(file)).done(()=>{
        $('#page').attr('src', $('#page').attr('src'));
        select(selected);
        $('#page').on('load',()=>{
            $('#page')[0].contentWindow.selectElement('#ele-'+selected);
            $('#page').off('load');
        });
    });
    
}

function select(id){
    selected=id;
    selectedIndex=null;
    if(id==null){
        $('.select-then-enable.able').removeClass('able');
        $('#prop>.props').html('');
        $('#sty').html('');

        return;
    }
    $('.select-then-enable').addClass('able');
    
    file.elements.forEach(e=>{
        if(e.id!=id) return;
        selectedIndex=file.elements.indexOf(e);
        console.log(selected,selectedIndex);
        loadprop(e, id);
        loadstyle(e, id);
        loadTags();
    });
}

function loadprop(e, id, tag=false) {
    $('#prop>.props').html('');
    propedit = '';
    let prop = copy(props[tag?'tag':e.type]);
    for (let key in e.prop) {
        prop[key].value = e.prop[key];
    }
    for (let key in prop) {
        propedit += `<div class="form-group">
                <label>${prop[key].name}</label>`;
        if (prop[key].type == 'select') {
            propedit += `<selectbox onclick="show(this)" class="form-control ${key}" onchange="setprop('${id}','${key}',this.value ${tag?',tag=true':''})">`;
            prop[key].options.forEach(option => {
                propedit += `<option value="${option.value}" ${prop[key].value == option.value ? 'selected' : ''}>${option.name}</option>`;
            });
            propedit += `</selectbox>`;
        } else if (prop[key].type == 'number') {
            propedit += `<input type="number" class="form-control ${key}" value="${prop[key].value}" onchange="setprop('${id}','${key}',this.value${tag?',tag=true':''})">`;
        } else if (prop[key].type == 'text') {
            propedit += `<input type="text" class="form-control ${key}" value="${prop[key].value}" onchange="setprop('${id}','${key}',this.value${tag?',tag=true':''})">`;
        }
        propedit += `</div>`;
    }
    $('#prop>.props').html(propedit);
}

function loadstyle(e, id, tag=false) {
    $('#sty').html(''); styleedit = '';
    let style = copy(stylem);
    for (let key in e.style) {
        let k = key.split('.');
        style[k[0]][k[1]].value = e.style[key];
        style[k[0]][k[1]].set = true;
    }
    styleedit='<div class="menu list">';
    for (let key in style){
        styleedit+=`<a class="item ${key}" onclick="toggle_style_page('${key}');">${style[key].name}</a>`;
    }
    styleedit+='</div> <div class="page-container">';

    for (let key in style) {
        styleedit += `<div class="page ${key}">
                <span class="tit">${style[key].name}</span>`;
        for (let key2 in style[key]) {
            if (key2 == 'name') continue;
            styleedit += `<div class="form-group">
                    <label>${style[key][key2].name}</label>`;
            if (style[key][key2].set) {
                console.log(key, key2);
                if (stylem[key][key2].type == 'select') {
                    styleedit += `<selectbox onclick="show(this)" class="form-control ${key2}" onchange="setstyle('${id}','${key}','${key2}',this.value${tag?',tag=true':''})">`;
                    stylem[key][key2].options.forEach(option => {
                        styleedit += `<option value="${option.value}" ${style[key][key2].value == option.value ? 'selected' : ''}>${option.name}</option>`;
                    });
                    styleedit += `</selectbox>`;
                } else if (stylem[key][key2].type == 'color') {
                    styleedit += `<input type="color" class="form-control ${key2}" value="${style[key][key2].value}" onchange="setstyle('${id}','${key}','${key2}',this.value${tag?',tag=true':''})">`;
                } else if (stylem[key][key2].type == 'number') {
                    styleedit += `<input type="number" class="form-control ${key2}" value="${style[key][key2].value}" onchange="setstyle('${id}','${key}','${key2}',this.value${tag?',tag=true':''})">`;
                }
                styleedit += `<button class="del" onclick="delstyle('${id}','${key}','${key2}'${tag?',tag=true':''})"><i class="bi bi-dash"></i></button>`;
            } else {
                styleedit += `<button class="add" onclick="addstyle('${id}','${key}','${key2}'${tag?',tag=true':''})"><i class="bi bi-plus"></i></button>`;
            }

            styleedit += `</div>`;
        }
        styleedit += `</div>`;
    }
    styleedit += `</div>`;
    
    $('#sty').html(styleedit);
    toggle_style_page(Object.keys(style)[0]);
}
function toggle_style_page(page){
    $('#sty>.menu>.item.show').removeClass('show');
    $('#sty>.menu>.item.'+page).addClass('show');
    $('#sty>.page-container>.page.show').removeClass('show');
    $(`#sty>.page-container>.page.${page}`).addClass('show');
}

function loadTags(reload=false){
    if(reload){
        $.get(`/api/tags`).done(data=>{
            tags=data;
            loadTags();
        });
        return;
    }
    $('#tags>.tag-list').html('');
    let tagsedit='';
    for(let key in tags){
        tagsedit+=`<div class="tag tag-${key} ${(selected!=null && file.elements[selectedIndex].tags.includes(key))?'active':''}"
        onclick="addTagToElement('${key}');">

            <span>${tags[key].prop.name}</span>
            <button onclick="event.stopPropagation();selectTag('${key}')"><i class="bi bi-pen"></i></button>
        </div>`;
    }
    $('#tags>.tag-list').html(tagsedit);
}

function selectTag(name){
    loadprop(tags[name], name, tag=true);
    loadstyle(tags[name], name, tag=true);
}

function addTagToElement(name){
    if(selected==null)return;
    let e=file.elements[selectedIndex];
    if(e.tags.includes(name)){
        e.tags.splice(e.tags.indexOf(name),1);
    }else{
        e.tags.push(name);
    }


    $.post(`/api/${pg}/update`, JSON.stringify(file)).done(()=>{
        $('#page').attr('src', $('#page').attr('src'));
        select(selected);
        $('#page').on('load',()=>{
            $('#page')[0].contentWindow.selectElement('#ele-'+selected);
            $('#page').off('load');
        });
    });
}

function setprop(id,key,value,tag=false){
    if(tag){
        tags[id].prop[key]=value;
        $.post(`/api/updatetag`, JSON.stringify(tags));
        loadTags();
        selectTag(id);
        return;
    }
    file.elements.forEach(e=>{
        if(e.id==id){
            e.prop[key]=value;
        }
    });
    $.post(`/api/${pg}/update`, JSON.stringify(file));
    $('#page').attr('src', $('#page').attr('src'));
    select(id);
    $('#page').on('load',()=>{
        $('#page')[0].contentWindow.selectElement('#ele-'+id);
        $('#page').off('load');
    });
}

function addstyle(id,key,key2,tag=false){
    $('#addstyle').show();
    $('#addstyle>.tit>.key').text(stylem[key].name);
    $('#addstyle>.tit>.key2').text(stylem[key][key2].name);
    $('#addstyle>.ok').click(()=>{setstyle(id,key,key2,$('#addstyle>.body>.value>*').val(),tag)});
    if (stylem[key][key2].type == 'select') {
        styleedit = `<selectbox onclick="show(this)" class="form-control ${key2}">`;
        stylem[key][key2].options.forEach(option => {
            styleedit += `<option value="${option.value}">${option.name}</option>`;
        });
        styleedit += `</selectbox>`;
    } else if (stylem[key][key2].type == 'color') {
        styleedit = `<input type="color" class="form-control ${key2}">`;
    } else if (stylem[key][key2].type == 'number') {
        styleedit = `<input type="number" class="form-control ${key2}">`;
    }
    $('#addstyle>.body>.value').html(styleedit);
}

function setstyle(id,key,key2,value,tag=false){
    if(tag){
        tags[id].style[key+'.'+key2]=value;
        $.post(`/api/updatetag`, JSON.stringify(tags)).done(()=>{
            loadTags();
            selectTag(id);
            $('#page').attr('src', $('#page').attr('src'));
        });
        $('#addstyle>.ok').off('click');
        $('#addstyle').hide();
        return;
    }
    file.elements.forEach(e=>{
        if(e.id==id){
            e.style[key+'.'+key2]=value;
        }
    });
    console.log(file);
    $.post(`/api/${pg}/update`, JSON.stringify(file)).done(()=>{
        $('#page').attr('src', $('#page').attr('src'));
        select(id);
        $('#page').on('load',()=>{
            $('#page')[0].contentWindow.selectElement('#ele-'+id);
            $('#page').off('load');
        });
    });
    $('#addstyle>.ok').off('click');
    $('#addstyle').hide();
}

function delstyle(id,key,key2,tag=false){
    if(tag){
        delete tags[id].style[key+'.'+key2];
        $.post(`/api/updatetag`, JSON.stringify(tags)).done(()=>{
            loadTags();
            selectTag(id);
            $('#page').attr('src', $('#page').attr('src'));
        });
        return;
    }
    file.elements.forEach(e=>{
        if(e.id==id){
            delete e.style[key+'.'+key2];
        }
    });
    $.post(`/api/${pg}/update`, JSON.stringify(file)).done(()=>{
        $('#page').attr('src', $('#page').attr('src'));
        select(id);
        $('#page').on('load',()=>{
            $('#page')[0].contentWindow.selectElement('#ele-'+id);
            $('#page').off('load');
        });
    });
}

function addEle(type){
    $.post(`/api/${pg}/add`, JSON.stringify({type:type})).done(data=>{
        file=data;
        $('#page').attr('src', $('#page').attr('src'));
        $('#page').on('load',()=>{
            $('#page')[0].contentWindow.selectElement('#ele-'+file.elements[file.elements.length-1].id);
            $('#page').off('load');
        });
    });
}

function delEle(id){
    $.post(`/api/${pg}/delete`, JSON.stringify({id:id})).done(data=>{
        file=data;
        $('#page').attr('src', $('#page').attr('src'));
        select(null);
    });
}

function addNewTag(name){
    if(name in tags){
        alert('Tag already exists');
        return;
    }
    $('#addtag').hide();
    $('#addtag>.body>.tag').val('');
    $.post(`/api/addtag`, JSON.stringify({name:name})).done(data=>{
        tags=data;
        $('#page').attr('src', $('#page').attr('src'));
    });
}

function show(selectbox){
    if($(selectbox).hasClass('open')){
        $(selectbox).removeClass('open');
        $('#selectmenu').hide();
    }else{
        $('#selectmenu').html('');
        $(selectbox).children().each((i,option)=>{
            $('#selectmenu').append(`<div class="option ${option.selected?'selected':''}" onclick="selectOption('${option.value}');$(this).parent().find('.selected').removeClass('selected');$(this).addClass('selected');">${option.text}</div>`);
        });
        $('#selectmenu').css('top', $(selectbox).offset().top+$(selectbox).height()+15);
        $('#selectmenu').css('left', $(selectbox).offset().left);
        $('#selectmenu').show();
        $(selectbox).addClass('open');
    }
}
function selectOption(option){
    $('selectbox.open').find('[selected]').removeAttr('selected');
    $('selectbox.open').find(`[value=${option}]`).attr('selected','selected');
    $('selectbox.open').val(option).change().removeClass('open');
    $('#selectmenu').hide();
}

function zoompage(z){
    $('#page').css('zoom',z/100);
}

loadTags(true);