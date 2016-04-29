/*
*   base controller declaration
*/

+function() {
    var controller = function(args) {
        this.$menu = this.$panel = undefined;
    };

    controller.prototype.view = undefined;
    controller.prototype.init = function() {
        this.view && this.view.init();
    };

    var view = function(args) {
        this.rendered = false;

        !args.action && (args.action = '');

        this.tplPage = args.tplPage || '<div class="center-panel">Hello, Word!</div>';
        this.tplItem = args.tplItem || `<li class="menu-item"><a action=${args.action}>${args.itemtext}</a></li>`;
        this.menuContainer = args.menu || '';
        this.panelContainer = args.field || '';
        this.opts = args;
    };

    view.prototype.init = function() {
        console.log("init for view");
    };

    view.prototype.render = function() {
        if (!this.rendered) {
            this.rendered = true;

            let _index = this.opts.itemindex;

            this.$menu = $(this.menuContainer);
            if (_index === 0) {
                this.$menu.prepend(this.tplItem);
            } else 
            if (_index > 0) {
                let $items = this.$menu.children();
                $items.size() > _index ?
                    $items.eq(_index).after(this.tplItem) : this.$menu.append(this.tplItem);
            } else {
                this.$menu.append(this.tplItem);
            }

            $(this.panelContainer).append(this.$panel = $(this.tplPage));
        }
    };

    window.baseView = view;
    window.baseController = controller;
}();

