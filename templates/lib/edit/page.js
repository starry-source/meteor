let moving = false;
let resizing = false;
let selecting = false;
let startPos = {x: 0, y: 0}; 
let startSize = {width: 0, height: 0};
let selectedElement = null;
const $selector = $('#selector');
window.selectedElements = [];
let zoom_level=1;


function loadpage(selected=null){
    $.getJSON('/get/'+pg).done(r=>{
        $('#tagcss').html(r.css+'\n'+r.tagcss);
        $('#elements').html(r.elements_html);
        $(':root').css('--background',r.background);
        if(selected==null){
            clearSelection();
        }else if(selected==false){
            // 避免向父页面汇报，导致重新加载
            // moving=true;
            // selectElement(selectedElement);
            // moving=false;
            null;
        }else{
            selectElement(selected);
        }
    });
}
loadpage();

function setKeyFrame(index){
    document.querySelector('#elements').className=`page active ${pg} kf-${index}`;
    selectElement(selectedElement);
}

// 选择元素，供内部、父页面调用
function selectElement(element) {
    const $element = $(element);
    if (!$element.length) return;
    
    selectedElement = $element[0];
    const position = $element.position();
    
    $selector.show().css({
        left: position.left,
        top: position.top,
        // width: selectedElement.offsetWidth,
        // height: $element.outerHeight()
        width: $element.outerWidth()*zoom_level,
        height: $element.outerHeight()*zoom_level,
        transform: 'scale('+(1/zoom_level)+')'
    });

    $('#controls').show().css({
        left: position.left+$element.outerWidth()+10*(1/zoom_level),
        top: position.top,
        transform: 'scale('+(1/zoom_level)+')'

    });
    
    // 通知父页面
    if (!moving && !resizing) {
        window.parent.select($element.data('id'));
    }
}

function selectAll(){
    selectedElements=$('.element').toArray();
    updateSelectionBox();
}

// 清除选择
function clearSelection() {
    if (moving || resizing) return;
    selectedElement = null;
    selectedElements=[];
    $selector.hide();
    $('#controls').hide();
    window.parent.select(null);
}


$(document).on('keydown', (e) => {
    if (e.key === 'Escape') {
        clearSelection();
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
        window.parent.delEle();
    }
    // else if(e.key === 'z' && (e.ctrlKey || e.metaKey)) {
    //     // Ctrl+Z，撤销
    //     window.parent.undo();
    // } else if(e.key === 'y' && (e.ctrlKey || e.metaKey)) {
    //     // Ctrl+Y，重做
    //     window.parent.redo();
    // }
    else if (e.key === 'c' && (e.ctrlKey || e.metaKey)) {
        // Ctrl+C，复制
        window.parent.copyElement();
    } else if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
        // Ctrl+V，粘贴
        window.parent.pasteElement();
    } else if (e.key === 'x' && (e.ctrlKey || e.metaKey)) {
        // Ctrl+X，剪切：复制后删除
        window.parent.copyElement();
        window.parent.delEle();
    } else if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
        // Ctrl+A，全选
        selectAll();
    } else if (e.key === 'Tab') {
        e.preventDefault();
        e.stopPropagation();
        if (selectedElement) {
            const $nextElement = $(selectedElement).next('.element');
            if ($nextElement.length) {
                selectElement($nextElement[0]);
            } else {
                selectElement($('.element').first()[0]);
            }
        }
    } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        selectedElements.forEach(element => {
            const $element = $('#ele-'+element.dataset.id);
            const pos = $element.position();
            window.parent.updatePosition(element.dataset.id, pos.left - 10, pos.top);
        });
        updateSelectionBox(true);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedElements.forEach(element => {
            const $element = $('#ele-' + element.dataset.id);
            const pos = $element.position();
            window.parent.updatePosition(element.dataset.id, pos.left, pos.top - 10);
        });
        updateSelectionBox(true);
    } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        selectedElements.forEach(element => {
            const $element = $('#ele-' + element.dataset.id);
            const pos = $element.position();
            window.parent.updatePosition(element.dataset.id, pos.left + 10, pos.top);
        });
        updateSelectionBox(true);
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedElements.forEach(element => {
            const $element = $('#ele-' + element.dataset.id);
            const pos = $element.position();
            window.parent.updatePosition(element.dataset.id, pos.left, pos.top + 10);
        });
        updateSelectionBox(true);
    }
});

