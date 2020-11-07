/***** TABS *****/
class Tabs {
    static get tabs() {
        let _tabs;
        try {
            if (tabs) {
                _tabs = tabs;
            }
        }
        catch (error) {
            _tabs = chrome.tabs;
        }
        finally {
            return _tabs;
        }
    }

    static async getCurrentTab() {
        return new Promise((resolve, reject) => {
            Tabs.tabs.query({ active: true, currentWindow: true }, tabs => {
                if (Service.runtime.lastError) {
                    reject(Service.runtime.lastError);
                    return;
                }
                if (tabs[0]) {
                    resolve(tabs[0]);
                }
                else {
                    reject(new Error('Tab matching query not found'));
                }
            });
        });
    }

    static async executeScript(script) {
        const tab = await Tabs.getCurrentTab();
        return new Promise((resolve, reject) => {
            Tabs.tabs.executeScript(tab.id, script, (results) => {
                if (Service.runtime.lastError) {
                    reject(Service.runtime.lastError);
                }
                else {
                    resolve(results);
                }
            });
        });
    }
}