// wrap in function to avoid
// altering surrounding context
(function() {
    console.log('CONTENT SCRIPT')

    const runtime = browser ? browser.runtime : chrome.runtime;

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
        console.log(inputs);

        const inputMap = inputs.reduce((inputMap, input) => {
            inputMap[input.name] = input.value;
            return inputMap;
        }, {});
        console.log(inputMap);
        const inputNames = inputs.map(input => input.name).join('');
        console.log(inputNames);
        const inputNamesHashCode = hashCode(inputNames);

        return {
            inputNamesHashCode,
            inputMap,
        };
    };

    /**
     * Searches the document for all the inputs and applies their values from the map
     * @param {{ [string]: string }} inputMap The map of name - value for all the page's inputs
     */
    const applyPageInputs = async (name) => {
        // TODO get inputMap from named save
        const inputMap = {};

        const inputs = document.querySelectorAll('input');

        // loop through all inputs and set their value from the map
        for (const input of inputs) {
            // find the input name in the map
            const inputValue = inputMap[input.name] || '';
            input.value = inputValue;
        }
    };

    /**
     * Searches the document for all the inputs and saves their values
     * @param { string } name The name to save the input state under
     */
    const savePageInputs = async (name) => {
        const {
            inputNamesHashCode,
            inputNames,
        } = scanPageForInputs();

        // TODO save this somewhere
        // under name => { hash, inputMap }
    };

    /**
     * Searches for the saved inputs for this page
     * @return { Array<{ name: string, value: string }> } The list of name-value pairs 
     */
    const getSavedPageInputs = async () => {
        // TODO read from saved place
        return [];
    };

    // hook up event listeners
    runtime.onMessage.addListener((message, sender, sendResponse) => {
        switch (message.type) {
            case 'GET_SAVED_PAGE_INPUTS': {
                getSavedPageInputs().then(response => {
                    sendResponse(response);
                });
                break;
            }
            case 'SAVE_PAGE_INPUTS': {
                const name = message.payload;
                savePageInputs(name).then(response => {
                    sendResponse(response);
                })
                break;
            }
            case 'APPLY_PAGE_INPUTS': {
                const name = message.payload;
                applyPageInputs(name).then(response => {
                    sendResponse(response);
                })
                break;
            }
            default: {
                sendResponse('Not found');
                return;
            }
        }
    });
})();
