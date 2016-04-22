'use strict';

var nCounter = 0;
function Event(sender) {
    this._sender = sender;
    this._listeners = [];
}

Event.prototype = {
    attach : function (listener) {
        this._listeners.push(listener);
    },
    notify : function (args) {
        var index;
        var _args = Array.from(arguments);
        _args.unshift(this._sender);

        for (index = 0; index < this._listeners.length; index += 1) {
            // this._listeners[index](this._sender, args);
            this._listeners[index].apply(this, _args);
        }
    }
};

function Collection(attributes) {
    this.items = [];
    this.view = attributes.view;
    this.list = attributes.list;

    var _time = Date.now();
    this.on_item_changed = function(model) {
        this.events.changed.notify(model);
    }.bind(this);

    this.on_item_click = function(e) {
        Menu.opened && Menu.closeAll();

        if (Date.now()-_time > 800) {
            _time = Date.now();
            this.events.click.notify(e.data);
        }

        e.preventDefault();
        return false;
    }.bind(this);

    this.on_item_ctxmenu = function(e) {
        this.events.contextmenu.notify(e.data, e);
        e.preventDefault();
    }.bind(this);

    this.events = {};
    this.events.changed = new Event(this);
    this.events.erased = new Event(this);
    this.events.inserted = new Event(this);
    this.events.click = new Event(this);
    this.events.contextmenu = new Event(this);
};

Collection.prototype.add = function(item) {    
    item.changed.attach(this.on_item_changed);

    this.items.push(item);
    this.events.inserted.notify(item);

    $('#' + item.uid).off('click contextmenu');
    $('#' + item.uid).on('click', item, this.on_item_click);
    $('#' + item.uid).on('contextmenu', item, this.on_item_ctxmenu);
};

Collection.prototype.find = function(key, val) {
    return this.items.find(function(elem, i, arr){
        return elem[key] == val;
    });
};

Collection.prototype.empty = function() {
    this.items.forEach(function(model, i, a) {
        $('#'+model.uid).off();
    });

    this.items = [];

    if (!!this.list) this.view.find(this.list).empty();
    
    this.events.erased.notify();
};

Collection.prototype.size = function() {
    return this.items.length;
};

function Model(attributes) {
    var attr = attributes || {};

    this.prefix = attr.prefix || 'asc-gen';
    this.uid = this.prefix + ++nCounter;
    this.changed = new Event(this);
};

Model.prototype.set = function(key, value) {
    this[key] = value;

    let args = {};
    args[key] = value;
    this.changed.notify(args);
};

Model.prototype.get = function(key) {
    return this[key];
};

function PortalModel(attributes) {
    Model.prototype.constructor.call(this, {prefix: 'asc-portal-'});

    this.name   = attributes.portal && utils.skipUrlProtocol(attributes.portal);
    this.path   = attributes.portal || '';
    this.logged = false;
    this.user   = attributes.user || '';
    this.email  = attributes.email || '';
};

PortalModel.prototype = Object.create(Model.prototype); /*new Model();*/
PortalModel.prototype.constructor = PortalModel;

function FileModel(attributes) {
    Model.prototype.constructor.call(this);

    this.name   = attributes.name || '';
    this.descr  = attributes.descr || '';
    this.date   = attributes.date;
    this.type   = attributes.type;
    this.fileid = attributes.id;
};

FileModel.prototype = new Model();
FileModel.prototype.constructor = FileModel;
