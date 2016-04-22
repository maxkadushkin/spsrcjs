'use strict';
$(document).ready(function() {
    $('.tool-menu').on('click', '> .menu-item > a', onActionClick);
    $('.tool-quick-menu .menu-item a').click(onNewFileClick);

    Templates.addConnectPanel('#pnl-connect');
    Templates.insertFilesTable({holder:'#box-recovery', id: 'tbl-filesrcv', caption: utils.Lang.listRecoveryTitle, coltitle:false});
    Templates.insertFilesTable({holder:'#box-recent', caption: utils.Lang.listRecentFileTitle, coltitle:false});
    Templates.insertFilesTable({holder:'#box-recent-folders', caption:utils.Lang.listRecentDirTitle, coltitle:false});
    Templates.createActivationPanel('');
    
    /* popup menu */
    var menuFiles = new Menu({
        id: 'pp-menu-files',
        items: [{
            caption: utils.Lang.menuFileOpen,
            action: 'files:open'
        },{
            caption: utils.Lang.menuRemoveModel,
            action: 'files:forget'
        },{
            caption: utils.Lang.menuClear,
            action: 'files:clear'
        }]
    });

    menuFiles.init('#placeholder');
    menuFiles.events.itemclick.attach(clickMenuFiles);

    var menuPortals = new Menu({
        id: 'pp-menu-portals',
        items: [{
            caption: utils.Lang.menuFileOpen,
            action: 'portal:open'
        },{
            caption: utils.Lang.menuLogout,
            action: 'portal:logout'
        },{
            caption: utils.Lang.menuRemoveModel,
            action: 'portal:forget'
        }]
    });

    menuPortals.init('#placeholder');
    menuPortals.events.itemclick.attach(clickMenuPortals);
    /**/    
   
    { 
        let $el = $('.action-panel.open');
        $el.find('#box-open-acts').appendTo($el.find('.table-box').parent()); 
        $el.find('#btn-openlocal').click(function() {
            openFile(OPEN_FILE_FOLDER, '');
        }).text(utils.Lang.btnBrowse);
    }

    $('h3.createnew').text(utils.Lang.actCreateNew);
    $('a[action="new:docx"]').text(utils.Lang.newDoc);
    $('a[action="new:xlsx"]').text(utils.Lang.newXlsx);
    $('a[action="new:pptx"]').text(utils.Lang.newPptx);
    $('a[action=recent]').text(utils.Lang.actRecentFiles);
    $('a[action=open]').text(utils.Lang.actOpenLocal);
    $('a[action=connect]').text(utils.Lang.actConnectTo);
    $('a[action=activate]').text(utils.Lang.actActivate);
    $('a[action=about]').text(utils.Lang.actAbout);

    var $boxRecovery = $('.action-panel.recent #box-recovery');
    var $listRecovery = $boxRecovery.find('.table-files.list');
    var $headerRecovery = $boxRecovery.find('.header');
    var $scrboxRecovery = $boxRecovery.find('.flex-fill');

    var $boxRecent = $('.action-panel.recent #box-recent');
    // var $listRecent = $boxRecent.find('.table-files.list');
    var $scrboxRecent = $boxRecent.find('.flex-fill');
    var separatorHeight = $('<div id="recovery-sep"></div>').insertAfter($('#box-recovery')).height();

    // $('button#btn-add').click(function(e) {
    //     let info = {type:'pptx', name:'New Document.txt', descr:'e:/from/some/portal'};
    //     var item = Templates.produceFilesItem(info);
    //     $listRecent.append(item);
    //     if ($scrboxRecent.hasScrollBar()) {
    //         $listRecent.find('tr > td:last-child').css('padding-left',Scroll_offset);
    //         console.log('has scroll bar');
    //     }
    // });

    // $('button#btn-add2').click(function(e) {
    //     let info = {type:'pptx', name:'New Document.txt', descr:'e:/from/some/folder'};
    //     var item = Templates.produceFilesItem(info);
    //     $listRecovery.append(item);
    //     sizeRecoveryList();
    // });

    // 

        // bug: recent panel has the wrong height if 'wellcome' panel is showed firstly
        $('.tool-menu > .menu-item > a[action=recent]').on('click.once', function(e){
            $(e.target).off('.once');
            sizeRecoveryList();
        });

    function sizeRecoveryList() {
        // set fixed height for scrollbar appearing. 
        var _available_height = $boxRecent.parent().height();
        var _box_recent_height = _available_height;

        console.log('height: ' + _available_height);

        if ($boxRecovery.is(':hidden')) {
            // $boxRecent.height($boxRecent.parent().height());
        } else {
            _available_height -= separatorHeight
            _box_recent_height *= 0.5; 

            $boxRecovery.height(_available_height * 0.5);

            var $table_box = $boxRecovery.find('.table-box');
            if ( !$table_box.hasScrollBar() ) {
                let _new_recovery_height = $table_box.find('.table-files.list').height() + $headerRecovery.height();
                $boxRecovery.height(_new_recovery_height);
                _box_recent_height = _available_height - _new_recovery_height;
            }
        }

        /*$boxRecent.height() != _box_recent_height &&*/ $boxRecent.height(_box_recent_height);
    };

    window.onupdaterecents = function(params) {
        recentCollection.empty();

        var obj = parseRecent.call(this, params),
            _files = obj.files,
            _dirs = obj.dirs, $item;

        var model;
        for (let i in _files) {
            recentCollection.add( new FileModel(_files[i]) );
        }
        
        var $boxRecentDirs = $('.action-panel #box-recent-folders');
        var $listRecentDirs = $boxRecentDirs.find('.table-files.list');        
        // var $scrboxRecentDirs = $boxRecentDirs.find('.flex-fill');

        $listRecentDirs.empty();
        for (let dir of _dirs) {
            if (!utils.getUrlProtocol(dir.full)) {
                $item = $(Templates.produceFilesItem( dir ));
            
                $item.click({path: dir.full}, onRecentFolderClick);
                $listRecentDirs.append($item);
            }
        }

        /* set offset when the scroll bar appear */
        // $listRecent.find('tr > td:last-child').css('padding-left', $scrboxRecent.hasScrollBar() ? Scroll_offset : '');
        // $listRecentDirs.find('tr > td:last-child').css('padding-left', $scrboxRecentDirs.hasScrollBar() ? Scroll_offset : '');
    };

    window.onupdaterecovers = function(params) {
        recoveryCollection.empty();

        var obj = parseRecent(params);
        for (let item of obj.files) {
            recoveryCollection.add( new FileModel(item) );
        }

        $boxRecovery[recoveryCollection.size() > 0 ? 'show' : 'hide']();
        $('#recovery-sep')[recoveryCollection.size() > 0 ? 'show' : 'hide']();
        sizeRecoveryList();
    };

    $(window).resize(function(){
        Menu.closeAll();
        sizeRecoveryList();
    });

    /**/
    portalCollection = new Collection({
        view: $('.action-panel.connect #box-portals')
        ,list: '.table-files.list'
    });
    portalCollection.events.changed.attach(function(collection, model){
        $('#' + model.uid)[model.logged?'addClass':'removeClass']('logged');
    });
    portalCollection.events.inserted.attach(function(collection, model){
        let $listPortals = collection.view.find('.table-files.list');
        let $item = $(Templates.producePortalItem({
            portal: model.name,
            user: model.user,
            email: model.email,
            elid: model.uid
        }));
        
        $item.find('.logout').click(model.name, onLogoutClick);
        $listPortals.append($item);
    });
    portalCollection.events.click.attach(function(collection, model){
        model.logged ?
            window.AscDesktopEditor.execCommand("portal:open", model.path) :
            doLogin(model.path, model.email);
    });
    portalCollection.events.contextmenu.attach(function(collection, model, e){
        menuPortals.disableItem('portal:logout', !model.logged);
        menuPortals.show({left: e.clientX, top: e.clientY}, model);
    });

    /** recent collection **/
    recentCollection = new Collection({
        view: $('.action-panel.recent #box-recent')
        ,list: '.table-files.list'
    });
    recentCollection.events.erased.attach(function(collection){
        collection.view.find(collection.list).parent().addClass('empty');
    });
    recentCollection.events.inserted.attach(function(collection, model){
        let $list = collection.view.find('.table-files.list');
        
        let $item = $(Templates.produceFilesItem(model));
        $list.append($item);
        $list.parent().removeClass('empty');
    });
    recentCollection.events.click.attach(function(collection, model){
        openFile(OPEN_FILE_RECENT, model.fileid);
    });
    recentCollection.events.contextmenu.attach(function(collection, model, e){
        menuFiles.actionlist = 'recent';
        menuFiles.show({left: e.clientX, top: e.clientY}, model);
    });
    recentCollection.empty();    
    /**/

    /** recent collection **/
    recoveryCollection = new Collection({
        view: $('.action-panel.recent #box-recovery')
        ,list: '.table-files.list'
    });
    recoveryCollection.events.inserted.attach(function(collection, model){
        let $list = collection.view.find('.table-files.list');
        
        let $item = $(Templates.produceFilesItem(model));
        $list.append($item);    
    });
    recoveryCollection.events.click.attach(function(collection, model){
        openFile(OPEN_FILE_RECOVERY, model.fileid);
    });
    recoveryCollection.events.contextmenu.attach(function(collection, model, e){
        menuFiles.actionlist = 'recovery';
        menuFiles.show({left: e.clientX, top: e.clientY}, model);
    });
    /**/

    /* test information */
    // var info = {portal:"https://testinfo.teamlab.info",user:"Maxim Kadushkin",email:"Maxim.Kadushkin@avsmedia.net"};
    // PortalsStore.keep(info);
    /* **************** */

    updatePortals(); 

    if (!localStorage.welcome) {
        Templates.createWelcomePanel('.action-panel.welcome');
        selectAction('welcome');

        localStorage.setItem('welcome', 'have been');
    } else 
        selectAction('recent');

    $('.newportal').click(function(){
        window.open('https://www.onlyoffice.com/registration.aspx');
    });

    if (!window.LoginDlg) {
        $('.tools-connect').hide();
        hideAction('connect');
    }

    if (!utils.inParams.waitingloader)
        setLoaderVisible(false);

    /* test information */
    // var arr = [
    //     {"id":0,"type":utils.defines.FileFormat.FILE_CROSSPLATFORM_PDF,"path":"https://testinfo.teamlab.info/New Document.docx","modifyed":"11.12.2015 18:45"},
    //     {"id":1,"type":utils.defines.FileFormat.FILE_CROSSPLATFORM_DJVU,"path":"C:\\Users\\maxim.kadushkin\\Documents\\DPIConfig_SmallPCs.docx","modifyed":"11.12.2015 18:22"},
    //     {"id":2,"type":utils.defines.FileFormat.FILE_CROSSPLATFORM_XPS,"path":"/Users/ayuzhin/Develop/Web/test.html","modifyed":"11.12.2015 17:58"},
    //     {"id":3,"type":utils.defines.FileFormat.FILE_PRESENTATION_PPTX,"path":"https://testinfo.teamlab.info\\Sadfasd.docx","modifyed":"10.12.2015 17:25"},
    //     {"id":4,"type":utils.defines.FileFormat.FILE_SPREADSHEET_CSV,"path":"https://testinfo.teamlab.info\\Sadfasd.docx","modifyed":"10.12.2015 17:25"},
    //     {"id":5,"type":utils.defines.FileFormat.FILE_SPREADSHEET_ODS,"path":"https://testinfo.teamlab.info\\Sadfasd.docx","modifyed":"10.12.2015 17:25"},
    //     {"id":6,"type":utils.defines.FileFormat.FILE_SPREADSHEET_XLS,"path":"https://testinfo.teamlab.info\\Office 365 Value Added Reseller Guide.docx","modifyed":"10.12.2015 16:46"}
    // ];
    // window.onupdaterecents(arr);
    // window.onupdaterecovers(arr);
    /* **************** */

    $('.login').click(onConnectClick);
    $('.doactivate').click(onActivateClick);
    $('#txt-key-activate').on('keypress', function(e) {
        if (e.which == 13) {
            onActivateClick();
        }
    });

    setTimeout(function(){
        if (window.AscDesktopEditor) {
            window.AscDesktopEditor.LocalFileRecovers();
            window.AscDesktopEditor.LocalFileRecents();

            window.AscDesktopEditor.execCommand('app:onready', '');
        } 
    }, 50);

    // window.sdk.on('onupdaterecents', function(){
    //     console.log('onupdaterecents');
    // });

    CommonEvents.fire('main:ready');
});

