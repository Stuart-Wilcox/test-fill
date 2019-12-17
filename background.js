const initialState = {
    count: 0,
};

// initialize context
chrome.storage.local.get(['state'], state => {
    if(!state && !Object.keys(state).length) {
        chrome.storage.local.set({ state: initialState });
    }
});

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ state: initialState });
});