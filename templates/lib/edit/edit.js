let selected = null;
let selectedIndex = null;
let selectedAnimation = null;
// let selectedNode = null;
let clipboard = null;

document.addEventListener('contextmenu', e=>{
    e.preventDefault();
});

// 复制一份 json，防止原数据被修改
function copy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// 更新位置，在 page.html 中调用
function updatePosition(id, x, y) {
    file.elements.forEach(element => {
        if (element.id == id) {
            element.x = x;
            element.y = y;
        }
    });
    $.post(`/api/${pg}/update`, JSON.stringify(file));
}

// 更新大小，在 page.html 中调用
function updateSize(id, w, h) {
    file.elements.forEach(element => {
        if (element.id == id) {
            element.height = h;
            element.width = w;
        }
    });
    $.post(`/api/${pg}/update`, JSON.stringify(file));
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
    $.post(`/api/${pg}/update`, JSON.stringify(file)).done(() => {
        $('#page')[0].contentWindow.loadpage('#ele-' + selected);
    });
}

// 选择元素，加载样式表和属性面板的内容，在 page.html 中调用
function select(id) {
    selected = id;
    selectedIndex = null;
    loadAnimation();
    if (id == null) {
        $('.select-then-enable.able').removeClass('able');
        $('#prop>.props').html('');
        // $('#prop>.props').html('');
        $('#sty').html('<info style="width:100%;text-align:center;margin-top:20px">暂不可对页面设置样式。</info>');
        // $('#animation .animation-panel').hide();
        return;
    }
    $('.select-then-enable').addClass('able');

    file.elements.forEach(e => {
        if (e.id != id) return;
        selectedIndex = file.elements.indexOf(e);
        console.log(selected, selectedIndex);
        loadprop(e, id);
        loadstyle(e, id);
        loadTags();
    });
}

// 加载属性面板内容，在 select, selectTag 中调用
function loadprop(e, id, tag = false) {
    $('#prop>.props').html('');
    propedit = '';
    let prop = copy(props[tag ? 'tag' : e.type]);
    for (let key in e.prop) {
        prop[key].value = e.prop[key];
    }
    for (let key in prop) {
        propedit += `<div class="form-group">
                <label>${prop[key].name}</label>`;
        if (prop[key].type == 'select') {
            propedit += `<selectbox onclick="show(this)" class="form-control ${key}" onchange="setprop('${id}','${key}',this.value ${tag ? ',tag=true' : ''})">`;
            prop[key].options.forEach(option => {
                propedit += `<option value="${option.value}" ${prop[key].value == option.value ? 'selected' : ''}>${option.name}</option>`;
            });
            propedit += `</selectbox>`;
        } else if (prop[key].type == 'number') {
            propedit += `<input type="number" class="form-control ${key}" value="${prop[key].value}" onchange="setprop('${id}','${key}',this.value${tag ? ',tag=true' : ''})">`;
        } else if (prop[key].type == 'text') {
            propedit += `<input type="text" class="form-control ${key}" value="${prop[key].value}" onchange="setprop('${id}','${key}',this.value${tag ? ',tag=true' : ''})">`;
        }
        propedit += `</div>`;
    }
    $('#prop>.props').html(propedit);
}

