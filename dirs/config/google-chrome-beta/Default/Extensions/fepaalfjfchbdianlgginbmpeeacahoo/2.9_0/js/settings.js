// Load settings on page load
chrome.storage.local.get({
  // Set variables if they do not exist
  settings: {
    apkmirror: true,
    androidpolice: true,
    appbrain: true,  
    testing: true,
    screenshot: true,
    regionSwitching: true
  }
}, function(data) {
  // Set APKMirror checkbox
  document.getElementById('apkmirror').checked = data.settings.apkmirror
  // Set Android Police checkbox
  document.getElementById('androidpolice').checked = data.settings.androidpolice
  // Set Appbrain checkbox
  document.getElementById('appbrain').checked = data.settings.appbrain
  // Set testing program checkbox
  document.getElementById('testing').checked = data.settings.testing
  // Set screenshot gallery checkbox
  document.getElementById('screenshot').checked = data.settings.screenshot
  // Set language dropdown checkbox
  document.getElementById('language-dropdown').checked = data.settings.regionSwitching
});

// Show extension version on settings page
document.getElementById('version').textContent = chrome.runtime.getManifest().version

// Update settings on any input change
document.querySelectorAll('input').forEach(function(element) {
  element.addEventListener('change', function() {
    chrome.storage.local.set({
      settings: {
        apkmirror: document.getElementById('apkmirror').checked,
        androidpolice: document.getElementById('androidpolice').checked,
        appbrain: document.getElementById('appbrain').checked, 
        testing: document.getElementById('testing').checked,
        screenshot: document.getElementById('screenshot').checked,
        regionSwitching: document.getElementById('language-dropdown').checked
      }
    }, function() {
      // Show confirmation message
      M.toast({
        html: 'Saved!',
        displayLength: 2000,
        classes: 'rounded'
      })
    });
  })
})

// Clear cache functionality
document.getElementById('cache-button').addEventListener('click', function() {
  chrome.storage.local.set({
    apkCache: []
  }, function() {
    // Show confirmation message
    M.toast({
      html: 'Cache cleared!',
      displayLength: 2000,
      classes: 'rounded'
    })
  });
})