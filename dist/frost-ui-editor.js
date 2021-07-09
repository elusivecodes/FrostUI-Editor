/**
 * FrostUI-Editor v1.0.4
 * https://github.com/elusivecodes/FrostUI-Editor
 */
(function(global, factory) {
    'use strict';

    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = factory;
    } else {
        factory(global);
    }

})(window, function(window) {
    'use strict';

    if (!window) {
        throw new Error('FrostUI-Editor requires a Window.');
    }

    if (!('UI' in window)) {
        throw new Error('FrostUI-Editor requires FrostUI.');
    }

    const Core = window.Core;
    const DOM = window.DOM;
    const dom = window.dom;
    const UI = window.UI;
    const document = window.document;

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

            const html = dom.getHTML(this._node);
            dom.setHTML(this._editor, html);
            dom.setValue(this._source, html);

            this._focusEditor();
            this._execCommand('defaultParagraphSeparator', 'p');
            this._checkEmpty();
            this._refreshToolbar();
            this._refreshLineNumbers();

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

            dom.removeEvent(document.body, 'dragenter.ui.editor dragleave.ui.editor dragend.ui.editor');
            dom.removeEvent(window, 'click.ui.editor resize.ui.editor');

            this._running = false;
        }

    }


    /**
     * Editor Icons
     */

    Editor.icons = {
        alignCenter: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M3 3h18v2H3V3m4 4h10v2H7V7m-4 4h18v2H3v-2m4 4h10v2H7v-2m-4 4h18v2H3v-2z" fill="currentColor"/></svg>',
        alignJustify: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M3 3h18v2H3V3m0 4h18v2H3V7m0 4h18v2H3v-2m0 4h18v2H3v-2m0 4h18v2H3v-2z" fill="currentColor"/></svg>',
        alignLeft: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M3 3h18v2H3V3m0 4h12v2H3V7m0 4h18v2H3v-2m0 4h12v2H3v-2m0 4h18v2H3v-2z" fill="currentColor"/></svg>',
        alignRight: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M3 3h18v2H3V3m6 4h12v2H9V7m-6 4h18v2H3v-2m6 4h12v2H9v-2m-6 4h18v2H3v-2z" fill="currentColor"/></svg>',
        bold: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M13.5 15.5H10v-3h3.5A1.5 1.5 0 0 1 15 14a1.5 1.5 0 0 1-1.5 1.5m-3.5-9h3A1.5 1.5 0 0 1 14.5 8A1.5 1.5 0 0 1 13 9.5h-3m5.6 1.29c.97-.68 1.65-1.79 1.65-2.79c0-2.26-1.75-4-4-4H7v14h7.04c2.1 0 3.71-1.7 3.71-3.79c0-1.52-.86-2.82-2.15-3.42z" fill="currentColor"/></svg>',
        floatLeft: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M3 7h6v6H3V7m0-4h18v2H3V3m18 4v2H11V7h10m0 4v2H11v-2h10M3 15h14v2H3v-2m0 4h18v2H3v-2z" fill="currentColor"/></svg>',
        floatNone: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M3 7h6v6H3V7m0-4h18v2H3V3m18 8v2H11v-2h10M3 15h14v2H3v-2m0 4h18v2H3v-2z" fill="currentColor"/></svg>',
        floatRight: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M15 7h6v6h-6V7M3 3h18v2H3V3m10 4v2H3V7h10m-4 4v2H3v-2h6m-6 4h14v2H3v-2m0 4h18v2H3v-2z" fill="currentColor"/></svg>',
        fullScreen: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M9.5 13.09l1.41 1.41l-4.5 4.5H10v2H3v-7h2v3.59l4.5-4.5m1.41-3.59L9.5 10.91L5 6.41V10H3V3h7v2H6.41l4.5 4.5m3.59 3.59l4.5 4.5V14h2v7h-7v-2h3.59l-4.5-4.5l1.41-1.41M13.09 9.5l4.5-4.5H14V3h7v7h-2V6.41l-4.5 4.5l-1.41-1.41z" fill="currentColor"/></svg>',
        hr: '<span class="d-block" style="width: 12px; border-bottom: 2px solid currentColor;"></span>',
        image: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M8.5 13.5l2.5 3l3.5-4.5l4.5 6H5m16 1V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z" fill="currentColor"/></svg>',
        imageOriginal: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M12 8c-3.56 0-5.35 4.31-2.83 6.83C11.69 17.35 16 15.56 16 12c0-2.21-1.79-4-4-4m-7 7H3v4c0 1.1.9 2 2 2h4v-2H5M5 5h4V3H5c-1.1 0-2 .9-2 2v4h2m14-6h-4v2h4v4h2V5c0-1.1-.9-2-2-2m0 16h-4v2h4c1.1 0 2-.9 2-2v-4h-2" fill="currentColor"/></svg>',
        imageRemove: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M5 3c-1.1 0-2 .9-2 2v14a2 2 0 0 0 2 2h9.09c-.06-.33-.09-.66-.09-1c0-.68.12-1.36.35-2H5l3.5-4.5l2.5 3l3.5-4.5l2.23 2.97c.97-.63 2.11-.97 3.27-.97c.34 0 .67.03 1 .09V5a2 2 0 0 0-2-2H5m11.47 14.88L18.59 20l-2.12 2.12l1.41 1.42L20 21.41l2.12 2.13l1.42-1.42L21.41 20l2.13-2.12l-1.42-1.42L20 18.59l-2.12-2.12l-1.42 1.41z" fill="currentColor"/></svg>',
        indent: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M11 13h10v-2H11m0-2h10V7H11M3 3v2h18V3M11 17h10v-2H11M3 8v8l4-4m-4 9h18v-2H3v2z" fill="currentColor"/></svg>',
        italic: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4h-8z" fill="currentColor"/></svg>',
        link: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7a5 5 0 0 0-5 5a5 5 0 0 0 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1M8 13h8v-2H8v2m9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1c0 1.71-1.39 3.1-3.1 3.1h-4V17h4a5 5 0 0 0 5-5a5 5 0 0 0-5-5z" fill="currentColor"/></svg>',
        linkEdit: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M5 3c-1.11 0-2 .89-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7H5V5h7V3H5m12.78 1a.69.69 0 0 0-.48.2l-1.22 1.21l2.5 2.5L19.8 6.7c.26-.26.26-.7 0-.95L18.25 4.2c-.13-.13-.3-.2-.47-.2m-2.41 2.12L8 13.5V16h2.5l7.37-7.38l-2.5-2.5z" fill="currentColor"/></svg>',
        orderedList: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M7 13v-2h14v2H7m0 6v-2h14v2H7M7 7V5h14v2H7M3 8V5H2V4h2v4H3m-1 9v-1h3v4H2v-1h2v-.5H3v-1h1V17H2m2.25-7a.75.75 0 0 1 .75.75c0 .2-.08.39-.21.52L3.12 13H5v1H2v-.92L4 11H2v-1h2.25z" fill="currentColor"/></svg>',
        outdent: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M11 13h10v-2H11m0-2h10V7H11M3 3v2h18V3M3 21h18v-2H3m0-7l4 4V8m4 9h10v-2H11v2z" fill="currentColor"/></svg>',
        paragraph: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M10 11a4 4 0 0 1-4-4a4 4 0 0 1 4-4h8v2h-2v16h-2V5h-2v16h-2V11z" fill="currentColor"/></svg>',
        redo: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M18.4 10.6C16.55 9 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16a8.002 8.002 0 0 1 7.6-5.5c1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z" fill="currentColor"/></svg>',
        removeFormat: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M6 5v.18L8.82 8h2.4l-.72 1.68l2.1 2.1L14.21 8H20V5H6M3.27 5L2 6.27l6.97 6.97L6.5 19h3l1.57-3.66L16.73 21L18 19.73L3.55 5.27L3.27 5z" fill="currentColor"/></svg>',
        source: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M14.6 16.6l4.6-4.6l-4.6-4.6L16 6l6 6l-6 6l-1.4-1.4m-5.2 0L4.8 12l4.6-4.6L8 6l-6 6l6 6l1.4-1.4z" fill="currentColor"/></svg>',
        strikethrough: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M3 14h18v-2H3m2-8v3h5v3h4V7h5V4m-9 15h4v-3h-4v3z" fill="currentColor"/></svg>',
        style: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M18.5 4l1.16 4.35l-.96.26c-.45-.87-.91-1.74-1.44-2.18C16.73 6 16.11 6 15.5 6H13v10.5c0 .5 0 1 .33 1.25c.34.25 1 .25 1.67.25v1H9v-1c.67 0 1.33 0 1.67-.25c.33-.25.33-.75.33-1.25V6H8.5c-.61 0-1.23 0-1.76.43c-.53.44-.99 1.31-1.44 2.18l-.96-.26L5.5 4h13z" fill="currentColor"/></svg>',
        superscript: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M16 7.41L11.41 12L16 16.59L14.59 18L10 13.41L5.41 18L4 16.59L8.59 12L4 7.41L5.41 6L10 10.59L14.59 6L16 7.41M21.85 9h-4.88V8l.89-.82c.76-.64 1.32-1.18 1.7-1.63c.37-.44.56-.85.57-1.23a.884.884 0 0 0-.27-.7c-.18-.19-.47-.28-.86-.29c-.31.01-.58.07-.84.17l-.66.39l-.45-1.17c.27-.22.59-.39.98-.53S18.85 2 19.32 2c.78 0 1.38.2 1.78.61c.4.39.62.93.62 1.57c-.01.56-.19 1.08-.54 1.55c-.34.48-.76.93-1.27 1.36l-.64.52v.02h2.58V9z" fill="currentColor"/></svg>',
        table: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2m0 4v4h6V8H5m8 0v4h6V8h-6m-8 6v4h6v-4H5m8 0v4h6v-4h-6z" fill="currentColor"/></svg>',
        tableColumnAfter: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M11 2a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H2V2h9m-7 8v4h7v-4H4m0 6v4h7v-4H4M4 4v4h7V4H4m11 7h3V8h2v3h3v2h-3v3h-2v-3h-3v-2z" fill="currentColor"/></svg>',
        tableColumnBefore: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M13 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h9V2h-9m7 8v4h-7v-4h7m0 6v4h-7v-4h7m0-12v4h-7V4h7M9 11H6V8H4v3H1v2h3v3h2v-3h3v-2z" fill="currentColor"/></svg>',
        tableColumnRemove: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M4 2h7a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2m0 8v4h7v-4H4m0 6v4h7v-4H4M4 4v4h7V4H4m13.59 8L15 9.41L16.41 8L19 10.59L21.59 8L23 9.41L20.41 12L23 14.59L21.59 16L19 13.41L16.41 16L15 14.59L17.59 12z" fill="currentColor"/></svg>',
        tableRemove: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M15.46 15.88l1.42-1.42L19 16.59l2.12-2.13l1.42 1.42L20.41 18l2.13 2.12l-1.42 1.42L19 19.41l-2.12 2.13l-1.42-1.42L17.59 18l-2.13-2.12M4 3h14a2 2 0 0 1 2 2v7.08a6.01 6.01 0 0 0-4.32.92H12v4h1.08c-.11.68-.11 1.35 0 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2m0 4v4h6V7H4m8 0v4h6V7h-6m-8 6v4h6v-4H4z" fill="currentColor"/></svg>',
        tableRowAfter: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M22 10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V3h2v2h4V3h2v2h4V3h2v2h4V3h2v7M4 10h4V7H4v3m6 0h4V7h-4v3m10 0V7h-4v3h4m-9 4h2v3h3v2h-3v3h-2v-3H8v-2h3v-3z" fill="currentColor"/></svg>',
        tableRowBefore: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M22 14a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v7h2v-2h4v2h2v-2h4v2h2v-2h4v2h2v-7M4 14h4v3H4v-3m6 0h4v3h-4v-3m10 0v3h-4v-3h4m-9-4h2V7h3V5h-3V2h-2v3H8v2h3v3z" fill="currentColor"/></svg>',
        tableRowRemove: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M9.41 13L12 15.59L14.59 13L16 14.41L13.41 17L16 19.59L14.59 21L12 18.41L9.41 21L8 19.59L10.59 17L8 14.41L9.41 13M22 9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v3M4 9h4V6H4v3m6 0h4V6h-4v3m6 0h4V6h-4v3z" fill="currentColor"/></svg>',
        underline: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M5 21h14v-2H5v2m7-4a6 6 0 0 0 6-6V3h-2.5v8a3.5 3.5 0 0 1-3.5 3.5A3.5 3.5 0 0 1 8.5 11V3H6v8a6 6 0 0 0 6 6z" fill="currentColor"/></svg>',
        undo: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M12.5 8c-2.65 0-5.05 1-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88c3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z" fill="currentColor"/></svg>',
        unlink: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M17 7h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1c0 1.43-.98 2.63-2.31 3l1.46 1.44C20.88 15.61 22 13.95 22 12a5 5 0 0 0-5-5m-1 4h-2.19l2 2H16v-2M2 4.27l3.11 3.11A4.991 4.991 0 0 0 2 12a5 5 0 0 0 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1c0-1.59 1.21-2.9 2.76-3.07L8.73 11H8v2h2.73L13 15.27V17h1.73l4.01 4L20 19.74L3.27 3L2 4.27z" fill="currentColor"/></svg>',
        unorderedList: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M7 5h14v2H7V5m0 8v-2h14v2H7M4 4.5A1.5 1.5 0 0 1 5.5 6A1.5 1.5 0 0 1 4 7.5A1.5 1.5 0 0 1 2.5 6A1.5 1.5 0 0 1 4 4.5m0 6A1.5 1.5 0 0 1 5.5 12A1.5 1.5 0 0 1 4 13.5A1.5 1.5 0 0 1 2.5 12A1.5 1.5 0 0 1 4 10.5M7 19v-2h14v2H7m-3-2.5A1.5 1.5 0 0 1 5.5 18A1.5 1.5 0 0 1 4 19.5A1.5 1.5 0 0 1 2.5 18A1.5 1.5 0 0 1 4 16.5z" fill="currentColor"/></svg>',
        video: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4z" fill="currentColor"/></svg>'
    };


    /**
     * Editor Plugins
     */

    Editor.plugins = {
        alignCenter: {
            command: 'justifyCenter'
        },
        alignJustify: {
            command: 'justifyFull'
        },
        alignLeft: {
            command: 'justifyLeft'
        },
        alignRight: {
            command: 'justifyRight'
        },
        bold: {
            command: 'bold'
        },
        color: {
            setContent() {
                const backColor = document.queryCommandValue('backColor');
                const foreColor = document.queryCommandValue('foreColor');

                const span = dom.create('strong', {
                    text: 'A',
                    class: 'd-inline-block px-1 pe-none',
                    style: {
                        color: foreColor,
                        backgroundColor: backColor
                    }
                });

                return dom.getProperty(span, 'outerHTML');
            },
            dropdown(dropdown) {
                this._colorDropdown(dropdown);
            }
        },
        font: {
            setContent() {
                const fontName = document.queryCommandValue('fontName').replace(/"/g, '');

                return this._settings.fonts.includes(fontName) ? fontName : this._settings.defaultFont;
            },
            dropdown(dropdown) {
                this._fontDropdown(dropdown);
            }
        },
        fontSize: {
            setContent() {
                const size = document.queryCommandValue('fontSize');

                if (size) {
                    return this.constructor.fontSizes[size];
                }

                const fontSizePx = dom.css(this._editor, 'fontSize');
                const fontSize = parseFloat(fontSizePx);
                return Math.round(fontSize);
            },
            dropdown(dropdown) {
                this._fontSizeDropdown(dropdown);
            }
        },
        fullScreen: {
            action() {
                if (this._fullScreen) {
                    UI.Modal.init(this._fullScreen).hide();
                    return;
                }

                this._fullScreen = this.constructor._createModal({
                    content: this._container,
                    fullScreen: true,
                    onShown: _ => {
                        if (dom.isVisible(this._sourceContainer)) {
                            dom.focus(this._source);
                        } else {
                            dom.focus(this._editor);
                        }
                    },
                    onHide: _ => {
                        dom.insertBefore(this._container, this._node);
                        this._fullScreen = null;
                    }
                });
            }
        },
        hr: {
            command: 'insertHorizontalRule'
        },
        image: {
            action() {
                this._showImageModal();
            }
        },
        indent: {
            command: 'indent'
        },
        italic: {
            command: 'italic'
        },
        link: {
            action() {
                this._showLinkModal();
            }
        },
        orderedList: {
            command: 'insertOrderedList'
        },
        outdent: {
            command: 'outdent'
        },
        paragraph: {
            dropdown: [
                ['alignLeft', 'alignCenter', 'alignRight', 'alignJustify'],
                ['indent', 'outdent']
            ]
        },
        redo: {
            command: 'redo',
            disableCheck: _ => !document.queryCommandEnabled('redo')
        },
        removeFormat: {
            command: 'removeFormat'
        },
        source: {
            action() {
                if (dom.isVisible(this._sourceContainer)) {
                    this._showEditor();
                    this._refreshToolbar();
                    dom.focus(this._editor);
                } else {
                    this._showSource();
                    dom.focus(this._source);
                }
            }
        },
        strikethrough: {
            command: 'strikeThrough'
        },
        style: {
            dropdown(dropdown) {
                this._styleDropdown(dropdown);
            }
        },
        subscript: {
            command: 'subscript'
        },
        superscript: {
            command: 'superscript'
        },
        table: {
            dropdown(dropdown) {
                this._tableDropdown(dropdown);
            }
        },
        underline: {
            command: 'underline'
        },
        undo: {
            command: 'undo',
            disableCheck: _ => !document.queryCommandEnabled('undo')
        },
        unlink: {
            command: 'unlink'
        },
        unorderedList: {
            command: 'insertUnorderedList'
        },
        video: {
            action() {
                this._showVideoModal();
            }
        }
    };


    /**
     * Editor Popovers
     */

    Editor.popovers = {
        floatLeft: {
            action(node) {
                this._setStyle(node, 'float', 'left');
            }
        },
        floatRight: {
            action(node) {
                this._setStyle(node, 'float', 'right');
            }
        },
        floatNone: {
            action(node) {
                this._setStyle(node, 'float', '');
            }
        },
        imageFull: {
            content: '100%',
            action(node) {
                this._setStyle(node, 'width', '100%');
            }
        },
        imageFull: {
            content: '100%',
            action(node) {
                this._setStyle(node, 'width', '100%');
            }
        },
        imageHalf: {
            content: '50%',
            action(node) {
                this._setStyle(node, 'width', '50%');
            }
        },
        imageQuarter: {
            content: '25%',
            action(node) {
                this._setStyle(node, 'width', '25%');
            }
        },
        imageOriginal: {
            action(node) {
                this._setStyle(node, 'width', '');
            }
        },
        imageRemove: {
            action(node) {
                this._removeNode(node);
                this._removePopover();
            }
        },
        link: {
            render(node) {
                const href = dom.getAttribute(node, 'href');
                return dom.create('a', {
                    text: href,
                    class: 'me-1',
                    attributes: {
                        href,
                        target: '_blank'
                    }
                });
            }
        },
        linkEdit: {
            action(node) {
                this._showLinkModal(node);
            }
        },
        tableColumnAfter: {
            action(node) {
                this._updateTable(node, (td, _, table) => {
                    const index = dom.index(td);
                    const rows = dom.find(':scope > thead > tr, :scope > tbody > tr', table);
                    for (const row of rows) {
                        const newTd = dom.create('td');
                        const cells = dom.children(row, 'th, td');
                        dom.after(cells[index], newTd);
                    }
                });
            }
        },
        tableColumnBefore: {
            action(node) {
                this._updateTable(node, (td, _, table) => {
                    const index = dom.index(td);
                    const rows = dom.find(':scope > thead > tr, :scope > tbody > tr', table);
                    for (const row of rows) {
                        const newTd = dom.create('td');
                        const cells = dom.children(row, 'th, td');
                        dom.before(cells[index], newTd);
                    }
                });
            }
        },
        tableColumnRemove: {
            action(node) {
                this._updateTable(node, (td, _, table) => {
                    const index = dom.index(td);
                    const rows = dom.find(':scope > thead > tr, :scope > tbody > tr', table);
                    for (const row of rows) {
                        const cells = dom.children(row, 'th, td');
                        dom.remove(cells[index]);
                    }
                });
            }
        },
        tableRemove: {
            action(node) {
                const table = dom.closest(node, 'table', this._editor).shift();
                this._removeNode(table);
                this._removePopover();
            }
        },
        tableRowAfter: {
            action(node) {
                this._updateTable(node, (_, tr) => {
                    const columns = dom.children(tr).length;
                    const newTr = dom.create('tr');
                    for (let i = 0; i < columns; i++) {
                        const newTd = dom.create('td');
                        dom.append(newTr, newTd);
                    }
                    dom.after(tr, newTr);
                });
            }
        },
        tableRowBefore: {
            action(node) {
                this._updateTable(node, (_, tr) => {
                    const columns = dom.children(tr).length;
                    const newTr = dom.create('tr');
                    for (let i = 0; i < columns; i++) {
                        const newTd = dom.create('td');
                        dom.append(newTr, newTd);
                    }
                    dom.before(tr, newTr);
                });
            }
        },
        tableRowRemove: {
            action(node) {
                this._updateTable(node, (_, tr) => {
                    dom.remove(tr);
                });
            }
        },
        unlink: {
            action(node) {
                dom.select(node);
                this.unlink();

                const range = this.constructor._getRange();
                range.collapse();
            }
        }
    };


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


    /**
     * Editor Events
     */

    Object.assign(Editor.prototype, {

        /**
         * Attach events for the Editor.
         */
        _events() {
            this._eventsToolbar();
            this._eventsEditor();
            this._eventsPopover();
            this._eventsSource();
            this._eventsDrop();

            if (this._settings.resizable) {
                this._eventsResize();
            }
        },

        /**
         * Attach drop events.
         */
        _eventsDrop() {
            dom.addEvent(this._dropTarget, 'dragenter.ui.editor', _ => {
                dom.addClass(this._dropText, this.constructor.classes.dropHover);
                dom.setText(this._dropText, this.constructor.lang.drop.drop);
                dom.show(this._dropTarget);
            });

            dom.addEvent(this._dropTarget, 'dragleave.ui.editor', _ => {
                this._resetDropText();
            });

            dom.addEvent(this._dropTarget, 'dragover.ui.editor', e => {
                e.preventDefault();
            });

            dom.addEventDelegate(this._editor, 'dragstart.ui.editor', 'img', e => {
                e.preventDefault();
            });

            dom.addEvent(this._dropTarget, 'drop.ui.editor', e => {
                e.preventDefault();

                // reset drag count
                EditorSet._dragCount = 0;

                this._resetDropText();
                dom.hide(this._dropTarget);

                if (!e.dataTransfer.files.length) {
                    const text = e.dataTransfer.getData('text');
                    this.insertText(text);
                    return;
                }

                const file = e.dataTransfer.files[0];

                if (file.type.substring(0, 5) !== 'image') {
                    return;
                }

                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = _ => {
                    this.insertImage(reader.result);
                };
            });
        },

        /**
         * Attach editor events.
         */
        _eventsEditor() {
            this._observer = new MutationObserver(_ => {
                if (this._noMutate) {
                    this._noMutate = false;
                    return;
                }

                dom.triggerEvent(this._editor, 'change.ui.editor');

                this._cleanupStyles();
            });

            this._observer.observe(this._editor, { attributes: true, childList: true, subtree: true });

            dom.addEvent(this._editor, 'input.ui.editor change.ui.editor', _ => {
                const html = dom.getHTML(this._editor);
                dom.setHTML(this._node, html);
                dom.setValue(this._source, html);

                this._checkEmpty();

                dom.triggerEvent(this._node, 'change.ui.editor');
            });

            if (this._settings.keyDown) {
                dom.addEvent(this._editor, 'keydown.ui.editor', e => {
                    this._settings.keyDown.bind(this)(e);

                    const event = new KeyboardEvent('', e);
                    this._node.dispatchEvent(event);
                });
            }

            dom.addEvent(this._editor, 'keyup.ui.editor', e => {
                this._refreshCursor();
                this._refreshToolbar();

                const event = new KeyboardEvent('', e);
                this._node.dispatchEvent(event);
            });

            dom.addEventDelegate(this._editor, 'click.ui.editor', 'a, td, img', e => {
                e.preventDefault();
                e.stopPropagation();

                setTimeout(_ => {
                    this._refreshToolbar();
                }, 0);

                if (dom.is(e.currentTarget, 'img')) {
                    window.getSelection().collapseToEnd();
                }

                this._refreshPopover(e.currentTarget, e);
            }, true);

            dom.addEvent(this._editor, 'focus.ui.editor', e => {
                if (this._noFocus) {
                    this._noFocus = false;
                    return;
                }

                const range = this.constructor._getRange();

                if (range && !range.collapsed && !e.relatedTarget) {
                    range.collapse();
                }

                setTimeout(_ => {
                    const selection = window.getSelection();

                    if (!dom.hasDescendent(this._editor, selection.anchorNode)) {
                        return;
                    }

                    this._refreshCursor();
                    this._refreshToolbar();
                }, 0);

                dom.triggerEvent(this._node, 'focus.ui.editor');
            });

            dom.addEvent(this._editor, 'blur.ui.editor', _ => {
                if (this._noBlur) {
                    this._noBlur = false;
                    return;
                }

                dom.triggerEvent(this._node, 'blur.ui.editor');
            });
        },

        /**
         * Attach popover events.
         */
        _eventsPopover() {
            dom.addEvent(this._editorBody, 'scroll.ui.editor', _ => {
                this._removePopover();
            });

            dom.addEventDelegate(this._popover, 'click.ui.editor', '[data-ui-action]', e => {
                const action = dom.getDataset(e.currentTarget, 'uiAction');

                if (!(action in this.constructor.popovers)) {
                    throw new Error(`Unknown action ${action}`);
                }

                e.preventDefault();

                this.constructor.popovers[action].action.bind(this)(this._currentNode);
                this._refreshPopover(this._currentNode);
            });

            let originalWidth;
            dom.addEvent(this._imgResize, 'mousedown.ui.editor', dom.mouseDragFactory(
                e => {
                    if (!this._currentNode || !dom.is(this._currentNode, 'img')) {
                        return false;
                    }

                    e.preventDefault();
                    e.stopPropagation();

                    originalWidth = dom.getStyle(this._currentNode, 'width');

                    dom.hide(this._imgCursor);
                    dom.hide(this._popover);
                },
                e => {
                    const imgRect = dom.rect(this._currentNode, true);
                    const ratio = imgRect.width / imgRect.height;
                    const width = Math.max(
                        e.pageX - imgRect.x,
                        (e.pageY - imgRect.y) * ratio,
                        1
                    );
                    dom.setStyle(this._currentNode, 'width', `${Math.round(width)}px`);
                    this._highlightImage(this._currentNode);
                },
                _ => {
                    const width = dom.getStyle(this._currentNode, 'width');

                    if (width !== originalWidth) {
                        dom.setStyle(this._currentNode, 'width', originalWidth);
                        this._setStyle(this._currentNode, 'width', width);
                    }

                    originalWidth = null;
                }
            ));
        },

        /**
         * Attach resize events.
         */
        _eventsResize() {
            let resizeOffset = 0;
            dom.addEvent(this._resizeBar, 'mousedown.ui.editor', dom.mouseDragFactory(
                e => {
                    e.preventDefault();

                    const barPosition = dom.position(this._resizeBar, true);
                    resizeOffset = e.pageY - barPosition.y;

                    this._removePopover();
                },
                e => {
                    const editorPosition = dom.position(this._editorBody, true);

                    const height = Math.max(0, e.pageY - editorPosition.y - resizeOffset);
                    dom.setStyle(this._editorBody, 'height', `${height}px`);
                },
                _ => {
                    resizeOffset = 0;
                }
            ));
        },

        /**
         * Attach source events.
         */
        _eventsSource() {
            dom.addEvent(this._source, 'input.ui.editor', _ => {
                this._refreshLineNumbers();
            });

            dom.addEvent(this._source, 'scroll.ui.editor', DOM.debounce(_ => {
                const scrollY = dom.getScrollY(this._source);
                dom.setStyle(this._lineNumbers, 'marginTop', `${-scrollY}px`);
            }));

            dom.addEvent(this._source, 'change.ui.editor', _ => {
                this._noMutate = true;

                const html = dom.getValue(this._source);

                // fix for undo/redo
                this._showEditor();
                this._focusEditor();
                const range = dom.createRange();
                range.selectNodeContents(this._editor);
                this.constructor._selectRange(range);
                this.insertHTML(html);
                range.collapse();

                dom.setHTML(this._node, html);

                this._refreshLineNumbers();
                this._showSource();

                dom.triggerEvent(this._node, 'change.ui.editor');
            });

            if (this._settings.keyDownSource) {
                dom.addEvent(this._source, 'keydown.ui.editor', e => {
                    this._settings.keyDownSource.bind(this)(e);
                });
            }
        },

        /**
         * Attach toolbar events.
         */
        _eventsToolbar() {
            dom.addEventDelegate(this._toolbar, 'click.ui.editor', '[data-ui-action]', e => {
                const action = dom.getDataset(e.currentTarget, 'uiAction');

                if (!(action in this.constructor.plugins)) {
                    throw new Error(`Unknown action ${action}`);
                }

                e.preventDefault();

                this.constructor.plugins[action].action.bind(this)();
            });

            dom.addEventDelegate(this._toolbar, 'click.ui.editor', '[data-ui-command]', e => {
                const command = dom.getDataset(e.currentTarget, 'uiCommand');

                if (!(command in this)) {
                    throw new Error(`Unknown command ${command}`);
                }

                e.preventDefault();

                const value = dom.getDataset(e.currentTarget, 'uiValue');
                this[command](value);

                this._refreshToolbar();
            });
        }

    });


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


    /**
     * Editor Modals
     */

    Object.assign(Editor.prototype, {

        /**
         * Remove the modal.
         */
        _removeModal() {
            if (!this._modal) {
                return;
            }

            UI.Modal.init(this._modal).dispose();
            dom.remove(this._modal);
            this._modal = null;
        },

        /**
         * Show the image modal.
         */
        _showImageModal() {
            const container = dom.create('div');

            const { group: fileGroup, input: fileInput } = this.constructor._createFileInput({
                id: `${this._id}-image-file`,
                label: this.constructor.lang.modals.imageFile,
                attributes: {
                    accept: 'image/*',
                    multiple: true
                }
            });

            const { group: urlGroup, input: urlInput } = this.constructor._createInput({
                id: `${this._id}-image-url`,
                label: this.constructor.lang.modals.imageUrl
            });

            dom.append(container, fileGroup);
            dom.append(container, urlGroup);

            const range = this.constructor._getRange();

            this._modal = this.constructor._createModal({
                title: this.constructor.lang.modals.insertImage,
                content: container,
                cancelText: this.constructor.lang.modals.cancel,
                submitText: this.constructor.lang.modals.insertImage,
                onSubmit: _ => {
                    this.constructor._selectRange(range);

                    const files = dom.getProperty(fileInput, 'files');

                    if (!files.length) {
                        const src = dom.getValue(urlInput);
                        this.insertImage(src);
                    }

                    this._settings.imageUpload.bind(this)(files);
                },
                onShown: _ => {
                    dom.focus(fileInput);
                },
                onHidden: _ => {
                    this._removeModal();
                }
            });
        },

        /**
         * Show the link modal.
         * @param {HTMLElement} [link] The current link.
         */
        _showLinkModal(link) {
            const container = dom.create('div');

            const { group: textGroup, input: textInput } = this.constructor._createInput({
                id: `${this._id}-link-text`,
                label: this.constructor.lang.modals.linkText
            });

            const { group: urlGroup, input: urlInput } = this.constructor._createInput({
                id: `${this._id}-link-url`,
                label: this.constructor.lang.modals.linkUrl
            });

            const { group: newWindowGroup, input: newWindowInput } = this.constructor._createCheckbox({
                id: `${this._id}-link-new-window`,
                label: this.constructor.lang.modals.linkNewWindow
            });

            if (link) {
                const text = dom.getText(link);
                const href = dom.getAttribute(link, 'href');
                const newWindow = dom.getAttribute(link, 'target');

                dom.setValue(textInput, text);
                dom.setValue(urlInput, href);

                if (newWindow === '_blank') {
                    dom.setProperty(newWindowInput, 'checked', true);
                }
            }

            let hasText = false;

            dom.addEvent(textInput, 'input.ui.editor', _ => {
                hasText = !!dom.getValue(textInput);
            });

            dom.addEvent(urlInput, 'input.ui.editor', _ => {
                if (hasText) {
                    return;
                }

                const url = dom.getValue(urlInput);
                dom.setValue(textInput, url);
            });

            dom.append(container, textGroup);
            dom.append(container, urlGroup);
            dom.append(container, newWindowGroup);

            const range = this.constructor._getRange();

            this._modal = this.constructor._createModal({
                title: this.constructor.lang.modals.insertLink,
                content: container,
                cancelText: this.constructor.lang.modals.cancel,
                submitText: this.constructor.lang.modals.insertLink,
                onSubmit: _ => {
                    const text = dom.getValue(textInput);
                    const href = dom.getValue(urlInput);
                    const newWindow = dom.is(newWindowInput, ':checked');

                    this.constructor._selectRange(range);
                    this.insertLink(href, text, newWindow);
                },
                onShown: _ => {
                    dom.focus(urlInput);
                },
                onHidden: _ => {
                    this._removeModal();
                }
            });
        },

        /**
         * Show the video modal.
         */
        _showVideoModal() {
            const container = dom.create('div');

            const { group: urlGroup, input: urlInput, invalidFeedback: urlInvalidFeedback } = this.constructor._createInput({
                id: `${this._id}-video-url`,
                label: this.constructor.lang.modals.videoUrl
            });

            dom.append(container, urlGroup);

            const range = this.constructor._getRange();

            this._modal = this.constructor._createModal({
                title: this.constructor.lang.modals.insertVideo,
                content: container,
                cancelText: this.constructor.lang.modals.cancel,
                submitText: this.constructor.lang.modals.insertVideo,
                onSubmit: _ => {
                    const url = dom.getValue(urlInput);
                    const match = url.match(/youtube\.com\/watch\?v=([\w]+)/i);

                    if (!match) {
                        dom.addClass(urlGroup, this.constructor.classes.formError);
                        dom.setText(urlInvalidFeedback, this.constructor.lang.modals.videoUrlInvalid);
                        return false;
                    }

                    dom.removeClass(urlGroup, this.constructor.classes.formError);

                    const id = match[1];
                    const video = dom.create('iframe', {
                        attributes: {
                            width: 560,
                            height: 315,
                            src: `https://www.youtube.com/embed/${id}`,
                            frameborder: 0,
                            allowfullscreen: true
                        }
                    });

                    const html = dom.getProperty(video, 'outerHTML');
                    this.constructor._selectRange(range);
                    this.insertHTML(html);
                },
                onShown: _ => {
                    dom.focus(urlInput);
                },
                onHidden: _ => {
                    this._removeModal();
                }
            });
        }

    });


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


    /**
     * Editor Popovers
     */

    Object.assign(Editor.prototype, {

        /**
         * Highlight an image.
         * @param {HTMLElement} image The image element.
         */
        _highlightImage(image) {
            dom.hide(this._imgHighlight);
            dom.hide(this._imgCursor);

            const imgRect = dom.rect(image, true);
            const editorPos = dom.position(this._editor, true);
            const scrollX = dom.getScrollX(this._editorBody);
            const scrollY = dom.getScrollY(this._editorBody);
            const imgX = Math.round(imgRect.x);
            const imgY = Math.round(imgRect.y);
            const imgWidth = Math.round(imgRect.width);
            const imgHeight = Math.round(imgRect.height);

            dom.setStyle(this._imgHighlight, {
                top: `${imgY - editorPos.y + scrollY - 2}px`,
                left: `${imgX - editorPos.x + scrollX - 2}px`,
                width: `${imgWidth + 2}px`,
                height: `${imgHeight + 2}px`
            });

            dom.setText(this._imgSizeInfo, `${imgWidth}x${imgHeight}`);

            if (imgWidth < 100 || imgHeight < 50) {
                dom.hide(this._imgSizeInfo);
            } else {
                dom.show(this._imgSizeInfo);
            }

            dom.show(this._imgHighlight);
            dom.show(this._imgCursor);
        },

        /**
         * Refresh the popover.
         * @param {HTMLElement} currentNode The current selected node.
         * @param {Event} [event] The current event.
         */
        _refreshPopover(currentNode, event) {
            if (dom.isSame(currentNode, this._currentNode)) {
                return;
            }

            this._removePopover();

            this._currentNode = currentNode;

            if (!this._currentNode) {
                return;
            }

            const tagName = dom.tagName(this._currentNode);

            let reference = this._currentNode;
            if (event && tagName === 'img') {
                const editorPos = dom.position(this._editor, true);
                dom.setStyle(this._imgCursor, {
                    top: `${event.pageY - editorPos.y}px`,
                    left: `${event.pageX - editorPos.x}px`
                });
                reference = this._imgCursor;
            }

            this._popper = new UI.Popper(
                this._popover,
                {
                    reference,
                    arrow: this._popoverArrow,
                    placement: 'bottom',
                    position: 'left',
                    minContact: 0,
                    noAttributes: true
                }
            );

            dom.show(this._popover);

            switch (tagName) {
                case 'a':
                    this._renderPopoverItems(this._settings.popovers.link);
                    break;
                case 'img':
                    this._renderPopoverItems(this._settings.popovers.image);
                    this._highlightImage(this._currentNode);
                    dom.show(this._imgHighlight);
                    break;
                case 'td':
                    this._renderPopoverItems(this._settings.popovers.table);
                    break;
            }
        },

        /**
         * Remove the popover.
         */
        _removePopover() {
            if (!this._currentNode) {
                return;
            }

            dom.hide(this._imgHighlight);
            dom.hide(this._imgCursor);
            dom.hide(this._popover);
            dom.empty(this._popoverBody);

            this._popper.dispose();
            this._popper = null;
            this._currentNode = null;
        }

    });


    /**
     * Editor Render Dropdowns
     */

    Object.assign(Editor.prototype, {

        /**
         * Render a color dropdown.
         * @param {HTMLElement} dropdown The dropdown.
         */
        _colorDropdown(dropdown) {
            const container = dom.create('div', {
                class: this.constructor.classes.colorContainerRow
            });

            const col1 = dom.create('div', {
                class: this.constructor.classes.colorContainerColumn
            });

            const col2 = dom.create('div', {
                class: this.constructor.classes.colorContainerColumn
            });

            const foreLabel = dom.create('small', {
                text: this.constructor.lang.dropdowns.foregroundColor,
                class: this.constructor.classes.colorForeground
            });

            const backLabel = dom.create('small', {
                text: this.constructor.lang.dropdowns.backgroundColor,
                class: this.constructor.classes.colorBackground
            });

            dom.append(col1, foreLabel);
            dom.append(col2, backLabel);

            const foreDefaultContainer = dom.create('div', {
                class: this.constructor.classes.colorLabelContainer
            });
            dom.append(col1, foreDefaultContainer);

            const backDefaultContainer = dom.create('div', {
                class: this.constructor.classes.colorLabelContainer
            });
            dom.append(col2, backDefaultContainer);

            const foreDefault = dom.create('button', {
                text: this.constructor.lang.dropdowns.colorDefault,
                class: this.constructor.classes.colorDefaultBtn,
                attributes: {
                    type: 'button'
                }
            });
            dom.append(foreDefaultContainer, foreDefault);

            this._setToolbarData(foreDefault, {
                command: 'foreColor',
                value: 'initial'
            });

            const backDefault = dom.create('button', {
                text: this.constructor.lang.dropdowns.colorTransparent,
                class: this.constructor.classes.colorDefaultBtn,
                attributes: {
                    type: 'button'
                }
            });
            dom.append(backDefaultContainer, backDefault);

            this._setToolbarData(backDefault, {
                command: 'backColor',
                value: 'initial'
            });

            for (const colorRow of this.constructor.colors) {
                const foreRow = dom.create('div', {
                    class: this.constructor.classes.colorRow
                });
                dom.append(col1, foreRow);

                const backRow = dom.create('div', {
                    class: this.constructor.classes.colorRow
                });
                dom.append(col2, backRow);

                for (const [colorName, color] of Object.entries(colorRow)) {
                    const foreLink = dom.create('a', {
                        class: this.constructor.classes.color,
                        style: {
                            backgroundColor: color,
                            height: '20px'
                        },
                        attributes: {
                            href: '#',
                            title: colorName
                        }
                    });
                    dom.append(foreRow, foreLink);

                    UI.Tooltip.init(foreLink, {
                        appendTo: document.body,
                        placement: 'bottom'
                    });

                    this._setToolbarData(foreLink, {
                        command: 'foreColor',
                        value: color
                    });

                    const backLink = dom.create('a', {
                        class: this.constructor.classes.color,
                        style: {
                            backgroundColor: color,
                            height: '20px'
                        },
                        attributes: {
                            href: '#',
                            title: colorName
                        }
                    });
                    dom.append(backRow, backLink);

                    UI.Tooltip.init(backLink, {
                        appendTo: document.body,
                        placement: 'bottom'
                    });

                    this._setToolbarData(backLink, {
                        command: 'backColor',
                        value: color
                    });
                }
            }

            dom.append(container, col1);
            dom.append(container, col2);

            dom.setStyle(dropdown, 'minWidth', '350px');
            dom.append(dropdown, container);
        },

        /**
         * Render a font dropdown.
         * @param {HTMLElement} dropdown The dropdown.
         */
        _fontDropdown(dropdown) {
            const fonts = this._settings.fonts.sort();

            for (const font of fonts) {
                const button = dom.create('button', {
                    text: font,
                    class: this.constructor.classes.dropdownItem,
                    style: {
                        fontFamily: font
                    },
                    attributes: {
                        type: 'button'
                    }
                });

                const data = {
                    command: 'fontName',
                    value: font
                };

                this._buttons.push({ button, data });

                this._setToolbarData(button, data);

                dom.append(dropdown, button);
            }
        },

        /**
         * Render a font size dropdown.
         * @param {HTMLElement} dropdown The dropdown.
         */
        _fontSizeDropdown(dropdown) {
            const sizes = Object.values(this.constructor.fontSizes);

            for (const size of sizes) {
                const button = dom.create('button', {
                    text: size,
                    class: this.constructor.classes.dropdownItem,
                    attributes: {
                        type: 'button'
                    }
                });

                const data = {
                    command: 'fontSize',
                    value: size
                };

                this._buttons.push({ button, data });

                this._setToolbarData(button, data);

                dom.append(dropdown, button);
            }
        },

        /**
         * Render a style dropdown.
         * @param {HTMLElement} dropdown The dropdown.
         */
        _styleDropdown(dropdown) {
            for (const tag of this.constructor.styles) {
                const button = dom.create('button', {
                    class: this.constructor.classes.dropdownItem,
                    attributes: {
                        type: 'button'
                    }
                });

                const content = dom.create(tag, {
                    text: this.constructor.lang.styles[tag],
                    class: this.constructor.classes.styleContent
                });

                dom.append(button, content);

                const data = {
                    command: 'formatBlock',
                    value: tag.toUpperCase()
                };

                this._buttons.push({ button, data });

                this._setToolbarData(button, data);

                dom.append(dropdown, button);
            }
        },

        /**
         * Render a table dropdown.
         * @param {HTMLElement} dropdown The dropdown.
         */
        _tableDropdown(dropdown) {
            const container = dom.create('div');

            for (let i = 0; i < 10; i++) {
                const row = dom.create('div', {
                    class: this.constructor.classes.tableRow
                });
                dom.append(container, row);

                for (let j = 0; j < 10; j++) {
                    const cell = dom.create('div', {
                        class: this.constructor.classes.tableCell
                    });
                    dom.append(row, cell);

                    if (i > 4 || j > 4) {
                        dom.hide(cell);
                    }

                    const link = dom.create('a', {
                        class: this.constructor.classes.tableLink,
                        attributes: {
                            href: '#'
                        },
                        dataset: {
                            uiColumn: j,
                            uiRow: i
                        },
                        style: {
                            marginRight: '1px',
                            marginBottom: '1px',
                            opacity: '0.5'
                        }
                    });
                    dom.append(cell, link);
                }
            }

            const info = dom.create('span', {
                class: this.constructor.classes.tableInfo
            });

            dom.addClass(dropdown, this.constructor.classes.tableDropdown);
            dom.append(dropdown, container);
            dom.append(dropdown, info);

            dom.addEventDelegate(container, 'click.ui.editor', 'a', e => {
                const cols = dom.getDataset(e.currentTarget, 'uiColumn');
                const rows = dom.getDataset(e.currentTarget, 'uiRow');

                const table = dom.create('table', {
                    class: this.constructor.classes.table
                });

                const tbody = dom.create('tbody');

                for (let i = 0; i <= rows; i++) {
                    const tr = dom.create('tr');

                    for (let j = 0; j <= cols; j++) {
                        const td = dom.create('td');
                        dom.append(tr, td);
                    }

                    dom.append(tbody, tr);
                }

                dom.append(table, tbody);

                const newTable = this._insertNode(table);

                const firstTd = dom.findOne('td', newTable);
                const range = this.constructor._selectNode(firstTd);
                range.collapse(true);
            });

            dom.addEventDelegate(container, 'mouseover.ui.editor', 'a', e => {
                const targetCol = dom.getDataset(e.currentTarget, 'uiColumn');
                const targetRow = dom.getDataset(e.currentTarget, 'uiRow');

                const colMin = Math.max(targetCol + 1, 4);
                const rowMin = Math.max(targetRow + 1, 4);

                const links = dom.find('a', container);

                for (const element of links) {
                    const col = dom.getDataset(element, 'uiColumn');
                    const row = dom.getDataset(element, 'uiRow');

                    if (col <= targetCol && row <= targetRow) {
                        dom.addClass(element, this.constructor.classes.tableHover);
                    } else {
                        dom.removeClass(element, this.constructor.classes.tableHover);
                    }

                    const parent = dom.parent(element);
                    if (col <= colMin && row <= rowMin) {
                        dom.show(parent);
                    } else {
                        dom.hide(parent);
                    }
                }

                dom.setText(info, `${targetCol + 1} x ${targetRow + 1}`);
            });
        }

    });


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


    /**
     * Toolbar Render
     */

    Object.assign(Editor.prototype, {

        /**
         * Render the editor.
         */
        _render() {
            this._container = dom.create('div', {
                class: this.constructor.classes.container
            });

            this._renderToolbar();

            this._editorBody = dom.create('div', {
                class: this.constructor.classes.editorBody,
                style: {
                    height: this._settings.height
                }
            });

            dom.append(this._container, this._editorBody);

            this._renderEditor();
            this._renderSource();
            this._renderPopover();
            this._renderDrop();

            if (this._settings.resizable) {
                this._renderResize();
            }

            const html = dom.getHTML(this._node);
            dom.setHTML(this._editor, html);
            dom.setValue(this._source, html);

            // hide the input node
            dom.hide(this._node);
            dom.setAttribute(this._node, 'tabindex', '-1');

            dom.insertBefore(this._container, this._node);
        },

        /**
         * Render a button
         * @param {object} data The button data.
         * @return {HTMLElement} The button.
         */
        _renderButton(data) {
            const button = dom.create('button', {
                class: this.constructor.classes.btn
            });

            if (data.setTitle) {
                data.title = data.setTitle.bind(this)();
            }

            if (data.title) {
                dom.setAttribute(button, 'title', data.title);

                UI.Tooltip.init(button, {
                    appendTo: document.body,
                    placement: 'bottom'
                });
            }

            if ('content' in data) {
                dom.setHTML(button, data.content);
            } else {
                const content = dom.parseHTML(this.constructor.icons[data.icon]);
                dom.addClass(content, this.constructor.classes.btnIcon);
                dom.append(button, content);
            }

            return button;
        },

        /**
         * Render the drop elements.
         */
        _renderDrop() {
            this._dropTarget = dom.create('div', {
                class: this.constructor.classes.dropTarget,
                style: {
                    minHeight: '100%'
                }
            });

            this._dropText = dom.create('span', {
                text: this.constructor.lang.drop.dropHere,
                class: this.constructor.classes.dropText
            });

            dom.append(this._dropTarget, this._dropText);
            dom.hide(this._dropTarget);
            dom.append(this._container, this._dropTarget);
        },

        /**
         * Render the editor elements.
         */
        _renderEditor() {
            this._editorOuter = dom.create('div', {
                class: 'w-100 overflow-auto'
            });

            this._editorContainer = dom.create('div', {
                class: this.constructor.classes.editorContainer,
                style: {
                    minHeight: '100%'
                }
            });

            this._editor = dom.create('div', {
                class: this.constructor.classes.editor,
                style: {
                    minHeight: '100%',
                    fontFamily: this._settings.defaultFont
                },
                attributes: {
                    contenteditable: true
                }
            });

            this._imgHighlight = dom.create('div', {
                class: this.constructor.classes.imgHighlight,
                style: {
                    backgroundColor: 'rgba(0, 0, 0, .15)',
                    border: '1px dashed black'
                }
            });

            this._imgCursor = dom.create('div', {
                class: this.constructor.classes.imgCursor,
                style: {
                    width: '1rem',
                    height: '1rem'
                }
            });

            this._imgSizeInfo = dom.create('div', {
                class: this.constructor.classes.imgSizeInfo,
                style: {
                    backgroundColor: 'rgba(0, 0, 0, .5)'
                }
            });

            this._imgResize = dom.create('div', {
                class: this.constructor.classes.imgResize,
                style: {
                    width: '5px',
                    height: '5px',
                    backgroundColor: 'black',
                    cursor: 'nwse-resize'
                }
            });

            dom.hide(this._imgHighlight);

            dom.append(this._imgHighlight, this._imgSizeInfo);
            dom.append(this._imgHighlight, this._imgResize);
            dom.append(this._editorContainer, this._imgCursor);
            dom.append(this._editorContainer, this._imgHighlight);
            dom.append(this._editorContainer, this._editor);
            dom.append(this._editorOuter, this._editorContainer);
            dom.append(this._editorBody, this._editorOuter);
        },

        /**
         * Render the resize bar.
         */
        _renderResize() {
            this._resizeBar = dom.create('div', {
                class: this.constructor.classes.resizeBar,
                style: {
                    padding: '1px 0',
                    cursor: 'ns-resize'
                }
            });

            for (let i = 0; i < 3; i++) {
                const hr = dom.create('hr', {
                    style: {
                        width: '25px',
                        margin: '1px auto 0'
                    }
                });
                dom.append(this._resizeBar, hr);
            }

            dom.append(this._container, this._resizeBar);
        },

        /**
         * Render the source elements.
         */
        _renderSource() {
            this._sourceOuter = dom.create('div', {
                class: 'w-100 overflow-hidden'
            });

            this._sourceContainer = dom.create('div', {
                class: this.constructor.classes.sourceContainer,
                style: {
                    height: '100%'
                }
            });

            this._lineNumbers = dom.create('div', {
                class: this.constructor.classes.sourceLines
            });

            this._sourceScroll = dom.create('div', {
                class: 'd-flex w-100'
            });

            this._source = dom.create('textarea', {
                class: this.constructor.classes.source,
                style: {
                    resize: 'none'
                }
            });

            dom.hide(this._sourceOuter);

            dom.append(this._sourceScroll, this._source);
            dom.append(this._sourceContainer, this._lineNumbers);
            dom.append(this._sourceContainer, this._sourceScroll);
            dom.append(this._sourceOuter, this._sourceContainer);
            dom.append(this._editorBody, this._sourceOuter);
        }

    });


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
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        }

    });


    /**
     * Editor (Static) Modals
     */

    Object.assign(Editor, {

        /**
         * Create a form checkbox.
         * @param {object} options Options for the checkbox.
         * @returns {object} An object containing the form elements.
         */
        _createCheckbox(options) {
            const group = dom.create('div', {
                class: this.classes.formGroup
            });

            const inputContainer = dom.create('div', {
                class: this.classes.checkboxContainer
            });

            const input = dom.create('input', {
                class: this.classes.checkbox,
                attributes: {
                    id: options.id,
                    type: 'checkbox',
                    ...options.attributes
                }
            });

            const label = dom.create('label', {
                text: options.label,
                attributes: {
                    for: options.id
                }
            });

            dom.append(inputContainer, input);
            dom.append(inputContainer, label);
            dom.append(group, inputContainer);

            return { group, input };
        },

        /**
         * Create a form file input.
         * @param {object} options Options for the file input.
         * @returns {object} An object containing the form elements.
         */
        _createFileInput(options) {
            const group = dom.create('div', {
                class: this.classes.formGroup
            });

            const label = dom.create('label', {
                text: options.label,
                attributes: {
                    for: options.id
                }
            });

            const inputContainer = dom.create('div', {
                class: this.classes.inputContainer
            });

            const input = dom.create('input', {
                attributes: {
                    id: options.id,
                    type: 'file',
                    ...options.attributes
                }
            });

            dom.append(group, label);
            dom.append(inputContainer, input);
            dom.append(group, inputContainer);

            return { group, input };
        },

        /**
         * Create a form text input.
         * @param {object} options Options for the text input.
         * @returns {object} An object containing the form elements.
         */
        _createInput(options) {
            const group = dom.create('div', {
                class: this.classes.formGroup
            });

            const label = dom.create('label', {
                text: options.label,
                attributes: {
                    for: options.id
                }
            });

            const inputContainer = dom.create('div', {
                class: this.classes.inputContainer
            });

            const input = dom.create('input', {
                class: this.classes.input,
                attributes: {
                    id: options.id,
                    type: options.type || 'text',
                    ...options.attributes
                }
            });

            const ripple = dom.create('div', {
                class: this.classes.inputRipple
            });

            const invalidFeedback = dom.create('div', {
                class: this.classes.invalidFeedback
            });

            dom.append(group, label);
            dom.append(inputContainer, input);
            dom.append(inputContainer, ripple);
            dom.append(group, inputContainer);
            dom.append(group, invalidFeedback);

            return { group, input, invalidFeedback };
        },

        /**
         * Create a modal.
         * @param {object} options Options for the modal.
         * @returns {HTMLElement} The modal element.
         */
        _createModal(options) {
            const modal = dom.create('div', {
                class: this.classes.modal,
                attributes: {
                    tabindex: -1,
                    role: 'dialog',
                    'aria-model': true
                }
            });

            const modalDialog = dom.create('div', {
                class: this.classes.modalDialog
            });

            if (options.fullScreen) {
                dom.addClass(modalDialog, this.classes.modalFullscreen);
            }

            const modalContent = dom.create('form', {
                class: this.classes.modalContent
            });

            const modalHeader = dom.create('div', {
                class: this.classes.modalHeader
            });

            const closeBtn = dom.create('button', {
                class: this.classes.modalBtnClose,
                dataset: {
                    uiDismiss: 'modal'
                },
                attributes: {
                    type: 'button',
                    'aria-label': this.lang.modals.close
                }
            });

            if (options.title) {
                const modalTitle = dom.create('h5', {
                    class: this.classes.modalTitle,
                    text: options.title
                });

                dom.append(modalHeader, modalTitle);
            }

            dom.append(modalHeader, closeBtn);
            dom.append(modalContent, modalHeader);

            if (options.content) {
                const modalBody = dom.create('div', {
                    class: this.classes.modalBody
                });

                dom.append(modalBody, options.content);
                dom.append(modalContent, modalBody);
            }

            if (options.onSubmit) {
                const modalFooter = dom.create('div', {
                    class: this.classes.modalFooter
                });

                const submitButton = dom.create('button', {
                    text: options.submitText,
                    class: this.classes.modalBtnPrimary,
                    attributes: {
                        type: 'submit'
                    }
                });

                const cancelButton = dom.create('button', {
                    text: options.cancelText,
                    class: this.classes.modalBtnSecondary,
                    dataset: {
                        uiDismiss: 'modal'
                    },
                    attributes: {
                        type: 'button'
                    }
                });

                dom.append(modalFooter, submitButton);
                dom.append(modalFooter, cancelButton);
                dom.append(modalContent, modalFooter);

                dom.addEvent(modalContent, 'submit', e => {
                    e.preventDefault();

                    if (options.onSubmit(e) === false) {
                        return;
                    }

                    UI.Modal.init(modal).hide();
                });
            }

            dom.append(modalDialog, modalContent);
            dom.append(modal, modalDialog);
            dom.append(document.body, modal);

            if ('onShow' in options) {
                dom.addEvent(modal, 'show.ui.modal', e => {
                    options.onShow(e);
                });
            }

            if ('onShown' in options) {
                dom.addEvent(modal, 'shown.ui.modal', e => {
                    options.onShown(e);
                });
            }

            if ('onHide' in options) {
                dom.addEvent(modal, 'hide.ui.modal', e => {
                    options.onHide(e);
                });
            }

            if ('onHidden' in options) {
                dom.addEvent(modal, 'hidden.ui.modal', e => {
                    options.onHidden(e);
                });
            }

            UI.Modal.init(modal).show();

            return modal;
        }

    });


    /**
     * Editor Values
     */

    Editor.buttons = [
        ['style'],
        ['bold', 'italic', 'underline', 'removeFormat'],
        ['font'],
        ['color'],
        ['unorderedList', 'orderedList', 'paragraph'],
        ['table'],
        ['link', 'image', 'video'],
        ['fullScreen', 'source']
    ];

    Editor.colors = [
        {
            'Black': '#000000',
            'Tundora': '#424242',
            'Dove Gray': '#636363',
            'Star Dust': '#9C9C94',
            'Pale Slate': '#CEC6CE',
            'Gallery': '#EFEFEF',
            'Alabaster': '#F7F7F7',
            'White': '#FFFFFF'
        },
        {
            'Red': '#FF0000',
            'Orange Peel': '#FF9C00',
            'Yellow': '#FFFF00',
            'Green': '#00FF00',
            'Cyan': '#00FFFF',
            'Blue': '#0000FF',
            'Electric Violet': '#9C00FF',
            'Magenta': '#FF00FF'
        },
        {
            'Azalea': '#F7C6CE',
            'Karry': '#FFE7CE',
            'Egg White': '#FFEFC6',
            'Zanah': '#D6EFD6',
            'Botticelli': '#CEDEE7',
            'Tropical Blue': '#CEE7F7',
            'Mischka': '#D6D6E7',
            'Twilight': '#E7D6DE'
        },
        {
            'Tonys Pink': '#E79C9C',
            'Peach Orange': '#FFC69C',
            'Cream Brulee': '#FFE79C',
            'Sprout': '#B5D6A5',
            'Casper': '#A5C6CE',
            'Perano': '#9CC6EF',
            'Cold Purple': '#B5A5D6',
            'Careys Pink': '#D6A5BD'
        },
        {
            'Mandy': '#E76363',
            'Rajah': '#F7AD6B',
            'Dandelion': '#FFD663',
            'Olivine': '#94BD7B',
            'Gulf Stream': '#73A5AD',
            'Viking': '#6BADDE',
            'Blue Marguerite': '#8C7BC6',
            'Puce': '#C67BA5'
        },
        {
            'Guardsman Red': '#CE0000',
            'Fire Bush': '#E79439',
            'Golden Dream': '#EFC631',
            'Chelsea Cucumber': '#6BA54A',
            'Smalt Blue': '#4A7B8C',
            'Boston Blue': '#3984C6',
            'Butterfly Bush': '#634AA5',
            'Cadillac': '#A54A7B'
        },
        {
            'Sangria': '#9C0000',
            'Mai Tai': '#B56308',
            'Buddha Gold': '#BD9400',
            'Forest Green': '#397B21',
            'Eden': '#104A5A',
            'Venice Blue': '#085294',
            'Meteorite': '#311873',
            'Claret': '#731842'
        },
        {
            'Rosewood': '#630000',
            'Cinnamon': '#7B3900',
            'Olive': '#846300',
            'Parsley': '#295218',
            'Tiber': '#083139',
            'Midnight Blue': '#003163',
            'Valentino': '#21104A',
            'Loulou': '#4A1031'
        }
    ];

    Editor.fonts = [
        'Arial',
        'Arial Black',
        'Comic Sans MS',
        'Courier New',
        'Garamond',
        'Georgia',
        'Helvetica',
        'Impact',
        'Tahoma',
        'Times New Roman',
        'Trebuchet MS',
        'Verdana'
    ];

    Editor.fontSizes = {
        1: 8,
        2: 13,
        3: 16,
        4: 18,
        5: 24,
        6: 32,
        7: 48
    };

    Editor.styles = [
        'p',
        'blockquote',
        'pre',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6'
    ];


    Editor.defaults = {
        buttons: null,
        popovers: {
            image: [
                ['imageFull', 'imageHalf', 'imageQuarter', 'imageOriginal'],
                ['floatLeft', 'floatRight', 'floatNone'],
                ['imageRemove']
            ],
            link: [
                'link',
                ['linkEdit'],
                ['unlink']
            ],
            table: [
                ['tableRowAfter', 'tableRowBefore', 'tableColumnBefore', 'tableColumnAfter'],
                ['tableRowRemove', 'tableColumnRemove', 'tableRemove']
            ]
        },
        imageUpload(files) {
            for (const file of files) {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = _ => {
                    this.insertImage(reader.result);
                };
            }
        },
        keyDown(e) {
            if (!e.ctrlKey) {
                return;
            }

            let action;
            switch (e.key) {
                case 'b':
                    action = 'bold';
                    break;
                case 'i':
                    action = 'italic';
                    break;
                case 'u':
                    action = 'underline';
                    break;
                case 'y':
                    action = 'redo';
                    break;
                case 'z':
                    action = 'undo';
                    break;
                default:
                    return;
            }

            e.preventDefault();

            this[action]();
        },
        keyDownSource(e) {
            if (e.key !== 'Tab') {
                return;
            }

            e.preventDefault();

            // allow tab in source editor

            const offset = dom.getProperty(this._source, 'selectionStart');
            const value = dom.getValue(this._source);

            let newValue, newOffset;
            if (!e.shiftKey) {
                newValue = value.substring(0, start) + '\t' + value.substring(start);
                newOffset = offset + 1;
            } else {
                const lastChar = value.substring(start - 1, start);
                if (lastChar !== '\t') {
                    return;
                }

                newValue = value.substring(0, start - 1) + value.substring(start);
                newOffset = offset - 1;
            }

            dom.setValue(this._source, newValue);
            dom.setProperty(this._source, 'selectionStart', newOffset);
            dom.setProperty(this._source, 'selectionEnd', newOffset);
        },
        defaultFont: 'Arial',
        fonts: null,
        height: 'auto',
        resizable: true
    };

    Editor.classes = {
        btn: 'btn btn-light btn-sm fs-6 lh-1',
        btnGroup: 'btn-group me-1 mb-1',
        btnIcon: 'pe-none',
        checkbox: 'input-check',
        checkboxContainer: 'form-check',
        color: 'flex-grow-1 d-block',
        colorContainerRow: 'row g-0',
        colorContainerColumn: 'col-6',
        colorDefaultBtn: 'btn btn-light btn-sm d-block w-100 py-0',
        colorLabel: 'd-block text-center',
        colorLabelContainer: 'p-2',
        colorRow: 'd-flex flex-row px-2',
        container: 'card shadow-sm',
        dropdown: 'dropdown-menu',
        dropdownButtons: 'pt-2 pe-1 pb-1 ps-2 text-nowrap',
        dropdownGroup: 'btn-group',
        dropdownItem: 'dropdown-item',
        dropdownToggle: 'dropdown-toggle',
        dropHover: 'text-primary',
        dropTarget: 'position-absolute w-100 text-center bg-white',
        dropText: 'position-absolute top-50 translate-middle h5 pe-none',
        editor: 'w-100 p-2 outline-0',
        editorBody: 'card-body d-flex p-0',
        editorContainer: 'position-relative d-flex',
        formError: 'form-error',
        formGroup: 'mb-2',
        imgCursor: 'position-absolute translate-middle pe-none',
        imgHighlight: 'position-absolute pe-none',
        imgResize: 'position-absolute top-100 start-100 translate-middle pe-auto',
        imgSizeInfo: 'position-absolute bottom-0 end-0 text-end me-2 mb-2 py-1 px-3 rounded text-white',
        input: 'input-filled',
        inputContainer: 'form-input',
        inputRipple: 'ripple-line',
        invalidFeedback: 'invalid-feedback',
        modal: 'modal',
        modalBody: 'modal-body',
        modalBtnClose: 'btn-close',
        modalBtnPrimary: 'btn btn-primary ripple mb-0',
        modalBtnSecondary: 'btn btn-secondary ripple mb-0',
        modalContent: 'modal-content shadow',
        modalDialog: 'modal-dialog',
        modalFooter: 'modal-footer',
        modalFullscreen: 'modal-fullscreen',
        modalHeader: 'modal-header',
        modalTitle: 'modal-title',
        popover: 'popover',
        popoverArrow: 'popover-arrow',
        popoverBody: 'popover-body mb-n1 ms-n2 me-n3',
        resizeBar: 'card-footer',
        source: 'font-monospace outline-0 border-0 p-2 mb-0 w-100 text-nowrap',
        sourceContainer: 'd-flex',
        sourceLines: 'bg-light p-2 mb-0 border-end',
        styleContent: 'mb-1',
        table: 'table table-bordered',
        tableCell: 'flex-column',
        tableDropdown: 'p-2',
        tableHover: 'bg-primary',
        tableInfo: 'text-muted',
        tableLink: 'btn btn-light d-block border-dark p-2 rounded-0',
        tableRow: 'd-flex flex-row',
        toolbar: 'card-header pt-1 pe-0 pb-0 ps-1',
        toolbarButtons: 'btn-toolbar'
    };

    Editor.lang = {
        drop: {
            drop: 'Drop image or text',
            dropHere: 'Drop image or text here'
        },
        dropdowns: {
            colorBackground: 'Background Color',
            colorDefault: 'Use Default',
            colorForeground: 'Foreground Color',
            colorTransparent: 'Use Transparent'
        },
        modals: {
            cancel: 'Cancel',
            close: 'Close',
            imageFile: 'Select Files',
            imageUrl: 'Image URL',
            insertImage: 'Insert Image',
            insertLink: 'Insert Link',
            insertVideo: 'Insert Video',
            linkNewWindow: 'Open in new window',
            linkText: 'Link Text',
            linkUrl: 'Link URL',
            videoUrl: 'Video URL',
            videoUrlInvalid: 'Invalid video URL.'
        },
        plugins: {
            alignCenter: 'Align Center',
            alignJustify: 'Justify Full',
            alignLeft: 'Align Left',
            alignRight: 'Align Right',
            bold: 'Bold',
            color: 'Font Color',
            font: 'Font Family',
            fontSize: 'Font Size',
            fullScreen: 'Full Screen',
            hr: 'Horizontal Rule',
            image: 'Image',
            indent: 'Indent',
            italic: 'Italic',
            link: 'Link',
            orderedList: 'Ordered List',
            outdent: 'Outdent',
            paragraph: 'Paragraph',
            redo: 'Redo',
            removeFormat: 'Remove Formatting',
            source: 'View Source',
            strikethrough: 'Strikethrough',
            style: 'Style',
            subscript: 'Subscript',
            superscript: 'Superscript',
            table: 'Table',
            underline: 'Underline',
            undo: 'Undo',
            unlink: 'Unlink',
            unorderedList: 'Unordered List',
            video: 'Video'
        },
        popovers: {
            imageFull: 'Full Size',
            imageHalf: 'Half Size',
            imageOriginal: 'Original Size',
            imageQuarter: 'Quarter Size',
            imageRemove: 'Remove Image',
            floatLeft: 'Float Left',
            floatNone: 'Remove Float',
            floatRight: 'Float Right',
            linkEdit: 'Edit Link',
            tableColumnAfter: 'Add Column After',
            tableColumnBefore: 'Add Column Before',
            tableColumnRemove: 'Remove Column',
            tableRemove: 'Remove Table',
            tableRowAfter: 'Add Row After',
            tableRowBefore: 'Add Row Before',
            tableRowRemove: 'Remove Row',
            unlink: 'Remove Link'
        },
        styles: {
            p: 'Paragraph',
            blockquote: 'Quote',
            pre: 'Code',
            h1: 'Header 1',
            h2: 'Header 2',
            h3: 'Header 3',
            h4: 'Header 4',
            h5: 'Header 5',
            h6: 'Header 6'
        }
    };

    Editor._baseMarkup = '<p><br></p>';
    Editor._cssCommands = ['backColor', 'fontName', 'fontSize', 'foreColor'];

    EditorSet._editors = [];

    UI.initComponent('editor', Editor);

    UI.Editor = Editor;
    UI.EditorSet = EditorSet;

});