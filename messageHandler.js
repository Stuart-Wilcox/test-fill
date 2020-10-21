const MESSAGE_HANDLER = (function() {
  /* ===== DEPENDENCIES ===== */
  const _utils = UTILS;
  const _constants = CONSTANTS;


  /* ===== CONSTANTS ===== */
  const GET_STATE = 'get_state';
  const GET_CONSTANTS = 'get_constants';
  const GET_SELECT_STATE = 'get_select_state';
  const SET_SELECT_STATE = 'set_select_state';

  /* ===== MAIN ===== */
  const MESSAGE_HANDLER = ({message, payload}, sender, sendResponse) => {
      // sent from content_script
      if (sender.tab) {
        let response;
        switch(message) {
          case GET_STATE: {
            _utils.getSettings().then(settings => sendResponse({ message: settings }));
            break;
          }

          case GET_SELECT_STATE: {
            _utils.getSelectState().then(selectState => sendResponse({ message: selectState }));
          }

          case SET_SELECT_STATE: {
            _utils.setSelectState(payload).then(selectState => sendResponse({ message: selectState }));
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
