
window.Templates = (function() { 'use strict';

    var addConnectPanel = function(parentnode) {
        var _html = '<div id="box-empty-portals" class="empty flex-center">' +
                      '<section class="center-box">'+
                        '<h3 style="margin-top:0;">'+ utils.Lang.portalEmptyTitle +'</h3>'+
                        '<h4 class="text-description">'+ utils.Lang.portalEmptyDescr +'</h4>'+
                        '<img class="img-welcome">'+
                        '<div class="tools-connect">'+
                          '<button class="btn primary newportal">'+ utils.Lang.btnCreatePortal +'</button>'+
                          '<section class="link-connect">'+
                            '<label>' + utils.Lang.textHavePortal + '</label><a class="login" href="#">'+ utils.Lang.btnConnect +'</a>'+
                          '</section>'+
                        '</div>'+
                      '</section>'+
                    '</div>'+
                    '<div id="box-portals">' +
                    '</div>';

        $(parentnode).append(_html);
        addPortalsTable('#box-portals', utils.Lang.portalListTitle);
    };

    function makeFilesItem(info) {
        var _tpl = !!info.uid ? '<tr id=' + info.uid + '>' : '<tr>';
        _tpl += '<td class="row-cell cicon"><span class="icon img-before-el %type" /></td>' +
                        '<td class="row-cell cname"><p class="name primary">%name</p><p class="descr minor">%descr</p></td>';
        if (info.type != 'folder')
            _tpl += '<td class="row-cell cdate minor">%date</td>'.replace(/\%date/, info.date);

        return _tpl.replace(/\%name/, info.name)
                .replace(/\%type/, info.type)
                .replace(/\%descr/, info.descr);
    };

    function makePortalItem(info) {
        var _tpl = '<tr id="%id"><td class="row-cell cportal primary">%portal</td>' +
                        '<td class="row-cell cuser minor"><span>%user</span></td>' +
                        '<td class="row-cell cemail minor"><span>%email</span></td>' +
                        '<td class="cell-tools">'+
                          '<div class="hlayout">'+
                            '<button class="btn-quick logout img-el"></button>'+
                          '</span>'+
                        '</td>';

        return _tpl.replace(/\%portal/, utils.skipUrlProtocol(info.portal))
                .replace(/\%user/, info.user)
                .replace(/\%email/, info.email)
                .replace(/\%id/, info.elid);
    };

    function addRecentFiles(opts) {
        opts.id&&(opts.id='id="'+opts.id+'"')||(opts.id='');

        let _html = '<div class="flexbox"><table class="table-files header">' +
                        '<caption>%caption</caption>';
        if (opts.coltitle === false) {
            _html += '<tr class="column-title hidden" height="12">' +
                            '<th class="cell-name" colspan="2"></th>' +
                            '<th class="cell-date"></th>' +
                        '</tr>';
        } else {
            _html += '<tr class="column-title">' +
                            '<th class="cell-name" colspan="2">Name</th>' +
                            '<th class="cell-date">Date</th>' +
                        '</tr>';
        }

        _html += '</table>'+
                    '<div class="table-box flex-fill">'+
                      '<table %id class="table-files list"></table>'+
                      '<h4 class="text-emptylist img-before-el">' + utils.Lang.textNoFiles + '</h4>' +
                    '</div>';

        $(opts.holder).append(_html.replace(/\%caption/, opts.caption).replace(/\%id/, opts.id));
    };

    function addPortalsTable(holder, caption) {
        let _html = '<div class="flexbox"><table class="table-files header">' +
                        '<caption>%caption</caption>';

        _html += '<tr class="column-title hidden" height="12">' +
                    '<th class="cell-portal"></th>' +
                    '<th class="cell-user"></th>' +
                    '<th class="cell-email" colspan="2"></th>' +
                  '</tr>';

        _html += '</table>'+
                    '<div class="table-box flex-fill"><table class="table-files list"></table></div>'+
                    '<div class="lst-tools">'+
                      '<button id="btn-addportal" class="btn login">' + utils.Lang.btnAddPortal + '</button>'+
                    '</div>'+
                '</div>';

        $(holder).append(_html.replace(/\%caption/, caption));
    };

    function addWelcomePanel(holder) {
        var _html = '<div class="flex-center">' +
                      '<section class="center-box">'+
                        '<h3 style="margin-top:0;">'+ utils.Lang.welWelcome +'</h3>'+
                        '<h4 class="text-description">'+ utils.Lang.welDescr +'</h4>'+
                        '<img class="img-welcome">'+
                        '<div class="tools-connect">'+
                        // '<button class="btn primary login">'+ utils.Lang.btnConnect +'</button>' +
                          '<button class="btn primary newportal">'+ utils.Lang.btnCreatePortal +'</button>'+
                          '<section class="link-connect">'+
                            '<label>' + utils.Lang.textHavePortal + '</label><a class="login" href="#">'+ utils.Lang.btnConnect +'</a>'+
                          '</section>'+
                        '</div>'+
                      '</section>'+'</div>';

        $(holder).append(_html);
    };

    function addActivatePanel(holder) {
        var _html = '<div class="flexbox">' +
                    '<section>'+
                      '<h3 class="text-welcome">' + utils.Lang.licPanelTitle + '</h3>' +
                      '<h4 class="text-description">' + utils.Lang.licPanelDescr + '</h4>' +
                      '<input id="txt-key-activate" class="tbox" type="text" placeholder="'+ utils.Lang.licKeyHolder +'">' +
                      '<div class="lr-flex">'+
                        '<a class="text-sub link" target="popup" href="' + utils.defines.linkBuyNow + '">' + utils.Lang.licGetLicense + '</a>'+
                        '<span />'+ 
                        '<button class="btn primary doactivate">' + utils.Lang.btnActivate + '</button>' +
                      '</div>' +
                    '</section>'+
                    '</div>';

        return $('.action-panel.activate').append(_html);
    };

    function getAboutPanel(holder, opts) {
        var _html = '<div class="box-ver">' +
                      '<div class="img-el ver-logo %brand"></div><p></p>'+                      
                      '<div class="ver-version">%appname version %ver</div>%edition<p></p>'+
                      '<div class="ver-copyright">%cpr</div>'+
                      '<a class="ver-site" target="popup" href="%link">%txtlink</a>'
                    '</div>';

        !!opts.active && (opts.edition = !!opts.edition?opts.edition+'. '+opts.active:opts.active);
        _html = _html
                .replace(/\%edition/,!!opts.edition?'<div class="ver-edition">%edition</div>':'')
                .replace(/\%edition/, opts.edition);

        let _img_cls, _cpr, _link, _site, _app;
        if (opts.brand=='ivo') {
            _img_cls = 'ivolga';
            _cpr = '© 2015-2016 ЗАО "НКТ"';
            _link = 'http://ivolgapro.ru';
            _site = 'www.ivolgapro.ru';
            _app = utils.inParams.lang=='ru'?'Иволга ПРО':'IvolgaPRO';
        } else {
            _img_cls = 'only';
            _cpr = '© 2016 Ascensio System SIA';
            _link = 'http://onlyoffice.com';
            _site = 'www.onlyoffice.com';
            _app = 'ONLYOFFICE Desktop Editors'
        }
        
        _html = _html.replace(/\%brand/, _img_cls)
            .replace(/\%cpr/, _cpr)
            .replace(/\%ver/, opts.version)
            .replace(/\%link/, _link)
            .replace(/\%txtlink/, _site)
            .replace(/\%appname/, _app);

        return $(holder).append(_html);
    };

    return {
        createActivationPanel: addActivatePanel,
        addConnectPanel: addConnectPanel,
        createWelcomePanel: addWelcomePanel,
        createAboutPanel: getAboutPanel,
        insertFilesTable: addRecentFiles,
        produceFilesItem: makeFilesItem,
        producePortalItem: makePortalItem
    };
})();