// 加载元素样式表，在 select, selectTag 中调用
function loadstyle(e, id, tag = false) {
    $('#sty').html('');
    styleedit = '';
    let style = copy(stylem);
    for (let key in e.style) {
        let k = key.split('.');
        style[k[0]][k[1]].value = e.style[key];
        style[k[0]][k[1]].set = true;
    }
    styleedit = '<div class="menu list">';
    for (let key in style) {
        styleedit += `<a class="item ${key}" onclick="toggle_style_page('${key}');">${style[key].name}</a>`;
    }
    styleedit += '</div> <div class="page-container">';

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
                    styleedit += `<selectbox onclick="show(this)" class="form-control ${key2}" onchange="setstyle('${id}','${key}','${key2}',this.value${tag ? ',tag=true' : ''})">`;
                    stylem[key][key2].options.forEach(option => {
                        styleedit += `<option value="${option.value}" ${style[key][key2].value == option.value ? 'selected' : ''}>${option.name}</option>`;
                    });
                    styleedit += `</selectbox>`;
                } else if (stylem[key][key2].type == 'color') {
                    styleedit += `<input type="color" class="form-control ${key2}" value="${style[key][key2].value}" onchange="setstyle('${id}','${key}','${key2}',this.value${tag ? ',tag=true' : ''})">`;
                } else if (stylem[key][key2].type == 'number') {
                    styleedit += `<input type="number" class="form-control ${key2}" value="${style[key][key2].value}" onchange="setstyle('${id}','${key}','${key2}',this.value${tag ? ',tag=true' : ''})">`;
                }
                styleedit += `<button class="del" onclick="delstyle('${id}','${key}','${key2}'${tag ? ',tag=true' : ''})"><i class="bi bi-dash"></i></button>`;
            } else {
                styleedit += `<button class="add" onclick="addstyle('${id}','${key}','${key2}'${tag ? ',tag=true' : ''})"><i class="bi bi-plus"></i></button>`;
            }

            styleedit += `</div>`;
        }
        styleedit += `</div>`;
    }
    styleedit += `</div>`;

    $('#sty').html(styleedit);
    toggle_style_page(Object.keys(style)[0]);
}