// 层级调整
function changeZIndex(type) {
    if (!selectedElement) return;
    window.parent.updateElementsOrder(selectedElement.dataset.id,type);
}

function zoom(z){
    zoom_level=z;
    // $('#elements').css('zoom',zoom_level);
    moving=true;
    selectElement(selectedElement);
    moving=false;
}

$('#controls').hide();

function updateSelectionBox(dontshowcontrols=false) {
    if (!selectedElements.length) {
        $('#selector').hide();
        $('#controls').hide();
        window.parent.select(null);
        $('#controls').hide();
        return;
    }

    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    selectedElements.forEach(element => {
        const $element = $(element);
        const position = $element.position();
        const right = position.left + $element.outerWidth();
        const bottom = position.top + $element.outerHeight();
        
        minX = Math.min(minX, position.left);
        minY = Math.min(minY, position.top);
        maxX = Math.max(maxX, right);
        maxY = Math.max(maxY, bottom);
    });

    console.log('minX:', minX, 'minY:', minY, 'maxX:', maxX, 'maxY:', maxY);
    $('#selector').show().css({
        left: minX,
        top: minY,
        width: (maxX - minX) * zoom_level,
        height: (maxY - minY) * zoom_level,
        transform: 'scale('+(1/zoom_level)+')'
    });

    // 只有单选时显示控制栏
    // if (selectedElements.length === 1) {
    if(!dontshowcontrols){
        $('#controls').show().css({
            left: maxX + 10 * (1/zoom_level),
            top: minY,
            transform: 'scale('+(1/zoom_level)+')'
        });

        if(selectedElements.length>1){
            $('#controls').addClass('mult');
            window.parent.selectmult();
        }else if(selectedElements.length==1){
            
            $('#controls').removeClass('mult');
            window.parent.select(selectedElements[0].dataset.id);
        }
        
        $('#controls>.num>span').text(selectedElements.length);
    }
    // } else {
    //     $('#controls').hide();
    // }
}

// 创建框选工具
const $selectionBox = $('#selection-box');

// 背景右键菜单
$(document).on('contextmenu', function(e) {
    if ($(e.target).closest('.element, #controls').length === 0) {
        e.preventDefault();
        e.stopPropagation();
        const offset = window.parent.getpageoffset();
        window.parent.showcm(e.clientX * zoom_level + offset.left, e.clientY * zoom_level + offset.top, document.getElementById('cm'));
    }
});

