/**
 * Editor
 * @class
 */
class Editor extends UI.BaseComponent {

    /**
     * New Editor constructor.
     * @param {HTMLElement} node The input node.
     * @param {object} [settings] The options to create the Editor with.
     * @returns {Editor} A new Editor object.
     */
    constructor(node, settings) {
        super(node, settings);

        if (!this._settings.buttons) {
            this._settings.buttons = this.constructor.buttons;
        }

        if (!this._settings.fonts) {
            this._settings.fonts = this.constructor.fonts;
        }

        this._settings.fonts = this._settings.fonts.filter(font => {
            return document.fonts.check(`12px ${font}`);
        });

        if (!this._settings.fonts.includes(this._settings.defaultFont)) {
            this._settings.defaultFont = this._settings.fonts.slice().shift();
        }

        this._buttons = [];

        this._id = 'editor' + this.constructor._generateId();

        this._render();
        this._events();

        const html = dom.getValue(this._node);
        dom.setHTML(this._editor, html);
        dom.setValue(this._source, html);

        this._focusEditor();
        this._execCommand('defaultParagraphSeparator', 'p');
        this._checkEmpty();
        this._refreshToolbar();
        this._refreshLineNumbers();
        dom.blur(this._editor);

        EditorSet.add(this);

        dom.triggerEvent(this._node, 'init.ui.editor');
    }

    /**
     * Dispose the Editor.
     */
    dispose() {
        EditorSet.remove(this);

        if (this._popper) {
            this._popper.dispose();
            this._popper = null;
        }

        if (this._modal) {
            UI.Modal.init(this._modal).dispose();
            dom.remove(this._modal);
            this._modal = null;
        }

        if (this._fullScreen) {
            UI.Modal.init(this._fullScreen).dispose();
            dom.remove(this._fullScreen);
            this._fullScreen = null;
        }

        this._observer.disconnect();
        this._observer = null;

        dom.remove(this._container);
        dom.show(this._node);
        dom.removeAttribute(this._node, 'tabindex');

        this._buttons = null;

        this._container = null;
        this._toolbar = null;
        this._editorBody = null;
        this._editorContainer = null;
        this._editor = null;
        this._imgHighlight = null;
        this._imgCursor = null;
        this._imgResize = null;
        this._sourceContainer = null;
        this._lineNumbers = null;
        this._source = null;
        this._popover = null;
        this._popoverArrow = null;
        this._popoverBody = null;
        this._dropTarget = null;
        this._dropText = null;
        this._resizeBar = null;
        this._currentNode = null;

        super.dispose();
    }

}
