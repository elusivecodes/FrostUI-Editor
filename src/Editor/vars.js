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
