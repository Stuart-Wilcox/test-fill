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
     * Get the given input's value
     * @param {HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement} input
     */
    const getInputValue = (input) => {
        if (input.type === 'checkbox') {
            return input.checked;
        }
        else if (input.type === 'radio') {
            return input.checked ? input.name : null;
        }
        else if (input.tagName === 'textarea') {
            return input.innerText;
        }
        else {
            return input.value || '';
        }
    };

    /**
     * Sets the given input's value
     * @param {HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement} input
     * @param {string} value
     */
    const setInputValue = (input, value) => {
        
        if (input.type === 'checkbox') {
            input.checked = value;
        }
        else if (input.type === 'radio') {
            input.checked = input.name === value;
        }
        else if (input.tagName === 'textarea') {
            input.innerText = value;
        }
        else {
            input.value = value;
        }
    };

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

        const inputs = document.querySelectorAll('input,textarea,select');
        const notFoundInputValues = new Set(Object.keys(inputMap));
        const notFoundInputs = [];

        // loop through all inputs and set their value from the map
        for (const input of inputs) {
            // find the input name in the map
            if (input.name in inputMap) {
                const inputValue = inputMap[input.name];

                setInputValue(input, inputValue);
                notFoundInputValues.delete(input.name);
            }
            // see if matched by id
            else if (input.id in inputMap){
                const inputValue = inputMap[input.id];

                setInputValue(input,  inputValue);
                notFoundInputValues.delete(input.id);
            }
            else {
                notFoundInputs.push(input);
            }
        }

        // apply the remaining not found inputs in order
        const notFoundInputValuesList = Array.from(notFoundInputValues);
        for (const input of notFoundInputs) {
            // get first value from not used list and set it for input value
            setInputValue(input, notFoundInputValuesList.shift());
        }
    };

    /**
     * Searches for the saved inputs for this page
     * @return { Array<{ name: string, value: string }> } The list of name-value pairs 
     */
    const getPageInputsAndValues = () => {
        const inputs = Array.from(document.querySelectorAll('input,textarea,select'));
        return inputs.map(input => {
            const name = input.name || input.id;
            const value = getInputValue(input);

            if (value !== null) {
                return {
                    name,
                    value,
                };
            }

            return null;
        }).filter(input => input !== null);
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
            default: {
                sendResponse('Not found');
                return;
            }
        }
    });
})();
