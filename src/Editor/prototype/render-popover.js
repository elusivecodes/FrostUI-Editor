/**
 * Toolbar Render Popover
 */

Object.assign(Editor.prototype, {

    /**
     * Render the popover elements.
     */
    _renderPopover() {
        this._popover = dom.create('div', {
            class: this.constructor.classes.popover,
            attributes: {
                role: 'tooltip'
            },
            style: {
                maxWidth: 'initial'
            }
        });

        this._popoverArrow = dom.create('div', {
            class: this.constructor.classes.popoverArrow
        });

        this._popoverBody = dom.create('div', {
            class: this.constructor.classes.popoverBody
        });

        dom.hide(this._popover);
        dom.append(this._popover, this._popoverArrow);
        dom.append(this._popover, this._popoverBody);
        dom.append(this._container, this._popover);
    },

    /**
     * Render a popover item.
     * @param {string} type The item type.
     * @param {HTMLElement} parent The parent element.
     */
    _renderPopoverItem(type, parent) {
        const data = this.constructor.popovers[type];

        let node;
        if (data.render) {
            node = data.render.bind(this)(this._currentNode);
        } else {
            node = this._renderButton({
                icon: type,
                title: this.constructor.lang.popovers[type],
                ...data
            });

            dom.setDataset(node, 'uiAction', type);
        }

        dom.append(parent, node);
    },

    /**
     * Render popover items.
     * @param {Array} items The items to render.
     */
    _renderPopoverItems(items) {
        for (const item of items) {
            if (Core.isString(item)) {
                this._renderPopoverItem(item, this._popoverBody);
            } else {
                const node = dom.create('div', {
                    class: this.constructor.classes.btnGroup,
                    attributes: {
                        role: 'group'
                    }
                });

                for (const type of item) {
                    this._renderPopoverItem(type, node);
                }

                dom.append(this._popoverBody, node);
            }
        }
    },

});
