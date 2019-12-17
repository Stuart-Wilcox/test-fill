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
var port = chrome.runtime.connect({ name: '_testFill' });

port.postMessage({ message: 'get_state' });
port.onMessage.addListener(({message}) => {
    console.log(message);
});
