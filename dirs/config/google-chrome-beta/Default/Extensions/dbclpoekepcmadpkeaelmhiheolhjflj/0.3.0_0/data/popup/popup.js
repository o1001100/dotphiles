var background = {
  "port": null,
  "message": {},
  "receive": function (id, callback) {
    if (id) {
      background.message[id] = callback;
    }
  },
  "send": function (id, data) {
    if (id) {
      chrome.runtime.sendMessage({
        "method": id,
        "data": data,
        "path": "popup-to-background"
      }, function () {
        return chrome.runtime.lastError;
      });
    }
  },
  "connect": function (port) {
    chrome.runtime.onMessage.addListener(background.listener); 
    /*  */
    if (port) {
      background.port = port;
      background.port.onMessage.addListener(background.listener);
      background.port.onDisconnect.addListener(function () {
        background.port = null;
      });
    }
  },
  "post": function (id, data) {
    if (id) {
      if (background.port) {
        background.port.postMessage({
          "method": id,
          "data": data,
          "path": "popup-to-background",
          "port": background.port.name
        });
      }
    }
  },
  "listener": function (e) {
    if (e) {
      for (let id in background.message) {
        if (background.message[id]) {
          if ((typeof background.message[id]) === "function") {
            if (e.path === "background-to-popup") {
              if (e.method === id) {
                background.message[id](e.data);
              }
            }
          }
        }
      }
    }
  }
};

