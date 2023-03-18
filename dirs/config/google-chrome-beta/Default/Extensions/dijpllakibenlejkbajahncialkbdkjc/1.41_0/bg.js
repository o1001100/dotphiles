/*
====================================================
To-Do:
Create option page with file name formatting options
====================================================
*/

var ExtName;

function GetCRX() {
    chrome.tabs.query({active: true, currentWindow: true}, function(Tabs) {
        ExtName = (Tabs[0].title.split(" - Chrome Web Store")[0]).replace(/[&\/\\:"*<>|?]/g, '');
        var ExtID = Tabs[0].url.split("/")[6].split('?')[0];
        var P1 = "https://clients2.google.com/service/update2/crx?response=redirect&nacl_arch=";
        var P2 = "&prodversion="+navigator.userAgent.split("Chrome/")[1].split(" ")[0]+"&acceptformat=crx2,crx3&x=id%3D"+ExtID+"%26installsource%3Dondemand%26uc";
        
        //I see you ;)
        
        chrome.runtime.getPlatformInfo(function(PlatformInfo){
            chrome.downloads.download({
                url: P1 + PlatformInfo.nacl_arch + P2,
                saveAs: true
            });
        });
    });
}

chrome.contextMenus.create({
    'id': 'GetCRX',
    'title': 'Get CRX of this extension',
    'contexts': ['all'],
    'documentUrlPatterns': [
        'https://chrome.google.com/webstore/detail/*'
    ]
});

chrome.contextMenus.onClicked.addListener(GetCRX);

chrome.downloads.onDeterminingFilename.addListener(function (Item, __Suggest) {
    __Suggest({ filename: (ExtName + ' ' + Item.filename.split("extension_")[1].replace(/_/g, '.')/*.split('.0')[0]*/) });
    ExtName = undefined;
});