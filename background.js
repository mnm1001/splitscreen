chrome.browserAction.onClicked.addListener(() => {
  chrome.windows.create({
    url: chrome.runtime.getURL("index.html"),
    type: "panel",
    focused: true,
    /* can also set width/height here, see docs */
  });
})