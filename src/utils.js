'use strict';

(function($) {
    $.fn.hasScrollBar = function() {
        return this.get(0).scrollHeight > this.height();
    }
})(jQuery);

var utils = {};
window.utils = utils;

window.PortalsStore = (function() {
    function contain(arr, item) {
        var index = -1;
        for (let i in arr) {
            let pi = arr[i];
            if (pi.portal == item.portal /*&&
                    pi.user == item.user && pi.email == item.email*/) 
            {
                index = i; 
                break;
            }
        }

        return index;
    };

    /* info format: {portal: any.portal.com, user: 'User Name', email: 'user@portal.com'} */
    function addPortal(info) {        
        var portals = !!localStorage.portals ? JSON.parse(localStorage.portals) : [];
        if (!(info instanceof Array)) {
            info = [info];
        } 

        for (let i in info) {
            var index = contain(portals, info[i]);
            !(index < 0) && portals.splice(index, 1);

            portals.push(info[i]);
        }

        localStorage.setItem('portals', JSON.stringify(portals));
    };

    function removePortal(name) {
        var portals = !!localStorage.portals ? JSON.parse(localStorage.portals) : [];
        var index = -1;        
        for (let i = portals.length; i-- > 0; ) {
            if (utils.skipUrlProtocol(portals[i].portal) == name) {
                index = i; 
                break;
            }
        }

        if (!(index < 0)) {
            portals.splice(index, 1);
            localStorage.setItem('portals', JSON.stringify(portals));

            return true;
        }

        return false;
    };

    function portals() {
        return !!localStorage.portals ? JSON.parse(localStorage.portals) : '';
    };

    return {
        keep: addPortal,
        portals: portals,
        forget: removePortal
    };
})();

utils.skipUrlProtocol = function(url) {
    return /^(https?:\/{2})?([^\<\>]+)/i.exec(url)[2];
};
utils.getUrlProtocol = function(url) {
    return /^(https?:\/{2})?([^\<\>]+)/i.exec(url)[1];
};

var FILE_DOCUMENT = 0x0040,
    FILE_PRESENTATION = 0x0080,
    FILE_SPREADSHEET = 0x0100,
    FILE_CROSSPLATFORM = 0x0200;

utils.defines = {}
utils.defines.FileFormat = {
    FILE_UNKNOWN:       0x0000,

    FILE_DOCUMENT:      FILE_DOCUMENT,
    FILE_DOCUMENT_DOCX: FILE_DOCUMENT + 0x0001,
    FILE_DOCUMENT_DOC:  FILE_DOCUMENT + 0x0002,
    FILE_DOCUMENT_ODT:  FILE_DOCUMENT + 0x0003,
    FILE_DOCUMENT_RTF:  FILE_DOCUMENT + 0x0004,
    FILE_DOCUMENT_TXT:  FILE_DOCUMENT + 0x0005,
    FILE_DOCUMENT_HTML: FILE_DOCUMENT + 0x0006,
    FILE_DOCUMENT_MHT:  FILE_DOCUMENT + 0x0007,
    FILE_DOCUMENT_EPUB: FILE_DOCUMENT + 0x0008,
    FILE_DOCUMENT_FB2:  FILE_DOCUMENT + 0x0009,
    FILE_DOCUMENT_MOBI: FILE_DOCUMENT + 0x000a,
    
    FILE_PRESENTATION:      FILE_PRESENTATION,
    FILE_PRESENTATION_PPTX: FILE_PRESENTATION + 0x0001,
    FILE_PRESENTATION_PPT:  FILE_PRESENTATION + 0x0002,
    FILE_PRESENTATION_ODP:  FILE_PRESENTATION + 0x0003,
    FILE_PRESENTATION_PPSX: FILE_PRESENTATION + 0x0004,

    FILE_SPREADSHEET:       FILE_SPREADSHEET,
    FILE_SPREADSHEET_XLSX:  FILE_SPREADSHEET + 0x0001,
    FILE_SPREADSHEET_XLS:   FILE_SPREADSHEET + 0x0002,
    FILE_SPREADSHEET_ODS:   FILE_SPREADSHEET + 0x0003,
    FILE_SPREADSHEET_CSV:   FILE_SPREADSHEET + 0x0004,

    FILE_CROSSPLATFORM:     FILE_CROSSPLATFORM,
    FILE_CROSSPLATFORM_PDF: FILE_CROSSPLATFORM + 0x0001,
    FILE_CROSSPLATFORM_SWF: FILE_CROSSPLATFORM + 0x0002,
    FILE_CROSSPLATFORM_DJVU: FILE_CROSSPLATFORM + 0x0003,
    FILE_CROSSPLATFORM_XPS: FILE_CROSSPLATFORM + 0x0004,
};

