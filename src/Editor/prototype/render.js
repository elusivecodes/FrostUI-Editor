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

        const html = dom.getValue(this._node);
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
        this._editorScroll = dom.create('div', {
            class: this.constructor.classes.editorScroll,
            style: {
                zIndex: 1
            }
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
        dom.append(this._editorScroll, this._editorContainer);
        dom.append(this._editorBody, this._editorScroll);
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
