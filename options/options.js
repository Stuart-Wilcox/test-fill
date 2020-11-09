(function(){

    /***** DOCUMENT CONTROLS *****/

    /**
     * Controls the UI elements on the page
     */
    class OptionsDocumentPage {
        getDisplayTable() {
            return window.document.querySelector('#displayTable');
        }

        createActionIcon() {
            const div = window.document.createElement('div');
            const svg = window.document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            
            path.setAttributeNS(null, 'fill', '#000');
            path.setAttributeNS(null, 'd', 'M12,16A2,2 0 0,1 14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18A2,2 0 0,1 12,16M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4Z');

            svg.setAttributeNS(null, 'class', 'actions-icon');
            svg.setAttributeNS(null, 'viewBox', '0 0 24 24');

            svg.appendChild(path);
            div.appendChild(svg);

            return div;
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

            const actionIcon = this.createActionIcon();

            tdName.innerText = name;
            tdActions.setAttribute('class', 'actions');
            tdActions.appendChild(actionIcon);

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
            // get all saved options
            let savedPageInputs = [];
            try {
                savedPageInputs = await this.storage.getAllSavedPageInputs();
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