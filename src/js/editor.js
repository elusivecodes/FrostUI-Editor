import $ from '@fr0st/query';
import { BaseComponent, Modal } from '@fr0st/ui';
import { addEditor, removeEditor } from './helpers.js';
import { getRange, selectRange } from './selection.js';

/**
 * Editor
 * @class
 */
export default class Editor extends BaseComponent {
    /**
     * New Editor constructor.
     * @param {HTMLElement} node The input node.
     * @param {object} [options] The options to create the Editor with.
     */
    constructor(node, options) {
        super(node, options);

        if (!this._options.buttons) {
            this._options.buttons = this.constructor.buttons;
        }

        if (!this._options.fonts) {
            this._options.fonts = this.constructor.fonts;
        }

        this._options.fonts = this._options.fonts.filter((font) => document.fonts.check(`12px ${font}`));

        if (!this._options.fonts.includes(this._options.defaultFont)) {
            this._options.defaultFont = this._options.fonts.slice().shift();
        }

        this._buttons = [];
        this._history = [];
        this._redoHistory = [];

        this._render();

        const html = $.getValue(this._node);
        $.setHTML(this._editor, html);
        $.setValue(this._source, html);

        const range = getRange();

        this._focusEditor();
        this._execCommand('defaultParagraphSeparator', 'p');
        this._checkEmpty();
        this._refreshToolbar();

        selectRange(range);

        this._events();
        this._normalize();
        this._updateValue();
        this._refreshDisabled();

        addEditor(this);

        $.triggerEvent(this._node, 'init.ui.editor');
    }

    /**
     * Set the background color.
     * @param {string} value The background color.
     */
    backColor(value) {
        this._execCommand('backColor', value);
    }

    /**
     * Toggle bold state.
     */
    bold() {
        this._execCommand('bold');
    }

    /**
     * Disable the Editor.
     */
    disable() {
        $.setAttribute(this._node, { disabled: true });
        this._refreshDisabled();
        this._refreshToolbar();
    }

    /**
     * Dispose the Editor.
     */
    dispose() {
        removeEditor(this);

        if (this._popper) {
            this._popper.dispose();
            this._popper = null;
        }

        if (this._modal) {
            Modal.init(this._modal).dispose();
            $.remove(this._modal);
            this._modal = null;
        }

        if (this._fullScreen) {
            Modal.init(this._fullScreen).dispose();
            $.remove(this._fullScreen);
            this._fullScreen = null;
        }

        this._observer.disconnect();
        this._observer = null;
        this._observe = null;

        $.remove(this._container);
        $.show(this._node);
        $.removeAttribute(this._node, 'tabindex');

        this._buttons = null;

        this._container = null;
        this._toolbar = null;
        this._editorBody = null;
        this._editorContainer = null;
        this._editorScroll = null;
        this._editor = null;
        this._imgHighlight = null;
        this._imgCursor = null;
        this._imgResize = null;
        this._imgSize = null;
        this._sourceOuter = null;
        this._sourceContainer = null;
        this._sourceScroll = null;
        this._lineNumbers = null;
        this._source = null;
        this._popover = null;
        this._popoverArrow = null;
        this._popoverBody = null;
        this._dropTarget = null;
        this._dropText = null;
        this._resizeBar = null;
        this._currentNode = null;
        this._lastRange = null;
        this._history = null;
        this._redoHistory = null;

        super.dispose();
    }

    /**
     * Enable the Editor.
     */
    enable() {
        $.removeAttribute(this._node, 'disabled');
        this._refreshDisabled();
        this._refreshToolbar();
    }

    /**
     * Set the font family.
     * @param {string} value The font family.
     */
    fontName(value) {
        this._execCommand('fontName', value);
    }

    /**
     * Set the font size.
     * @param {string} value The font size.
     */
    fontSize(value) {
        value = Object.keys(this.constructor.fontSizes)
            .find((key) => this.constructor.fontSizes[key] === value);

        this._execCommand('fontSize', value);
    }

