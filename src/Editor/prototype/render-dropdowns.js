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
            text: this.constructor.lang.dropdowns.colorForeground,
            class: this.constructor.classes.colorLabel
        });

        const backLabel = dom.create('small', {
            text: this.constructor.lang.dropdowns.colorBackground,
            class: this.constructor.classes.colorLabel
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
