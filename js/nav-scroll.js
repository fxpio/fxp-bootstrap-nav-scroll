/*
 * This file is part of the Sonatra package.
 *
 * (c) François Pluchino <francois.pluchino@sonatra.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/*global define*/
/*global jQuery*/
/*global navigator*/
/*global window*/
/*global document*/
/*global CSSMatrix*/
/*global WebKitCSSMatrix*/
/*global MSCSSMatrix*/

/**
 * @param {jQuery} $
 */
(function (factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery', 'sonatra-jquery-scroller'], factory);
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {
    'use strict';

    /**
     * Stop the scrolling on press.
     *
     * @param {jQuery.Event|Event|NavScroll} event The jquery event or nav scroll instance
     *
     * @private
     */
    function onEndScroll(event) {
        var self = (undefined !== event.data) ? event.data : event;

        if (self.$element.data('st-scroll-timeout')) {
            window.clearInterval(self.$element.data('st-scroll-timeout'));
            self.$element.removeData('st-scroll-timeout');
        }
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
        var timeout;

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

    /**
     * Action when the previous button is pressed.
     *
     * @param {jQuery.Event} event
     *
     * @typedef {NavScroll} jQuery.Event.data The nav scroll instance
     *
     * @private
     */
    function onPrevious(event) {
        scrollNav(event.data, 'nav-scrollable-has-previous', -15);

        return false;
    }

    /**
     * Action when the next button is pressed.
     *
     * @param {jQuery.Event} event
     *
     * @typedef {NavScroll} jQuery.Event.data The nav scroll instance
     *
     * @private
     */
    function onNext(event) {
        scrollNav(event.data, 'nav-scrollable-has-next', 15);

        return false;
    }

    /**
     * Refreshes the left and right indicator, depending of the presence of
     * items.
     *
     * @param {NavScroll} self The nav scroll instance
     *
     * @private
     */
    function refreshIndicator(self) {
        var position = self.$element.scroller('getScrollPosition'),
            max = self.$element.scroller('getMaxScrollPosition');

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

        if (null !== self.$dropdownToggle) {
            self.$dropdownToggle.dropdown('toggle');
        }
    }

    /**
     * Refresh the indicator on scrolling.
     *
     * @param {jQuery.Event|Event} event
     *
     * @typedef {NavScroll} Event.data The nav scroll instance
     *
     * @private
     */
    function scrolling(event) {
        refreshIndicator(event.data);
    }

    /**
     * Action when dropdown is shown (to close the dropdown when the navscroll is in scrolling).
     *
     * @param {jQuery.Event} event
     *
     * @typedef {NavScroll} jQuery.Event.data The nav scroll instance
     *
     * @private
     */
    function onShownDropdown(event) {
        event.data.$dropdownToggle = $('.dropdown-toggle', event.target);
    }

    /**
     * Action when dropdown is hidden (to close the dropdown when the navscroll is in scrolling).
     *
     * @param {jQuery.Event} event
     *
     * @typedef {NavScroll} jQuery.Event.data The nav scroll instance
     *
     * @private
     */
    function onHideDropdown(event) {
        event.data.$dropdownToggle = null;
    }

    // NAV SCROLL CLASS DEFINITION
    // ===========================

    /**
     * @constructor
     *
     * @param {string|elements|object|jQuery} element
     * @param {object}                        options
     *
     * @this NavScroll
     */
    var NavScroll = function (element, options) {
        this.guid     = jQuery.guid;
        this.options  = $.extend(true, {}, NavScroll.DEFAULTS, options);
        this.$element = $(element);
        this.$dropdownToggle = null;
        this.$menuPrevious = null;
        this.$menuNext = null;

        this.$element
            .addClass('nav-scrollable')
            .scroller($.extend(true, this.options, {'direction': 'horizontal'}))
            .on('shown.bs.dropdown.st.navscroll', null, this, onShownDropdown)
            .on('hide.bs.dropdown.st.navscroll', null, this, onHideDropdown);

        var $nav = $('.' + this.options.classNav, this.$element);

        if ($nav.hasClass('nav-tabs')) {
            this.$element.addClass('is-nav-tabs');
        }

        if ($nav.hasClass('nav-pills')) {
            this.$element.addClass('is-nav-pills');
        }

        // menu items
        this.$menuPrevious = $('> .nav-scrollable-menu.nav-scrollable-prev', this.$element);
        this.$menuNext = $('> .nav-scrollable-menu.nav-scrollable-next', this.$element);

        if (0 === this.$menuNext.length) {
            this.$menuNext = $('<div class="nav-scrollable-menu nav-scrollable-next"><span class="glyphicon glyphicon-chevron-right"></span></div>');
            this.$element.prepend(this.$menuNext);
        }

        if (0 === this.$menuPrevious.length) {
            this.$menuPrevious = $('<div class="nav-scrollable-menu nav-scrollable-prev"><span class="glyphicon glyphicon-chevron-left"></span></div>');
            this.$element.prepend(this.$menuPrevious);
        }

        // menu events
        this.$element
            .on('scrolling.st.scroller.st.navscroll', null, this, scrolling)
            .on('mousedown.st.navscroll touchstart.st.navscroll', '> .nav-scrollable-prev', this, onPrevious)
            .on('mousedown.st.navscroll touchstart.st.navscroll', '> .nav-scrollable-next', this, onNext)
            .on('mouseup.st.navscroll mouseout.st.navscroll touchend.st.navscroll touchcancel.st.navscroll', '> .nav-scrollable-menu', this, onEndScroll);
        $(window).on('resize.st.navscroll' + this.guid, null, this, scrolling);

        refreshIndicator(this);
    },
        old;

    /**
     * Defaults options.
     *
     * @type {object}
     */
    NavScroll.DEFAULTS = {
        classNav:         'nav',
        scrollbar:        false,
        scrollbarInverse: false
    };

    /**
     * Destroy instance.
     *
     * @this NavScroll
     */
    NavScroll.prototype.destroy = function () {
        this.$element
            .off('scrolling.st.scroller.st.navscroll', scrolling)
            .off('shown.bs.dropdown.st.navscroll', onShownDropdown)
            .off('hide.bs.dropdown.st.navscroll', onHideDropdown)
            .off('mousedown.st.navscroll touchstart.st.navscroll', '> .nav-scrollable-prev', onPrevious)
            .off('mousedown.st.navscroll touchstart.st.navscroll', '> .nav-scrollable-next', onNext)
            .off('mouseup.st.navscroll mouseout.st.navscroll touchend.st.navscroll touchcancel.st.navscroll', '> .nav-scrollable-menu', onEndScroll)
            .scroller('destroy');
        $(window).off('resize.st.navscroll' + this.guid, scrolling);

        this.$menuPrevious.remove();
        this.$menuNext.remove();

        delete this.$menuPrevious;
        delete this.$menuNext;
        delete this.$dropdownToggle;
    };


    // NAV SCROLL PLUGIN DEFINITION
    // ============================

    function Plugin(option, value) {
        return this.each(function () {
            var $this   = $(this),
                data    = $this.data('st.navscroll'),
                options = typeof option === 'object' && option;

            if (!data && option === 'destroy') {
                return;
            }

            if (!data) {
                data = new NavScroll(this, options);
                $this.data('st.navscroll', data);
            }

            if (typeof option === 'string') {
                data[option](value);
            }
        });
    }

    old = $.fn.navScroll;

    $.fn.navScroll             = Plugin;
    $.fn.navScroll.Constructor = NavScroll;


    // NAV SCROLL NO CONFLICT
    // ======================

    $.fn.navScroll.noConflict = function () {
        $.fn.navScroll = old;

        return this;
    };


    // NAV SCROLL DATA-API
    // ===================

    $(window).on('load', function () {
        $('[data-nav-scroll="true"]').each(function () {
            var $this = $(this);
            Plugin.call($this, $this.data());
        });
    });

}));
