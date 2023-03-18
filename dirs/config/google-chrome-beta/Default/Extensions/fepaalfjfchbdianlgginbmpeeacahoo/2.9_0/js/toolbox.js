// Function for checking the current Play Store site design
// Three possible options: "old-desktop" (old desktop site), "old-mobile" (old mobile site), "new-unified" (new desktop/mobile unified design)
function getSiteDesign() {
  if (document.querySelector('body').hasAttribute('data-has-header')) {
    return 'new-unified'
  } else if (!!document.querySelector('meta[name="mobile-web-app-capable"]')) {
    return 'old-mobile'
  } else {
    return 'old-desktop'
  }
}

console.log('Site design detected as: ' + getSiteDesign())

// Function for rounding numbers
// Source: https://www.html-code-generator.com/javascript/shorten-long-numbers
function intToString(num) {
  if (num < 1000) {
    return num;
  }
  var si = [
    { v: 1E3, s: "K" },
    { v: 1E6, s: "M" },
    { v: 1E9, s: "B" },
    { v: 1E12, s: "T" },
    { v: 1E15, s: "P" },
    { v: 1E18, s: "E" }
  ];
  var i;
  for (i = si.length - 1; i > 0; i--) {
    if (num >= si[i].v) {
      break;
    }
  }
  return (num / si[i].v).toFixed(2).replace(/\.0+$|(\.[0-9]*[1-9])0+$/, "$1") + si[i].s;
}

// Function for checking if current page is a Play Store app page
function ifAppPage() {
  if (window.location.href.includes('/store/apps/details') && window.location.href.includes('id=')) {
    return true
  } else {
    return false
  }
}

// Function for checking if the current page is a list of apps
function ifAppListPage() {
  var appListPage =
    window.location.href.includes('/apps/developer') ||
    window.location.href.includes('apps/collection/cluster')
  if (appListPage) {
    return true
  } else {
    return false
  }
}

// Function for obtaining the current active page
function getActiveContainer() {
  // Every time the user navigates, a new <c-wiz> element is created with all the page content
  // This finds the <c-wiz> element currently visible to the user
  try {
    var nodes = document.querySelectorAll('c-wiz[data-ogpc]')
    var container = nodes[nodes.length - 1]
    return container
  } catch {
    return null
  }
}

// Function for obtaining the current active language
// This replaces underscores (which Play uses in some URLs) with dashes
function getActiveLanguage() {
  var param = getParameterByName('hl', window.location.href)
  if (param) {
    var lang = param.replace('_', '-')
    return lang
  } else {
    // Try to get the value from HTML code
    // This doesn't work for regional dialects (e.g. "fr-CA")
    try {
      var el = document.querySelector('div[data-locale]')
      var lang = el.getAttribute('data-locale')
      lang = lang.replace('_', '-')
      return lang
    } catch {
      return null
    }
  }
}

// Function for obtaining the current active region
function getActiveRegion() {
  var param = getParameterByName('gl', window.location.href)
  if (param) {
    var region = param.toLowerCase();
    return region
  } else {
    // Try to get the value from HTML code
    try {
      var el = document.querySelector('div[data-country]')
      var region = el.getAttribute('data-country').toLowerCase()
      return region
    } catch {
      return null
    }
  }
}

// Pre-registration detection
function isPreregistration() {
  var container = getActiveContainer()
  if (container) {
    return !!container.querySelector('not-preregistered,preregistered')
  } else {
    return null
  }
}

// Function for finding short app name
function getAppName() {
  var title = document.title
  title = title.substring(0, title.lastIndexOf("-") - 1)
  // If the processed title string is blank (possible if google changes the title format), return generic label
  if (title) {
    return title
  } else {
    return 'this app'
  }
}

// Function for retrieving parameters from URLs
// This is used for grabbing 'authuser' variable and app package name
function getParameterByName(name, url) {
  var string = new URL(url)
  var param = string.searchParams.get(name)
  return param
}

// Function to find difference in hours/days between two Date() objects
function timeDiff(dt2, dt1, format) {
  var diff = (dt2.getTime() - dt1.getTime()) / 1000
  diff /= (60 * 60)
  if (format == 'hours') {
    return Math.abs(Math.round(diff))
  } else if (format == 'days') {
    return Math.abs(Math.round(diff)) / 24
  }
}

