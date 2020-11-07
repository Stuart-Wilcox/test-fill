(function(){
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

    getOptionsLink() {
        return window.document.querySelector('#options');
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
        const optionsLink = this.page.getOptionsLink();
        
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

        // add options link press
        optionsLink.addEventListener('click', (event) => this.handleOptionsLinkClicked(event));

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

    async handleOptionsLinkClicked(event) {
        event.preventDefault();
        try {
            let result = await Service.runtime.openOptionsPage();
            console.log(result);
            return result;
        }   
        catch (error) {
            console.error(error);
            return false;
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