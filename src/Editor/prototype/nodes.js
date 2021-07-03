/**
 * Editor Nodes
 */

Object.assign(Editor.prototype, {

    /**
     * Insert a (cloned) node into the editor.
     * @param {HTMLElement} node The node to insert.
     * @returns The new node.
     */
    _insertNode(node) {
        const id = this.constructor._generateId();

        dom.setDataset(node, 'uiEditorNode', id);
        const html = dom.getProperty(node, 'outerHTML');

        this.insertHTML(html);

        const newNode = dom.findOne(`[data-ui-editor-node="${id}"]`, this._editor);

        dom.removeDataset(newNode, 'uiEditorNode');

        return newNode;
    },

    /**
     * Remove a node from the editor.
     * @param {HTMLElement} node The node to remove.
     */
    _removeNode(node) {
        if (!dom.hasDescendent(this._editor, node)) {
            return;
        }

        this.constructor._selectNode(node);
        document.execCommand('delete', false);
    },

    /**
     * Replace a node in the editor.
     * @param {HTMLElement} oldNode The node being replaced.
     * @param {HTMLElement} node The replacement node.
     * @returns The new node.
     */
    _replaceNode(oldNode, node) {
        this._focusEditor();
        const range = this.constructor._selectNode(oldNode);
        const newNode = this._insertNode(node);
        range.collapse();

        return newNode;
    },

    /**
     * Set a style attribute for an element.
     * @param {HTMLElement} node The image element.
     * @param {string} property The property to modify.
     * @param {string} value The new property value.
     */
    _setStyle(node, property, value) {
        const currentValue = dom.getStyle(node, property);

        if (currentValue === value) {
            return;
        }

        const newNode = dom.clone(node);
        dom.setStyle(newNode, property, value);

        this._removePopover();
        this._replaceNode(node, newNode);
    },

    /**
     * Update a table element.
     * @param {HTMLElement} td The td element.
     * @param {function} callback The callback.
     */
    _updateTable(td, callback) {
        const id = this.constructor._generateId();

        dom.setDataset(td, 'uiEditorNode', id);
        const table = dom.closest(td, 'table', this._editor).shift();

        const tempTable = dom.clone(table).shift();
        const tempTd = dom.findOne(`[data-ui-editor-node="${id}"]`, tempTable);
        const tempTr = dom.closest(tempTd, 'tr').shift();

        callback(tempTd, tempTr, tempTable);

        const newTable = this._replaceNode(table, tempTable);
        const newNode = dom.findOne(`[data-ui-editor-node="${id}"]`, newTable);

        dom.removeDataset(newNode, 'uiEditorNode');

        this._removePopover();

        const range = this.constructor._selectNode(newNode);
        range.collapse(true);
    }

});
