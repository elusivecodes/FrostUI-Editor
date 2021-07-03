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
