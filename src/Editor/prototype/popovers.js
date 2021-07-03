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
