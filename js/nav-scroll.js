/*
 * This file is part of the Fxp package.
 *
 * (c) François Pluchino <francois.pluchino@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import pluginify from '@fxp/jquery-pluginify';
import BasePlugin from '@fxp/jquery-pluginify/js/plugin';
import $ from "jquery";
import '@fxp/jquery-scroller';
import {onEndScroll, onHideDropdown, onNext, onPrevious, onShownDropdown, scrolling} from "./utils/events";
import {refreshIndicator} from "./utils/indicators";

/**
 * Nav Scroll class.
 */
export default class NavScroll extends BasePlugin
{
    /**
     * Constructor.
     *
     * @param {HTMLElement} element The DOM element
     * @param {object}      options The options
     */
    constructor(element, options = {}) {
        super(element, options);

        this.$dropdownToggle = null;
        this.$menuPrevious = null;
        this.$menuNext = null;

        this.$element
            .addClass('nav-scrollable')
            .scroller($.extend(true, this.options, {'direction': 'horizontal'}))
            .on('shown.bs.dropdown.fxp.navscroll', null, this, onShownDropdown)
            .on('hide.bs.dropdown.fxp.navscroll', null, this, onHideDropdown);

        let $nav = $('.' + this.options.classNav, this.$element);

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
            this.$menuNext = $('<div class="nav-scrollable-menu nav-scrollable-next">' + this.options.nextIcon + '</div>');
            this.$element.prepend(this.$menuNext);
        }

        if (0 === this.$menuPrevious.length) {
            this.$menuPrevious = $('<div class="nav-scrollable-menu nav-scrollable-prev">' + this.options.previousIcon + '</div>');
            this.$element.prepend(this.$menuPrevious);
        }

        // menu events
        this.$element
            .on('scrolling.fxp.scroller.fxp.navscroll', null, this, scrolling)
            .on('mousedown.fxp.navscroll touchstart.fxp.navscroll', '> .nav-scrollable-prev', this, onPrevious)
            .on('mousedown.fxp.navscroll touchstart.fxp.navscroll', '> .nav-scrollable-next', this, onNext)
            .on('mouseup.fxp.navscroll mouseout.fxp.navscroll touchend.fxp.navscroll touchcancel.fxp.navscroll', '> .nav-scrollable-menu', this, onEndScroll);
        $(window).on('resize.fxp.navscroll' + this.guid, null, this, scrolling);

        refreshIndicator(this, true);

        if (this.options.initscrollToActiveItem) {
            this.scrollToActiveItem();
        }
    }

    /**
     * Scroll to the active item.
     */
    scrollToActiveItem() {
        let $nav = $('.' + this.options.classNav, this.$element),
            $active = $('> li.active', $nav),
            navWidth,
            activePosition;

        if (0 === $active.length) {
            return;
        }

        activePosition = $active.position().left + $active.outerWidth();
        navWidth = $nav.parent().innerWidth();

        if (activePosition >= navWidth) {
            this.$element.scroller('setScrollPosition', activePosition - navWidth);
        }
    }

    /**
     * Destroy the instance.
     */
    destroy() {
        this.$element
            .off('scrolling.fxp.scroller.fxp.navscroll', scrolling)
            .off('shown.bs.dropdown.fxp.navscroll', onShownDropdown)
            .off('hide.bs.dropdown.fxp.navscroll', onHideDropdown)
            .off('mousedown.fxp.navscroll touchstart.fxp.navscroll', '> .nav-scrollable-prev', onPrevious)
            .off('mousedown.fxp.navscroll touchstart.fxp.navscroll', '> .nav-scrollable-next', onNext)
            .off('mouseup.fxp.navscroll mouseout.fxp.navscroll touchend.fxp.navscroll touchcancel.fxp.navscroll', '> .nav-scrollable-menu', onEndScroll)
            .removeClass('is-nav-tabs')
            .removeClass('is-nav-pills')
            .removeClass('nav-scrollable-has-previous')
            .removeClass('nav-scrollable-has-next')
            .scroller('destroy');

        $(window).off('resize.fxp.navscroll' + this.guid, scrolling);

        this.$menuPrevious.remove();
        this.$menuNext.remove();

        super.destroy();
    }
}

/**
 * Defaults options.
 */
NavScroll.defaultOptions = {
    classNav:               'nav',
    scrollbar:              false,
    scrollbarInverse:       false,
    initscrollToActiveItem: true,
    previousIcon:           '<span class="glyphicon glyphicon-chevron-left"></span>',
    nextIcon:               '<span class="glyphicon glyphicon-chevron-right"></span>'
};

pluginify('navScroll', 'fxp.navscroll', NavScroll, true, '[data-nav-scroll="true"]');
