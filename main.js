(function(){
  /* ===== DEPENDENCIES ===== */
  const _constants = CONSTANTS;
  const _utils = UTILS;
  const _messageHandler = MESSAGE_HANDLER
  const Popup = POPUP_COMPONENT;


  /* ===== CONSTANTS ===== */
  const contentScriptFile = { file: 'contentScript.js' };


  /* ===== INIT ===== */
  const init = async () => {
    // setup message handling
    chrome.runtime.onMessage.addListener(_messageHandler);

    // setup go button click behaviour
    document.getElementById('go').addEventListener('click', () => {
        chrome.tabs.executeScript(null, contentScriptFile);
    });
    
    // setup replacement settings save button behaviour
    document.getElementById('replacementSettingsSave').addEventListener('click', async () => {
      const rawReplacementSettings = Array.from(document.querySelectorAll('#replacementSettings select')); // get all the options in the replacement settings section
      const replacementSettings = {};
      rawReplacementSettings.forEach(element => replacementSettings[element.name] = element.value); // get the name-value pairs in a map
      const updatedSettings = await _utils.updateReplacementSettings(replacementSettings); // update the settings
      Popup.render(_constants, updatedSettings) // re-render
    });

    // setup count reset button behaviour
    document.getElementById('countSettingsSave').addEventListener('click', async () => {
      const updatedSettings = await _utils.resetCount(); // reset the count
      Popup.render(_constants, updatedSettings) // re-render
    });

    // pull in settings and perform first render
    const settings = await _utils.getSettings();
    Popup.render(_constants, settings);
  };


  /* ===== MAIN ===== */
  init();
})();