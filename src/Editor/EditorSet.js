/**
 * EditorSet Class
 * @class
 */
class EditorSet {

    /**
     * Add an Editor to the set.
     * @param {Editor} editor The editor to add.
     */
    static add(editor) {
        this._editors.push(editor);

        if (this._running) {
            return;
        }

        this._dragCount = 0;

        dom.addEvent(document.body, 'dragenter.ui.editor', _ => {
            if (this._dragCount === 0) {
                for (const editor of this._editors) {
                    editor._showDropTarget();
                }
            }

            this._dragCount++;
        });

        dom.addEvent(document.body, 'dragleave.ui.editor', _ => {
            this._dragCount--;

            if (this._dragCount === 0) {
                for (const editor of this._editors) {
                    editor._resetDropText();
                    dom.hide(editor._dropTarget);
                }
            }
        });

        dom.addEvent(document.body, 'dragend.ui.editor drop.ui.editor', _ => {
            this._dragCount = 0;
        });

        dom.addEvent(window, 'click.ui.editor', _ => {
            for (const editor of this._editors) {
                editor._removePopover();
            }
        });

        dom.addEvent(window, 'resize.ui.editor', DOM.debounce(_ => {
            for (const editor of this._editors) {
                if (editor._currentNode && dom.is(editor._currentNode, 'img')) {
                    editor._highlightImage(editor._currentNode);
                }
            }
        }));

        this._running = true;
    }

    /**
     * Remove a Editor from the set.
     * @param {Editor} editor The editor to remove.
     */
    static remove(editor) {
        this._editors = this._editors.filter(oldEditor => oldEditor !== editor);

        if (this._editors.length) {
            return;
        }

        dom.removeEvent(document.body, 'dragenter.ui.editor');
        dom.removeEvent(document.body, 'dragleave.ui.editor');
        dom.removeEvent(document.body, 'dragend.ui.editor');
        dom.removeEvent(window, 'click.ui.editor');
        dom.removeEvent(window, 'resize.ui.editor');

        this._running = false;
    }

}
