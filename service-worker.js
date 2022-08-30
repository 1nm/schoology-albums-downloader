chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    changeInfo.status === 'complete' &&
    /schoology.com\/album\/[0-9]+/.test(tab.url)
  ) {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['utils/jszip.min.js']
    });
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['utils/jszip-utils.min.js']
    });
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['utils/FileSaver.min.js']
    });
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['inject.js']
    });
  }
});
