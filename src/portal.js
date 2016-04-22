
function showDialog() {
    var html = 
    '<div class="message-dlg"> \
        <label class="text">Registration</label> \
        <label class="text-sub">Create your own web office</label> \
        <input class="auth-control first" type="text" placeholder="First name"> \
        <input class="auth-control" type="text" placeholder="email"> \
        <input class="auth-control" type="text" placeholder="portal name"> \
        <input class="auth-control last" type="text" placeholder="Last name"> \
        <button id="">Next</button> \
    </div>';

    $('#wrap').append(html);
}

function checkPortalName(name) {
    var _server_ = 'https://api-system.onlyoffice.com';
    var _path_ = '/api/registration/validateportalname';

    var iframe = document.createElement("iframe");
    iframe.name = "checkPortalTarget";

    iframe.addEventListener("load", function () {
        window.AscDesktopEditor.GetFrameContent("checkPortalTarget");
    });

    document.body.appendChild(iframe);

    sendData(_server_ + _path_, {portalName: name}, iframe);
}