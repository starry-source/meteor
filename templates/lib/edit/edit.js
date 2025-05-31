
console.log(
`%cMeteor%c
%c由星源开发 · Developed by Starry Source%c
%cGitHub %cstarry-source/meteor
%chttps://github.com/starry-source/meteor`,
`
background-image: linear-gradient(to right,rgb(234, 223, 13),rgb(94, 177, 245));
-webkit-background-clip: text;
font-size: 2.5em;
color: transparent;
font-weight:bold;
padding: 10px 0 10px 20px;
margin-top: 20px;
display:block;
font-family: "Cascadia Mono", Consolas, "Courier New", Courier, monospace;
border-left: 2px solid #2983cc;`,'',
`
font-size: 1.4em;
line-height:1.5;
font-family: "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
padding-bottom:10px;
padding-left:15px;border-left: 2px solid #2983cc;
`,'',
`font-size:1.2em;
border-left: 2px solid #2983cc;
padding-left:15px;`,
`font-size:1.2em;
font-whight:bold;
font-family: "Cascadia Mono", Consolas, "Courier New", Courier, monospace;`,
`color:#2983cc;
padding-left:15px;
border-left: 2px solid #2983cc;
padding-bottom: 15px;
margin-bottom: 20px;`);


let selected = null;
let selectedIndex = null;
let currentKFI = -1;
// let selectedNode = null;
let clipboard = null;
const frame = $('#page')[0].contentWindow;

document.addEventListener('contextmenu', e=>{
    e.preventDefault();
});

// 复制一份 json，防止原数据被修改
function copy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function updateFile(){
    return $.post(`/api/${pg}/update`, JSON.stringify(file));
}

// 更新位置，在 page.html 中调用
function updatePosition(id, x, y) {
    if (currentKFI!=-1){
        file.animation[currentKFI].elements[id]['base.x'] = x;
        file.animation[currentKFI].elements[id]['base.y'] = y;
    }else{
        file.elements.forEach(element => {
            
            if (element.id == id) {
                element.style['base.x'] = x;
                element.style['base.y'] = y;
            }
        });
    }
    updateFile().done(() => {
        frame.loadpage('#ele-' + selected);
    });
}

// 更新大小，在 page.html 中调用
function updateSize(id, w, h) {
    if (currentKFI!=-1){
        file.animation[currentKFI].elements[id]['base.height'] = h;
        file.animation[currentKFI].elements[id]['base.width'] = w;
    }else{
        file.elements.forEach(element => {
            if (element.id == id) {
                element.style['base.height'] = h;
                element.style['base.width'] = w;
            }
        });
    }
    updateFile().done(() => {
        frame.loadpage('#ele-' + selected);
    });
}

// 更新元素层级，在 page.html 中调用
function updateElementsOrder(elementid, type) {
    const elementIndex = file.elements.findIndex(element => element.id === elementid);
    const [element] = file.elements.splice(elementIndex, 1);

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

    // 同步后端
    updateFile().done(() => {
        frame.loadpage('#ele-' + selected);
    });
}

// 选择元素，加载样式表和属性面板的内容，在 page.html 中调用
function select(id) {
    selected = id;
    selectedIndex = null;

    // 多选时隐藏属性和样式面板
    if (!id) {
        $('.select-then-enable.able, .select-one-then-enable.able').removeClass('able');
        $('#prop>.props').html('<info style="width:100%;text-align:center;width:100%;display:block;margin-top:10px">不可用</info>');
        $('#sty').html('<info style="width:100%;text-align:center;margin-top:20px">不可以</info>');
        return;
    }

    $('.select-then-enable, .select-one-then-enable').addClass('able');
    file.elements.forEach(e => {
        if (e.id != id) return;
        selectedIndex = file.elements.indexOf(e);
        loadprop(e, id);
        loadstyle(e, id);
        loadTags();
    });
}