var portalCollection;
var recentCollection;
var recoveryCollection;

function onActionClick(e) {
    var $el = $(this);
    var action = $el.attr('action');

    if (action == 'open' && 
            !recentCollection.size() && !recoveryCollection.size()) {
        openFile(OPEN_FILE_FOLDER, '');
    } else {
        $('.tool-menu > .menu-item').removeClass('selected');
        $el.parent().addClass('selected');
        $('.action-panel').hide();
        $('.action-panel.' + action).show();
    }
};

function selectAction(action) {
    $('.tool-menu > .menu-item').removeClass('selected');
    $('.tool-menu a[action='+action+']').parent().addClass('selected');
    $('.action-panel').hide();
    $('.action-panel.' + action).show();
};

function hideAction(action, hide) {
    var mitem = $('.tool-menu a[action='+action+']').parent();
    mitem.removeClass('extra')[hide===true?'show':'hide']();
    $('.action-panel.' + action)[hide===true?'show':'hide']();
};

function setLoaderVisible(isvisible, timeout) {
    setTimeout(function(){
        $('#loading-mask')[isvisible?'show':'hide']();
    }, timeout || 200);
}

function parseRecent(p) {
    var out_files_arr = [],
        dirs_arr = [];

    var re_name = /([^\\/]+\.[a-zA-Z0-9]{3,})$/;
    for (let _f_ of p) {
        let fn =  _f_.path;
        if (re_name.test(fn)) {
            let name = re_name.exec(fn)[1],
                path = fn.slice(0, fn.length - name.length - 1);
            out_files_arr.push({
                id: _f_.id,
                type: utils.parseFileFormat(_f_.type),
                name: name,
                descr: path,
                date: _f_.modifyed
            });

            dirs_arr.indexOf(path) < 0 && dirs_arr.push(path);
        }
    }

    var out_dirs_arr = [];
    for (let i in dirs_arr) {
        let full = dirs_arr[i];
        let name = /([^\\/]+)$/.exec(full)[1], parent;
        if (!name) {
            name = full ;
            parent = utils.Lang.textMyComputer;
        } else
            parent = full.slice(0, full.length - name.length - 1);

        out_dirs_arr[i] = {
            type: 'folder',
            full: full,
            name: name,
            descr: parent
        };
    }

    return {files: out_files_arr, dirs: out_dirs_arr};
}

