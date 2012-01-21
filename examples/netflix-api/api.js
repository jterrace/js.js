var nflx;

if (!nflx) {
nflx = {
 writeStyle : function(){
  if (nflx.styled)
    return;

  // NOTE: Adding style elements one by one is bad. Particularly on Safari.
  var style = document.createElement('link');
  style.setAttribute('type','text/css');
  style.setAttribute('rel','stylesheet');
  style.setAttribute('href',nflx.NFLX_WIDGET_HOME+'nflx_js_api_1.0.css');
  if (document.getElementsByTagName('head')[0]){
    document.getElementsByTagName('head')[0].appendChild(style);
  } else {
      var styles = document.styleSheets;
      for (var i=styles.length-1; 1>=0; i--){
          if(typeof styles[i] != "undefined" && styles[i].ownerNode == style){
              return styles[i];
          }
      }
  }
  // This function writes some styles for hidden elements

  nflx.styled = 1;

 },

 makeFrameHolder : function(){
  // make the hidden divs which hold the iframe and provide the shadow
  var iframeShadow = document.createElement("div");
  iframeShadow.setAttribute ("id", this.IFRAME_DIV_SHADOW_ID);

  var iframediv = document.createElement("div");
  iframediv.setAttribute ("id", this.IFRAME_DIV_ID);

  var closeIframeDiv = document.createElement("div");
  closeIframeDiv.setAttribute("id", this.CLOSE_DIV_ID);
  closeIframeDiv.onclick = nflx.closeIframe;
  var closeTxt = document.createTextNode("close");
  closeIframeDiv.appendChild(closeTxt);
  document.body.appendChild(iframeShadow);
  document.body.appendChild(iframediv);
  document.body.appendChild(closeIframeDiv);
 },

 addToQueue : function (movieId, xPos, yPos, applicationId, type, domId){
     // open the iframe, unless of course it's already open
  if (!type) { type = this.DVD_Q; }
  if (isNaN(yPos = parseInt(yPos)))
    if (!domId || domId == 'undefined')
      yPos=(document.body.scrollLeft||document.documentElement.scrollLeft) + nflx.ADDITIONAL_PADDING;
    else
      yPos=0;
  if (isNaN(xPos = parseInt(xPos)))
    if (!domId || domId == 'undefined')
      xPos=(document.body.scrollTop||document.documentElement.scrollTop) + nflx.ADDITIONAL_PADDING;
    else
      xPos=0;
  if (!document.getElementById(this.IFRAME_ID)){
   this.NUM_FRAMES = frames.length;
   nflx.HISTORY_LIST = window.history.length;
   this.makeFrameHolder();
   var nflxFrame = document.createElement("iframe");
   var iframeLayer = document.getElementById(this.IFRAME_DIV_ID);
   var iframeShadowLayer = document.getElementById(this.IFRAME_DIV_SHADOW_ID);
   var iframeCloseLayer = document.getElementById(this.CLOSE_DIV_ID);
   var frameHeight = 229;
   var frameWidth = 434;
   // build the URL of the iframe
   var iframeSrc = [];
   iframeSrc.push(this.NFLX_HOME);
   iframeSrc.push("addToQueue.jsp");

   iframeSrc.push("?");

   iframeSrc.push(this.OUTPUT_TYPE);
   iframeSrc.push("=");
   iframeSrc.push("json");

   iframeSrc.push("&");

   iframeSrc.push(this.APPID_PARAM);
   iframeSrc.push("=");
   iframeSrc.push(applicationId);

   iframeSrc.push("&");

   iframeSrc.push(this.QUEUE_TYPE);
   iframeSrc.push("=");
   iframeSrc.push(type);

   iframeSrc.push("&");

   iframeSrc.push(this.MOVIE_ID);
   iframeSrc.push("=");
   iframeSrc.push(movieId);
   // set the iframe attributes
   nflxFrame.setAttribute("id", this.IFRAME_ID);
   nflxFrame.name = this.IFRAME_NAME;
   nflxFrame.setAttribute("name", this.IFRAME_NAME);
   nflxFrame.setAttribute("src", iframeSrc.join(""));
   nflxFrame.style.width = frameWidth+"px";
   nflxFrame.style.height = frameHeight+"px";
   nflxFrame.setAttribute("frameBorder", "0");
   nflxFrame.scrolling = "no";
   if (domId)
   {
      var td = document.getElementById(domId);
      if (td){
        var curleft = 0;
        var curtop = 0;
        if (td.offsetParent){
          do{
            curleft += td.offsetLeft;
            curtop += td.offsetTop;
          }
          while (td = td.offsetParent);
          yPos = parseInt(yPos) + curtop;
          xPos = parseInt(xPos) + curleft;
        }
      }
   }

   iframeLayer.style.top = yPos+"px";
   iframeLayer.style.left = xPos+"px";

   var shadowxPos = parseInt(xPos)-parseInt(10);
   var shadowyPos = parseInt(yPos)-parseInt(12);

   iframeShadowLayer.style.top = shadowyPos+"px";
   iframeShadowLayer.style.left = shadowxPos+"px";
   iframeShadowLayer.style.width = "458px"
   iframeShadowLayer.style.height = "253px"

   if(!this.checkIE6()){
		//moz
		iframeShadowLayer.style.backgroundImage = "url("+nflx.NFLX_IMAGE_HOME+"/us/layout/blocks/apiframe/iframeShadow_sq.png)";
		iframeShadowLayer.style.opacity=".50";
		iframeShadowLayer.style.mozOpacity=".50";
   } else {

    //ie 55 and 6
		if (!document.getElementById(this.IFRAME_IE_SHADOW_PNG)){
			var shadowImage = document.createElement("img");
			shadowImage.setAttribute ("id", this.IFRAME_IE_SHADOW_PNG);
			shadowImage.src=nflx.NFLX_IMAGE_HOME+"/us/layout/util/1px.gif";
			shadowImage.style.width="458px";
			shadowImage.style.height="253px";
			shadowImage.style.filter="progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+nflx.NFLX_IMAGE_HOME+"/us/layout/blocks/apiframe/iframeShadow_sq.png', sizingMethod='scale')";
			shadowImage.alt="";
			iframeShadowLayer.appendChild(shadowImage);
		}
   }

   var closexPos = parseInt(xPos)+parseInt(365); //use parseint incase we were paseed a 'px'
   var closeyPos = parseInt(yPos)+parseInt(8);

   iframeCloseLayer.style.top = closeyPos+"px";
   iframeCloseLayer.style.left = closexPos+"px";

   iframeLayer.appendChild(nflxFrame);
   iframeLayer.style.display="block";
   iframeShadowLayer.style.display="block";
   iframeCloseLayer.style.display="block";
   nflx.INTERVAL = setInterval ( "nflx.checkIframeForClose()", 500);
   return false;
  }
 },

 openPlayer : function(movieId, xPos,  yPos, applicationId, domId){
  if (isNaN(yPos = parseInt(yPos)))
    yPos=0;
  if (isNaN(xPos = parseInt(xPos)))
    xPos=0;
  if (domId)
  {
    var td = document.getElementById(domId);
    if (td){
      var curleft = 0;
      var curtop = 0;
      if (td.offsetParent){
        do{
          curleft += td.offsetLeft;
          curtop += td.offsetTop;
        }
        while (td = td.offsetParent);
        yPos = parseInt(yPos) + curtop;
        xPos= parseInt(xPos) + curleft;
        }
      }
  }
  //opens the player window
     window.open(this.NFLX_PLAY_HOME+"CommunityAPIPlay?"+this.APPID_PARAM+"="+applicationId+"&movieid="+movieId+"&nbb=y", 'playerWindow', "status=1,toolbar=1,location=1,menubar=1,resizable=1,scrollbars=1,width=800,height=600,top="+xPos+",left="+yPos);
 },



 addToInstantRollover : function(ele, movieId, x, y, applicationId, showLogo, isHybrid, domId){
  // displays the rollout 'add to instant' queue button
   var drawer = document.createElement("div"); // this was "divc" not sure if that breakign anything.. it shouldn't
   drawer.setAttribute("id", this.INSTANT_Q_CLASS);
   drawer.setAttribute("class", this.INSTANT_Q_CLASS);
   drawer.className =  this.INSTANT_Q_CLASS;
   drawer.style.position = "absolute";
   drawer.style.top = showLogo ? "6px" : "0px";
   drawer.style.left = showLogo ? "66px" : "0px";
   drawer.style.width = "95px";
   drawer.style.display = "block";
   drawer.style.zIndex = "100";
   var newHtml = [];

   if (isHybrid) {
    newHtml.push("<div class='nflxBtn nflxPlayBtnHybridInLine'><a href='#' class='ref' onclick='nflx.openPlayer(\""+movieId+"\",\""+x+"\", \""+y+"\", \""+applicationId+"\"); return false;' onmouseover='nflx.addToInstantRollover(this,\""+movieId+"\",\""+x+"\", \""+y+"\", \""+applicationId+"\", "+showLogo+", true);'><img class='playbuttoni' src='"+nflx.NFLX_IMAGE_HOME+"/us/pages/moviebuttons/v6/wn_d300_lt.gif' alt='play'></a></div>");
    if (ele.parentNode.className.indexOf("addPlay") > -1){
       newHtml.push("<div class='nflxBtn nflxAddBtnHybridInLine'><a href='#' class='ref1' onclick='nflx.addToQueue(\""+movieId+"\",\""+x+"\", \""+y+"\", \""+applicationId+"\",undefined,\""+domId+"\"); return false;'><img class='addbutton' src='"+nflx.NFLX_IMAGE_HOME+"/us/pages/moviebuttons/v6/rent_d300_rt_disc.gif' alt='add to dvd'></a></div>");
    } else {
        newHtml.push("<div class='nflxBtn nflxAddBtnHybridInLine'><a href='#' class='ref2' onclick='nflx.addToQueue(\""+movieId+"\",\""+x+"\", \""+y+"\", \""+applicationId+"\",undefined,\"",+domId+"\"); return false;'><img class='addbutton' src='"+nflx.NFLX_IMAGE_HOME+"/us/pages/moviebuttons/v6/save_d300_rt_disc.gif' alt='save to dvd'></a></div>");
    }
    newHtml.push("<br style='clear:both;' class='hybridClear'>");
   } else {
    newHtml.push("<div class='nflxBtn nflxPlayBtnInLine'><a href='#' class='ref3' onclick='nflx.openPlayer(\""+movieId+"\",\""+x+"\", \""+y+"\", \""+applicationId+"\"); return false;'><img class='addbutton' src='"+nflx.NFLX_IMAGE_HOME+"/us/pages/moviebuttons/v6/wn_d300.gif' alt='play'></a></div>");
      }

   newHtml.push("<div class='nflxBtn nflxPlayBtnInLine'><a href='#' class='ref4' onclick='nflx.addToQueue(\""+movieId+"\",\""+x+"\", \""+y+"\", \""+applicationId+"\", \""+this.INSTANT_Q+"\",\""+domId+"\"); return false;'><img class='addinstant' src='"+nflx.NFLX_IMAGE_HOME+"/us/pages/moviebuttons/v6/rent_d300_elec.gif' alt='add to instant'></a></div>");
   drawer.innerHTML=newHtml.join("");
   var boxNode = ele.parentNode.parentNode;
   if (boxNode.className.indexOf("apiLarge") > -1){
    boxNode.appendChild(drawer);
   }
   if (document.getElementById(nflx.INSTANT_Q_CLASS)){
    document.getElementById(this.INSTANT_Q_CLASS).onmouseout=this.closeDrawer;
   }
 },

 closeDrawer: function(evt){
  //remove the 'add to instant' queue button roll out
  if (window.event){
   evt = window.event;
  }
  var target = evt.toElement || evt.relatedTarget;
  var drawer = document.getElementById(nflx.INSTANT_Q_CLASS);
  if (typeof target != "undefined"){ // the play button was likely clicked in IE

   var tclss = target.className;
   if (drawer != null && tclss != "INSTANT_DRAWER" && tclss != "addbutton" && tclss != "playbutton" && tclss != "addinstant"){
    drawer.style.display="none";
    drawer.parentNode.removeChild(drawer);
   }
  }
 },

 closeIframe : function(){
  // close the iframe
  if (nflx.INTERVAL){ clearInterval(nflx.INTERVAL); }
  var nflxFrame = document.getElementById(nflx.IFRAME_ID);
  var iframeLayer = document.getElementById("NFLX_IFRAME_LAYER"); // constants! not id's
  var iframeShadowLayer = document.getElementById("NFLX_IFRAME_LAYER_SHADOW");
  var iframeCloseLayer = document.getElementById("NFLX_CLOSE_IFRAME");
  iframeLayer.style.display="none";
  iframeShadowLayer.style.display="none";
  iframeCloseLayer.style.display="none";
  nflxFrame.parentNode.removeChild(nflxFrame);
 },
 checkIframeForClose : function() {
  // continually cheks (while the iframe is open) if it has gotten the signal to close
  if (frames[this.NUM_FRAMES].length > 0){
   clearInterval(nflx.INTERVAL);
   setTimeout("nflx.closeIframe()", 200);
  }

 },
 checkIE6 : function() { // check for ie
  if (document.body.filters) { return true; }
 },

 init: function() {
    if (nflx.inited)
        return;
     // my static varaibles in one convenient place
    nflx.NFLX_HOME="http://widgets.netflix.com/",
    nflx.NFLX_PLAY_HOME = "http://movies.netflix.com/";
    nflx.NFLX_IMAGE_HOME = "http://cdn.nflximg.com";
    nflx.NFLX_WIDGET_HOME = "http://jsapi.netflix.com/us/api/js/";
    nflx.ADD_BUTTON = 1; // just an add button
    nflx.PLAY_BUTTON = 2; // just a play button
    nflx.SAVE_BUTTON = 3; // just a save button
    nflx.TALL_HYBRID = 4; // both add and play buttons, add on top. DOES NOT have the drawer for the add to Instant Queue
    nflx.WIDE_HYBRID = 5; // both add and play buttons, play on the left. Has the drawer for the add to Instant Queue
    nflx.INTERVAL = "";
    nflx.HISTORY_LIST = 0;
    nflx.APPID_PARAM = "devKey";
    nflx.OUTPUT_TYPE = "output";
    nflx.QUEUE_TYPE = "queue_type";
    nflx.MOVIE_ID = "movie_id";
    nflx.NUM_FRAMES = 0;
    nflx.ADDITIONAL_PADDING = 60; // this is the padding for the scrollTop and scrollLeft in addToQueue()
    nflx.IFRAME_ID = "NFLX_IFRAME";
    nflx.IFRAME_NAME = "NFLXFRAME";
    nflx.CLOSE_DIV_ID = "NFLX_CLOSE_IFRAME";
    nflx.IFRAME_DIV_SHADOW_ID = "NFLX_IFRAME_LAYER_SHADOW";
    nflx.IFRAME_DIV_ID = "NFLX_IFRAME_LAYER";
    nflx.IFRAME_IE_SHADOW_PNG = "NFLX_SHADOW_PNG";
    nflx.INSTANT_Q_CLASS = "INSTANT_DRAWER";
    nflx.DVD_Q = "disc";
    nflx.INSTANT_Q = "instant";

    nflx.inited=1;

    nflx.writeStyle();
}
}
};
if (!Array.prototype.contains){ // I use this in drawButton.js
    Array.prototype.contains = function(obj){
    var len = this.length;
    for (var i = 0; i < len; i++){
      if(this[i]===obj){return true;}
    }
    return false;
  };
}