// Functions for triggering clicks on items loaded through AJAX
// Source: https://stackoverflow.com/a/15512019
function triggerMostButtons(jNode) {
  triggerMouseEvent(jNode, 'mouseover')
  triggerMouseEvent(jNode, 'mousedown')
  triggerMouseEvent(jNode, 'mouseup')
  triggerMouseEvent(jNode, 'click')
}

function triggerMouseEvent(node, eventType) {
  var clickEvent = document.createEvent('MouseEvents')
  clickEvent.initEvent(eventType, true, true)
  node.dispatchEvent(clickEvent)
}

// Promise object for retrieving info about an app package from storage or APKMirror API
function getAppInfo(packageName) {
  return new Promise(function (resolve, reject) {
    // Check chrome.storage cache first
    console.log('Checking cache for data about ' + packageName + '...')
    chrome.storage.local.get({
      // Create cache array if it does not exist
      apkCache: []
    }, async function (storage) {
      // Clean out cache if it gets too large
      if (storage.apkCache.length >= 500) {
        console.log('Clearing out cache...')
        storage.apkCache = []
      }
      // Check if cache contains results for packageName
      if (storage.apkCache.find(el => el[0] === packageName)) {
        console.log('Found app in cache:', storage.apkCache.find(el => el[0] === packageName))
        var cachedate = new Date(storage.apkCache.find(el => el[0] === packageName)[1][0])
        var start = new Date()
        var daydiff = timeDiff(cachedate, start, 'days') // Difference between cache date and now in days
        var hourdiff = timeDiff(cachedate, start, 'hours') // Difference between cache date and now in hours
        // Determine if the cache needs to be updated
        // If app is already in cache with value of TRUE (app exists on APKM), wait 8 hours before checking again
        // If app is already in cache with value of FALSE (app does not exist on APKM), wait three hours before checking again
        // If app is not in cache at all, check APKMirror and store result
        if (((storage.apkCache.find(el => el[0] === packageName)[1][0] == true) && hourdiff > 7) || ((storage.apkCache.find(el => el[0] === packageName)[1][1].exists == false) && hourdiff > 2)) {
          console.log('Cache info is out of date (info is from ' + cachedate + ', ' + hourdiff + ' hours ago), checking APKMirror.')
          var appData = await checkAPKMirror(packageName, storage)
          resolve(appData)
        } else {
          console.log('Cache data is only from from ' + hourdiff + ' hours (' + daydiff + ' days) ago, no need to check APKMirror.')
          // Create APKMirror Button
          resolve(storage.apkCache.find(el => el[0] === packageName)[1][1])
        }
      } else {
        console.log('Did not find ' + packageName + ' in cache, checking APKMirror...')
        var appData = await checkAPKMirror(packageName, storage)
        resolve(appData)
      }
    })
  })
}

// Function for interacting with APKMirror API
function checkAPKMirror(packageName, storage) {
  return new Promise(function (resolve, reject) {
    // Prepare JSON data
    chrome.runtime.sendMessage({ contentScriptQuery: 'checkAPKMirror', pname: packageName.toString() }, function (data) {
      // If there's an API error, return an empty string
      if (!data) {
        resolve({})
      } else {
        var app = data.data[0]
        // console.log('APKMirror API results:', app)
        // Remove existing entry from cache, if one exists
        var index = storage.apkCache.indexOf(storage.apkCache.find(el => el[0] === packageName))
        if (index > -1) {
          storage.apkCache.splice(index, 1)
        }
        // Add new entry to cache
        var currentTime = Date().toString()
        storage.apkCache.push([app.pname, [currentTime, app]])
        // Save array back to chrome.storage
        chrome.storage.local.set({
          // Create cache array if it does not exist
          apkCache: storage.apkCache
        }, function () {
          // Cache file saved
        })
        // Resolve Promise
        resolve(app)
      }
    })
  })
}

