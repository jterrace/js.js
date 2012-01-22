window.___jsl = window.___jsl || {};

window.___jsl.h = window.___jsl.h || "m;/_/apps-static/_/js/widget/__features__/rt=j/ver=Xsa0GTewdqg.en./sv=1/am=!KW4lzGmbF_KIhSW8Og/d=1/";

window.___jsl.l = [];

window.___gpq = [];

window.gapi = window.gapi || {};

window.gapi.plusone = window.gapi.plusone || (function() {
  function f(n) {
    return (function() {
      window.___gpq.push(n, arguments);
    });
  }
  return {
    go: f("go"),
    render: f("render")
  };
})();

function __bsld() {
  var p = window.gapi.plusone = window.googleapisv0.plusone;
  var f;
  while (f = window.___gpq.shift()) {
    p[f] && p[f].apply(p, window.___gpq.shift());
  }
  p = window.gapi.plus = window.googleapisv0.plus;
  while (f = window.___gbq.shift()) {
    p[f] && p[f].apply(p, window.___gbq.shift());
  }
  var parseTags = gapi.config.get("parsetags") || gapi.config.get("gwidget/parsetags");
  if (parseTags !== "explicit") {
    gapi.plusone.go();
  }
}

window.___gbq = [];

window.gapi.plus = window.gapi.plus || (function() {
  function f(n) {
    return (function() {
      window.___gbq.push(n, arguments);
    });
  }
  return {
    go: f("go"),
    render: f("render")
  };
})();

window.__GOOGLEAPIS = window.__GOOGLEAPIS || {};

window.__GOOGLEAPIS.iframes = window.__GOOGLEAPIS.iframes || {};

window.__GOOGLEAPIS.iframes.plus = window.__GOOGLEAPIS.iframes.plus || {
  url: ":socialhost:/u/:session_index:/_/pages/badge"
};

window["___jsl"] = window["___jsl"] || {};

window["___jsl"]["uc"] = "https://apis.google.com/js/plusone.js";

window["___jsl"]["u"] = "https://apis.google.com/js/plusone.js";

window["___jsl"]["f"] = [ "googleapis.client", "plusone", "gcm_ppb" ];

window["___jsl"]["ms"] = "https://plus.google.com";

(window["___jsl"]["ci"] = window["___jsl"]["ci"] || []).push({
  "gwidget": {
    "parsetags": "onload"
  },
  "iframes": {
    "additnow": {
      "url": "https://apis.google.com/additnow/additnow.html"
    },
    "sharebox": {
      "params": {
        "json": "&"
      },
      "url": ":socialhost:/:session_prefix:_/sharebox/dialog"
    },
    "plus": {
      "url": ":socialhost:/:session_prefix:_/pages/badge"
    },
    ":socialhost:": "https://plusone.google.com",
    "plusone_m": {
      "url": ":socialhost:/:session_prefix:_/+1/fastbutton",
      "params": {
        "count": "",
        "size": "",
        "url": ""
      }
    },
    "card": {
      "params": {
        "s": "#",
        "userid": "&"
      },
      "url": ":socialhost:/u/:session_index:/_/hovercard/card"
    },
    "plusone": {
      "url": ":socialhost:/:session_prefix:_/+1/fastbutton",
      "params": {
        "count": "",
        "size": "",
        "url": ""
      }
    }
  },
  "googleapis.config": {
    "requestCache": {
      "enabled": true
    },
    "methods": {
      "chili.people.list": true,
      "pos.plusones.list": true,
      "pos.plusones.get": true,
      "chili.people.get": true,
      "pos.plusones.insert": true,
      "chili.activities.list": true,
      "pos.plusones.delete": true,
      "chili.activities.get": true,
      "chili.activities.search": true,
      "pos.plusones.getSignupState": true
    },
    "versions": {
      "chili": "v1",
      "pos": "v1"
    },
    "rpc": "/rpc",
    "transport": {
      "isProxyShared": true
    },
    "sessionCache": {
      "enabled": true
    },
    "root-1p": "https://clients6.google.com",
    "root": "https://www.googleapis.com",
    "xd3": "/static/proxy.html",
    "developerKey": "AIzaSyCKSbrvQasunBoV16zDH9R33D88CeLr9gQ",
    "auth": {
      "useInterimAuth": false
    }
  }
});

