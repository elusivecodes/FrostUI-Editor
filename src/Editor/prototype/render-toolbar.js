/**
 * Toolbar Render Toolbar
 */

Object.assign(Editor.prototype, {

    /**
     * Render the toolbar.
     */
    _renderToolbar() {
        const header = dom.create('div', {
            class: this.constructor.classes.toolbar
        });

        this._toolbar = dom.create('div', {
            class: this.constructor.classes.toolbarButtons,
            attributes: {
                role: 'toolbar'
            }
        });

        for (const buttons of this._settings.buttons) {
            const buttonGroup = dom.create('div', {
                class: this.constructor.classes.btnGroup
            });

            for (const type of buttons) {
                this._renderToolbarButton(type, buttonGroup);
            }

            dom.append(this._toolbar, buttonGroup);
        }

        dom.append(header, this._toolbar);
        dom.append(this._container, header);
    },

    /**
     * Render a toolbar button.
     * @param {string} type The button type.
     * @param {HTMLElement} parent The parent element.
     */
    _renderToolbarButton(type, parent) {
        const data = this.constructor.plugins[type];

        const button = this._renderButton({
            icon: type,
            title: this.constructor.lang.plugins[type],
            ...data
        });

        this._buttons.push({ button, data, type });

        this._setToolbarData(button, data, type);

        if ('dropdown' in data) {
            this._renderToolbarDropdown(parent, button, data.dropdown);
        } else {
            dom.append(parent, button);
        }
    },

    /**
     * Render a toolbar dropdown.
     * @param {HTMLElement} buttonGroup The button group element.
     * @param {HTMLElement} button The button element.
     * @param {Array|function} dropdownContent The dropdown content.
     */
    _renderToolbarDropdown(buttonGroup, button, dropdownContent) {
        const dropGroup = dom.create('div', {
            class: this.constructor.classes.dropdownGroup,
            attributes: {
                role: 'group'
            }
        });

        dom.addClass(button, this.constructor.classes.dropdownToggle);
        dom.setDataset(button, 'uiToggle', 'dropdown');
        dom.setAttribute(button, 'aria-has-popup', true);
        dom.setAttribute(button, 'aria-expanded', false);
        dom.append(dropGroup, button);

        const dropdown = dom.create('div', {
            class: this.constructor.classes.dropdown
        });

        if (Core.isArray(dropdownContent)) {
            dom.addClass(dropdown, this.constructor.classes.dropdownButtons);

            for (const dropdownItems of dropdownContent) {
                const subDropGroup = dom.create('div', {
                    class: this.constructor.classes.btnGroup,
                    attributes: {
                        role: 'group'
                    }
                });

                for (const type of dropdownItems) {
                    this._renderToolbarButton(type, subDropGroup);
                }

                dom.append(dropdown, subDropGroup);
            }
        } else if (Core.isFunction(dropdownContent)) {
            dropdownContent.bind(this)(dropdown);
        }

        dom.append(dropGroup, dropdown);
        dom.append(buttonGroup, dropGroup);
    },

    /**
     * Set data for a toolbar action.
     * @param {HTMLElement} node The action node.
     * @param {object} data The data to set.
     * @param {string} [type] The action type.
     */
    _setToolbarData(node, data, type) {
        if (data.command) {
            dom.setDataset(node, 'uiCommand', data.command);

            if (data.value) {
                dom.setDataset(node, 'uiValue', data.value);
            }
        } else if (data.action && type) {
            dom.setDataset(node, 'uiAction', type);
        }
    }

});