// 委托处理所有元素的点击事件，以避免一些奇异的冒泡逻辑
$(document).on('mousedown', function(e) {
    if(e.button !== 0) return;
    
    const $target = $(e.target);
    
    if ($target.closest('#controls').length) {
        e.stopPropagation();
        return;
    }

    if ($target.hasClass('resize-handle')) {
        e.stopPropagation();
        if (!selectedElement) return;
        resizing = true;
        $('#controls').hide();
        startPos = {x: e.pageX, y: e.pageY};
        startSize = {
            width: $(selectedElement).width(),
            height: $(selectedElement).height()
        };
        // 确保selectedElements有效
        if(selectedElements.length==1)
        selectedElements = [selectedElement];
        return;
    }

    const $element = $target.closest('.element');
    if ($element.length) {
        e.stopPropagation();
        
        if(e.ctrlKey || e.metaKey) {
            const elementIndex = selectedElements.indexOf($element[0]);
            if(elementIndex === -1) {
                selectedElements.push($element[0]);
                if(!selectedElement) selectedElement = $element[0];
            } else {
                selectedElements.splice(elementIndex, 1);
                if(selectedElement === $element[0]) {
                    selectedElement = selectedElements[0] || null;
                }
            }
        }else if (!selectedElements.includes($element[0])) {
            selectedElements = [$element[0]];
            selectedElement = $element[0];
        }
        if(selectedElements.length === 1) {
            selectElement($element[0]);
        }
        if(selectedElements.length > 0) {
            moving = true;
            $('#controls').hide();
            
            selectedElements.forEach(element => {
                const $el = $(element);
                $el.data('startPos', {
                    x: e.pageX - $el.position().left,
                    y: e.pageY - $el.position().top
                });
            });
        }
        // updateSelectionBox();
    } else if($target.closest('#controls, #selector').length === 0) {
        startPos = {x: e.pageX, y: e.pageY};
        selecting = true;
        $selectionBox.css({
            left: startPos.x,
            top: startPos.y,
            width: 0,
            height: 0
        }).show();
        if(!e.ctrlKey && !e.metaKey) {
            selectedElements = [];
            selectedElement = null;
            clearSelection();
        }
    }else {
        // 即点击空白区域
        clearSelection();
    }
});

$(document).on('mousemove', function(e) {
    if (moving && selectedElements.length > 0) {
        selectedElements.forEach(element => {
            const $element = $(element);
            const startPos = $element.data('startPos');
            const newLeft = e.pageX - startPos.x;
            const newTop = e.pageY - startPos.y;
            $element.css({
                left: newLeft,
                top: newTop
            });
            // console.log('hi');
        });
        updateSelectionBox(dontshowcontrols=true);
    } else if (resizing && selectedElement) {
        const $element = $(selectedElement);
        const newWidth = Math.max(20, startSize.width + (e.pageX - startPos.x));
        const newHeight = Math.max(20, startSize.height + (e.pageY - startPos.y));
        $element.css({
            width: newWidth,
            height: newHeight
        });
        updateSelectionBox(dontshowcontrols=true);
    } else if (selecting) {
        const width = e.pageX - startPos.x;
        const height = e.pageY - startPos.y;
        
        $selectionBox.css({
            left: width < 0 ? e.pageX : startPos.x,
            top: height < 0 ? e.pageY : startPos.y,
            width: Math.abs(width),
            height: Math.abs(height)
        });

        $('.element').each(function() {
            const $element = $(this);
            const elementPos = $element.position();
            const elementRect = {
                left: elementPos.left,
                top: elementPos.top,
                right: elementPos.left + $element.outerWidth(),
                bottom: elementPos.top + $element.outerHeight()
            };
            
            const selectionRect = {
                left: parseFloat($selectionBox.css('left')),
                top: parseFloat($selectionBox.css('top')),
                right: parseFloat($selectionBox.css('left')) + $selectionBox.width(),
                bottom: parseFloat($selectionBox.css('top')) + $selectionBox.height()
            };

            if (elementRect.left < selectionRect.right && 
                elementRect.right > selectionRect.left &&
                elementRect.top < selectionRect.bottom &&
                elementRect.bottom > selectionRect.top) {
                if (!selectedElements.includes(this)) {
                    selectedElements.push(this);
                    if(!selectedElement) selectedElement = this;
                }
            } else if (!e.ctrlKey && !e.metaKey) {
                const index = selectedElements.indexOf(this);
                if (index > -1) {
                    selectedElements.splice(index, 1);
                    if(selectedElement === this) {
                        selectedElement = selectedElements[0] || null;
                    }
                    // updateSelectionBox();
                }
            }
        });
        updateSelectionBox();
    }
});

