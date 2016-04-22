
+function() { "use strict"
    let _events = [
                    'onchildframemessage'
                    , 'onupdaterecents'
                    , 'on_native_message'
                ];

    let subscribers = {
        any: [] // event type: subscribers
    };

    var sdk = window.AscDesktopEditor;

    sdk.on = function(type, fn, context) {
        type = type || 'any';
        fn = typeof fn === 'function' ? fn : context[fn];
        if (typeof subscribers[type] === "undefined") {
            subscribers[type] = [];
        }

        subscribers[type].push({ fn: fn, context: context || this });
    };

    sdk.remove = function(type, fn, context) {
        notifySubscribers('unsubscribe', type, fn, context);
    };

    sdk.fire = function(type, publication) {
        notifySubscribers('publish', type, publication);
    };

    var notifySubscribers = function(action, type, arg, context) {
        var pubtype = type || 'any',
            pubsubscribers = subscribers[pubtype],
            max = pubsubscribers ? pubsubscribers.length : 0;

        for (let i = 0; i < max; i += 1) {
            if (action === 'publish') {
                // Call our observers, passing along arguments
                 pubsubscribers[i].fn.apply(pubsubscribers[i].context, arg);
            } else {
                if (pubsubscribers[i].fn === arg && pubsubscribers[i].context === context) {
                    pubsubscribers.splice(i, 1);
                }
            }
        }
    };

    for (let e of _events) {
        window[e] = function() {
            notifySubscribers('publish', e, arguments)
        };
    };

    window.sdk = sdk;
}();