// Function for checking for Play Store beta programs
async function checkTestingProgram(testingButton) {
  // Find which Google account (authuser) is currently logged in by scanning page for links with authuser parameter
  try {
    var authuser = getParameterByName('authuser', document.querySelector('a[href*="authuser"]').getAttribute('href'))
  }
  catch (err) {
    var authuser = null
  }
  // If the authuser couldn't be found, use zero
  if (authuser === null) {
    authuser = 0
    console.log('Authuser could not be detected, defaulting to 0')
  } else {
    console.log('Detected authuser as ' + authuser)
  }
  // Open testing program page when button is clicked, regardless of final result
  testingButton.addEventListener('click', function () {
    window.location.href = testingProgramLink
  })
  // Request testing program data
  var testingProgramLink = 'https://play.google.com/apps/testing/' + getParameterByName('id', window.location.href) + '?authuser=' + authuser + '&hl=en'
  var fetchInit = {
    method: 'GET',
    headers: {
      'Accept': 'text/html',
      'Content-Type': 'text/html'
    },
    cache: 'default'
  }
  try {
    var response = await fetch(testingProgramLink, fetchInit)
  } catch {
    console.log('No testing program detected, or user is logged out. Removing testing program button.')
    testingButton.remove()
    return
  }
  if (!response.ok) {
    console.log('No testing program detected, or user is logged out. Removing testing program button.')
    testingButton.remove()
    return
  }
  // Process testing program data
  var data = await response.text()
  console.log('Received response from app testing page: ' + testingProgramLink)
  // Create a beta test message
  if (data.includes('You are a tester')) {
    testingButton.innerHTML = '<button>Enrolled in beta</button>'
    tippy(testingButton, {
      content: 'You are enrolled in the testing program for this app'
    })
    testingButton.classList.add('testing-enabled-button')
  } else if (data.includes('Become a tester')) {
    testingButton.innerHTML = '<button>Join beta</button>'
    testingButton.classList.add('testing-enabled-button')
    tippy(testingButton, {
      content: 'Testing program available'
    })
  } else {
    testingButton.innerHTML = '<button>No beta</button>'
    tippy(testingButton, {
      content: 'Testing program not available for this Google account'
    })
  }
}

// Function for injecting language dropdowns
async function insertSiteElements() {
  // Cancel if dropdowns are present
  if (!!document.querySelector('.toolbox-language-select,.toolbox-region-select')) {
    return
  }
  // Get stored settings
  var data = await new Promise(function (resolve, reject) {
    chrome.storage.local.get({
      settings: {
        apkmirror: true,
        androidpolice: true,
        appbrain: true,
        testing: true,
        screenshot: true,
        regionSwitching: true
      }
    }, async function (data) {
      resolve(data)
    })
  })
  // Insert language and region dropdowns if enabled in settings
  if (data.settings.regionSwitching === true) {
    // Create language dropdown
    var langSelect = document.createElement('select')
    langSelect.className = 'toolbox-language-select'
    tippy(langSelect, {
      content: 'Play Store language'
    })
    // Add option for default language
    var defaultOption = document.createElement('option')
    defaultOption.innerText = 'Default language'
    defaultOption.value = 'lang-reset'
    langSelect.appendChild(defaultOption)
    // Add option for every item in storeLanguages
    storeLanguages.forEach(function (language) {
      var option = document.createElement('option')
      option.setAttribute('value', language[1])
      option.innerText = language[0]
      langSelect.appendChild(option)
    })
    // Create region dropdown
    var regionSelect = document.createElement('select')
    regionSelect.className = 'toolbox-region-select'
    tippy(regionSelect, {
      content: 'Play Store country/region'
    })
    // Add option for default region
    var defaultRegion = document.createElement('option')
    defaultRegion.innerText = 'Default region'
    defaultRegion.value = 'region-reset'
    regionSelect.appendChild(defaultRegion)
    // Add option for every item in storeRegions
    storeRegions.forEach(function (region) {
      var option = document.createElement('option')
      option.setAttribute('value', region[1])
      option.innerText = region[0]
      regionSelect.appendChild(option)
    })
    // Inject dropdowns
    if (getSiteDesign() === 'old-desktop') {
      var langContainer = document.querySelector('div[role="navigation"] div div:nth-child(6)')
    } else if (getSiteDesign() === 'old-mobile') {
      var langContainer = document.querySelector('c-wiz[jsrenderer="UsuzQd"]')
    } else if (getSiteDesign() === 'new-unified') {
      var langContainer = document.createElement('div')
    }
    // Inject container
    var siteControls = document.createElement('div')
    siteControls.classList.add('toolbox-extension-site-controls')
    siteControls.append(langSelect, regionSelect)
    if (getSiteDesign() === 'old-desktop') {
      var langContainer = document.querySelector('div[role="navigation"] div div:nth-child(6)')
      langContainer.append(siteControls)
    } else if (getSiteDesign() === 'old-mobile') {
      var langContainer = document.querySelector('c-wiz[jsrenderer="UsuzQd"]')
      langContainer.append(siteControls)
    } else if (getSiteDesign() === 'new-unified') {
      document.body.append(siteControls)
    }
    // Select active language
    if (getActiveLanguage() === null) {
      langSelect.value = 'lang-reset'
    } else if (getActiveLanguage() === 'en') {
      // Fix for Google using 'en-US' and 'en' interchangeably
      langSelect.value = 'en-US'
    } else {
      langSelect.value = getActiveLanguage()
    }
    // Select active region
    if (getActiveRegion() === null) {
      regionSelect.value = 'region-reset'
    } else {
      regionSelect.value = getActiveRegion()
    }
    // Change language when the select changes
    langSelect.addEventListener('change', function () {
      var url = new URL(document.location.toString())
      if (langSelect.value === 'lang-reset') {
        url.searchParams.delete('hl')
      } else {
        url.searchParams.set('hl', langSelect.value)
      }
      document.location = url.href
    })
    // Change region when the select changes
    regionSelect.addEventListener('change', function () {
      var url = new URL(document.location.toString())
      if (regionSelect.value === 'region-reset') {
        url.searchParams.delete('gl')
      } else {
        url.searchParams.set('gl', regionSelect.value)
      }
      document.location = url.href
    })
  }
}

