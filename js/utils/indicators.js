/*
 * This file is part of the Fxp package.
 *
 * (c) François Pluchino <francois.pluchino@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * Refreshes the left and right indicator, depending of the presence of
 * items.
 *
 * @param {NavScroll} self         The nav scroll instance
 * @param {Boolean}   hideDropdown Hide the dropdown
 */
export function refreshIndicator(self, hideDropdown) {
    let position = self.$element.scroller('getScrollPosition'),
        max = self.$element.scroller('getMaxScrollPosition') - 1;

    if (position > 0) {
        self.$element.addClass('nav-scrollable-has-previous');

    } else {
        self.$element.removeClass('nav-scrollable-has-previous');
    }

    if (position < max) {
        self.$element.addClass('nav-scrollable-has-next');

    } else {
        self.$element.removeClass('nav-scrollable-has-next');
    }

    if (hideDropdown && null !== self.$dropdownToggle) {
        self.$dropdownToggle.dropdown('toggle');
    }
}
