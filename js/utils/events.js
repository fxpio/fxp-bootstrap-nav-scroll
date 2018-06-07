/*
 * This file is part of the Fxp package.
 *
 * (c) François Pluchino <francois.pluchino@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {refreshIndicator} from "./indicators";
import $ from 'jquery';

/**
 * Stop the scrolling on press.
 *
 * @param {jQuery.Event|Event|NavScroll} event The jquery event or nav scroll instance
 */
export function onEndScroll(event) {
    let self = (undefined !== event.data) ? event.data : event;

    if (self.$element.data('st-scroll-timeout')) {
        window.clearInterval(self.$element.data('st-scroll-timeout'));
        self.$element.removeData('st-scroll-timeout');
    }
}

/**
 * Action when the previous button is pressed.
 *
 * @param {jQuery.Event} event
 *
 * @typedef {NavScroll} jQuery.Event.data The nav scroll instance
 */
export function onPrevious(event) {
    scrollNav(event.data, 'nav-scrollable-has-previous', -15);

    return false;
}

/**
 * Action when the next button is pressed.
 *
 * @param {jQuery.Event} event
 *
 * @typedef {NavScroll} jQuery.Event.data The nav scroll instance
 */
export function onNext(event) {
    scrollNav(event.data, 'nav-scrollable-has-next', 15);

    return false;
}

/**
 * Refresh the indicator on scrolling.
 *
 * @param {jQuery.Event|Event} event
 *
 * @typedef {NavScroll} Event.data The nav scroll instance
 */
export function scrolling(event) {
    refreshIndicator(event.data, 'resize' !== event.type);
}

/**
 * Action when dropdown is shown (to close the dropdown when the navscroll is in scrolling).
 *
 * @param {jQuery.Event} event
 *
 * @typedef {NavScroll} jQuery.Event.data The nav scroll instance
 */
export function onShownDropdown(event) {
    event.data.$dropdownToggle = $('.dropdown-toggle', event.target);
}

/**
 * Action when dropdown is hidden (to close the dropdown when the navscroll is in scrolling).
 *
 * @param {jQuery.Event} event
 *
 * @typedef {NavScroll} jQuery.Event.data The nav scroll instance
 */
export function onHideDropdown(event) {
    event.data.$dropdownToggle = null;
}

/**
 * Action when the previous button is pressed.
 *
 * @param {NavScroll} self      The nav scroll instance
 * @param {String}    className The css class of button action
 * @param {Number}    delta     The delta of the scrolling
 *
 * @private
 */
function scrollNav(self, className, delta) {
    let timeout;

    if (!self.$element.hasClass(className)) {
        onEndScroll(self);

        return;
    }

    self.$element.scroller('setScrollPosition', self.$element.scroller('getScrollPosition') + delta);

    timeout = window.setInterval(function () {
        self.$element.scroller('setScrollPosition', self.$element.scroller('getScrollPosition') + delta);
    }, 16);

    self.$element.data('st-scroll-timeout', timeout);
}
