// Function for AJAX Basic authentication (used for APKMirror API)
// Source: https://stackoverflow.com/a/9613117
function make_base_auth(user, password) {
    var tok = user + ':' + password
    var hash = btoa(tok)
    return 'Basic ' + hash
}

// Communicate with contentscript.js
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    // APKMirror API functionality
    if (request.contentScriptQuery == 'checkAPKMirror') {
        // Prepare JSON data
        var data = JSON.stringify({
            'pnames': [
                { 'pname': request.pname }
            ]
        })
        // Set parameters for API call
        var fetchInit = {
            method: 'POST',
            credentials:'omit',
            body: data,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': make_base_auth('api-toolbox-for-google-play', 'CbUW AULg MERW u83r KK4H DnbK')
            },
            cache: 'default'
        }
        // Check APKMirror API using Fetch  
        fetch('https://www.apkmirror.com/wp-json/apkm/v1/app_exists/', fetchInit)
            .then(function (response) {
                response.json().then(function (data) {
                    console.log('Reponse from APKMirror for ' + request.pname + ': ', data)
                    sendResponse(data)
                })
            })
            .catch(function (response) {
                console.log('Error with APKM API: ', response)
                sendResponse(null)
            })
            return true
    }
})