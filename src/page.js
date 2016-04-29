
/*
*   new inherited controller declaration
*/

+function(){ 'use strict'
    var ControllerFolders = function(args) {
        args.caption = 'Recent folders';
        this.view = new ViewFolders(args);    
    };

    ControllerFolders.prototype = Object.create(baseController.prototype);
    ControllerFolders.prototype.constructor = ControllerFolders;

    var ViewFolders = function(args) {
        // var _lang = utils.Lang.textNoFiles;
        var _lang = {textNoFiles: 'There are no files', btnBrowse: 'Browse'};

        args.id&&(args.id=`"id=${args.id}"`)||(args.id='');

        let _html = `<div ${args.id} class="action-panel open1 test">` +
                        '<div id="box-recent-folders1">' +
                            '<div class="flexbox">'+
                                `<h3 class="table-caption">${args.caption}</h3>`+
                                '<div class="table-box flex-fill">'+
                                    `<table ${args.id} class="table-files list"></table>` +
                                    `<h4 class="text-emptylist img-before-el">${_lang.textNoFiles}</h4>` +
                                '</div>' +
                                '<div id="box-open-acts" class="lst-tools">'+
                                    `<button id="btn-openlocal">${_lang.btnBrowse}</button>` +
                                '</div>' +
                            '</div>'+
                        '</div>'+
                    '</div>';

        _html = _html.replace(/\%caption/, args.caption).replace(/\%id/, args.id);

        args.tplPage = _html;
        args.menu = '.main-column.tool-menu';
        args.field = '.main-column.col-center';
        args.action = 'test';
        args.itemindex = 2;
        args.itemtext = 'Folders'

        baseView.prototype.constructor.call(this, args);
    };

    ViewFolders.prototype = Object.create(baseView.prototype);
    ViewFolders.prototype.constructor = ViewFolders;

    window.ControllerFolders = ControllerFolders;

    utils.fn.extend(ControllerFolders.prototype, (function() {
        var _on_update = function(params) {
            var _dirs = utils.fn.parseRecent(params, 'folders'), $item;

            var $boxRecentDirs = this.view.$panel.find('#box-recent-folders1');
            var $listRecentDirs = $boxRecentDirs.find('.table-files.list');

            $listRecentDirs.empty();
            for (let dir of _dirs) {
                if (!utils.getUrlProtocol(dir.full)) {
                    $item = $(Templates.produceFilesItem( dir ));

                    $item.click({path: dir.full}, onRecentFolderClick);
                    $listRecentDirs.append($item);
                }
            }
        };

        return {
            init: function() {
                baseController.prototype.init.apply(this, arguments);

                this.view.render();

                this.view.$panel.find('#btn-openlocal').click(()=>{
                    // openFile(OPEN_FILE_FOLDER, '');
                    alert('open folder click');
                });

                // _on_update.call(this, [
                //     {
                //     id: 0, 
                //     modifyed: "29.04.2016 12:41",
                //     path: "D:/temp/english/Hopeless at.docx",
                //     type: 65},
                //     {
                //     id: 1,
                //     modifyed: "28.04.2016 17:43",
                //     path: "C:/Users/maxim.kadushkin/Documents/DPIConfig_SmallPCs.docx",
                //     type: 65}
                // ]);

                // window.sdk.on('onupdaterecents', _on_update);
            }
        };
    })());
}();

/*
*   controller definition
*/

window.CommonEvents.on('main:ready', function(){
    var p = new ControllerFolders({});
    p.init();
});