const _constants = {
  TEXT_SCHEMES: [
    {
      get: element => `TEST ${element.name || "input"} ${config.count}`,
      display: "TEST <name> <count>"
    }
  ],
  SELECT_SCHEMES: [
    {
      get: element =>
        (element.querySelector("option") || { value: undefined }).value,
      display: "First option"
    }
  ],
  EMAIL_SCHEMES: [
    {
      get: element => `test${count}@email.com`,
      display: "test<count>@email.com"
    }
  ],
  CHECKBOX_SCHEMES: [
    {
      get: element => true,
      display: "Select All"
    }
  ],
  RADIO_SCHEMES: [
    {
      get: element => true,
      display: "Select Last"
    }
  ],

  SCHEMES: [
    {
      type: "text",
      display: "Text",
      schemes: [
        {
          get: element => `TEST ${element.name || "input"} ${config.count}`,
          display: "TEST &lt;name&gt; &lt;count&gt;"
        }
      ]
    },
    {
      type: "select",
      display: "Select",
      schemes: [
        {
          get: element =>
            (element.querySelector("option") || { value: undefined }).value,
          display: "First option"
        }
      ]
    },
    {
      type: "email",
      display: "Email",
      schemes: [
        {
          get: element => `test${count}@email.com`,
          display: "test<count>@email.com"
        }
      ]
    },
    {
      type: "checkbox",
      display: "Checkbox",
      schemes: [
        {
          get: element => true,
          display: "Select All"
        }
      ]
    },
    {
      type: "radio",
      display: "Radio",
      schemes: [
        {
          get: element => true,
          display: "Select Last"
        }
      ]
    }
  ]
};


const _config = {
    count: 0,
};



const init = () => {
    document.getElementById('go').addEventListener('click', () => {
        chrome.tabs.executeScript(null, { file: "contentScript.js" });
    });
    
    chrome.runtime.onConnect.addListener(port => {
        if (port.name === '_testFill') {
            port.onMessage.addListener(({ message }) => {
                switch(message) {
                    case 'get_state': {
                        chrome.storage.local.get(['state'], ({ state }) => port.postMessage({ message: state }));
                    }
                }
            });
        }
    });
};

const populate = (constants, config) => {
    const replacement_settings = constants.SCHEMES.map(schemeObj => `
            <div style="display:flex;flex-direction:column;justify-content:space-between;margin-bottom:8px;">
                <label for="${schemeObj.type}">${schemeObj.display}</label>
                <select name="${schemeObj.type}">
                    ${schemeObj.schemes.map((scheme, index) => `
                        <option value="${index}">${scheme.display}</option>
                    `)}
                </select>
            </div>
    `).join('');

    const count_settings = `
        <label>Count: ${config.count}<label>
        <button id="reset">Reset</button>
    `;

    document.getElementById('replacement_settings').innerHTML = replacement_settings;
    document.getElementById('count_settings').innerHTML = count_settings;
};

init();
populate(_constants, _config);