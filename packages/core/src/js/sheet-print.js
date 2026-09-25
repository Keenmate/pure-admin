/**
 * Pure Admin — single-element printing
 *
 * The browser has no native "print just this node" API: window.print()
 * always prints the whole document. This helper clones ONE element into a
 * hidden, isolated <iframe> that carries the page's stylesheets and the
 * current theme-mode / dir attributes, then prints only that iframe. So a
 * single .pa-sheet prints on its own — no page-level @media print stylesheet
 * hiding the app chrome, and the visible page is never disturbed.
 *
 * API (on window.pureAdmin):
 *   pureAdmin.printElement(target, options)
 *     target  — an Element, a CSS selector string, or an Event (uses its
 *               target's [data-print-target] selector, else nearest .pa-sheet).
 *     options — { title } sets the print document title (the default
 *               "Save as PDF" filename); { css } injects extra print CSS.
 *   pureAdmin.printSheet(target, options)
 *     Convenience: resolves target, then climbs to the enclosing .pa-sheet.
 *     Use from a print button placed INSIDE the sheet.
 *
 * Anything inside the printed element marked [data-print-omit] or
 * .pa-print-hide is stripped from the printout — so an in-sheet print
 * button doesn't print itself.
 */
(function () {
    'use strict';

    var pa = (window.pureAdmin = window.pureAdmin || {});

    // Resolve a print target from an Element / selector string / Event / button.
    function resolveTarget(target) {
        if (!target) return null;
        if (typeof target === 'string') return document.querySelector(target);
        if (target.nodeType === 1) return target; // already an element

        // An Event (or event-like) — look at the element that fired it.
        var el = target.currentTarget || target.target;
        if (el && el.getAttribute) {
            var sel = el.getAttribute('data-print-target');
            if (sel) return document.querySelector(sel);
            if (el.closest) {
                var sheet = el.closest('.pa-sheet');
                if (sheet) return sheet;
            }
        }
        return null;
    }

    // Snapshot every stylesheet <link> and inline <style> from the page head,
    // so the cloned element renders identically inside the iframe.
    function collectStyles() {
        var nodes = document.querySelectorAll('link[rel="stylesheet"], style');
        var html = '';
        for (var i = 0; i < nodes.length; i++) {
            html += nodes[i].outerHTML;
        }
        return html;
    }

    function escapeAttr(str) {
        return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
    }

    function escapeText(str) {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    }

    /**
     * Print a single element in isolation.
     * @param {Element|string|Event} target
     * @param {{title?: string, css?: string}} [options]
     */
    function printElement(target, options) {
        options = options || {};
        var el = resolveTarget(target);
        if (!el) {
            console.warn('[pureAdmin.printElement] no element to print');
            return;
        }

        // A landscape sheet must print on a landscape page. The named @page
        // (page: pa-sheet-landscape) that rotates it in a whole-page print is
        // honoured unevenly by browsers, so for this ISOLATED document we make
        // the DEFAULT page landscape and size the layout iframe to match — so
        // the sheet expands to the full landscape width instead of being clamped
        // to portrait. Detect the sheet itself OR a landscape sheet inside it.
        var isLandscape = (el.classList && el.classList.contains('pa-sheet--landscape')) ||
            (el.querySelector && !!el.querySelector('.pa-sheet--landscape'));

        // Clone so we can drop no-print descendants without touching the DOM.
        var clone = el.cloneNode(true);
        var omit = clone.querySelectorAll('[data-print-omit], .pa-print-hide');
        for (var i = 0; i < omit.length; i++) {
            omit[i].parentNode.removeChild(omit[i]);
        }

        var htmlEl = document.documentElement;
        var htmlClass = htmlEl.className || '';           // carries pc-mode-* (theme mode)
        var dir = htmlEl.getAttribute('dir') || '';       // carries RTL
        var lang = htmlEl.getAttribute('lang') || '';
        var title = options.title != null ? options.title : document.title;

        // data-pa-print="1" is a sentinel: appending an iframe first fires a
        // load event for its initial about:blank document — printing THAT gives
        // a blank page. The onload handler ignores any load whose document
        // lacks this marker, so we only print once the real content is in.
        var srcdoc =
            '<!doctype html><html data-pa-print="1" class="' + escapeAttr(htmlClass) + '"' +
            (dir ? ' dir="' + escapeAttr(dir) + '"' : '') +
            (lang ? ' lang="' + escapeAttr(lang) + '"' : '') +
            '><head><meta charset="utf-8"><title>' + escapeText(title) + '</title>' +
            collectStyles() +
            (isLandscape ? '<style>@page { size: A4 landscape; }</style>' : '') +
            (options.css ? '<style>' + options.css + '</style>' : '') +
            '</head><body>' + clone.outerHTML + '</body></html>';

        var iframe = document.createElement('iframe');
        iframe.setAttribute('aria-hidden', 'true');
        // Off-screen but with a REAL size — a 0×0 / display:none iframe has no
        // layout and prints blank. Positioned off-canvas so it's invisible.
        iframe.style.cssText =
            'position:fixed;left:-9999px;top:0;width:' + (isLandscape ? '297mm' : '210mm') +
            ';height:' + (isLandscape ? '210mm' : '297mm') + ';border:0;';

        var cleaned = false;
        function cleanup() {
            if (cleaned) return;
            cleaned = true;
            if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
        }

        iframe.onload = function () {
            var d = iframe.contentDocument || (iframe.contentWindow && iframe.contentWindow.document);
            // Ignore the initial about:blank load (see sentinel note above).
            if (!d || d.documentElement.getAttribute('data-pa-print') !== '1') return;

            var win = iframe.contentWindow;
            // afterprint fires when the dialog closes (printed OR cancelled).
            win.addEventListener('afterprint', cleanup);
            // Fallback for engines that don't fire afterprint reliably.
            setTimeout(cleanup, 60000);
            // One frame later so the cloned stylesheets are applied before print.
            setTimeout(function () {
                win.focus();
                win.print();
            }, 50);
        };

        document.body.appendChild(iframe);
        // srcdoc (not document.write) so relative stylesheet URLs resolve
        // against the parent document's base and the load event waits for CSS.
        iframe.srcdoc = srcdoc;
    }

    // Print the nearest .pa-sheet to the given button / event / element.
    function printSheet(target, options) {
        var el = resolveTarget(target);
        if (el && !el.classList.contains('pa-sheet') && el.closest) {
            el = el.closest('.pa-sheet') || el;
        }
        printElement(el, options);
    }

    pa.printElement = printElement;
    pa.printSheet = printSheet;
})();
