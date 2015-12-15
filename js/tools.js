// Stop event propagation
function sep(e)
{
    if (!e)
      e = window.event;

    //IE9 & Other Browsers
    if (e.stopPropagation) {
      e.stopPropagation();
    }
    //IE8 and Lower
    else {
      e.cancelBubble = true;
    }
}


function getUrlParameters(parameter, decode, staticURL){
  var currLocation = staticURL ? staticURL : window.location.search,
    questionMarckArray = currLocation.split("?");
  if (questionMarckArray.length > 1) {
    var parametersArray = questionMarckArray[1].split("&");
    for(var i = 0; i < parametersArray.length; i++){
      parr = parametersArray[i].split("=");
      if(parr[0] == parameter){
        return decode ? decodeURIComponent(parr[1]) : parr[1];
      }
    }
  }
  return false;
}


// Función para la carga de páginas dentro de páginas
function divloadHTML(div, file)
{
    var xmlhttp;
    if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();
    } else { // code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    if (location.hostname == "") {
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4) {
                document.getElementById(div).innerHTML = xmlhttp.responseText;
            }
        };
    } else {
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                document.getElementById(div).innerHTML = xmlhttp.responseText;
            }
        };
    }

    xmlhttp.open("GET", file, false);
    xmlhttp.send();

    // Vamos al elemento con el código cargado.
    document.getElementById(div).scrollIntoView();
}

// Convert json to html
function highlightJSON(json) {
  if (typeof json != 'string') {
    json = JSON.stringify(json, undefined, 2);
  }
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
    var cls = 'hl num';
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'hl slc'; //key
      } else if (/^"http:/.test(match)) {
        cls = 'hl lnk';
      } else if (/^"file:/.test(match)) {
        cls = 'hl loc';
      } else {
        cls = 'hl str';
      }
    } else if (/true|false/.test(match)) {
      cls = 'hl kwb'; //boolean
    } else if (/null/.test(match)) {
      cls = 'hl esc'; //null
    }
    return '<span class="' + cls + '">' + match + '</span>';
  });
}

// SavePC editor
function saveOnPC() {
//    editor.save();

    var output=document.getElementById('saveHref'),
 //   filecontent=document.getElementById('code').value,
    type=document.getElementById('mode'),
    name=document.getElementById('filename').value;
    if (type) type=type.value;
    else type="html";
    output.href='data:application/'+type+';charset=utf-8,'
        + encodeURIComponent(editor.getValue());
    output.download=name.trim();
    output.style.visibility = 'visible';
}


// SaveOnServer editor
function saveOnServer() {
//    editor.save();

    var name=document.getElementById('filename').value,
//    filecontent=document.getElementById('code').value,
    params = "name="+name+"&doc="+encodeURIComponent(editor.getValue());
    
    phpRequest("savedoc.php", params, function (data) {
        dirHtmlFolder('htmlFiles');
        if (data.text) alert(data.text);
    });
}


// PHP request
function phpRequest(phpFile, phpParams, responseFunction) {
    if (!phpParams) var phpParams = "";
    if (!responseFunction)
        var responseFunction = function (data) {
            if (data.text) alert(data.text);
        };

    var xmlhttp;
    if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();
    } else { // code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xmlhttp.open("POST", phpFile, true);
    //Send the proper header information along with the request
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.setRequestHeader("Content-length", phpParams.length);
    xmlhttp.setRequestHeader("Connection", "close");
    //Call a function when the state changes.
    xmlhttp.onreadystatechange = function() {
	if(xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            try {
	        var data = JSON.parse(xmlhttp.responseText);
                responseFunction(data);
            } catch (e) {
                alert(xmlhttp.responseText);
            }
	}
    }
    xmlhttp.send(phpParams);
}





// Read file into code textarea
function codeReadHtml(file)
{
    var xmlhttp;
    if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();
    } else { // code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    if (location.hostname == "") {
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4) {
                editor.setValue(xmlhttp.responseText);
                document.getElementById('filename').value = file;
            }
        };
    } else {
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                editor.setValue(xmlhttp.responseText);
                document.getElementById('filename').value = file;
            }
        };
    }

    xmlhttp.open("GET", "doc/" + file, true);
    xmlhttp.send();
}


// html files
function dirHtmlFolder(selectOutput) {
    var select = document.getElementById(selectOutput), i;

    // Remove all select options
    while (select.length > 0) {
        select.remove(0);
    }

    phpRequest("dirdoc.php", "", function (data) {
        var i, option = document.createElement("OPTION");
        option.text = "";
        option.value = "";
        select.add(option);
        for (i = 0; i < data.length; i++) {
            if (data[i].charAt(0) != ".") {
                option = document.createElement("OPTION");
                option.value = data[i];
                option.text = option.value;
                select.add(option);
            }
        }
        //alert(JSON.stringify(data));
    });
}


// cambia el modo en ace editor
function changeModeTo(mode) {
    editor.getSession().setMode("ace/mode/"+mode);
}
// cambia el tema en ace editor
function changeThemeTo(theme) {
    editor.setTheme(theme);
}
