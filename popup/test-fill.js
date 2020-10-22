/***** UTILS *****/

/** 
 * Get hash from a string
 * @param { string } s Input string
 * @return { number } Hash results
 */
const hashCode = s => s.split('').reduce((a,b) => (((a << 5) - a) + b.charCodeAt(0))|0, 0);

/**
 * Searches the document for all inputs and copies their names and values
 * @return {
 *  inputNamesHashCode { string } The hash code of the page's inputs
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
 * Searches the document for all the inputs and applies their values from the map
 * @param {{ [string]: string }} inputMap The map of name - value for all the page's inputs
 */
const applyPageInputs = (name) => {
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
const savePageInputs = (name) => {
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
const getSavedPageInputs = () => {
    // TODO read from saved place
    return [];
};



/***** DOCUMENT CONTROLS *****/
const init = () => {
    const saveNameInput = document.querySelector('#saveNameInput');
    const saveNameButton = document.querySelector('#saveNameButton');
    
    const applyInputSelect = document.querySelector('#applyInputSelect');
    const applyInputButton = document.querySelector('#applyInputButton');

    const savedPageInputs = getSavedPageInputs();

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
    saveNameInput.addEventListener('keyup', main);

    // add apply name change
    applyInputSelect.addEventListener('change', main);
    
    // add save button press
    saveNameButton.addEventListener('click', () => {
        savePageInputs(saveNameInput.value);
    });
    
    // add apply button press
    applyInputButton.addEventListener('click', () => {
        applyPageInputs(applyInputSelect.value);
    });
};

const main = () => {
    const saveNameInput = document.querySelector('#saveNameInput');
    const saveNameButton = document.querySelector('#saveNameButton');
    
    const applyInputSelect = document.querySelector('#applyInputSelect');
    const applyInputButton = document.querySelector('#applyInputButton');
        
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
};

// run on load
console.log('POPUP');
init();
main();