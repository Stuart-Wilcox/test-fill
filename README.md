# Test-Fill

Test-fill is a browser extension that facilitates filling in web forms with the same data over and over

It is intended as a QA tool, but could also be used for general productivity for speeding up form submissions in certain cases.

# Development
Test-fill is split between a popup that runs in the browser extension context, and content script which runs in the target web page context.

The two communicate using the Browser Messaging API, and share information about the web page and user actions.

Different browsers have different ways of running the extensions, so I will provide instructions for both.

## Firefox
Zip up the content-scripts, icons, and popup folders as well as the manifest.json. Name this zipped file test-fill.zip.

In Firefox, go to [about:debugging](about:debugging#/runtime/this-firefox) and select Load Temporary Add-on..., which should prompt you to select the zip file test-fill.zip that was previously created.

The extension should now be available to run and debug in the browser.

## Chrome
TODO