
window.LoginDlg = function() {
    "use strict";

    var $el, $mask;
    var _tpl = '<div class="dlg dlg-login">' +
                  '<div class="title">'+
                    '<label class="caption">'+utils.Lang.loginTitle+'</label>'+
                    '<span class="tool close img-el"></span>'+
                  '</div>'+
                  '<div class="body">'+
                    // '<div class="logo"></div>'+
                    '<section id="box-lbl-error">'+
                      '<p id="auth-error" class="msg-error">' + utils.Lang.errLogin + '</p>' +
                    '</section>'+
                    '<input id="auth-portal" type="text" name="" spellcheck="false" class="tbox auth-control first" placeholder="'+utils.Lang.pshPortal+'" value="">' +
                    '<input id="auth-email" type="text" name="" spellcheck="false" class="tbox auth-control" placeholder="'+utils.Lang.pshEmail+'" value="">' +
                    '<input id="auth-pass" type="password" name="" spellcheck="false" class="tbox auth-control last" placeholder="'+utils.Lang.pshPass+'" value="">' +
                    '<div id="box-btn-login" class="lr-flex">'+
                      '<a id="link-restore" class="text-sub link" target="popup" href="https://www.onlyoffice.com/signin.aspx">' + utils.Lang.linkForgotPass + '</a>'+
                      '<span />'+ 
                      '<div><img class="img-loader">' +
                      '<button id="btn-login" class="btn primary">' + utils.Lang.btnLogin + '</button></div>'+
                    '</div>'+
                    '<div class="separator"></div>'+
                    '<div style="text-align:left;">'+
                      '<a id="link-create" class="text-sub link" target="popup" href="https://www.onlyoffice.com/registration.aspx">' + utils.Lang.btnCreatePortal + '</a>'+
                    '</div>'+
                  '</div>'+
                '</div>';

    var protocol = 'https://',
        startmodule = '/products/files/?desktop=true';
    var portal = undefined,
        email = undefined;
    var events = {};
    var STATUS_EXIST = 1;
    var STATUS_NOT_EXIST = 0;
    var STATUS_UNKNOWN = -1;
    var STATUS_NO_CONNECTION = -255;
    var PROD_ID = 4;

    function checkResourceExists(url, callback) {
        var reader = new XMLHttpRequest();
        // reader.timout = 15000;
        // reader.onreadystatechange = function() {
        reader.onload = function() {
            var out_res = undefined;

            if (reader.readyState != 4) { return; }

            clearTimeout(tId);
            switch (reader.status) {
            case 0: case 401:
            case 200: out_res = STATUS_EXIST; break;
            case 404: out_res = STATUS_NOT_EXIST; break;
            default: out_res = STATUS_UNKNOWN; break;
            }

            callback && callback(out_res);
        };

        // reader.ontimeout = function() {
        //     callback && callback(STATUS_NO_CONNECTION);
        // };

        var tId = setTimeout(function(){
            reader.abort();
            callback && callback(STATUS_NO_CONNECTION);
        }, 20000);
        
        reader.onerror = function(e) {
            setTimeout(_doload, 50);
        };

        function _doload() {
            reader.open('get', url, true);
            reader.send(null);
        };

        _doload();
    }

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
    };

    function onCloseClick(e) {
        doClose(0);
    };

    function doClose(code) {
        $mask.hide();
        $el.remove();

        if (events.close) {
            events.close(code);
        }
    };

    function onLoginClick(e) {
        hideLoginError();

        portal = $el.find('#auth-portal').val().trim();
        email = $el.find('#auth-email').val().trim();

        var re_wrong_symb = /[\s\\]/;
        if (!portal.length || re_wrong_symb.test(portal)) {
            showLoginError(utils.Lang.errLoginPortal, '#auth-portal');
            return;
        }

        if (!email.length || re_wrong_symb.test(email)) {
            showLoginError(utils.Lang.errLoginEmail, '#auth-email');
            return;
        }

        portal = /^(https?:\/{2})?([^\/]+)/i.exec(portal);
        if (!!portal && portal[2].length) {
            portal[1] && (protocol = portal[1]);
            portal = portal[2];
        } else {
            showLoginError(utils.Lang.errLoginPortal, '#auth-portal');
            return;
        }

        var pass = $el.find('#auth-pass').val();
        if (!pass || pass.length < 0) {
            showLoginError(utils.Lang.errLoginPass, '#auth-pass');
            return;
        }

        var url         = protocol + portal + "/api/2.0/authentication.json";
        var check_url   = protocol + portal + "/api/2.0/people/@self.json";        

        disableDialog(true);
        // setLoaderVisible(true);
        checkResourceExists(check_url, function(r){
            if (r == 0) {
                showLoginError(utils.Lang.errLoginPortal, '#auth-portal');
                // setLoaderVisible(false);
            } else 
            if (r == STATUS_NO_CONNECTION) {
                showLoginError(utils.Lang.errConnection);
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
    };

    function showLoginError(error, el) {
        let $lbl = $el.find('#auth-error');

        !!error && $lbl.text(error);
        $lbl.fadeIn(100);

        !!el && $el.find(el).addClass('error').focus();
        disableDialog(false);
    };

    function hideLoginError() {
        $el.find('#auth-error').fadeOut(100);
        $el.find('.error').removeClass('error');
    };

    window.onchildframemessage = function(message, framename) {
        if (framename == 'frameLogin') {
            if (message.length) {
                var obj;
                try {
                    obj = JSON.parse(message);
                } catch (e) {
                    disableDialog(false);
                }

                if (obj) {
                    if (obj.statusCode == 402) {
                        showLoginError(obj.error.message);
                    } else
                    if (obj.statusCode != 201) {
                        console.log('server error: ' + obj.statusCode);
                        showLoginError(utils.Lang.errLoginServer);
                    } else
                    if (!obj.response.sms) {
                        clientCheckin(obj.response.token);
                        getUserInfo(obj.response.token);

                        setTimeout(function(){
                            var frame = document.getElementsByName('frameLogin');
                            frame && frame.length > 0 && frame[0].remove();
                        },10);

                        return;
                    }
                } else {
                    console.log('server error: wrong json');
                    showLoginError(utils.Lang.errLoginServer);
                }

                // setLoaderVisible(false);
            }
        }
    };

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
                        // deprecated
                        // ----------
                        // window["AscDesktopEditor"]["js_message"]('login', 
                        //     JSON.stringify({
                        //         portal: portal,
                        //         user: obj.response
                        //     })
                        // );

                        // localStorage.setItem('ascportal', portal);
                        document.cookie = "asc_auth_key=" + token + ";domain=" + protocol + portal + ";path=/;HttpOnly";
                        // window.location.replace(protocol + portal + startmodule);

                        if (!!events.success) {
                            let auth_info = {
                                portal: protocol + portal,
                                user: obj.response.displayName,
                                email: obj.response.email
                            };
                            events.success(auth_info);
                        }
                        doClose(1);
                    } else {
                        console.log('authentication error: ' + obj.statusCode);
                        showLoginError(utils.Lang.errLoginAuth);
                    }
                } else {
                    console.log('authentication error: ' + status);
                    showLoginError(utils.Lang.errLoginAuth);
                    // setLoaderVisible(false);
                }
            },
            error: function(e, status, error) {
                console.log('server error: ' + status + ', ' + error);
                showLoginError(utils.Lang.errLoginAuth);
                // setLoaderVisible(false);
            }
        };

        $.ajax(opts);
    };

    function clientCheckin(token) {
        $.ajax({
            url: protocol + portal + "/api/2.0/portal/mobile/registration", 
            method: 'post',
            headers: {'Authorization': token},
            data: {type: PROD_ID}
        });
    };

    function bindEvents() {
        $el.find('.body').on('keypress', '.auth-control', 
            function(e) {
                if (e.which == 13) {
                    if (/auth-portal/.test(e.target.id)) 
                        $el.find('#auth-email').focus(); else
                    if (/auth-email/.test(e.target.id)) 
                        $el.find('#auth-pass').focus(); else
                    if (/auth-pass/.test(e.target.id)) {
                        $el.find('#btn-login').focus().click();
                    }
                }
        });

        $el.on('keyup',
            function(e) {
                if (e.which == 27) {
                    onCloseClick();
                }
        });
    };

    function disableDialog(disable) {
        $el.find('.tbox, #btn-login').prop('disabled', disable);
        $el.find('.img-loader')[disable?'show':'hide']();
    };

    return {
        show: function(portal, email) {
            $el = $('#placeholder').append(_tpl).find('.dlg-login');
            $mask = $('.modal-mask');

            let $p = $el.find('#auth-portal'),
                $e = $el.find('#auth-email'),
                $k = $el.find('#auth-pass');

            if (!!portal) {
                let sp = utils.getUrlProtocol(portal);
                !!sp && (protocol = sp);

                $p.val(utils.skipUrlProtocol(portal));
            }
            !!email && $e.val(email);

            // $el.width(450).height(470);
            // set height without logo
            $el.width(450).height(430);

            $el.find('.tool.close').bind('click', onCloseClick);
            $el.find('#btn-login').click(onLoginClick);

            bindEvents();
            $mask.show();

            $p.val().length > 0 ? 
                $e.val().length > 0 ? 
                    $k.focus() : $e.focus() : $p.focus();
        },
        onclose: function(callback) {
            if (!!callback)
                events.close = callback;
        },
        onsuccess: function(callback) {
            if (!!callback)
                events.success = callback;
        }
    };  
};

function doLogin() {

}