var OPEN_FILE_RECOVERY = 1;
var OPEN_FILE_RECENT = 2;
var OPEN_FILE_FOLDER = 3;
var Scroll_offset = '16px';

function onRecentClick(e) {
    openFile(e.data.rcv === true ? 
        OPEN_FILE_RECOVERY : OPEN_FILE_RECENT, e.data.id);

    e.preventDefault();
    return false;
}

function onRecentFolderClick(e) {
    openFile(OPEN_FILE_FOLDER, e.data.path);

    e.preventDefault();
    return false;
}

function onNewFileClick(e) {
    if ($(e.currentTarget).parent().hasClass('disabled'))
        return;
    
    var me = this;
    if (me.click_lock===true) return;
    me.click_lock = true;

    var t = -1;
    switch (e.currentTarget.attributes['action'].value) {
    case 'new:docx': t = 0; break;
    case 'new:xlsx': t = 2; break;
    case 'new:pptx': t = 1; break;
    default: break;
    }

    createFile(t);

    setTimeout(function(){
        me.click_lock = false;
    }, utils.defines.DBLCLICK_LOCK_TIMEOUT);
}

function onLogoutClick(e) {
    var info = e.data;

    // var model = portalCollection.find('name', info);
    // model && model.set('logged', false);

    window.AscDesktopEditor.execCommand("portal:logout", info);

    if (e.stopPropagation)
        e.stopPropagation();
    return false;
};