    /**
     * Format the selected block level element.
     * @param {string} value The tag name.
     */
    formatBlock(value) {
        this._execCommand('formatBlock', value);
    }

    /**
     * Set the foreground color.
     * @param {string} value The foreground color.
     */
    foreColor(value) {
        this._execCommand('foreColor', value);
    }

    /**
     * Indent the selection.
     */
    indent() {
        this._execCommand('indent');
    }

    /**
     * Insert a horizontal rule.
     */
    insertHorizontalRule() {
        this._execCommand('insertHorizontalRule');
    }

    /**
     * Insert a HTML string.
     * @param {string} value The HTML string.
     */
    insertHTML(value) {
        this._execCommand('insertHTML', value);
    }

    /**
     * Insert an image.
     * @param {string} src The image src.
     */
    insertImage(src) {
        const img = $.create('img', {
            attributes: { src },
        });

        const newImg = this._insertNode(img);

        const image = new Image;
        image.onload = (_) => {
            const maxWidth = $.width(this._editor, { boxSize: $.CONTENT_BOX });
            const width = Math.min(image.width, maxWidth);
            $.setStyle(newImg, 'width', `${width}px`);
        };

        image.src = src;
    }

    /**
     * Insert a link.
     * @param {string} href The link href.
     * @param {string} text The link text.
     * @param {Boolean} [newWindow] Whether to open the link in a new window.
     */
    insertLink(href, text, newWindow) {
        const link = $.create('a', {
            text,
            attributes: {
                href,
            },
        });

        if (newWindow) {
            $.setAttribute(link, { target: '_blank' });
        }

        this._insertNode(link);
    }

    /**
     * Insert a text string.
     * @param {string} value The text.
     */
    insertText(value) {
        this._execCommand('insertText', value);
    }

    /**
     * Create an ordered list for the selection.
     */
    insertOrderedList() {
        this._execCommand('insertOrderedList');
    }

    /**
     * Create an unordered list for the selection.
     */
    insertUnorderedList() {
        this._execCommand('insertUnorderedList');
    }

    /**
     * Toggle italic state.
     */
    italic() {
        this._execCommand('italic');
    }

    /**
     * Center the selection.
     */
    justifyCenter() {
        this._execCommand('justifyCenter');
    }

    /**
     * Justify the selection.
     */
    justifyFull() {
        this._execCommand('justifyFull');
    }

    /**
     * Align the selection to the left.
     */
    justifyLeft() {
        this._execCommand('justifyLeft');
    }

    /**
     * Align the selection to the right.
     */
    justifyRight() {
        this._execCommand('justifyRight');
    }

    /**
     * Outdent the selection.
     */
    outdent() {
        this._execCommand('outdent');
    }

    /**
     * Perform a redo.
     */
    redo() {
        if (!this._redoHistory.length) {
            return;
        }

        const current = this._redoHistory.pop();

        this._addHistory(current);
        this._restoreHistory(current);
    }

    /**
     * Remove all formatting from the selection.
     */
    removeFormat() {
        this._execCommand('removeFormat');
    }

    /**
     * Toggle strikethrough state.
     */
    strikethrough() {
        this._execCommand('strikethrough');
    }

    /**
     * Toggle subscript state.
     */
    subscript() {
        this._execCommand('subscript');
    }

    /**
     * Toggle superscript state.
     */
    superscript() {
        this._execCommand('superscript');
    }

    /**
     * Toggle underline state.
     */
    underline() {
        this._execCommand('underline');
    }

    /**
     * Perform an undo.
     */
    undo() {
        if (this._history.length <= 1) {
            return;
        }

        const next = this._history.pop();
        this._redoHistory.push(next);

        const current = this._history.at(-1);

        this._restoreHistory(current);
    }

    /**
     * Remove the selected anchor element.
     */
    unlink() {
        this._execCommand('unlink');
    }
}
