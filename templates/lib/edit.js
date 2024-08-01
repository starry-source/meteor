let np=-1,ni=-1,scx=1;

let mded=false,ndic;

let cs={
    position:{
        'static':'铺排',
        'absolute':'绝对于页面',
        'fixed':'绝对于屏幕',
        'relative':'相对',
        'sticky':'粘滞',
    },
    display:{
        'block':'矩块',
        'inline':'行内内联',
        'inline-block':'行内矩块',
        'flex':'并列',
        'inline-flex':'行内并列',
        'none':'隐藏'
    },
    'text-align':{
        'center':'居中',
        'left':'左',
        'right':'右',
        'start':'前',
        'end':'后',
    }
}
for (const box of document.querySelectorAll('.chsbox:not(.part)')) {
    const th=cs[box.classList[1]];
    for(const i in th){
        box.innerHTML+=`<a class="a" value="${i}" onclick="
        mostyle('${box.classList[1]}','${i}');closechs();">${th[i]}</a>`
    }
}

let cspart={
    unit:{
        'px':'px(像素)',
        '%':'%',
        'em':'em',
        'rem':'rem',
        'cm':'cm(厘米)',
        'mm':'mm(毫米)',
        '':'无',
    }
}


for (const box of document.querySelectorAll('.chsbox.part')) {
    const th=cspart[box.classList[1]];
    for(const i in th){
        box.innerHTML+=`<a class="a" value="${i}" 
        onclick="$('.chsbtn.show>span').text('${i}');
        mostyle($('.chsbtn.show').attr('stylekey'),$($('.chsbtn.show').attr('valpath')).val()+'${i}');
        closechs()">${th[i]}</a>`
    }
}


function stop(e){
    e.stopPropagation();
    return false;
}

function disop() {
    clrop();
    $('#edit,#options').addClass('disabled');
    $('#toolbar>.b.ac').addClass('disabled');
}
function ablop() {
    $('#edit,#options').removeClass('disabled');
    $('#toolbar>.b.ac').removeClass('disabled');
}

function getele(s,all=false) {
    let page = document. getElementById('page');
    let doc = (page.contentDocument || page.contentWindow);
    if (doc.document)doc=doc.document;
    if(all)
        return doc.querySelectorAll(s);
    else
        return doc.querySelector(s);
}

function gotopage(pid) {
    if(pid==np){
        document.getElementById('page').contentWindow.location.reload();
    }else{
        $('#page').attr('src','/edit/'+pid);
        ni=-1;
        if(mded)
            focpage();
        else{
            disop();
        }
    }
    np=pid;
    // if(!force)
    // if(mvis)if(pid!=np)return;
    // $.get('/edit/'+pid).then(r=>{
    //     $('#page').html(r);
    //     if(np!=pid){
    //         ni=-1;
    //         if(mded)
    //             focpage();
    //         else{
    //             disop();
    //         }
    //     }
    //     np=pid;
    //     if(mvis){
    //         let ele=$(`#page>div .ele-${ni}`);
    //         $('#move').css('left',ele.offset().left);
    //         $('#move').css('top',ele.offset().top);
    //         $('#move').css('width',ele[0].offsetWidth*0.6);
    //         $('#move').css('height',ele[0].offsetHeight*0.6);
    //     }
    // });
}


function rlen(jq,vl) {
    if(vl==''){
        $(jq+'>.inp').attr('type','number');
        $(jq+'>.inp').val('');
        $(jq+'>.chsbtn>span').text('');
        return;
    }
    let tmp='',ret='',f=false;
    for (const i of vl) {
        if(isNaN(i)){
            if(!f){
                $(jq+'>.inp').attr('type','text');
                $(jq+'>.inp').val(vl);
                $(jq+'>.chsbtn>span').text('');
            }
            tmp+=i;
            f=true;
        }else{
            if(f){
                $(jq+'>.inp').attr('type','text');
                $(jq+'>.inp').val(vl);
                $(jq+'>.chsbtn>span').text('');
            }
            ret+=i;
        }
    }
    if('^px$ ^%$ ^em$ ^rem$ ^cm$ ^mm$'.includes(`^${tmp}$`)){
        $(jq+'>.inp').attr('type','number');
        $(jq+'>.inp').val(Number(ret));
        $(jq+'>.chsbtn>span').text(tmp);
        return;
    }
    $(jq+'>.inp').attr('type','text');
    $(jq+'>.inp').val(vl);
    $(jq+'>.chsbtn>span').text('');
}

function dealstyle(r) {
    $('#bs>.ops>.opo>.h>.inp').val(r.height||'');
    $('#bs>.ops>.opo>.w>.inp').val(r.width||'');
    $('#bs>.ops>.ft>.fam>.inp').val(r['font-family']||'');
    $('#bs>.ops>.ft>.color>.inp').val(r['color']||'');
    $('#bs>.ops>.ft>.chsbtn.text-align>span').text(cs['text-align'][r['text-align']]||r['text-align']||'文字位置');
    $('#edlist>.appr>.bgcolor>.inp').val(r['background-color']||'');
}