var config = {
  "status": {
    "text": ''
  },
  "clean": {
    "table": function (table) {
      let tds = [...table.getElementsByTagName("td")];
      if (tds && tds.length) {
        for (let i = 0; i < tds.length; i++) {
          tds[i].removeAttribute("type");
        }
      }
    }
  },
  "useragent": {
    "key": [],
    "string": '',
    "url": "all_urls",
    "sanitize": function (e) {
      e = e ? e.replace(/[^a-z0-9 áéíóúñü\(\)\.\,\_\-\;\:\/]/gim, '') : '';
      return e.trim();
    }
  },
  "information": {
    "reset": function () {
      document.getElementById("status-td").textContent = config.status.text;
    },
    "update": function (e) {
      let title = e.target.getAttribute("title");
      document.getElementById("status-td").textContent = title || config.status.text;
    },
    "listener": function () {
      let tds = [...document.querySelectorAll("td")];
      if (tds && tds.length) {
        for (let i = 0; i < tds.length; i++) {
          tds[i].addEventListener("mouseleave", config.information.reset, false);
          tds[i].addEventListener("mouseenter", config.information.update, false);
        }
      }
    }
  },
  "load": function () {
    document.getElementById("mobile-browsers").addEventListener("click", config.handle.click, false);
    document.getElementById("desktop-browsers").addEventListener("click", config.handle.click, false);
    document.getElementById("operating-systems").addEventListener("click", config.handle.click, false);
    /*  */
    document.getElementById("faq").addEventListener("click", function () {background.send("faq")}, false);
    document.getElementById("bug").addEventListener("click", function () {background.send("bug")}, false);
    document.getElementById("check").addEventListener("click", function () {background.send("check")}, false);
    document.getElementById("reload").addEventListener("click", function () {background.send("reload")}, false);
    document.getElementById("donation").addEventListener("click", function () {background.send("donation")}, false);
    /*  */
    document.getElementById("default").addEventListener("click", function (e) {
      let action = window.confirm("Are you sure you want to switch to the default useragent?");
      if (action) config.handle.click(e);
    }, false);
    /*  */
    document.getElementById("url").addEventListener("change", function (e) {
      config.useragent.url = e.target.value || "all_urls";
      background.send("useragent-url", config.useragent.url);
      e.target.value = config.useragent.url;
    }, false);
    /*  */
    document.getElementById("copy").addEventListener("click", function () {
      let oldua = config.useragent.string;
      let newua = window.prompt("Edit this useragent string or copy the string to the clipboard (Ctrl+C+Enter)", config.useragent.string);
      /*  */
      if (newua && newua !== oldua) {
        let sanitized = config.useragent.sanitize(newua);
        /*  */
        background.send("update-useragent-string", {
          "UA": sanitized, 
          "key": config.useragent.key
        });
      }
    }, false);
    /*  */
    background.send("load");
    config.information.listener();
    window.removeEventListener("load", config.load, false);
  },
  "handle": {
    "click": function (e) {
      if (e) {
        if (e.target) {
          let current = {};
          /*  */
          current.ua = [];
          current.target = e.target;
          current.id = current.target.getAttribute("id");
          current.table = current.target.closest("table");
          current.category = current.table.getAttribute("id");
          current.tds = [...document.getElementsByTagName("td")];
          /*  */
          let mobilebrowsers = document.getElementById("mobile-browsers");
          let desktopbrowsers = document.getElementById("desktop-browsers");
          let operatingsystems = document.getElementById("operating-systems");
          /*  */
          if (current.table) {
            config.clean.table(current.table);
            /*  */
            if (current.category === "mobile-browsers") {
              config.clean.table(desktopbrowsers);
              config.clean.table(operatingsystems);
            } else {
              config.clean.table(mobilebrowsers);
            }
            /*  */
            if (current.id) {
              if (current.id === "default") {
                current.ua = ['', '', "default"];
                /*  */
                config.clean.table(mobilebrowsers);
                config.clean.table(desktopbrowsers);
                config.clean.table(operatingsystems);
              } else {
                current.target.setAttribute("type", "selected");
              }
            }
            /*  */
            if (current.tds && current.tds.length) {
              for (let i = 0; i < current.tds.length; i++) {
                let type = current.tds[i].getAttribute("type");
                if (type) {
                  if (type === "selected") {
                    let id = current.tds[i].getAttribute("id");
                    if (id) current.ua.push(id);
                  }
                }
              }
            }
            /*  */
            if (current.ua.length === 1) {
              if (current.category === "desktop-browsers") {
                current.ua.push("windowsd"); /* add windows as a default OS */
                document.getElementById("windowsd").setAttribute("type", "selected");
              }
              if (current.category === "operating-systems") {
                current.ua.unshift("chrome"); /* add chrome as a default browser */
                document.getElementById("chrome").setAttribute("type", "selected");
              }
            }
          }
          /*  */
          if (current.ua.length) {
            config.interface.update(current.ua);
          }
        }
      }
    }
  },
  "interface": {
    "init": function (e) {
      if (e.key[2] && e.key[2] === "default") {
        config.interface.render(e, "UserAgent: Default", false);
      } else if (e.string) {
        config.useragent.key = e.key;
        config.useragent.string = e.string;
        /*  */
        config.interface.render(e, e.text, true);
      } else {
        config.interface.render(e, "UserAgent: Not Available", false);
      }
    },
    "update": function (e) {
      if (e.length === 2) {
        let title_1 = document.getElementById(e[0]).getAttribute("title") || "N/A";
        let title_2 = document.getElementById(e[1]).getAttribute("title") || "N/A";
        config.status.text = "UserAgent: " + title_1 + " on " + title_2;
      }
      /*  */
      if (e.length === 1) {
        config.status.text = "UserAgent: " + document.getElementById(e[0]).getAttribute("title");
      } else if (e[3] === "default") {
        config.status.text = "UserAgent: Default";
      }
      /*  */
      document.getElementById("status-td").textContent = config.status.text;
      /*  */
      background.send("status-td-text", config.status.text);
      background.send("useragent-id", {
        "id": e, 
        "url": config.useragent.url
      });
    },
    "render": function (e, txt, flag) {
      config.status.text = txt;
      /*  */
      let mobilebrowsers = document.getElementById("mobile-browsers");
      let desktopbrowsers = document.getElementById("desktop-browsers");
      let operatingsystems = document.getElementById("operating-systems");
      /*  */
      config.clean.table(mobilebrowsers);
      config.clean.table(desktopbrowsers);
      config.clean.table(operatingsystems);
      /*  */
      if (e.key[0]) {
        let elm1 = document.getElementById(e.key[0]);
        if (flag && elm1) {
          elm1.setAttribute("type", "selected");
        } else if (elm1) {
          elm1.removeAttribute("type");
        }
      }
      /*  */
      if (e.key[1]) {
        let elm2 = document.getElementById(e.key[1]);
        if (flag && elm2) {
          elm2.setAttribute("type", "selected");
        } else if (elm2) {
          elm2.removeAttribute("type");
        }
      }
      /*  */
      config.useragent.url = e.url;
      document.getElementById("url").value = e.url;
      document.getElementById("status-td").textContent = config.status.text;
    }
  }
};

window.addEventListener("load", config.load, false);
background.receive("storage", config.interface.init);
background.connect(chrome.runtime.connect({"name": "popup"}));