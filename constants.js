const CONSTANTS = (function(){
  /* ===== DEPENDENCIES ===== */
  const _utils = UTILS;
  

  /* ===== MAIN ===== */
  let _config = {};
  _utils.getSettings(settings => _config=settings);

  const CONSTANTS = {
    SCHEMES: [
      {
        type: "text",
        display: "Text",
        schemes: [
          {
            get: element => `TEST ${element.name || "input"} ${_config.countSettings}`,
            display: "TEST &lt;name&gt; &lt;count&gt;",
          },
          {
            get: element => `${element.name} ${_config.countSettings}`,
            display: "&lt;name&gt; &lt;count&gt;",
          },
        ]
      },
      {
        type: "select",
        display: "Select",
        schemes: [
          {
            get: element =>
              (element.querySelector("option") || { value: undefined }).value,
            display: "First option",
          }
        ]
      },
      {
        type: "email",
        display: "Email",
        schemes: [
          {
            get: element => `test${_config.countSettings}@email.com`,
            display: "test<count>@email.com",
          }
        ]
      },
      {
        type: "checkbox",
        display: "Checkbox",
        schemes: [
          {
            get: element => true,
            display: "Select All",
          }
        ]
      },
      {
        type: "radio",
        display: "Radio",
        schemes: [
          {
            get: element => true,
            display: "Select Last",
          }
        ]
      }
    ]
  };

  return CONSTANTS;
})();