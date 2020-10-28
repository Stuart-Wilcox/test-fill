(function(){

/***** TABS *****/
class Tabs {
    static get tabs() {
        let _tabs;
        try {
            if (tabs) {
                _tabs = tabs;
            }
        }
        catch (error) {
            _tabs = chrome.tabs;
        }
        finally {
            return _tabs;
        }
    }

    static async getCurrentTab() {
        return new Promise((resolve, reject) => {
            Tabs.tabs.query({ active: true, currentWindow: true }, tabs => {
                if (Service.runtime.lastError) {
                    reject(Service.runtime.lastError);
                    return;
                }
                if (tabs[0]) {
                    resolve(tabs[0]);
                }
                else {
                    reject(new Error('Tab matching query not found'));
                }
            });
        });
    }

    static async executeScript(script) {
        const tab = await Tabs.getCurrentTab();
        return new Promise((resolve, reject) => {
            Tabs.tabs.executeScript(tab.id, script, (results) => {
                if (Service.runtime.lastError) {
                    reject(Service.runtime.lastError);
                }
                else {
                    resolve(results);
                }
            });
        });
    }
}

/***** STORE *****/
class Store {
    static get storage() {
        let _storage;
        try {
            if (storage) {
                _storage = storage;
            }
        }
        catch (error) {
            _storage = chrome.storage;
        }
        finally {
            return _storage;
        }
    }

    constructor() {

    }

    /**
     * Saves the input name-value pairs under the given name
     * @param { string } hashCode
     * @param { string } name 
     * @param { Promise<Array<{ name: string, value: string }>> } inputs 
     */
    async savePageInputs(hashCode, name, inputs) {
        console.log('Saving page inputs', hashCode, name, inputs);

        // get everything in storage already
        console.log('Retrieving current page inputs')
        const savedPageInputs = (await this.getSavedPageInputs(hashCode)) || {};
        console.log('Retrieved results', savedPageInputs);
        savedPageInputs[name] = inputs;
        console.log('Setting result', savedPageInputs);
        return new Promise((resolve, reject) => {
            Store.storage.local.set({ [hashCode]: savedPageInputs }, () => {
                console.log('Saved result');
                if (Service.runtime.lastError) {
                    reject(Service.runtime.lastError);
                }
                else {
                    resolve(savedPageInputs);
                }
            });
        });
    }

    /**
     * Gets the saved input name-value pairs
     * @param { Promise<{ [name: string]: Array<{ name: string, value: string }> }> } hashCode
     */
    async getSavedPageInputs(hashCode) {
        console.log('Getting saved page inputs for ', hashCode);
        new Promise((resolve, reject) => {
            Store.storage.local.get(`${hashCode}`, (item) => {
                console.log('Retrieved saved page inputs', item);
                if (Service.runtime.lastError) {
                    reject(Service.runtime.lastError);
                }
                else {
                    resolve(item);
                }
            });
        });
    }
}

/***** SERVICE *****/
class Service {
    static get runtime() {
        let _runtime;
        try {
            _runtime = browser.runtime;
        }
        catch (error) {
            _runtime = chrome.runtime;
        }
        finally {
            return _runtime;
        }
    }

    constructor() {

    }

    async sendMessage(type, payload) {
        const message = { type, payload };
        return new Promise(async (resolve, reject) => {
            try {
                const tab = await Tabs.getCurrentTab();
                console.log('Seding message', message);
                Tabs.tabs.sendMessage(tab.id, message, response => {
                    console.log('Response received', response);
                    if (Service.runtime.lastError) {
                        reject(Service.runtime.lastError);
                    }
                    else {
                        resolve(response);
                    }
                })
            }
            catch (error) {
                reject(error);
            }
        });
    }

    /**
     * @return { Promise<string> }
     */
    async getHashCode() {
        const type = 'GET_HASHCODE';
        return this.sendMessage(type);
    }

    /**
     * @return { Promise<Array<{name: string, value: string}>> }
     */
    async getPageInputsAndValues() {
        const type = 'GET_PAGE_INPUTS_AND_VALUES';
        return this.sendMessage(type);
    }

    /**
     * @param { Array<{ name: string, value: string }> } inputs The array of inputs to apply
     * @return { Promise<void> }
     */
    async applyPageInputs(inputValues) {
        const type = 'APPLY_PAGE_INPUTS';
        return this.sendMessage(type, inputValues);
    }
}



/***** DOCUMENT CONTROLS *****/
class PopupDocumentController {
    getSaveNameInput() {
        return window.document.querySelector('#saveNameInput');
    }

    getSaveNameButton() {
        return window.document.querySelector('#saveNameButton');
    }

    getSaveOutput() {
        return window.document.querySelector('#saveOutput');
    }

    getApplyInputSelect() {
        return window.document.querySelector('#applyInputSelect');
    }

    getApplyInputButton() {
        return window.document.querySelector('#applyInputButton');
    }

    getApplyOutput() {
        return window.document.querySelector('#applyOutput');
    }

    getOverallOutput() {
        return window.document.querySelector('#overallOutput');
    }

    getErrorOutput() {
        return window.document.querySelector('#errorOutput');
    }

    setSaveOutput(output) {
        const saveOutput = this.getSaveOutput();
        saveOutput.innerHTML = output;
    }

    setApplyOutput(output) {
        const applyOutput = this.getApplyOutput();
        applyOutput.innerHTML = output;
    }

    setOverallOutput(output, clearErrorOutput=true) {
        const overallOutput = this.getOverallOutput();
        overallOutput.innerHTML = output;

        // clear any errors if needed
        if (clearErrorOutput) {
            this.setErrorOutput('', false);
        }
    }

    setErrorOutput(output, clearOverallOutput=true) {
        const errorOutput = this.getErrorOutput();
        errorOutput.innerHTML = output;

        // clear overall if needed
        if (clearOverallOutput) {
            this.setOverallOutput('', false);
        }
    }

    constructor() {
        this.service = new Service();
        this.storage = new Store();
        this.hasInit = false;
    }

    async init() {
        // only run once
        if (this.hasInit) {
            return false;
        }
        this.hasInit = true;
        this.setOverallOutput('Intializing...');

        // execute the content script in the browser tab
        // wait until execution complete before we continue
        try {
            await Tabs.executeScript({ file: '../content-scripts/test-fill.js' });
        }
        catch (error) {
            this.setErrorOutput('Failed to execute content script');
            console.error(error);
            return false;
        }

        const saveNameInput = this.getSaveNameInput();
        const saveNameButton = this.getSaveNameButton();
        const applyInputSelect = this.getApplyInputSelect();
        const applyInputButton = this.getApplyInputButton();

        let savedPageInputs = [];
        try {
            // get the hashCode of the page
            const hashCode = await this.service.getHashCode();
            // load stored items
            savedPageInputs = (await this.storage.getSavedPageInputs(`${hashCode}`)) || [];
        }
        catch (error) {
            this.setErrorOutput('Failed to fetch page unique identifier');
            console.error(error);
            savedPageInputs = [];
            return false;
        }

        // fill in the options for the select
        const savedInputSelectOptions = savedPageInputs.map(({ name, value }) => {
            const option = document.createElement('option');
            option.setAttribute('value', value);
            option.innerText = name;
            return option;
        });
        // create placeholder element
        const placeholderElement = document.createElement('option');
        placeholderElement.setAttribute('value', '');
        placeholderElement.innerText = 'Select an option'
        savedInputSelectOptions.unshift(placeholderElement);

        // remove all existing options
        Array.from(applyInputSelect.children).forEach(child => {
            applyInputSelect.removeChild(child);
        });

        // add each option to the select
        savedInputSelectOptions.forEach(option => {
            applyInputSelect.appendChild(option);
        });

        // add save name change
        saveNameInput.addEventListener('keyup', () => this.update());

        // add apply name change
        applyInputSelect.addEventListener('mouseup', () => this.update());

        // add save button press
        saveNameButton.addEventListener('click', () => {
            try {
                Promise.all([
                    this.service.getHashCode(),
                    this.service.getPageInputsAndValues(),
                ]).then(([hashCode, inputs]) => {
                    const name = this.getSaveNameInput().value;
                    return this.storage.savePageInputs(`${hashCode}`, name, inputs);
                }).then(() => {
                    // clear the input & disabled the button
                    this.getSaveNameInput().value = '';
                    this.getSaveNameButton().disabled = true;

                    this.setSaveOutput('Successfully saved inputs')
                }).catch(error => {
                    this.setErrorOutput('An error occurred while saving');
                    console.error(error);
                }); 
            }
            catch (error) {
                this.setErrorOutput('An error occured while trying to save');
                console.error(error);
            }
        });

        // add apply button press
        applyInputButton.addEventListener('click', () => {
            try {
                const value = this.getApplyInputSelect().value
                this.service.applyPageInputs(value).then(() => {
                    this.setApplyOutput('Successfully applied inputs');
                });
            }
            catch (error) {
                this.setErrorOutput('An error occurred while applying');
                console.error(error);
            }
        });

        // set complete message
        this.setOverallOutput('Initialized');

        // clear message after 2 seconds
        window.setTimeout(() => {
            this.setOverallOutput('');
        }, 2000);

        return true;
    }

    update() {
        const saveNameInput = this.getSaveNameInput();
        const saveNameButton = this.getSaveNameButton();

        const applyInputSelect = this.getApplyInputSelect();
        const applyInputButton = this.getApplyInputButton();

        // disable the save button if the name input is empty
        if (!saveNameInput.value) {
            saveNameButton.disabled = true;
        }
        else {
            saveNameButton.disabled = false;
        }

        // disable the apply button if the select input is empty
        if (!applyInputSelect.value) {
            applyInputButton.disabled = true;
        }
        else {
            applyInputButton.disabled = false;
        }

        // clear any messages
        this.setSaveOutput('');
        this.setApplyOutput('');
        this.setOverallOutput('');
        this.setErrorOutput('');
    }
}

// run on load
console.log('POPUP');
const popupDocumentController = new PopupDocumentController();
popupDocumentController.init().then((success) => {
    if (success) {
        popupDocumentController.update();
    }
}).catch((error) => {
    console.error(error);
});

})();