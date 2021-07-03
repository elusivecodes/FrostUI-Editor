/**
 * Editor API
 */

Object.assign(Editor.prototype, {

    /**
     * Set the background color.
     * @param {string} value The background color.
     * @returns {Editor} The Editor.
     */
    backColor(value) {
        return this._execCommand('backColor', value);
    },

    /**
     * Toggle bold state.
     * @returns {Editor} The Editor.
     */
    bold() {
        return this._execCommand('bold');
    },

    /**
     * Set the font family.
     * @param {string} value The font family.
     * @returns {Editor} The Editor.
     */
    fontName(value) {
        return this._execCommand('fontName', value);
    },

    /**
     * Set the font size.
     * @param {string} value The font size.
     * @returns {Editor} The Editor.
     */
    fontSize(value) {
        value = Object.keys(this.constructor.fontSizes)
            .find(key => this.constructor.fontSizes[key] === value);

        return this._execCommand('fontSize', value);
    },

    /**
     * Format the selected block level element.
     * @param {string} value The tag name.
     * @returns {Editor} The Editor.
     */
    formatBlock(value) {
        return this._execCommand('formatBlock', value);
    },

    /**
     * Set the foreground color.
     * @param {string} value The foreground color.
     * @returns {Editor} The Editor.
     */
    foreColor(value) {
        return this._execCommand('foreColor', value);
    },

    /**
     * Indent the selection.
     * @returns {Editor} The Editor.
     */
    indent() {
        return this._execCommand('indent');
    },

    /**
     * Insert a horizontal rule.
     * @returns {Editor} The Editor.
     */
    insertHorizontalRule() {
        return this._execCommand('insertHorizontalRule');
    },

    /**
     * Insert a HTML string.
     * @param {string} value The HTML string.
     * @returns {Editor} The Editor.
     */
    insertHTML(value) {
        return this._execCommand('insertHTML', value);
    },

    /**
     * Insert an image.
     * @param {string} src The image src.
     * @returns {Editor} The Editor.
     */
    insertImage(src) {
        const img = dom.create('img', {
            attributes: { src }
        });

        const newImg = this._insertNode(img);

        const image = new Image;
        image.onload = _ => {
            const maxWidth = dom.width(this._editor, DOM.CONTENT_BOX);
            const width = Math.min(image.width, maxWidth);
            dom.setStyle(newImg, 'width', `${width}px`);
        };

        image.src = src;

        return this;
    },

    /**
     * Insert a link.
     * @param {string} href The link href.
     * @param {string} text The link text.
     * @param {Boolean} [newWindow] Whether to open the link in a new window.
     * @returns {Editor} The Editor.
     */
    insertLink(href, text, newWindow) {
        const link = dom.create('a', {
            text,
            attributes: {
                href
            }
        });

        if (newWindow) {
            dom.setAttribute(link, 'target', '_blank');
        }

        this._insertNode(link);

        return this;
    },

    /**
     * Insert a text string.
     * @param {string} value The text.
     * @returns {Editor} The Editor.
     */
    insertText(value) {
        return this._execCommand('insertText', value);
    },

    /**
     * Create an ordered list for the selection.
     * @returns {Editor} The Editor.
     */
    insertOrderedList() {
        return this._execCommand('insertOrderedList');
    },

    /**
     * Create an unordered list for the selection.
     * @returns {Editor} The Editor.
     */
    insertUnorderedList() {
        return this._execCommand('insertUnorderedList');
    },

    /**
     * Toggle italic state.
     * @returns {Editor} The Editor.
     */
    italic() {
        return this._execCommand('italic');
    },

    /**
     * Center the selection.
     * @returns {Editor} The Editor.
     */
    justifyCenter() {
        return this._execCommand('justifyCenter');
    },

    /**
     * Justify the selection.
     * @returns {Editor} The Editor.
     */
    justifyFull() {
        return this._execCommand('justifyFull');
    },

    /**
     * Align the selection to the left.
     * @returns {Editor} The Editor.
     */
    justifyLeft() {
        return this._execCommand('justifyLeft');
    },

    /**
     * Align the selection to the right.
     * @returns {Editor} The Editor.
     */
    justifyRight() {
        return this._execCommand('justifyRight');
    },

    /**
     * Outdent the selection.
     * @returns {Editor} The Editor.
     */
    outdent() {
        return this._execCommand('outdent');
    },

    /**
     * Perform a redo.
     * @returns {Editor} The Editor.
     */
    redo() {
        return this._execCommand('redo');
    },

    /**
     * Remove all formatting from the selection.
     * @returns {Editor} The Editor.
     */
    removeFormat() {
        return this._execCommand('removeFormat');
    },

    /**
     * Toggle strikethrough state.
     * @returns {Editor} The Editor.
     */
    strikethrough() {
        return this._execCommand('strikethrough');
    },

    /**
     * Toggle subscript state.
     * @returns {Editor} The Editor.
     */
    subscript() {
        return this._execCommand('subscript');
    },

    /**
     * Toggle superscript state.
     * @returns {Editor} The Editor.
     */
    superscript() {
        return this._execCommand('superscript');
    },

    /**
     * Toggle underline state.
     * @returns {Editor} The Editor.
     */
    underline() {
        return this._execCommand('underline');
    },

    /**
     * Perform an undo.
     * @returns {Editor} The Editor.
     */
    undo() {
        this._execCommand('undo');

        // fix for preserve previous range
        if (document.queryCommandEnabled('undo')) {
            this._execCommand('undo');
            this._execCommand('redo');
        } else {
            const range = this.constructor._getRange();

            if (range && !range.collapsed) {
                range.collapse();
            }
        }

        return this;
    },

    /**
     * Remove the selected anchor element.
     * @returns {Editor} The Editor.
     */
    unlink() {
        return this._execCommand('unlink');
    }

});