function selectmult(){
    selected = null;
    selectedIndex = null;
    $('.select-then-enable').addClass('able');
    $('.select-one-then-enable').addClass('able');
    $('#prop>.props').html('<info style="width:100%;text-align:center;width:100%;display:block;margin-top:10px">不可用</info>');
    $('#sty').html('<info style="width:100%;text-align:center;margin-top:20px">不可以</info>');
}

// 加载属性面板内容，在 select, selectTag 中调用
function loadprop(e, id, tag = false, tagname='tag') {
    // $('#prop>.props').html('');
    propedit = '';
    let prop = copy(props[tag ? tagname : e.type]);
    for (let key in e.prop) {
        prop[key].value = e.prop[key];
    }
    for (let key in prop) {
        propedit += `<div class="form-group">
                <label>${prop[key].name}</label>`;
        if (prop[key].type == 'select') {
            propedit += `<selectbox onclick="show(this)" class="form-control ${key}" onchange="setprop('${id}','${key}',this.value ${tag ? ',tag=true,tagname=\''+tagname+'\'' : ''})">`;
            prop[key].options.forEach(option => {
                propedit += `<option value="${option.value}" ${prop[key].value == option.value ? 'selected' : ''}>${option.name}</option>`;
            });
            propedit += `</selectbox>`;
        } else if (prop[key].type == 'number') {
            propedit += `<input type="number" class="form-control ${key}" value="${prop[key].value}" onchange="setprop('${id}','${key}',this.value${tag ? ',tag=true,tagname=\''+tagname+'\'' : ''})">`;
        } else if (prop[key].type == 'text') {
            propedit += `<input type="text" class="form-control ${key}" value="${prop[key].value}" onchange="setprop('${id}','${key}',this.value${tag ? ',tag=true,tagname=\''+tagname+'\'' : ''})">`;
        }
        propedit += `</div>`;
    }
    if(tagname=='anim'){
        $('#kfprop>.props').html(propedit);
    }else{
        $('#prop>.props').html(propedit);
    }
}

// 加载元素样式表，在 select, selectTag 中调用
function loadstyle(e, id, tag = false) {
    $('#sty').html('');
    let style = copy(stylem);
    for (let key in e.style) {
        let k = key.split('.');
        // if(k=='base')continue;
        style[k[0]][k[1]].value = e.style[key];
        style[k[0]][k[1]].set = true;
    }
    if(!tag&&currentKFI!=-1){
        for (let key in file.animation[currentKFI].elements[id]) {
            let k = key.split('.');
            style[k[0]][k[1]].value = file.animation[currentKFI].elements[id][key];
            style[k[0]][k[1]].set = true;
        }
    }
    let styleedit = '<div class="menu list">';
    let tmp='';
    let thekey='';
    for (let key in style) {
        if(key == 'base')continue;
        if(key == 'anim' && currentKFI==-1)continue;
        if(thekey=='')thekey=key;
        styleedit += `<a class="item ${key}" onclick="toggle_style_page('${key}');">${style[key].name}</a>`;

        tmp += `<div class="page ${key}">
                <span class="tit">${style[key].name}</span>`;
        for (let key2 in style[key]) {
            if (key2 == 'name') continue;
            tmp += `<div class="form-group">
                    <label>${style[key][key2].name}</label>`;
            if (style[key][key2].set) {
                // console.log(key, key2);
                if (stylem[key][key2].type == 'select') {
                    tmp += `<selectbox onclick="show(this)" class="form-control ${key2}" onchange="setstyle('${id}','${key}','${key2}',this.value${tag ? ',tag=true,tagname='+tagname : ''})">`;
                    stylem[key][key2].options.forEach(option => {
                        tmp += `<option value="${option.value}" ${style[key][key2].value == option.value ? 'selected' : ''}>${option.name}</option>`;
                    });
                    tmp += `</selectbox>`;
                } else if (stylem[key][key2].type == 'color') {
                    tmp += `<input type="color" class="form-control ${key2}" value="${style[key][key2].value}" onchange="setstyle('${id}','${key}','${key2}',this.value${tag ? ',tag=true,tagname='+tagname : ''})">`;
                } else if (stylem[key][key2].type == 'number') {
                    tmp += `<input type="number" class="form-control ${key2}" value="${style[key][key2].value}" onchange="setstyle('${id}','${key}','${key2}',this.value${tag ? ',tag=true,tagname='+tagname : ''})">`;
                } else if (stylem[key][key2].type == 'number100') {
                    tmp += `<input type="number" class="form-control ${key2}" value="${style[key][key2].value}" min="0" max="100" onchange="setstyle('${id}','${key}','${key2}',this.value${tag ? ',tag=true,tagname='+tagname : ''})">`;
                }
                tmp += `<button class="del" onclick="delstyle('${id}','${key}','${key2}'${tag ? ',tag=true,tagname='+tagname : ''})"><i class="bi bi-dash"></i></button>`;
            } else {
                tmp += `<button class="add" onclick="addstyle('${id}','${key}','${key2}'${tag ? ',tag=true,tagname='+tagname : ''})"><i class="bi bi-plus"></i></button>`;
            }

            tmp += `</div>`;
        }
        tmp += `</div>`;
    }
    styleedit += '</div> <div class="page-container">'+tmp+'</div>';

    $('#sty').html(styleedit);
    toggle_style_page(thekey);
}

