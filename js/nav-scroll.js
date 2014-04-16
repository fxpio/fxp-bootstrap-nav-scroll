/*
 * This file is part of the Sonatra package.
 *
 * (c) François Pluchino <francois.pluchino@sonatra.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

+function ($) {
    'use strict';

    // NAV SCROLL CLASS DEFINITION
    // ===========================

    /**
     * @constructor
     *
     * @param htmlString|Element|Array|jQuery element
     * @param Array                           options
     *
     * @this
     */
    var NavScroll = function (element, options) {
        this.guid       = jQuery.guid;
        this.options    = $.extend({}, NavScroll.DEFAULTS, options);
        this.$element   = $(element);
        this.$content   = $('.' + this.options.classNav, this.$element);

        this.$element.on('DOMMouseScroll mousewheel', $.proxy(onMouseScroll, this));
        this.$element.on('show.bs.dropdown.st.nav-scroll', $.proxy(onShowDropdown, this));
        this.$element.on('hide.bs.dropdown.st.nav-scroll', $.proxy(onHideDropdown, this));
        this.$element.on('scroll.st.nav-scroll', $.proxy(preventScroll, this));
        $(window).on('resize.st.navscroll' + this.guid, $.proxy(this.resizeScroll, this));

        $.proxy(refreshIndicator, this)();

        this.hammer = new Hammer(this.$element.get(0), {
            tap: false,
            transform: false,
            release: false,
            hold: false,
            swipe: false,
            drag_block_horizontal: true,
            drag_lock_to_axis: true,
            drag_min_distance: 3
        })

        .on('drag', $.proxy(this.onDrag, this))
        .on('dragend', $.proxy(this.onDragEnd, this));
    };

    /**
     * Defaults options.
     *
     * @type Array
     */
    NavScroll.DEFAULTS = {
        classNav:        'nav',
        maxBounce:       100,
        inertiaVelocity: 0.7,
        inertiaDuration: 0.2,
        inertiaFunction: 'ease'
    };

    /**
     * On drag action.
     * 
     * @param Event event The hammer event
     */
    NavScroll.prototype.onDrag = function (event) {
        if ('left' == event.gesture.direction || 'right' == event.gesture.direction) {
            var horizontal = $.proxy(limitHorizontalValue, this)(event, this.options.maxBounce);

            $.proxy(changeTransition, this)(this.$content, 'none');
            $.proxy(changeTransform, this)(this.$content, 'translate3d(' + -horizontal + 'px, 0px, 0px)');
            $.proxy(refreshIndicator, this)();
        }
    };

    /**
     * On drag end action.
     * 
     * @param Event event The hammer event
     */
    NavScroll.prototype.onDragEnd = function (event) {
        $.proxy(changeTransition, this)(this.$content);

        if ('left' == event.gesture.direction || 'right' == event.gesture.direction) {
            var horizontal = $.proxy(limitHorizontalValue, this)(event, 0, true);

            this.$content.on('transitionend msTransitionEnd oTransitionEnd', $.proxy(dragTransitionEnd, this));
            $.proxy(changeTransform, this)(this.$content, 'translate3d(' + -horizontal + 'px, 0px, 0px)');
        }

        $(event.target).on('click.st.navscroll', $.proxy(onDragEndClick, this));
        $.proxy(refreshIndicator, this)();

        delete this.dragStartPosition;
    };

    /**
     * Resizes the scoll content.
     * Moves the content on side if the side content is above of side wrapper.
     *
     * @this
     */
    NavScroll.prototype.resizeScroll = function () {
        var position = this.$content.position()['left'];

        if (position >= 0) {
            $.proxy(changeTransition, this)(this.$content, 'none');
            $.proxy(changeTransform, this)(this.$content, 'translate3d(0px, 0px, 0px)');
            $.proxy(refreshIndicator, this)();

            return;
        }

        var rightPosition = position + this.$content.outerWidth();
        var maxRight = this.$element.innerWidth();

        if (rightPosition < maxRight) {
            position += maxRight - rightPosition;

            $.proxy(changeTransition, this)(this.$content, 'none');
            $.proxy(changeTransform, this)(this.$content, 'translate3d(' + position + 'px, 0px, 0px)');
            $.proxy(refreshIndicator, this)();
        }
    };

    /**
     * Destroy instance.
     *
     * @this
     */
    NavScroll.prototype.destroy = function () {
        $.proxy(onHideDropdown, this)();
        this.$element.off('DOMMouseScroll mousewheel', $.proxy(onMouseScroll, this));
        this.$element.off('show.bs.dropdown.st.nav-scroll', $.proxy(onShowDropdown, this));
        this.$element.off('hide.bs.dropdown.st.nav-scroll', $.proxy(onHideDropdown, this));
        this.$element.off('scroll.st.nav-scroll', $.proxy(preventScroll, this));
        this.$element.removeData('st.navscroll');
        $(window).off('resize.st.navscroll' + this.guid, $.proxy(this.resizeScroll, this));
    };

    /**
     * Limits the horizontal value with top or right wrapper position (with or
     * without the max bounce).
     *
     * @param Event   event
     * @param Integer maxBounce
     * @param Boolean inertia
     *
     * @return Integer The limited horizontal value
     *
     * @this
     * @private
     */
    function limitHorizontalValue (event, maxBounce, inertia) {
        var useScroll = this.options.useScroll;

        if (undefined == this.dragStartPosition) {
            this.dragStartPosition = getPosition(this.$content);
        }

        var wrapperWidth = this.$element.innerWidth();
        var height = this.$content.outerWidth();
        var maxScroll = height - wrapperWidth + maxBounce;
        var horizontal = -Math.round(event.gesture.deltaX + this.dragStartPosition);

        // inertia
        if (inertia) {
            var inertiaVal = -event.gesture.deltaX * event.gesture.velocityX * (1 + this.options.inertiaVelocity);
            horizontal = Math.round(horizontal + inertiaVal);
        }

        // top bounce
        if (horizontal < -maxBounce) {
            horizontal = -maxBounce;

        // right bounce with scroll
        } else if (height > wrapperWidth) {
            if (horizontal > maxScroll) {
                horizontal = maxScroll;
            }

        // right bounce without scroll
        } else {
            if (0 == maxBounce) {
                horizontal = 0;

            } else if (horizontal > maxBounce) {
                horizontal = maxBounce;
            }
        }

        return horizontal;
    }

    /**
     * Get the horizontal position of target element.
     *
     * @param jQuery $target
     *
     * @return Integer
     *
     * @this
     * @private
     */
    function getPosition ($target) {
        var transformCss = $target.css('transform');
        var transform = {e: 0, f: 0};

        if (transformCss) {
            if ('function' === typeof CSSMatrix) {
                transform = new CSSMatrix(transformCss);

            } else if ('function' === typeof WebKitCSSMatrix) {
                transform = new WebKitCSSMatrix(transformCss);

            } else if ('function' === typeof MSCSSMatrix) {
                transform = new MSCSSMatrix(transformCss);

            } else {
                var reMatrix = /matrix\(\s*-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?\s*\,\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)/;
                var match = transformCss.match(reMatrix);

                if (match) {
                    transform.e = parseInt(match[1]);
                    transform.f = parseInt(match[2]);
                }
            }
        }

        return transform.e;
    }

    /**
     * Action on mouse drag end for block click action.
     *
     * @param jQuery.Event event
     *
     * @this
     * @private
     */
    function onDragEndClick (event) {
        event.preventDefault();
        event.stopPropagation();
        $(event.target).off('click.st.navscroll', $.proxy(onDragEndClick, this));
    }

    /**
     * Action on mouse scroll event.
     *
     * @param jQuery.Event event
     *
     * @this
     * @private
     */
    function onMouseScroll (event) {
        var position = -getPosition(this.$content);
        var wrapperWidth = this.$element.innerWidth();
        var contentWidth = this.$content.outerWidth();
        var delta = (event.originalEvent.type == 'DOMMouseScroll' ?
                event.originalEvent.detail * -40 :
                event.originalEvent.wheelDelta);

        if (!(delta > 0 && position <= 0) && !(delta <= 0 && (contentWidth - position) <= wrapperWidth)) {
            event.stopPropagation();
            event.preventDefault();
        }

        position -= delta;
        position = Math.max(position, 0);

        if (this.$content.outerWidth() <= this.$element.innerWidth()) {
            position = 0;

        } else if ((contentWidth - position) < wrapperWidth) {
            position = contentWidth - wrapperWidth;
        }

        $.proxy(changeTransition, this)(this.$content, 'none');
        $.proxy(changeTransform, this)(this.$content, 'translate3d(' + -position + 'px, 0px, 0px)');
        $.proxy(refreshIndicator, this)();
    }

    /**
     * Prevent scroll event (blocks the scroll on the tab keyboard event with
     * the item is outside the wrapper).
     *
     * @param jQuery.Event event
     *
     * @this
     * @private
     */
    function preventScroll (event) {
        $(event.target).scrollLeft(0);
    }

    /**
     * Action on show dropdown event.
     *
     * @param jQuery.Event event
     *
     * @this
     * @private
     */
    function onShowDropdown (event) {
        if (undefined != this.$dropdownMenu) {
            $.proxy(onHideDropdown, this)(event);
        }

        var ddId = 'dropdown-menu-original-' + this.guid;

        this.$dropdownToggle = $('> .dropdown-toggle', event.target);
        this.$dropdownMenu = $('> .dropdown-menu', event.target);
        this.$dropdownMenu.attr('data-dropdown-restore-id', ddId);
        this.$dropdownRestoreMenu = $('<div class="dropdown-menu-restore-position"></div>');
        this.$dropdownRestoreMenu.attr('data-dropdown-restore-for', ddId);
        this.$dropdownMenu.after(this.$dropdownRestoreMenu);
        this.$dropdownMenu.addClass('dropdown-nav-scrollable');
        this.$dropdownMenu.css('left', Math.max(0, $(event.target).position()['left']));

        if (!this.$dropdownMenu.parent().hasClass('navbar')) {
            this.$dropdownMenu.css('top', $(event.target).position()['top'] + $(event.target).outerHeight());
        }

        this.$element.before(this.$dropdownMenu);
    }

    /**
     * Action on hide dropdown event.
     *
     * @param jQuery.Event event
     *
     * @this
     * @private
     */
    function onHideDropdown (event) {
        if (undefined == this.$dropdownMenu) {
            return;
        }

        this.$dropdownRestoreMenu.after(this.$dropdownMenu);
        this.$dropdownRestoreMenu.remove();
        this.$dropdownMenu.removeClass('dropdown-nav-scrollable');
        this.$dropdownMenu.removeAttr('data-dropdown-restore-id');
        this.$dropdownMenu.css('left', '');
        this.$dropdownMenu.css('top', '');

        delete this.$dropdownToggle;
        delete this.$dropdownMenu;
        delete this.$dropdownRestoreMenu;
    }

    /**
     * Refresh the indicator on end of scroll inertia transition.
     *
     * @this
     * @private
     */
    function dragTransitionEnd () {
        this.$content.off('transitionend msTransitionEnd oTransitionEnd', $.proxy(dragTransitionEnd, this));
        $.proxy(refreshIndicator, this)();
    }

    /**
     * Changes the css transition configuration on target element.
     *
     * @param jQuery $target    The element to edited
     * @param String transition The css transition configuration of target
     *
     * @this
     * @private
     */
    function changeTransition ($target, transition) {
        if (undefined == transition) {
            transition = 'transform ' + this.options.inertiaDuration + 's';

            if (null != this.options.inertiaFunction) {
                transition += ' ' + this.options.inertiaFunction;
            }
        }

        if ('' == transition) {
            $target.css('-webkit-transition', transition);
            $target.css('transition', transition);
        }

        $target.get(0).style['-webkit-transition'] = 'none' == transition ? transition : '-webkit-' + transition;
        $target.get(0).style['transition'] = transition;
    }

    /**
     * Changes the css transform configuration on target element.
     *
     * @param jQuery $target   The element to edited
     * @param String transform The css transform configuration of target
     *
     * @this
     * @private
     */
    function changeTransform ($target, transform) {
        $target.css('-webkit-transform', transform);
        $target.css('transform', transform);
    }

    /**
     * Refreshes the left and right indicator, depending of the presence of
     * items.
     *
     * @this
     * @private
     */
    function refreshIndicator () {
        var wrapperPosition = parseInt(this.$element.position()['left']);
        var position = parseInt(this.$content.position()['left']) - wrapperPosition;
        var rightPosition = position + this.$content.outerWidth();
        var maxRight = this.$element.innerWidth();

        if (position < 0) {
            this.$element.addClass('nav-scrollable-has-previous');

        } else {
            this.$element.removeClass('nav-scrollable-has-previous');
        }

        if (rightPosition > maxRight) {
            this.$element.addClass('nav-scrollable-has-next');

        } else {
            this.$element.removeClass('nav-scrollable-has-next');
        }

        if (undefined != this.$dropdownToggle) {
            this.$dropdownToggle.dropdown('toggle');
        }
    }


    // NAV SCROLL PLUGIN DEFINITION
    // ============================

    var old = $.fn.navScroll;

    $.fn.navScroll = function (option, _relatedTarget) {
        return this.each(function () {
            var $this   = $(this);
            var data    = $this.data('st.navscroll');
            var options = typeof option == 'object' && option;

            if (!data && option == 'destroy') {
                return;
            }

            if (!data) {
                $this.data('st.navscroll', (data = new NavScroll(this, options)));
            }

            if (typeof option == 'string') {
                data[option]();
            }
        });
    };

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
            $this.navScroll($this.data());
        });
    });

}(jQuery);