utils.defines.DBLCLICK_LOCK_TIMEOUT = 800;
utils.defines.linkBuyNow = "http://www.ivolgapro.ru/buynow";

utils.parseFileFormat = function(format) {
    switch (format) {
    case utils.defines.FileFormat.FILE_DOCUMENT_DOC:
    case utils.defines.FileFormat.FILE_DOCUMENT_DOCX:       return 'docx';
    case utils.defines.FileFormat.FILE_DOCUMENT_ODT:        return 'odt';
    case utils.defines.FileFormat.FILE_DOCUMENT_RTF:        return 'rtf';
    case utils.defines.FileFormat.FILE_DOCUMENT_TXT:        return 'txt';
    case utils.defines.FileFormat.FILE_DOCUMENT_HTML: 
    case utils.defines.FileFormat.FILE_DOCUMENT_MHT:        return 'htm';

    case utils.defines.FileFormat.FILE_SPREADSHEET_XLS: 
    case utils.defines.FileFormat.FILE_SPREADSHEET_XLSX:    return 'xlsx';
    case utils.defines.FileFormat.FILE_SPREADSHEET_ODS:     return 'ods';
    case utils.defines.FileFormat.FILE_SPREADSHEET_CSV:     return 'csv';

    case utils.defines.FileFormat.FILE_PRESENTATION_PPT:     
    case utils.defines.FileFormat.FILE_PRESENTATION_PPTX:   return 'pptx';
    case utils.defines.FileFormat.FILE_PRESENTATION_ODP:    return 'odp';
    case utils.defines.FileFormat.FILE_PRESENTATION_PPSX:   return 'pps';

    case utils.defines.FileFormat.FILE_CROSSPLATFORM_PDF:   return 'pdf';
    case utils.defines.FileFormat.FILE_CROSSPLATFORM_DJVU:  return 'djvu';
    case utils.defines.FileFormat.FILE_CROSSPLATFORM_XPS:   return 'xps';
    }

    return '';
};

utils.fn = {};
utils.fn.extend = function(dest, src) {
    for (var prop in src) {
        if (src.hasOwnProperty(prop)) {
            if (typeof dest[prop] === 'object' &&
                        typeof src[prop] === 'object') {
                utils.extend(dest[prop], src[prop])
            } else {
                dest[prop] = src[prop];
            }
        }
    }

    return dest;
};

utils.fn.parseVersion = function(str) {
    var _re_edition = /edition\:([^\;?]+)/.exec(str),
        _re_version = /num\:([\d\.]+)/.exec(str),
        _re_active = /active\:([^\;?]+)/.exec(str);

    return {
        edition: !!_re_edition ? _re_edition[1] : undefined,
        version: !!_re_version ? _re_version[1] : undefined,
        active: !!_re_active ? _re_active[1] : undefined
    }
};

function getUrlParams() {
    var e,
    a = /\+/g,  
    r = /([^&=]+)=?([^&]*)/g,
    d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
    q = window.location.search.substring(1),
    urlParams = {};

    while (e = r.exec(q))
        urlParams[d(e[1])] = d(e[2]);
    
    return urlParams;
}

utils.inParams = getUrlParams();
