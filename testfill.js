/* CONSTANTS */
const constants = {
    TEXT_SCHEMES: [
        {
            get: (element) => `TEST ${element.name || 'input'} ${config.count}`,
            display: 'TEST <name> <count>',
        },
    ],
    SELECT_SCHEMES: [
        {
            get: (element) => (element.querySelector('option') || { value: undefined }).value,
            display: 'First option',
        },
    ],
    EMAIL_SCHEMES: [
        {
            get: (element) => `test${count}@email.com`,
            display: 'test<count>@email.com',
        },
    ],
    CHECKBOX_SCHEMES: [
        {
            get: (element) => true,
            display: 'Select All',
        },
    ],
    RADIO_SCHEMES: [
        {
            get: (element) => true,
            display: 'Select Last'
        },
    ],
};

/* CONFIG */
const config = {
    textScheme: constants.TEXT_SCHEMES[0],
    selectScheme: constants.SELECT_SCHEMES[0],
    emailScheme: constants.EMAIL_SCHEMES[0],
    checkboxScheme: constants.CHECKBOX_SCHEMES[0],
    radioScheme: constants.RADIO_SCHEMES[0],
    count: 0,
};

/* UTILS */
const getElementsInBoundary = (domRect, types=['input, textarea, select'], parent=window.document) => {
    const elements = Array.from(parent.querySelectorAll(types));

    const filteredElements = elements.filter(element => {
        const boundingRect = element.getBoundingClientRect();

        const horizontalContains = boundingRect.left >= domRect.left && boundingRect.right <= domRect.right;
        const verticalContains = boundingRect.bottom >= domRect.bottom && boundingRect.top <= domRect.top;

        return horizontalContains && verticalContains;
    });

    return filteredElements;
};

const getAndApplyInputValue = (element) => {
    // text inputs
    if (element.tagName === 'textarea' || element.type === 'text') {
        element.value = config.textScheme.get(element);
        return;
    }
    
    // select inputs
    if (element.tagName === 'select') {
        element.value = config.selectScheme.get(element);
        return;
    }

    // email inputs
    if (element.type === 'email') {
        element.value = config.emailScheme.get(element);
        return;
    }

    // checkbox inputs
    if (element.type === 'checkbox') {
        element.checked = config.checkboxScheme.get(element);
        return;
    }

    // radio inputs
    if (element.type === 'radio') {
        element.checked = config.radioScheme.get(element);
        return;
    }
}

const fillElements = (elements=[], count=0) => {
    elements.forEach(element => {
        // don't fill out values if they already exist
        if(!element.value) {
            getAndApplyInputValue(element);
        }
    });
};