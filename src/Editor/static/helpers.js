/**
 * Editor (Static) Helpers
 */

Object.assign(Editor, {

    /**
     * Generate a random ID.
     * @returns {string} The id.
     */
    _generateId() {
        return Core.randomString();
    },

    /**
     * Get the current selected range.
     * @returns {Range} The Range object.
     */
    _getRange() {
        const selection = window.getSelection();

        if (!selection.rangeCount) {
            return null;
        }

        return selection.getRangeAt(0);
    },

    /**
     * Select a node.
     * @param {HTMLElement} node The element to select.
     * @returns {Range} The Range object.
     */
    _selectNode(node) {
        const range = dom.createRange();
        range.selectNode(node);

        this._selectRange(range);

        return range;
    },

    /**
     * Select a range.
     * @param {Range} range The range to select.
     */
    _selectRange(range) {
        if (!range) {
            return;
        }

        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    }

});
