(function(){

    /***** DOCUMENT CONTROLS *****/

    /**
     * Controls the UI elements on the page
     */
    class OptionsDocumentPage {
        getDisplayTable() {
            return window.document.querySelector('#displayTable');
        }

        clearDisplayTable() {
            const displayTable = this.getDisplayTable();
            const children = displayTable.children;
            for (let child of children) {
                displayTable.removeChild(child);
            }
        }

        addDisplayTableRow(name) {
            const row = window.document.createElement('tr');
            const tdName = window.document.createElement('td');
            const tdActions = window.document.createElement('td');

            tdName.innerText = name;

            row.appendChild(tdName);
            row.appendChild(tdActions);

            const displayTable = this.getDisplayTable();
            displayTable.appendChild(row);
        }
    }

    class OptionsDocumentController {
        constructor() {
            this.service = new Service();
            this.storage = new Store();    
            this.page = new OptionsDocumentPage();
        }

        async render() {
            console.log('render');

            // get all saved options
            let savedPageInputs = [];
            try {
                savedPageInputs = await this.storage.getAllSavedPageInputs();
                console.log(savedPageInputs);
            }
            catch (error) {
                console.error(error);
                return false;
            }

            // display in table
            Object.keys(savedPageInputs).forEach(name => {
                this.page.addDisplayTableRow(name);
            });

            // set up listener for clicking row actions
            // TODO

            return true;
        }

        async cleanup() {
            // unregister all events for clicking row actions
            // TODO

            // clear the table
            this.page.clearDisplayTable();
        }
    }

    const controller = new OptionsDocumentController();
    controller.render().then(success => {
        // TODO
    }).catch(error => {
        console.error(error);
    });
})()