/***** SERVICE *****/
class Service {
    static get runtime() {
        let _runtime;
        try {
            _runtime = browser.runtime;
        }
        catch (error) {
            _runtime = chrome.runtime;
        }
        finally {
            return _runtime;
        }
    }

    constructor() {

    }

    async sendMessage(type, payload) {
        const message = { type, payload };
        return new Promise(async (resolve, reject) => {
            try {
                const tab = await Tabs.getCurrentTab();
                Tabs.tabs.sendMessage(tab.id, message, response => {
                    if (Service.runtime.lastError) {
                        reject(Service.runtime.lastError);
                    }
                    else {
                        resolve(response);
                    }
                })
            }
            catch (error) {
                reject(error);
            }
        });
    }

    /**
     * @return { Promise<Array<{name: string, value: string}>> }
     */
    async getPageInputsAndValues() {
        const type = 'GET_PAGE_INPUTS_AND_VALUES';
        return this.sendMessage(type);
    }

    /**
     * @param { Array<{ name: string, value: string }> } inputs The array of inputs to apply
     * @return { Promise<void> }
     */
    async applyPageInputs(inputValues) {
        const type = 'APPLY_PAGE_INPUTS';
        return this.sendMessage(type, inputValues);
    }
}