function clrop() {
    $('#edlist>.pg.posi').removeClass('fcpg');
    $('#edlist>.pg.prop').html('');
    $('#oplist').html('');

    $('#bs>.chsbtn.position>span').text('位置');
    $('#bs>.chsbtn.display>span').text('布局');
    $('#bs>.ops>.opo>.t>.inp').val('');
    $('#bs>.ops>.opo>.r>.inp').val('');
    $('#bs>.ops>.opo>.l>.inp').val('');
    $('#bs>.ops>.opo>.b>.inp').val('');
    $('#bs>.ops>.opo>.h>.inp').val('');
    $('#bs>.ops>.opo>.w>.inp').val('');
    $('#bs>.ops>.ft>.size>.inp').val('');
    $('#bs>.ops>.ft>.size>.chsbtn>span').text('');
    $('#bs>.ops>.ft>.fam>.inp').val('');
    $('#bs>.ops>.ft>.color>.inp').val('');
    $('#bs>.ops>.ft>.chsbtn.text-align>span').text('位置');
    $('#edlist>.appr>.bgcolor>.inp').val('');
    
}

function beclicked(itemid,force=true) {
    if(itemid==-1){
        focpage();
        return;
    }
    // if(!force)
    if(ni!=itemid)
    if(mvis)return;
    if(!mded)return;

    ablop();
    $.getJSON('/edit/'+np+'/get/'+itemid).then(r=>{
        // console.log(cs.position[r.position]);
        $('#edlist>.pg.prop').html('');
        for(let i in r.prop){
            $('#edlist>.pg.prop')[0].innerHTML+=`<div class="op">
            <span>${i}</span>
            <input class="inp" type="text" value="${r.prop[i]}" onblur="moprop('${i}',this.value)" onkeyup="if(event.keyCode==13)moprop('${i}',this.value)" />
            </div>`;
        }
        if($.isEmptyObject(r)){
            $('#edlist>.pg.prop').html('<i>無</i>');
        }
        ndic=r;
        r=r.style;
        $('#bs>.chsbtn.position>span').text(cs.position[r.position]||r.position||'位置');
        $('#bs>.chsbtn.display>span').text(cs.display[r.display]||r.display||'布局');
        $('#bs>.ops>.opo>.t>.inp').val(r.top||'');
        $('#bs>.ops>.opo>.r>.inp').val(r.right||'');
        $('#bs>.ops>.opo>.l>.inp').val(r.left||'');
        $('#bs>.ops>.opo>.b>.inp').val(r.bottom||'');
        // $('#bs>.ops>.om>.t>.inp').val(r['margin-top']||'');
        // $('#bs>.ops>.om>.r>.inp').val(r['margin-right']||'');
        // $('#bs>.ops>.om>.b>.inp').val(r['margin-bottom']||'');
        // $('#bs>.ops>.om>.l>.inp').val(r['margin-left']||'');
        rlen('#bs>.ops>.ft>.size',r['font-size']||'');
        dealstyle(r);
        // 样式卡
        $('#oplist').html('');
        for(let i in r){
            $('#oplist')[0].innerHTML+=`<div class="op">
            <p>${i}</p>
            <input class="inp" type="text" value="${r[i]}" onblur="mostyle('${i}',this.value,true,true)" onkeyup="if(event.keyCode==13)mostyle('${i}',this.value,true,true)" />
            <a class="a cir dele" onclick="destyle('${i}')"><i class="bi bi-trash3"></i></a></div>`;
        }
        if($.isEmptyObject(r)){
            $('#oplist').html('<i>無</i>');
        }
        ni=itemid;
        $('#edlist>.posi').removeClass('fcpg');
    });
}
function focpage() {
    if(mvis)return;
    if(!mded)return;
    ablop()
    $.getJSON('/edit/'+np+'/getpg').then(r=>{
        clrop()
        $('#edlist>.pg.prop').html('<i>無</i>');
        $('#edlist>.posi').addClass('fcpg');
        rlen('#bs>.ops>.ft>.size',r['font-size']||'');
        dealstyle(r);

        // 样式卡
        $('#oplist').html('');
        for(let i in r){
            $('#oplist')[0].innerHTML+=`<div class="op">
            <p>${i}</p>
            <input class="inp" type="text" value="${r[i]}" onblur="mostyle('${i}',this.value,true,true)" onkeyup="if(event.keyCode==13)mostyle('${i}',this.value,true,true)" />
            <a class="a cir dele" onclick="destyle('${i}')"><i class="bi bi-trash3"></i></a></div>`;
        }
        if(r==$.isEmptyObject(r)){
            $('#oplist').html('<i>無</i>');
        }
        ni=-1;
    });
}


