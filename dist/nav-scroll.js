var FxpNavScroll = (function (exports, $) {
  'use strict';

  $ = $ && $.hasOwnProperty('default') ? $['default'] : $;

  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized(self);
  }

  function _superPropBase(object, property) {
    while (!Object.prototype.hasOwnProperty.call(object, property)) {
      object = _getPrototypeOf(object);
      if (object === null) break;
    }

    return object;
  }

  function _get(target, property, receiver) {
    if (typeof Reflect !== "undefined" && Reflect.get) {
      _get = Reflect.get;
    } else {
      _get = function _get(target, property, receiver) {
        var base = _superPropBase(target, property);

        if (!base) return;
        var desc = Object.getOwnPropertyDescriptor(base, property);

        if (desc.get) {
          return desc.get.call(receiver);
        }

        return desc.value;
      };
    }

    return _get(target, property, receiver || target);
  }

  /**
   * Define the class as Jquery plugin.
   *
   * @param {String}      pluginName  The name of jquery plugin defined in $.fn
   * @param {String}      dataName    The key name of jquery data
   * @param {function}    ClassName   The class name
   * @param {boolean}     [shorthand] Check if the shorthand of jquery plugin must be added
   * @param {String|null} dataApiAttr The DOM data attribute selector name to init the jquery plugin with Data API, NULL to disable
   * @param {String}      removeName  The method name to remove the plugin data
   */

  function pluginify (pluginName, dataName, ClassName) {
    var shorthand = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    var dataApiAttr = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
    var removeName = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 'destroy';
    var old = $.fn[pluginName];

    $.fn[pluginName] = function () {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      var resFunc, resList;
      resList = this.each(function (i, element) {
        var $this = $(element),
            data = $this.data(dataName);

        if (!data) {
          data = new ClassName(element, _typeof(options) === 'object' ? options : {});
          $this.data(dataName, data);
        }

        if (typeof options === 'string' && data) {
          if (data[options]) {
            resFunc = data[options].apply(data, args);
            resFunc = resFunc !== data ? resFunc : undefined;
          } else if (data.constructor[options]) {
            resFunc = data.constructor[options].apply(data, args);
            resFunc = resFunc !== data ? resFunc : undefined;
          }

          if (options === removeName) {
            $this.removeData(dataName);
          }
        }
      });
      return 1 === resList.length && undefined !== resFunc ? resFunc : resList;
    };

    $.fn[pluginName].Constructor = ClassName; // Shorthand

    if (shorthand) {
      $[pluginName] = function (options) {
        return $({})[pluginName](options);
      };
    } // No conflict


    $.fn[pluginName].noConflict = function () {
      return $.fn[pluginName] = old;
    }; // Data API


    if (null !== dataApiAttr) {
      $(window).on('load', function () {
        $(dataApiAttr).each(function () {
          var $this = $(this);
          $.fn[pluginName].call($this, $this.data());
        });
      });
    }
  }

  var DEFAULT_OPTIONS = {};
  /**
   * Base class for plugin.
   */

  var BasePlugin =
  /*#__PURE__*/
  function () {
    /**
     * Constructor.
     *
     * @param {HTMLElement} element The DOM element
     * @param {object}      options The options
     */
    function BasePlugin(element) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      _classCallCheck(this, BasePlugin);

      this.guid = $.guid;
      this.options = $.extend(true, {}, this.constructor.defaultOptions, options);
      this.$element = $(element);
    }
    /**
     * Destroy the instance.
     */


    _createClass(BasePlugin, [{
      key: "destroy",
      value: function destroy() {
        var self = this;
        Object.keys(self).forEach(function (key) {
          delete self[key];
        });
      }
      /**
       * Set the default options.
       * The new values are merged with the existing values.
       *
       * @param {object} options
       */

    }], [{
      key: "defaultOptions",
      set: function set(options) {
        DEFAULT_OPTIONS[this.name] = $.extend(true, {}, DEFAULT_OPTIONS[this.name], options);
      }
      /**
       * Get the default options.
       *
       * @return {object}
       */
      ,
      get: function get() {
        if (undefined === DEFAULT_OPTIONS[this.name]) {
          DEFAULT_OPTIONS[this.name] = {};
        }

        return DEFAULT_OPTIONS[this.name];
      }
    }]);

    return BasePlugin;
  }();

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
  function refreshIndicator(self, hideDropdown) {
    var position = self.$element.scroller('getScrollPosition'),
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

  /*
   * This file is part of the Fxp package.
   *
   * (c) François Pluchino <francois.pluchino@gmail.com>
   *
   * For the full copyright and license information, please view the LICENSE
   * file that was distributed with this source code.
   */
  /**
   * Stop the scrolling on press.
   *
   * @param {jQuery.Event|Event|NavScroll} event The jquery event or nav scroll instance
   */

  function onEndScroll(event) {
    var self = undefined !== event.data ? event.data : event;

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
   */

  function onNext(event) {
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

  function scrolling(event) {
    refreshIndicator(event.data, 'resize' !== event.type);
  }
  /**
   * Action when dropdown is shown (to close the dropdown when the navscroll is in scrolling).
   *
   * @param {jQuery.Event} event
   *
   * @typedef {NavScroll} jQuery.Event.data The nav scroll instance
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
   */

  function onHideDropdown(event) {
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
   * Nav Scroll class.
   */

  var NavScroll =
  /*#__PURE__*/
  function (_BasePlugin) {
    _inherits(NavScroll, _BasePlugin);

    /**
     * Constructor.
     *
     * @param {HTMLElement} element The DOM element
     * @param {object}      options The options
     */
    function NavScroll(element) {
      var _this;

      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      _classCallCheck(this, NavScroll);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(NavScroll).call(this, element, options));
      _this.$dropdownToggle = null;
      _this.$menuPrevious = null;
      _this.$menuNext = null;

      _this.$element.addClass('nav-scrollable').scroller($.extend(true, _this.options, {
        'direction': 'horizontal'
      })).on('shown.bs.dropdown.fxp.navscroll', null, _assertThisInitialized(_this), onShownDropdown).on('hide.bs.dropdown.fxp.navscroll', null, _assertThisInitialized(_this), onHideDropdown);

      var $nav = $('.' + _this.options.classNav, _this.$element);

      if ($nav.hasClass('nav-tabs')) {
        _this.$element.addClass('is-nav-tabs');
      }

      if ($nav.hasClass('nav-pills')) {
        _this.$element.addClass('is-nav-pills');
      } // menu items


      _this.$menuPrevious = $('> .nav-scrollable-menu.nav-scrollable-prev', _this.$element);
      _this.$menuNext = $('> .nav-scrollable-menu.nav-scrollable-next', _this.$element);

      if (0 === _this.$menuNext.length) {
        _this.$menuNext = $('<div class="nav-scrollable-menu nav-scrollable-next">' + _this.options.nextIcon + '</div>');

        _this.$element.prepend(_this.$menuNext);
      }

      if (0 === _this.$menuPrevious.length) {
        _this.$menuPrevious = $('<div class="nav-scrollable-menu nav-scrollable-prev">' + _this.options.previousIcon + '</div>');

        _this.$element.prepend(_this.$menuPrevious);
      } // menu events


      _this.$element.on('scrolling.fxp.scroller.fxp.navscroll', null, _assertThisInitialized(_this), scrolling).on('mousedown.fxp.navscroll touchstart.fxp.navscroll', '> .nav-scrollable-prev', _assertThisInitialized(_this), onPrevious).on('mousedown.fxp.navscroll touchstart.fxp.navscroll', '> .nav-scrollable-next', _assertThisInitialized(_this), onNext).on('mouseup.fxp.navscroll mouseout.fxp.navscroll touchend.fxp.navscroll touchcancel.fxp.navscroll', '> .nav-scrollable-menu', _assertThisInitialized(_this), onEndScroll);

      $(window).on('resize.fxp.navscroll' + _this.guid, null, _assertThisInitialized(_this), scrolling);
      refreshIndicator(_assertThisInitialized(_this), true);

      if (_this.options.initscrollToActiveItem) {
        _this.scrollToActiveItem();
      }

      return _this;
    }
    /**
     * Scroll to the active item.
     */


    _createClass(NavScroll, [{
      key: "scrollToActiveItem",
      value: function scrollToActiveItem() {
        var $nav = $('.' + this.options.classNav, this.$element),
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

    }, {
      key: "destroy",
      value: function destroy() {
        this.$element.off('scrolling.fxp.scroller.fxp.navscroll', scrolling).off('shown.bs.dropdown.fxp.navscroll', onShownDropdown).off('hide.bs.dropdown.fxp.navscroll', onHideDropdown).off('mousedown.fxp.navscroll touchstart.fxp.navscroll', '> .nav-scrollable-prev', onPrevious).off('mousedown.fxp.navscroll touchstart.fxp.navscroll', '> .nav-scrollable-next', onNext).off('mouseup.fxp.navscroll mouseout.fxp.navscroll touchend.fxp.navscroll touchcancel.fxp.navscroll', '> .nav-scrollable-menu', onEndScroll).removeClass('is-nav-tabs').removeClass('is-nav-pills').removeClass('nav-scrollable-has-previous').removeClass('nav-scrollable-has-next').scroller('destroy');
        $(window).off('resize.fxp.navscroll' + this.guid, scrolling);
        this.$menuPrevious.remove();
        this.$menuNext.remove();

        _get(_getPrototypeOf(NavScroll.prototype), "destroy", this).call(this);
      }
    }]);

    return NavScroll;
  }(BasePlugin);
  NavScroll.defaultOptions = {
    classNav: 'nav',
    scrollbar: false,
    scrollbarInverse: false,
    initscrollToActiveItem: true,
    previousIcon: '<span class="glyphicon glyphicon-chevron-left"></span>',
    nextIcon: '<span class="glyphicon glyphicon-chevron-right"></span>'
  };
  pluginify('navScroll', 'fxp.navscroll', NavScroll, true, '[data-nav-scroll="true"]');

  exports.default = NavScroll;

  return exports;

}({}, jQuery));