// 设置属性
function setprop(id, key, value, tag = false,tagname='tag') {
    if (tag) {
        if(tagname=='anim'){
            file.animation[id].prop[key]=value;
            updateFile();
            return;
        }
        tags[id].prop[key] = value;
        $.post(`/api/updatetag`, JSON.stringify(tags));
        loadTags();
        selectTag(id);
        return;
    }
    file.elements.forEach(e => {
        if (e.id == id) {
            e.prop[key] = value;
        }
    });
    updateFile();
    frame.loadpage('#ele-' + id);
}

// 显示添加样式的对话框
function addstyle(id, key, key2, tag = false) {
    $('#addstyle').show();
    $('#addstyle>.tit>.key').text(stylem[key].name);
    $('#addstyle>.tit>.key2').text(stylem[key][key2].name);
    $('#addstyle>.buttons>.ok').click(() => { setstyle(id, key, key2, $('#addstyle>.body>.value>*').val(), tag) });
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
    } else if (stylem[key][key2].type == 'number100') {
        styleedit = `<input type="number" class="form-control ${key2}" min="0" max="100">`;
    }
    $('#addstyle>.body>.value').html(styleedit);
}

// 设置样式，亦可用于添加样式
function setstyle(id, key, key2, value, tag = false) {
    if (tag) {
        tags[id].style[key + '.' + key2] = value;
        $.post(`/api/updatetag`, JSON.stringify(tags)).done(() => {
            frame.loadpage(selected = false);
            loadTags();
            selectTag(id);
        });
        $('#addstyle>.buttons>.ok').off('click');
        $('#addstyle').hide();
        return;
    }
    if (currentKFI!=-1){
        file.animation[currentKFI].elements[id][key + '.' + key2] = value;
    }else{
        file.elements.forEach(e => {
            if (e.id == id) {
                e.style[key + '.' + key2] = value;
            }
        });
    }
    // console.log(file);
    updateFile().done(() => {
        frame.loadpage('#ele-' + id);
    });
    $('#addstyle>.buttons>.ok').off('click');
    $('#addstyle').hide();
}

// 删除样式定义
function delstyle(id, key, key2, tag = false) {
    if (tag) {
        delete tags[id].style[key + '.' + key2];
        $.post(`/api/updatetag`, JSON.stringify(tags)).done(() => {
            frame.loadpage(selected = false);
            loadTags();
            selectTag(id);
        });
        return;
    }
    if (currentKFI!=-1){
        delete file.animation[currentKFI].elements[id][key + '.' + key2];
    }else{
        file.elements.forEach(e => {
            if (e.id == id) {
                delete e.style[key + '.' + key2];
            }
        });
    }
    updateFile().done(() => {
        frame.loadpage('#ele-' + id);
    });
}

