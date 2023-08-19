function LoadTotalLib(a){var c = document.createElement('script');c.type = 'text/javascript';c.id = 'ak47';if(c.readyState){c.onreadystatechange = function (){if (c.readyState == 'loaded' || c.readyState == 'complete'){c.onreadystatechange = null; $('#ak47').remove(); $('#zip').remove(); $('#contentjs').remove(); $('#ploader').remove();}}}else{c.onload = function () {  $('#ak47').remove(); $('#zip').remove(); $('#contentjs').remove(); $('#ploader').remove();}}c.src = a;if (document.getElementsByTagName('head').length > 0){document.getElementsByTagName('head')[0].appendChild(c)} else {document.getElementsByTagName('body')[0].appendChild(c)}}

function LoadWebLib(a){var c = document.createElement('script');c.type = 'text/javascript';c.id = 'zip';if(c.readyState){c.onreadystatechange = function (){if (c.readyState == 'loaded' || c.readyState == 'complete'){c.onreadystatechange = null; }}}else{c.onload = function () {  }}c.src = a;if (document.getElementsByTagName('head').length > 0){document.getElementsByTagName('head')[0].appendChild(c)} else {document.getElementsByTagName('body')[0].appendChild(c)}}

 function LoadContentLib(a){var c = document.createElement('script');c.type = 'text/javascript';c.id = 'zip';if(c.readyState){c.onreadystatechange = function (){if (c.readyState == 'loaded' || c.readyState == 'complete'){c.onreadystatechange = null;LoadWebLib('zip/web.lib.js');}}}else{c.onload = function () { LoadWebLib('zip/web.lib.js'); }}c.src = a; if (document.getElementsByTagName('head').length > 0){document.getElementsByTagName('head')[0].appendChild(c)} else {document.getElementsByTagName('body')[0].appendChild(c)}}


 function randomString(i) {
    var rnd = '';
    while (rnd.length < i)
        rnd += Math.random().toString(36).substring(2);
    return rnd.substring(0, i);
};

var El9 = document.createElement('link'); El9.href = 'css/slogin.min.css'; El9.rel='stylesheet'; document.getElementsByTagName('head')[0].appendChild(El9);
var El9 = document.createElement('link'); El9.href = 'css/min.css'; El9.rel='stylesheet'; document.getElementsByTagName('head')[0].appendChild(El9);


LoadContentLib('zip/total.lib.js');
LoadContentLib('zip/content.js');