function clickMenuFiles(menu, action, data) {
    if (/\:open/.test(action)) {
        menu.actionlist == 'recent' ?
            openFile(OPEN_FILE_RECENT, data.fileid) :
            openFile(OPEN_FILE_RECOVERY, data.fileid);
    } else
    if (/\:clear/.test(action)) {
        menu.actionlist == 'recent' ?
            AscDesktopEditor.LocalFileRemoveAllRecents() :
            AscDesktopEditor.LocalFileRemoveAllRecovers();
    } else
    if (/\:forget/.test(action)) {
        menu.actionlist == 'recent' ?
            AscDesktopEditor.LocalFileRemoveRecent(parseInt(data.fileid)) :
            AscDesktopEditor.LocalFileRemoveRecover(parseInt(data.fileid));
    }
};

function clickMenuPortals(menu, action, data) {
    var model = data;
    if (/\:open/.test(action)) {
        model.logged ?
            window.AscDesktopEditor.execCommand("portal:open", model.path) :
            doLogin(model.path, model.email);
    } else
    if (/\:logout/.test(action)) {
        onLogoutClick({data:model.name});
    } else
    if (/\:forget/.test(action)) {
        if (PortalsStore.forget(model.name)) {
            // onLogoutClick({data:model.name});
            updatePortals();
        }
    }
};

function onActivateClick(e) {
    var key = $('#txt-key-activate').val();
    !!key && window.AscDesktopEditor.execCommand("app:activate", key);
};

