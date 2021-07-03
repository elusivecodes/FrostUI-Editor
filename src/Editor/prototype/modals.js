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