var gapi = window.gapi || {};

gapi.client = window.gapi && window.gapi.client || {};

window.gapi = window.gapi || {};

((function() {
  var A = void 0, B = void 0, C = "___jsl", U = "h", D = "l", V = "m", E = "ms", W = "ci", X = "cu", Y = "c", Z = "cm", $ = "o", n = "p", o = "q", F = "lc", G = "Q", s = "I", t = "il", u = "_", v = "https://ssl.gstatic.com", aa = "/webclient/js", ba = "/webclient/jsx/", H = "https://apis.google.com", I = ".js", ca = "gcjs-3p", da = /^(https?:)?\/\/([^/:@]*)(:[0-9]+)?(\/[\w.,:!=/-]*)(\?[^#]*)?(#.*)?$/, J = /^[?#]([^&]*&)*jsh=([^&]*)/, K = "d", p = "r", ea = "f", q = "m", L = "n", fa = "sync", ga = "callback", ha = "config", ia = "_ci", w = "nodep", M = "gapi.load: ", N = (function(a, b) {
    A && A(a, b);
    throw M + a + (b && " " + b);
  }), O = (function(a) {
    B && B(a);
    var b = window.console;
    b && b.warn(M + a);
  }), ja = (function(a, b, c) {
    a = a[U];
    if (b = b && J.exec(b) || c && J.exec(c)) try {
      a = decodeURIComponent(b[2]);
    } catch (d) {
      O("Invalid hint " + b[2]);
    }
    return a;
  }), P = (function(a) {
    a.sort();
    for (var b = 0; b < a.length; ) !a[b] || b && a[b] == a[b - 1] ? a.splice(b, 1) : ++b;
  }), Q = (function(a, b) {
    for (var c = {}, d = 0; d < b.length; d++) c[b[d]] = !0;
    for (d = 0; d < a.length; d++) if (!c.hasOwnProperty(a[d])) return !1;
    return !0;
  }), ka = (function(a) {
    if ("loading" != document.readyState) return !1;
    if ("undefined" != typeof window.___gapisync) return window.___gapisync;
    if (a && (a = a[fa], "undefined" != typeof a)) return a;
    for (var a = document.getElementsByTagName("meta"), b = 0, c; c = a[b]; ++b) if ("generator" == c.getAttribute("name") && "blogger" == c.getAttribute("content")) return !0;
    return !1;
  }), R = (function(a, b) {
    if (ka(a)) document.write('<script src="' + encodeURI(b) + '"></script>'); else {
      var c = b, d = document.createElement("script");
      d.setAttribute("src", c);
      d.async = !0;
      c = document.getElementsByTagName("script")[0];
      c.parentNode.insertBefore(d, c);
    }
  }), S = (function(a, b, c, d, e, f) {
    var g = c.shift(), h;
    h = g == p ? v : g == q ? d[E] || H : (h = c.shift()) && h.replace(/\/+$/, "");
    var j;
    g == p ? (j = c.shift(), j = (j.indexOf(ba) ? aa + "/" : "") + j) : j = c.shift();
    var i = g == K, k = i && c.shift() || ca, c = i && c.shift();
    if (g == K) f = b, b = j, e = k, a = "/" + a.join(":") + (f.length ? "!" + f.join(":") : "") + I + "?container=" + e + "&c=2&jsload=0", b && (a += "&r=" + b), "d" == c && (a += "&debug=1"); else if (g == p || g == ea) f = b, b = j, a = (b.indexOf("/") ? "/" : "") + b + "/" + a.join("__") + (f.length ? "--" + f.join("__") : "") + I; else if (g == q || g == L) b = j, a = a.join(",").replace(/\./g, "_").replace(/-/g, "_"), a = b.replace("__features__", a), a = e[w] ? a.replace("/d=1/", "/d=0/") : a, f && (a.match(/\/$/) || (a += "/"), a += "cb=gapi." + encodeURIComponent(f)); else return O("Unknown hint type " + g), "";
    if (!h) return "";
    h += a;
    a = h;
    f = d;
    if (b = d = da.exec(a)) if (b = !/\.\.|\/\//.test(d[4])) b : if (b = a, d = d[2], g == p) b = b.substr(0, v.length) == v; else if (g == q) d = f[E] || H, b = b.substr(0, d.length) == d; else {
      g = f[V];
      if (d && g) {
        g = g.split(",");
        f = 0;
        for (b = g.length; f < b; ++f) if (e = g[f], c = d.lastIndexOf(e), (0 == c || "." == e.charAt(0) || "." == d.charAt(c - 1)) && d.length - e.length == c) {
          b = !0;
          break b;
        }
      }
      b = !1;
    }
    b || N("Invalid URI", a);
    return h;
  }), x = (function(a, b, c) {
    c && (a[b] = a[b] || []).push(c);
  }), y = (function(a) {
    a[o] && 0 < a[o].length && (window.gapi.load || T).apply(null, a[o].shift());
  }), r = (function(a) {
    if (a) try {
      a();
    } catch (b) {
      return b;
    }
    return null;
  }), m = window.gapi, la = (function() {
    if (m[u]) return m[u];
    var a;
    if ((a = Object.create) && /\[native code\]/.test(a)) a = a(null); else {
      a = {};
      for (var b in a) a[b] = void 0;
    }
    return m[u] = a;
  }), ma = (function(a, b, c, d, e) {
    var f = e[G] = e[G] || [], g = e[F] = e[F] || {};
    f.push([ a, b, d ]);
    m[c] = (function(b) {
      m[c] = void 0;
      if (!g[a]) {
        g[a] = b;
        for (var b = f, d = g, i = e, k; b[0] && d[b[0][0]]; ) {
          var l = b.shift();
          z(l[2], i);
          d[l[0]].call(window, la());
          d[l[0]] = !0;
          (l = r(l[1])) && !k && (k = l);
        }
        i[n] = void 0;
        y(i);
        if (k) throw k;
      }
    });
  }), z = (function(a, b) {
    var c = a[ia];
    x(b, W, c);
    c = a[ha];
    m.config ? m.config.update(c) : x(b, X, c);
  }), na = (function(a) {
    a[s] || (a[s] = 0);
    return "loaded" + a[s]++;
  }), T = (function(a, b) {
    var c, d = {};
    "function" !== typeof b ? (d = b || {}, c = d[ga]) : c = b;
    var e = window[C] = window[C] || {}, f = ja(e, window.location.search, window.location.hash), g = f && !!f.match(/\/gapi\/|ms=gapi/);
    if (e[n]) x(e, o, [ a, b ]); else {
      f || N("No hint present", "");
      var h = f.split(";"), j = h[0] == q || h[0] == L, f = [], i = [];
      e[t] && "function" === typeof e[t] ? (f = e[t](a), d[w] = 1) : (f = a.split(":"), d[w] || P(f), i = e[D] = e[D] || [], P(i));
      if (g) {
        if (!Q(f, i) && (g = na(e), h = S(f, i, h, e, d, g))) {
          e[n] = f;
          ma(h, c, g, d, e);
          i.push.apply(i, f);
          R(d, h);
          return;
        }
        z(d, e);
        if (c) var k = r(c);
      } else {
        z(d, e);
        if (!Q(f, i)) {
          var l = j ? Z : Y;
          if (h = S(f, i, h, e, d, null)) {
            e[n] = f;
            e[$] = 1;
            e[l] = (function() {
              e[n] = void 0;
              e[l] = void 0;
              var a = r(c);
              y(e);
              if (a) throw a;
            });
            i.push.apply(i, f);
            R(d, h);
            return;
          }
        }
        k = r(c);
      }
      y(e);
      if (k) throw k;
    }
  });
  gapi.loader = {
    load: T
  };
}))();

gapi.load = gapi.loader.load;

(window.gapi = window.gapi || {}).load = window.___jsl && window.___jsl.il && window.gapi.load || gapi.load;

gapi.load("googleapis.client:plusone:gcm_ppb", {
  "callback": window["__bsld"]
});