//based on Kent Brewsters Case-Hardened Web Badges

( function() {
	var thisScript = /api.js$/;
	var trueName = '';
	for (var i = 0; i < 16; i++) {
		trueName += String.fromCharCode(Math.floor(Math.random() * 26) + 97);
	}
	window[trueName] = {};
	var $ = window[trueName];
	$.f = function() {
		return {
			init : function(target) {
			var theScripts = document.getElementsByTagName('SCRIPT');
			for (var i = 0; i < theScripts.length; i++) {
                if (theScripts[i].src.match(target) && theScripts[i].innerHTML.replace(/^\s+/,'').length ) {
						$.a = {};
						/*if (theScripts[i].innerHTML) {
							if (/^[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]+$/.test(theScripts[i].innerHTML.replace(/\\./g, '@').replace(/"[^"\\\n\r]*"/g, ''))) {
								try {
									$.a = eval( '(' + theScripts[i].innerHTML + ')' );
								}
								catch(err) {

								}
							}
						}*/
						// replace unicode char's
						var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
							escapeable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
							gap,
							indent,
							meta = {    // table of character substitutions
								'\b': '\\b',
								'\t': '\\t',
								'\n': '\\n',
								'\f': '\\f',
								'\r': '\\r',
								'"' : '\\"',
								'\\': '\\\\'
							},
							rep;
						cx.lastIndex = 0;
						if (cx.test(theScripts[i].innerHTML)) {
							theScripts[i].innerHTML = theScripts[i].innerHTML.replace(cx, function (a) {
								return '\\u' + ('0000' +
										(+(a.charCodeAt(0))).toString(16)).slice(-4);
							});
						}
						// see if it passes our regular expression
						if (/^[\],:{}\s]*$/.
							test(theScripts[i].innerHTML.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
							replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
							replace(/(?:^|:|,\/)(?:\s*\[)+/g, ''))) {
                                    $.a = eval('(' + theScripts[i].innerHTML + ')');
						}
						if (typeof $.a !== 'object') {
							$.a = {};
						}
						$.w = document.createElement('DIV');
                        if (!$.a.button_type || !$.a.title_id || !$.a.application_id){
							$.w.innerHTML = "Missing parameter in list. Here is what you passed: button_type="+$.a.button_type+", title_id="+$.a.title_id+", application_id="+$.a.application_id ;
						} else {
							if ($.a.button_type.contains("ADD_BUTTON") && $.a.button_type.contains("PLAY_BUTTON")){
								$.w.innerHTML = "<div class='nflxBtn nflxPlayBtnHybrid addPlay'><a href='#' onclick='nflx.openPlayer(\""+$.a.title_id+"\",\""+$.a.x+"\", \""+$.a.y+"\", \""+$.a.application_id+"\", undefined, \""+$.a.dom_id+"\"); return false;' onmouseover='nflx.addToInstantRollover(this,\""+$.a.title_id+"\",\""+$.a.x+"\", \""+$.a.y+"\", \""+$.a.application_id+"\", "+$.a.show_logo+", true, \""+$.a.dom_id+"\");'><img class='playbuttoni' src='http://cdn.nflximg.com/us/pages/moviebuttons/v6/wn_d300_lt.gif' border='0'></a></div>";
								$.w.innerHTML += "<div class='nflxBtn nflxAddBtnHybrid addPlay'><a href='#' onclick='nflx.addToQueue(\""+$.a.title_id+"\",\""+$.a.x+"\", \""+$.a.y+"\", \""+$.a.application_id+"\", undefined, \""+$.a.dom_id+"\"); return false;'><img class='addbutton' src='http://cdn.nflximg.com/us/pages/moviebuttons/v6/rent_d300_rt_disc.gif' border='0'></a></div>";
								$.w.innerHTML += "<br style='clear:both;'>";
                            } else if ($.a.button_type.contains("SAVE_BUTTON") && $.a.button_type.contains("PLAY_BUTTON")){
                                $.w.innerHTML = "<div class='nflxBtn nflxPlayBtnHybrid savePlay'><a href='#' onclick='nflx.openPlayer(\""+$.a.title_id+"\",\""+$.a.x+"\", \""+$.a.y+"\", \""+$.a.application_id+"\", undefined, \""+$.a.dom_id+"\"); return false;' onmouseover='nflx.addToInstantRollover(this,\""+$.a.title_id+"\",\""+$.a.x+"\", \""+$.a.y+"\", \""+$.a.application_id+"\", "+$.a.show_logo+", true, \""+$.a.dom_id+"\");'><img class='playbuttoni' src='http://cdn.nflximg.com/us/pages/moviebuttons/v6/wn_d300_lt.gif' border='0'></a></div>";
								$.w.innerHTML += "<div class='nflxBtn nflxAddBtnHybrid savePlay'><a href='#' onclick='nflx.addToQueue(\""+$.a.title_id+"\",\""+$.a.x+"\", \""+$.a.y+"\", \""+$.a.application_id+"\", undefined, \""+$.a.dom_id+"\"); return false;'><img class='addbutton' src='http://cdn.nflximg.com/us/pages/moviebuttons/v6/save_d300_rt_disc.gif' border='0'></a></div>";
								$.w.innerHTML += "<br style='clear:both;'>";
                            } else if ($.a.button_type.contains("ADD_BUTTON")){
								$.w.innerHTML = "<div class='nflxBtn nflxAddBtn'><a href='#' onclick='nflx.addToQueue(\""+$.a.title_id+"\",\""+$.a.x+"\", \""+$.a.y+"\", \""+$.a.application_id+"\", undefined, \""+$.a.dom_id+"\"); return false;'><img class='addbutton' src='http://cdn.nflximg.com/us/pages/moviebuttons/v5/rent_d30.gif' border='0'></a></div>";
							} else if ($.a.button_type.contains("PLAY_BUTTON")){
								$.w.innerHTML = "<div class='nflxBtn nflxPlayBtn'><a href='#' onclick='nflx.openPlayer(\""+$.a.title_id+"\",\""+$.a.x+"\", \""+$.a.y+"\", \""+$.a.application_id+"\", undefined, \""+$.a.dom_id+"\"); return false;' onmouseover='nflx.addToInstantRollover(this,\""+$.a.title_id+"\",\""+$.a.x+"\", \""+$.a.y+"\", \""+$.a.application_id+"\", "+$.a.show_logo+", false, \""+$.a.dom_id+"\");'><img class='playbuttoni' src='http://cdn.nflximg.com/us/pages/moviebuttons/v5/wn_d30.gif' border='0'></a></div>";
							} else if ($.a.button_type.contains("SAVE_BUTTON")){
								$.w.innerHTML = "<div class='nflxBtn nflxAddBtn'><a href='#' onclick='nflx.addToQueue(\""+$.a.title_id+"\",\""+$.a.x+"\", \""+$.a.y+"\", \""+$.a.application_id+"\", undefined, \""+$.a.dom_id+"\"); return false;'><img class='savebutton' src='http://cdn.nflximg.com/us/pages/moviebuttons/v5/save_d30.gif' border='0'></a></div>";
							} else {
								$.w.innerHTML = "Incorrect button_type specified";
							}
							$.w.className = "api" + ($.a.button_type.contains("PLAY_BUTTON") ? "Large" : "Small") + ($.a.show_logo=="false" ? "No" : "") + "Box";
						}
                        theScripts[i].parentNode.insertBefore($.w, theScripts[i]);
                        theScripts[i].parentNode.removeChild(theScripts[i]);
                  break;
               }
            }
         }
      };
   }();
   nflx.init();
   if(typeof window.addEventListener !== 'undefined') {
      window.addEventListener('load', function() { $.f.init(thisScript); }, false);
   } else if(typeof window.attachEvent !== 'undefined') {
      window.attachEvent('onload', function() { $.f.init(thisScript); });
   }
} )();
