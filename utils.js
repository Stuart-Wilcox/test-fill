const UTILS = (function(){
    /* ===== MAIN ===== */
    const UTILS = {
        getSettings: async (callback) => {
            return new Promise(resolve => {
                chrome.storage.local.get(['state'], ({state}) => {
                    if (callback) {
                        callback(state);
                    }
                    resolve(state);
                });
            });
        },

        updateReplacementSettings: async (replacementSettings, callback) => {
            return new Promise(resolve => {
                chrome.storage.local.get(['state'], ({state}) => {
                    const newState = {
                        ...state,
                        replacementSettings,
                    };

                    chrome.storage.local.set({ state: newState }, () => {
                        if (callback) {
                            callback(newState);
                        }
                        resolve(newState);
                    });
                });
            })
        },

        resetCount: async (callback) => {
            return new Promise(resolve => {
                chrome.storage.local.get(['state'], ({state}) => {
                    const newState = {
                        ...state,
                        countSettings: 0,
                    };
        
                    chrome.storage.local.set({ state: newState }, () => {
                        if (callback) {
                            callback(newState);
                        }
                        resolve(newState);
                    });
                });
            });
        },

        incrementCount: async (callback) => {
            return new Promise(resolve => {
                chrome.storage.local.get(['state'], ({state}) => {
                    const newState = {
                        ...state,
                        countSettings: state.countSettings + 1,
                    };

                    chrome.storage.local.set({ state: newState }, () => {
                        if (callback) {
                            callback(newState)
                        }
                        resolve(newState);
                    });
                });
            })
        },

        /**
         * Return selectionState in callback
         */
        getSelectState: async (callback) => {
            return new Promise(resolve => {
                chrome.storage.local.get(['state'], ({ state }) => {
                    const {
                        selectionState={
                            firstClickPos: null,
                            secondClickPos: null,
                        },
                    } = state;

                    if (callback) {
                        callback(selectionState)
                    }
                    resolve(selectionState);
                });
            });
        },

        /**
         * Update the selection state, return new selectionState in callback
         */
        setSelectState: async (selectionState, callback) => {
            return new Promise(resolve => {
                chrome.storage.local.get(['state'], ({ state }) => {
                    const newState = {
                        ...state,
                        selectionState: selectionState,
                    };

                    chrome.storage.local.set({ state: newState }, () => {
                        if (callback) {
                            callback(newState)
                        }
                        resolve(newState);
                    });
                });
            });
        },
    };

    return UTILS;
})();