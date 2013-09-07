function MediaFocusManager(params) {
  var tabs = {};
  tabs['google'] = new TabInfo({
    name: 'google',
    manager: this
  });
  tabs['rdio'] = new TabInfo({
    name: 'rdio',
    stream: document.querySelector('#rdio-stream'),
    manager: this
  });
  tabs['youtube'] = new TabInfo({
    name: 'youtube',
    stream: document.querySelector('#youtube-stream'),
    manager: this
  });
  tabs['pandora'] = new TabInfo({
    name: 'pandora',
    stream: document.querySelector('#pandora-stream'),
    manager: this
  });
  tabs['download'] = new TabInfo({
    name: 'download'
  });
  this.tabs = tabs;
  this.activeTab = 'google';

  this.mediaFocusStack = [];

  this.onPlayingChanged = params.onPlayingChanged;
  this.onFocusChanged = params.onFocusChanged;

  this.SKIP_AMOUNT = 10;
}

MediaFocusManager.prototype.didChangeTabs = function(tabId) {
  this.activeTab = tabId;
};

MediaFocusManager.prototype.didCloseTab = function(tabId) {
  if (this.activeTab == tabId) {
    // Get the next tab.
  }
  var tab = this.tabs[tabId];
  // If the closed tab was playing, stop playback.
  if (tab.isPlaying()) {
    tab.playPause();
  }

  // Update the mediaFocusStack.
  var index = this.mediaFocusStack.indexOf(tab);
  delete this.tabs[tabId];
  if (index >= 0) {
    this.mediaFocusStack.splice(index, 1);
    // Callback that focus changed.
    this.callback_(this.onFocusChanged, this.getMediaFocusTab_());
  }
};

MediaFocusManager.prototype.handleMediaPlayPause = function() {
  var playing = this.getPlayingTabs_();
  if (playing.length > 0) {
    // Special case: if tabs are already playing, they must be paused.
    for (tabId in playing) {
      playing[tabId].playPause();
    }
    // Only then, change media focus.
    this.handleMediaEvent_();
  } else {
    // Otherwise, change media focus first.
    this.handleMediaEvent_();
    var focusTab = this.getMediaFocusTab_();
    focusTab.playPause();
  }
  // The playing change event will be called by the playPause() event.
  //this.callback_(this.onPlayingChanged);
};

MediaFocusManager.prototype.handleMediaNext = function() {
  this.handleMediaEvent_();
  var focusTab = this.getMediaFocusTab_();
  if (focusTab) {
    focusTab.stream.currentTime += this.SKIP_AMOUNT;
  }
};

MediaFocusManager.prototype.handleMediaPrev = function() {
  this.handleMediaEvent_();
  var focusTab = this.getMediaFocusTab_();
  if (focusTab) {
    focusTab.stream.currentTime -= this.SKIP_AMOUNT;
  }
};

MediaFocusManager.prototype.handleMediaEvent_ = function() {
  // If the foreground tab has a stream in it, set media focus.
  var fg = this.getForegroundTab_()
  if (fg.stream) {
    this.setMediaFocus_(fg);
  }
};

MediaFocusManager.prototype.setMediaFocus_ = function(tab) {
  // If already on the top of the stack, do nothing.
  if (this.mediaFocusStack.length > 0 && 
      this.mediaFocusStack[this.mediaFocusStack.length - 1] == tab) {
    return;
  }
  // If already in the stack, get rid of it.
  var index = this.mediaFocusStack.indexOf(tab);
  if (index >= 0) {
    this.mediaFocusStack.splice(index, 1)
  }
  // Otherwise, put it on top.
  this.mediaFocusStack.push(tab);
  // Notify that media focus changed.
  this.callback_(this.onFocusChanged, this.getMediaFocusTab_());
};

MediaFocusManager.prototype.getMediaFocusTab_ = function() {
  var topTab = null;
  if (this.mediaFocusStack.length > 0) {
    topTab = this.mediaFocusStack[this.mediaFocusStack.length - 1];
  } else {
    topTab = this.getFirstMediaTab_();
    if (topTab) {
      this.setMediaFocus_(topTab);
    } else {
      return null;
    }
  }
  // Get the tab name from the top of the stack.
  return topTab;
};

MediaFocusManager.prototype.getForegroundTab_ = function() {
  return this.tabs[this.activeTab];
};

MediaFocusManager.prototype.getPlayingTabs_ = function() {
  var out = [];
  for (var tabId in this.tabs) {
    var tab = this.tabs[tabId];
    if (tab.isPlaying()) {
      out.push(tab);
    }
  }
  return out;
};

MediaFocusManager.prototype.getFirstMediaTab_ = function() {
  for (var tabId in this.tabs) {
    var tab = this.tabs[tabId];
    if (tab.stream) {
      return tab;
    }
  }
  return null;
};

MediaFocusManager.prototype.callback_ = function(cb, params) {
  if (cb) {
    cb(params);
  }
};

MediaFocusManager.prototype.didPlayStateChange = function() {
  this.callback_(this.onPlayingChanged);
  this.handleMediaEvent_();
}

function TabInfo(params) {
  this.name = params.name;
  this.stream = params.stream;
  this.manager = params.manager;

  if (this.stream && this.manager) {
    this.stream.addEventListener('play', this.manager.didPlayStateChange.bind(this.manager));
    this.stream.addEventListener('pause', this.manager.didPlayStateChange.bind(this.manager));
  }
}

TabInfo.prototype.playPause = function() {
  if (!this.stream) {
    return;
  }
  if (this.isPlaying()) {
    console.log('Paused', this.name);
    this.stream.pause();
  } else {
    console.log('Playing', this.name);
    this.stream.play();
  }
};

TabInfo.prototype.isPlaying = function() {
  if (!this.stream) {
    return false;
  }
  return !this.stream.paused;
};
