let selected=null;
let selectedIndex=null;

// 复制一份 json，防止原数据被修改
function copy(obj){
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
function updateSize(id, w,h) {
    file.elements.forEach(element => {
        if (element.id == id) {
            element.height = h;
            element.width=w;
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
    $.post(`/api/${pg}/update`, JSON.stringify(file)).done(()=>{
        $('#page').attr('src', $('#page').attr('src'));
        select(selected);
        $('#page').on('load',()=>{
            $('#page')[0].contentWindow.selectElement('#ele-'+selected);
            $('#page').off('load');
        });
    });
    
}

// 选择元素，加载样式表和属性面板的内容，在 page.html 中调用
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

// 加载属性面板内容，在 select, selectTag 中调用
function loadprop(e, id, tag=false) {
    // 设置 tag 为 true 即加载标签的属性，即名称
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

// 加载元素样式表，在 select, selectTag 中调用
function loadstyle(e, id, tag=false) {
    // 设置 tag 为 true 即加载标签样式
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

// 设置属性
// 元素属性不应被删除、新增
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


// 显示添加样式的对话框
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

// 设置样式，亦可用于添加样式
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

// 删除样式定义
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

// 刷新标签面板，标注当前元素正在使用的标签
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

// 编辑标签
function selectTag(name){
    loadprop(tags[name], name, tag=true);
    loadstyle(tags[name], name, tag=true);
}

// 应用标签于当前选中元素
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
// 切换样式表的分类，结构见 loadstyle
function toggle_style_page(page){
    $('#sty>.menu>.item.show').removeClass('show');
    $('#sty>.menu>.item.'+page).addClass('show');
    $('#sty>.page-container>.page.show').removeClass('show');
    $(`#sty>.page-container>.page.${page}`).addClass('show');
}

// 添加元素
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

// 删除选中的元素
function delEle(id){
    $.post(`/api/${pg}/delete`, JSON.stringify({id:id})).done(data=>{
        file=data;
        $('#page').attr('src', $('#page').attr('src'));
        select(null);
    });
}

// 显示新元素，在对话框的确定按钮被调用
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

// 用于展示 selectbox 的下拉菜单
// 计划能处理其它菜单的显示，如右键菜单、下拉菜单等
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

// 见上
function selectOption(option){
    $('selectbox.open').find('[selected]').removeAttr('selected');
    $('selectbox.open').find(`[value=${option}]`).attr('selected','selected');
    $('selectbox.open').val(option).change().removeClass('open');
    $('#selectmenu').hide();
}

// 缩放页面
function zoompage(z){
    $('#page').css('zoom',z/100);
}

loadTags(true);