// 设置属性
function setprop(id, key, value, tag = false) {
    if (tag) {
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
    $.post(`/api/${pg}/update`, JSON.stringify(file));
    $('#page')[0].contentWindow.loadpage('#ele-' + id);
}

// 显示添加样式的对话框
function addstyle(id, key, key2, tag = false) {
    $('#addstyle').show();
    $('#addstyle>.tit>.key').text(stylem[key].name);
    $('#addstyle>.tit>.key2').text(stylem[key][key2].name);
    $('#addstyle>.ok').click(() => { setstyle(id, key, key2, $('#addstyle>.body>.value>*').val(), tag) });
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

// 设置样式，亦可用于添加样式
function setstyle(id, key, key2, value, tag = false) {
    if (tag) {
        tags[id].style[key + '.' + key2] = value;
        $.post(`/api/updatetag`, JSON.stringify(tags)).done(() => {
            $('#page')[0].contentWindow.loadpage(selected = false);
            loadTags();
            selectTag(id);
        });
        $('#addstyle>.ok').off('click');
        $('#addstyle').hide();
        return;
    }
    file.elements.forEach(e => {
        if (e.id == id) {
            e.style[key + '.' + key2] = value;
        }
    });
    console.log(file);
    $.post(`/api/${pg}/update`, JSON.stringify(file)).done(() => {
        $('#page')[0].contentWindow.loadpage('#ele-' + id);
    });
    $('#addstyle>.ok').off('click');
    $('#addstyle').hide();
}

// 删除样式定义
function delstyle(id, key, key2, tag = false) {
    if (tag) {
        delete tags[id].style[key + '.' + key2];
        $.post(`/api/updatetag`, JSON.stringify(tags)).done(() => {
            $('#page')[0].contentWindow.loadpage(selected = false);
            loadTags();
            selectTag(id);
        });
        return;
    }
    file.elements.forEach(e => {
        if (e.id == id) {
            delete e.style[key + '.' + key2];
        }
    });
    $.post(`/api/${pg}/update`, JSON.stringify(file)).done(() => {
        $('#page')[0].contentWindow.loadpage('#ele-' + id);
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

    $.post(`/api/${pg}/update`, JSON.stringify(file)).done(() => {
        $('#page')[0].contentWindow.loadpage('#ele-' + selected);
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
        $('#page')[0].contentWindow.loadpage('#ele-' + file.elements[file.elements.length - 1].id);
    });
}

// 删除选中的元素
function delEle(id) {
    $.post(`/api/${pg}/delete`, JSON.stringify({ id: id })).done(data => {
        file = data;
        $('#page')[0].contentWindow.loadpage();
    });
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
        $('#page')[0].contentWindow.loadpage();
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
        $('#contextmenu').append(`<div class="option ${disable ?'disable':''}" onclick="${option.getAttribute('onclick')}">${option.innerText}</div>`);
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

// 见上
function selectOption(option) {
    $('selectbox.open').find('[selected]').removeAttr('selected');
    $('selectbox.open').find(`[value=${option}]`).attr('selected', 'selected');
    $('selectbox.open').val(option).change().removeClass('open');
    $('#selectmenu').hide();
}

// 缩放页面
function zoompage(z) {
    $('#page')[0].contentWindow.zoom(z / 100);
    $('#page').css('zoom', z / 100);
}

// 加载动画
function loadAnimation() {
    // if (!selected) {
    //     $('#animation .animation-panel').hide();
    //     return;
    // }
    // $('#animation .animation-panel').show();

    // 加载onload动画
    let html = '';
    file.animation.onload.forEach((i,anim) => {
        // if (anim.target === selected) {
            html += `<div class="animation-item ${anim.target === selected ? 'selected' : ''}" 
                onclick="selectAnimation('onload',${i})">
                <span>${anim.type}</span>
                <button onclick="event.stopPropagation();deleteAnimation('onload', null, '${anim.target}')">
                    <i class="bi bi-trash"></i>
                </button>
            </div>`;
        // }
    });
    $('.animation-panel .onload .animation-list').html(html);

    // 加载onclick节点
    html = '';
    file.animation.onclick.forEach((node, index) => {
        let animHtml = '';
        node.actions.forEach((anim, i) => {
            // if (anim.target === selected) {
                animHtml += `<div class="animation-item ${anim.target === selected ? 'selected' : ''}" 
                    onclick="event.stopPropagation();selectAnimation()">
                    <span>${anim.type}</span>
                    <button onclick="event.stopPropagation();deleteAnimation('onclick', ${index}, '${anim.target}', ${i})">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>`;
            // }
        });
        
        html += `<div class="node" onclick="selectNode(${index})">
            <div class="node-header">
                <span>${node.name}</span>
                <button onclick="event.stopPropagation();deleteNode(${index})">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
            <div class="animation-list">
                ${animHtml}
                <button onclick="showAddAnimation(${index})">添加动画</button>
            </div>
        </div>`;
    });
    $('.animation-panel .onclick .nodes').html(html);
}

function selectAnimation(anim) {
    selectedAnimation = anim;

    $('.animation-editor .no-selection').hide();
    $('.animation-editor .editor').show();

    html='';
    html+=`<div class="form-group"><label>类型</label><selectbox onclick="show(this)" onchange="updateAnimation('type', this.value)">`;
    allanimtype.forEach(type => {
        html+=`<option value="${type}" ${anim.type==type?'selected':''}>${type}</option>`;
    });
    html+=`</selectbox></div>`;
    // html+=`<div class="form-group"><label>时长/s</label>
    // <input type="number" step="0.1" min="0" value="${anim.duration}" onchange="updateAnimation('duration', this.value)">
    // </div>`;
    html+=`<div class="form-group"><label>延迟/s</label>
    <input type="number" step="0.1" min="0" value="${anim.delay}" onchange="updateAnimation('delay', this.value)">
    </div>`;
    let prop=copy(props['anim'][anim.type]);
    for(let key in anim.prop){
        prop[key].value=anim.prop[key];
    }
    for(let key in prop){
        html+=`<div class="form-group"><label>${prop[key].name}</label>`;
        if(prop[key].type=='select'){
            html+=`<selectbox onclick="show(this)" class="form-control ${key}" onchange="updateAnimation('${key}', this.value)">`;
            prop[key].options.forEach(option=>{
                html+=`<option value="${option.value}" ${prop[key].value==option.value?'selected':''}>${option.name}</option>`;
            });
            html+=`</selectbox>`;
        } else if(prop[key].type=='number'){
            html+=`<input type="number" class="form-control ${key}" value="${prop[key].value}" onchange="updateAnimation('${key}', this.value)">`;
        }
        html+=`</div>`;
    }

    html+=`<button class="preview-btn" onclick="previewAnimation()">预览动画</button>`;
    
    $('.animation-editor .editor').html(html);

    // 加载动画属性
    // $('.animation-editor select[onchange*="type"]').val(anim.type);
    // $('.animation-editor select[onchange*="action"]').val(anim.action);
    // $('.animation-editor input[onchange*="duration"]').val(anim.duration);
    // $('.animation-editor input[onchange*="delay"]').val(anim.delay);
    // if (anim.type === 'fly') {
    //     $('.animation-editor .direction-select').show();
    //     $('.animation-editor select[onchange*="direction"]').val(anim.direction);
    // } else {
    //     $('.animation-editor .direction-select').hide();
    // }
}

function updateAnimation(prop, value) {
    if (!selectedAnimation) return;
    console.log(prop,value);

    selectedAnimation[prop] = value;
    if (prop == 'type' && value == 'fly') {
        for(let key in prop.anim[value]){
            if(!selectedAnimation.prop.includes(key)){
                selectedAnimation.prop[key]=prop.anim[value][key].default;
            }
        }
    }

    $.post(`/api/${pg}/update`, JSON.stringify(file));
    loadAnimation();
}

function addTimeNode() {
    file.animation.onclick.push({
        name: '新节点',
        actions: []
    });

    $.post(`/api/${pg}/update`, JSON.stringify(file));
    loadAnimation();
}

function deleteNode(index) {
    file.animation.onclick.splice(index, 1);
    $.post(`/api/${pg}/update`, JSON.stringify(file));
    loadAnimation();
}

function showAddAnimation(nodeIndex) {
    // selectedNode = nodeIndex;
    file.animation.onclick[nodeIndex].actions.push({
        target: selected,
        type: 'fadein',
        duration: 1,
        delay: 0
    });
    $.post(`/api/${pg}/update`, JSON.stringify(file));
    loadAnimation();
}

function deleteAnimation(type, nodeIndex, targetId, animIndex) {
    if (type === 'onload') {
        file.animation.onload = file.animation.onload.filter(a => a.target !== targetId);
    } else {
        file.animation.onclick[nodeIndex].actions.splice(animIndex, 1);
    }
    $.post(`/api/${pg}/update`, JSON.stringify(file));
    loadAnimation();
}

function previewAnimation() {
    console.log('under developing');
}

function getpageoffset(){
    return $('#page').offset();
}

function copyElement() {
    clipboard = copy(file.elements[selectedIndex]);
    $('#copy').hide();
}
function pasteElement() {
    if (clipboard) {
        const newElement = copy(clipboard);
        newElement.id= crypto.randomUUID();
        file.elements.push(newElement);
        $.post(`/api/${pg}/update`, JSON.stringify(file)).done(() => {
            $('#page')[0].contentWindow.loadpage('#ele-' + newElement.id);
        });
    }
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


document.body.onload=()=>{
    $('#zoompage').val(50);
    zoompage(50);
}

loadTags(true);

for (let i = 0; i < pgnum; i++) {
    $(`#pages>.list`).append(`<span class="item ${i==pg?'active':'" onclick="window.location.href=\'/edit/'+i+"';"}" oncontextmenu="showcm(event,this)">
        第${i + 1}页

        <contextmenu>
            <p onclick="copyPage(${i})">复制至其后</p>
            <p onclick="deletePage(${i})">删除此页</p>
        </contextmenu>
    </span>`);
}