let runtime
try {
    runtime = browser.runtime;
}
catch (error) {
    runtime = chrome.runtime;
}

/***** SERVICE *****/
class Service {
    constructor() {

    }

    async sendMessage(type, payload) {
        const message = { type, payload };
        return new Promise((resolve, reject) => {
            try {
                runtime.sendMessage(message, response => {
                    resolve(response);
                })
            }
            catch (error) {
                reject(error);
            }
        });
    }

    async getSavedPageInputs() {
        const type = 'GET_SAVED_PAGE_INPUTS';
        return this.sendMessage(type);
    }

    async savePageInputs(name) {
        const type = 'SAVE_PAGE_INPUTS';
        return this.sendMessage(type, name);
    }

    async applyPageInputs(name) {
        const type = 'APPLY_PAGE_INPUTS';
        return this.sendMessage(type, name);
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
            savedPageInputs = await this.service.getSavedPageInputs() || [];
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
        applyInputSelect.addEventListener('change', () => this.update());

        // add save button press
        saveNameButton.addEventListener('click', () => {
            try {
                this.service.savePageInputs(this.saveNameInput.value);
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
        const saveNameButton = this.savePageButton;

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
popupDocumentController.init();
