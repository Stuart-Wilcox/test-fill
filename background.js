const initialState = {
    countSettings: 10,
    replacementSettings: {
        text: 0,
        select: 0,
        email: 0,
        checkbox: 0,
        radio: 0,
    },
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