// 刷新标签面板，标注当前元素正在使用的标签
function loadTags(reload = false) {
    if (reload) {
        $.get(`/api/tags`).done(data => {
            tags = data;
            loadTags();
        });
        return;
    }
    $('#tags>.tag-list').html('');
    let tagsedit = '';
    for (let key in tags) {
        tagsedit += `<div class="tag tag-${key} ${(selected != null && file.elements[selectedIndex].tags.includes(key)) ? 'active' : ''}"
        onclick="addTagToElement('${key}');">

            <span>${tags[key].prop.name}</span>
            <button onclick="event.stopPropagation();selectTag('${key}')"><i class="bi bi-pen"></i></button>
        </div>`;
    }
    $('#tags>.tag-list').html(tagsedit);
}

// 编辑标签
function selectTag(name) {
    loadprop(tags[name], name, tag = true);
    loadstyle(tags[name], name, tag = true);
}

// 应用标签于当前选中元素
function addTagToElement(name) {
    if (selected == null) return;
    let e = file.elements[selectedIndex];
    if (e.tags.includes(name)) {
        e.tags.splice(e.tags.indexOf(name), 1);
    } else {
        e.tags.push(name);
    }

    updateFile().done(() => {
        frame.loadpage('#ele-' + selected);
    });
}

// 切换样式表的分类，结构见 loadstyle
function toggle_style_page(page) {
    $('#sty>.menu>.item.active').removeClass('active');
    $('#sty>.menu>.item.' + page).addClass('active');
    $('#sty>.page-container>.page.show').removeClass('show');
    $(`#sty>.page-container>.page.${page}`).addClass('show');
}

// 添加元素
function addEle(type) {
    $.post(`/api/${pg}/add`, JSON.stringify({ type: type })).done(data => {
        file = data;
        loadAnimation();
        selectAnimation(-1);
        frame.loadpage('#ele-' + file.elements[file.elements.length - 1].id);
    });
}

// 删除选中的元素
function delEle() {
    if (frame.selectedElements?.length > 0) {
        const elementIds = frame.selectedElements.map(el => ({id:el.dataset.id}));
        $.post(`/api/${pg}/delete`, JSON.stringify({
            elements: elementIds
        }))
        .done(data => {
            file = data;
            frame.loadpage(null);
        });
    }
}

// 显示新元素，在对话框的确定按钮被调用
function addNewTag(name) {
    if (name in tags) {
        alert('Tag already exists');
        return;
    }
    $('#addtag').hide();
    $('#addtag>.body>.tag').val('');
    $.post(`/api/addtag`, JSON.stringify({ name: name })).done(data => {
        tags = data;
        frame.loadpage();
    });
}

// 用于展示 selectbox 的下拉菜单
function show(selectbox) {
    if ($(selectbox).hasClass('open')) {
        $(selectbox).removeClass('open');
        $('#selectmenu').hide();
    } else {
        $('#selectmenu').html('');
        $(selectbox).children().each((i, option) => {
            $('#selectmenu').append(`<div class="option ${option.selected ? 'selected' : ''}" onclick="selectOption('${option.value}');$(this).parent().find('.selected').removeClass('selected');$(this).addClass('selected');">${option.text}</div>`);
        });
        $('#selectmenu').css('top', $(selectbox).offset().top + $(selectbox).height() + 10);
        $('#selectmenu').css('left', $(selectbox).offset().left);
        $('#selectmenu').show();
        $(selectbox).addClass('open');
    }
}

// 见上
function selectOption(option) {
    $('selectbox.open').find('[selected]').removeAttr('selected');
    $('selectbox.open').find(`[value=${option}]`).attr('selected', 'selected');
    $('selectbox.open').val(option).change().removeClass('open');
    $('#selectmenu').hide();
}

