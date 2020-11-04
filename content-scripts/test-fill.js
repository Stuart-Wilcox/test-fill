// wrap in function to avoid
// altering surrounding context
(function() {
    // only run once
    if (window.__hasTestFillInit) {
        return;
    }
    window.__hasTestFillInit = true;

    console.log('Running Test-Fill (V2)');

    let runtime;
    try {
        if (browser) {
            runtime = browser.runtime;
        }
    }
    catch (error) {
        runtime = chrome.runtime;
    }

    /** 
     * Get hash from a string
     * @param { string } s Input string
     * @return { number } Hash results
     */
    const hashCode = s => s.split('').reduce((a, b) => (((a << 5) - a) + b.charCodeAt(0)) | 0, 0);

    /**
     * Searches the document for all inputs and copies their names and values
     * @return {
     *  inputNamesHashCode: { string } The hash code of the page's inputs
     *  inputMap: {{ [string]: string }}  The map of name - value for all the page's inputs   
     * }
     */
    const scanPageForInputs = () => {
        // get all the inputs on the page
        const inputs = Array.from(document.querySelectorAll('input'));

        const inputMap = inputs.reduce((inputMap, input) => {
            inputMap[input.name] = input.value;
            return inputMap;
        }, {});
        const inputNames = inputs.map(input => input.name).join('');
        const inputNamesHashCode = hashCode(inputNames);

        return {
            inputNamesHashCode,
            inputMap,
        };
    };

    /**
     * Returns the hashcode for this page
     */
    const getHashCode = () => {
        // get all the inputs on the page
        const inputs = Array.from(document.querySelectorAll('input'));
        const inputNames = inputs.map(input => input.name).join('');
        const inputNamesHashCode = hashCode(inputNames);
        return `${inputNamesHashCode}`;
    }

    /**
     * Applies the given name-value pairs for inputs to the page
     * @param { Array<{ name: string, value: string }> } inputs The array of inputs to apply
     */
    const applyPageInputs = async (inputValues) => {
        // create map for lookup
        const inputMap = inputValues.reduce((acc, curr) => {
            acc[curr.name] = curr.value;
            return acc;
        }, {});

        const inputs = document.querySelectorAll('input');

        // loop through all inputs and set their value from the map
        for (const input of inputs) {
            // find the input name in the map
            const inputValue = inputMap[input.name] || '';
            input.value = inputValue;
        }
    };

    /**
     * Searches for the saved inputs for this page
     * @return { Array<{ name: string, value: string }> } The list of name-value pairs 
     */
    const getPageInputsAndValues = () => {
        const inputs = Array.from(document.querySelectorAll('input'));
        return inputs.map(input => {
            return {
                name: input.name,
                value: input.value,
            };
        });
    };

    /**
     * Gets the current page url
     * @return { string }
     */
    const getCurrentPageUrl = () => {
       return window.location.href; 
    };

    // hook up event listeners
    runtime.onMessage.addListener((message, sender, sendResponse) => {
        // console.log('Message received', message, sender);
        switch (message.type) {
            case 'GET_PAGE_INPUTS_AND_VALUES': {
                const pageInputsAndValues = getPageInputsAndValues()
                sendResponse(pageInputsAndValues);
                break;
            }
            case 'APPLY_PAGE_INPUTS': {
                const inputValues = message.payload;
                applyPageInputs(inputValues).then(response => {
                    if (runtime.lastError) {
                        console.error(runtime.lastError);
                    }
                    sendResponse(response);
                }).catch(error => {
                    console.warn(error);
                });
                break;
            }
            case 'GET_HASHCODE': {
                const hashCode = getHashCode();   
                sendResponse(hashCode);
                break;
            }
            case 'GET_PAGE_URL': {
                const pageUrl = getCurrentPageUrl();
                sendResponse(pageUrl);
                break;
            }
            default: {
                sendResponse('Not found');
                return;
            }
        }
    });
})();
