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