$(document).on('mouseup', function(e) {
    if(e.button !== 0) return;
    if (moving && selectedElements.length > 0) {
        selectedElements.forEach(element => {
            const pos = $(element).position();
            window.parent.updatePosition(element.dataset.id, pos.left, pos.top);
        });
        updateSelectionBox();
    }
    if (resizing && selectedElement) {
        const $el = $(selectedElement);
        window.parent.updateSize(
            selectedElement.dataset.id,
            $el.width(),
            $el.height()
        );
        updateSelectionBox();
    }
    if (selecting) {
        $selectionBox.hide();
        if(selectedElements.length==0)
            clearSelection();
        selectedElement=null;
    }
    moving = false;
    resizing = false;
    selecting = false;
});

// 右键菜单
$(document).on('contextmenu', '.element', function(e) {
    e.stopPropagation();
    e.preventDefault();
    
    const $element = $(e.currentTarget);
    console.log('en');
    if (!selectedElements.includes($element[0])) {
        console.log('???');
        if (!e.ctrlKey && !e.metaKey) {
            selectedElements = [$element[0]];
            selectedElement = $element[0];
        } else {
            selectedElements.push($element[0]);
            if (!selectedElement) selectedElement = $element[0];
        }
        updateSelectionBox();
    }
    
    const offset = window.parent.getpageoffset();
    window.parent.showcm(e.clientX * zoom_level + offset.left, e.clientY * zoom_level + offset.top, document.getElementById('cm'));
});


// 快速对齐
function alignElementd(type) {
    if (!selectedElement) return;
    const $element = $(selectedElement);
    const $body = $('body');
    const bodyWidth = $body.width();
    const bodyHeight = $body.height();
    const elementWidth = $element.outerWidth();
    const elementHeight = $element.outerHeight();
    
    let newLeft = $element.position().left;
    let newTop = $element.position().top;

    switch(type) {
        case 'center':
            newLeft = (bodyWidth - elementWidth) / 2;
            newTop = (bodyHeight - elementHeight) / 2;
            break;
        case 'hcenter':
            newLeft = (bodyWidth - elementWidth) / 2;
            break;
        case 'vcenter':
            newTop = (bodyHeight - elementHeight) / 2;
            break;
    }

    $element.css({left: newLeft, top: newTop});
    $selector.css({left: newLeft, top: newTop});
    window.parent.updatePosition(selectedElement.dataset.id, newLeft, newTop);
}


// 对齐功能
function alignElement(type) {
    if (!selectedElements.length) return;
    if(selectedElements.length == 1) {
        alignElementd(type);
        return;
    }
    const $body = $('body');
    const bodyWidth = $body.width();
    const bodyHeight = $body.height();

    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    
    selectedElements.forEach(element => {
        const $element = $(element);
        const position = $element.position();
        const width = $element.outerWidth();
        const height = $element.outerHeight();
        
        minX = Math.min(minX, position.left);
        minY = Math.min(minY, position.top);
        maxX = Math.max(maxX, position.left + width);
        maxY = Math.max(maxY, position.top + height);
    });

    const totalWidth = maxX - minX;
    const totalHeight = maxY - minY;
    let targetLeft, targetTop;

    switch(type) {
        case 'center':
            targetLeft = (bodyWidth - totalWidth) / 2;
            targetTop = (bodyHeight - totalHeight) / 2;
            break;
        case 'hcenter':
            targetLeft = (bodyWidth - totalWidth) / 2;
            targetTop = minY;
            break;
        case 'vcenter':
            targetLeft = minX;
            targetTop = (bodyHeight - totalHeight) / 2;
            break;
    }

    const offsetX = targetLeft - minX;
    const offsetY = targetTop - minY;
    
    selectedElements.forEach(element => {
        const $element = $(element);
        const position = $element.position();
        const newLeft = position.left + offsetX;
        const newTop = position.top + offsetY;
        
        $element.css({left: newLeft, top: newTop});
        window.parent.updatePosition(element.dataset.id, newLeft, newTop);
    });
    
    updateSelectionBox();
}