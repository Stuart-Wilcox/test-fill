const MESSAGE_HANDLER = (function() {
  /* ===== DEPENDENCIES ===== */
  const _utils = UTILS;
  const _constants = CONSTANTS;


  /* ===== CONSTANTS ===== */
  const GET_STATE = 'get_state';
  const GET_CONSTANTS = 'get_constants';


  /* ===== MAIN ===== */
  const MESSAGE_HANDLER = ({message}, sender, sendResponse) => {
      // sent from content_script
      if (sender.tab) {
        let response;
        switch(message) {
          case GET_STATE: {
            _utils.getSettings().then(settings => sendResponse({ message: settings }));
            break;
          }

          case GET_CONSTANTS: {
            response = _constants;
            break;
          }

          default: {
            response = 'Unhandled';
          }
        }

        if (response) {
          sendResponse({ message: response }); // send synchronous response
          return false; // return false to indicate synchronous response
        }

        return true; // return true to indicate asynchronous response
      }
      else {
        console.warn('MESSAGES FROM EXTERNAL NOT SUPPORTED');
      }
  };

  return MESSAGE_HANDLER;
})();
