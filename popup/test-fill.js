/***** STORAGE *****/
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
        // get everything in storage already
        const savedPageInputs = await this.getSavedPageInputs(hashCode);
        savedPageInputs[name] = inputs;
        return new Promise((resolve, reject) => {
            Store.storage.local.set({ [hashCode]: savedPageInputs }, () => {
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
        new Promise((resolve, reject) => {
            Store.storage.local.get(hashCode, (item) => {
                if (Service.runtime.lastError) {
                    reject(Service.runtime.lastError);
                }
                else {
                    resolve(item || {});
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
        return new Promise((resolve, reject) => {
            try {
                Service.runtime.sendMessage(message, response => {
                    resolve(response);
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
    get saveNameInput() {
        return document.querySelector('#saveNameInput');
    }

    get saveNameButton() {
        return document.querySelector('#saveNameButton');
    }

    get applyInputSelect() {
        return document.querySelector('#applyInputSelect');
    }

    get applyInputButton() {
        return document.querySelector('#applyInputButton');
    }

    constructor() {
        this.service = new Service();
        this.storage = new Store();
        this.hasInit = false;
    }

    async init() {
        // only run once
        if (this.hasInit) {
            return;
        }
        this.hasInit = true;

        const saveNameInput = this.saveNameInput;
        const saveNameButton = this.saveNameButton;
        const applyInputSelect = this.applyInputSelect;
        const applyInputButton = this.applyInputButton;

        let savedPageInputs = [];
        try {
            // get the hashCode of the page
            const hashCode = await this.service.getHashCode();
            // load stored items
            savedPageInputs = (await this.storage.getSavedPageInputs(hashCode)) || [];
        }
        catch (error) {
            // TODO show error message
            console.error(error);
            savedPageInputs = [];
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
                    const name = this.saveNameInput.value;
                    this.storage.savePageInputs(hashCode, name, inputs);
                }).catch(error => {
                    // TODO show error message
                    console.error(error);
                }); 
            }
            catch (error) {
                // TODO show error message
                console.error(error);
            }
        });

        // add apply button press
        applyInputButton.addEventListener('click', () => {
            try {
                this.service.applyPageInputs(this.applyInputSelect.value);
            }
            catch (error) {
                // TODO show error message
                console.error(error);
            }
        });
    }

    update() {
        const saveNameInput = this.saveNameInput;
        const saveNameButton = this.saveNameButton;

        const applyInputSelect = this.applyInputSelect;
        const applyInputButton = this.applyInputButton;

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
    }
}

// run on load
console.log('POPUP');
const popupDocumentController = new PopupDocumentController();
popupDocumentController.init().then(() => {
    popupDocumentController.update();
});