function showcm(){
    let ex,ey,tg;
    if(arguments.length==2){
        arguments[0].preventDefault();
        arguments[0].stopPropagation();
        ex=arguments[0].clientX,ey=arguments[0].clientY,tg=arguments[1];
    }else if(arguments.length==3){
        ex=arguments[0],ey=arguments[1],tg=arguments[2];
    }
    // else if(arguments.length==1){
    //     ex=arguments[0].pageX,ey=arguments[0].pageY,tg=arguments[0].target;
    // }
    // console.log(ex,ey);
    $('#contextmenu').html('');
    $(tg).find('contextmenu').children().each((i, option) => {
        // console.log(option.onclick);
        let disable=false;
        if(option.getAttribute('if')!=null){
            if(!eval(option.getAttribute('if'))){
                disable=true;
            }
        }
        if(option.tagName=='hr'||option.tagName=='HR'){
            $('#contextmenu').append('<hr>');
            return;
        }
        if(option.classList.contains('text')){
            if(!disable)
            $('#contextmenu').append(`<span class="text">${option.innerText}</span>`);
            return;
        }
        $('#contextmenu').append(`<div class="option ${disable ?'disable':''}" onclick="${option.getAttribute('onclick')}">${option.innerHTML}</div>`);
    });
    $('#contextmenu').css('top', ey);
    $('#contextmenu').css('left', ex);

    $('#contextmenu').addClass('show');
    $(':root').addClass('disable');
    setTimeout(() => {
        document.addEventListener('click', function() {
            $('#contextmenu').removeClass('show');
            $(':root').removeClass('disable');
            document.removeEventListener('click', arguments.callee);
        });
    }, 100);
}

// 缩放页面
function zoompage(z) {
    frame.zoom(z / 100);
    $('#page').css('zoom', z / 100);
}

// 加载动画
function loadAnimation() {
    let html = `<div class="animation-item item selected"  
            onclick="selectAnimation(-1);$('#animation>.timeline>.kfs>.selected').removeClass('selected');$(this).addClass('selected');">
            <div class="spot"></div><span>初始</span>
        </div>`;
    file.animation.forEach((anim,i) => {
        // selected
        // let whenclk=(anim.prop.when=='click');
        html += `<div class="animation-item item"  
            onclick="$('#animation>.timeline>.kfs>.selected').removeClass('selected');$(this).addClass('selected');selectAnimation(${i});"
            oncontextmenu="showcm(event,this)">
            <div class="kfsedit"></div>
            <div class="name">
                <div class="spot ${(anim.prop.when=='click')?'click':''}"></div>
                <span>${anim.prop.duration}s</span>
            </div>
            <contextmenu>
                <p onclick="event.stopPropagation();deleteAnimation(${i})">删除关键帧</p>
            </contextmenu>
        </div>`;
    });
    $('#animation>.timeline>.kfs').html(html);
    return;
}

function selectAnimation(index) {
    currentKFI=index;
    frame.setKeyFrame(index);
    $('#animation>.timeline>.kfs>.item>.kfsedit').html('');
    if(index==-1){
        $('#kfprop>.props').html('无。');
        return;
    }
    anim = file.animation[index];
    loadprop(file.animation[index],index,true,'anim');
    // 添加每个元素对应动画的横向时间线编辑
    // 获取父容器的宽度并填充100%
    let $container = $('#animation>.timeline>.kfs>.item.selected>.kfsedit');
    let timelineWidth = $container.width();
    let scale = timelineWidth / anim.prop.duration; // 每秒对应的像素数

    let kfsedit = `<div class="view">`;
    for (let eleId in anim.elements) {
        let ele = anim.elements[eleId];
        let delay = parseFloat(ele['anim.delay']) || 0;
        let duration = parseFloat(ele['anim.duration']) || 0;
        let leftPos = delay * scale;
        let blockWidth = duration * scale;
        
        kfsedit += `<div class="ele" style="position: relative; display: inline-block;">
                        <div class="timeline-block"  data-eleid="${eleId}"
                           style="left: ${leftPos}px;
                                  width: ${blockWidth}px;">
                        </div>
                    </div>`;
    }
    kfsedit += `</div>`;
    $container.html(kfsedit);

    // 初始状态下，不启用拖拽和缩放
    $('.timeline-block').each(function(){
        // 销毁可能存在的draggable和resizable
        if ($(this).hasClass('ui-draggable')) $(this).draggable('destroy');
        if ($(this).hasClass('ui-resizable')) $(this).resizable('destroy');
    });

    // 当单击.ele时，启用该元素的拖拽和缩放，同时禁用其它块的拖拽缩放
    $('.ele').off('click').on('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        // 取消其它已启用的拖拽和调整
        $('.timeline-block').each(function(){
            if ($(this).hasClass('ui-draggable')) $(this).draggable('destroy');
            if ($(this).hasClass('ui-resizable')) $(this).resizable('destroy');
        });
        // 为当前点击的对应块启用拖拽与缩放
        let $block = $(this).find('.timeline-block');
        frame.selectElement('#ele-'+$block.data('eleid'));
        $block.draggable({
            axis: 'x',
            containment: "parent",
            drag: function(event, ui) {
                let newDelay = ui.position.left / scale;
                let eleId = $(this).attr('data-eleid');
                anim.elements[eleId]['anim.delay'] = newDelay.toFixed(2);
            },
            stop: function(event, ui) {
                updateFile().done(() => {
                    frame.loadpage('#ele-' + selected);
                });
            }
        }).resizable({
            handles: 'e',
            containment: "parent",
            resize: function(event, ui) {
                let newDuration = ui.size.width / scale;
                let eleId = $(this).attr('data-eleid');
                anim.elements[eleId]['anim.duration'] = newDuration.toFixed(2);
            },
            stop: function(event, ui) {
                updateFile().done(() => {
                    frame.loadpage('#ele-' + selected);
                });
            }
        });
    });


}

