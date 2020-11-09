(function(){

    /***** DOCUMENT CONTROLS *****/

    /**
     * Controls the UI elements on the page
     */
    class OptionsDocumentPage {
        constructor() {
            this.isActionMenuOpen = false;
            this.hideActionMenu();

            // setup click away listener on the page
            document.body.addEventListener('click', event => {
                // check if the event occured inside the action menu
                const actionMenu = this.getActionMenu();
                if (!actionMenu || !actionMenu.contains(event.target)) {
                    // close the action menu
                    this.hideActionMenu();
                }
            });
        }

        getDisplayTable() {
            return window.document.querySelector('#displayTable');
        }

        createActionIcon(name) {
            const div = window.document.createElement('div');
            const svg = window.document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            
            path.setAttributeNS(null, 'fill', '#000');
            path.setAttributeNS(null, 'd', 'M12,16A2,2 0 0,1 14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18A2,2 0 0,1 12,16M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4Z');

            svg.setAttributeNS(null, 'class', 'actions-icon');
            svg.setAttributeNS(null, 'viewBox', '0 0 24 24');

            div.setAttribute('id', `actions-${name}`);

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

            const actionIcon = this.createActionIcon(name);

            tdName.innerText = name;
            tdActions.setAttribute('class', 'actions');
            tdActions.appendChild(actionIcon);

            row.appendChild(tdName);
            row.appendChild(tdActions);

            const displayTable = this.getDisplayTable();
            displayTable.appendChild(row);
        }

        getAllActionIcons() {
            // get the action icons
            const allActionIconsList = window.document.querySelectorAll('td.actions > div');

            // use this to hold a map from name to icon element
            const allActionIcons = {};

            allActionIconsList.forEach(actionIcon => {
                const id = actionIcon.getAttribute('id');

                // id is in the form `actions-${name}` and we want the name from it
                const name = id.substring(8); 

                // fill the map in
                allActionIcons[name] = actionIcon;
            });

            return allActionIcons;
        }

        /**
         * Sets up the action icons and menu
         * @param {(name: string) =>  void} actionClickedCallback Callback invoked when a menu item is clicked
         */
        setupActionIcons(actionClickedCallback) {
            const allActionIcons = this.getAllActionIcons();
            for (const name in allActionIcons) {
                const element = allActionIcons[name];
                element.addEventListener('click', event => {
                    event.stopPropagation();

                    // close the action menu if needed
                    if (this.isActionMenuOpen) {
                        console.log('hiding action menu');
                        this.hideActionMenu();
                    }

                    this.showActionMenu(event.pageY, event.pageX);
                    this.setupActionMenu(actionClickedCallback);
                });
            }
        }

        getOriginalActionMenu() {
            return window.document.querySelector('#original-options-dropdown');
        }

        getActionMenu() {
            return window.document.querySelector('#options-dropdown');
        }

        /**
         * Shows the action menu, if not already open
         * @param {number} top 
         * @param {number} left 
         * @return {boolean} success of the operation
         */
        showActionMenu(top, left) {
            if (this.isActionMenuOpen) {
                console.log('Action menu already open :(');
                return false;
            }

            // get the original action menu
            const originalActionMenu = this.getOriginalActionMenu();

            // make a copy of it
            const actionMenu = originalActionMenu.cloneNode(true);
            actionMenu.setAttribute('id', 'options-dropdown');

            // place it as needed
            actionMenu.style.top = `${top}px`;
            actionMenu.style.left = `${left}px`;
            actionMenu.style.display = 'block';

            // add it to the page
            window.document.querySelector('.content').appendChild(actionMenu);

            this.isActionMenuOpen = true;
            return true;
        }

        /**
         * Hides the action menu, if not already hidden
         * @return {boolean} success of the operation
         */
        hideActionMenu() {
            if (!this.isActionMenuOpen) {
                return false;
            }

            const actionMenu = this.getActionMenu();
            if (!actionMenu) {
                return true;
            }

            window.document.querySelector('.content').removeChild(actionMenu);
            this.isActionMenuOpen = false;
            return true;
        }

        /**
         * Sets up event listeners for action menu option clicking
         * @param {string} optionClickedCallback Callback called with name of option clicked 
         */
        setupActionMenu(optionClickedCallback) {
            const actionMenu = this.getActionMenu();
            for (const option of actionMenu.children) {
                option.addEventListener('click', () => {
                    optionClickedCallback(option.innerText);
                });
            }
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
            this.page.setupActionIcons(name => {
                console.log(`${name} clicked`);
            });

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