var background = (function () {
  let tmp = {};
  /*  */
  chrome.runtime.onMessage.addListener(function (request) {
    for (let id in tmp) {
      if (tmp[id] && (typeof tmp[id] === "function")) {
        if (request.path === "background-to-page") {
          if (request.method === id) {
            tmp[id](request.data);
          }
        }
      }
    }
  });
  /*  */
  return {
    "receive": function (id, callback) {
      tmp[id] = callback;
    },
    "send": function (id, data) {
      chrome.runtime.sendMessage({
        "method": id, 
        "data": data,
        "path": "page-to-background"
      }, function () {
        return chrome.runtime.lastError;
      });
    }
  }
})();

var config = {
  "render": function (e) { 
    const top = e.top;
    const useragent = e.useragent;
    const domains = e.url.replace(/\s+/g, '').split(',');
    /*  */
    if (useragent) { 
      if (config.domain.is.valid(top, domains)) {
        localStorage.setItem("useragent-switcher-uastring", useragent);
      }
    }
  },
  "domain": {
    "extract": function (url) {
      url = url.replace("www.", '').trim();
      /*  */
      let s = url.indexOf("//") + 2;
      if (s > 1) {
        let o = url.indexOf('/', s);
        if (o > 0) {
          return url.substring(s, o);
        } else {
          o = url.indexOf('?', s);
          if (o > 0) {
            return url.substring(s, o);
          } else {
            return url.substring(s);
          }
        }
      } else {
        return url;
      }
    },
    "is": {
      "valid": function (top, domains) {
        if (!top) return true;
        /*  */
        top = config.domain.extract(top);
        /*  */
        if (domains.indexOf('*') !== -1) return true;
        if (domains.indexOf("all_urls") !== -1) return true;
        /*  */
        for (let i = 0; i < domains.length; i++) {
          let domain = domains[i];
          if (domain === top) {
            return true;
          } else if (top.indexOf(domain) !== -1) {
            return true;
          }
        }
        /*  */
        return false;
      }
    }
  }
};

background.send("load");
background.receive("storage", config.render);
