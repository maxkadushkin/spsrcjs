
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

        args.id&&(args.id='id="'+args.id+'"')||(args.id='');

        let _html = '<div class="action-panel open1 test">' +
                        '<div id="box-recent-folders">' +
                            '<div class="flexbox">'+
        // TODO: remove header's table
                                '<table class="table-files header">' +
                                    `<caption>${args.caption}</caption>`;

            _html +=                '<tr class="column-title hidden" height="12">' +
                                        '<th class="cell-name" colspan="2"></th>' +
                                        '<th class="cell-date"></th>' +
                                    '</tr>';

            _html +=            '</table>'+
                                '<div class="table-box flex-fill">'+
                                    `<table ${args.id} class="table-files list"></table>` +
                                    '<h4 class="text-emptylist img-before-el">' + _lang.textNoFiles + '</h4>' +
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

        baseView.prototype.constructor.call(this, args);
    };

    ViewFolders.prototype = Object.create(baseView.prototype);
    ViewFolders.prototype.constructor = ViewFolders;

    window.ControllerFolders = ControllerFolders;

    utils.fn.extend(ControllerFolders.prototype, function() {
        return {
            init: function() {
                baseController.prototype.init.apply(this, arguments);

                this.view.render();

                $el.find('#btn-openlocal').click(function() {
                    // openFile(OPEN_FILE_FOLDER, '');
                });
            }
        };
    }());
}();

/*
*   controller definition
*/

window.CommonEvents.on('main:ready', function(){
    var p = new ControllerFolders({});
    p.init();
});