// Function for injecting app listing buttons, improved screenshot gallery, etc.
async function insertAppElements() {
  // Set helpful variables
  const containerEl = getActiveContainer()
  const packageName = getParameterByName('id', window.location.href)
  // Cancel if buttons are already present
  if (!!containerEl.querySelector('.toolbox-extension-container')) {
    return
  }
  // Inject the container
  var buttonContainer = document.createElement('div')
  buttonContainer.className = 'toolbox-extension-container'
  buttonContainer.dataset.package = packageName
  if (getSiteDesign() === 'new-unified') {
    // Inject the buttons
    var parentContainer = containerEl.querySelector('c-wiz[autoupdate]').parentNode.parentNode.parentNode
    parentContainer.prepend(buttonContainer)
  } else if (getSiteDesign() === 'old-mobile') {
    var parentContainer = containerEl.querySelector('main c-wiz:nth-child(1) c-wiz:nth-child(1) div:nth-child(1) div:nth-child(1)')
    parentContainer.append(buttonContainer)
  } else if (getSiteDesign() === 'old-desktop') {
    // This is the DIV that contains the app name, rating, rating, etc
    // Visual aid: https://i.imgur.com/CkY1rRp.png
    var parentContainer = containerEl.querySelector('main c-wiz:nth-child(1) c-wiz:nth-child(1) div:nth-child(1) div:nth-child(2)')
    parentContainer.append(buttonContainer)
  }
  // Get stored settings
  var data = await new Promise(function (resolve, reject) {
    chrome.storage.local.get({
      settings: {
        apkmirror: true,
        androidpolice: true,
        appbrain: true,
        testing: true,
        screenshot: true,
        regionSwitching: true
      }
    }, async function (data) {
      resolve(data)
    })
  })
  // Add shortcut for extension settings, but only if it's not already there, and only for mobile
  if ((getSiteDesign() === 'old-mobile') && (!(containerEl.querySelector('.toolbox-settings-toolbar')))) {
    // Create shortcut element
    var settingsDiv = document.createElement('div')
    settingsDiv.className = 'toolbox-settings-toolbar'
    var SettingsDivContent = document.createTextNode('Toolbox extension settings »')
    settingsDiv.appendChild(SettingsDivContent)
    // Insert shortcut element
    containerEl.prepend(settingsDiv)
    // Open settings when the shortcut DIV is tapped
    settingsDiv.addEventListener('click', function () {
      window.open(chrome.extension.getURL('settings.html'))
      return false
    })
    console.log('Inserted extension settings shortcut.')
  }
  // Insert Appbrain button if enabled in settings
  if (data.settings.appbrain === true) {
    var appBrainButton = document.createElement('span')
    appBrainButton.className = 'toolbox-extension-button appbrain-button'
    appBrainButton.innerHTML = '<button>AB</button>'
    tippy(appBrainButton, {
      content: 'Open ' + getAppName() + ' on Appbrain'
    })
    buttonContainer.appendChild(appBrainButton)
    // Open app in Appbrain when Appbrain button is clicked
    appBrainButton.addEventListener('click', function () {
      window.open('http://www.appbrain.com/app/' + getParameterByName('id', window.location.href))
    })
  }
  // Insert Android Police button if enabled in settings
  if (data.settings.androidpolice === true) {
    var apButton = document.createElement('span')
    apButton.className = 'toolbox-extension-button ap-button'
    apButton.innerHTML = '<button>AP</button>'
    tippy(apButton, {
      content: 'Search for ' + getAppName() + ' on Android Police'
    })
    buttonContainer.appendChild(apButton)
    // Search for the app on Android Police when the AP button is clicked
    apButton.addEventListener('click', function () {
      window.open('https://www.androidpolice.com/search/' + getAppName())
    })
  }
  // Insert APKMirror button
  if (data.settings.apkmirror === true) {
    var apkMirrorButton = document.createElement('span')
    apkMirrorButton.className = 'toolbox-extension-button apkmirror-button'
    var apkTippy = tippy(apkMirrorButton, {
      allowHTML: true,
      content: 'Checking ' + getAppName() + ' on APKMirror...'
    })
    apkMirrorButton.innerHTML = '<button>Loading...</button>'
    buttonContainer.appendChild(apkMirrorButton)
    // Search for the app on APKMirror when the APKM button is clicked
    apkMirrorButton.addEventListener('click', function () {
      window.open('https://www.apkmirror.com/?s="' + getParameterByName('id', window.location.href) + '"&post_type=app_release&searchtype=apk')
    })
    // Obtain app information from APKMirror API or cache
    var appData = await getAppInfo(packageName)
    if (Object.keys(appData).length === 0) {
      // Could not retrieve app info, so just display the button as enabled
      apkMirrorButton.classList.add('apkmirror-enabled-button')
      apkMirrorButton.innerHTML = '<button>APKM</button>'
      apkTippy.setContent('Search for ' + getAppName() + ' on APKMirror')
    } else {
      if (appData.exists === true) {
        // App exists on APKM
        apkMirrorButton.classList.add('apkmirror-enabled-button')
        apkMirrorButton.innerHTML = '<button>APKM</button>'
        apkMirrorButton.title = ''
        apkUploadDate = appData.release.publish_date.split(' ')[0]
        // If version number is present in results, show it
        if (appData.release.downloads) {
          // Remove commas from the result
          var roundedDownloads = appData.release.downloads.replace(',', '')
          // Shorten number (e.g. "1,500" becomes "1.5K")
          roundedDownloads = intToString(roundedDownloads)
          // Update tooltip
          apkTippy.setContent('<div align="center"><b>' + appData.release.version + ' (' + apkUploadDate + ')</b><br>' + roundedDownloads + ' downloads</div>')
        } else {
          // Update tooltip without download count
          apkTippy.setContent(appData.release.version + ' (' + apkUploadDate + ')')
        }
      } else {
        // App does not exist on APKM
        apkMirrorButton.innerHTML = '<button>APKM</button>'
        apkTippy.setContent(getAppName() + ' is not available on APKMirror')
      }
    }
  }
  // Add screenshot gallery scrollbar and keyboard shortcuts if Better screenshot gallery is enabled in settings
  // This is disabled on the mobile Play Store
  if (data.settings.screenshot === true) {
    if (getSiteDesign() === 'old-desktop') {
      // Add scrollbar to inline gallery when it is added to the DOM
      // This has to be a forEach function to work on subsequent page navigations (because the previous screenshot gallery is still in the DOM)
      var waitForScreenshotGallery = setInterval(function () {
        if (containerEl.querySelector('div[data-slideable-portion-heuristic-width]')) {
          clearInterval(waitForScreenshotGallery)
          // The screenshot gallery should be the second child DIV in the div[data-slideable-portion-heuristic-width] container
          var screenshotContainer = containerEl.querySelectorAll('div[data-slideable-portion-heuristic-width]:first-of-type div:not([jsaction])')[1]
          screenshotContainer.classList.add('toolbox-extension-gallery')
          console.log('Better screenshot gallery is enabled.')
          // Hide left navigation arrow
          var leftScreenshotButton = containerEl.querySelectorAll('div[data-slideable-portion-heuristic-width]:first-of-type div')[0]
          leftScreenshotButton.style.visibility = 'hidden'
          // Hide right navigation arrow
          var rightScreenshotButtonSelector = containerEl.querySelectorAll('div[data-slideable-portion-heuristic-width]:first-of-type div')
          var rightScreenshotButton = rightScreenshotButtonSelector[rightScreenshotButtonSelector.length - 2] // The DIV for the right sreenshot button is the second element from the end of the querySelector
          rightScreenshotButton.style.visibility = 'hidden'
        }
      }, 100)
    } else if (getSiteDesign() === 'new-unified') {
      containerEl.classList.add('toolbox-extension-gallery-enabled')
    }
  }
  // If the testing program option is enabled in settings, insert the button for it
  if (data.settings.testing === true) {
    var testingButton = document.createElement('span')
    testingButton.className = 'toolbox-extension-button testing-button'
    testingButton.innerHTML = '<button>Loading...</button>'
    buttonContainer.appendChild(testingButton)
    // Perform network request for beta page
    console.log('Injected beta program button, waiting for Fetch response.')
    checkTestingProgram(testingButton)
  }
}

