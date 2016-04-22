/*
*   base controller declaration
*/

+function() {
    var controller = function(args) {
    };

    controller.prototype.view = undefined;
    controller.prototype.init = function() {
        this.view && this.view.init();
    };

    var view = function(args) {
        this.rendered = false;

        this.tplPage = args.tplPage || '<div class="center-panel">Hello, Word!</div>';
        this.tplItem = args.tplItem || '<li class="menu-item"><a action="%1">Quick item</a></li>';
        this.menuContainer = args.menu || '';
        this.panelContainer = args.field || '';        

        this.tplItem = this.tplItem.replace(/\%1/, args.action || '');
    };

    view.prototype.init = function() {
        console.log("init for view");
    };

    view.prototype.render = function() {    
        if (!this.rendered) {
            this.rendered = true;

            $(this.menuContainer).append(this.tplItem);
            $(this.panelContainer).append(this.tplPage);
        }
    };

    window.baseView = view;
    window.baseController = controller;
}();

