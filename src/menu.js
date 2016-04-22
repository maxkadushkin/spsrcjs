'use strict';

var Menu = function(args) {
    this.id = args.id;
    this.items = args.items;

    this.prefix = args.prefix || 'asc-gen';
    this.events = {};
    this.events.itemclick = new Event(this);
};

Menu.prototype.init = function(parent) {
    var me = this;
    var _tpl_ = '<div id="%id" class="menu-container">'+
                    '<div class="dropdown-toggle" data-toggle="dropdown"></div>'+
                    '<ul class="dropdown-menu" role="menu">' +
                    '</ul></div>';

    var $container = $(_tpl_.replace(/\%id/, this.id)).appendTo(parent);
    var $list = $container.find('ul');

    var _tpl_item_ = '<li><a id="%id" class="dd-item" tabindex="-1" type="menuitem">%caption</a></li>',
        _tpl_divider_ = '<li class="divider"></li>';
    this.items.forEach(function(item) {
        let $item;

        !item.id && (item.id = me.prefix + ++nCounter);
        if (item.caption == '--')
            $item = $(_tpl_divider_);
        else {
            $item = $(_tpl_item_
                .replace(/%caption/, item.caption)
                .replace(/%id/, item.id));

            $item.on('click', {'action': item.action}, function(e) {
                me.events.itemclick.notify(e.data['action'], me.contextdata);
            });
        }

        $list.append($item);
    });

    $container.on({
        'hide.bs.dropdown': function(){
            // console.log('before hide menu');
        },
        'hidden.bs.dropdown': function() {
            me.contextdata = [];
            // console.log('after hide menu');
        }
    });
};

Menu.prototype.show = function(pos, data) {
    $('.menu-container').removeClass('open');
    let $el = $('#'+this.id);

    $el.css(pos);
    $el.find('ul').dropdown('toggle');
    this.contextdata = data;
    Menu.opened = true;
};

Menu.prototype.disableItem = function(action, disable) {
    for (let item of this.items) {
        if (item.action == action) {
            $('#' + item.id).parent()
                [disable?'addClass':'removeClass']('disabled');
        }
    }
};

Menu.opened = false;

Menu.closeAll = function() {
    $('.menu-container.open').removeClass('open');
    Menu.opened = false;
};

window.Menu = Menu;

$(document).on('keydown', function(e) {
    if (e.keyCode == 27) {
        // $('.menu-container').removeClass('open');
        Menu.closeAll();
    }
});