// Function for injecting info on app list pages (e.g. developer pages)
function insertListElements() {
  var apps = document.querySelectorAll('a[href*="apps/details"] > div[title]')
  // Inject list elements for each app card
  apps.forEach(async function (appEl) {
    var packageName = getParameterByName('id', appEl.parentNode.href)
    // Fix height on app cards
    // This code looks horrible but we want to avoid using IDs/classes to avoid breaking with Play Store site updates
    appEl.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.style.height = 'auto'
    // Create main container
    var container = document.createElement('div')
    container.className = 'toolbox-extension-app-card-container'
    container.innerText = 'hello!!!'
    var parentContainer = appEl.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode
    // Get APKMirror info
    var appData = await getAppInfo(packageName)
    if (appData.exists === true) {
      // Remove commas from the result
      var roundedDownloads = appData.release.downloads.replace(',', '')
      // Shorten number (e.g. "1,500" becomes "1.5K")
      roundedDownloads = intToString(roundedDownloads)
      // Create main link
      container.innerHTML = '<a href="https://www.apkmirror.com/?s=' + packageName + '&post_type=app_release&searchtype=apk" target="_blank">Download on APKMirror<br>v' + appData.release.version + '<br>' + roundedDownloads + ' downloads</a>'
    } else {
      container.innerHTML = 'Not available on APKMirror'
    }
    // Inject everything
    parentContainer.append(container)
  })
}

