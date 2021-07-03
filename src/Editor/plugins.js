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
