// if (!window_testFill) {
//     window._testFill = {
//         inProgress: false,
//         boundingEl: null,
//         firstClickPos: null,
//         secondClickPos: null,
//     };
// }

// const { _testFill } = window;
// const {
//     inProgress,
//     boundingEl,
//     firstClickPos,
//     secondClickPos,
// } = _testFill;

// if (!inProgress) {
//     window._testFill.inProgress = true;

//     // add a backdrop to the page
//     // turn cursor to pointer
//     // get first click
//     // get second click
//     // draw highlighted box in rectangle made by two clicks
//     // remove backdrop
//     // on escape, clear box
//     // on escape with cleared box, close
//     // after both clicks, hit enter to confirm
//     // populate the inputs in this area with dummy data
//     // increment state count

//     window._testFill.inProgress = false;
// }

// var port = chrome.runtime.connect({ name: '_testFill' });
// port.postMessage({ message: 'get_state' });
// port.onMessage.addListener(({message}) => {
    
// });

var main = (function(){
    /* ===== CONSTANTS ===== */
    const CONSTANTS = {
        GET_STATE: 'get_state',
        GET_CONSTANTS: 'get_constants',
        GET_SELECT_STATE: 'get_select_state',
        SET_SELECT_STATE: 'set_select_state',
        KEYPRESS_EVENT_LISTENER: null,
        MOUSEDOWN_EVENT_LISTENER: null,
        MOUSEUP_EVENT_LISTENER: null,
    };


    /* ===== MESSAGE_SENDER ===== */
    const MESSAGE_SENDER = {
        send: async (message, payload, callback) => {
            return new Promise(resolve => {
                chrome.runtime.sendMessage({ message, payload }, (response={}) => {
                    const { message=null } = response;
                    if (callback) {
                        callback(message);
                    }
                    resolve(message);
                });
            });
        },
    };


    /* ===== UTILS ===== */
    const UTILS = {
        getState: async () => MESSAGE_SENDER.send(CONSTANTS.GET_STATE),
        getSelectionState: async () => MESSAGE_SENDER.send(CONSTANTS.GET_SELECT_STATE),
        setSelectionState: async (selectionState) => MESSAGE_SENDER.send(CONSTANTS.SET_SELECT_STATE, selectionState),
        getConstants: async () => MESSAGE_SENDER.send(CONSTANTS.GET_CONSTANTS),
        getStyle: styleObj => Object.keys(styleObj).map(key => `${key}:${styleObj[key]}`).join('; '),
    };


    /* ===== MAIN ===== */
    const init = async () => {
        // get state and constants
        const [state, constants] = await Promise.all([ UTILS.getState(), UTILS.getConstants() ]);

        //  make rootElement on page
        let rootElement = document.querySelector('#textFillRoot');
        if (rootElement) {
            return;
        }

        rootElement = document.createElement('div');
        rootElement.setAttribute('id', 'testFillRoot');
        document.body.appendChild(rootElement);
        
        // setup what happens when you hit escape and enter key
        CONSTANTS.KEYPRESS_EVENT_LISTENER = document.addEventListener('keydown', event => {
            // escape key pressed
            if ((event.key && event.key === 'Escape') || (event.keyCode && event.keyCode === 27)) {
                console.warn('Handle escape key pressed...');
            }
            // enter key pressed
            if ((event.key && event.key === 'Enter') || (event.keyCode && event.keyCode === 13)) {
                console.warn('Handle enter key pressed...');
            }
        });

        // setup what happens when you mousedown
        CONSTANTS.MOUSEDOWN_EVENT_LISTENER = rootElement.addEventListener('mousedown', event => {
            const { pageX: x, pageY: y } = event;
            console.log('mousedown', { x, y });

            // get the refreshed state
            UTILS.getSelectionState().then(selectionState => {
                const newState = { ...selectionState };

                // if first state is set, ignore this and reset
                // something went wrong
                if (selectionState.fistClickPos) {
                    newState = {};
                }
                else {
                    newState.firstClickPos = { x, y };
                }

                // update the selectState
                UTILS.setSelectionState(newState);

                // refresh 
                run();
            });
        });

        // setup what happens when you mouseup
        CONSTANTS.MOUSEUP_EVENT_LISTENER = rootElement.addEventListener('mouseup', event => {
            const { pageX: x, pageY: y } = event; 
            console.log('mouseup', { x, y });

            // get the refreshed state
            UTILS.getSelectionState().then(selectionState => {
                const newState = { ...selectionState };

                // if first state is not set, ignore this and reset
                // something went wrong
                if (!selectionState.fistClickPos) {
                    newState = {};
                }
                // if second state is set, ignore this and reset
                // something went wrong
                else if (selectionState.secondClickPos) {
                    newState = {};
                }
                else {
                    newState.secondClickPos = { x, y };
                }

                // update the selectState
                UTILS.setSelectionState(newState);

                // refresh
                run();
            });
        });
    };

    const run = async () => {
        // get the refreshed selection state
        const selectionState = await UTILS.getSelectionState();
        console.log(selectionState);

        const rootElement = document.querySelector('#testFillRoot');

        if (!rootElement) {
            console.warn('Root not found, operation terminated');
            return;
        }

        // add backdrop to page
        const backdropElement = document.createElement('div');
        backdropElement.setAttribute('id', 'testFillBackdrop');
        backdropElement.style = UTILS.getStyle({
            'position': 'absolute',
            'top': '0px',
            'left': '0px',
            'height': '100%',
            'width': '100%',
            'z-index': '99999',
            'background-color': 'rgba(0, 0, 0, 0.3)',
            'border': 'dashed #000 3px',
            'cursor': 'crosshair',
        });
        rootElement.appendChild(backdropElement);
    };

    return { init, run };
})();

// init then run
main.init().then(() => main.run());