function updateAnimation(prop, value, isprop=false) {
    if (!file.animation[currentKFI]) return;
    if(isprop){
        file.animation[currentKFI].prop[prop] = value;
    }else{
        file.animation[currentKFI][prop] = value;
        if (prop == 'type' || prop == 'action') {
            for(let key in props.anim[file.animation[currentKFI].action][file.animation[currentKFI].type]){
                if(!(file.animation[currentKFI].prop.includes && file.animation[currentKFI].prop.includes(key))){
                    file.animation[currentKFI].prop[key]=props.anim[file.animation[currentKFI].action][file.animation[currentKFI].type][key].default;
                }
            }
        }
    }

    updateFile().done(()=>{
        loadAnimation();
        selectAnimation('well', null, null, file.animation[currentKFI]);
        // file = data;
    });
}

function addKF(){
    file.animation.push({
        prop:{
            when: 'click',
            duration: 1,
        },
        elements: file.elements.reduce((acc, ele) => {
            acc[ele.id] = {
                'base.x': file.animation.length > 0 ? file.animation[file.animation.length - 1].elements[ele.id]['base.x']:ele.style['base.x'],
                'base.y': file.animation.length > 0 ? file.animation[file.animation.length - 1].elements[ele.id]['base.y']:ele.style['base.y'],
                'base.width': file.animation.length > 0 ? file.animation[file.animation.length - 1].elements[ele.id]['base.width']:ele.style['base.width'],
                'base.height': file.animation.length > 0 ? file.animation[file.animation.length - 1].elements[ele.id]['base.height']:ele.style['base.height'],
                'anim.delay': 0,
                'anim.duration': 1
            };
            return acc;
        }, {})
    });
    updateFile().done(()=>{
        loadAnimation();
        setTimeout(() => {
            $('#animation>.timeline>.kfs>.item.selected').removeClass('selected');
            $('#animation>.timeline>.kfs>.item:last').addClass('selected');
            selectAnimation(file.animation.length - 1);
        }, 100);
    });
}

function deleteAnimation(index) {
    if (index < 0 || index >= file.animation.length) return;
    file.animation.splice(index, 1);
    updateFile().done(() => {
        loadAnimation();
    });
}


function getpageoffset(){
    return $('#page').offset();
}

// 复制选中元素
function copyElement() {
    if (frame.selectedElements?.length > 0) {
        console.log('copy');
        clipboard = frame.selectedElements.map(element => {
            return copy(file.elements.find(e => e.id === element.dataset.id));
        });
    }
    $('#toolbar>.sl>.paste').removeClass('disabled');
}

