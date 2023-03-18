var app = {};

app.error = function () {
  return chrome.runtime.lastError;
};

app.hotkey = {
  "on": {
    "pressed": function (callback) {
      chrome.commands.onCommand.addListener(function (e) {
        if (callback) callback(e);
      });
    }
  }
};

app.contentscripts = {
  "register": function (scripts) {
    if (chrome.scripting) {
      return chrome.scripting.registerContentScripts(scripts);
    }
  },
  "unregister": function (filter) {
    if (chrome.scripting) {
      if (filter) {
        return chrome.scripting.unregisterContentScripts(filter);
      } else {
        return chrome.scripting.unregisterContentScripts();
      }
    }
  }
};

app.popup = {
  "port": null,
  "message": {},
  "receive": function (id, callback) {
    if (id) {
      app.popup.message[id] = callback;
    }
  },
  "send": function (id, data) {
    if (id) {
      chrome.runtime.sendMessage({"data": data, "method": id, "path": "background-to-popup"}, app.error);
    }
  },
  "post": function (id, data) {
    if (id) {
      if (app.popup.port) {
        app.popup.port.postMessage({"data": data, "method": id, "path": "background-to-popup"});
      }
    }
  }
};

app.button = {
  "icon": function (tabId, path, callback) {
    if (path && typeof path === "object") {
      var options = {"path": path};
      if (tabId) options["tabId"] = tabId;
      chrome.action.setIcon(options, function (e) {
        if (callback) callback(e);
      });
    } else {
      var options = {};
      if (path) {
        options = {
          "path": {
            "16": "../data/popup/icons/16/" + path + ".png",
            "32": "../data/popup/icons/32/" + path + ".png"
          }
        };
      } else {
        options = {
          "path": {
            "16": "../data/icons/16.png",
            "32": "../data/icons/32.png",
            "48": "../data/icons/48.png",
            "64": "../data/icons/64.png"
          }
        };
      }
      /*  */
      if (tabId) options["tabId"] = tabId;
      chrome.action.setIcon(options, function (e) {
        if (callback) callback(e);
      }); 
    }
  }
};

app.storage = {
  "local": {},
  "read": function (id) {
    return app.storage.local[id];
  },
  "update": function (callback) {
    if (app.session) app.session.load();
    /*  */
    chrome.storage.local.get(null, function (e) {
      app.storage.local = e;
      if (callback) {
        callback("update");
      }
    });
  },
  "write": function (id, data, callback) {
    let tmp = {};
    tmp[id] = data;
    app.storage.local[id] = data;
    //
    chrome.storage.local.set(tmp, function (e) {
      if (callback) {
        callback(e);
      }
    });
  },
  "load": function (callback) {
    const keys = Object.keys(app.storage.local);
    if (keys && keys.length) {
      if (callback) {
        callback("cache");
      }
    } else {
      app.storage.update(function () {
        if (callback) callback("disk");
      });
    }
  } 
};

app.on = {
  "management": function (callback) {
    chrome.management.getSelf(callback);
  },
  "uninstalled": function (url) {
    chrome.runtime.setUninstallURL(url, function () {});
  },
  "installed": function (callback) {
    chrome.runtime.onInstalled.addListener(function (e) {
      app.storage.load(function () {
        callback(e);
      });
    });
  },
  "startup": function (callback) {
    chrome.runtime.onStartup.addListener(function (e) {
      app.storage.load(function () {
        callback(e);
      });
    });
  },
  "connect": function (callback) {
    chrome.runtime.onConnect.addListener(function (e) {
      app.storage.load(function () {
        if (callback) callback(e);
      });
    });
  },
  "storage": function (callback) {
    chrome.storage.onChanged.addListener(function (changes, namespace) {
      app.storage.update(function () {
        if (callback) {
          callback(changes, namespace);
        }
      });
    });
  },
  "message": function (callback) {
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
      app.storage.load(function () {
        callback(request, sender, sendResponse);
      });
      /*  */
      return true;
    });
  }
};

app.page = {
  "port": null,
  "message": {},
  "sender": {
    "port": {}
  },
  "receive": function (id, callback) {
    if (id) {
      app.page.message[id] = callback;
    }
  },
  "post": function (id, data, tabId) {
    if (id) {
      if (tabId) {
        if (app.page.sender.port[tabId]) {
          app.page.sender.port[tabId].postMessage({"data": data, "method": id, "path": "background-to-page"});
        }
      } else if (app.page.port) {
        app.page.port.postMessage({"data": data, "method": id, "path": "background-to-page"});
      }
    }
  },
  "send": function (id, data, tabId, frameId) {
    if (id) {
      chrome.tabs.query({}, function (tabs) {
        var tmp = chrome.runtime.lastError;
        if (tabs && tabs.length) {
          var message = {
            "method": id, 
            "data": data ? data : {}, 
            "path": "background-to-page"
          };
          /*  */
          tabs.forEach(function (tab) {
            if (tab) {
              message.data.tabId = tab.id;
              message.data.top = tab.url ? tab.url : '';
              message.data.title = tab.title ? tab.title : '';
              /*  */
              if (tabId !== null && tabId !== undefined) {
                if (tabId === tab.id) {
                  if (frameId !== null && frameId !== undefined) {
                    chrome.tabs.sendMessage(tab.id, message, {"frameId": frameId}, app.error);
                  } else {
                    chrome.tabs.sendMessage(tab.id, message, app.error);
                  }
                }
              } else {
                chrome.tabs.sendMessage(tab.id, message, app.error);
              }
            }
          });
        }
      });
    }
  }
};

app.tab = {
  "open": function (url, index, active, callback) {
    var properties = {
      "url": url, 
      "active": active !== undefined ? active : true
    };
    /*  */
    if (index !== undefined) {
      if (typeof index === "number") {
        properties.index = index + 1;
      }
    }
    /*  */
    chrome.tabs.create(properties, function (tab) {
      if (callback) callback(tab);
    }); 
  },
  "query": {
    "index": function (callback) {
      chrome.tabs.query({"active": true, "currentWindow": true}, function (tabs) {
        var tmp = chrome.runtime.lastError;
        if (tabs && tabs.length) {
          callback(tabs[0].index);
        } else callback(undefined);
      });
    },
    "active": function (callback) {
      chrome.tabs.query({"active": true, "currentWindow": true}, function (tabs) {
        var tmp = chrome.runtime.lastError;
        if (tabs && tabs.length) {
          callback(tabs[0]);
        } else callback(undefined);
      });
    }
  },
  "reload": function (tabId, options, callback) {
    if (tabId) {
      if (options && typeof options === "object") {
        chrome.tabs.reload(tabId, options, function (e) {
          if (callback) callback(e);
        });
      } else {
        chrome.tabs.reload(tabId, {
          "bypassCache": options !== undefined ? options : false
        }, function (e) {
          if (callback) callback(e);
        }); 
      }
    } else {
      chrome.tabs.query({"active": true, "currentWindow": true}, function (tabs) {
        var tmp = chrome.runtime.lastError;
        if (tabs && tabs.length) {
          if (options && typeof options === "object") {
            chrome.tabs.reload(tabs[0].id, options, function (e) {
              if (callback) callback(e);
            });
          } else {
            chrome.tabs.reload(tabs[0].id, {
              "bypassCache": options !== undefined ? options : false
            }, function (e) {
              if (callback) callback(e);
            }); 
          }
        }
      });
    }
  }
};