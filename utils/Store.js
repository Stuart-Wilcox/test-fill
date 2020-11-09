/***** STORE *****/
class Store {
    static get storage() {
        let _storage;
        try {
            if (storage) {
                _storage = storage;
            }
        }
        catch (error) {
            _storage = chrome.storage;
        }
        finally {
            return _storage;
        }
    }

    constructor() {

    }

    /**
     * Saves the input name-value pairs under the given name
     * @param { string } name 
     * @param { Promise<Array<{ name: string, value: string }>> } inputs 
     */
    async savePageInputs(name, inputs) {
        // get everything in storage already
        return new Promise((resolve, reject) => {
            Store.storage.local.set({ [name]: inputs }, () => {
                if (Service.runtime.lastError) {
                    reject(Service.runtime.lastError);
                }
                else {
                    resolve(inputs);
                }
            });
        });
    }

    /**
     * Gets the saved input name-value pairs
     * @param { Promise<{ [name: string]: Array<{ name: string, value: string }> }> } hashCode
     */
    async getSavedPageInput(name) {
        return new Promise((resolve, reject) => {
            Store.storage.local.get(name, (item) => {
                if (Service.runtime.lastError) {
                    reject(Service.runtime.lastError);
                }
                else {
                    resolve(item[name]);
                }
            });
        });
    }

    /**
     * Gets the saved input name-value pairs
     * @param { Promise<{ [name: string]: Array<{ name: string, value: string }> }> } hashCode
     */
    async getAllSavedPageInputs() {
        return new Promise((resolve, reject) => {
            Store.storage.local.get(null, (item) => {
                if (Service.runtime.lastError) {
                    reject(Service.runtime.lastError);
                }
                else {
                    resolve(item);
                }
            });
        });
    }

    /**
     * Removed the inputs saved at name
     * @param {string} name 
     */
    async removeSavedPageInput(name) {
        //  check to make sure exists
        const inputs = await this.getSavedPageInput(name);
        if (!inputs) {
            return Promise.reject(new Error('Not found'));
        }

        return new Promise((resolve, reject) => {
            Store.storage.local.remove(name, () => {
                if (Service.runtime.lastError) {
                    reject(Service.runtime.lastError);
                }
                else {
                    resolve();
                }
            });
        });
    }
}
