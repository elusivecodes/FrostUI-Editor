import $ from '@fr0st/query';

const transparent = 'rgba(0, 0, 0, 0)';

/**
 * Determine if a node is a form element.
 * https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/elements
 * @param {Node} node The input node.
 * @return {Boolean} TRUE if the node is a form element, otherwise FALSE.
 */
const isFormElement = (node) => $.is(node, 'button, fieldset, input, object, output, select, textarea');

/**
 * Determine if a node is phrasing content.
 * https://html.spec.whatwg.org/multipage/dom.html#phrasing-content
 * @param {Node} node The input node.
 * @return {Boolean} TRUE if the node is phrasing content, otherwise FALSE.
 */
const isPhrasingContent = (node) => $._isText(node) || $.is(node, 'a, abbr, area, audio, b, bdi, bdo, br, button, cite, code, data, datalist, del, dfn, em, embed, i, iframe, img, input, ins, kbd, label, map, mark, math, meter, noscript, object, output, picture, progress, q, ruby, s, samp, script, select, slot, small, span, strong, sub, sup, svg, template, textarea, time, u, var, video, wbr');

/**
 * Determine if a node is a void element.
 * https://developer.mozilla.org/en-US/docs/Glossary/Void_element
 * @param {Node} node The input node.
 * @return {Boolean} TRUE if the node is a void element, otherwise FALSE.
 */
const isVoidElement = (node) => $.is(node, 'area, base, br, col, embed, hr, img, input, link, meta, param, source, track, wbr');

/**
 * Determine if a node is a phrasing container.
 * @param {Node} node The input node.
 * @return {Boolean} TRUE if the node is a phrasing container, otherwise FALSE.
 */
const isPhrasingContainer = (node) => !$._isText(node) && isPhrasingContent(node) && !isVoidElement(node) && !isFormElement(node);

/**
 * Join adjacent inline elements.
 * @param {HTMLElement} container The container.
 * @param {object} markers The selection markers.
 */
export function joinAdjacentNodes(container, markers) {
    const elements = $.find('*', container);

    const isMarker = (node) =>
        (markers.start && $.isSame(node, markers.start)) ||
        (markers.end && $.isSame(node, markers.end));

    for (const element of elements) {
        if (
            isMarker(element) ||
            !isPhrasingContainer(element)
        ) {
            continue;
        }

        const moveMarkers = [];
        let next = element.nextSibling;
        while (next && isMarker(next)) {
            moveMarkers.push(next);
            next = next.nextSibling;
        }

        if (
            !next ||
            !isPhrasingContainer(next) ||
            !$.isEqual(element, next, { shallow: true })
        ) {
            continue;
        }

        $.prepend(next, $.contents(element));

        if (moveMarkers.length) {
            $.prepend(next, moveMarkers);
        }

        $.detach(element);
    }
};

/**
 * Normalize phrasing containers.
 * @param {HTMLElement} container The container.
 */
export function normalizePhrasing(container) {
    const elements = $.find('h1, h2, h3, h4, h5, h6, p, pre', container);

    for (const element of elements) {
        const contents = $.contents(element);

        if (!contents.length) {
            continue;
        }

        for (const [i, child] of contents.entries()) {
            if (isPhrasingContent(child)) {
                continue;
            }

            const nextSiblings = contents.splice(i);
            $.after(element, nextSiblings);
            break;
        }

        if (!contents.length) {
            $.detach(element);
        }
    }
};

/**
 * Normalize span elements.
 * @param {HTMLElement} container The container.
 */
export function normalizeSpans(container) {
    const spans = $.find('span', container);

    for (const span of spans) {
        if ([...$.getProperty(span, 'attributes')].length) {
            continue;
        }

        const contents = $.contents(span);

        if (contents.length) {
            $.after(span, contents);
            next = contents[0];
        }

        $.detach(span);
    }
};

/**
 * Normalize style attributes.
 * @param {HTMLElement} container The container.
 */
export function normalizeStyles(container) {
    const styleNodes = $.find('[style]', container);

    for (const styleNode of styleNodes) {
        const styles = $.getStyle(styleNode);

        for (const [style, value] of Object.entries(styles)) {
            if (value === 'inherit') {
                $.removeStyle(styleNode, style);
                continue;
            }

            const clone = $.clone(styleNode, { deep: false });
            $.after(styleNode, clone);
            $.removeAttribute(clone, 'style');
            let testValue = $.css(clone, style);
            $.detach(clone);

            if (style === 'background-color' && testValue === transparent) {
                testValue = [container, ...$.parents(styleNode, null, container)]
                    .map((parent) => $.css(parent, style))
                    .filter((parentStyle) => parentStyle !== transparent)
                    .pop();
            }

            const cssValue = $.css(styleNode, style);

            if (cssValue === testValue) {
                $.removeStyle(styleNode, style);
            }
        }

        if ($.getAttribute(styleNode, 'style') === '') {
            $.removeAttribute(styleNode, 'style');
        }
    }
};
