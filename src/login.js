
$(document).ready(function() {
    $('#auth-error').hide();

    var protocol = 'https://',
        startmodule = '/products/files/?desktop=true';
    var portal = undefined,
        email = undefined;

    $('#btn-login').click(function() {
        portal = document.getElementById('auth-portal').value;
        email = document.getElementById('auth-email').value;

        var re_wrong_symb = /[\s\\]/;
        if (!portal.length || re_wrong_symb.test(portal) || 
                !email.length || re_wrong_symb.test(email)) {
            showLoginError();
            return;
        } 

        // var re_protocol = /^(https?:\/{2})/;
        // if (re_protocol.test(portal)) {
        //     protocol = '';
        // }

        portal = /^(https?:\/{2})?([^\/]+)/i.exec(portal);
        if (!!portal && portal[2].length) {
            portal[1] && (protocol = portal[1]);
            portal = portal[2];
        } else {
            showLoginError();
            return;
        }

        var pass        = document.getElementById('auth-pass').value;
        var url         = protocol + portal + "/api/2.0/authentication.json";
        var check_url   = protocol + portal + "/api/2.0/people/@self.json";

        setLoaderVisible(true);
        if (checkResourceExists(check_url) == 0) {
            // TODO: divide to login error and wrong portal error
            showLoginError();
            setLoaderVisible(false);
        } else {
            var iframe = document.createElement("iframe");
            iframe.name = "frameLogin";
            iframe.style.display = "none";

            iframe.addEventListener("load", function () {
                window.AscDesktopEditor.GetFrameContent("frameLogin");
            });

            document.body.appendChild(iframe);

            sendData(url, {userName: email, password: pass}, iframe);
        }
    });

    function setLoaderVisible(isvisible, timeout) {
        setTimeout(function(){
            $('#loading-mask')[isvisible?'show':'hide']();
        }, timeout || 200);
    }

    function showLoginError() {
        $('#auth-error').slideDown(100);
    }

    window.on_is_cookie_present = function(is_present, token) {
        is_present ?
            getUserInfo(token) :
            setLoaderVisible(false,1000);

    };

    // window["on_set_cookie"] = function(){};

    window.onchildframemessage = function(message, framename) {
        if (framename == 'frameLogin') {
            if (message.length) {
                var obj;
                try {
                    obj = JSON.parse(message);
                } catch (e) {}

                if (obj) {
                    if (obj.statusCode != 201) {
                        console.log('server error: ' + obj.statusCode);
                        showLoginError();
                    } else
                    if (!obj.response.sms) {
                        getUserInfo(obj.response.token);

                        setTimeout(function(){
                            var frame = document.getElementsByName('frameLogin');
                            frame && frame.length > 0 && frame[0].remove();
                        },10);

                        return;
                    }
                } else {
                    console.log('server error: wrong json');
                    showLoginError();
                }

                setLoaderVisible(false);
            }
        }
    };

    window.onkeydown = function(e) {
        var el = document.activeElement;
        if (!el || !/input|textarea/i.test(el.tagName)) 
            e.preventDefault();
    };

    $('#auth-portal').keypress(function(e){
        if ( e.which == 13 ) {
            $('#auth-email').focus();
        }
    });

    $('#auth-email').keypress(function(e){
        if ( e.which == 13 ) {
            $('#auth-pass').focus();
        }
    });

    // $('#auth-portal').val('testinfo.teamlab.info');
    // $('#auth-email').val('maxim.kadushkin@avsmedia.net');

    $('#auth-pass').keypress(function(e){
        switch (e.which) {
        case 13:
            $('#btn-login').focus().click();
            break;
        }
    })
    .keydown(function(e){
        if ( e.which == 9 ) {
            $('#btn-login').focus();
            e.preventDefault();
        }
    });

    // $(document).on("contextmenu",function(e){
    //     if(e.target.nodeName != "INPUT" && e.target.nodeName != "TEXTAREA")
    //          e.preventDefault();
    // });

    function getUserInfo(token) {
        var _url_ = protocol + portal + "/api/2.0/people/@self.json";

        var opts = {
            url: _url_,
            crossOrigin: true,
            crossDomain: true,
            headers: {'Authorization': token},
            beforeSend: function (xhr) {
                // xhr.setRequestHeader ("Access-Control-Allow-Origin", "*");
            },
            complete: function(e, status) {
                if (status == 'success') {
                    var obj = JSON.parse(e.responseText);
                    if (obj.statusCode == 200) {
                        window["AscDesktopEditor"]["js_message"]('login', 
                            JSON.stringify({
                                portal: portal,
                                user: obj.response                            
                            })
                        );

                        localStorage.setItem('ascportal', portal);
                        // window.AscDesktopEditor.setAuth(protocol + portal, portal, '/', token);
                        document.cookie = "asc_auth_key=" + token + ";domain=" + protocol + portal + ";path=/;HttpOnly";
                        window.location.replace(protocol + portal + startmodule);
                    } else {
                        console.log('authentication error: ' + obj.statusCode);
                        showLoginError();
                    }
                } else {
                    console.log('authentication error: ' + status);
                    showLoginError();
                    setLoaderVisible(false);
                }
            },
            error: function(e, status, error) {
                console.log('server error: ' + status + ', ' + error);
                showLoginError();
                setLoaderVisible(false);
            }
        };

        $.ajax(opts);
    }

    if (!!localStorage['ascportal'] && localStorage['ascportal'].length) {
        portal = localStorage['ascportal'];
    } else {
        var p = getUrlParams();
        if (p && !!p.portal) {
            portal = p.portal;
        }
    }

    if (!!portal && !!window.AscDesktopEditor && !!window.AscDesktopEditor.getAuth) {
        window.AscDesktopEditor.getAuth(portal);
        return;
    }

    setLoaderVisible(false);
});

function sendData(url, data, target) {
    var form = document.createElement("form");

    form.setAttribute("method", 'post');
    form.action = url;
    form.target = target.name;
    form.style.display = "none";

    for(var name in data) {
        var node = document.createElement("input");
        node.name  = name;
        node.value = data[name].toString();
        form.appendChild(node);
    }

    form.submit();
}

function checkResourceExists(url) {
    var reader = new XMLHttpRequest();

    reader.open('get', url, false);
    reader.send(null);
    switch (reader.status) {
    case 0: case 401:
    case 200: return 1;
    case 404: return 0;
    default: return -1;
    }
}