// 粘贴元素
function pasteElement() {
    if (!clipboard?.length) return;
    
    const newElements = clipboard.map(element => {
        const newElement = copy(element);
        newElement.id = crypto.randomUUID();
        return newElement;
    });

    file.elements.push(...newElements);
    updateFile().done(() => {
        frame.loadpage();
        // 选中新粘贴的元素
        setTimeout(() => {
            const elements = newElements.map(e => 
                document.querySelector(`#page`).contentWindow.document.querySelector(`#ele-${e.id}`)
            );
            frame.selectedElements = elements;
            frame.selectedElement = elements[0];
            frame.updateSelectionBox();
        }, 100);
    });
    $('#copy').hide();
}

function addPage(){
    window.location.href='/api/newpage';
}

function deletePage(i){
    $.post(`/api/deletepage`, JSON.stringify({ page: i })).done(data => {
        window.location.href='/edit/'+i;
    });
}
function copyPage(i){
    $.post(`/api/copypage`, JSON.stringify({ page: i })).done(data => {
        window.location.href='/edit/'+(i+1);
    });
}

// let pgnow=0;
// 初始化页面拖放排序
function initPageDragSort() {
    const pageList = document.querySelector('#pages>.list');
    if (!pageList) return;

    pageList.addEventListener('dragstart', e => {
        if (!e.target.classList.contains('item')) return;
        e.target.classList.add('dragging');
    });

    pageList.addEventListener('dragend', e => {
        if (!e.target.classList.contains('item')) return;
        e.target.classList.remove('dragging');
    });

    pageList.addEventListener('dragover', e => {
        e.preventDefault();
        const draggingItem = pageList.querySelector('.dragging');
        if (!draggingItem) return;
        
        const siblings = [...pageList.querySelectorAll('.item:not(.dragging)')];
        const nextSibling = siblings.find(sibling => {
            return e.clientY <= sibling.offsetTop + sibling.offsetHeight / 2;
        });
        // if (nextSibling)
        // pgnow=parseInt(nextSibling.getAttribute('data-index'));
        pageList.insertBefore(draggingItem, nextSibling);
    });

    pageList.addEventListener('drop', e => {
        const items = [...pageList.querySelectorAll('.item')];
        const newOrder = items.map(item => {
            return parseInt(item.getAttribute('data-index'));
        });
        
        $.post('/api/reorderpages', JSON.stringify({order: newOrder})).done(data => {
            if (data.status=='ok') {
                window.location.reload();
            }
        });
    });
}

// 初始化页面时添加拖放功能
document.addEventListener('DOMContentLoaded', () => {
    initPageDragSort();
    const items = document.querySelectorAll('#pages>.list>.item');
    items.forEach((item, index) => {
        item.setAttribute('draggable', true);
        item.setAttribute('data-index', index);
    });
});

document.body.onload=()=>{
    $('#zoompage').val(50);
    zoompage(50);
}

loadTags(true);
loadAnimation();

for (let i = 0; i < pgnum; i++) {
    $(`#pages>.list`).append(`<span class="item ${i==pg?'active':'" onclick="window.location.href=\'/edit/'+i+"';"}" oncontextmenu="showcm(event,this)">
        第${i + 1}页

        <contextmenu>
            <p onclick="copyPage(${i})">复制至其后</p>
            <p onclick="deletePage(${i})">删除此页</p>
        </contextmenu>
    </span>`);
}

// 图片上传和处理相关代码
function uploadImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = e => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('image', file);

        $.ajax({
            url: '/api/upload',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: data => {
                if(data.status === 'ok') {
                    addImageElement(data.url);
                }
            }
        });
    };
    input.click();
}

function addImageElement(url) {
    $.post(`/api/${pg}/add`, JSON.stringify({ type: 'image' }))
    .done(data => {
        file = data;
        const element = file.elements[file.elements.length - 1];
        element.prop.src = url;
        element.prop.objectFit = 'cover';  // 设置默认填充方式
        updateFile()
        .done(() => {
            frame.loadpage('#ele-' + element.id);
        });
    });
}

