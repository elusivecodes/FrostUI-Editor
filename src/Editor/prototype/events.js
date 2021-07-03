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
