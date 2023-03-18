var core = {
  "start": function () {
    core.load();
  },
  "install": function () {
    core.load();
  },
  "load": function () {
    config.domain.cleanup(config.useragent.url);
    app.button.icon(null, config.badge.icon);
    core.register.netrequest();
  },
  "action": {
    "storage": function (changes, namespace) {
      /*  */
    },
    "hotkey": function (e) {
      if (e === "toggle-default-mode") {
        if (config.badge.icon === '') {
          core.update.useragent(config.useragent.global);
        } else {
          core.update.useragent({
            "url": null, 
            "id": ['', '', "default"]
          });
        }
      }
    }
  },
  "update": {
    "page": function (e) {
      app.page.send("storage", {
        "top": e ? e.top : '',
        "url": config.useragent.url,
        "useragent": config.useragent.string
      }, e ? e.tabId : null, e ? e.frameId : null);
    },
    "popup": function () {
      app.popup.send("storage", {
        "key": config.useragent.key,
        "url": config.useragent.url,
        "text": config.useragent.text,
        "string": config.useragent.string
      });
    },
    "useragent": function (e) {
      if (e) {
        if (e.id) {
          let arr = e.id;
          config.useragent.key = arr;
          /*  */
          if (e.url) {
            config.useragent.global = e;
            config.useragent.url = e.url;
          }
          /*  */
          let UA = config.useragent.obj;
          if (arr.length === 1) {
            config.useragent.string = UA[arr[0]];
          } else if (arr.length === 2) {
            config.useragent.string = UA[arr[0]][arr[1]];
          } else {
            config.useragent.string = '';
          }
          /*  */
          config.badge.icon = config.useragent.string ? arr[0] : '';
          app.button.icon(null, config.badge.icon);
          /*  */
          core.register.netrequest();
          core.register.scripts();
          core.update.popup();
        }
      }
    }
  },
  "register": {
    "scripts": async function () {
      await app.contentscripts.unregister();
      //
      if (config.useragent.string) {
        await app.contentscripts.register(config.contentscripts.filters);
      }
    },
    "netrequest": async function () {
      await app.netrequest.display.badge.text(false);
      await app.netrequest.rules.remove.by.action.type("modifyHeaders", "requestHeaders");
      /*  */
      if (config.useragent.string) {
        const domains = config.useragent.url.replace(/\s+/g, '').split(',');
        const cond_1 = domains.indexOf("all_urls") === -1;
        const cond_2 = domains.indexOf('*') === -1;
        const value = config.useragent.string;
        /*  */
        if (cond_2 && cond_1) {
          for (let i = 0; i < domains.length; i++) {
            app.netrequest.rules.push({
              "action": {
                "type": "modifyHeaders",
                "requestHeaders": [
                  {
                    "value": value,
                    "operation": "set",
                    "header": "user-agent"
                  }
                ]
              },
              "condition": {
                "urlFilter": "||" + domains[i],
                "resourceTypes": [
                  "sub_frame",
                  "main_frame"
                ]
              }
            });
          }
        } else {
          app.netrequest.rules.push({
            "action": {
              "type": "modifyHeaders",
              "requestHeaders": [
                {
                  "value": value,
                  "operation": "set",
                  "header": "user-agent"
                }
              ]
            },
            "condition": {
              "urlFilter": '*',
              "resourceTypes": [
                "sub_frame",
                "main_frame"
              ]
            }
          });
        }
        /*  */
        await app.netrequest.rules.update();
      }
    }
  }
};

app.popup.receive("useragent-url", function (e) {
  config.useragent.url = "all_urls";
  if (e) config.domain.cleanup(e);
  /*  */
  core.register.netrequest();
  core.register.scripts();
  core.update.popup();
});

app.popup.receive("reload", function () {
  app.tab.query.active(function (tab) {
    if (tab) {
      app.tab.reload(tab.id);
    }
  });
});

app.popup.receive("update-useragent-string", function (e) {
  let tmp = config.useragent.obj;
  /*  */
  if (e.key.length === 1) tmp[e.key[0]] = e.UA;
  if (e.key.length === 2) tmp[e.key[0]][e.key[1]] = e.UA;
  /*  */
  config.useragent.string = e.UA;
  config.useragent.obj = tmp;
  /*  */
  core.register.netrequest();
  core.register.scripts();
  core.update.popup();
});

app.page.receive("load", core.update.page);
app.popup.receive("load", core.update.popup);
app.popup.receive("useragent-id", core.update.useragent);
app.popup.receive("faq", function () {app.tab.open(app.homepage())});
app.popup.receive("check", function () {app.tab.open(config.test.page)});
app.popup.receive("bug", function () {app.tab.open(app.homepage() + "#report")});
app.popup.receive("status-td-text", function (txt) {config.useragent.text = txt});
app.popup.receive("donation", function () {app.tab.open(app.homepage() + "?reason=support")});

app.on.startup(core.start);
app.on.installed(core.install);
app.on.storage(core.action.storage);
app.storage.load(core.register.scripts);
app.hotkey.on.pressed(core.action.hotkey);