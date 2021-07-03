/**
 * Editor Helpers
 */

Object.assign(Editor.prototype, {

    /**
     * Check if the editor is empty and populate base markup.
     */
    _checkEmpty() {
        const html = dom.getHTML(this._node).trim();

        if (html || html === '<br>') {
            return;
        }

        this._noMutate = true;

        dom.setHTML(this._editor, this.constructor._baseMarkup);
        dom.setHTML(this._node, this.constructor._baseMarkup);
        dom.setValue(this._source, this.constructor._baseMarkup);
    },

    /**
     * Cleanup editor element styles.
     */
    _cleanupStyles() {
        const nodes = dom.find('[style=""]', this._editor);

        if (!nodes.length) {
            return;
        }

        for (const node of nodes) {
            this._noMutate = true;
            dom.removeAttribute(node, 'style');
        }

        const html = dom.getHTML(this._editor);
        dom.setHTML(this._node, html);
        dom.setValue(this._source, html);
    },

    /**
     * Execute a command.
     * @param {string} command The command.
     * @param {Boolean|string} [value] The command argument.
     * @returns {Editor} The Editor.
     */
    _execCommand(command, value) {
        this._focusEditor();

        document.execCommand('styleWithCSS', false, this.constructor._cssCommands.includes(command));
        document.execCommand(command, false, value);

        return this;
    },

    /**
     * Ensure the editor element has focus.
     */
    _focusEditor() {
        if (dom.hasDescendent(this._editor, document.activeElement)) {
            return;
        }

        const selection = window.getSelection();

        if (dom.hasDescendent(this._editor, selection.anchorNode)) {
            return;
        }

        this._noFocus = true;
        dom.focus(this._editor);
        this._noFocus = false;
    },

    /**
     * Refresh the popover at cursor.
     */
    _refreshCursor() {
        const selection = window.getSelection();
        const baseNode = selection.baseNode;

        if (!dom.hasDescendent(this._editor, baseNode)) {
            return this._removePopover();
        }

        const currentNode = dom.is(baseNode, 'a') ?
            baseNode :
            dom.closest(baseNode, 'a', this._editor).shift();

        if (!currentNode) {
            return this._removePopover();
        }

        this._refreshPopover(currentNode);
    },

    /**
     * Refresh the source line numbers.
     */
    _refreshLineNumbers() {
        const html = dom.getValue(this._source);
        const lineCount = html.split("\n").length;
        const lines = dom.children(this._lineNumbers);

        if (lineCount === lines.length) {
            return;
        }

        if (lineCount <= lines.length) {
            const removeLines = lines.slice(lineCount);
            dom.remove(removeLines);
            return;
        }

        for (let i = lines.length + 1; i <= lineCount; i++) {
            const div = dom.create('div', {
                text: i
            });
            dom.append(this._lineNumbers, div);
        }
    },

    /**
     * Refresh the toolbar.
     */
    _refreshToolbar() {
        this._focusEditor();

        for (const { button, data } of this._buttons) {
            if ('setContent' in data) {
                const content = data.setContent.bind(this)();
                dom.setHTML(button, content);
            }

            let on = false;
            if ('command' in data) {
                on = 'value' in data ?
                    document.queryCommandValue(data.command) === data.value :
                    document.queryCommandState(data.command)
            }

            if (on) {
                dom.addClass(button, 'active');
            } else {
                dom.removeClass(button, 'active');
            }

            if ('disableCheck' in data && data.disableCheck.bind(this)()) {
                dom.addClass(button, 'disabled');
            } else {
                dom.removeClass(button, 'disabled');
            }
        }
    },

    /**
     * Reset the drop text.
     */
    _resetDropText() {
        dom.removeClass(this._dropText, this.constructor.classes.dropHover);
        dom.setText(this._dropText, this.constructor.lang.drop.dropHere);
    },

    /**
     * Show the drop target.
     */
    _showDropTarget() {
        if (dom.isVisible(this._sourceContainer)) {
            return;
        }

        dom.show(this._dropTarget);
    },

    /**
     * Show the editor.
     */
    _showEditor() {
        dom.show(this._editorOuter);
        dom.hide(this._sourceOuter);
    },

    /**
     * Show the source.
     */
    _showSource() {
        dom.show(this._sourceOuter);
        dom.hide(this._editorOuter);
        dom.hide(this._imgHighlight);

        for (const { button, type } of this._buttons) {
            if (!['source', 'fullScreen'].includes(type)) {
                dom.addClass(button, 'disabled');
            }
        }
    }

});