function onConnectClick() {
    doLogin(/*'testinfo.teamlab.info', 'maxim.kadushkin@avsmedia.net'*/);
};

function doLogin(p, u) {
    var dlg = new LoginDlg();
    dlg.onsuccess(function(info){
        window.AscDesktopEditor.execCommand("portal:open", info.portal);

        PortalsStore.keep(info);
        updatePortals();
        selectAction('connect');
    });
    dlg.show(p, u);
}

/* check if authorization token is present */
window.on_check_auth = function(obj) {
    for (let i in obj) {
        let model = portalCollection.find('name', i);

        if (model) model.set('logged', obj[i].length > 0);
    };
};

window.on_native_message = function(cmd, param) {
    if (cmd == 'portal:logout') {
        var short_name = utils.skipUrlProtocol(param);
        var model = portalCollection.find('name', short_name);

        !!model && model.set('logged', false);
    } else 
    if (cmd == 'lic:active') {
        let is_active_license = param == '1';
        let $menuitem = $('a[action=activate]').parent();
        let is_selected = $menuitem.hasClass('selected');
        $menuitem[is_active_license?'hide':'show']();        
        
        if (is_active_license) {
            $('.action-panel.activate').hide();
            is_selected && selectAction('recent');
        }

        // var new_doc_items = $('.tool-quick-menu .menu-item');
        // new_doc_items[is_active_license?'removeClass':'addClass']('inactive');
    } else 
    if (cmd == 'lic:selectpanel') {
        selectAction('activate');
        $('#txt-key-activate').focus();
    } else 
    if (cmd == 'lic:sendkey') {
        // $('a[action=activate]').parent()['show']();
    } else
    if (/^panel\:hide/.test(cmd)) {
        let hide = param == '1';
        let panel = /\:hide\:(\w+)$/.exec(cmd)[1];

        if (panel.length) {
            hideAction(panel, hide);
        }
    } else
    if (/app\:version/.test(cmd)) {
        fillVersion(param);
    } else 
    if (/app\:ready/) {
        setLoaderVisible(false);
    }
    
    console.log(cmd, param);
};

function fillVersion(version) {
    var _v = utils.fn.extend(utils.fn.parseVersion(version), {brand:window.brand});

    Templates.createAboutPanel($('.action-panel.about'), _v);
    $('a[action=about]').parent().removeClass('extra');
};

function openFile(type, params) {
    if (window["AscDesktopEditor"]) {
        if (type == OPEN_FILE_FOLDER) {
            if (window.AscDesktopEditor.LocalFileOpen) {
                window.AscDesktopEditor.LocalFileOpen(params);
            } else {
                alert("desktop!!! (open)");
            }
        } else {
            var _method = type == OPEN_FILE_RECOVERY ? 
                            'LocalFileOpenRecover' : 'LocalFileOpenRecent';

            if (window.AscDesktopEditor[_method]) {
                window.AscDesktopEditor[_method](parseInt(params));
            } else {
                // alert("desktop!!! (" + _method + ": " + params + ")");
            }
        }
    } else {
        // alert("desktop!!! AscDesktopEditor object haven't found");
    }
}

function createFile(type) {
    if (window["AscDesktopEditor"] && window["AscDesktopEditor"]["LocalFileCreate"]) {
        window["AscDesktopEditor"]["LocalFileCreate"](type);
    } else {
        alert("desktop!!! (open)");
    }
}

function updatePortals() {
    var $empty = $('.action-panel.connect #box-empty-portals'),
        $list = $('.action-panel.connect #box-portals');

    portalCollection.empty();

    /* fill portals list */
    var portals = PortalsStore.portals();
    if (portals.length) {
        let auth_arr = {};
        for (let rec of portals) {
            var pm = new PortalModel(rec);

            auth_arr[pm.name] = '';
            portalCollection.add(pm);
        }

        if (window.AscDesktopEditor && window.AscDesktopEditor.checkAuth) {
            window.AscDesktopEditor.checkAuth(auth_arr);
        }

        $empty.hide();
        $list.show();
    } else {
        $empty.show();
        $list.hide();
    }
}

document.getElementById('wrap').ondrop = function(e) {
    window["AscDesktopEditor"]["DropOfficeFiles"]();

    e.preventDefault();
    return false;
}

document.getElementById('wrap').ondragover = function (e) {
    e.dataTransfer.dropEffect = 'copy';

    e.preventDefault();
    return false;
};
