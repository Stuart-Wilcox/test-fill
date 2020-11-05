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
     * @param { string } name 
     * @param { Promise<Array<{ name: string, value: string }>> } inputs 
     */
    async savePageInputs(name, inputs) {
        // get everything in storage already
        return new Promise((resolve, reject) => {
            Store.storage.local.set({ [name]: inputs }, () => {
                if (Service.runtime.lastError) {
                    reject(Service.runtime.lastError);
                }
                else {
                    resolve(inputs);
                }
            });
        });
    }

    /**
     * Gets the saved input name-value pairs
     * @param { Promise<{ [name: string]: Array<{ name: string, value: string }> }> } hashCode
     */
    async getSavedPageInput(name) {
        return new Promise((resolve, reject) => {
            Store.storage.local.get(name, (item) => {
                if (Service.runtime.lastError) {
                    reject(Service.runtime.lastError);
                }
                else {
                    resolve(item[name]);
                }
            });
        });
    }

    /**
     * Gets the saved input name-value pairs
     * @param { Promise<{ [name: string]: Array<{ name: string, value: string }> }> } hashCode
     */
    async getAllSavedPageInputs() {
        return new Promise((resolve, reject) => {
            Store.storage.local.get(null, (item) => {
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
                Tabs.tabs.sendMessage(tab.id, message, response => {
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

/**
 * Controls the UI elements on the page
 */
class PopupDocumentPage {
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

    setSaveOutput(output, duration=3000) {
        const saveOutput = this.getSaveOutput();
        saveOutput.innerText = output;

        // clear the output after duration
        if (duration) {
            window.setTimeout(() => {
                saveOutput.innerText = '';                
            }, duration);
        }
    }

    setApplyOutput(output, duration=3000) {
        const applyOutput = this.getApplyOutput();
        applyOutput.innerText = output;

        // clear the output after duration
        if (duration) {
            window.setTimeout(() => {
                applyOutput.innerText = '';                
            }, duration);
        }        
    }

    setOverallOutput(output, clearErrorOutput=true, duration=3000) {
        const overallOutput = this.getOverallOutput();
        overallOutput.innerText = output;

        // clear any errors if needed
        if (clearErrorOutput) {
            this.setErrorOutput('', false);
        }

        // clear the output after duration
        if (duration) {
            window.setTimeout(() => {
                overallOutput.innerText = '';                
            }, duration);
        }

    }

    setErrorOutput(output, clearOverallOutput=true, duration=3000) {
        const errorOutput = this.getErrorOutput();
        errorOutput.innerText = output;

        // clear overall if needed
        if (clearOverallOutput) {
            this.setOverallOutput('', false);
        }

        // clear the output after duration
        if (duration) {
            window.setTimeout(() => {
                errorOutput.innerText = '';                
            }, duration);
        }

    }
}

class PopupDocumentController {
    constructor() {
        this.page = new PopupDocumentPage();
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
        this.page.setOverallOutput('Intializing...');

        const saveNameInput = this.page.getSaveNameInput();
        const saveNameButton = this.page.getSaveNameButton();
        const applyInputSelect = this.page.getApplyInputSelect();
        const applyInputButton = this.page.getApplyInputButton();
        
        // disable the buttons and inputs
        saveNameInput.disabled = true;
        saveNameButton.disabled = true;
        applyInputSelect.disabled = true;
        applyInputButton.disabled = true;

        // execute the content script in the browser tab
        // wait until execution complete before we continue
        try {
            await Tabs.executeScript({ file: '../content-scripts/test-fill.js' });
        }    
        catch (error) {
            this.page.setErrorOutput('Failed to execute content script');
            console.error(error);
            return false;
        }    

        // add save name change
        saveNameInput.addEventListener('keyup', () => this.handleSaveNameInputChanged());

        // add apply name change
        applyInputSelect.addEventListener('mouseup', () => this.handleApplyInputChanged());

        // add save button press
        saveNameButton.addEventListener('click', () => this.handleSaveNameButtonClicked());

        // add apply button press
        applyInputButton.addEventListener('click', () => this.handleApplyInputButtonClicked());

        // re-enable the inputs
        saveNameInput.disabled = false;
        applyInputSelect.disabled = false;

        // re-run the update once content script has run
        // and any additional setup has been complete
        await this.updateApplySelectOptions();


        // set complete message
        this.page.setOverallOutput('Initialized');

        // clear message after 2 seconds
        window.setTimeout(() => {
            this.page.setOverallOutput('');
        }, 2000);

        // successfully initialized
        return true;
    }

    async handleSaveNameInputChanged() {
        return this.update();
    }

    async handleApplyInputChanged() {
        return this.update();
    }

    async handleSaveNameButtonClicked() {
        try {
            // get the desired name from the user
            const name = this.page.getSaveNameInput().value;

            // get the inputs+values from the page
            const inputs = await this.service.getPageInputsAndValues();

            // save the inputs+values under the desired name
            await this.storage.savePageInputs(name, inputs);

            // clear the input & disable the button
            this.page.getSaveNameInput().value = '';
            this.page.getSaveNameButton().disabled = true;

            this.page.setSaveOutput('Successfully saved inputs');
            await this.updateApplySelectOptions();
        }
        catch (error) {
            this.page.setErrorOutput('An error occurred while saving');
            console.error(error);
        }
    }

    async handleApplyInputButtonClicked() {
        try {

            // read the desired saved name
            const name = this.page.getApplyInputSelect().value;
    
            // retrieve the inputs+values saved under the name
            const savedPageInputs = await this.storage.getSavedPageInput(name);

            // apply the inputs+values on the page
            await this.service.applyPageInputs(savedPageInputs);

            // clear the select and disable the button
            this.page.getApplyInputSelect().value = '';
            this.page.getApplyInputButton().disabled = true;

            this.page.setApplyOutput('Successfully applied inputs');
        }
        catch (error) {
            this.page.setErrorOutput('An error occurred while applying');
            console.error(error);    
        }
    }

    async updateApplySelectOptions() {
        const applyInputSelect = this.page.getApplyInputSelect();
        let savedPageInputs = [];
        try {
            // load all stored items
            savedPageInputs = await this.storage.getAllSavedPageInputs();
        }
        catch (error) {
            this.setErrorOutput('Failed to fetch stored inputs');
            console.error(error);
            savedPageInputs = {};
            return false;
        }

        // fill in the options for the select
        const savedInputSelectOptions = Object.keys(savedPageInputs).map((name) => {
            const option = document.createElement('option');
            option.setAttribute('value', name);
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
    }

    update() {
        const saveNameInput = this.page.getSaveNameInput();
        const saveNameButton = this.page.getSaveNameButton();

        const applyInputSelect = this.page.getApplyInputSelect();
        const applyInputButton = this.page.getApplyInputButton();

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
        this.page.setSaveOutput('');
        this.page.setApplyOutput('');
        this.page.setOverallOutput('');
        this.page.setErrorOutput('');
    }
}

// run on load
console.log('Running Test-Fill (V2)');
const popupDocumentController = new PopupDocumentController();
popupDocumentController.init().then((success) => {
    if (success) {
        popupDocumentController.update();
    }
}).catch((error) => {
    console.error(error);
});

})();