function mainInjection() {
  // Check if app buttons are present
  var appButtonsExist = !!getActiveContainer().querySelector('.toolbox-extension-container')
  var appElementsReady = (ifAppPage() && (!(appButtonsExist)))
  if (appElementsReady) {
    console.log('Injecting app elements...')
    insertAppElements()
  }
  // Check if everything else (e.g. language/region dropdowns) is present
  var siteElementsExist = !!document.querySelector('.toolbox-extension-site-controls')
  var siteElementsReady = (!(siteElementsExist))
  if (siteElementsReady) {
    console.log('Injecting site elements...')
    insertSiteElements()
  }
  // Check if buttons for app listings are visible (WIP)
  /*
  var appListElementsExist = !!document.querySelector('.toolbox-extension-app-card-container')
  var siteElementsReady = (!(appListElementsExist))
  if (ifAppListPage() && siteElementsReady) {
    console.log('Injecting list elements...')
    insertListElements()
  }
  */
}

// Run injection code
function pageInit() {
  // Add class to <body>
  if (getSiteDesign() === 'old-mobile') {
    document.body.classList.add('toolbox-extension-mobile-site')
  } else if (getSiteDesign() === 'new-unified') {
    document.body.classList.add('toolbox-extension-unified-site')
  } else if (getSiteDesign() === 'old-desktop') {
    document.body.classList.add('toolbox-extension-old-desktop-site')
  }
  // Inject elements
  if (getActiveContainer() !== null) {
    mainInjection()
  } else {
    // If the container doesn't exist, wait for it to be added to the DOM
    var waitForContainer = setInterval(function () {
      if (getActiveContainer() !== null) {
        clearInterval(waitForContainer)
        // Inject elements
        mainInjection()
      }
    }, 1000)
  }
}

// Run code after initial page has finished loading
pageInit()

// Create a MutationObserver to run insertAppElements() whenever the Play Store loads a new app page
var pageobserver = new MutationObserver(function (mutations) {
  var previousPageTitle = ''
  mutations.forEach(function (mutation) {
    // Only proceed if the title has actually changed, instead of just the same content being re-injected
    if (previousPageTitle != mutation.target.innerText) {
      previousPageTitle = mutation.target.innerText
      console.log('Detected a page change.')
      mainInjection()
    } else {
      console.log('Detected a page change, but it is the same page.')
    }
  })
})

// Set the MutationObserver to the <title> tag (which changes whenever the app page does)
pageobserver.observe(document.querySelector('title:first-of-type'), {
  characterData: false,
  attributes: false,
  childList: true,
  subtree: false
})