function mostyle(k,v,f=true,chart=false){
    if(!chart){
        console.log('hi');
        if(v==''){
            destyle(k);
            return;
        }
    }
    $.get('/edit/'+np+'/set/'+ni+'/'+encodeURIComponent(k)+'/'+encodeURIComponent(v)).then(r=>{
        if(r=='well'){
            if(f){
                gotopage(np);
                if(ni==-1)
                    focpage();
                else
                    beclicked(ni);
            }
        }
    });
}
function moprop(k,v){
    $.get('/edit/'+np+'/setp/'+ni+'/'+encodeURIComponent(k)+'/'+encodeURIComponent(v)).then(r=>{
        if(r=='well'){
            gotopage(np);
            beclicked(ni);
        }
    });
}

function destyle(k,f=true){
    $.get('/edit/'+np+'/del/'+ni+'/'+encodeURIComponent(k)).then(r=>{
        if(f){
            gotopage(np);
            beclicked(ni)
        }
    // $('#options>.head>.tit>.a.mul').removeClass('del');
    // $('#oplist').removeClass('del');
    // $('#options>.head>.tit>.a.del').show();
    });
}

function addEle(name) {
    if(mvis)return;
    $.get('/edit/'+np+'/add/'+encodeURIComponent(name)).then(r=>{
        gotopage(np);
        focpage();
    })
}

function delEle() {
    if(mvis)return;
    $.get('/edit/'+np+'/dele/'+ni).then(r=>{
        // $('#page').html(r);
        gotopage(np);
        focpage();
    });
}

function closechs() {
    $('.chsbox.show0').removeClass('show');
    $('.chsbox.show0').removeClass('show0');
    $('.chsbtn.show').removeClass('show');
}
function openchs(btn,cl) {
    if($(btn).hasClass('show')){
        closechs();
    }else{
        closechs();
        let tmp=$('.chsbox.'+cl);
        tmp.css('left',btn.offsetLeft);
        tmp.css('top',btn.offsetTop+btn.offsetHeight+4);
        tmp.css('right','unset');
        tmp.css('height','unset');
        tmp.addClass('show0');
        if(tmp[0].offsetLeft+tmp[0].offsetWidth+5>window.innerWidth){
            tmp.css('left','unset');
            tmp.css('right',5);
        }
        if(tmp[0].offsetTop+tmp[0].offsetHeight+5>window.innerHeight){
            tmp.css('height',window.innerHeight-tmp[0].offsetTop-5);
        }
        tmp.addClass('show');
        $(btn).addClass('show');
    }
}

let mvdx,mvdy,mvis;
function stmove() {
    if(ni==-1)return;
    if(mvis){
        mvis=false;
        $('#toolbar>.b.ac>.mv').removeClass('sel');
        $('#move').removeClass('show');
        $('#page').removeClass('disable');
        $('#toolbar>.b.mded,#toolbar>.b.ac>.dl').removeClass('disabled');
        return;
    }
    $('#toolbar>.b.ac>.mv').addClass('sel');
    $('#page').addClass('disable');
    
    let ele=$(getele('.ele-'+ni));
    $('#move').css('left',ele.offset().left+$('#page').offset().left);
    $('#move').css('top',ele.offset().top+$('#page').offset().top);
    $('#move').css('width',ele[0].offsetWidth*scx);
    $('#move').css('height',ele[0].offsetHeight*scx);
    $('#move').addClass('show');
    mvis=true;
    $('#toolbar>.b.mded,#toolbar>.b.ac>.dl').addClass('disabled');
}
function mvmd(e){
    mvdx=e.offsetX;
    mvdy=e.offsetY;
    document.addEventListener('mousemove',mvev);
    document.addEventListener('mouseup',mvmu);
}
function mvev(e) {
    $('#move').css('left',e.clientX-mvdx);
    $('#move').css('top',e.clientY-mvdy);
}
function mvmu(e) {
    ex=e.clientX,ey=e.clientY;
    document.removeEventListener('mousemove',mvev);
    document.removeEventListener('mouseup',mvmu);
    $('#move').css('left',ex-mvdx);
    $('#move').css('top',ey-mvdy);
    destyle('right',false);
    destyle('bottom',false);
    mostyle('left',((ex-$('#page').offset().left-mvdx)/scx).toFixed(2).toString()+'px',false);
    mostyle('top',((ey-$('#page').offset().top-mvdy)/scx).toFixed(2).toString()+'px',false);
    if(ndic.style.position){
        if(ndic.style.position=='absolute' || ndic.style.position=='fixed'){
            gotopage(np);
            beclicked(ni)
            return;
        }
    }
    mostyle('position','absolute',false);
    gotopage(np);
    beclicked(ni)
}

function editcnt(itemid,k,v){
    if(mvis)return;
    if(!mded){
        return;
        
    }
    if(itemid!=ni){
        beclicked(itemid);
    }
    $('#editcnt>.win>.inp').val(v);
    $('#editcnt>.win>div>.sub').attr('onclick',`moprop('${k}',$('#editcnt>.win>.inp').val());$('#editcnt').removeClass('show');`);
    $('#editcnt').addClass('show');
    $('#editcnt>.win>.inp').focus();
}