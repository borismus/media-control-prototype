var manager = new MediaFocusManager({
  onPlayingChanged: onPlayingChanged,
  onFocusChanged: onFocusChanged
});

// Build the tab switcher.
function switchTab(tabName) {
  // Set the tab to be active.
  var tabs = document.querySelectorAll('#tab-strip > *');
  for (var i = 0; i < tabs.length; i++) {
    var tab = tabs[i];
    if (tab.classList.contains(tabName)) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  }
  manager.didChangeTabs(tabName);
  // Tweak the visibility of the tab content.
  showTabContent(tabName);
}

function showTabContent(tabName) {
  var allContent= document.querySelectorAll('#tab-content > *');
  for (var i = 0; i < allContent.length; i++) {
    var content = allContent[i];
    var contentId = tabName;
    if (content.classList.contains(tabName)) {
      content.classList.add('visible');
    } else {
      content.classList.remove('visible');
    }
  }
}

function closeTab(tabName) {
  console.log('Closing', tabName);
  var tab = document.querySelector('#tab-strip .' + tabName);
  tab.parentElement.removeChild(tab);

  // Notify that the active tab changed.
  var remaining = getRemainingTab();
  if (remaining) {
    switchTab(remaining);
  } else {
    window.location.reload();
  }
  // Notify that the tab closed.
  manager.didCloseTab(tabName);
}

// Show tab as playing (or not).
function setPlaying(tabName, isPlaying) {
  // Find the tab.
  var tab = document.querySelector('#tab-strip .' + tabName);
  if (isPlaying) {
    tab.classList.add('playing');
  } else {
    tab.classList.remove('playing');
  }
}

// Show tab as having media focus
function setFocused(tabName) {
  // Get all tabs.
  var tabs = document.querySelectorAll('#tab-strip > *');
  for (var i = 0; i < tabs.length; i++) {
    var tab = tabs[i];
    if (tab.classList.contains(tabName)) {
      tab.classList.add('focused');
    } else {
      tab.classList.remove('focused');
    }
  }
}


switchTab('google');

function onFocusChanged(newFocus) {
  setFocused(newFocus.name);
}

function onPlayingChanged() {
  console.log('onPlayingChanged');
  var tabs = manager.tabs;
  for (var tabId in tabs) {
    var tab = tabs[tabId];
    setPlaying(tab.name, tab.isPlaying());
  }
}

function getRemainingTab() {
  var tabs = document.querySelectorAll('#tab-strip > *');
  return (tabs.length > 0 ? tabs[0].dataset.name : null);

}

window.addEventListener('keydown', function(e) {
  var handled = false;
  switch (e.keyCode) {
    case 32: // Space
      manager.handleMediaPlayPause();
      handled = true;
      break;
    case 78: // n
      manager.handleMediaNext();
      handled = true;
      break;
    case 80: // p
      manager.handleMediaPrev();
      handled = true;
      break;
  }
  if (handled) {
    e.preventDefault();
  }
});

// Hook up events to the tab strip.
var tabs = document.querySelectorAll('#tab-strip > *');
for (var i = 0; i < tabs.length; i++) {
  var tab = tabs[i];
  var nameEl = tab.querySelector('.name');
  nameEl.addEventListener('click', function(e) {
    if (e.target == e.currentTarget) {
      var tabName = e.target.parentNode.dataset.name;
      switchTab(tabName);
    }
  });
  // Hook up close button.
  var close = tab.querySelector('.close');
  close.addEventListener('click', function(e) {
    var tabName = e.target.parentNode.dataset.name;
    closeTab(tabName);
    e.preventDefault();
  }, true);
}
