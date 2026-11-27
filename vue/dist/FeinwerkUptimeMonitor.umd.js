(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("CoreHome"), require("vue"));
	else if(typeof define === 'function' && define.amd)
		define(["CoreHome", ], factory);
	else if(typeof exports === 'object')
		exports["FeinwerkUptimeMonitor"] = factory(require("CoreHome"), require("vue"));
	else
		root["FeinwerkUptimeMonitor"] = factory(root["CoreHome"], root["Vue"]);
})((typeof self !== 'undefined' ? self : this), function(__WEBPACK_EXTERNAL_MODULE__19dc__, __WEBPACK_EXTERNAL_MODULE__8bbf__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "plugins/FeinwerkUptimeMonitor/vue/dist/";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "fae3");
/******/ })
/************************************************************************/
/******/ ({

/***/ "19dc":
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE__19dc__;

/***/ }),

/***/ "8bbf":
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE__8bbf__;

/***/ }),

/***/ "fae3":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, "UptimePage", function() { return /* reexport */ UptimePage; });
__webpack_require__.d(__webpack_exports__, "AdminPage", function() { return /* reexport */ AdminPage; });

// CONCATENATED MODULE: ./node_modules/@vue/cli-service/lib/commands/build/setPublicPath.js
// This file is imported into lib/wc client bundles.

if (typeof window !== 'undefined') {
  var currentScript = window.document.currentScript
  if (false) { var getCurrentScript; }

  var src = currentScript && currentScript.src.match(/(.+\/)[^/]+\.js(\?.*)?$/)
  if (src) {
    __webpack_require__.p = src[1] // eslint-disable-line
  }
}

// Indicate to webpack that this file can be concatenated
/* harmony default export */ var setPublicPath = (null);

// EXTERNAL MODULE: external {"commonjs":"vue","commonjs2":"vue","root":"Vue"}
var external_commonjs_vue_commonjs2_vue_root_Vue_ = __webpack_require__("8bbf");

// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-babel/node_modules/cache-loader/dist/cjs.js??ref--13-0!./node_modules/@vue/cli-plugin-babel/node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist/templateLoader.js??ref--6!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--1-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--1-1!./plugins/FeinwerkUptimeMonitor/vue/src/UptimePage.vue?vue&type=template&id=31f5be2d

const _hoisted_1 = ["lang"];
const _hoisted_2 = {
  key: 0,
  class: "fwum-loading",
  "aria-busy": "true"
};
const _hoisted_3 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
  class: "loadingPiwik"
}, [/*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("img", {
  src: "plugins/Morpheus/images/loading-blue.gif",
  alt: ""
})], -1);
const _hoisted_4 = [_hoisted_3];
const _hoisted_5 = {
  key: 1,
  class: "fwum-error",
  role: "alert"
};
const _hoisted_6 = {
  key: 0,
  class: "fwum-empty"
};
const _hoisted_7 = {
  class: "fwum-actions"
};
const _hoisted_8 = ["disabled"];
const _hoisted_9 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
  class: "icon-edit",
  "aria-hidden": "true"
}, null, -1);
const _hoisted_10 = {
  key: 0,
  class: "fwum-note",
  role: "status"
};
const _hoisted_11 = {
  class: "fwum-answer"
};
const _hoisted_12 = {
  class: "fwum-answer__text"
};
const _hoisted_13 = {
  key: 0,
  class: "fwum-muted"
};
const _hoisted_14 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
  class: "fwum-dot",
  "aria-hidden": "true"
}, null, -1);
const _hoisted_15 = {
  class: "fwum-state"
};
const _hoisted_16 = ["href"];
const _hoisted_17 = {
  key: 2,
  class: "fwum-answer__detail"
};
const _hoisted_18 = {
  key: 3,
  class: "fwum-fresh"
};
const _hoisted_19 = {
  key: 0,
  class: "fwum-muted"
};
const _hoisted_20 = {
  key: 1,
  class: "fwum-tools"
};
const _hoisted_21 = ["aria-disabled", "title", "aria-label"];
const _hoisted_22 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
  class: "icon-reload",
  "aria-hidden": "true"
}, null, -1);
const _hoisted_23 = [_hoisted_22];
const _hoisted_24 = ["title", "aria-label"];
const _hoisted_25 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
  class: "icon-edit",
  "aria-hidden": "true"
}, null, -1);
const _hoisted_26 = [_hoisted_25];
const _hoisted_27 = {
  key: 4,
  class: "fwum-muted"
};
const _hoisted_28 = {
  class: "fwum-sr",
  role: "status"
};
const _hoisted_29 = {
  key: 0,
  class: "fwum-note",
  role: "status"
};
const _hoisted_30 = {
  key: 1,
  class: "fwum-figures"
};
const _hoisted_31 = ["title"];
const _hoisted_32 = {
  key: 1,
  class: "fwum-figures__sub fwum-figures__side"
};
const _hoisted_33 = {
  key: 3,
  class: "fwum-figures__spark"
};
const _hoisted_34 = {
  key: 2,
  class: "fwum-note"
};
const _hoisted_35 = {
  class: "fwum-strips__name",
  "aria-hidden": "true"
};
const _hoisted_36 = {
  key: 1,
  class: "fwum-strips__vantage"
};
const _hoisted_37 = ["title"];
const _hoisted_38 = {
  class: "fwum-sr"
};
const _hoisted_39 = {
  key: 0,
  class: "fwum-strips__figure"
};
const _hoisted_40 = {
  key: 1,
  class: "fwum-strips__figure"
};
const _hoisted_41 = {
  key: 0,
  class: "fwum-strips__name",
  "aria-hidden": "true"
};
const _hoisted_42 = {
  key: 1,
  class: "fwum-strips__vantage"
};
const _hoisted_43 = ["title"];
const _hoisted_44 = {
  class: "fwum-sr"
};
const _hoisted_45 = {
  key: 0,
  class: "fwum-strips__figure"
};
const _hoisted_46 = {
  key: 1,
  class: "fwum-strips__figure"
};
const _hoisted_47 = {
  key: 0,
  class: "fwum-legend"
};
const _hoisted_48 = {
  class: "is-up"
};
const _hoisted_49 = {
  class: "is-partial"
};
const _hoisted_50 = {
  class: "is-down"
};
const _hoisted_51 = {
  class: "is-none"
};
const _hoisted_52 = {
  key: 4,
  class: "fwum-table-wrap"
};
const _hoisted_53 = {
  key: 0,
  class: "fwum-narrow-list"
};
const _hoisted_54 = {
  class: "fwum-group-head"
};
const _hoisted_55 = {
  class: "fwum-group-head__name",
  role: "heading",
  "aria-level": "3"
};
const _hoisted_56 = {
  key: 0,
  class: "fwum-muted fwum-group-note"
};
const _hoisted_57 = {
  key: 1,
  class: "fwum-muted"
};
const _hoisted_58 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
  class: "icon-edit",
  "aria-hidden": "true"
}, null, -1);
const _hoisted_59 = ["href"];
const _hoisted_60 = {
  scope: "col",
  class: "label"
};
const _hoisted_61 = {
  key: 0,
  scope: "col"
};
const _hoisted_62 = {
  key: 1,
  scope: "col"
};
const _hoisted_63 = {
  key: 2,
  scope: "col"
};
const _hoisted_64 = {
  class: "fwum-group-row"
};
const _hoisted_65 = ["colspan"];
const _hoisted_66 = {
  key: 0,
  class: "fwum-group-row__note"
};
const _hoisted_67 = {
  key: 0,
  class: "fwum-group-empty"
};
const _hoisted_68 = ["colspan"];
const _hoisted_69 = {
  class: "fwum-muted"
};
const _hoisted_70 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
  class: "icon-edit",
  "aria-hidden": "true"
}, null, -1);
const _hoisted_71 = ["href"];
const _hoisted_72 = ["title"];
const _hoisted_73 = {
  class: "fwum-cell-label"
};
const _hoisted_74 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
  class: "fwum-dot",
  "aria-hidden": "true"
}, null, -1);
const _hoisted_75 = {
  class: "fwum-targets__label"
};
const _hoisted_76 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("wbr", null, null, -1);
const _hoisted_77 = ["title"];
const _hoisted_78 = {
  key: 1,
  class: "column"
};
const _hoisted_79 = {
  key: 0,
  class: "column fwum-targets__text"
};
const _hoisted_80 = {
  key: 1,
  class: "column"
};
const _hoisted_81 = ["title"];
const _hoisted_82 = {
  key: 0,
  class: "fwum-sr"
};
const _hoisted_83 = {
  key: 1,
  class: "column"
};
const _hoisted_84 = {
  class: "label fwum-subrow__side"
};
const _hoisted_85 = {
  class: "fwum-sr"
};
const _hoisted_86 = ["title"];
const _hoisted_87 = {
  key: 1,
  class: "column"
};
const _hoisted_88 = {
  key: 2,
  class: "column"
};
const _hoisted_89 = {
  key: 0,
  class: "fwum-muted"
};
const _hoisted_90 = {
  key: 6,
  class: "fwum-note fwum-outside-note"
};
const _hoisted_91 = ["href"];
const _hoisted_92 = {
  key: 7,
  class: "fwum-nc"
};
const _hoisted_93 = {
  class: "fwum-note"
};
const _hoisted_94 = ["aria-expanded", "aria-controls"];
const _hoisted_95 = ["href"];
const _hoisted_96 = ["id"];
const _hoisted_97 = {
  key: 8,
  class: "fwum-internet-note"
};
const _hoisted_98 = {
  class: "fwum-note"
};
const _hoisted_99 = {
  class: "fwum-note fwum-muted"
};
const _hoisted_100 = {
  key: 9,
  class: "fwum-internet-note fwum-php-note"
};
const _hoisted_101 = {
  class: "fwum-note"
};
const _hoisted_102 = {
  key: 0,
  class: "fwum-note fwum-muted"
};
const _hoisted_103 = {
  key: 10,
  class: "fwum-note fwum-container-note"
};
const _hoisted_104 = ["href"];
const _hoisted_105 = {
  key: 11,
  class: "fwum-open-page"
};
const _hoisted_106 = ["href"];
function render(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_Sparkline = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("Sparkline");
  const _component_HourStrip = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("HourStrip");
  const _component_TargetList = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("TargetList");
  const _component_CopyChip = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("CopyChip");
  const _component_OutageList = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("OutageList");
  const _component_FeedbackBar = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("FeedbackBar");
  const _component_PromoLine = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("PromoLine");
  const _component_TargetPanel = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("TargetPanel");
  const _component_PromoCard = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("PromoCard");
  return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", {
    class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(["fwum-page", [`fwum-page--${_ctx.config.variant}`, {
      'fwum-page--in-widget': _ctx.config.inWidget,
      'is-narrow': _ctx.narrow,
      'is-past': !!_ctx.past
    }]]),
    lang: _ctx.config.language || undefined
  }, [_ctx.loading && !_ctx.loaded ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", _hoisted_2, _hoisted_4)) : _ctx.failed ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", _hoisted_5, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("p", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiLoadFailed')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("button", {
    type: "button",
    class: "btn-flat",
    onClick: _cache[0] || (_cache[0] = (...args) => _ctx.load && _ctx.load(...args))
  }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiRetry')), 1)])) : (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], {
    key: 2
  }, [_ctx.nothingChecked ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", _hoisted_6, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("p", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiFirstCheck')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", _hoisted_7, [_ctx.canCheck ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("button", {
    key: 0,
    type: "button",
    class: "btn",
    disabled: _ctx.checking,
    onClick: _cache[1] || (_cache[1] = (...args) => _ctx.checkNow && _ctx.checkNow(...args))
  }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate(_ctx.checking ? 'FeinwerkUptimeMonitor_UiChecking' : 'FeinwerkUptimeMonitor_UiCheckNow')), 9, _hoisted_8)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.isPage && _ctx.config.isAdmin ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("button", {
    key: 1,
    type: "button",
    class: "btn-flat fwum-icon-button",
    onClick: _cache[2] || (_cache[2] = $event => _ctx.panelOpen = true)
  }, [_hoisted_9, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(" " + Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiEditTargets')), 1)])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)]), _ctx.checkNote ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("p", _hoisted_10, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.checkNote), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)])) : (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], {
    key: 1
  }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", _hoisted_11, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", _hoisted_12, [(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderList"])(_ctx.lines, (line, i) => {
    return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("p", {
      key: line.key,
      class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])([line.now ? 'fwum-answer__now' : 'fwum-answer__line', `is-${line.outcome}`])
    }, [line.now ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", _hoisted_13, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(line.text), 1)) : (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], {
      key: 1
    }, [_hoisted_14, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("strong", _hoisted_15, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(line.text), 1), line.link ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], {
      key: 0
    }, [line.link.href ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("a", {
      key: 0,
      href: line.link.href
    }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(line.link.text), 9, _hoisted_16)) : (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], {
      key: 1
    }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(line.link.text), 1)], 64)), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(line.link.after), 1)], 64)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)])], 64)), line.detail ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", _hoisted_17, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(line.detail), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), i === _ctx.freshnessLine && (_ctx.freshness || _ctx.showTools) ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", _hoisted_18, [_ctx.freshness || _ctx.checking ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", _hoisted_19, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.checking ? _ctx.checkLabel : _ctx.freshness), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.showTools ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", _hoisted_20, [_ctx.canCheck && (_ctx.siteRows.length || !_ctx.siteTargetCount || _ctx.containers.some(t => t.enabled)) ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("button", {
      key: 0,
      type: "button",
      class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(["fwum-tool", {
        'is-busy': _ctx.checking
      }]),
      "aria-disabled": _ctx.checking ? 'true' : undefined,
      title: _ctx.checkLabel,
      "aria-label": _ctx.translate('FeinwerkUptimeMonitor_UiCheckNow'),
      onClick: _cache[3] || (_cache[3] = (...args) => _ctx.checkNow && _ctx.checkNow(...args))
    }, _hoisted_23, 10, _hoisted_21)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("button", {
      type: "button",
      class: "fwum-tool",
      title: _ctx.translate('FeinwerkUptimeMonitor_UiEditTargets'),
      "aria-label": _ctx.translate('FeinwerkUptimeMonitor_UiEditTargets'),
      onClick: _cache[4] || (_cache[4] = $event => _ctx.panelOpen = true)
    }, _hoisted_26, 8, _hoisted_24)])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), line.after ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", _hoisted_27, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(line.after), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)], 2);
  }), 128)), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", _hoisted_28, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.announce), 1)])]), _ctx.checkNote ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("p", _hoisted_29, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.checkNote), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.figures.length ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("dl", _hoisted_30, [(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderList"])(_ctx.figures, figure => {
    return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", {
      key: figure.key
    }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("dt", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(figure.label), 1), figure.value ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("dd", {
      key: 0,
      class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(figure.level ? `is-${figure.level}` : undefined),
      title: figure.measured !== null ? figure.sub : undefined
    }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(figure.value), 11, _hoisted_31)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), figure.side ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("dd", _hoisted_32, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(figure.side), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), figure.sub ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("dd", {
      key: 2,
      class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(figure.measured !== null && !_ctx.measuredVisible(figure.measured) ? 'fwum-sr' : 'fwum-figures__sub')
    }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(figure.sub), 3)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), figure.key === 'tracker' && _ctx.sparkValues.length > 1 ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("dd", _hoisted_33, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createVNode"])(_component_Sparkline, {
      values: _ctx.sparkValues,
      label: _ctx.sparkLabel,
      width: _ctx.isPage ? 160 : 120,
      height: _ctx.isPage ? 28 : 14
    }, null, 8, ["values", "label", "width", "height"])])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)]);
  }), 128))])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.config.queuedTracking && _ctx.trackerTime ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("p", _hoisted_34, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiQueuedTracking')), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.strips.length && !_ctx.unmeasured ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", {
    key: 3,
    class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(["fwum-strips", {
      'fwum-strips--page': _ctx.isPage
    }])
  }, [(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderList"])(_ctx.stripBlocks, block => {
    return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], {
      key: block.key
    }, [_ctx.narrow && block.strips.length > 1 ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", {
      key: 0,
      class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(["fwum-strips__pair", {
        'fwum-strips__pair--next': block.strips[0].next
      }])
    }, [(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderList"])(block.strips, strip => {
      return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", {
        key: strip.key,
        class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(["fwum-strips__head", {
          'fwum-strips__head--lane': strip.lane
        }])
      }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", _hoisted_35, [strip.first ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], {
        key: 0
      }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(strip.name), 1)], 64)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), strip.vantage ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", _hoisted_36, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(strip.vantage), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)]), strip.uptime ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", {
        key: 0,
        class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(["fwum-strips__uptime", {
          'fwum-strips__uptime--lane': strip.lane,
          'fwum-strips__uptime--muted': strip.uptime.muted
        }]),
        title: strip.uptime.sub
      }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", _hoisted_38, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiUptime')) + " " + Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(strip.label) + ":", 1), strip.uptime.muted ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", _hoisted_39, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(strip.uptime.value), 1)) : (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("strong", _hoisted_40, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(strip.uptime.value), 1)), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
        class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(_ctx.measuredVisible(strip.uptime.measured) ? 'fwum-strips__measured' : 'fwum-sr')
      }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(strip.uptime.sub), 3)], 10, _hoisted_37)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)], 2);
    }), 128)), (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderList"])(block.strips, strip => {
      return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createBlock"])(_component_HourStrip, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["mergeProps"])({
        key: `${strip.key}-cells`
      }, _ctx.stripProps(strip)), null, 16);
    }), 128))], 2)) : (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], {
      key: 1
    }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderList"])(block.strips, strip => {
      return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", {
        key: strip.key,
        class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(["fwum-strips__row", {
          'fwum-strips__row--page': _ctx.isPage,
          'fwum-strips__row--lane': strip.lane,
          'fwum-strips__row--next': strip.next
        }])
      }, [_ctx.isPage ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", _hoisted_41, [strip.first ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], {
        key: 0
      }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(strip.name), 1)], 64)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), strip.vantage ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", _hoisted_42, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(strip.vantage), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createVNode"])(_component_HourStrip, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeProps"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["guardReactiveProps"])(_ctx.stripProps(strip))), null, 16), strip.uptime ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", {
        key: 1,
        class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(["fwum-strips__uptime", {
          'fwum-strips__uptime--lane': strip.lane,
          'fwum-strips__uptime--muted': strip.uptime.muted
        }]),
        title: strip.uptime.sub
      }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", _hoisted_44, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiUptime')) + " " + Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(strip.label) + ":", 1), strip.uptime.muted ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", _hoisted_45, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(strip.uptime.value), 1)) : (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("strong", _hoisted_46, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(strip.uptime.value), 1)), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
        class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(_ctx.measuredVisible(strip.uptime.measured) ? 'fwum-strips__measured' : 'fwum-sr')
      }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(strip.uptime.sub), 3)], 10, _hoisted_43)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)], 2);
    }), 128))], 64);
  }), 128)), _ctx.isPage ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("ul", _hoisted_47, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("li", _hoisted_48, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiReachable')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("li", _hoisted_49, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiPartlyReachable')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("li", _hoisted_50, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiNotReachable')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("li", _hoisted_51, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiNotMeasured')), 1)])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)], 2)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.isPage && !_ctx.unmeasured ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", _hoisted_52, [_ctx.narrow ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", _hoisted_53, [(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderList"])(_ctx.groups, group => {
    return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], {
      key: group.key
    }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", _hoisted_54, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", _hoisted_55, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(group.name), 1), group.cert ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", {
      key: 0,
      class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(["fwum-group-head__cert", `is-${group.cert.level}`])
    }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiCertificateValue', group.cert.text)), 3)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)]), _ctx.showOutside && !group.outside && group.rows.length ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", _hoisted_56, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiNotCheckedFromOutside')), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), !group.rows.length ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("p", _hoisted_57, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(group.note) + " ", 1), group.key === 'site' && _ctx.config.isAdmin ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("button", {
      key: 0,
      type: "button",
      class: "btn-flat fwum-icon-button",
      onClick: _cache[5] || (_cache[5] = $event => _ctx.panelOpen = true)
    }, [_hoisted_58, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(" " + Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiEditTargets')), 1)])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), group.key === 'matomo' && _ctx.config.isSuperUser && !_ctx.config.embedded ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("a", {
      key: 1,
      class: "fwum-inline-link",
      href: _ctx.adminUrl
    }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiEditTargets')), 9, _hoisted_59)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)])) : (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createBlock"])(_component_TargetList, {
      key: 2,
      rows: group.rows,
      "show-cert": !group.cert,
      past: !!_ctx.past,
      outside: group.outside,
      measured: _ctx.hasUptime
    }, null, 8, ["rows", "show-cert", "past", "outside", "measured"]))], 64);
  }), 128))])) : (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("table", {
    key: 1,
    class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(["dataTable fwum-table", {
      'fwum-table--outside': _ctx.showOutside
    }])
  }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("thead", null, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("tr", null, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("th", _hoisted_60, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiAddress')), 1), !_ctx.past ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("th", _hoisted_61, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiResponse')), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.hasUptime ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("th", _hoisted_62, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiUptime')), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.hasCerts ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("th", _hoisted_63, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiCertificate')), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)])]), (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderList"])(_ctx.groups, group => {
    return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("tbody", {
      key: group.key
    }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("tr", _hoisted_64, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("th", {
      colspan: _ctx.columnCount,
      scope: "rowgroup"
    }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(group.name) + " ", 1), _ctx.showOutside && !group.outside && group.rows.length ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", _hoisted_66, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiNotCheckedFromOutside')), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)], 8, _hoisted_65)]), !group.rows.length ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("tr", _hoisted_67, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("td", {
      colspan: _ctx.columnCount,
      class: "label"
    }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", _hoisted_69, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(group.note), 1), group.key === 'site' && _ctx.config.isAdmin ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("button", {
      key: 0,
      type: "button",
      class: "btn-flat fwum-icon-button",
      onClick: _cache[6] || (_cache[6] = $event => _ctx.panelOpen = true)
    }, [_hoisted_70, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(" " + Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiEditTargets')), 1)])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), group.key === 'matomo' && _ctx.config.isSuperUser && !_ctx.config.embedded ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("a", {
      key: 1,
      class: "fwum-inline-link",
      href: _ctx.adminUrl
    }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiEditTargets')), 9, _hoisted_71)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)], 8, _hoisted_68)])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderList"])(group.rows, row => {
      return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], {
        key: row.key
      }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("tr", {
        class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])([`is-${_ctx.past ? row.dayOutcome : row.tone}`, {
          'fwum-row--split': !!_ctx.splitOf(row)
        }])
      }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("td", {
        class: "label",
        title: row.title
      }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", _hoisted_73, [_hoisted_74, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", _hoisted_75, [(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderList"])(_ctx.breakParts(row.label), (part, p) => {
        return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], {
          key: p
        }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(part), 1), _hoisted_76], 64);
      }), 128))])])], 8, _hoisted_72), !_ctx.showOutside ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], {
        key: 0
      }, [!_ctx.past ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("td", {
        key: 0,
        class: "column fwum-targets__text",
        title: row.textTitle || undefined
      }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.keepHyphens(row.text)), 9, _hoisted_77)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.hasUptime ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("td", _hoisted_78, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.uptimeOrNone(row.uptime)), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)], 64)) : _ctx.splitOf(row) ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], {
        key: 1
      }, [!_ctx.past ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("td", _hoisted_79)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.hasUptime ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("td", _hoisted_80)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)], 64)) : (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], {
        key: 2
      }, [!_ctx.past ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("td", {
        key: 0,
        class: "column fwum-targets__text",
        title: _ctx.responseTitle(row)
      }, [(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderList"])(_ctx.responseLinesOf(row), (line, l) => {
        return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", {
          key: l,
          class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(["fwum-line", [line.tone ? `is-${line.tone}` : '', {
            'fwum-line--other': line.other
          }]])
        }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.keepHyphens(line.text)), 3);
      }), 128)), _ctx.asideOf(row) ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", _hoisted_82, ", " + Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.asideOf(row)), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)], 8, _hoisted_81)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.hasUptime ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("td", _hoisted_83, [(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderList"])(_ctx.uptimeLinesOf(row), (line, l) => {
        return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", {
          key: l,
          class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(["fwum-line", {
            'fwum-line--other': line.other
          }])
        }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(line.text), 3);
      }), 128))])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)], 64)), _ctx.hasCerts ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("td", {
        key: 3,
        class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(["column fwum-targets__cert", `is-${row.certLevel}`])
      }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(row.cert), 3)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)], 2), (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderList"])(_ctx.splitOf(row) || [], (side, n) => {
        return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("tr", {
          key: `${row.key}-${side.key}`,
          class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(["fwum-subrow", {
            'fwum-subrow--last': n === (_ctx.splitOf(row) || []).length - 1
          }])
        }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("td", _hoisted_84, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", _hoisted_85, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(row.label) + Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(side.tooLarge ? '' : ', '), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(side.tooLarge ? '' : _ctx.sideName(side)), 1)]), !_ctx.past ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("td", {
          key: 0,
          class: "column fwum-targets__text",
          title: _ctx.responseTitle(row)
        }, [_ctx.hasWords(side) ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", {
          key: 0,
          class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(["fwum-line", _ctx.failureTone(side, row)])
        }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.keepHyphens(_ctx.sideWords(side))), 3)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)], 8, _hoisted_86)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.hasUptime ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("td", _hoisted_87, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.subUptime(side)), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.hasCerts ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("td", _hoisted_88)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)], 2);
      }), 128))], 64);
    }), 128))]);
  }), 128))], 2))])) : !_ctx.isPage && _ctx.widgetGroup ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], {
    key: 5
  }, [!_ctx.widgetGroup.rows.length ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("p", _hoisted_89, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.widgetGroup.note), 1)) : (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createBlock"])(_component_TargetList, {
    key: 1,
    rows: _ctx.widgetRows,
    "show-cert": !_ctx.widgetGroup.cert,
    outside: _ctx.widgetGroup.outside,
    "by-uptime": !_ctx.todaySelected,
    widget: ""
  }, null, 8, ["rows", "show-cert", "outside", "by-uptime"]))], 64)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.outsidePaused ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("p", _hoisted_90, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiOutsidePaused')) + " ", 1), _ctx.config.external && _ctx.config.external.settingsUrl ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("a", {
    key: 0,
    href: _ctx.config.external.settingsUrl
  }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiOutsideSettings')), 9, _hoisted_91)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.notCheckableCount && !_ctx.past ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", _hoisted_92, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("p", _hoisted_93, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.notCheckableText) + " ", 1), _ctx.whyAvailable ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("button", {
    key: 0,
    type: "button",
    class: "fwum-link-button",
    "aria-expanded": _ctx.whyOpen ? 'true' : 'false',
    "aria-controls": `${_ctx.uid}-why`,
    onClick: _cache[7] || (_cache[7] = $event => _ctx.whyOpen = !_ctx.whyOpen)
  }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiWhy')), 9, _hoisted_94)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.notCheckableExplained && _ctx.config.isSuperUser && !_ctx.config.embedded && !_ctx.config.allowPrivate ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("a", {
    key: 1,
    href: _ctx.settingsUrl
  }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiAllowPrivate')), 9, _hoisted_95)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)]), _ctx.whyAvailable ? Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withDirectives"])((Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("p", {
    key: 0,
    id: `${_ctx.uid}-why`,
    class: "fwum-note fwum-nc__why"
  }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.whyText), 9, _hoisted_96)), [[external_commonjs_vue_commonjs2_vue_root_Vue_["vShow"], _ctx.whyOpen]]) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.config.internetOff && !_ctx.past ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", _hoisted_97, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("p", _hoisted_98, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate(_ctx.serverConfigShown ? 'FeinwerkUptimeMonitor_UiInternetOff' : 'FeinwerkUptimeMonitor_UiInternetOffNeutral')), 1), _ctx.serverHintsShown ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], {
    key: 0
  }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("p", _hoisted_99, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiAdminInternetOffHint')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createVNode"])(_component_CopyChip, {
    class: "fwum-chip",
    line: _ctx.internetLine
  }, null, 8, ["line"])], 64)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.phpDisabledShown.length && !_ctx.past ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", _hoisted_100, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("p", _hoisted_101, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiAdminPhpDisabled', _ctx.phpDisabledShown.join(', '))), 1), _ctx.serverHintsShown ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("p", _hoisted_102, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate(_ctx.curlMissing ? 'FeinwerkUptimeMonitor_UiAdminCurlMissingHint' : 'FeinwerkUptimeMonitor_UiAdminPhpDisabledHint')), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.containerNote ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("p", _hoisted_103, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.containerNote) + " ", 1), !_ctx.config.embedded && !_ctx.widgetDown ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("a", {
    key: 0,
    href: _ctx.uptimePageUrl
  }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiOpenPage')), 9, _hoisted_104)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), !_ctx.isPage && _ctx.widgetDown && !_ctx.config.embedded ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("p", _hoisted_105, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("a", {
    href: _ctx.uptimePageUrl
  }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiOpenPage')), 9, _hoisted_106)])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.isPage && !(_ctx.unmeasured && !_ctx.outageList.length) ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createBlock"])(_component_OutageList, {
    key: 12,
    outside: _ctx.showOutside,
    outages: _ctx.shownOutages,
    names: _ctx.names,
    past: !!_ctx.past,
    language: _ctx.config.language,
    timezone: _ctx.config.timezone || '',
    total: _ctx.outageList.length,
    "total-is-minimum": _ctx.incidentsMore,
    "can-show-more": _ctx.canShowMore,
    "loading-more": _ctx.loadingMore,
    narrow: _ctx.narrow,
    "not-measured": !_ctx.measuredShares.length,
    onMore: _ctx.showMoreOutages
  }, null, 8, ["outside", "outages", "names", "past", "language", "timezone", "total", "total-is-minimum", "can-show-more", "loading-more", "narrow", "not-measured", "onMore"])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)], 64)), _ctx.config.feedback ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createBlock"])(_component_FeedbackBar, {
    key: 2,
    "id-site": _ctx.config.idSite,
    topic: "page",
    question: _ctx.translate('FeinwerkUptimeMonitor_FeedbackQuestion_page'),
    feedback: _ctx.config.feedback
  }, null, 8, ["id-site", "question", "feedback"])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createVNode"])(_component_PromoLine, {
    promo: _ctx.config.promo,
    "dismiss-label": _ctx.translate('FeinwerkUptimeMonitor_PromoDismiss')
  }, null, 8, ["promo", "dismiss-label"]), _ctx.panelOpen ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createBlock"])(_component_TargetPanel, {
    key: 3,
    "id-site": _ctx.config.idSite,
    "site-name": _ctx.config.siteName || '',
    notice: _ctx.panelNotice,
    onClose: _ctx.onPanelClose
  }, null, 8, ["id-site", "site-name", "notice", "onClose"])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)], 64)), _ctx.cardHere && _ctx.config.promoCard ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createBlock"])(_component_PromoCard, {
    key: 3,
    card: _ctx.config.promoCard,
    "dismiss-label": _ctx.translate('FeinwerkUptimeMonitor_PromoDismiss')
  }, null, 8, ["card", "dismiss-label"])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)], 10, _hoisted_1);
}
// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/UptimePage.vue?vue&type=template&id=31f5be2d

// EXTERNAL MODULE: external "CoreHome"
var external_CoreHome_ = __webpack_require__("19dc");

// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/api.ts
/*!
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

const MODULE = 'FeinwerkUptimeMonitor';
/** the API's limit of getIncidents: recentIncidents asks for all it gives */
const RECENT_LIMIT = 1000;
function get(method, params) {
  return external_CoreHome_["AjaxHelper"].fetch(Object.assign({
    method: `${MODULE}.${method}`
  }, params));
}
/** Changes report their error in place (panel, Check now): no second toast by Matomo. */
function post(method, params) {
  return external_CoreHome_["AjaxHelper"].fetch({
    method: `${MODULE}.${method}`
  }, {
    postParams: params,
    createErrorNotification: false
  });
}
const api = {
  status(idSite) {
    return get('getStatus', {
      idSite
    });
  },
  /** timezoneOf: for idSite 0 next to a website, the website whose day the period follows */
  uptime(idSite, period, timezoneOf = 0) {
    return get('getUptime', Object.assign(Object.assign({
      idSite
    }, period), {}, {
      timezoneOf
    }));
  },
  responseTimes(idSite, period, targetKey, timezoneOf = 0) {
    return get('getResponseTimes', Object.assign(Object.assign({
      idSite
    }, period), {}, {
      targetKey,
      timezoneOf
    }));
  },
  /**
   * limit: 1 to 1000 per request; the page asks for more with "Show more". source: local (checked
   * from the Matomo server) or all (also from outside, while another plugin delivers such results)
   */
  incidents(idSite, period, timezoneOf = 0, limit = 100, source = 'local') {
    return get('getIncidents', Object.assign(Object.assign({
      idSite
    }, period), {}, {
      limit,
      timezoneOf,
      source
    }));
  },
  /** the outages still open now ("since when" in the answer line), whatever period is viewed */
  openIncidents(idSite, timezoneOf = 0, source = 'local') {
    return external_CoreHome_["AjaxHelper"].fetch({
      method: `${MODULE}.getIncidents`,
      idSite,
      period: 'day',
      date: 'today',
      state: 'open',
      limit: 100,
      timezoneOf,
      source
    }, {
      createErrorNotification: false
    });
  },
  /**
   * Review of the 5.3.0 fixes, SHOULD 1: the outages open now or ended since yesterday (the
   * website's days), from both sides, for the one-sided rule (sides.ts aloneDown): an outage the
   * other side closed after a failing check from before midnight still counts. Newest start first,
   * so a list cut at the limit may leave out an old open outage (the page then counts them as not
   * known).
   */
  recentIncidents(idSite, timezoneOf = 0) {
    return external_CoreHome_["AjaxHelper"].fetch({
      method: `${MODULE}.getIncidents`,
      idSite,
      period: 'range',
      date: 'last2',
      state: 'all',
      limit: RECENT_LIMIT,
      timezoneOf,
      source: 'all'
    }, {
      createErrorNotification: false
    });
  },
  /**
   * The hour strip: one cell per hour (a day) or per day, checked from the Matomo server (source
   * local) or from outside (external, while another plugin adds such results). group matomo:
   * Matomo's addresses and the website's containers; website: the website without its
   * containers. A failing strip leaves the page as it is: no toast.
   */
  timeline(idSite, period, group, source = 'local') {
    return external_CoreHome_["AjaxHelper"].fetch(Object.assign(Object.assign({
      method: `${MODULE}.getTimeline`,
      idSite
    }, period), {}, {
      source,
      group
    }), {
      createErrorNotification: false
    });
  },
  targets(idSite) {
    // the panel shows its own error and a Try again
    return external_CoreHome_["AjaxHelper"].fetch({
      method: `${MODULE}.getTargets`,
      idSite
    }, {
      createErrorNotification: false
    });
  },
  overview() {
    return get('getSitesOverview', {});
  },
  addTarget(idSite, kind, url) {
    return post('addTarget', {
      idSite,
      kind,
      url
    });
  },
  updateTarget(idSite, targetKey, url, enabled) {
    return post('updateTarget', {
      idSite,
      targetKey,
      url,
      enabled
    });
  },
  deleteTarget(idSite, targetKey) {
    return post('deleteTarget', {
      idSite,
      targetKey
    });
  },
  checkNow(idSite) {
    return post('checkNow', {
      idSite
    });
  }
};
// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/format.ts
/*!
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

/** Numbers, durations and times in the page language (admin pages leave piwik.language unset). */
function locale(language) {
  return language !== '' ? language : undefined;
}
/** "A, B and C" in the page language (Intl.ListFormat), else joined with commas */
function listOf(items, language) {
  const {
    ListFormat
  } = Intl;
  try {
    if (ListFormat) {
      return new ListFormat(locale(language), {
        style: 'long',
        type: 'conjunction'
      }).format(items);
    }
  } catch (e) {
    // an unknown language: the commas below
  }
  return items.join(', ');
}
/**
 * The pieces of "A, B and C" in the page language: each element with its index in items (to
 * make it a link), the words between with index -1; else commas
 */
function listParts(items, language) {
  const {
    ListFormat
  } = Intl;
  try {
    const formatter = ListFormat ? new ListFormat(locale(language), {
      style: 'long',
      type: 'conjunction'
    }) : null;
    if (formatter && typeof formatter.formatToParts === 'function') {
      let next = 0;
      return formatter.formatToParts(items).map(part => {
        if (part.type !== 'element') {
          return {
            index: -1,
            text: part.value
          };
        }
        next += 1;
        return {
          index: next - 1,
          text: part.value
        };
      });
    }
  } catch (e) {
    // an unknown language: the commas below
  }
  const out = [];
  items.forEach((item, index) => {
    if (index > 0) {
      out.push({
        index: -1,
        text: ', '
      });
    }
    out.push({
      index,
      text: item
    });
  });
  return out;
}
function percent(value, language, digits = 2) {
  if (value === null) {
    return '';
  }
  const shown = value >= 99.995 && value < 100 ? 99.99 : value;
  return new Intl.NumberFormat(locale(language), {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: shown === 100 || shown === 0 ? 0 : digits
  }).format(shown / 100);
}
/**
 * A measured share in whole percent; a little that would round to 0 reads "< 1 %", so that a
 * measured period never looks unmeasured.
 */
function sharePercent(value, language) {
  return value > 0 && value < 0.5 ? `< ${percent(1, language, 0)}` : percent(value, language, 0);
}
/**
 * A number stays with its unit (final review D4): a no-break space after a digit ("30 min",
 * "1 h 30 min" breaks only between the units, "4 MB")
 */
function keepUnits(text) {
  return text.replace(/(\d) (?=\S)/g, '$1\u00a0');
}
/**
 * A bracket stays whole: its spaces no-break ("(over 4 MB)", "(1 of 2)"; UI review of 5.3.0, L3
 * and follow-up W7)
 */
function keepBrackets(text) {
  return text.replace(/\([^)]*\)/g, part => part.replace(/ /g, '\u00a0'));
}
function milliseconds(value, language) {
  return value === null ? '' : `${new Intl.NumberFormat(locale(language)).format(value)}\u00a0ms`;
}
/**
 * A timezone for Intl: IANA names as they are; Matomo's fixed offsets ("UTC+2", "UTC-5.5") as
 * minutes, which Intl cannot read; anything unknown as the browser's zone.
 */
function zoneOf(timezone = '') {
  const fixed = /^UTC([+-])(\d+(?:\.\d+)?)$/.exec(timezone);
  if (fixed) {
    const minutes = Math.round(parseFloat(fixed[2]) * 60) * (fixed[1] === '-' ? -1 : 1);
    return {
      offsetMinutes: minutes,
      label: timezone
    };
  }
  if (timezone === '') {
    return {};
  }
  try {
    new Intl.DateTimeFormat('en', {
      timeZone: timezone
    }).format(0);
    return {
      name: timezone
    };
  } catch (e) {
    return {};
  }
}
/** A time in the page language and the website's timezone (a fixed offset: shifted UTC). */
function formatIn(iso, language, timezone, options, withLabel = false) {
  const zone = zoneOf(timezone);
  if (zone.offsetMinutes !== undefined) {
    const shifted = new Date(new Date(iso).getTime() + zone.offsetMinutes * 60000);
    const text = new Intl.DateTimeFormat(locale(language), Object.assign(Object.assign({}, options), {}, {
      timeZone: 'UTC'
    })).format(shifted);
    return withLabel ? `${text} ${zone.label}` : text;
  }
  const zoned = zone.name ? Object.assign(Object.assign({}, options), {}, {
    timeZone: zone.name
  }) : options;
  return new Intl.DateTimeFormat(locale(language), zoned).format(new Date(iso));
}
/** Date and time in the website's timezone (Peter's 6a, like Matomo's reports). */
function dateTime(iso, language, timezone = '') {
  return formatIn(iso, language, timezone, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }, true);
}
/**
 * The time of day ("14:00", "2:00 PM") in the website's timezone, for the hour strip and the
 * answer line: the same short form as the times of the outage table.
 */
function hourOf(iso, language, timezone = '') {
  return formatIn(iso, language, timezone, {
    timeStyle: 'short'
  });
}
/**
 * The zone's short name at a time ("GMT+2", "EDT", "MESZ" in the page language): tells the hour
 * that repeats on a fall-back day apart (review of the 5.4.0 fixes, NIT 3). A fixed offset, which
 * repeats no hour, by its label ("UTC+2"); '' when the browser names none.
 */
function zoneNameOf(iso, language, timezone = '') {
  const zone = zoneOf(timezone);
  if (zone.offsetMinutes !== undefined) {
    return zone.label || '';
  }
  const parts = new Intl.DateTimeFormat(locale(language), Object.assign({
    hour: 'numeric',
    timeZoneName: 'short'
  }, zone.name ? {
    timeZone: zone.name
  } : {})).formatToParts(new Date(iso));
  const name = parts.find(part => part.type === 'timeZoneName');
  return name ? name.value : '';
}
/** The day of a time ("Mar 14") in the website's timezone, for the strip of longer periods. */
function dayOf(iso, language, timezone = '') {
  return formatIn(iso, language, timezone, {
    month: 'short',
    day: 'numeric'
  });
}
/** the day of a moment in a timezone as YYYY-MM-DD */
function dayKey(iso, timezone = '') {
  return formatIn(iso, 'en-CA', timezone, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}
/**
 * A time of today ("10:42") or else date and time, in the website's timezone: the start of an
 * outage in the answer line.
 */
function clockOrDate(iso, language, timezone = '', now = Date.now()) {
  const day = time => formatIn(time, 'en', timezone, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return day(iso) === day(new Date(now).toISOString()) ? hourOf(iso, language, timezone) : dateTime(iso, language, timezone);
}
/** the calendar day "YYYY-MM-DD" moved by whole days (no clock change can shift it) */
function shiftDay(day, days) {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}
/**
 * A calendar day "YYYY-MM-DD" as "Nov 24" in the page language, with the year when it is not
 * thisYear; read as UTC, so a timezone west of UTC never shows the day before.
 */
function calendarDay(day, language, thisYear) {
  const [y, m, d] = day.split('-').map(Number);
  const options = {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC'
  };
  if (String(y) !== thisYear) {
    options.year = 'numeric';
  }
  return new Intl.DateTimeFormat(locale(language), options).format(new Date(Date.UTC(y, m - 1, d)));
}
/** "3 minutes ago" in the page language; now: the screen's clock, so that it re-renders. */
function ago(iso, language, now = Date.now()) {
  const seconds = Math.round((new Date(iso).getTime() - now) / 1000);
  const format = new Intl.RelativeTimeFormat(locale(language), {
    numeric: 'auto'
  });
  if (Math.abs(seconds) < 3600) {
    return format.format(Math.round(seconds / 60), 'minute');
  }
  if (Math.abs(seconds) < 172800) {
    return format.format(Math.round(seconds / 3600), 'hour');
  }
  return format.format(Math.round(seconds / 86400), 'day');
}
/**
 * "12 min", "1 h 30 min", "3 days" (final review D4: hours and minutes, no "1.5 h"), rounded to
 * whole minutes first, so that 59 min 50 s reads "1 h", never "60 min" or "1 h 60 min"
 */
function duration(seconds, language = '') {
  const number = n => new Intl.NumberFormat(locale(language)).format(n);
  const minutes = Math.max(1, Math.round(seconds / 60));
  if (minutes < 60) {
    return keepUnits(Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiMinutes', number(minutes)));
  }
  if (seconds < 172800) {
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return keepUnits(rest === 0 ? Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiHours', number(hours)) : Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiHoursMinutes', number(hours), number(rest)));
  }
  return keepUnits(Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiDays', number(Math.round(seconds / 86400))));
}
/**
 * An address in pieces that may wrap after ".", "/", "?", "&", "=", "-" or "_" (a <wbr> after
 * each): on a phone "www.outdoor-shop-demo.example" wraps between its parts, not inside a word
 */
function breakParts(text) {
  const parts = text.replace(/([./?&=_-])/g, '$1\u0001').split('\u0001').filter(p => p !== '');
  // "www." never stands alone on a line
  if (parts.length > 1 && parts[0].toLowerCase() === 'www.') {
    parts.splice(0, 2, parts[0] + parts[1]);
  }
  return parts;
}
/** "HTTP-Status 403" stays whole on a phone: non-breaking hyphens in a short state text */
function keepHyphens(text) {
  return text.replace(/-/g, '\u2011');
}
/**
 * The host (with a port other than the scheme's) and the path of an address as entered: an
 * international name in its own letters, as people type it (UI review of 5.4.0, B3), not in the
 * ASCII form the browser's URL gives; lower case, without user info, query and fragment.
 */
function addressParts(url) {
  const match = /^([a-z][a-z0-9+.-]*):\/\/([^/?#]*)([^?#]*)/i.exec(url.trim());
  if (!match) {
    return null;
  }
  const scheme = match[1].toLowerCase();
  let host = match[2].slice(match[2].lastIndexOf('@') + 1).toLowerCase();
  const port = /:(\d+)$/.exec(host);
  if (port && (scheme === 'https' && port[1] === '443' || scheme === 'http' && port[1] === '80')) {
    host = host.slice(0, -port[0].length);
  }
  return {
    host,
    path: match[3]
  };
}
function hostOf(url) {
  if (!url) {
    return '';
  }
  const parts = addressParts(url);
  return parts ? parts.host : url;
}
/** Host and path, so that two addresses on one host stay apart. */
function hostAndPath(url) {
  if (!url) {
    return '';
  }
  const parts = addressParts(url);
  if (!parts) {
    return url;
  }
  return parts.path === '' || parts.path === '/' ? parts.host : `${parts.host}${parts.path}`;
}
/**
 * An address's tooltip: the address as entered, and for an international name its ASCII form
 * (punycode), which the checks request and server logs show.
 */
function addressTitle(url, fallback) {
  if (!url) {
    return fallback;
  }
  let ascii = '';
  try {
    ascii = new URL(url).host;
  } catch (e) {
    return url;
  }
  return ascii !== '' && ascii !== hostOf(url) ? `${url} (${ascii})` : url;
}
function targetLabel(target) {
  if (target.kind === 'web') {
    return hostAndPath(target.url) || Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiKind_web');
  }
  if (target.kind === 'container') {
    return Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiKind_container', target.targetKey.replace('ctr:', ''));
  }
  return Object(external_CoreHome_["translate"])(`FeinwerkUptimeMonitor_UiKind_${target.kind}`);
}
function causeText(cause, detail) {
  if (!cause) {
    return '';
  }
  const text = Object(external_CoreHome_["translate"])(`FeinwerkUptimeMonitor_Cause_${cause}`);
  if (cause !== 'http_status' || !detail) {
    return text;
  }
  // "HTTP status 403" in one piece (no-break spaces and hyphens): it never wraps inside
  return `${text} ${detail.replace('HTTP ', '')}`.replace(/ /g, '\u00a0').replace(/-/g, '\u2011');
}
/**
 * The answer first: a reachable address wins over ones that cannot be checked from this server;
 * any outage is named, with how many of the addresses it hits.
 */
function statusOf(c) {
  if (c.total === 0 && c.off > 0) {
    return {
      outcome: 'off',
      text: Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiAllOff')
    };
  }
  if (c.down > 0 && c.up > 0) {
    return {
      outcome: 'partial',
      text: c.down === 1 ? Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiPartlyDownOne', String(c.total)) : Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiPartlyDownMany', String(c.down), String(c.total))
    };
  }
  if (c.down > 0) {
    return {
      outcome: 'down',
      text: Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiNotReachable')
    };
  }
  if (c.up > 0) {
    return {
      outcome: 'up',
      text: Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiReachable')
    };
  }
  if (c.stale > 0) {
    return {
      outcome: 'stale',
      text: Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiNoRecentCheckShort')
    };
  }
  if (c.notCheckable > 0) {
    return {
      outcome: 'not_checkable',
      text: Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiNotCheckable')
    };
  }
  return {
    outcome: 'none',
    text: Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiNotMeasuredYet')
  };
}
/**
 * statusOf naming the side of a one-sided failure (Peter, 2026-11-26, 3a): when every address
 * counted down fails only from the Matomo server while the outside reaches it, amber and "not
 * reachable from the Matomo server" (visitors still reach it; it stays down); when every one fails
 * only from outside, "... from outside" in statusOf's colour. Else, and without results from
 * outside (both counts 0), statusOf. side: FromServer or FromOutside when it names one (the
 * admin page's container line names the same side). Follow-up W2 (Peter, 2026-11-26): while
 * results from outside show (twoSided), "Not checkable from the Matomo server", the server's name
 * of the cells and status rows, instead of "from this server".
 *
 * @param fromServerOnly how many of the down ones only the Matomo server finds down (the latest
 *        result from outside reaches them, sides.ts aloneDown)
 * @param fromOutsideOnly how many of the down ones only the outside finds down
 * @param twoSided the screen shows results from outside
 */
function sidedStatusOf(c, fromServerOnly = 0, fromOutsideOnly = 0, twoSided = false) {
  const state = statusOf(c);
  if (twoSided && state.outcome === 'not_checkable') {
    return {
      outcome: state.outcome,
      text: Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiNotCheckableFromServer')
    };
  }
  if (c.down <= 0 || state.outcome !== 'down' && state.outcome !== 'partial') {
    return state;
  }
  let side = '';
  if (fromServerOnly >= c.down) {
    side = 'FromServer';
  } else if (fromOutsideOnly >= c.down) {
    side = 'FromOutside';
  } else {
    return state;
  }
  let text = Object(external_CoreHome_["translate"])(`FeinwerkUptimeMonitor_UiNotReachable${side}`);
  if (c.up > 0) {
    text = c.down === 1 ? Object(external_CoreHome_["translate"])(`FeinwerkUptimeMonitor_UiPartlyDownOne${side}`, String(c.total)) : Object(external_CoreHome_["translate"])(`FeinwerkUptimeMonitor_UiPartlyDownMany${side}`, String(c.down), String(c.total));
  }
  return {
    outcome: side === 'FromServer' ? 'partial' : state.outcome,
    text,
    side
  };
}
/** AjaxHelper's fixed English texts for a request that failed before the API answered. */
const TRANSPORT_ERRORS = ['Something went wrong', 'Request was possibly aborted'];
/** A failed request: the API's own (translated) message, or ours when the request failed. */
function errorText(e) {
  const message = e instanceof Error ? e.message : String(e || '');
  return message === '' || TRANSPORT_ERRORS.includes(message) ? Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiRequestFailed') : message;
}
// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/timeline.ts
/*!
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */
/**
 * The seconds of each strip cell up to now: up to the next cell's start (a day of 23 or 25 hours
 * on a clock change), the last one up to the API's end (review of the 5.4.0 fixes, SHOULD 1: the
 * Sunday that ends a week of a clock change), without it a whole hour or day; the running cell up
 * to now, a future cell none.
 *
 * @param end the end of the last cell (getTimeline end, ISO); '' when not known
 */
function elapsedSeconds(cells, grain, now, end = '') {
  const nominal = (grain === 'hour' ? 3600 : 86400) * 1000;
  const starts = cells.map(c => new Date(c.time).getTime());
  const last = end ? new Date(end).getTime() : NaN;
  return cells.map((cell, i) => {
    if (cell.state === 'future') {
      return 0;
    }
    let stop = starts[i] + nominal;
    if (i + 1 < starts.length) {
      stop = starts[i + 1];
    } else if (Number.isFinite(last) && last > starts[i]) {
      stop = last;
    }
    return Math.max(0, (Math.min(stop, now) - starts[i]) / 1000);
  });
}
/**
 * One strip from two (5.2.0 review B4: the widgets from both sides): each cell sums the measured
 * and reachable seconds of both, as getTimeline with source=all does, and is up only when both
 * found every address up for all their measured time, down when neither did, partial between, none
 * when neither measured it; a future cell stays future. The cells of both have the same times (the
 * same period and group); a cell only one of them has is taken as it is.
 */
function combineTimelines(a, b) {
  const other = {};
  b.cells.forEach(cell => {
    other[cell.time] = cell;
  });
  const cells = a.cells.map(cell => {
    const twin = other[cell.time];
    if (!twin || cell.state === 'future') {
      return cell;
    }
    const measured = cell.measuredSeconds + twin.measuredSeconds;
    const up = cell.upSeconds + twin.upSeconds;
    let state = 'partial';
    if (measured <= 0) {
      state = 'none';
    } else if (up >= measured) {
      state = 'up';
    } else if (up <= 0) {
      state = 'down';
    }
    return {
      time: cell.time,
      measuredSeconds: measured,
      upSeconds: up,
      state
    };
  });
  const firsts = [a.firstMeasured, b.firstMeasured].filter(t => !!t).sort();
  return {
    grain: a.grain,
    days: a.days,
    cells,
    end: a.end,
    firstMeasured: firsts.length ? firsts[0] : null
  };
}
/**
 * A group's uptime and measured share from its strip, so that the figures match the strip by
 * construction: uptime = reachable seconds / measured seconds of the cells up to now (null when
 * nothing was measured); measured share = measured seconds / seconds of the period up to now, both
 * over the addresses this server can check, as the strip's tooltip counts a cell (a cell sums the
 * measured seconds of every address of the group; one counts at most its own length).
 *
 * @param targets the addresses that can be measured (not those this server cannot check)
 */
function stripTotals(timeline, now, targets = 1) {
  const lengths = elapsedSeconds(timeline.cells, timeline.grain, now, timeline.end || '');
  const count = Math.max(1, targets);
  let up = 0;
  let measured = 0;
  let covered = 0;
  let elapsed = 0;
  timeline.cells.forEach((cell, i) => {
    if (cell.state === 'future') {
      return;
    }
    up += cell.upSeconds;
    measured += cell.measuredSeconds;
    covered += Math.min(cell.measuredSeconds, lengths[i] * count);
    elapsed += lengths[i] * count;
  });
  return {
    uptime: measured > 0 ? 100 * Math.min(up, measured) / measured : null,
    measured: elapsed > 0 ? Math.min(100, 100 * covered / elapsed) : 0
  };
}
// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/sides.ts
/*!
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

/**
 * The two sides of an address while another plugin adds results checked from outside, in one place
 * for the uptime page's table, the narrow list, the widgets, the answer lines and the admin
 * overview (Peter, 2026-11-26, "1a, 2a, 3a").
 *
 * - Truth, as the API counts it: down when either side finds it down, else reachable when either
 *   reaches it, not checkable only when no side can check it; an outside that cannot check the
 *   address counts for nothing.
 * - 3a: only the Matomo server finds it down while the outside reaches it: the same truth (down),
 *   shown amber, "Not reachable from the Matomo server" (visitors still reach it). Down from
 *   outside stays red. L8 review of 5.3.0 and the review of its fixes: "reaches it" means an "up"
 *   newer than the start of the server's failure by more than the margin, with no outage seen from
 *   outside open or ended since the server's latest failing check (aloneDown). Limit: the latest
 *   result from outside is the newest the screen has (up to 2 h 15 min old between two deliveries),
 *   so an address the server alone already failed to reach that then goes down for everyone reads
 *   amber until a newer result from outside arrives.
 * - P2: a value shows once when both sides say the same (the same outcome, and for a failure the
 *   same words; two response times of a reachable address are the same answer); else two lines, the
 *   side that sets the dot first, each naming its side. An outside without a current result (none
 *   yet, an old one) adds no line.
 *
 * Follow-ups (Peter, 2026-11-26, "alle wie empfohlen"): D3 in the widgets a side that cannot check
 * the address adds no line (widgetSide); W5 an agreeing row's other value for screen readers
 * (aside); W8 the server's name never breaks inside (keepServer). UI review of 5.4.0, P3 (Peter,
 * "go"): the server's short reason it cannot check an address is shown with its words (sideWords)
 * but never compared, so the sides agree and split as before.
 */
/**
 * Review of the 5.3.0 fixes, SHOULD 2: how much newer (seconds) one side's result must be than the
 * start of the other side's failure to say anything about it, while the page has no value of the
 * server's (config.external.sidesMargin, Freshness::sidesMargin()): the default run budget (60 s,
 * the server stamps a run's results with its start) plus one probe minute of the outside.
 */
const SIDES_MARGIN_SECONDS = 120;
/** the outcomes in the order that decides an address's state from both sides */
const COMBINED = ['down', 'up', 'not_checkable', 'stale', 'none'];
/** outcomes that are a current answer of a side */
const SPEAKS = ['up', 'down', 'not_checkable'];
/** the outside has a current answer about the address (also that it cannot check it) */
function speaks(side) {
  return !!side && SPEAKS.includes(side.outcome);
}
/**
 * The address's state from both sides (truth, as getSitesOverview): an outside that cannot check it
 * counts for nothing.
 */
function combined(server, outside) {
  const counted = outside && outside !== 'not_checkable' ? outside : null;
  if (!counted) {
    return server;
  }
  return COMBINED.find(o => o === server || o === counted) || server;
}
/**
 * L8 review of 5.3.0 (blocker) and the review of its fixes (SHOULD 1, 2): `failing` alone finds the
 * address down. The other side does not find it down and has no outage of its own open for it (an
 * outage from outside stays open until two good minutes in a row, so its latest "up" can lie inside
 * it; not known counts as open), nor one that ended at or after the failing side's latest failing
 * result (the failing side has not checked it since the other side's recovery). When the other
 * side reaches the address, its result is newer than the start of the failure (downSince, else the
 * failing result) by more than the failing side's margin: an older "up" says nothing about the
 * failure, and the server stamps a run's results with its start. An other side without a current
 * answer leaves it to the failing side. The same rule as getSitesOverview
 * (UptimeReport::aloneDown()).
 */
function aloneDown(failing, other) {
  if (failing.outcome !== 'down' || !other || other.outcome === 'down' || other.outageOpen !== false) {
    return false;
  }
  // an end that cannot be read counts as after the failing check
  if (other.outageEnd && !(Date.parse(other.outageEnd) < Date.parse(failing.checkedAt || ''))) {
    return false;
  }
  if (other.outcome !== 'up') {
    return true;
  }
  const since = Date.parse(failing.downSince || failing.checkedAt || '');
  const margin = typeof failing.margin === 'number' ? failing.margin : SIDES_MARGIN_SECONDS;
  return Date.parse(other.checkedAt || '') > since + margin * 1000;
}
/**
 * Quick UI review before 5.3.0, QL2: the side reaches the address while the other finds it down,
 * but its "up" does not count for the other side's one-sided failure (aloneDown: older than the
 * failure, or inside or right after an outage of its own): shown muted next to the red dot
 */
function uncounted(side, other) {
  return side.outcome === 'up' && !!other && other.outcome === 'down' && !aloneDown(other, side);
}
/**
 * 3a: only the Matomo server finds the address down while the outside reaches it (aloneDown: its
 * "up" after the failure began, no outage seen from outside open or ended since the server's
 * latest failing check)
 */
function serverOnlyDown(server, outside) {
  return server.key === 'server' && !!outside && outside.outcome === 'up' && aloneDown(server, outside);
}
/** the colour of the address's dot and row: its state, amber (partial) for 3a */
function toneOf(server, outside) {
  return serverOnlyDown(server, outside) ? 'partial' : combined(server.outcome, outside ? outside.outcome : null);
}
/**
 * both sides give the same answer: the same outcome, and for anything but reachable the same words
 */
function sameAnswer(server, outside) {
  return server.outcome === outside.outcome && (server.outcome === 'up' || server.text === outside.text);
}
/**
 * The sides in the order the screens list them: the one that sets the address's state first (the
 * failing side of a one-sided failure, the reaching side when the other cannot check it), the
 * server on a tie.
 */
function ordered(server, outside) {
  const state = combined(server.outcome, outside.outcome);
  return server.outcome === state || outside.outcome !== state ? [server, outside] : [outside, server];
}
/**
 * UI review W8: the server's name stays on one line ("Matomo server", "Matomo-Server", "serveur
 * Matomo"), in any case: its spaces no-break, its hyphen a non-breaking one
 */
function keepServer(text) {
  const name = Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiSourceServer');
  if (!/[ -]/.test(name)) {
    return text;
  }
  const pattern = new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
  return text.replace(pattern, found => found.replace(/ /g, '\u00a0').replace(/-/g, '\u2011'));
}
/** "HTTP status 403 from the Matomo server", "44 ms from outside" */
function sides_named(side, text) {
  return keepServer(Object(external_CoreHome_["translate"])(side.key === 'server' ? 'FeinwerkUptimeMonitor_UiValueFromServer' : 'FeinwerkUptimeMonitor_UiValueFromOutside', text));
}
/**
 * UI review of 5.4.0, P3: a side's words as a cell shows them, with the server's short reason it
 * cannot check the address ("Not checkable: needs PHP intl"); without it while the group's answer
 * line names it (polish before 5.4.0, reasonAbove)
 */
function sideWords(side) {
  return side.reason && !side.reasonAbove ? Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiNotCheckableCause', side.reason) : side.text;
}
/**
 * named() of a side's words: "Not checkable from the Matomo server: needs PHP intl"; without the
 * reason while a line above names it (reasonAbove)
 */
function namedWords(side) {
  return side.reason && side.key === 'server' && !side.reasonAbove ? keepServer(Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiNotCheckableFromServerCause', side.reason)) : sides_named(side, side.text);
}
/**
 * Quick UI review before 5.4.0, L1: the server's words with its reason in one named line ("Not
 * checkable from the Matomo server: needs PHP intl"), the tooltip of a cell that leaves the reason
 * to a line above
 */
function namedCause(side) {
  return namedWords(Object.assign(Object.assign({}, side), {}, {
    reasonAbove: ''
  }));
}
/** a failure in red; the server's while the outside reaches the address in amber (3a) */
function toneOfLine(side, other) {
  if (side.outcome !== 'down') {
    return '';
  }
  return serverOnlyDown(side, other) ? 'partial' : 'down';
}
/**
 * A past day's order (UI review W1): the lower uptime first, which sets the day's amber dot; the
 * server on a tie or when a number is missing
 */
function lowerFirst(server, outside) {
  const a = server.percent;
  const b = outside.percent;
  return typeof a === 'number' && typeof b === 'number' && b < a ? [outside, server] : [server, outside];
}
/**
 * P2: the Response cell. One line when the outside has no current answer or both say the same; the
 * server's "Not checkable" then names the Matomo server (one name for it on a screen with results
 * from outside, review NIT 5), unless the outside cannot check it either or it is a container too
 * large for any server. Else both, ordered, each named. Polish before 5.4.0: "Not checkable" alone
 * while the group's answer line names the server and its reason (reasonAbove 'group'); "Not
 * checkable from the Matomo server" while the count line names the reason (L1, 'screen').
 */
function responseLines(server, outside) {
  if (!speaks(outside) || sameAnswer(server, outside)) {
    const both = speaks(outside) && outside.outcome === 'not_checkable';
    const text = server.outcome === 'not_checkable' && !server.tooLarge && !both && server.reasonAbove !== 'group' ? namedWords(server) : sideWords(server);
    return [{
      text,
      tone: toneOfLine(server, outside),
      other: false
    }];
  }
  return ordered(server, outside).map((side, i) => ({
    // a container too large for any server to read: its words never name a side (UI review W4)
    text: side.tooLarge ? side.text : namedWords(side),
    tone: toneOfLine(side, side.key === 'server' ? outside : server),
    other: i > 0
  }));
}
/**
 * P2: the Uptime cell. One value when only the server has one or both are the same as shown; the
 * outside's alone names its side; two different ones both named, in the order of the sides (on a
 * past day the lower first). A past day says "Not measured" where nothing was.
 */
function uptimeLines(server, outside, past) {
  const none = past ? Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiNotMeasured') : '';
  if (!outside || outside.uptime === '' || outside.uptime === server.uptime) {
    return [{
      text: server.uptime || none,
      tone: '',
      other: false
    }];
  }
  if (server.uptime === '') {
    return [{
      text: sides_named(outside, outside.uptime),
      tone: '',
      other: false
    }];
  }
  const sides = past ? lowerFirst(server, outside) : ordered(server, outside);
  return sides.map((side, i) => ({
    text: sides_named(side, side.uptime),
    tone: '',
    other: i > 0
  }));
}
/**
 * P2 in the narrow list and the widgets: null when one line of values says it all (the cells above
 * would each be one line), else both sides in order, each on its own line under its name. byUptime:
 * the lower uptime first, as on a past day (UI review of 5.3.0, L4: the widgets on a past day,
 * which still show the current response).
 */
function split(server, outside, past, byUptime = past) {
  if (!outside) {
    return null;
  }
  const response = !past && responseLines(server, outside).length > 1;
  if (!response && uptimeLines(server, outside, past).length < 2) {
    return null;
  }
  return byUptime ? lowerFirst(server, outside) : ordered(server, outside);
}
/**
 * the tone of one side's line in the narrow list (3a amber for the server's failure while the
 * outside reaches it)
 */
function sideTone(side, other) {
  return toneOfLine(side, other) || side.outcome;
}
/**
 * D3 (Peter, 2026-11-26, "alle wie empfohlen"): in the widgets a side that cannot check the address
 * adds no line, so a green widget stays one line per address. The side that can check it while the
 * other cannot (its values make the one line: the server's as without results from outside, the
 * outside's named); null when both or neither can, the page's rule then applies (split()).
 */
function widgetSide(server, outside) {
  if (!speaks(outside)) {
    return null;
  }
  const serverCannot = server.outcome === 'not_checkable';
  const outsideCannot = outside.outcome === 'not_checkable';
  if (serverCannot === outsideCannot) {
    return null;
  }
  return serverCannot ? outside : server;
}
/**
 * W5 (UI review): a Response cell of one line while the outside answers too (the sides agree): what
 * the outside found, for screen readers ("Checked from outside: 118 ms"); '' otherwise. The eye
 * finds it in the cell's tooltip.
 */
function aside(server, outside) {
  if (!speaks(outside) || responseLines(server, outside).length > 1) {
    return '';
  }
  return Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiCheckedFromOutsideValue', outside.text);
}
// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/narrow.ts
/*!
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */
/** below this width (px) a screen takes its phone layout (.fwum-narrow, lists instead of tables) */
const NARROW_PX = 600;
/**
 * Calls back whether the element is narrower than NARROW_PX, now and whenever its own width
 * changes: a screen follows its own width, not the window's (a dashboard column, a phone). A
 * dashboard reload replaces a widget's HTML without unmounting the app: the observer lets go
 * once the element left the page. Null without ResizeObserver (the media query then decides).
 */
function observeNarrow(element, narrow) {
  if (typeof ResizeObserver === 'undefined') {
    return null;
  }
  const observer = new ResizeObserver(entries => {
    if (!element.isConnected) {
      observer.disconnect();
      return;
    }
    const width = entries[0] ? entries[0].contentRect.width : 0;
    if (width > 0) {
      narrow(width < NARROW_PX);
    }
  });
  observer.observe(element);
  return observer;
}
// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/cardPlace.ts
/*!
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */
/**
 * Matomo's dashboard names each widget's frame `widget<Module><action>...` (attribute widgetId).
 * Our widgets' actions all start with "get": the prefix never matches another module whose name
 * starts with ours (FeinwerkUptimeMonitorPro).
 */
const OURS = 'widgetFeinwerkUptimeMonitorget';
const BIG = `${OURS}UptimePage`;
/**
 * The kit's card on a dashboard (L5): the kit shows the first card that arrives, and our widgets
 * load in any order, so the card moved between them. Every widget asks this instead and only one
 * renders its card: the big Uptime widget when the dashboard has one, else the first small one
 * (Matomo's order: column by column, top down); minimised widgets do not count. The dashboard
 * creates every widget's frame before any content loads, so all of them answer alike. Outside a
 * dashboard: true (the kit shows the card only on dashboards anyway).
 */
function ownsDashboardCard(element) {
  const area = element.closest('#dashboardWidgetsArea');
  const own = element.closest('[widgetId]');
  if (!area || !own) {
    return true;
  }
  const ours = Array.prototype.filter.call(area.querySelectorAll(`[widgetId^="${OURS}"]`), frame => !frame.querySelector('.widget.hiddenContent'));
  const owner = ours.find(frame => (frame.getAttribute('widgetId') || '').startsWith(BIG)) || ours[0];
  return owner === own;
}
/** every widget that watches, with its last answer; one observer and one frame for all of them */
const watchers = new Set();
let observer = null;
let observed = null;
let cardPlace_frame = 0;
/**
 * All widgets decide in the same frame and change together: the old owner's card leaves in the
 * same update in which the new one's arrives, so the kit (one card per page, the first stays)
 * never sees two and never drops the new one.
 */
function decideAll() {
  cardPlace_frame = 0;
  watchers.forEach(watcher => {
    if (!watcher.element.isConnected) {
      // a dashboard reload replaced the widget's HTML without unmounting its app
      watchers.delete(watcher);
      return;
    }
    const owns = ownsDashboardCard(watcher.element);
    if (owns !== watcher.owns) {
      // eslint-disable-next-line no-param-reassign
      watcher.owns = owns;
      watcher.changed(owns);
    }
  });
  if (!watchers.size && observer) {
    observer.disconnect();
    observer = null;
    observed = null;
  }
}
/**
 * Decides again whenever the dashboard changes what counts: a widget minimised or restored (its
 * class hiddenContent; Matomo fires no DOM event for it), added, moved or removed. Calls back with
 * the new answer only when it changed. Every widget watches, so the card moves to the new owner
 * and never shows twice. Returns the function that stops the watch; outside a dashboard nothing
 * is watched.
 */
function watchDashboardCard(element, changed) {
  const area = element.closest('#dashboardWidgetsArea');
  if (!area || typeof MutationObserver === 'undefined') {
    return () => undefined;
  }
  const watcher = {
    element,
    owns: ownsDashboardCard(element),
    changed
  };
  watchers.add(watcher);
  if (observed !== area) {
    if (observer) {
      observer.disconnect();
    }
    observed = area;
    // many changes come at once (a widget's content arrives): decide once per frame
    observer = new MutationObserver(() => {
      if (!cardPlace_frame) {
        cardPlace_frame = window.requestAnimationFrame(decideAll);
      }
    });
    observer.observe(area, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['class']
    });
  }
  return () => {
    watchers.delete(watcher);
  };
}
// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/configLines.ts
/*!
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */
/**
 * The opt-in's line for [FeinwerkUptimeMonitor] in config/config.ini.php, on the admin page and on
 * Visitors > Uptime (quick UI review before 5.4.0, L2). Only the line (UI review of 5.4.0, P2):
 * Matomo reads a section header that is in the file twice as one section that replaces the first
 * (parse_ini_string), so a pasted header would drop the settings already in it.
 */
const INTERNET_LINE = 'checkWithInternetFeaturesOff = 1';
// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/outages.ts
/*!
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */
/**
 * An incident with a part inside the period: seconds inside it, or (quick UI review before 5.4.0,
 * Q1) an ended outage of no length: one failed check, after which the server's checks stopped
 * sending (it ends at its last failed check), which the API returns only for the periods that
 * contain its start. One that only touches the period (it ends at the period's start) is left out.
 */
function inPeriod(i) {
  return i.durationInPeriodSeconds > 0 || i.type === 'outage' && i.end !== null && i.durationSeconds === 0;
}
/**
 * The outages of a period as the day's answer counts them (5.1.5 review, F1): only their parts
 * inside the period (API startInPeriod, durationInPeriodSeconds), and outages of several
 * addresses that overlap or touch as one outage with the length of their union. Gaps and parts
 * of no length (an outage that only touches the period) do not count; an outage of no length
 * inside it does (inPeriod).
 */
function outageTotals(incidents) {
  const parts = incidents.filter(i => i.type === 'outage' && inPeriod(i)).map(i => {
    const start = new Date(i.startInPeriod).getTime() / 1000;
    return [start, start + i.durationInPeriodSeconds];
  }).sort((a, b) => a[0] - b[0]);
  let count = 0;
  let seconds = 0;
  let end = -Infinity;
  let start = 0;
  parts.forEach(([from, to]) => {
    if (from > end) {
      if (count > 0) {
        seconds += end - start;
      }
      count += 1;
      start = from;
      end = to;
    } else {
      end = Math.max(end, to);
    }
  });
  if (count > 0) {
    seconds += end - start;
  }
  return {
    count,
    seconds: Math.round(seconds)
  };
}
/** the parts of the outages inside the period as merged intervals (seconds), sorted */
function union(incidents) {
  const parts = incidents.filter(i => i.type === 'outage' && inPeriod(i)).map(i => {
    const start = new Date(i.startInPeriod).getTime() / 1000;
    return [start, start + i.durationInPeriodSeconds];
  }).sort((a, b) => a[0] - b[0]);
  const out = [];
  parts.forEach(([from, to]) => {
    const last = out[out.length - 1];
    if (last && from <= last[1]) {
      last[1] = Math.max(last[1], to);
    } else {
      out.push([from, to]);
    }
  });
  return out;
}
/** the parts of the intervals a that none of b covers (both merged and sorted, as union()) */
function subtract(a, b) {
  const out = [];
  a.forEach(([from, to]) => {
    let start = from;
    b.forEach(([x, y]) => {
      if (y <= start || x >= to) {
        return;
      }
      if (x > start) {
        out.push([start, x]);
      }
      start = Math.max(start, y);
    });
    if (start < to) {
      out.push([start, to]);
    }
  });
  return out;
}
/**
 * P3 (UI review 5.2.0): of the period's outage time, the seconds only the outside saw, inside the
 * period. Per address (L8 review of 5.3.0, NIT 4): its outages from outside minus the Matomo
 * server's outages of the same address, then the union of those parts over the addresses, so the
 * server's outage of one address never hides what only the outside saw of another.
 */
function onlyFromOutside(incidents) {
  const keys = incidents.filter(i => i.source === 'external').map(i => i.targetKey || '').filter((key, n, all) => all.indexOf(key) === n);
  const parts = [];
  keys.forEach(key => {
    const own = incidents.filter(i => (i.targetKey || '') === key);
    const outside = union(own.filter(i => i.source === 'external'));
    const server = union(own.filter(i => i.source !== 'external'));
    parts.push(...subtract(outside, server));
  });
  parts.sort((a, b) => a[0] - b[0]);
  let seconds = 0;
  let end = -Infinity;
  parts.forEach(([from, to]) => {
    seconds += Math.max(0, to - Math.max(from, end));
    end = Math.max(end, to);
  });
  return Math.round(seconds);
}
/** The outages with a part inside the period (those that only touch it are left out: inPeriod). */
function outagesInPeriod(incidents) {
  return incidents.filter(i => i.type === 'outage' && inPeriod(i));
}
/** the order of the addresses on the screens: Matomo's, then the website's */
const KIND_ORDER = ['ui', 'tracker', 'js', 'web', 'proxy', 'container'];
/** Matomo's own addresses and the website's Tag Manager containers (their file is on Matomo) */
const MATOMO_GROUP = ['ui', 'tracker', 'js', 'container'];
/** the group of an outage's address on the screens: matomo or site ('' for a gap) */
function groupOf(incident) {
  if (incident.type === 'gap') {
    return '';
  }
  return MATOMO_GROUP.includes(incident.kind || '') ? 'matomo' : 'site';
}
/**
 * The outage list's rows (final review D1): outages of addresses of the same group that overlap or
 * touch become one row; gaps stay rows of their own. On a past day or a longer period only outages
 * with a part inside it count (one that only touches it is left out); today every loaded outage
 * shows. Newest first.
 *
 * Follow-up D1 (Peter, 2026-11-26, "alle wie empfohlen"): the list answers once, as the day's
 * answer counts the outages: the side does not split a row. A row seen from both sides says so
 * (source both), also when the outside saw fewer of its addresses (it checks fewer, or one of them
 * went down only for the server): like its addresses, causes and length, the side is the row's,
 * not each address's. Without results from outside every outage is the server's, as before.
 */
function outageRows(incidents, past) {
  const ms = iso => new Date(iso).getTime();
  const items = incidents.filter(i => !past || inPeriod(i)).map(i => ({
    i,
    from: ms(i.start),
    to: ms(i.start) + i.durationSeconds * 1000
  })).sort((a, b) => a.from - b.from || a.i.idIncident - b.i.idIncident);
  const open = {};
  const clusters = [];
  items.forEach(item => {
    const group = groupOf(item.i);
    const current = group === '' ? undefined : open[group];
    if (current && item.from <= current.to) {
      current.members.push(item);
      current.to = Math.max(current.to, item.to);
      return;
    }
    const cluster = {
      members: [item],
      to: item.to
    };
    clusters.push(cluster.members);
    if (group !== '') {
      open[group] = cluster;
    }
  });
  return clusters.map(members => {
    const first = members[0].i;
    const end = Math.max(...members.map(m => m.to));
    const parts = members.filter(m => inPeriod(m.i));
    const partStart = parts.length ? Math.min(...parts.map(m => ms(m.i.startInPeriod))) : 0;
    const partEnd = parts.length ? Math.max(...parts.map(m => ms(m.i.startInPeriod) + m.i.durationInPeriodSeconds * 1000)) : 0;
    const sources = members.map(m => m.i.source).filter((v, n, all) => all.indexOf(v) === n);
    return {
      key: members.map(m => m.i.idIncident).join('-'),
      type: first.type,
      group: groupOf(first),
      source: sources.length > 1 ? 'both' : first.source,
      incidents: members.map(m => m.i),
      start: first.start,
      open: members.some(m => m.i.open),
      durationSeconds: Math.round((end - members[0].from) / 1000),
      durationInPeriodSeconds: Math.round((partEnd - partStart) / 1000)
    };
  }).sort((a, b) => ms(b.start) - ms(a.start));
}
// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-babel/node_modules/cache-loader/dist/cjs.js??ref--13-0!./node_modules/@vue/cli-plugin-babel/node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist/templateLoader.js??ref--6!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--1-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--1-1!./plugins/FeinwerkUptimeMonitor/vue/src/Sparkline.vue?vue&type=template&id=4a865282

const Sparklinevue_type_template_id_4a865282_hoisted_1 = ["viewBox", "width", "height", "aria-label"];
const Sparklinevue_type_template_id_4a865282_hoisted_2 = ["d"];
function Sparklinevue_type_template_id_4a865282_render(_ctx, _cache, $props, $setup, $data, $options) {
  return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("svg", {
    class: "fwum-sparkline",
    viewBox: `0 0 ${_ctx.width} ${_ctx.height}`,
    width: _ctx.width,
    height: _ctx.height,
    role: "img",
    "aria-label": _ctx.label,
    preserveAspectRatio: "none"
  }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("title", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.label), 1), _ctx.path ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("path", {
    key: 0,
    d: _ctx.path,
    class: "fwum-sparkline__line"
  }, null, 8, Sparklinevue_type_template_id_4a865282_hoisted_2)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)], 8, Sparklinevue_type_template_id_4a865282_hoisted_1);
}
// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/Sparkline.vue?vue&type=template&id=4a865282

// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-typescript/node_modules/cache-loader/dist/cjs.js??ref--15-0!./node_modules/babel-loader/lib!./node_modules/@vue/cli-plugin-typescript/node_modules/ts-loader??ref--15-2!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--1-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--1-1!./plugins/FeinwerkUptimeMonitor/vue/src/Sparkline.vue?vue&type=script&lang=ts

/** A small line of the values; null values leave a gap (nothing measured there). */
/* harmony default export */ var Sparklinevue_type_script_lang_ts = (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["defineComponent"])({
  props: {
    values: {
      type: Array,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    width: {
      type: Number,
      default: 240
    },
    height: {
      type: Number,
      default: 36
    }
  },
  computed: {
    path() {
      const numbers = this.values.filter(v => v !== null);
      if (numbers.length < 2) {
        return '';
      }
      const max = Math.max(...numbers, 1);
      const step = this.width / Math.max(1, this.values.length - 1);
      let d = '';
      let pen = false;
      this.values.forEach((value, i) => {
        if (value === null) {
          pen = false;
          return;
        }
        const x = (i * step).toFixed(1);
        const y = (this.height - 2 - value / max * (this.height - 4)).toFixed(1);
        d += `${pen ? 'L' : 'M'}${x} ${y} `;
        pen = true;
      });
      return d.trim();
    }
  }
}));
// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/Sparkline.vue?vue&type=script&lang=ts
 
// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/Sparkline.vue



Sparklinevue_type_script_lang_ts.render = Sparklinevue_type_template_id_4a865282_render

/* harmony default export */ var Sparkline = (Sparklinevue_type_script_lang_ts);
// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-babel/node_modules/cache-loader/dist/cjs.js??ref--13-0!./node_modules/@vue/cli-plugin-babel/node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist/templateLoader.js??ref--6!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--1-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--1-1!./plugins/FeinwerkUptimeMonitor/vue/src/OutageList.vue?vue&type=template&id=329b7a7e

const OutageListvue_type_template_id_329b7a7e_hoisted_1 = {
  class: "fwum-outages"
};
const OutageListvue_type_template_id_329b7a7e_hoisted_2 = {
  class: "fwum-outages__head"
};
const OutageListvue_type_template_id_329b7a7e_hoisted_3 = {
  class: "fwum-outages__title",
  role: "heading",
  "aria-level": "3"
};
const OutageListvue_type_template_id_329b7a7e_hoisted_4 = {
  key: 0,
  class: "fwum-muted"
};
const OutageListvue_type_template_id_329b7a7e_hoisted_5 = {
  key: 0,
  class: "fwum-muted"
};
const OutageListvue_type_template_id_329b7a7e_hoisted_6 = {
  key: 1,
  class: "fwum-targets fwum-outages__list",
  role: "list"
};
const OutageListvue_type_template_id_329b7a7e_hoisted_7 = {
  class: "fwum-outages__first"
};
const OutageListvue_type_template_id_329b7a7e_hoisted_8 = {
  class: "fwum-outages__when"
};
const OutageListvue_type_template_id_329b7a7e_hoisted_9 = {
  class: "fwum-sr"
};
const OutageListvue_type_template_id_329b7a7e_hoisted_10 = {
  class: "fwum-outages__length"
};
const OutageListvue_type_template_id_329b7a7e_hoisted_11 = {
  class: "fwum-sr"
};
const OutageListvue_type_template_id_329b7a7e_hoisted_12 = {
  key: 0,
  class: "fwum-ongoing"
};
const OutageListvue_type_template_id_329b7a7e_hoisted_13 = {
  class: "fwum-outages__what"
};
const OutageListvue_type_template_id_329b7a7e_hoisted_14 = {
  class: "fwum-sr"
};
const OutageListvue_type_template_id_329b7a7e_hoisted_15 = {
  key: 0,
  class: "fwum-outages__cause"
};
const OutageListvue_type_template_id_329b7a7e_hoisted_16 = {
  key: 0
};
const OutageListvue_type_template_id_329b7a7e_hoisted_17 = {
  class: "fwum-sr"
};
const OutageListvue_type_template_id_329b7a7e_hoisted_18 = {
  key: 1,
  class: "fwum-muted"
};
const OutageListvue_type_template_id_329b7a7e_hoisted_19 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
  class: "fwum-sr"
}, ", ", -1);
const OutageListvue_type_template_id_329b7a7e_hoisted_20 = {
  key: 2,
  class: "fwum-table-wrap"
};
const OutageListvue_type_template_id_329b7a7e_hoisted_21 = {
  class: "dataTable fwum-table fwum-outages__table"
};
const OutageListvue_type_template_id_329b7a7e_hoisted_22 = {
  scope: "col",
  class: "label"
};
const OutageListvue_type_template_id_329b7a7e_hoisted_23 = {
  scope: "col",
  class: "fwum-outages__wide"
};
const OutageListvue_type_template_id_329b7a7e_hoisted_24 = {
  scope: "col"
};
const OutageListvue_type_template_id_329b7a7e_hoisted_25 = {
  scope: "col"
};
const OutageListvue_type_template_id_329b7a7e_hoisted_26 = {
  class: "label fwum-outages__start"
};
const OutageListvue_type_template_id_329b7a7e_hoisted_27 = {
  class: "fwum-outages__narrow"
};
const OutageListvue_type_template_id_329b7a7e_hoisted_28 = {
  class: "fwum-sr"
};
const OutageListvue_type_template_id_329b7a7e_hoisted_29 = {
  key: 0,
  class: "fwum-ongoing"
};
const OutageListvue_type_template_id_329b7a7e_hoisted_30 = {
  class: "fwum-outages__wide"
};
const OutageListvue_type_template_id_329b7a7e_hoisted_31 = {
  key: 0,
  class: "fwum-ongoing"
};
const OutageListvue_type_template_id_329b7a7e_hoisted_32 = {
  class: "fwum-outages__cause"
};
const OutageListvue_type_template_id_329b7a7e_hoisted_33 = {
  key: 0
};
const OutageListvue_type_template_id_329b7a7e_hoisted_34 = {
  key: 1,
  class: "fwum-muted fwum-outages__side"
};
const OutageListvue_type_template_id_329b7a7e_hoisted_35 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
  class: "fwum-sr"
}, ", ", -1);
const OutageListvue_type_template_id_329b7a7e_hoisted_36 = ["disabled"];
function OutageListvue_type_template_id_329b7a7e_render(_ctx, _cache, $props, $setup, $data, $options) {
  return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", OutageListvue_type_template_id_329b7a7e_hoisted_1, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", OutageListvue_type_template_id_329b7a7e_hoisted_2, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", OutageListvue_type_template_id_329b7a7e_hoisted_3, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiOutages')), 1), _ctx.countText ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", OutageListvue_type_template_id_329b7a7e_hoisted_4, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.countText), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)]), _ctx.outages.length === 0 ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("p", OutageListvue_type_template_id_329b7a7e_hoisted_5, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate(_ctx.notMeasured ? 'FeinwerkUptimeMonitor_UiOutagesNotMeasured' : 'FeinwerkUptimeMonitor_UiNoOutages')), 1)) : _ctx.narrow ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("ul", OutageListvue_type_template_id_329b7a7e_hoisted_6, [(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderList"])(_ctx.outages, row => {
    return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("li", {
      key: row.key
    }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", OutageListvue_type_template_id_329b7a7e_hoisted_7, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", OutageListvue_type_template_id_329b7a7e_hoisted_8, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", OutageListvue_type_template_id_329b7a7e_hoisted_9, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiStart')) + ": ", 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.when(row.start)), 1)]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", OutageListvue_type_template_id_329b7a7e_hoisted_10, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", OutageListvue_type_template_id_329b7a7e_hoisted_11, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiDuration')) + ": ", 1), row.open ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", OutageListvue_type_template_id_329b7a7e_hoisted_12, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiOngoing')) + ", ", 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.length(row)), 1)])]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", OutageListvue_type_template_id_329b7a7e_hoisted_13, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", OutageListvue_type_template_id_329b7a7e_hoisted_14, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiWhat')) + ": ", 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.what(row)), 1)]), _ctx.cause(row) || _ctx.hasExternal ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", OutageListvue_type_template_id_329b7a7e_hoisted_15, [_ctx.cause(row) ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", OutageListvue_type_template_id_329b7a7e_hoisted_16, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", OutageListvue_type_template_id_329b7a7e_hoisted_17, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiCause')) + ": ", 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.cause(row)), 1)])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.hasExternal ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", OutageListvue_type_template_id_329b7a7e_hoisted_18, [OutageListvue_type_template_id_329b7a7e_hoisted_19, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.sidePhrase(row.source)), 1)])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)]);
  }), 128))])) : (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", OutageListvue_type_template_id_329b7a7e_hoisted_20, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("table", OutageListvue_type_template_id_329b7a7e_hoisted_21, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("thead", null, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("tr", null, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("th", OutageListvue_type_template_id_329b7a7e_hoisted_22, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiStart')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("th", OutageListvue_type_template_id_329b7a7e_hoisted_23, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiDuration')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("th", OutageListvue_type_template_id_329b7a7e_hoisted_24, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiWhat')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("th", OutageListvue_type_template_id_329b7a7e_hoisted_25, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiCause')), 1)])]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("tbody", null, [(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderList"])(_ctx.outages, row => {
    return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("tr", {
      key: row.key
    }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("td", OutageListvue_type_template_id_329b7a7e_hoisted_26, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.when(row.start)) + " ", 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", OutageListvue_type_template_id_329b7a7e_hoisted_27, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", OutageListvue_type_template_id_329b7a7e_hoisted_28, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiDuration')) + ": ", 1), row.open ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", OutageListvue_type_template_id_329b7a7e_hoisted_29, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiOngoing')) + ", ", 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.length(row)), 1)])]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("td", OutageListvue_type_template_id_329b7a7e_hoisted_30, [row.open ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", OutageListvue_type_template_id_329b7a7e_hoisted_31, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiOngoing')) + ", ", 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.length(row)), 1)]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("td", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.what(row)), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("td", OutageListvue_type_template_id_329b7a7e_hoisted_32, [_ctx.cause(row) ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", OutageListvue_type_template_id_329b7a7e_hoisted_33, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.cause(row)), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.hasExternal ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", OutageListvue_type_template_id_329b7a7e_hoisted_34, [OutageListvue_type_template_id_329b7a7e_hoisted_35, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.sidePhrase(row.source)), 1)])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)])]);
  }), 128))])])])), _ctx.canShowMore ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("button", {
    key: 3,
    type: "button",
    class: "btn-flat fwum-more",
    disabled: _ctx.loadingMore,
    onClick: _cache[0] || (_cache[0] = $event => _ctx.$emit('more'))
  }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate(_ctx.loadingMore ? 'FeinwerkUptimeMonitor_UiLoading' : 'FeinwerkUptimeMonitor_UiShowMore')), 9, OutageListvue_type_template_id_329b7a7e_hoisted_36)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)]);
}
// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/OutageList.vue?vue&type=template&id=329b7a7e

// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-typescript/node_modules/cache-loader/dist/cjs.js??ref--15-0!./node_modules/babel-loader/lib!./node_modules/@vue/cli-plugin-typescript/node_modules/ts-loader??ref--15-2!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--1-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--1-1!./plugins/FeinwerkUptimeMonitor/vue/src/OutageList.vue?vue&type=script&lang=ts





/** a row's side in words after its cause, by its source (follow-up D1: both) */
const SIDE_PHRASES = {
  local: 'FeinwerkUptimeMonitor_UiFromServer',
  external: 'FeinwerkUptimeMonitor_UiFromOutside',
  both: 'FeinwerkUptimeMonitor_UiFromBoth'
};
/* harmony default export */ var OutageListvue_type_script_lang_ts = (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["defineComponent"])({
  props: {
    /** the rows shown (outages.ts outageRows), newest first */
    outages: {
      type: Array,
      required: true
    },
    /** each address's name without its group ("Interface", "www.example.com") */
    names: {
      type: Object,
      required: true
    },
    /** a past day or a longer period: durations are the part inside it */
    past: {
      type: Boolean,
      default: false
    },
    language: {
      type: String,
      default: ''
    },
    /** the website's timezone (Peter's 6a) */
    timezone: {
      type: String,
      default: ''
    },
    /** the rows of the period that were loaded (the list shows the first ones) */
    total: {
      type: Number,
      default: 0
    },
    /** the API cut a list at its limit: the period has at least `total` outages */
    totalIsMinimum: {
      type: Boolean,
      default: false
    },
    /** "Show more" can show or load more */
    canShowMore: {
      type: Boolean,
      default: false
    },
    loadingMore: {
      type: Boolean,
      default: false
    },
    /** the page is narrow (UptimePage's own width): the outages as a list */
    narrow: {
      type: Boolean,
      default: false
    },
    /** nothing was measured in the period: no outages say nothing */
    notMeasured: {
      type: Boolean,
      default: false
    },
    /** the screen shows results from outside: every row names its side or both (5.2.0 review L2) */
    outside: {
      type: Boolean,
      default: false
    }
  },
  emits: ['more'],
  computed: {
    /** "20 of 57" above a cut list (the UI review's later item 10) */
    countText() {
      if (this.outages.length === 0 || this.outages.length >= this.total && !this.totalIsMinimum) {
        return '';
      }
      return Object(external_CoreHome_["translate"])(this.totalIsMinimum ? 'FeinwerkUptimeMonitor_UiOutagesOfAtLeast' : 'FeinwerkUptimeMonitor_UiOutagesOf', String(this.outages.length), String(this.total));
    },
    /** the side helps only once results come from outside (the free plugin checks from Matomo) */
    hasExternal() {
      return this.outside || this.outages.some(row => row.source === 'external' || row.source === 'both');
    }
  },
  methods: {
    translate: external_CoreHome_["translate"],
    when(iso) {
      return dateTime(iso, this.language, this.timezone);
    },
    /** the whole length; on a past day or longer period the part inside it, "30 min of 1 h" */
    length(row) {
      const whole = duration(row.durationSeconds, this.language);
      if (!this.past) {
        return whole;
      }
      const part = duration(row.durationInPeriodSeconds, this.language);
      return part === whole ? part : Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiPartOfWhole', part, whole);
    },
    /** "Matomo: Interface, Tracker endpoint and JavaScript tracker": the group named once */
    what(row) {
      if (row.type === 'gap') {
        return Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiGap');
      }
      const targets = row.incidents.map(i => ({
        key: i.targetKey || '',
        kind: i.kind || ''
      })).filter((t, n, all) => all.findIndex(o => o.key === t.key) === n).sort((a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind) || a.key.localeCompare(b.key));
      const names = listOf(targets.map(t => this.names[t.key] || t.key), this.language);
      return row.group === 'matomo' ? Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiMatomoTarget', names) : names;
    },
    /** the causes of the merged outages, each once */
    cause(row) {
      if (row.type === 'gap') {
        return '';
      }
      const causes = row.incidents.map(i => causeText(i.cause, i.detail)).filter((c, n, all) => c !== '' && all.indexOf(c) === n);
      return listOf(causes, this.language);
    },
    /**
     * the side after the cause, in the narrow list and the table (D3): "from outside", "from the
     * Matomo server", both (follow-up D1); the server's name whole (W8)
     */
    sidePhrase(source) {
      return keepServer(Object(external_CoreHome_["translate"])(SIDE_PHRASES[source] || SIDE_PHRASES.local));
    }
  }
}));
// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/OutageList.vue?vue&type=script&lang=ts
 
// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/OutageList.vue



OutageListvue_type_script_lang_ts.render = OutageListvue_type_template_id_329b7a7e_render

/* harmony default export */ var OutageList = (OutageListvue_type_script_lang_ts);
// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-babel/node_modules/cache-loader/dist/cjs.js??ref--13-0!./node_modules/@vue/cli-plugin-babel/node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist/templateLoader.js??ref--6!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--1-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--1-1!./plugins/FeinwerkUptimeMonitor/vue/src/TargetPanel.vue?vue&type=template&id=096a911e

const TargetPanelvue_type_template_id_096a911e_hoisted_1 = ["aria-labelledby"];
const TargetPanelvue_type_template_id_096a911e_hoisted_2 = {
  class: "fwum-panel__head"
};
const TargetPanelvue_type_template_id_096a911e_hoisted_3 = ["id"];
const TargetPanelvue_type_template_id_096a911e_hoisted_4 = ["aria-label", "title"];
const TargetPanelvue_type_template_id_096a911e_hoisted_5 = {
  class: "fwum-panel__body"
};
const TargetPanelvue_type_template_id_096a911e_hoisted_6 = {
  key: 0,
  class: "fwum-muted fwum-panel__notice"
};
const TargetPanelvue_type_template_id_096a911e_hoisted_7 = {
  key: 1,
  class: "fwum-muted",
  "aria-busy": "true"
};
const TargetPanelvue_type_template_id_096a911e_hoisted_8 = {
  key: 2,
  class: "fwum-inline-error",
  role: "alert"
};
const TargetPanelvue_type_template_id_096a911e_hoisted_9 = {
  key: 3,
  class: "fwum-inline-error",
  role: "alert"
};
const TargetPanelvue_type_template_id_096a911e_hoisted_10 = {
  key: 4,
  class: "fwum-suggestions"
};
const TargetPanelvue_type_template_id_096a911e_hoisted_11 = {
  class: "fwum-suggestions__kind"
};
const TargetPanelvue_type_template_id_096a911e_hoisted_12 = {
  class: "fwum-suggestions__url"
};
const TargetPanelvue_type_template_id_096a911e_hoisted_13 = ["disabled", "onClick"];
const TargetPanelvue_type_template_id_096a911e_hoisted_14 = {
  key: 5,
  class: "fwum-edit-list"
};
const TargetPanelvue_type_template_id_096a911e_hoisted_15 = ["data-fwum-key"];
const TargetPanelvue_type_template_id_096a911e_hoisted_16 = {
  class: "fwum-edit-list__row"
};
const TargetPanelvue_type_template_id_096a911e_hoisted_17 = {
  class: "fwum-edit-list__toggle"
};
const TargetPanelvue_type_template_id_096a911e_hoisted_18 = ["checked", "disabled", "aria-label", "onChange"];
const TargetPanelvue_type_template_id_096a911e_hoisted_19 = {
  "aria-hidden": "true"
};
const TargetPanelvue_type_template_id_096a911e_hoisted_20 = {
  class: "fwum-edit-list__url"
};
const TargetPanelvue_type_template_id_096a911e_hoisted_21 = {
  class: "fwum-muted"
};
const TargetPanelvue_type_template_id_096a911e_hoisted_22 = {
  key: 0,
  class: "fwum-edit-list__actions"
};
const TargetPanelvue_type_template_id_096a911e_hoisted_23 = ["title", "aria-label", "onClick"];
const TargetPanelvue_type_template_id_096a911e_hoisted_24 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
  class: "icon-edit",
  "aria-hidden": "true"
}, null, -1);
const TargetPanelvue_type_template_id_096a911e_hoisted_25 = [TargetPanelvue_type_template_id_096a911e_hoisted_24];
const TargetPanelvue_type_template_id_096a911e_hoisted_26 = ["title", "aria-label", "disabled", "onClick"];
const TargetPanelvue_type_template_id_096a911e_hoisted_27 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
  class: "icon-delete",
  "aria-hidden": "true"
}, null, -1);
const TargetPanelvue_type_template_id_096a911e_hoisted_28 = [TargetPanelvue_type_template_id_096a911e_hoisted_27];
const TargetPanelvue_type_template_id_096a911e_hoisted_29 = {
  key: 0,
  class: "fwum-edit-list__edit"
};
const TargetPanelvue_type_template_id_096a911e_hoisted_30 = ["aria-label", "aria-invalid", "onKeydown"];
const TargetPanelvue_type_template_id_096a911e_hoisted_31 = ["disabled", "onClick"];
const TargetPanelvue_type_template_id_096a911e_hoisted_32 = ["onClick"];
const TargetPanelvue_type_template_id_096a911e_hoisted_33 = {
  key: 0,
  class: "fwum-inline-error"
};
const TargetPanelvue_type_template_id_096a911e_hoisted_34 = {
  key: 1,
  class: "fwum-edit-list__confirm",
  role: "group"
};
const TargetPanelvue_type_template_id_096a911e_hoisted_35 = ["disabled", "onClick"];
const TargetPanelvue_type_template_id_096a911e_hoisted_36 = ["onClick"];
const TargetPanelvue_type_template_id_096a911e_hoisted_37 = {
  key: 2,
  class: "fwum-inline-error",
  role: "alert"
};
const TargetPanelvue_type_template_id_096a911e_hoisted_38 = {
  class: "fwum-add__row"
};
const TargetPanelvue_type_template_id_096a911e_hoisted_39 = ["aria-label"];
const TargetPanelvue_type_template_id_096a911e_hoisted_40 = {
  value: "web"
};
const TargetPanelvue_type_template_id_096a911e_hoisted_41 = {
  value: "proxy"
};
const TargetPanelvue_type_template_id_096a911e_hoisted_42 = ["aria-label", "aria-invalid"];
const TargetPanelvue_type_template_id_096a911e_hoisted_43 = ["disabled"];
const TargetPanelvue_type_template_id_096a911e_hoisted_44 = {
  key: 0,
  class: "fwum-inline-error"
};
const TargetPanelvue_type_template_id_096a911e_hoisted_45 = {
  key: 1,
  class: "fwum-inline-error",
  role: "alert"
};
const TargetPanelvue_type_template_id_096a911e_hoisted_46 = {
  class: "fwum-panel__foot"
};
const TargetPanelvue_type_template_id_096a911e_hoisted_47 = ["disabled"];
function TargetPanelvue_type_template_id_096a911e_render(_ctx, _cache, $props, $setup, $data, $options) {
  return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", {
    class: "fwum-panel-backdrop",
    onClick: _cache[7] || (_cache[7] = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withModifiers"])((...args) => _ctx.close && _ctx.close(...args), ["self"]))
  }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", {
    ref: "panel",
    class: "fwum-panel",
    role: "dialog",
    "aria-modal": "true",
    "aria-labelledby": _ctx.titleId,
    tabindex: "-1"
  }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", TargetPanelvue_type_template_id_096a911e_hoisted_2, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("h2", {
    id: _ctx.titleId,
    class: "fwum-panel__title"
  }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.siteName ? _ctx.translate('FeinwerkUptimeMonitor_UiTargetsTitleOf', _ctx.siteName) : _ctx.translate('FeinwerkUptimeMonitor_UiTargetsTitle')), 9, TargetPanelvue_type_template_id_096a911e_hoisted_3), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("button", {
    type: "button",
    class: "fwum-panel__close",
    "aria-label": _ctx.translate('FeinwerkUptimeMonitor_UiClose'),
    title: _ctx.translate('FeinwerkUptimeMonitor_UiClose'),
    onClick: _cache[0] || (_cache[0] = (...args) => _ctx.close && _ctx.close(...args))
  }, "×", 8, TargetPanelvue_type_template_id_096a911e_hoisted_4)]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", TargetPanelvue_type_template_id_096a911e_hoisted_5, [_ctx.notice ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("p", TargetPanelvue_type_template_id_096a911e_hoisted_6, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.notice), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.loading ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("p", TargetPanelvue_type_template_id_096a911e_hoisted_7, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiLoading')), 1)) : _ctx.loadFailed ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", TargetPanelvue_type_template_id_096a911e_hoisted_8, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiLoadFailed')) + " ", 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("button", {
    type: "button",
    class: "btn-flat",
    onClick: _cache[1] || (_cache[1] = (...args) => _ctx.load && _ctx.load(...args))
  }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiRetry')), 1)])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.error && _ctx.errorOnTop ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("p", TargetPanelvue_type_template_id_096a911e_hoisted_9, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.error), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.suggestions.length ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("section", TargetPanelvue_type_template_id_096a911e_hoisted_10, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("h3", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiSuggestions')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("ul", null, [(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderList"])(_ctx.suggestions, suggestion => {
    return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("li", {
      key: suggestion.key + suggestion.url
    }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", TargetPanelvue_type_template_id_096a911e_hoisted_11, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.kindLabel(suggestion.kind, suggestion.key)), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", TargetPanelvue_type_template_id_096a911e_hoisted_12, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(suggestion.url), 1), _ctx.canAdopt(suggestion) ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("button", {
      key: 0,
      type: "button",
      class: "btn-flat",
      disabled: _ctx.busy,
      onClick: $event => _ctx.adopt(suggestion)
    }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiAdopt')), 9, TargetPanelvue_type_template_id_096a911e_hoisted_13)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)]);
  }), 128))])])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.targets.length ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("ul", TargetPanelvue_type_template_id_096a911e_hoisted_14, [(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderList"])(_ctx.targets, target => {
    return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("li", {
      key: target.targetKey,
      "data-fwum-key": target.targetKey
    }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", TargetPanelvue_type_template_id_096a911e_hoisted_16, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("label", TargetPanelvue_type_template_id_096a911e_hoisted_17, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("input", {
      type: "checkbox",
      "data-fwum-focus": "toggle",
      checked: target.enabled,
      disabled: _ctx.busy,
      "aria-label": _ctx.translate('FeinwerkUptimeMonitor_UiCheckTarget', _ctx.addressOf(target)),
      onChange: $event => _ctx.toggle(target, $event)
    }, null, 40, TargetPanelvue_type_template_id_096a911e_hoisted_18), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("small", TargetPanelvue_type_template_id_096a911e_hoisted_19, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate(target.enabled ? 'FeinwerkUptimeMonitor_UiOn' : 'FeinwerkUptimeMonitor_UiOff')), 1)]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", {
      class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(["fwum-edit-list__address", {
        'is-off': !target.enabled
      }])
    }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", TargetPanelvue_type_template_id_096a911e_hoisted_20, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.addressOf(target)), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", TargetPanelvue_type_template_id_096a911e_hoisted_21, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.kindLabel(target.kind, target.targetKey)) + ", " + Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.sourceLabel(target.urlSource)), 1)], 2), _ctx.editing !== target.targetKey && _ctx.removing !== target.targetKey ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", TargetPanelvue_type_template_id_096a911e_hoisted_22, [target.url !== null ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("button", {
      key: 0,
      type: "button",
      class: "btn-flat fwum-icon-only",
      "data-fwum-focus": "change",
      title: _ctx.translate('FeinwerkUptimeMonitor_UiChange'),
      "aria-label": `${_ctx.translate('FeinwerkUptimeMonitor_UiChange')}: ${target.url}`,
      onClick: $event => _ctx.startEdit(target)
    }, TargetPanelvue_type_template_id_096a911e_hoisted_25, 8, TargetPanelvue_type_template_id_096a911e_hoisted_23)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), target.urlSource !== 'default' ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("button", {
      key: 1,
      type: "button",
      class: "btn-flat fwum-icon-only",
      title: _ctx.translate('FeinwerkUptimeMonitor_UiDelete'),
      "aria-label": `${_ctx.translate('FeinwerkUptimeMonitor_UiDelete')}: ${target.url}`,
      disabled: _ctx.busy,
      onClick: $event => _ctx.startRemove(target)
    }, TargetPanelvue_type_template_id_096a911e_hoisted_28, 8, TargetPanelvue_type_template_id_096a911e_hoisted_26)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)]), _ctx.editing === target.targetKey ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", TargetPanelvue_type_template_id_096a911e_hoisted_29, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withDirectives"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("input", {
      "onUpdate:modelValue": _cache[2] || (_cache[2] = $event => _ctx.draftUrl = $event),
      type: "url",
      class: "browser-default fwum-input",
      "data-fwum-focus": "url",
      "aria-label": _ctx.translate('FeinwerkUptimeMonitor_UiUrl'),
      "aria-invalid": _ctx.draftUrl !== '' && !_ctx.validUrl(_ctx.draftUrl),
      onKeydown: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withKeys"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withModifiers"])($event => _ctx.validUrl(_ctx.draftUrl) && _ctx.saveUrl(target), ["prevent"]), ["enter"])
    }, null, 40, TargetPanelvue_type_template_id_096a911e_hoisted_30), [[external_commonjs_vue_commonjs2_vue_root_Vue_["vModelText"], _ctx.draftUrl]]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("button", {
      type: "button",
      class: "btn-flat",
      disabled: _ctx.busy || !_ctx.validUrl(_ctx.draftUrl),
      onClick: $event => _ctx.saveUrl(target)
    }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiSave')), 9, TargetPanelvue_type_template_id_096a911e_hoisted_31), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("button", {
      type: "button",
      class: "btn-flat",
      onClick: $event => _ctx.cancel(target.targetKey)
    }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiCancel')), 9, TargetPanelvue_type_template_id_096a911e_hoisted_32), _ctx.draftUrl !== '' && !_ctx.validUrl(_ctx.draftUrl) ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("p", TargetPanelvue_type_template_id_096a911e_hoisted_33, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_ErrorUrl')), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)])) : _ctx.removing === target.targetKey ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", TargetPanelvue_type_template_id_096a911e_hoisted_34, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiRemoveConfirm', target.url || '')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("button", {
      type: "button",
      class: "btn-flat",
      "data-fwum-focus": "confirm",
      disabled: _ctx.busy,
      onClick: $event => _ctx.remove(target)
    }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiDelete')), 9, TargetPanelvue_type_template_id_096a911e_hoisted_35), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("button", {
      type: "button",
      class: "btn-flat",
      onClick: $event => _ctx.cancel(target.targetKey)
    }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiCancel')), 9, TargetPanelvue_type_template_id_096a911e_hoisted_36)])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.error && _ctx.errorAt === target.targetKey ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("p", TargetPanelvue_type_template_id_096a911e_hoisted_37, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.error), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)], 8, TargetPanelvue_type_template_id_096a911e_hoisted_15);
  }), 128))])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.idSite > 0 ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("form", {
    key: 6,
    class: "fwum-add",
    onSubmit: _cache[5] || (_cache[5] = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withModifiers"])((...args) => _ctx.add && _ctx.add(...args), ["prevent"]))
  }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("h3", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiAdd')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", TargetPanelvue_type_template_id_096a911e_hoisted_38, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withDirectives"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("select", {
    "onUpdate:modelValue": _cache[3] || (_cache[3] = $event => _ctx.newKind = $event),
    class: "browser-default fwum-select",
    "aria-label": _ctx.translate('FeinwerkUptimeMonitor_UiAddKind')
  }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("option", TargetPanelvue_type_template_id_096a911e_hoisted_40, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiAddWeb')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("option", TargetPanelvue_type_template_id_096a911e_hoisted_41, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiKind_proxy')), 1)], 8, TargetPanelvue_type_template_id_096a911e_hoisted_39), [[external_commonjs_vue_commonjs2_vue_root_Vue_["vModelSelect"], _ctx.newKind]]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withDirectives"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("input", {
    "onUpdate:modelValue": _cache[4] || (_cache[4] = $event => _ctx.newUrl = $event),
    type: "url",
    class: "browser-default fwum-input",
    placeholder: "https://",
    "aria-label": _ctx.translate('FeinwerkUptimeMonitor_UiUrl'),
    "aria-invalid": _ctx.newUrl !== '' && !_ctx.validUrl(_ctx.newUrl)
  }, null, 8, TargetPanelvue_type_template_id_096a911e_hoisted_42), [[external_commonjs_vue_commonjs2_vue_root_Vue_["vModelText"], _ctx.newUrl]]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("button", {
    type: "submit",
    class: "btn-flat",
    disabled: _ctx.busy || !_ctx.validUrl(_ctx.newUrl)
  }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiAdd')), 9, TargetPanelvue_type_template_id_096a911e_hoisted_43)]), _ctx.newUrl !== '' && _ctx.newUrl !== 'https://' && !_ctx.validUrl(_ctx.newUrl) ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("p", TargetPanelvue_type_template_id_096a911e_hoisted_44, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_ErrorUrl')), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.error && _ctx.errorAt === 'add' ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("p", TargetPanelvue_type_template_id_096a911e_hoisted_45, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.error), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)], 32)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", TargetPanelvue_type_template_id_096a911e_hoisted_46, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("button", {
    type: "button",
    class: "btn",
    disabled: _ctx.busy,
    onClick: _cache[6] || (_cache[6] = (...args) => _ctx.done && _ctx.done(...args))
  }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiDone')), 9, TargetPanelvue_type_template_id_096a911e_hoisted_47)])], 8, TargetPanelvue_type_template_id_096a911e_hoisted_1)]);
}
// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/TargetPanel.vue?vue&type=template&id=096a911e

// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-typescript/node_modules/cache-loader/dist/cjs.js??ref--15-0!./node_modules/babel-loader/lib!./node_modules/@vue/cli-plugin-typescript/node_modules/ts-loader??ref--15-2!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--1-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--1-1!./plugins/FeinwerkUptimeMonitor/vue/src/TargetPanel.vue?vue&type=script&lang=ts




/* harmony default export */ var TargetPanelvue_type_script_lang_ts = (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["defineComponent"])({
  props: {
    idSite: {
      type: Number,
      required: true
    },
    /** the website's name for the title ("Check targets: <name>") */
    siteName: {
      type: String,
      default: ''
    },
    /**
     * UI review of 5.4.0, L9: one muted line at the top while the checks send nothing (Matomo's
     * internet features off), which also leaves the suggestions empty; the opener picks the words
     */
    notice: {
      type: String,
      default: ''
    }
  },
  emits: ['close'],
  data() {
    return {
      targets: [],
      suggestions: [],
      busy: false,
      loading: true,
      loadFailed: false,
      removing: '',
      changed: false,
      error: '',
      /** where the error shows: '' at the top, 'add' under the add row, else a target's row */
      errorAt: '',
      editing: '',
      draftUrl: '',
      newKind: 'web',
      newUrl: '',
      opener: null,
      titleId: `fwum-panel-${Math.random().toString(36).slice(2, 8)}`,
      /** where the focus goes once the list is back after a change: [target key, control] */
      focusAfter: null,
      bodyOverflow: ''
    };
  },
  computed: {
    /** an error shows next to its row or the add row; at the top when that is not there */
    errorOnTop() {
      if (this.errorAt === 'add') {
        return this.idSite <= 0;
      }
      return this.errorAt === '' || !this.targets.some(t => t.targetKey === this.errorAt);
    }
  },
  mounted() {
    this.opener = document.activeElement;
    this.$refs.panel.focus();
    // on the document: a control that disappears (Change, Remove, Save) leaves the focus on the
    // body, where keys on the panel element would no longer arrive
    document.addEventListener('keydown', this.onKey);
    this.bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    this.load();
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.onKey);
    document.body.style.overflow = this.bodyOverflow;
  },
  methods: {
    translate: external_CoreHome_["translate"],
    load() {
      this.loadFailed = false;
      api.targets(this.idSite).then(answer => {
        this.targets = answer.targets.filter(t => t.kind !== 'processing');
        this.suggestions = answer.suggestions;
      }).catch(() => {
        this.loadFailed = true;
      }).finally(() => {
        this.loading = false;
        this.restoreFocus();
      });
    },
    /** Moves the focus to a control of a target's row, or to the panel when that row is gone. */
    focusRow(key, control) {
      this.$nextTick(() => {
        const panel = this.$refs.panel;
        if (!panel) {
          return;
        }
        const row = Array.from(panel.querySelectorAll('[data-fwum-key]')).find(li => li.dataset.fwumKey === key);
        const target = (row === null || row === void 0 ? void 0 : row.querySelector(`[data-fwum-focus="${control}"]`)) || (row === null || row === void 0 ? void 0 : row.querySelector('[data-fwum-focus="toggle"]'));
        (target || panel).focus();
      });
    },
    restoreFocus() {
      const panel = this.$refs.panel;
      if (this.focusAfter) {
        const [key, control] = this.focusAfter;
        this.focusAfter = null;
        this.focusRow(key, control);
      } else if (panel && !panel.contains(document.activeElement)) {
        panel.focus();
      }
    },
    startRemove(target) {
      this.removing = target.targetKey;
      this.focusRow(target.targetKey, 'confirm');
    },
    cancel(key) {
      this.editing = '';
      this.removing = '';
      this.focusRow(key, 'change');
    },
    /**
     * "Done" never drops what was typed: a valid address in the add row or an open change is saved
     * first, an invalid one keeps the panel open with its message next to the field.
     */
    done() {
      const typed = this.newUrl.trim() !== '' && this.newUrl.trim() !== 'https://';
      const target = this.targets.find(t => t.targetKey === this.editing);
      const changed = target !== undefined && this.draftUrl.trim() !== (target.url || '');
      if (typed && !this.validUrl(this.newUrl) || changed && !this.validUrl(this.draftUrl)) {
        return;
      }
      const saves = [];
      // the first save that fails says where its message shows
      let failedAt = null;
      const at = where => e => {
        failedAt = failedAt !== null && failedAt !== void 0 ? failedAt : where;
        throw e;
      };
      if (changed && target) {
        saves.push(api.updateTarget(this.idSite, target.targetKey, this.draftUrl.trim(), '').catch(at(target.targetKey)));
      }
      if (typed && this.idSite > 0) {
        saves.push(api.addTarget(this.idSite, this.newKind, this.newUrl.trim()).catch(at('add')));
      }
      if (!saves.length) {
        this.close();
        return;
      }
      this.busy = true;
      this.error = '';
      Promise.all(saves).then(() => {
        this.changed = true;
        this.close();
      }).catch(e => {
        this.showError(e, failedAt !== null && failedAt !== void 0 ? failedAt : '');
        this.load();
      }).finally(() => {
        this.busy = false;
      });
    },
    onKey(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        // first out of an open change or removal, then out of the panel
        const open = this.editing || this.removing;
        if (open) {
          this.cancel(open);
        } else {
          this.close();
        }
      } else if (event.key === 'Tab') {
        this.trap(event);
      }
    },
    /**
     * @param focus after success: [target key, control] to focus once the list is back
     * @param where where a failure shows: '' at the top, 'add' under the add row, or a target key
     */
    run(request, focus = null, where = '') {
      this.busy = true;
      this.error = '';
      request.then(() => {
        this.changed = true;
        this.editing = '';
        this.removing = '';
        this.focusAfter = focus;
        this.load();
      }).catch(e => {
        this.showError(e, where);
        this.$nextTick(() => this.restoreFocus());
      }).finally(() => {
        this.busy = false;
      });
    },
    showError(e, where) {
      // the API escapes its messages for XML (&amp;, &quot;): show them as text
      const box = document.createElement('textarea');
      box.innerHTML = errorText(e);
      this.error = box.value;
      this.errorAt = where;
    },
    /** the address as the row shows it, also in the switch's name */
    addressOf(target) {
      return target.url || this.kindLabel(target.kind, target.targetKey);
    },
    toggle(target, event) {
      const box = event && event.target instanceof HTMLInputElement ? event.target : null;
      this.run(api.updateTarget(this.idSite, target.targetKey, '', target.enabled ? '0' : '1').catch(e => {
        // not saved: the box shows the saved state again, like its On/Off
        if (box) {
          box.checked = target.enabled;
        }
        throw e;
      }), [target.targetKey, 'toggle'], target.targetKey);
    },
    startEdit(target) {
      this.editing = target.targetKey;
      this.draftUrl = target.url || '';
      this.focusRow(target.targetKey, 'url');
    },
    saveUrl(target) {
      this.run(api.updateTarget(this.idSite, target.targetKey, this.draftUrl.trim(), ''), [target.targetKey, 'change'], target.targetKey);
    },
    remove(target) {
      this.run(api.deleteTarget(this.idSite, target.targetKey), null, target.targetKey);
    },
    add() {
      if (!this.validUrl(this.newUrl)) {
        return;
      }
      this.run(api.addTarget(this.idSite, this.newKind, this.newUrl.trim()).then(row => {
        this.newUrl = '';
        return row;
      }), null, 'add');
    },
    /** http or https with a host: a missing scheme gets the friendly text at once */
    validUrl(value) {
      return /^https?:\/\/[^\s/?#]+/i.test(value.trim());
    },
    canAdopt(suggestion) {
      return suggestion.idSite === this.idSite && ['web', 'proxy', 'ui', 'tracker', 'js'].includes(suggestion.kind);
    },
    adopt(suggestion) {
      this.run(this.idSite === 0 ? api.updateTarget(0, suggestion.key, suggestion.url, '') : api.addTarget(this.idSite, suggestion.kind, suggestion.url));
    },
    kindLabel(kind, key) {
      if (kind === 'container') {
        return Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiKind_container', key.replace('ctr:', ''));
      }
      return Object(external_CoreHome_["translate"])(`FeinwerkUptimeMonitor_UiKind_${kind}`);
    },
    sourceLabel(source) {
      return Object(external_CoreHome_["translate"])(`FeinwerkUptimeMonitor_UiSource_${source}`);
    },
    /** Keeps the focus inside the panel while it is open. */
    trap(event) {
      const panel = this.$refs.panel;
      const items = Array.from(panel.querySelectorAll('button:not([disabled]), input:not([disabled]), select, [href]'));
      if (!items.length) {
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      // also when the panel itself or nothing in it has the focus (right after it opened, or
      // after a control vanished)
      if (document.activeElement === panel || !panel.contains(document.activeElement)) {
        (event.shiftKey ? last : first).focus();
        event.preventDefault();
      } else if (event.shiftKey && document.activeElement === first) {
        last.focus();
        event.preventDefault();
      } else if (!event.shiftKey && document.activeElement === last) {
        first.focus();
        event.preventDefault();
      }
    },
    close() {
      this.$emit('close', this.changed);
      if (this.opener) {
        this.opener.focus();
      }
    }
  }
}));
// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/TargetPanel.vue?vue&type=script&lang=ts
 
// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/TargetPanel.vue



TargetPanelvue_type_script_lang_ts.render = TargetPanelvue_type_template_id_096a911e_render

/* harmony default export */ var TargetPanel = (TargetPanelvue_type_script_lang_ts);
// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-babel/node_modules/cache-loader/dist/cjs.js??ref--13-0!./node_modules/@vue/cli-plugin-babel/node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist/templateLoader.js??ref--6!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--1-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--1-1!./plugins/FeinwerkUptimeMonitor/vue/src/FeedbackBar.vue?vue&type=template&id=d0e8184e

const FeedbackBarvue_type_template_id_d0e8184e_hoisted_1 = ["title"];
const FeedbackBarvue_type_template_id_d0e8184e_hoisted_2 = ["title", "aria-label", "aria-pressed", "disabled", "onClick"];
const FeedbackBarvue_type_template_id_d0e8184e_hoisted_3 = ["d"];
const FeedbackBarvue_type_template_id_d0e8184e_hoisted_4 = {
  class: "fwum-feedback__thanks",
  role: "status"
};
const FeedbackBarvue_type_template_id_d0e8184e_hoisted_5 = ["href", "title"];
const FeedbackBarvue_type_template_id_d0e8184e_hoisted_6 = {
  viewBox: "0 0 24 24",
  width: "14",
  height: "14",
  "aria-hidden": "true",
  focusable: "false"
};
const FeedbackBarvue_type_template_id_d0e8184e_hoisted_7 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("circle", {
  cx: "12",
  cy: "12",
  r: "9"
}, null, -1);
const FeedbackBarvue_type_template_id_d0e8184e_hoisted_8 = ["d"];
function FeedbackBarvue_type_template_id_d0e8184e_render(_ctx, _cache, $props, $setup, $data, $options) {
  return _ctx.feedback.enabled || _ctx.feedback.supportUrl ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", {
    key: 0,
    class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(["fwum-feedback", {
      'is-voted': _ctx.vote !== ''
    }])
  }, [_ctx.feedback.enabled ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], {
    key: 0
  }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
    class: "fwum-feedback__question",
    title: _ctx.question
  }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.question), 9, FeedbackBarvue_type_template_id_d0e8184e_hoisted_1), (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderList"])(_ctx.choices, choice => {
    return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("button", {
      key: choice,
      type: "button",
      class: "fwum-feedback__thumb",
      title: _ctx.label(choice),
      "aria-label": _ctx.label(choice),
      "aria-pressed": _ctx.vote === choice ? 'true' : 'false',
      disabled: _ctx.vote !== '',
      onClick: $event => _ctx.send(choice)
    }, [(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("svg", {
      viewBox: "0 0 24 24",
      width: "14",
      height: "14",
      "aria-hidden": "true",
      class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(`fwum-feedback__icon--${choice}`)
    }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("path", {
      d: _ctx.thumbPath
    }, null, 8, FeedbackBarvue_type_template_id_d0e8184e_hoisted_3)], 2))], 8, FeedbackBarvue_type_template_id_d0e8184e_hoisted_2);
  }), 128)), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", FeedbackBarvue_type_template_id_d0e8184e_hoisted_4, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.thanks), 1)], 64)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.feedback.supportUrl ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("a", {
    key: 1,
    class: "fwum-feedback__support",
    href: _ctx.feedback.supportUrl,
    target: "_blank",
    rel: "noopener noreferrer",
    title: _ctx.tr('SupportTitle')
  }, [(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("svg", FeedbackBarvue_type_template_id_d0e8184e_hoisted_6, [FeedbackBarvue_type_template_id_d0e8184e_hoisted_7, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("path", {
    d: _ctx.helpPath
  }, null, 8, FeedbackBarvue_type_template_id_d0e8184e_hoisted_8)])), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.tr('Support')), 1)], 8, FeedbackBarvue_type_template_id_d0e8184e_hoisted_5)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)], 2)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true);
}
// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/FeedbackBar.vue?vue&type=template&id=d0e8184e

// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-typescript/node_modules/cache-loader/dist/cjs.js??ref--15-0!./node_modules/babel-loader/lib!./node_modules/@vue/cli-plugin-typescript/node_modules/ts-loader??ref--15-2!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--1-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--1-1!./plugins/FeinwerkUptimeMonitor/vue/src/FeedbackBar.vue?vue&type=script&lang=ts


const PLUGIN = 'FeinwerkUptimeMonitor';
/** a thumb outline (24 x 24); the down thumb is the same, rotated */
const THUMB_PATH = 'M3 10h4v10H3zM7 10l4-7c1.3 0 2.2 1.1 2 2.4L12.4 9H19a2 2 0 0 1 2 2.3l-1.2 7A2 2 0 0 1 17.8 20H7';
/** localStorage: this browser's vote per question and plugin version (a convenience only) */
function storageKey(topic) {
  return `${PLUGIN}.feedback.${topic}`;
}
function storedVote(topic, version) {
  try {
    const stored = JSON.parse(window.localStorage.getItem(storageKey(topic)) || '{}');
    return stored.version === version && (stored.vote === 'up' || stored.vote === 'down') ? stored.vote : '';
  } catch (e) {
    return '';
  }
}
/* harmony default export */ var FeedbackBarvue_type_script_lang_ts = (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["defineComponent"])({
  props: {
    idSite: {
      type: Number,
      required: true
    },
    /** the store "topic": one of the plugin's PluginFeedback::TOPICS */
    topic: {
      type: String,
      required: true
    },
    /** the question, already translated */
    question: {
      type: String,
      required: true
    },
    feedback: {
      type: Object,
      default: () => ({
        enabled: false,
        supportUrl: '',
        version: ''
      })
    }
  },
  data() {
    return {
      vote: storedVote(this.topic, this.feedback.version)
    };
  },
  computed: {
    choices() {
      return ['up', 'down'];
    },
    thumbPath() {
      return THUMB_PATH;
    },
    helpPath() {
      return 'M9.6 9.3a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.2-2.4 3.6M12 17h.01';
    },
    thanks() {
      if (this.vote === '') {
        return '';
      }
      return this.vote === 'up' ? this.tr('FeedbackThanks') : this.tr('FeedbackThanksDown');
    }
  },
  methods: {
    tr(key) {
      return Object(external_CoreHome_["translate"])(`${PLUGIN}_${key}`);
    },
    label(choice) {
      return choice === 'up' ? this.tr('FeedbackYes') : this.tr('FeedbackNo');
    },
    send(vote) {
      this.vote = vote;
      try {
        const stored = {
          version: this.feedback.version,
          vote
        };
        window.localStorage.setItem(storageKey(this.topic), JSON.stringify(stored));
      } catch (e) {
        // private mode or blocked storage: the thanks is shown anyway
      }
      // Best effort: the vote is a hint for Feinwerk, a failed request needs no error message.
      external_CoreHome_["AjaxHelper"].post({
        method: `${PLUGIN}.sendFeedback`,
        idSite: this.idSite
      }, {
        topic: this.topic,
        vote
      }, {
        createErrorNotification: false
      }).catch(() => undefined);
    }
  }
}));
// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/FeedbackBar.vue?vue&type=script&lang=ts
 
// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/FeedbackBar.vue



FeedbackBarvue_type_script_lang_ts.render = FeedbackBarvue_type_template_id_d0e8184e_render

/* harmony default export */ var FeedbackBar = (FeedbackBarvue_type_script_lang_ts);
// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-babel/node_modules/cache-loader/dist/cjs.js??ref--13-0!./node_modules/@vue/cli-plugin-babel/node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist/templateLoader.js??ref--6!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--1-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--1-1!./plugins/FeinwerkUptimeMonitor/vue/src/PromoLine.vue?vue&type=template&id=4ad4bd9a

const PromoLinevue_type_template_id_4ad4bd9a_hoisted_1 = ["data-fwpromo-id", "data-fwpromo-days", "data-fwpromo-demo"];
const PromoLinevue_type_template_id_4ad4bd9a_hoisted_2 = ["title"];
const PromoLinevue_type_template_id_4ad4bd9a_hoisted_3 = ["href", "target", "rel", "title"];
const PromoLinevue_type_template_id_4ad4bd9a_hoisted_4 = {
  class: "fwpromo-line__link-full"
};
const PromoLinevue_type_template_id_4ad4bd9a_hoisted_5 = {
  class: "fwpromo-line__link-short"
};
const PromoLinevue_type_template_id_4ad4bd9a_hoisted_6 = ["title", "aria-label"];
const PromoLinevue_type_template_id_4ad4bd9a_hoisted_7 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
  "aria-hidden": "true"
}, "×", -1);
const PromoLinevue_type_template_id_4ad4bd9a_hoisted_8 = [PromoLinevue_type_template_id_4ad4bd9a_hoisted_7];
function PromoLinevue_type_template_id_4ad4bd9a_render(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_FeinwerkLogo = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("FeinwerkLogo");
  return _ctx.promo ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", {
    key: 0,
    class: "fwpromo-line",
    "data-fwpromo-id": _ctx.promo.id,
    "data-fwpromo-placement": "line",
    "data-fwpromo-days": _ctx.promo.dismissDays,
    "data-fwpromo-demo": _ctx.promo.demo ? '1' : undefined
  }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createVNode"])(_component_FeinwerkLogo), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
    class: "fwpromo-line__text",
    title: _ctx.promo.text
  }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.promo.text), 9, PromoLinevue_type_template_id_4ad4bd9a_hoisted_2), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("a", {
    class: "fwpromo-line__link",
    href: _ctx.promo.url,
    target: _ctx.promo.external === false ? undefined : '_blank',
    rel: _ctx.promo.external === false ? undefined : 'noopener',
    title: _ctx.linkTitle || undefined
  }, [_ctx.promo.linkShort ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], {
    key: 0
  }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", PromoLinevue_type_template_id_4ad4bd9a_hoisted_4, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.promo.link), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", PromoLinevue_type_template_id_4ad4bd9a_hoisted_5, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.promo.linkShort), 1)], 64)) : (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], {
    key: 1
  }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.promo.link), 1)], 64))], 8, PromoLinevue_type_template_id_4ad4bd9a_hoisted_3), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("button", {
    type: "button",
    class: "fwpromo-line__dismiss fwpromo-dismiss",
    title: _ctx.dismissLabel,
    "aria-label": _ctx.dismissLabel
  }, PromoLinevue_type_template_id_4ad4bd9a_hoisted_8, 8, PromoLinevue_type_template_id_4ad4bd9a_hoisted_6)], 8, PromoLinevue_type_template_id_4ad4bd9a_hoisted_1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true);
}
// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/PromoLine.vue?vue&type=template&id=4ad4bd9a

// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-babel/node_modules/cache-loader/dist/cjs.js??ref--13-0!./node_modules/@vue/cli-plugin-babel/node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist/templateLoader.js??ref--6!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--1-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--1-1!./plugins/FeinwerkUptimeMonitor/vue/src/FeinwerkLogo.vue?vue&type=template&id=d998d00c

const FeinwerkLogovue_type_template_id_d998d00c_hoisted_1 = {
  class: "fwlogo",
  "aria-hidden": "true"
};
const FeinwerkLogovue_type_template_id_d998d00c_hoisted_2 = {
  class: "fwlogo__mark",
  viewBox: "0 0 48 48",
  width: "18",
  height: "18",
  focusable: "false"
};
const FeinwerkLogovue_type_template_id_d998d00c_hoisted_3 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("circle", {
  class: "fwlogo__core",
  cx: "24",
  cy: "24",
  r: "5.4"
}, null, -1);
const FeinwerkLogovue_type_template_id_d998d00c_hoisted_4 = ["opacity"];
const FeinwerkLogovue_type_template_id_d998d00c_hoisted_5 = ["cx", "cy", "r"];
const FeinwerkLogovue_type_template_id_d998d00c_hoisted_6 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
  class: "fwlogo__word"
}, [/*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])("feinwerk"), /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
  class: "fwlogo__sub"
}, " plugins")], -1);
function FeinwerkLogovue_type_template_id_d998d00c_render(_ctx, _cache, $props, $setup, $data, $options) {
  return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", FeinwerkLogovue_type_template_id_d998d00c_hoisted_1, [(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("svg", FeinwerkLogovue_type_template_id_d998d00c_hoisted_2, [FeinwerkLogovue_type_template_id_d998d00c_hoisted_3, (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderList"])(_ctx.LOGO_RINGS, ring => {
    return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("g", {
      key: ring.opacity,
      class: "fwlogo__dots",
      opacity: ring.opacity
    }, [(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderList"])(ring.dots, ([cx, cy], n) => {
      return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("circle", {
        key: n,
        cx: cx,
        cy: cy,
        r: ring.r
      }, null, 8, FeinwerkLogovue_type_template_id_d998d00c_hoisted_5);
    }), 128))], 8, FeinwerkLogovue_type_template_id_d998d00c_hoisted_4);
  }), 128))])), FeinwerkLogovue_type_template_id_d998d00c_hoisted_6]);
}
// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/FeinwerkLogo.vue?vue&type=template&id=d998d00c

// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-typescript/node_modules/cache-loader/dist/cjs.js??ref--15-0!./node_modules/babel-loader/lib!./node_modules/@vue/cli-plugin-typescript/node_modules/ts-loader??ref--15-2!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--1-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--1-1!./plugins/FeinwerkUptimeMonitor/vue/src/FeinwerkLogo.vue?vue&type=script&lang=ts

/** the dots of the store's feinwerk-plugins-mark.svg, as in the kit's _feinwerkLogo.twig */
const LOGO_RINGS = [{
  opacity: '0.9',
  r: '2.9',
  dots: [[16, 24], [32, 24], [24, 16], [24, 32]]
}, {
  opacity: '0.55',
  r: '2.5',
  dots: [[16, 16], [32, 16], [16, 32], [32, 32]]
}, {
  opacity: '0.35',
  r: '2.1',
  dots: [[8, 24], [40, 24], [24, 8], [24, 40]]
}];
/* harmony default export */ var FeinwerkLogovue_type_script_lang_ts = (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["defineComponent"])({
  data() {
    return {
      LOGO_RINGS
    };
  }
}));
// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/FeinwerkLogo.vue?vue&type=script&lang=ts
 
// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/FeinwerkLogo.vue



FeinwerkLogovue_type_script_lang_ts.render = FeinwerkLogovue_type_template_id_d998d00c_render

/* harmony default export */ var FeinwerkLogo = (FeinwerkLogovue_type_script_lang_ts);
// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-typescript/node_modules/cache-loader/dist/cjs.js??ref--15-0!./node_modules/babel-loader/lib!./node_modules/@vue/cli-plugin-typescript/node_modules/ts-loader??ref--15-2!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--1-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--1-1!./plugins/FeinwerkUptimeMonitor/vue/src/PromoLine.vue?vue&type=script&lang=ts


/* harmony default export */ var PromoLinevue_type_script_lang_ts = (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["defineComponent"])({
  components: {
    FeinwerkLogo: FeinwerkLogo
  },
  props: {
    promo: {
      type: Object,
      default: null
    },
    dismissLabel: {
      type: String,
      required: true
    }
  },
  computed: {
    /** as templates/_promo.twig: with a short form the full link leads the title, then the note */
    linkTitle() {
      if (!this.promo) {
        return '';
      }
      const note = this.promo.note || '';
      if (!this.promo.linkShort) {
        return note;
      }
      return note ? `${this.promo.link}. ${note}` : this.promo.link;
    }
  }
}));
// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/PromoLine.vue?vue&type=script&lang=ts
 
// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/PromoLine.vue



PromoLinevue_type_script_lang_ts.render = PromoLinevue_type_template_id_4ad4bd9a_render

/* harmony default export */ var PromoLine = (PromoLinevue_type_script_lang_ts);
// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-babel/node_modules/cache-loader/dist/cjs.js??ref--13-0!./node_modules/@vue/cli-plugin-babel/node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist/templateLoader.js??ref--6!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--1-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--1-1!./plugins/FeinwerkUptimeMonitor/vue/src/PromoCard.vue?vue&type=template&id=78be3300

const PromoCardvue_type_template_id_78be3300_hoisted_1 = {
  ref: "slot",
  class: "fwum-promo-card-slot"
};
function PromoCardvue_type_template_id_78be3300_render(_ctx, _cache, $props, $setup, $data, $options) {
  return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", PromoCardvue_type_template_id_78be3300_hoisted_1, null, 512);
}
// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/PromoCard.vue?vue&type=template&id=78be3300

// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-typescript/node_modules/cache-loader/dist/cjs.js??ref--15-0!./node_modules/babel-loader/lib!./node_modules/@vue/cli-plugin-typescript/node_modules/ts-loader??ref--15-2!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--1-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--1-1!./plugins/FeinwerkUptimeMonitor/vue/src/PromoCard.vue?vue&type=script&lang=ts

/** the dashboard's one card place, shared by every Feinwerk plugin */
const PLACE = 'card';
const SVG = 'http://www.w3.org/2000/svg';
function PromoCardvue_type_script_lang_ts_element(tag, attributes = {}, text = '') {
  const node = document.createElement(tag);
  Object.keys(attributes).forEach(name => node.setAttribute(name, attributes[name]));
  if (text !== '') {
    node.textContent = text;
  }
  return node;
}
function svgElement(tag, attributes) {
  const node = document.createElementNS(SVG, tag);
  Object.keys(attributes).forEach(name => node.setAttribute(name, attributes[name]));
  return node;
}
/** the kit's card mark */
function PromoCardvue_type_script_lang_ts_mark() {
  const box = PromoCardvue_type_script_lang_ts_element('span', {
    class: 'fwpromo-card__mark'
  });
  const svg = svgElement('svg', {
    viewBox: '0 0 32 32',
    'aria-hidden': 'true',
    focusable: 'false'
  });
  svg.appendChild(svgElement('rect', {
    width: '32',
    height: '32',
    rx: '7',
    fill: '#0e3b3a'
  }));
  const dots = svgElement('g', {
    fill: '#9fd8d2'
  });
  [['16', '8.6'], ['8.6', '16'], ['23.4', '16'], ['16', '23.4']].forEach(([cx, cy]) => {
    dots.appendChild(svgElement('circle', {
      cx,
      cy,
      r: '2.5'
    }));
  });
  svg.appendChild(dots);
  svg.appendChild(svgElement('circle', {
    cx: '16',
    cy: '16',
    r: '4.3',
    fill: '#8ee6c8'
  }));
  box.appendChild(svg);
  return box;
}
/** one card as in the kit's template */
function cardNode(card, dismissLabel) {
  const attributes = {
    class: 'fwpromo-card',
    'data-fwpromo-id': card.id,
    'data-fwpromo-days': String(card.days)
  };
  if (card.demo) {
    attributes['data-fwpromo-demo'] = '1';
  }
  const node = PromoCardvue_type_script_lang_ts_element('div', attributes);
  node.appendChild(PromoCardvue_type_script_lang_ts_mark());
  const body = PromoCardvue_type_script_lang_ts_element('span', {
    class: 'fwpromo-card__body'
  });
  body.appendChild(PromoCardvue_type_script_lang_ts_element('strong', {}, card.name));
  if (card.text) {
    body.appendChild(PromoCardvue_type_script_lang_ts_element('span', {
      title: card.text
    }, card.text));
  }
  node.appendChild(body);
  const link = {
    class: 'fwpromo-card__link'
  };
  // the server's store or Matomo link; never a script URL
  if (!/^\s*javascript:/i.test(card.url)) {
    link.href = card.url;
  }
  if (card.external !== false) {
    link.target = '_blank';
    link.rel = 'noopener';
  }
  if (card.title) {
    link.title = card.title;
  }
  node.appendChild(PromoCardvue_type_script_lang_ts_element('a', link, card.link));
  const close = PromoCardvue_type_script_lang_ts_element('button', {
    type: 'button',
    class: 'fwpromo-card__close',
    'data-fwpromo-close': '',
    title: dismissLabel,
    'aria-label': dismissLabel
  });
  close.appendChild(PromoCardvue_type_script_lang_ts_element('span', {
    'aria-hidden': 'true'
  }, '×'));
  node.appendChild(close);
  return node;
}
/**
 * The kit's group: a pausable place (an x empties it for pauseDays) or, in demo mode, a plain
 * rotation; only on a dashboard; the card waits in an inert template.
 */
function groupNode(card, dismissLabel) {
  const group = PromoCardvue_type_script_lang_ts_element('div', {
    class: 'fwpromo-rotation'
  });
  if (card.pauseDays > 0) {
    group.setAttribute('data-fwpromo-pausable', PLACE);
    group.setAttribute('data-fwpromo-pause', PLACE);
    group.setAttribute('data-fwpromo-pause-days', String(card.pauseDays));
  } else {
    group.setAttribute('data-fwpromo-rotation', PLACE);
  }
  group.setAttribute('data-fwpromo-only-in', 'dashboard');
  const template = document.createElement('template');
  template.content.appendChild(cardNode(card, dismissLabel));
  group.appendChild(template);
  return group;
}
/* harmony default export */ var PromoCardvue_type_script_lang_ts = (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["defineComponent"])({
  props: {
    card: {
      type: Object,
      default: null
    },
    dismissLabel: {
      type: String,
      required: true
    }
  },
  watch: {
    card: {
      handler() {
        this.build();
      },
      deep: true
    }
  },
  mounted() {
    this.build();
  },
  methods: {
    /** Empties the slot, then adds the whole group at once: the kit's observer sees it complete. */
    build() {
      const slot = this.$refs.slot;
      if (!slot) {
        return;
      }
      while (slot.firstChild) {
        slot.removeChild(slot.firstChild);
      }
      if (this.card) {
        slot.appendChild(groupNode(this.card, this.dismissLabel));
      }
    }
  }
}));
// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/PromoCard.vue?vue&type=script&lang=ts
 
// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/PromoCard.vue



PromoCardvue_type_script_lang_ts.render = PromoCardvue_type_template_id_78be3300_render

/* harmony default export */ var PromoCard = (PromoCardvue_type_script_lang_ts);
// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-babel/node_modules/cache-loader/dist/cjs.js??ref--13-0!./node_modules/@vue/cli-plugin-babel/node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist/templateLoader.js??ref--6!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--1-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--1-1!./plugins/FeinwerkUptimeMonitor/vue/src/HourStrip.vue?vue&type=template&id=1881b5ec

const HourStripvue_type_template_id_1881b5ec_hoisted_1 = ["aria-label"];
const HourStripvue_type_template_id_1881b5ec_hoisted_2 = ["tabindex", "onMouseenter", "onFocus"];
const HourStripvue_type_template_id_1881b5ec_hoisted_3 = {
  class: "fwum-sr"
};
const HourStripvue_type_template_id_1881b5ec_hoisted_4 = {
  key: 1,
  class: "fwum-strip__axis",
  "aria-hidden": "true"
};
function HourStripvue_type_template_id_1881b5ec_render(_ctx, _cache, $props, $setup, $data, $options) {
  return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", {
    class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(["fwum-strip", {
      'fwum-strip--small': _ctx.small,
      'fwum-strip--lane': _ctx.lane
    }])
  }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("ol", {
    ref: "list",
    class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(["fwum-strip__cells", {
      'is-dense': _ctx.cells.length > 62
    }]),
    "aria-label": _ctx.listLabel,
    onKeydown: _cache[1] || (_cache[1] = (...args) => _ctx.onKey && _ctx.onKey(...args)),
    onMouseleave: _cache[2] || (_cache[2] = $event => _ctx.hover = -1)
  }, [(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderList"])(_ctx.cells, (cell, i) => {
    return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("li", {
      key: cell.time,
      class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(["fwum-strip__cell", [`is-${cell.state}`, {
        'is-next': i === _ctx.lastPast + 1 && _ctx.lastPast >= 0
      }]]),
      tabindex: cell.state === 'future' ? undefined : i === _ctx.tabIndexCell ? 0 : -1,
      onMouseenter: $event => _ctx.show(i, $event),
      onFocus: $event => _ctx.onFocus(i, $event),
      onBlur: _cache[0] || (_cache[0] = $event => _ctx.focused = -1)
    }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", HourStripvue_type_template_id_1881b5ec_hoisted_3, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.texts[i]), 1)], 42, HourStripvue_type_template_id_1881b5ec_hoisted_2);
  }), 128))], 42, HourStripvue_type_template_id_1881b5ec_hoisted_1), _ctx.active >= 0 && !_ctx.hidden ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", {
    key: 0,
    class: "fwum-strip__tip",
    style: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeStyle"])(_ctx.tipStyle),
    "aria-hidden": "true"
  }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.texts[_ctx.active]), 5)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.axis && _ctx.cells.length > 1 ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", HourStripvue_type_template_id_1881b5ec_hoisted_4, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.times[0]), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.times[_ctx.times.length - 1]), 1)])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)], 2);
}
// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/HourStrip.vue?vue&type=template&id=1881b5ec

// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-typescript/node_modules/cache-loader/dist/cjs.js??ref--15-0!./node_modules/babel-loader/lib!./node_modules/@vue/cli-plugin-typescript/node_modules/ts-loader??ref--15-2!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--1-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--1-1!./plugins/FeinwerkUptimeMonitor/vue/src/HourStrip.vue?vue&type=script&lang=ts




/* harmony default export */ var HourStripvue_type_script_lang_ts = (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["defineComponent"])({
  props: {
    cells: {
      type: Array,
      required: true
    },
    grain: {
      type: String,
      default: 'hour'
    },
    /** with grain day: 'utc' when the server returned UTC days (its answer, not a guess) */
    days: {
      type: String,
      default: ''
    },
    /** what the strip shows, e.g. "Matomo" or "This website" */
    name: {
      type: String,
      required: true
    },
    language: {
      type: String,
      default: ''
    },
    /** the website's timezone (Peter's 6a) */
    timezone: {
      type: String,
      default: ''
    },
    /** the checked addresses a cell sums up: the denominator of the measured share */
    targets: {
      type: Number,
      default: 1
    },
    small: {
      type: Boolean,
      default: false
    },
    /** P1: the thin lane from outside under a group's strip, the same cells */
    lane: {
      type: Boolean,
      default: false
    },
    /** P1: draw the time axis (with results from outside only the page's last strip does) */
    axis: {
      type: Boolean,
      default: true
    },
    /** the screen's clock (ms), so that the running cell's length follows it; 0: Date.now() */
    now: {
      type: Number,
      default: 0
    },
    /** the end of the last cell (getTimeline end, ISO): its length; '' a whole hour or day */
    end: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      hover: -1,
      focused: -1,
      /** the cell that takes the tab stop: the newest one until the user moves */
      current: -1,
      /** Escape hides the tooltip until the next move */
      hidden: false,
      tipStyle: {}
    };
  },
  computed: {
    active() {
      return this.hover >= 0 ? this.hover : this.focused;
    },
    /** the newest cell up to now; the cells after it are future (-1: the whole period is) */
    lastPast() {
      for (let i = this.cells.length - 1; i >= 0; i -= 1) {
        if (this.cells[i].state !== 'future') {
          return i;
        }
      }
      return -1;
    },
    /** the cell that takes the tab stop: the newest one up to now until the user moves */
    tabIndexCell() {
      return this.current >= 0 && this.current <= this.lastPast ? this.current : this.lastPast;
    },
    /**
     * The server says whether a day is a day in the website's timezone or a UTC day (long periods,
     * and short ones whose hourly values are gone): UTC days get UTC dates as labels.
     */
    zone() {
      return this.grain === 'day' && this.days === 'utc' ? 'UTC' : this.timezone;
    },
    times() {
      const withDay = this.grain === 'hour' && this.cells.length > 25;
      const labels = this.cells.map(cell => {
        if (this.grain !== 'hour') {
          return dayOf(cell.time, this.language, this.zone);
        }
        const hour = hourOf(cell.time, this.language, this.zone);
        return withDay ? `${dayOf(cell.time, this.language, this.zone)}, ${hour}` : hour;
      });
      // the hour a fall-back day has twice: both with the zone's short name (tooltip, screen
      // readers, axis)
      return labels.map((label, i) => this.grain === 'hour' && (labels[i - 1] === label || labels[i + 1] === label) ? `${label} ${zoneNameOf(this.cells[i].time, this.language, this.zone)}`.trim() : label);
    },
    texts() {
      // the cell's length: up to the next cell, the running one up to now
      const lengths = elapsedSeconds(this.cells, this.grain, this.now || Date.now(), this.end);
      return this.cells.map((cell, i) => {
        if (cell.state === 'future') {
          return Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiStripCellFuture', this.times[i]);
        }
        if (cell.state === 'none' || cell.measuredSeconds <= 0) {
          return Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiStripCellNone', this.times[i]);
        }
        const seconds = Math.max(1, lengths[i]) * Math.max(1, this.targets);
        const share = Math.min(100, 100 * cell.measuredSeconds / seconds);
        const uptime = 100 * cell.upSeconds / cell.measuredSeconds;
        return Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiStripCell', this.times[i], percent(uptime, this.language, 2), sharePercent(share, this.language));
      });
    },
    listLabel() {
      return Object(external_CoreHome_["translate"])(this.grain === 'hour' ? 'FeinwerkUptimeMonitor_UiStripHours' : 'FeinwerkUptimeMonitor_UiStripDays', this.name);
    }
  },
  methods: {
    show(i, event) {
      // a cell after now has no data to show
      this.hover = this.cells[i] && this.cells[i].state === 'future' ? -1 : i;
      this.hidden = false;
      this.place(event.currentTarget);
    },
    onFocus(i, event) {
      this.focused = i;
      this.current = i;
      this.hidden = false;
      this.place(event.currentTarget);
    },
    /**
     * The tooltip starts at the cell and grows towards the middle of the strip, so it never
     * leaves the strip (no sideways scroll on phones).
     */
    place(cell) {
      const box = this.$el;
      if (!cell || !box) {
        return;
      }
      const width = box.clientWidth;
      const left = cell.offsetLeft;
      const right = width - (cell.offsetLeft + cell.offsetWidth);
      this.tipStyle = left + cell.offsetWidth / 2 <= width / 2 ? {
        left: `${Math.max(0, left)}px`,
        maxWidth: `${Math.max(120, width - left)}px`
      } : {
        right: `${Math.max(0, right)}px`,
        maxWidth: `${Math.max(120, width - right)}px`
      };
    },
    onKey(event) {
      // the cells after now take no focus: the keys move up to the newest cell
      const last = this.lastPast;
      if (last < 0) {
        return;
      }
      const from = this.focused >= 0 ? this.focused : this.tabIndexCell;
      let next = -1;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        next = Math.min(last, from + 1);
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        next = Math.max(0, from - 1);
      } else if (event.key === 'Home') {
        next = 0;
      } else if (event.key === 'End') {
        next = last;
      } else if (event.key === 'Escape') {
        this.hidden = true;
        return;
      }
      if (next < 0) {
        return;
      }
      event.preventDefault();
      const list = this.$refs.list;
      const cell = list ? list.children[next] : undefined;
      if (cell) {
        cell.focus();
      }
    }
  }
}));
// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/HourStrip.vue?vue&type=script&lang=ts
 
// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/HourStrip.vue



HourStripvue_type_script_lang_ts.render = HourStripvue_type_template_id_1881b5ec_render

/* harmony default export */ var HourStrip = (HourStripvue_type_script_lang_ts);
// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-babel/node_modules/cache-loader/dist/cjs.js??ref--13-0!./node_modules/@vue/cli-plugin-babel/node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist/templateLoader.js??ref--6!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--1-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--1-1!./plugins/FeinwerkUptimeMonitor/vue/src/TargetList.vue?vue&type=template&id=367b7593

const TargetListvue_type_template_id_367b7593_hoisted_1 = {
  class: "fwum-targets",
  role: "list"
};
const TargetListvue_type_template_id_367b7593_hoisted_2 = ["title"];
const TargetListvue_type_template_id_367b7593_hoisted_3 = {
  class: "fwum-cell-label"
};
const TargetListvue_type_template_id_367b7593_hoisted_4 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
  class: "fwum-dot",
  "aria-hidden": "true"
}, null, -1);
const TargetListvue_type_template_id_367b7593_hoisted_5 = {
  class: "fwum-targets__label"
};
const TargetListvue_type_template_id_367b7593_hoisted_6 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("wbr", null, null, -1);
const TargetListvue_type_template_id_367b7593_hoisted_7 = {
  key: 0,
  class: "fwum-targets__values"
};
const TargetListvue_type_template_id_367b7593_hoisted_8 = ["title"];
const TargetListvue_type_template_id_367b7593_hoisted_9 = {
  class: "fwum-sr"
};
const TargetListvue_type_template_id_367b7593_hoisted_10 = {
  key: 0,
  class: "fwum-sr"
};
const TargetListvue_type_template_id_367b7593_hoisted_11 = {
  key: 1,
  class: "fwum-targets__uptime"
};
const TargetListvue_type_template_id_367b7593_hoisted_12 = {
  class: "fwum-sr"
};
const TargetListvue_type_template_id_367b7593_hoisted_13 = {
  key: 2,
  class: "fwum-targets__from"
};
const TargetListvue_type_template_id_367b7593_hoisted_14 = {
  class: "fwum-targets__pair"
};
const TargetListvue_type_template_id_367b7593_hoisted_15 = ["title"];
const TargetListvue_type_template_id_367b7593_hoisted_16 = {
  class: "fwum-sr"
};
const TargetListvue_type_template_id_367b7593_hoisted_17 = {
  key: 1,
  class: "fwum-targets__uptime"
};
const TargetListvue_type_template_id_367b7593_hoisted_18 = {
  class: "fwum-sr"
};
const TargetListvue_type_template_id_367b7593_hoisted_19 = {
  key: 0,
  class: "fwum-targets__from"
};
const TargetListvue_type_template_id_367b7593_hoisted_20 = {
  key: 0,
  class: "fwum-targets__values fwum-targets__values--side"
};
function TargetListvue_type_template_id_367b7593_render(_ctx, _cache, $props, $setup, $data, $options) {
  return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("ul", TargetListvue_type_template_id_367b7593_hoisted_1, [(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderList"])(_ctx.rows, row => {
    return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("li", {
      key: row.key,
      class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(`is-${_ctx.past ? row.dayOutcome : row.tone}`),
      title: row.title
    }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", TargetListvue_type_template_id_367b7593_hoisted_3, [TargetListvue_type_template_id_367b7593_hoisted_4, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", TargetListvue_type_template_id_367b7593_hoisted_5, [(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderList"])(_ctx.breakParts(row.label), (part, p) => {
      return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], {
        key: p
      }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(part), 1), TargetListvue_type_template_id_367b7593_hoisted_6], 64);
    }), 128))])]), !_ctx.sidesOf(row) ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", TargetListvue_type_template_id_367b7593_hoisted_7, [!_ctx.past ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", {
      key: 0,
      class: "fwum-targets__text",
      title: _ctx.onlyFromOutside(row) ? undefined : row.textTitle || undefined
    }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", TargetListvue_type_template_id_367b7593_hoisted_9, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiResponse')) + ": ", 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.keepHyphens(_ctx.textOf(row))), 1), _ctx.asideOf(row) ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", TargetListvue_type_template_id_367b7593_hoisted_10, ", " + Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.asideOf(row)), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)], 8, TargetListvue_type_template_id_367b7593_hoisted_8)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.uptimeOf(row) ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", TargetListvue_type_template_id_367b7593_hoisted_11, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", TargetListvue_type_template_id_367b7593_hoisted_12, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiUptime')) + ": ", 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.uptimeOf(row)), 1)])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.onlyFromOutside(row) ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", TargetListvue_type_template_id_367b7593_hoisted_13, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.onlyFromOutside(row)), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.showCert && row.cert ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", {
      key: 3,
      class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(["fwum-targets__cert", `is-${row.certLevel}`])
    }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiCertificateValue', row.cert)), 3)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)])) : (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], {
      key: 1
    }, [(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderList"])(_ctx.sidesOf(row), side => {
      return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", {
        key: side.key,
        class: "fwum-targets__values fwum-targets__values--side"
      }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", TargetListvue_type_template_id_367b7593_hoisted_14, [!_ctx.past && _ctx.hasWords(side) ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", {
        key: 0,
        class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(["fwum-targets__text", `is-${_ctx.toneOf(side, row)}`]),
        title: _ctx.sideTitle(side, row)
      }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", TargetListvue_type_template_id_367b7593_hoisted_16, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiResponse')) + ": ", 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.keepHyphens(_ctx.sideWords(side))), 1)], 10, TargetListvue_type_template_id_367b7593_hoisted_15)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), side.uptime || _ctx.past ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", TargetListvue_type_template_id_367b7593_hoisted_17, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", TargetListvue_type_template_id_367b7593_hoisted_18, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiUptime')) + ": ", 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(side.uptime || _ctx.translate('FeinwerkUptimeMonitor_UiNotMeasured')), 1)])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)]), !side.tooLarge ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", TargetListvue_type_template_id_367b7593_hoisted_19, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.fromOf(side)), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)]);
    }), 128)), _ctx.showCert && row.cert ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", TargetListvue_type_template_id_367b7593_hoisted_20, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
      class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(["fwum-targets__cert", `is-${row.certLevel}`])
    }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiCertificateValue', row.cert)), 3)])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)], 64))], 10, TargetListvue_type_template_id_367b7593_hoisted_2);
  }), 128))]);
}
// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/TargetList.vue?vue&type=template&id=367b7593

// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-typescript/node_modules/cache-loader/dist/cjs.js??ref--15-0!./node_modules/babel-loader/lib!./node_modules/@vue/cli-plugin-typescript/node_modules/ts-loader??ref--15-2!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--1-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--1-1!./plugins/FeinwerkUptimeMonitor/vue/src/TargetList.vue?vue&type=script&lang=ts




/* harmony default export */ var TargetListvue_type_script_lang_ts = (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["defineComponent"])({
  props: {
    rows: {
      type: Array,
      required: true
    },
    /** false: the group heading (or the widget's figure) names the one certificate of all rows */
    showCert: {
      type: Boolean,
      default: true
    },
    /** a past day or period is shown (D1) */
    past: {
      type: Boolean,
      default: false
    },
    /** results checked from outside come in: each address with both sides */
    outside: {
      type: Boolean,
      default: false
    },
    /** a dashboard widget: a side that cannot check an address adds no line (follow-up D3) */
    widget: {
      type: Boolean,
      default: false
    },
    /** the lower uptime first where the sides differ: a widget on a past day or period (L4) */
    byUptime: {
      type: Boolean,
      default: false
    },
    /**
     * an address on the screen has a figure (the page's Uptime column, D4): a past day's address
     * without one says "Not measured" (quick UI review before 5.4.0, R1)
     */
    measured: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    translate: external_CoreHome_["translate"],
    breakParts: breakParts,
    keepHyphens: keepHyphens,
    /** UI review of 5.4.0, P3: a side's words with the server's short reason it cannot check it */
    sideWords: sideWords,
    /**
     * the row's side from outside as this list shows it: none in a widget while the outside has no
     * current answer about the address (L8 review of 5.3.0, NIT 3: a green widget keeps one line)
     */
    outsideOf(row) {
      if (!this.outside || !row.outside) {
        return null;
      }
      return this.widget && !speaks(row.outside) ? null : row.outside;
    },
    /** P2: null when one line says it all, else both sides in order (sides.ts split) */
    sidesOf(row) {
      const outside = this.outsideOf(row);
      if (!outside || this.onlyOf(row)) {
        return null;
      }
      return split(row.server, outside, this.past, this.past || this.byUptime);
    },
    /**
     * NIT 3: a side line's words: the server's always; the outside's only while it has a current
     * answer (else its uptime alone, as the table shows it)
     */
    hasWords(side) {
      return side.key === 'server' || speaks(side);
    },
    /**
     * D3: in a widget, the one side that can check the address while the other cannot (sides.ts
     * widgetSide); null on the page and where both or neither can
     */
    onlyOf(row) {
      return this.widget && this.outside ? widgetSide(row.server, row.outside) : null;
    },
    /** D3: "from outside" when the one line is the outside's ('' otherwise) */
    onlyFromOutside(row) {
      const only = this.onlyOf(row);
      return only && only.key === 'outside' ? this.fromOf(only) : '';
    },
    /** the one line's response: that side's words (D3), else the row's */
    textOf(row) {
      const only = this.onlyOf(row);
      return only ? only.text : row.text;
    },
    /**
     * the one line's uptime: with results from outside the Uptime cell's one value (it names the
     * outside); D3 the one side's, its name follows once. R1: "Not measured" on a past day where
     * nothing was, as the page's Uptime cell, unless nothing on the screen has a figure (D4)
     */
    uptimeOf(row) {
      const only = this.onlyOf(row);
      if (only) {
        return only.uptime;
      }
      const outside = this.outsideOf(row);
      if (!outside || !row.uptime && !outside.uptime) {
        return row.uptime || (this.past && this.measured ? Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiNotMeasured') : '');
      }
      return uptimeLines(row.server, outside, this.past)[0].text;
    },
    /**
     * a side line's tooltip: why the outside cannot check the address (B5); the server's words
     * with the reason the group's answer line names (polish before 5.4.0)
     */
    sideTitle(side, row) {
      return side.title || (side.key === 'server' ? row.textTitle : '') || undefined;
    },
    /** W5: the outside's value of an agreeing line, for screen readers (sides.ts aside) */
    asideOf(row) {
      const outside = this.outsideOf(row);
      return outside && !this.onlyOf(row) ? aside(row.server, outside) : '';
    },
    /**
     * one side's colour: its outcome; the server's failure while the outside reaches it amber (3a)
     */
    toneOf(side, row) {
      return sideTone(side, side.key === 'server' ? row.outside : row.server);
    },
    /**
     * "from the Matomo server" (the name whole, W8), "from outside"; a container too large to read
     * names no side (W4, L2: the template leaves the name out)
     */
    fromOf(side) {
      return keepServer(Object(external_CoreHome_["translate"])(side.key === 'server' ? 'FeinwerkUptimeMonitor_UiFromServer' : 'FeinwerkUptimeMonitor_UiFromOutside'));
    }
  }
}));
// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/TargetList.vue?vue&type=script&lang=ts
 
// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/TargetList.vue



TargetListvue_type_script_lang_ts.render = TargetListvue_type_template_id_367b7593_render

/* harmony default export */ var TargetList = (TargetListvue_type_script_lang_ts);
// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-babel/node_modules/cache-loader/dist/cjs.js??ref--13-0!./node_modules/@vue/cli-plugin-babel/node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist/templateLoader.js??ref--6!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--1-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--1-1!./plugins/FeinwerkUptimeMonitor/vue/src/CopyChip.vue?vue&type=template&id=6e8fcd22

const CopyChipvue_type_template_id_6e8fcd22_hoisted_1 = ["aria-label"];
const CopyChipvue_type_template_id_6e8fcd22_hoisted_2 = {
  class: "fwum-sr",
  "aria-live": "polite"
};
function CopyChipvue_type_template_id_6e8fcd22_render(_ctx, _cache, $props, $setup, $data, $options) {
  return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", null, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("code", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.line), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("button", {
    type: "button",
    class: "btn-flat",
    "aria-label": _ctx.translate('FeinwerkUptimeMonitor_UiCopyLine', _ctx.line),
    onClick: _cache[0] || (_cache[0] = (...args) => _ctx.copy && _ctx.copy(...args))
  }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate(_ctx.copied ? 'FeinwerkUptimeMonitor_UiCopied' : 'FeinwerkUptimeMonitor_UiCopy')), 9, CopyChipvue_type_template_id_6e8fcd22_hoisted_1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", CopyChipvue_type_template_id_6e8fcd22_hoisted_2, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.announced), 1)]);
}
// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/CopyChip.vue?vue&type=template&id=6e8fcd22

// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-typescript/node_modules/cache-loader/dist/cjs.js??ref--15-0!./node_modules/babel-loader/lib!./node_modules/@vue/cli-plugin-typescript/node_modules/ts-loader??ref--15-2!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--1-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--1-1!./plugins/FeinwerkUptimeMonitor/vue/src/CopyChip.vue?vue&type=script&lang=ts


/** how long the polite region stays empty before "Copied" again: long enough for screen readers */
const ANNOUNCE_DELAY_MS = 100;
/* harmony default export */ var CopyChipvue_type_script_lang_ts = (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["defineComponent"])({
  props: {
    /** the line, exactly as it is copied */
    line: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      copied: false,
      announced: '',
      timer: 0
    };
  },
  beforeUnmount() {
    window.clearTimeout(this.timer);
  },
  methods: {
    translate: external_CoreHome_["translate"],
    /** the button says Copied; the polite region empties and says it a moment later */
    done() {
      this.copied = true;
      this.announced = '';
      window.clearTimeout(this.timer);
      this.timer = window.setTimeout(() => {
        this.announced = Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiCopied');
      }, ANNOUNCE_DELAY_MS);
    },
    /** The clipboard API needs HTTPS; many intranet Matomos run on HTTP: then the classic way. */
    copy() {
      const text = this.line;
      const fallback = () => {
        const area = document.createElement('textarea');
        area.value = text;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        try {
          if (document.execCommand('copy')) {
            this.done();
          }
        } finally {
          document.body.removeChild(area);
        }
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => this.done()).catch(fallback);
      } else {
        fallback();
      }
    }
  }
}));
// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/CopyChip.vue?vue&type=script&lang=ts
 
// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/CopyChip.vue



CopyChipvue_type_script_lang_ts.render = CopyChipvue_type_template_id_6e8fcd22_render

/* harmony default export */ var CopyChip = (CopyChipvue_type_script_lang_ts);
// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-typescript/node_modules/cache-loader/dist/cjs.js??ref--15-0!./node_modules/babel-loader/lib!./node_modules/@vue/cli-plugin-typescript/node_modules/ts-loader??ref--15-2!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--1-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--1-1!./plugins/FeinwerkUptimeMonitor/vue/src/UptimePage.vue?vue&type=script&lang=ts



















/**
 * B11 part 2: the server's side of an address it never checks (getStatus serverRefuses) before its
 * first check: not checkable, without a check time (it never counts as a recent check)
 */
const REFUSED = {
  outcome: 'not_checkable',
  error: 'blocked',
  note: null,
  httpStatus: null,
  responseMs: null,
  checkedAt: '',
  stale: false
};
const MATOMO_KINDS = ['ui', 'tracker', 'js'];
/**
 * B5: why the outside cannot check an address, by its error: the outside's own words where this
 * plugin's would be wrong ("blocked by the settings"), else the cause's
 */
const OUTSIDE_REASONS = {
  blocked: 'UiOutsideReasonBlocked',
  http_status: 'UiOutsideReasonProtected',
  content: 'UiOutsideReasonTooLarge'
};
/**
 * P2 (Peter, 2026-11-25), B4: the measured share shows at the strip end and in the widgets'
 * uptime figure only below this (percent, compared rounded as shown)
 */
const MEASURED_SHOWN = 95;
/**
 * A Tag Manager container is a file on the Matomo server: listed and counted with Matomo, not
 * with the website (Peter, 2026-11-25, "a)"). Its alarm stays the website's (Sentinel U02).
 */
const CONTAINER = 'container';
const ORDER = KIND_ORDER;
/** the answer line names the worst group first */
const SEVERITY = ['down', 'partial', 'stale', 'not_checkable', 'none', 'off', 'up'];
/**
 * notes of a result that sent nothing (Outcome::NOTHING_SENT): the server's PHP, Matomo's internet
 * features, a name only PHP's intl converts. Such a result is no check (UI review of 5.4.0, B2).
 */
const NOTHING_SENT = ['php_disabled', 'internet_off', 'needs_intl'];
/** notes of a result that cannot be checked for a reason of its own, not a firewall or setting */
const NOT_EXPLAINED = NOTHING_SENT;
const OUTAGES_FIRST = 20;
const OUTAGES_STEP = 50;
const INCIDENT_LIMIT = 100;
const INCIDENT_LIMIT_MAX = 1000;
/* harmony default export */ var UptimePagevue_type_script_lang_ts = (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["defineComponent"])({
  components: {
    Sparkline: Sparkline,
    OutageList: OutageList,
    TargetPanel: TargetPanel,
    FeedbackBar: FeedbackBar,
    PromoLine: PromoLine,
    PromoCard: PromoCard,
    HourStrip: HourStrip,
    TargetList: TargetList,
    CopyChip: CopyChip
  },
  props: {
    config: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      loading: true,
      loaded: false,
      failed: false,
      /** narrower than a phone: a narrow dashboard column too (is-narrow, the phone rules) */
      narrow: false,
      /** what screen readers hear about a check: that it runs, then the new freshness */
      announce: '',
      resize: null,
      checking: false,
      checkNote: '',
      panelOpen: false,
      whyOpen: false,
      matomo: null,
      site: null,
      matomoUptimeRows: [],
      siteUptimeRows: [],
      matomoTimeline: null,
      siteTimeline: null,
      /** the strips from outside (page, while results from outside come in) */
      matomoOutsideTimeline: null,
      siteOutsideTimeline: null,
      /**
       * outages still open now, for "since when" in the answer line and 3a (sides.ts aloneDown);
       * while results from outside come in also those ended since yesterday (review of the 5.3.0
       * fixes, SHOULD 1)
       */
      openIncidents: [],
      /**
       * the open outages could not be loaded, or their list was cut at the API's limit: nothing
       * reads as one-sided (L8 review of 5.3.0)
       */
      openFailed: false,
      /** the period's outages as loaded, newest first (the list shows the first ones) */
      incidents: [],
      /** the API limit per request; "Show more" raises it */
      incidentLimit: INCIDENT_LIMIT,
      /** a request was cut at its limit: the period has more outages */
      incidentsMore: false,
      outagesShown: OUTAGES_FIRST,
      loadingMore: false,
      series: [],
      seriesIsProcessing: true,
      /** the screen's clock: relative times ("checked 3 minutes ago") follow it every minute */
      tick: Date.now(),
      timer: 0,
      uid: `fwum-${Math.random().toString(36).slice(2, 8)}`,
      /** this widget shows the dashboard's one card (L5, cardPlace.ts) */
      cardHere: false,
      /** lets go of the dashboard watch that decides cardHere again (minimise, restore) */
      cardWatch: null
    };
  },
  computed: {
    period() {
      const parsed = external_CoreHome_["MatomoUrl"].parsed.value;
      return {
        period: String(parsed.period || 'day'),
        date: String(parsed.date || 'today')
      };
    },
    isPage() {
      return this.config.variant === 'page';
    },
    /** another plugin delivers results checked from outside: shown next to the server's */
    outside() {
      return !!this.config.external && this.config.external.active;
    },
    /** the outages the screen lists: from outside too only while such results come in */
    incidentSource() {
      return this.outside ? 'all' : 'local';
    },
    /** Matomo's group: its switched-on own addresses (interface first), then the containers */
    matomoTargets() {
      var _this$matomo;
      return [...(((_this$matomo = this.matomo) === null || _this$matomo === void 0 ? void 0 : _this$matomo.targets) || []).filter(t => t.enabled && MATOMO_KINDS.includes(t.kind)).sort((a, b) => ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind)), ...this.containers.filter(t => t.enabled).sort((a, b) => a.targetKey.localeCompare(b.targetKey))];
    },
    /** the website's group: its switched-on addresses and tracking proxy */
    siteTargets() {
      var _this$site;
      return (((_this$site = this.site) === null || _this$site === void 0 ? void 0 : _this$site.targets) || []).filter(t => t.enabled && t.kind !== CONTAINER).sort((a, b) => ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind) || a.targetKey.localeCompare(b.targetKey));
    },
    /** B1: what Matomo's group has from outside */
    matomoOutside() {
      return this.outsideOf(this.matomoTargets, [...this.matomoUptimeRows, ...this.siteUptimeRows], this.matomoOutsideTimeline);
    },
    siteOutside() {
      return this.outsideOf(this.siteTargets, this.siteUptimeRows, this.siteOutsideTimeline);
    },
    /**
     * B1: some group of the screen has results from outside: both sides show; else the screen is
     * as without results from outside
     */
    showOutside() {
      return this.showMatomo && this.matomoOutside.cells || this.showSite && this.siteOutside.cells;
    },
    /** a registered source that delivers none (not set up yet, or stopped): admins, the page */
    outsidePaused() {
      return this.isPage && !this.config.embedded && !!this.config.external && !this.config.external.active;
    },
    showMatomo() {
      return this.config.variant !== 'site' && !this.config.isAnonymous;
    },
    showSite() {
      return this.config.variant !== 'matomo';
    },
    canCheck() {
      // the Matomo widget checks Matomo's own addresses: super users only; while Matomo's internet
      // features are off a check sends nothing either (UI review of 5.4.0, B2)
      const allowed = this.config.variant === 'matomo' ? this.config.isSuperUser : this.config.isAdmin;
      return allowed && !this.config.embedded && !this.config.internetOff;
    },
    /** the server's configuration (settings, PHP functions): super users, never in an embed (L3) */
    serverConfigShown() {
      return !!this.config.isSuperUser && !this.config.embedded;
    },
    /** what the server administrator can do: on the page only, not in widgets (UI review, L4) */
    serverHintsShown() {
      return this.serverConfigShown && this.isPage && !this.config.inWidget;
    },
    /** B1: the PHP functions the checks miss, while an address here reads php_disabled */
    phpDisabledShown() {
      var _this$matomo2, _this$site2;
      if (!this.serverConfigShown || !this.notCheckableRows.some(r => r.serverNote === 'php_disabled')) {
        return [];
      }
      const names = [...(((_this$matomo2 = this.matomo) === null || _this$matomo2 === void 0 ? void 0 : _this$matomo2.disabledPhpFunctions) || []), ...(((_this$site2 = this.site) === null || _this$site2 === void 0 ? void 0 : _this$site2.disabledPhpFunctions) || [])];
      return names.filter((name, i) => names.indexOf(name) === i);
    },
    /**
     * UI review of 5.4.0, L9: why the target panel finds nothing while Matomo's internet features
     * are off: the internet line, for super users with the setting (L3)
     */
    panelNotice() {
      if (!this.config.internetOff) {
        return '';
      }
      return Object(external_CoreHome_["translate"])(this.serverConfigShown ? 'FeinwerkUptimeMonitor_UiInternetOff' : 'FeinwerkUptimeMonitor_UiInternetOffNeutral');
    },
    /** L7: those functions are missing because PHP's curl extension is not installed */
    curlMissing() {
      var _this$matomo3, _this$site3;
      return !!((_this$matomo3 = this.matomo) !== null && _this$matomo3 !== void 0 && _this$matomo3.curlExtensionMissing || (_this$site3 = this.site) !== null && _this$site3 !== void 0 && _this$site3.curlExtensionMissing);
    },
    /** the website's Tag Manager containers: shown in the Matomo group */
    containers() {
      var _this$site4;
      return (((_this$site4 = this.site) === null || _this$site4 === void 0 ? void 0 : _this$site4.targets) || []).filter(t => t.kind === CONTAINER);
    },
    matomoRows() {
      const sides = this.matomoOutside.cells;
      return this.matomoTargets.map(t => this.row(t, t.kind === CONTAINER ? this.siteUptimeRows : this.matomoUptimeRows, sides));
    },
    siteRows() {
      const sides = this.siteOutside.cells;
      return this.siteTargets.map(t => this.row(t, this.siteUptimeRows, sides));
    },
    settingsUrl() {
      return `?${external_CoreHome_["MatomoUrl"].stringify({
        module: 'CoreAdminHome',
        action: 'generalSettings'
      })}#/FeinwerkUptimeMonitor`;
    },
    /** Administration > Diagnostic > Uptime Monitor, where super users edit Matomo's addresses */
    adminUrl() {
      return `?${external_CoreHome_["MatomoUrl"].stringify({
        module: 'FeinwerkUptimeMonitor',
        action: 'admin',
        idSite: String(this.config.idSite),
        period: this.period.period,
        date: this.period.date
      })}`;
    },
    /** Visitors > Uptime of this website, from a dashboard widget */
    uptimePageUrl() {
      return this.pageUrl(this.period.period, this.period.date);
    },
    /** the website's own targets, on or off (none before a new website's first check run) */
    siteTargetCount() {
      var _this$site5;
      return (((_this$site5 = this.site) === null || _this$site5 === void 0 ? void 0 : _this$site5.targets) || []).filter(t => t.kind !== CONTAINER).length;
    },
    /** Matomo's addresses (with the website's containers) exist but every one is switched off */
    matomoAllOff() {
      var _this$matomo4;
      const own = [...(((_this$matomo4 = this.matomo) === null || _this$matomo4 === void 0 ? void 0 : _this$matomo4.targets) || []).filter(t => MATOMO_KINDS.includes(t.kind)), ...this.containers];
      return own.length > 0 && own.every(t => !t.enabled);
    },
    /** L8 review 5: an address the server never checks is not checkable at once, no first check */
    nothingChecked() {
      var _this$matomo5, _this$site6;
      const all = [...(((_this$matomo5 = this.matomo) === null || _this$matomo5 === void 0 ? void 0 : _this$matomo5.targets) || []), ...(((_this$site6 = this.site) === null || _this$site6 === void 0 ? void 0 : _this$site6.targets) || [])];
      return all.every(t => !t.states.local && !t.states.external && !(t.enabled && t.serverRefuses));
    },
    /** the groups this screen shows: Matomo (not for anonymous viewers), then the website */
    groups() {
      const out = [];
      if (this.showMatomo) {
        out.push({
          key: 'matomo',
          name: Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiMatomo'),
          rows: this.matomoRows,
          note: Object(external_CoreHome_["translate"])(this.matomoAllOff ? 'FeinwerkUptimeMonitor_UiAllOffMatomo' : 'FeinwerkUptimeMonitor_UiFirstCheck'),
          state: this.groupState(this.matomoRows, this.matomoAllOff),
          cert: this.sharedCert(this.matomoRows),
          outside: this.matomoOutside.cells,
          reason: this.reasonOf(this.matomoRows)
        });
      }
      if (this.showSite) {
        out.push({
          key: 'site',
          name: Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiThisWebsite'),
          rows: this.siteRows,
          note: Object(external_CoreHome_["translate"])(this.siteTargetCount ? 'FeinwerkUptimeMonitor_UiAllOffSite' : 'FeinwerkUptimeMonitor_UiFirstCheck'),
          state: this.groupState(this.siteRows, this.siteTargetCount > 0),
          cert: this.sharedCert(this.siteRows),
          outside: this.siteOutside.cells,
          reason: this.reasonOf(this.siteRows)
        });
      }
      // polish before 5.4.0: a group whose answer line names its one reason (P1) leaves it out of
      // its cells; quick UI review before 5.4.0, L1: with results from outside so does every
      // server cell on the screen whose reason a line names (an answer line, else the count line)
      const named = this.screenReasons(out);
      return out.map(g => {
        if (this.namesReason(g)) {
          return Object.assign(Object.assign({}, g), {}, {
            rows: g.rows.map(r => this.withReasonAbove(r, 'group'))
          });
        }
        return named.length ? Object.assign(Object.assign({}, g), {}, {
          rows: g.rows.map(r => this.withReasonAbove(r, 'screen', named))
        }) : g;
      });
    },
    /**
     * L1: the reason the count line names for every address the server cannot check; '' when an
     * answer line names one (the count line does not repeat it) or they do not share one
     */
    countReason() {
      if (this.groups.some(g => this.namesReason(g))) {
        return '';
      }
      return this.screenReasons(this.groups)[0] || '';
    },
    /** L2: the opt-in's line, as the admin page's chip */
    internetLine() {
      return INTERNET_LINE;
    },
    /**
     * One answer for the screen: "Everything reachable" when every group answers; else each
     * group's state, the worst first, with since when and why for an outage. On the page a group
     * with exactly one address down names it (D2): "This website: example.com/shop not
     * reachable since 18:06 (HTTP status 404)".
     */
    answer() {
      const {
        groups
      } = this;
      if (!groups.length) {
        return [];
      }
      if (groups.every(g => g.state.outcome === 'up')) {
        return [{
          key: 'all',
          outcome: 'up',
          text: Object(external_CoreHome_["translate"])(this.isPage ? 'FeinwerkUptimeMonitor_UiAllReachable' : 'FeinwerkUptimeMonitor_UiReachable'),
          detail: ''
        }];
      }
      const lines = [...groups].sort((a, b) => SEVERITY.indexOf(a.state.outcome) - SEVERITY.indexOf(b.state.outcome)).map(g => {
        const down = g.rows.filter(r => r.outcome === 'down');
        // F1 (final review): a line that names a down address is red, also when the rest of its
        // group answers; a count ("2 of 4 addresses") and the widgets' count stay amber. 3a: down
        // only from the Matomo server while the outside reaches it: amber, and it says so
        const one = this.isPage && down.length === 1;
        const serverOnly = one && down[0].serverOnlyDown;
        const state = one ? Object(external_CoreHome_["translate"])(serverOnly ? 'FeinwerkUptimeMonitor_UiAddressDownFromServer' : 'FeinwerkUptimeMonitor_UiAddressDown', down[0].label) : g.state.text;
        let {
          outcome
        } = g.state;
        if (one) {
          outcome = serverOnly ? 'partial' : 'down';
        }
        return {
          key: g.key,
          outcome,
          text: this.isPage ? Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiAnswerGroup', g.name, state) : g.state.text,
          // P1 (UI review of 5.4.0): nothing of the group can be checked for one reason: it
          // follows in a few words, where an outage's cause goes
          detail: this.namesReason(g) ? `(${g.reason})` : this.downDetail(g.rows)
        };
      });
      // L8 review of 5.3.0, NIT 2: the worst line first by its own colour (a red line naming an
      // address before an amber count or 3a line), the groups' order on a tie; since part 1 of the
      // robustness release also without results from outside
      return lines.sort((a, b) => SEVERITY.indexOf(a.outcome) - SEVERITY.indexOf(b.outcome));
    },
    /**
     * B3 (Peter): on a past day or a longer period the answer states that period first, "Nov 24:
     * no outage" (with the measured share below 95 %) or its outages; the current state follows
     * in one muted line (lines). Null today and in the widgets (they show the current state).
     */
    past() {
      if (!this.isPage || this.todaySelected) {
        return null;
      }
      const {
        language
      } = this.config;
      const label = this.periodLabel;
      // F1: only the parts inside the period, overlapping outages of several addresses as one
      const outages = outagesInPeriod(this.incidents);
      if (outages.length) {
        const {
          count,
          seconds
        } = outageTotals(outages);
        let text = Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiPastOutageOne', label, duration(seconds, language));
        if (this.incidentsMore) {
          // a cut list: the count is a minimum and the sum is unknown
          text = Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiPastOutagesAtLeast', label, String(count));
        } else if (count > 1) {
          text = Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiPastOutagesMany', label, String(count), duration(seconds, language));
        }
        // P3: the part of that time only the outside saw (a cut list has no sum)
        const only = this.showOutside && !this.incidentsMore ? onlyFromOutside(outages) : 0;
        if (only > 0) {
          text = `${text} ${Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiPastOnlyOutside', duration(only, language))}`;
        }
        // which addresses, up to three by name (as the admin fold), with the cause when only one
        const keys = outages.map(i => i.targetKey || '').filter((key, n, all) => all.indexOf(key) === n);
        const causes = outages.map(i => causeText(i.cause, i.detail)).filter((cause, n, all) => all.indexOf(cause) === n);
        const names = keys.length <= 3 ? this.namedOutages(outages) : '';
        return {
          key: 'past',
          // D2: a finished outage is no alarm: the warning colour; a running one leads in red
          // (lines)
          outcome: 'warn',
          text,
          detail: names && causes.length === 1 && causes[0] ? `${names} (${causes[0]})` : names
        };
      }
      const shares = this.measuredShares;
      if (!shares.length) {
        // nothing measured is no "no outage"; D3: before the first measurement, the day it starts
        const first = this.firstMeasured;
        if (first !== '' && this.periodEnd > 0 && new Date(first).getTime() >= this.periodEnd) {
          const day = dayKey(first, this.config.timezone || '');
          const today = dayKey(new Date(this.tick).toISOString(), this.config.timezone || '');
          const mark = '\u0001';
          const [before, after = ''] = Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiPastNotMeasuredStart', label, mark).split(mark);
          return {
            key: 'past',
            outcome: 'none',
            text: before,
            detail: '',
            link: {
              text: calendarDay(day, language, today.slice(0, 4)),
              href: this.config.embedded ? '' : this.pageUrl('day', day),
              after
            }
          };
        }
        return {
          key: 'past',
          outcome: 'none',
          text: Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiPastNotMeasured', label),
          detail: ''
        };
      }
      const lowest = Math.min(...shares);
      return {
        key: 'past',
        outcome: 'up',
        text: Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiPastNoOutage', label),
        detail: this.measuredVisible(lowest) ? Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiMeasured', sharePercent(lowest, language)) : ''
      };
    },
    /** D3: the viewed period has no measurement at all (its answer line stands alone) */
    unmeasured() {
      return !!this.past && this.past.outcome === 'none';
    },
    /** D3: the first measured moment of the screen's groups (API getTimeline firstMeasured) */
    firstMeasured() {
      const timelines = [this.showMatomo ? this.matomoTimeline : null, this.showSite ? this.siteTimeline : null];
      const firsts = timelines.map(t => t && t.firstMeasured || '').filter(t => t !== '');
      return firsts.length ? firsts.sort()[0] : '';
    },
    /** the end of the viewed period (ms): after the strips' last cell; 0 without a strip */
    periodEnd() {
      const ends = [this.matomoTimeline, this.siteTimeline].filter(t => !!t && t.cells.length > 0).map(t => new Date(t.cells[t.cells.length - 1].time).getTime() + (t.grain === 'hour' ? 3600000 : 86400000));
      return ends.length ? Math.max(...ends) : 0;
    },
    /** "Nov 24" for a single day (yesterday too), "In this period" for longer ones */
    periodLabel() {
      const {
        period,
        date
      } = this.period;
      const today = dayKey(new Date(this.tick).toISOString(), this.config.timezone || '');
      const day = date === 'yesterday' ? shiftDay(today, -1) : date;
      if (period !== 'day' || !/^\d{4}-\d{2}-\d{2}$/.test(day)) {
        return Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiInThisPeriod');
      }
      return calendarDay(day, this.config.language, today.slice(0, 4));
    },
    /** each group's measured share of the period (percent), for the groups that measured any */
    measuredShares() {
      const out = [];
      this.groups.forEach(g => {
        const matomo = g.key === 'matomo';
        const rows = matomo ? [...this.matomoUptimeRows, ...this.siteUptimeRows] : this.siteUptimeRows;
        const uptime = this.uptimeOf(g.rows, rows, matomo ? this.matomoTimeline : this.siteTimeline);
        // with results from outside: the side that measured more of the period
        const outside = g.outside ? this.uptimeOf(g.rows, rows, matomo ? this.matomoOutsideTimeline : this.siteOutsideTimeline, 'external') : null;
        const measured = Math.max(uptime ? uptime.measured : 0, outside ? outside.measured : 0);
        if (measured > 0) {
          out.push(measured);
        }
      });
      return out;
    },
    /** something is not reachable now: on a past day the full "Now" line leads (D2) */
    downNow() {
      return this.groups.some(g => g.state.outcome === 'down' || g.state.outcome === 'partial');
    },
    /**
     * The current state of every address of the screen in a few words, for the "Now:" line; one
     * address down is named (D1): "Matomo: Interface not reachable"
     */
    nowState() {
      const {
        groups
      } = this;
      if (groups.length && groups.every(g => g.state.outcome === 'up')) {
        return Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiAllReachable');
      }
      const rows = groups.flatMap(g => g.rows);
      const down = rows.filter(r => r.outcome === 'down');
      if (down.length === 1) {
        return Object(external_CoreHome_["translate"])(down[0].serverOnlyDown ? 'FeinwerkUptimeMonitor_UiAddressDownFromServer' : 'FeinwerkUptimeMonitor_UiAddressDown', this.labels[down[0].key] || down[0].label);
      }
      if (!rows.length) {
        const worst = [...groups].sort((a, b) => SEVERITY.indexOf(a.state.outcome) - SEVERITY.indexOf(b.state.outcome));
        return worst.length ? worst[0].state.text : '';
      }
      return this.groupState(rows, false).text;
    },
    /**
     * F1: the Now line's colour by today's rule: red when it names the one down address or a group
     * does not answer at all ("This website: Not reachable" today); amber when every group with an
     * outage is partly reachable, or the one it names is down only from the Matomo server (3a)
     */
    nowOutcome() {
      const down = this.groups.flatMap(g => g.rows).filter(r => r.outcome === 'down');
      if (this.groups.some(g => g.state.outcome === 'down')) {
        return 'down';
      }
      if (down.length === 1) {
        return down[0].serverOnlyDown ? 'partial' : 'down';
      }
      return 'partial';
    },
    /**
     * The answer as shown: today's lines; on a past day, when something is down now, the full
     * "Now" line first (its dot, since when and why, as today's answer line), then that day's
     * answer; else the day first and the current state in one muted "Now:" line (D2). Not
     * checkable, no recent check or not measured are no outage: the day first.
     */
    lines() {
      if (!this.past) {
        return this.answer;
      }
      if (this.downNow) {
        const rows = this.groups.flatMap(g => g.rows);
        // F1 (final review): one rule with today's lines: red when it names the down address or
        // nothing answers, amber for a count of partly reachable addresses
        return [{
          key: 'now',
          outcome: this.nowOutcome,
          text: Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiNow', this.nowState),
          detail: this.downDetail(rows)
        }, this.past];
      }
      const mark = '\u0001';
      const fresh = this.checking || this.freshness !== '';
      const text = fresh ? Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiNowChecked', this.nowQuiet, mark) : Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiNow', this.nowQuiet);
      const [before, after = ''] = text.split(mark);
      return [this.past, {
        key: 'now',
        outcome: 'now',
        text: before,
        detail: '',
        now: true,
        after
      }];
    },
    /**
     * P4 (UI review of 5.4.0): the muted Now line's state. With addresses that cannot be checked
     * now (their line shows today only) they stay in it: "Matomo reachable, 1 address not
     * checkable", "Reachable, 2 addresses not checkable" when every group answers; when nothing
     * can be checked, the state with its short reason (P1). Without them, nowState as before.
     */
    nowQuiet() {
      const rows = this.groups.flatMap(g => g.rows);
      const count = rows.filter(r => r.outcome === 'not_checkable').length;
      if (!count) {
        return this.nowState;
      }
      if (count === rows.length) {
        const reason = this.reasonOf(rows);
        return reason ? `${this.nowState} (${reason})` : this.nowState;
      }
      const shown = this.groups.filter(g => g.rows.length);
      const up = shown.filter(g => g.state.outcome === 'up');
      let state = this.nowState;
      if (up.length === shown.length) {
        state = Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiReachable');
      } else if (up.length) {
        state = Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiGroupReachable', listOf(up.map(g => g.name), this.config.language));
      }
      return count === 1 ? Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiNowNotCheckableOne', state) : Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiNowNotCheckableMany', state, String(count));
    },
    /** the answer line that carries the freshness: the first one of a group with results */
    freshnessLine() {
      if (this.past) {
        // the "Now" line: first when something is down, else under the day's answer
        return this.downNow ? 0 : 1;
      }
      const checked = key => this.groups.some(g => g.key === key && g.rows.some(r => r.checkedAt !== ''));
      const index = this.answer.findIndex(line => line.key === 'all' || checked(line.key));
      return Math.max(0, index);
    },
    /** "checked 3 minutes ago": the newest current result of the screen */
    freshness() {
      const newest = this.groups.flatMap(g => g.rows).map(r => r.checkedAt).filter(t => t !== '').sort().pop();
      return newest ? Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiChecked', ago(newest, this.config.language, this.tick)) : '';
    },
    /** each address's name without its group ("Interface", "www.example.com") */
    names() {
      var _this$matomo6, _this$site7;
      const out = {};
      [...(((_this$matomo6 = this.matomo) === null || _this$matomo6 === void 0 ? void 0 : _this$matomo6.targets) || []), ...(((_this$site7 = this.site) === null || _this$site7 === void 0 ? void 0 : _this$site7.targets) || [])].forEach(t => {
        out[t.targetKey] = targetLabel(t);
      });
      return out;
    },
    labels() {
      var _this$matomo7, _this$site8;
      const out = {};
      (((_this$matomo7 = this.matomo) === null || _this$matomo7 === void 0 ? void 0 : _this$matomo7.targets) || []).forEach(t => {
        out[t.targetKey] = Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiMatomoTarget', targetLabel(t));
      });
      (((_this$site8 = this.site) === null || _this$site8 === void 0 ? void 0 : _this$site8.targets) || []).forEach(t => {
        // a container is listed with Matomo: named so in the outage list too
        out[t.targetKey] = t.kind === CONTAINER ? Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiMatomoTarget', targetLabel(t)) : targetLabel(t);
      });
      return out;
    },
    /** uptime Matomo, uptime website, the tracker's processing time, the soonest certificate */
    figures() {
      const out = [];
      // the page shows the uptime of each group at the end of its strip (D3); without a strip here
      const stripped = key => this.isPage && this.strips.some(s => s.key === key);
      const matomo = this.showMatomo && !stripped('matomo') ? this.lowerUptime(this.matomoRows, [...this.matomoUptimeRows, ...this.siteUptimeRows], [this.matomoTimeline, this.matomoOutsideTimeline], this.matomoOutside) : null;
      if (matomo) {
        out.push(Object.assign({
          key: 'matomo',
          label: Object(external_CoreHome_["translate"])(this.isPage ? 'FeinwerkUptimeMonitor_UiUptimeMatomo' : 'FeinwerkUptimeMonitor_UiUptime')
        }, matomo));
      }
      const site = this.showSite && !stripped('site') ? this.lowerUptime(this.siteRows, this.siteUptimeRows, [this.siteTimeline, this.siteOutsideTimeline], this.siteOutside) : null;
      if (site) {
        out.push(Object.assign({
          key: 'site',
          label: Object(external_CoreHome_["translate"])(this.isPage ? 'FeinwerkUptimeMonitor_UiUptimeWebsite' : 'FeinwerkUptimeMonitor_UiUptime')
        }, site));
      }
      if (this.trackerTime) {
        out.push({
          key: 'tracker',
          label: Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiTrackerProcessing'),
          value: this.trackerTime,
          sub: Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiMedianLastHour'),
          level: '',
          measured: null,
          side: ''
        });
      } else if (this.showMatomo && this.sparkValues.length > 1) {
        // no tracking traffic in the last hour: the endpoint's response times per hour
        out.push({
          key: 'tracker',
          label: this.sparkLabel,
          value: '',
          sub: '',
          level: '',
          measured: null,
          side: ''
        });
      }
      const withCert = this.groups.flatMap(g => g.rows).filter(r => r.certDays !== null);
      if (withCert.length) {
        const soonest = withCert.reduce((a, b) => {
          var _b$certDays, _a$certDays;
          return ((_b$certDays = b.certDays) !== null && _b$certDays !== void 0 ? _b$certDays : 0) < ((_a$certDays = a.certDays) !== null && _a$certDays !== void 0 ? _a$certDays : 0) ? b : a;
        });
        out.push({
          key: 'cert',
          label: Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiCertificate'),
          value: soonest.cert,
          sub: this.certFigureSub(withCert, soonest),
          level: soonest.certLevel,
          measured: null,
          side: ''
        });
      }
      return out;
    },
    /** the median processing time of real tracking requests in the last hour */
    trackerTime() {
      var _this$matomo8;
      const processing = (_this$matomo8 = this.matomo) === null || _this$matomo8 === void 0 ? void 0 : _this$matomo8.processing;
      if (processing && processing.samples > 0 && processing.p50Ms !== null) {
        return milliseconds(processing.p50Ms, this.config.language);
      }
      return '';
    },
    sparkValues() {
      return this.series.map(p => p.p50Ms);
    },
    sparkLabel() {
      return Object(external_CoreHome_["translate"])(this.seriesIsProcessing ? 'FeinwerkUptimeMonitor_UiResponseTime' : 'FeinwerkUptimeMonitor_UiEndpointTime');
    },
    strips() {
      const out = [];
      const add = (key, name, timelines, rows, uptimeRows, outside) => {
        const [local, external] = timelines;
        if (!this.isPage) {
          // B4: a widget's one strip from both sides while the outside measured the group: a cell
          // is up only when every side found every address up (as getTimeline source=all)
          const both = outside.strip && !!local && !!external;
          const timeline = both && local && external ? combineTimelines(local, external) : local;
          if (timeline && timeline.cells.length) {
            out.push({
              key,
              name,
              label: name,
              vantage: '',
              first: true,
              timeline,
              targets: Math.max(1, this.measurableCount(rows, 'local') + (both ? this.measurableCount(rows, 'external') : 0)),
              uptime: null,
              lane: false,
              axis: true,
              next: false
            });
          }
          return;
        }
        const sides = [[key, local, 'local', this.showOutside ? Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiFromServer') : '', '', false]];
        if (this.showOutside && outside.strip) {
          sides.push([`${key}-outside`, external, 'external', this.outsideVantage(rows), this.outsideVantage(rows, true), true]);
        }
        let first = true;
        const start = out.length;
        sides.forEach(([id, timeline, source, vantage, shown, lane]) => {
          if (timeline && timeline.cells.length) {
            out.push({
              key: id,
              name,
              label: vantage ? `${name}, ${vantage}` : name,
              vantage: lane ? shown : '',
              first,
              timeline,
              targets: this.measurable(rows, source),
              uptime: this.uptimeOf(rows, uptimeRows, timeline, source),
              lane,
              axis: true,
              next: false
            });
            first = false;
          }
        });
        // D1 (Peter, 2026-11-26, "Ansonsten alle wie empfohlen umsetzen"): of a group's two
        // uptimes the lower one is bold, whichever row it is on, as in the widgets and the table;
        // the other muted; the server's bold on a tie
        const [server, lane] = out.slice(start).map(strip => strip.uptime);
        if (server && lane) {
          const laneLower = lane.value !== server.value && lane.uptime < server.uptime;
          server.muted = laneLower;
          lane.muted = !laneLower;
        }
      };
      if (this.showMatomo) {
        add('matomo', Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiMatomo'), [this.matomoTimeline, this.matomoOutsideTimeline], this.matomoRows, [...this.matomoUptimeRows, ...this.siteUptimeRows], this.matomoOutside);
      }
      if (this.showSite) {
        add('site', Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiThisWebsite'), [this.siteTimeline, this.siteOutsideTimeline], this.siteRows, this.siteUptimeRows, this.siteOutside);
      }
      if (this.isPage && this.showOutside) {
        // P1: one time axis under the last strip; each group after the first set apart
        out.forEach((strip, i) => {
          Object.assign(strip, {
            axis: i === out.length - 1,
            next: i > 0 && strip.first
          });
        });
      }
      return out;
    },
    /** D2: the strips by group, a group's strip and its lane from outside together */
    stripBlocks() {
      const out = [];
      this.strips.forEach(strip => {
        const last = out[out.length - 1];
        if (last && !strip.first) {
          last.strips.push(strip);
        } else {
          out.push({
            key: strip.key,
            strips: [strip]
          });
        }
      });
      return out;
    },
    hasCerts() {
      return this.groups.some(g => g.rows.some(r => r.cert !== ''));
    },
    /** D4: a period without any measurement shows no empty Uptime column */
    hasUptime() {
      return this.groups.some(g => g.rows.some(r => r.uptime !== '' || !!r.outside && r.outside.uptime !== ''));
    },
    /** P2: the same columns with and without results from outside */
    columnCount() {
      return 1 + (this.past ? 0 : 1) + (this.hasUptime ? 1 : 0) + (this.hasCerts ? 1 : 0);
    },
    /** the widget's one group */
    widgetGroup() {
      return this.groups.length ? this.groups[0] : null;
    },
    /** the selected period is the single day of today, in the website's timezone */
    todaySelected() {
      const {
        period,
        date
      } = this.period;
      if (period !== 'day') {
        return false;
      }
      return date === 'today' || date === dayKey(new Date(this.tick).toISOString(), this.config.timezone || '');
    },
    /** the quiet icons: admins of the website, not in an embed */
    showTools() {
      return this.isPage && this.config.isAdmin && !this.config.embedded;
    },
    checkLabel() {
      return Object(external_CoreHome_["translate"])(this.checking ? 'FeinwerkUptimeMonitor_UiChecking' : 'FeinwerkUptimeMonitor_UiCheckNow');
    },
    /** the website widget: which of the website's containers are down (they count with Matomo) */
    containerNote() {
      // anonymous viewers never see a container: it belongs to Matomo's group
      if (this.config.variant !== 'site' || this.config.isAnonymous) {
        return '';
      }
      // the containers as Matomo's group lists them: their state from both sides (row())
      const keys = this.containers.filter(t => t.enabled).map(t => t.targetKey);
      const failing = this.matomoRows.filter(r => keys.includes(r.key) && r.outcome === 'down');
      if (!failing.length) {
        return '';
      }
      const names = listOf(failing.map(r => r.label), this.config.language);
      // 3a: every one of them only from the Matomo server, while the outside reaches it (one rule
      // with the rows, sides.ts serverOnlyDown)
      const side = this.outside && failing.every(r => r.serverOnlyDown) ? 'FromServer' : '';
      return Object(external_CoreHome_["translate"])(`FeinwerkUptimeMonitor_UiContainerDown${failing.length === 1 ? 'One' : 'Many'}${side}`, names);
    },
    widgetDown() {
      return !!this.widgetGroup && this.widgetGroup.rows.some(r => r.outcome === 'down');
    },
    /** a widget with an outage lists only the failing addresses */
    widgetRows() {
      return this.listedOf(this.widgetGroup);
    },
    notCheckableRows() {
      const rows = this.isPage ? this.groups.flatMap(g => g.rows) : this.widgetRows;
      return rows.filter(r => r.outcome === 'not_checkable');
    },
    notCheckableCount() {
      return this.notCheckableRows.length;
    },
    /** addresses this server cannot reach (firewall, private address, password): general reason */
    notCheckableUnreached() {
      return this.notCheckableRows.some(r => !r.tooLarge);
    },
    /** Tag Manager containers larger than the 4 MB the check reads: their own reason */
    notCheckableTooLarge() {
      return this.notCheckableRows.some(r => r.tooLarge);
    },
    /**
     * the general reasons (firewall, private address, password) and the link to allow private
     * addresses fit: not for a container too large, nor where nothing was sent (the server's PHP,
     * Matomo's internet features: the admin page and the internet line say why), nor for a name
     * that needs PHP's intl (its own reason)
     */
    notCheckableExplained() {
      return this.notCheckableRows.some(r => !r.tooLarge && !NOT_EXPLAINED.includes(r.serverNote || ''));
    },
    /** a name only PHP's intl converts safely, on a server without it: its own reason */
    notCheckableNeedsIntl() {
      return this.notCheckableRows.some(r => r.serverNote === 'needs_intl');
    },
    /** a reason to show under "Why?" */
    whyAvailable() {
      return this.notCheckableExplained || this.notCheckableTooLarge || this.notCheckableNeedsIntl;
    },
    /** B5: of those this server cannot reach, the ones the outside cannot check either */
    notCheckableOutsideToo() {
      return this.notCheckableRows.filter(r => !r.tooLarge && !!r.outside && r.outside.outcome === 'not_checkable');
    },
    /** B5, L8 review 7: no side can check any of them (the answer line says so too) */
    notCheckableEither() {
      const unreached = this.notCheckableRows.filter(r => !r.tooLarge);
      return unreached.length > 0 && this.notCheckableOutsideToo.length === unreached.length;
    },
    /** "Why?": the reasons of the addresses that cannot be checked, each once */
    whyText() {
      const parts = [];
      if (this.notCheckableExplained) {
        parts.push(Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiNotCheckableHelp'));
        // next to the link "Allow private addresses" this sentence would repeat it
        if (!(this.config.isSuperUser && !this.config.embedded) && !this.config.allowPrivate) {
          parts.push(Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiNotCheckableSettings'));
        }
        // B5: the outside's reasons for those it cannot check either
        if (this.notCheckableOutsideToo.length) {
          parts.push(Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiNotCheckableOutsideHelp'));
        }
      }
      if (this.notCheckableTooLarge) {
        parts.push(Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiNotCheckableTooLarge'));
      }
      if (this.notCheckableNeedsIntl) {
        parts.push(Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiNotCheckableNeedsIntl'));
        // UI review of 5.4.0, L5: what the server administrator can do
        if (this.serverHintsShown) {
          parts.push(Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiNotCheckableNeedsIntlHint'));
        }
      }
      // "4 MB" stays together (D4)
      return keepUnits(parts.join(' '));
    },
    /**
     * D2 (final review): only too large containers, which no server could check: without "from
     * this server"; while results from outside show, "from the Matomo server" (follow-up W2)
     */
    notCheckableText() {
      // L1: with results from outside, the one cause of them all, once
      const reason = this.countReason;
      if (reason) {
        return this.notCheckableCount === 1 ? Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiNotCheckableOneFromServerCause', reason) : Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiNotCheckableManyFromServerCause', String(this.notCheckableCount), reason);
      }
      const anywhere = !this.notCheckableUnreached;
      // B5: no side can check them: both named, as in the answer line
      const side = this.showOutside ? 'FromServer' : '';
      let keys = [`UiNotCheckableOne${side}`, `UiNotCheckableMany${side}`];
      if (anywhere) {
        keys = ['UiCannotCheckOne', 'UiCannotCheckMany'];
      } else if (this.notCheckableEither) {
        keys = ['UiCannotCheckEitherOne', 'UiCannotCheckEitherMany'];
      }
      return this.notCheckableCount === 1 ? Object(external_CoreHome_["translate"])(`FeinwerkUptimeMonitor_${keys[0]}`) : Object(external_CoreHome_["translate"])(`FeinwerkUptimeMonitor_${keys[1]}`, String(this.notCheckableCount));
    },
    /** D1: the outage list's rows, overlapping outages of one group as one */
    outageList() {
      return outageRows(this.incidents, !!this.past);
    },
    shownOutages() {
      // with a cut request, only the first `limit` of the merged list are surely the newest
      const cap = this.incidentsMore ? Math.min(this.outagesShown, this.incidentLimit) : this.outagesShown;
      return this.outageList.slice(0, cap);
    },
    canShowMore() {
      // more of the loaded list, or a larger request; at the API's limit a cut list ends here
      const moreLoaded = this.shownOutages.length < this.outageList.length && !(this.incidentsMore && this.outagesShown >= this.incidentLimit && this.incidentLimit >= INCIDENT_LIMIT_MAX);
      return moreLoaded || this.incidentsMore && this.incidentLimit < INCIDENT_LIMIT_MAX;
    }
  },
  watch: {
    period() {
      this.outagesShown = OUTAGES_FIRST;
      this.incidentLimit = INCIDENT_LIMIT;
      this.load();
    }
  },
  mounted() {
    this.load();
    // the page and the widgets follow their own width, not the screen's: Matomo's default dashboard
    // has three columns, about 370 px each (Peter, 2026-11-25: the big widget looked broken there)
    if (this.$el instanceof HTMLElement) {
      this.resize = observeNarrow(this.$el, narrow => {
        this.narrow = narrow;
      });
      this.cardHere = ownsDashboardCard(this.$el);
      // a widget minimised or restored, added or removed: every widget decides again, so the
      // card moves to the new owner and there is never a second one
      this.cardWatch = watchDashboardCard(this.$el, owns => {
        this.cardHere = owns;
      });
    }
    this.timer = window.setInterval(() => {
      var _this$$el;
      // Matomo 5's dashboard reload replaces a widget's HTML without unmounting the app
      if (!((_this$$el = this.$el) !== null && _this$$el !== void 0 && _this$$el.isConnected)) {
        window.clearInterval(this.timer);
        return;
      }
      this.tick = Date.now();
    }, 60000);
  },
  beforeUnmount() {
    window.clearInterval(this.timer);
    if (this.resize) {
      this.resize.disconnect();
    }
    if (this.cardWatch) {
      this.cardWatch();
    }
  },
  methods: {
    translate: external_CoreHome_["translate"],
    breakParts: breakParts,
    keepHyphens: keepHyphens,
    sideWords: sideWords,
    /**
     * UI review of 5.4.0, P1 and P3: why the server sends nothing for an address, in a few words.
     * The server's configuration for super users only, never in an embed (L3): everyone else reads
     * that the checks are switched off, and nothing about PHP. A name that needs intl: for
     * everyone, as its reason behind "Why?" is.
     */
    shortReason(note) {
      if (note === 'needs_intl') {
        return Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiShortCauseNeedsIntl');
      }
      if (note === 'internet_off') {
        return Object(external_CoreHome_["translate"])(this.serverConfigShown ? 'FeinwerkUptimeMonitor_UiShortCauseInternetOff' : 'FeinwerkUptimeMonitor_UiShortCauseChecksOff');
      }
      if (note === 'php_disabled' && this.serverConfigShown) {
        return Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiShortCausePhpDisabled');
      }
      return '';
    },
    /**
     * P1: the one short reason that every address of rows that cannot be checked shares; '' when
     * they differ, one has none (a firewall, a container too large) or the outside cannot check it
     * either (the line then names both sides)
     */
    reasonOf(rows) {
      const reasons = rows.filter(r => r.outcome === 'not_checkable').map(r => r.outside && r.outside.outcome === 'not_checkable' ? '' : r.server.reason || '');
      return reasons.length && reasons.every(r => r !== '' && r === reasons[0]) ? reasons[0] : '';
    },
    /** P1: the group's answer line names the one reason nothing of it can be checked */
    namesReason(group) {
      return group.state.outcome === 'not_checkable' && group.reason !== '';
    },
    /**
     * Quick UI review before 5.4.0, L1: with results from outside, the short reasons a line on the
     * screen names, so that the server's cells with one of them leave it out: each answer line's
     * (P1), else the count line's, the one reason every address it counts shares (reasonOf). None
     * on a past day (no count line, no Response cells) and without results from outside (P3: each
     * cell names its own)
     */
    screenReasons(groups) {
      // a past day as past() has it, without reading it: its answer reads the groups
      const pastDay = this.isPage && !this.todaySelected;
      if (!this.showOutside || pastDay) {
        return [];
      }
      const answered = groups.filter(g => this.namesReason(g)).map(g => g.reason);
      if (answered.length) {
        return answered.filter((r, i) => answered.indexOf(r) === i);
      }
      const rows = this.isPage ? groups.flatMap(g => g.rows) : this.listedOf(groups[0] || null);
      const counted = this.reasonOf(rows);
      return counted ? [counted] : [];
    },
    /** the addresses a widget lists of its group: only the failing ones while one is down */
    listedOf(group) {
      if (!group) {
        return [];
      }
      const down = group.rows.filter(r => r.outcome === 'down');
      return down.length ? down : group.rows;
    },
    /**
     * Polish before 5.4.0: an address of a group whose answer line names its reason (namesReason,
     * 'group') says only "Not checkable"; its words with the reason (P3) become the cell's tooltip.
     * L1 ('screen', another group's answer line or the count line names the reason): a server
     * that cannot check the address for one of those reasons says "Not checkable from the Matomo
     * server" in one line and "Not checkable" on its side line, also where the outside reaches it,
     * the reason in the tooltip. The reason stays on the server's side for the past day's Now line
     * (reasonOf).
     */
    withReasonAbove(row, where, reasons = []) {
      const cannot = where === 'group' ? row.outcome === 'not_checkable' : row.server.outcome === 'not_checkable' && reasons.includes(row.server.reason || '');
      if (!cannot || !row.server.reason) {
        return row;
      }
      const server = Object.assign(Object.assign({}, row.server), {}, {
        reasonAbove: where
      });
      if (row.outcome !== 'not_checkable') {
        // L1: the outside reaches it: the row's own words are the outside's, the server's side
        // line leaves the reason to the line that names it
        return Object.assign(Object.assign({}, row), {}, {
          server,
          textTitle: namedCause(row.server)
        });
      }
      return Object.assign(Object.assign({}, row), {}, {
        server,
        text: this.showOutside ? responseLines(server, row.outside)[0].text : Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiNotCheckableShort'),
        textTitle: row.text
      });
    },
    /** B4: a measured share is shown below MEASURED_SHOWN %, compared as it reads (rounded) */
    measuredVisible(measured) {
      return Math.round(measured) < MEASURED_SHOWN;
    },
    /** the certificate all rows share (same days and level), else null (B2) */
    sharedCert(rows) {
      const first = rows[0];
      if (!first || first.certDays === null) {
        return null;
      }
      const same = rows.every(r => r.certDays === first.certDays && r.certLevel === first.certLevel);
      return same ? {
        text: first.cert,
        level: first.certLevel
      } : null;
    },
    load() {
      var _this$$el2;
      if (this.loaded && !((_this$$el2 = this.$el) !== null && _this$$el2 !== void 0 && _this$$el2.isConnected)) {
        // a detached copy after a dashboard reload: the new one loads for itself
        return Promise.resolve();
      }
      this.loading = true;
      this.failed = false;
      const {
        idSite
      } = this.config;
      const {
        period
      } = this;
      const requests = [];
      const open = [];
      // L8 review of 5.3.0: without the outages open now nothing reads as one-sided (fail closed)
      let openFailed = false;
      const noneOpen = () => {
        openFailed = true;
        return [];
      };
      // outages from outside only while their source delivers (B10): else the page as before
      const source = this.incidentSource;
      // review of the 5.3.0 fixes, SHOULD 1: with results from outside also the outages ended since
      // yesterday (the one-sided rule); a list cut at the limit is not known either. Without a
      // source the request for the outages open now, as before
      const current = (id, timezoneOf) => (this.outside ? api.recentIncidents(id, timezoneOf).then(list => {
        if (list.length >= RECENT_LIMIT) {
          openFailed = true;
        }
        return list;
      }) : api.openIncidents(id, timezoneOf, source)).catch(noneOpen);
      if (this.showMatomo) {
        requests.push(api.status(0).then(s => {
          this.matomo = s;
        }));
        requests.push(api.uptime(0, period, idSite).then(r => {
          this.matomoUptimeRows = r;
        }));
        requests.push(this.loadSeries(period));
        // the strip is an addition: without it the page still answers
        requests.push(api.timeline(idSite, period, 'matomo').catch(() => null).then(t => {
          this.matomoTimeline = t;
        }));
        // B4: the widgets too, for their strip and uptime from both sides
        if (this.outside) {
          requests.push(api.timeline(idSite, period, 'matomo', 'external').catch(() => null).then(t => {
            this.matomoOutsideTimeline = t;
          }));
        }
        open.push(current(0, idSite));
      }
      // the website's targets also for the Matomo widget: its containers belong to Matomo's group
      if (this.showSite) {
        requests.push(api.status(idSite).then(s => {
          this.site = s;
        }));
        requests.push(api.uptime(idSite, period).then(r => {
          this.siteUptimeRows = r;
        }));
        open.push(current(idSite, 0));
      } else if (this.showMatomo && idSite > 0) {
        // the Matomo widget: the website's containers are an addition, a failure leaves the rest
        requests.push(api.status(idSite).then(s => {
          this.site = s;
        }).catch(() => undefined));
        requests.push(api.uptime(idSite, period).then(r => {
          this.siteUptimeRows = r;
        }).catch(() => undefined));
        open.push(current(idSite, 0));
      }
      if (this.showSite) {
        requests.push(api.timeline(idSite, period, 'website').catch(() => null).then(t => {
          this.siteTimeline = t;
        }));
        if (this.outside) {
          requests.push(api.timeline(idSite, period, 'website', 'external').catch(() => null).then(t => {
            this.siteOutsideTimeline = t;
          }));
        }
      }
      requests.push(Promise.all(open).then(lists => {
        this.openIncidents = [].concat(...lists);
        this.openFailed = openFailed;
      }));
      if (this.isPage) {
        requests.push(this.loadIncidents());
      }
      return Promise.all(requests).then(() => {
        this.loaded = true;
        // the running strip cell and the measured share count up to the time of these data
        this.tick = Date.now();
      }).catch(() => {
        this.failed = true;
      }).finally(() => {
        this.loading = false;
      });
    },
    loadIncidents() {
      const {
        idSite
      } = this.config;
      const {
        period
      } = this;
      const limit = this.incidentLimit;
      const source = this.incidentSource;
      const matomoIncidents = this.showMatomo ? api.incidents(0, period, idSite, limit, source) : Promise.resolve([]);
      return Promise.all([api.incidents(idSite, period, 0, limit, source), matomoIncidents]).then(([own, matomo]) => {
        this.incidentsMore = own.length >= limit || matomo.length >= limit;
        // a container is listed in Matomo's group: not shown to viewers without it (anonymous)
        const site = this.showMatomo ? own : own.filter(i => i.kind !== CONTAINER);
        this.incidents = [...site, ...matomo].sort((a, b) => b.start.localeCompare(a.start));
      });
    },
    /** "Show more": the next outages, loading up to the API's limit when a list was cut */
    showMoreOutages() {
      const next = this.outagesShown + OUTAGES_STEP;
      if (this.incidentsMore && next > this.incidentLimit && this.incidentLimit < INCIDENT_LIMIT_MAX) {
        this.loadingMore = true;
        this.incidentLimit = INCIDENT_LIMIT_MAX;
        this.loadIncidents().then(() => {
          this.outagesShown = next;
        }).catch(() => {
          this.incidentLimit = INCIDENT_LIMIT;
        }).finally(() => {
          this.loadingMore = false;
        });
        return;
      }
      this.outagesShown = next;
    },
    loadSeries(period) {
      const zone = this.config.idSite;
      return api.responseTimes(0, period, 'processing', zone).catch(() => []).then(points => {
        if (points.some(p => p.p50Ms !== null)) {
          this.series = points;
          this.seriesIsProcessing = true;
          return undefined;
        }
        return api.responseTimes(0, period, 'tracker', zone).catch(() => []).then(tracker => {
          this.series = tracker.filter(p => p.source === 'local');
          this.seriesIsProcessing = false;
        });
      });
    },
    checkNow() {
      // aria-disabled keeps the focus on the button: the click is ignored here instead
      if (this.checking) {
        return;
      }
      this.checking = true;
      this.announce = this.checkLabel;
      this.checkNote = '';
      const idSite = this.showSite ? this.config.idSite : 0;
      // the Matomo widget lists the website's containers too: they are checked with the website
      const containersToo = idSite === 0 && this.config.idSite > 0 && this.containers.some(t => t.enabled);
      api.checkNow(idSite).then(answer => {
        if (answer.locked) {
          this.checkNote = Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiCheckBusy');
          return undefined;
        }
        return containersToo ? api.checkNow(this.config.idSite) : answer;
      }).then(answer => {
        if (!answer) {
          return undefined;
        }
        if (answer.locked) {
          this.checkNote = Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiCheckBusy');
        }
        return this.load().then(() => {
          // "checked just now": the check is done
          this.announce = this.freshness;
        });
      }).catch(e => {
        // e.g. "once a minute": said here, next to the button
        this.checkNote = errorText(e);
      }).finally(() => {
        this.checking = false;
      });
    },
    onPanelClose(changed) {
      this.panelOpen = false;
      if (changed) {
        this.load();
      }
    },
    /**
     * One address of a group; sides: the group shows results from outside (B1), so the address has
     * its outside side. On a screen with results from outside the server's words are short ("Not
     * checkable") and the cells name the side where needed (P2, sides.ts)
     */
    row(target, uptimeRows, sides = false) {
      var _of$uptimePercent, _of, _of$uptimePercent2, _of2;
      const of = source => uptimeRows.find(r => r.targetKey === target.targetKey && r.source === source);
      // an address this server never checks: not checkable before its first check too (no time)
      const local = target.states.local || (target.serverRefuses ? REFUSED : undefined);
      const twoSided = this.showOutside;
      const server = this.vantage(local, of('local'), twoSided);
      const outside = sides ? this.vantage(target.states.external, of('external'), true, true) : null;
      // an address the outside cannot check (a private address, a port it does not check) adds
      // nothing to the dot, the answer and the freshness; its cell still says so
      const counted = outside && outside.outcome !== 'not_checkable' ? outside : null;
      const outcome = combined(server.outcome, outside ? outside.outcome : null);
      // L8 review of 5.3.0: each side's outage open for the address and since when (sides.ts
      // aloneDown); not known when they could not be loaded
      const outages = external => this.openIncidents.filter(i => i.type === 'outage' && i.targetKey === target.targetKey && i.source === 'external' === external);
      const opened = external => outages(external).filter(i => i.open).map(i => i.start).sort();
      // review of the 5.3.0 fixes: the end of each side's latest ended outage (SHOULD 1) and the
      // server's margin (SHOULD 2)
      const ended = external => outages(external).map(i => i.open ? '' : i.end || '').sort().pop() || '';
      const margin = this.config.external && typeof this.config.external.sidesMargin === 'number' ? this.config.external.sidesMargin : SIDES_MARGIN_SECONDS;
      const known = !this.openFailed;
      const serverOpen = opened(false);
      const serverSide = {
        key: 'server',
        outcome: server.outcome,
        text: server.text,
        uptime: server.uptime,
        percent: (_of$uptimePercent = (_of = of('local')) === null || _of === void 0 ? void 0 : _of.uptimePercent) !== null && _of$uptimePercent !== void 0 ? _of$uptimePercent : null,
        tooLarge: server.tooLarge,
        reason: server.reason,
        checkedAt: server.checkedAt,
        downSince: serverOpen.length ? serverOpen[0] : '',
        outageOpen: known ? serverOpen.length > 0 : undefined,
        outageEnd: ended(false),
        margin
      };
      const outsideOpen = opened(true);
      const outsideSide = outside ? {
        key: 'outside',
        outcome: outside.outcome,
        text: outside.text,
        uptime: outside.uptime,
        percent: (_of$uptimePercent2 = (_of2 = of('external')) === null || _of2 === void 0 ? void 0 : _of2.uptimePercent) !== null && _of$uptimePercent2 !== void 0 ? _of$uptimePercent2 : null,
        title: outside.title,
        checkedAt: outside.checkedAt,
        downSince: outsideOpen.length ? outsideOpen[0] : '',
        outageOpen: known ? outsideOpen.length > 0 : undefined,
        outageEnd: ended(true),
        margin
      } : null;
      // L8 review 8: a past day's dot follows that day's results from outside whenever there are
      // any, also when the outside cannot check the address now
      const day = outside && outside.dayOutcome !== 'none' ? outside : null;
      let {
        dayOutcome
      } = server;
      if (day && (server.dayOutcome === 'partial' || day.dayOutcome === 'partial')) {
        dayOutcome = 'partial';
      } else if (day && day.dayOutcome === 'up') {
        dayOutcome = 'up';
      }
      return {
        key: target.targetKey,
        label: targetLabel(target),
        outcome,
        // 3a: down only from the Matomo server while the outside reaches it: amber, still down
        tone: toneOf(serverSide, outsideSide),
        serverOnlyDown: serverOnlyDown(serverSide, outsideSide),
        // one line's words; with results from outside the first line of the cell (P2)
        text: twoSided ? responseLines(serverSide, outsideSide)[0].text : server.text,
        // B3: the address as entered, an international name also in its ASCII form
        title: addressTitle(target.url, targetLabel(target)),
        uptime: server.uptime,
        cert: target.certificate ? this.certText(target.certificate) : '',
        certLevel: target.certificate ? target.certificate.level : '',
        certDays: target.certificate ? target.certificate.daysLeft : null,
        // the newer of the two sides' current results; a result of the server that sent nothing is
        // no check (UI review of 5.4.0, B2)
        checkedAt: [NOTHING_SENT.includes(server.note || '') ? '' : server.checkedAt, counted ? counted.checkedAt : ''].sort().pop() || '',
        host: hostOf(target.url),
        // D1: a past day's dot follows that day's uptime: all of it, part of it, nothing measured
        dayOutcome,
        tooLarge: server.tooLarge,
        serverNote: server.note,
        serverOutcome: server.outcome,
        cause: this.causeOf(serverSide, counted ? outsideSide : null),
        server: serverSide,
        outside: outsideSide
      };
    },
    /**
     * One side of an address: its current state in a few words and its uptime in the period.
     * short: both sides show (their headings say from where); fromOutside: the outside's side
     */
    vantage(state, uptime, short = false, fromOutside = false) {
      const {
        language,
        timezone
      } = this.config;
      let outcome = state ? state.outcome : 'none';
      let text = '';
      let title = '';
      let reason = '';
      if (!state) {
        // B2: no result from outside may never come (a limit, an address it skips): not "yet"
        text = Object(external_CoreHome_["translate"])(fromOutside ? 'FeinwerkUptimeMonitor_UiNotChecked' : 'FeinwerkUptimeMonitor_UiNotMeasuredYet');
      } else if (state.stale) {
        outcome = 'stale';
        text = Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiNoRecentCheck', dateTime(state.checkedAt, language, timezone || ''));
      } else if (state.outcome === 'up') {
        text = milliseconds(state.responseMs, language);
      } else if (state.outcome === 'not_checkable') {
        // D2 (final review): a container larger than 4 MB says so in a few words
        // both sides shown: their headings say from where, the cell says it in two words
        let words = Object(external_CoreHome_["translate"])(short ? 'FeinwerkUptimeMonitor_UiNotCheckableShort' : 'FeinwerkUptimeMonitor_UiNotCheckable');
        // UI review of 5.4.0, P3: the server's short reason; with both sides on the screen in its
        // own field (sides.ts sideWords), so the sides agree and split as before
        reason = fromOutside ? '' : this.shortReason(state.note);
        if (reason && !short) {
          words = Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiNotCheckableCause', reason);
        }
        if (state.note === 'too_large') {
          // UI review of 5.3.0, L3: "(over 4 MB)" stays whole
          words = keepBrackets(keepUnits(Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiTooLargeToCheck')));
        }
        text = words;
        if (fromOutside) {
          title = this.outsideReason(state);
        }
      } else {
        text = causeText(state.error, state.httpStatus !== null ? `HTTP ${state.httpStatus}` : null);
      }
      const measured = !!uptime && uptime.uptimePercent !== null && uptime.coveragePercent > 0;
      let dayOutcome = 'none';
      if (measured) {
        var _uptime$uptimePercent;
        dayOutcome = ((_uptime$uptimePercent = uptime === null || uptime === void 0 ? void 0 : uptime.uptimePercent) !== null && _uptime$uptimePercent !== void 0 ? _uptime$uptimePercent : 0) >= 100 ? 'up' : 'partial';
      }
      return {
        outcome,
        text,
        uptime: uptime && uptime.uptimePercent !== null ? percent(uptime.uptimePercent, language, 2) : '',
        dayOutcome,
        checkedAt: state && !state.stale ? state.checkedAt : '',
        tooLarge: !!state && !state.stale && state.outcome === 'not_checkable' && state.note === 'too_large',
        note: state && !state.stale && state.outcome === 'not_checkable' ? state.note : null,
        title,
        reason
      };
    },
    /** B5: "Not checkable from outside: a private or reserved address, or a port ..." */
    outsideReason(state) {
      const key = state.error ? OUTSIDE_REASONS[state.error] : undefined;
      const reason = key ? Object(external_CoreHome_["translate"])(`FeinwerkUptimeMonitor_${key}`) : causeText(state.error, null);
      return reason ? Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiNotCheckableFromOutsideWhy', reason) : Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiNotCheckableFromOutside');
    },
    /**
     * B1: what a group has from outside (only while a source of such results is active): a strip
     * when the outside measured some of the period; its cells when it has any result for one of
     * its addresses (also that it cannot check it), an uptime in the period or a strip
     */
    outsideOf(targets, uptimeRows, timeline) {
      if (!this.outside) {
        return {
          cells: false,
          strip: false
        };
      }
      const strip = !!timeline && timeline.cells.some(c => c.state !== 'future' && c.measuredSeconds > 0);
      const keys = targets.map(t => t.targetKey);
      const cells = strip || targets.some(t => !!t.states.external) || uptimeRows.some(r => r.source === 'external' && keys.includes(r.targetKey) && r.uptimePercent !== null && r.coveragePercent > 0);
      return {
        cells,
        strip
      };
    },
    /**
     * B2: "from outside", or "from outside, 1 of 4 addresses" when it covers less than the server;
     * short: the lane's label, "from outside (1 of 4)", its brackets kept together (W7)
     */
    outsideVantage(rows, short = false) {
      const outside = this.measurableCount(rows, 'external');
      if (rows.length > 1 && outside < this.measurableCount(rows, 'local')) {
        if (short) {
          return keepBrackets(Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiFromOutsideShare', String(outside), String(rows.length)));
        }
        return Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiFromOutsidePart', String(outside), String(rows.length));
      }
      return Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiFromOutside');
    },
    /**
     * What failed, for the answer line: the server's words; with results from outside, where it
     * failed when one side alone finds the address down ("HTTP 502, from outside"; L8 review of
     * 5.3.0: by sides.ts aloneDown, so no side is named while the other has not checked it since
     * the failure began or still sees an outage of its own)
     */
    causeOf(server, outside) {
      if (!outside || server.outcome === 'down') {
        return outside && aloneDown(server, outside) ? `${server.text}, ${Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiFromServer')}` : server.text;
      }
      if (outside.outcome !== 'down') {
        return server.text;
      }
      return aloneDown(outside, server) ? `${outside.text}, ${Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiFromOutside')}` : outside.text;
    },
    /**
     * D2 (Peter, 2026-11-26, "Ansonsten alle wie empfohlen umsetzen"): the sides of a table row
     * they disagree on, in order, for its sub-rows (sides.ts split, the narrow list's rule); null
     * where one line says it all
     */
    splitOf(row) {
      return this.showOutside && row.outside ? split(row.server, row.outside, !!this.past) : null;
    },
    /** D2: a sub-row's name, "Matomo server" or "Outside" (the server's name whole, W8) */
    sideName(side) {
      return keepServer(Object(external_CoreHome_["translate"])(side.key === 'server' ? 'FeinwerkUptimeMonitor_UiSourceServer' : 'FeinwerkUptimeMonitor_UiSourceOutside'));
    },
    /** D2: a sub-row's uptime; "Not measured" on a past day where nothing was */
    subUptime(side) {
      return this.uptimeOrNone(side.uptime);
    },
    /** an Uptime cell's value; "Not measured" on a past day where nothing was (D2, R1) */
    uptimeOrNone(uptime) {
      return uptime || (this.past ? Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiNotMeasured') : '');
    },
    /** D2 with NIT 3: the outside's words only while it has a current answer */
    hasWords(side) {
      return side.key === 'server' || speaks(side);
    },
    /**
     * D2: a sub-row's response in red for a failure, amber for 3a; muted for a side's "up" that
     * the one-sided rule does not count (quick UI review before 5.3.0, QL2); '' otherwise
     */
    failureTone(side, row) {
      const other = side.key === 'server' ? row.outside : row.server;
      const tone = sideTone(side, other);
      if (tone === 'down' || tone === 'partial') {
        return `is-${tone}`;
      }
      return uncounted(side, other) ? 'fwum-line--muted' : '';
    },
    /** P2: the Response cell's lines (sides.ts) */
    responseLinesOf(row) {
      return responseLines(row.server, row.outside);
    },
    /** W5: an agreeing row's value from outside, for screen readers (sides.ts aside) */
    asideOf(row) {
      return aside(row.server, row.outside);
    },
    /** one strip's HourStrip (a row, or a pair's strip on a narrow page: D2) */
    stripProps(strip) {
      return {
        cells: strip.timeline.cells,
        grain: strip.timeline.grain,
        days: strip.timeline.days || '',
        name: strip.label,
        language: this.config.language,
        timezone: this.config.timezone || '',
        targets: strip.targets,
        small: !this.isPage,
        lane: strip.lane,
        axis: strip.axis,
        now: this.tick,
        end: strip.timeline.end || ''
      };
    },
    /** P2: the Uptime cell's lines (sides.ts) */
    uptimeLinesOf(row) {
      return uptimeLines(row.server, row.outside, !!this.past);
    },
    /**
     * P2: what each side says, as the Response cell's tooltip (the detail one line leaves out); the
     * outside's reason when it cannot check the address (B5); the server's words with the reason
     * the group's answer line names (polish before 5.4.0, textTitle)
     */
    responseTitle(row) {
      if (!row.outside) {
        return row.textTitle || undefined;
      }
      const outside = row.outside.outcome === 'not_checkable' && row.outside.title ? row.outside.title : Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiCheckedFromOutsideValue', row.outside.text);
      const server = row.textTitle || Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiCheckedFromServerValue', row.server.text);
      return `${server}\n${outside}`;
    },
    /**
     * D3: the certificate figure under its days: the host when the figure stands for all the
     * addresses (one shared certificate; nothing for Matomo's addresses without their URLs),
     * else the address whose certificate expires first
     */
    certFigureSub(withCert, soonest) {
      const shared = withCert.every(r => r.certDays === soonest.certDays && r.certLevel === soonest.certLevel);
      if (shared) {
        const hosts = withCert.map(r => r.host).filter((host, n, all) => host !== '' && all.indexOf(host) === n);
        return hosts.length === 1 ? hosts[0] : '';
      }
      return this.isPage ? this.labels[soonest.key] || soonest.label : soonest.label;
    },
    /**
     * A group's answer: not reachable only when nothing answered; a partial failure is counted
     * (format.ts sidedStatusOf, the same rule as the admin overview).
     */
    groupState(rows, allOff) {
      if (!rows.length) {
        return allOff ? {
          outcome: 'off',
          text: Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiAllOff')
        } : {
          outcome: 'none',
          text: Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiNotMeasuredYet')
        };
      }
      const count = outcome => rows.filter(r => r.outcome === outcome).length;
      // 3a: every address that is down only from the Matomo server, while the outside reaches it:
      // amber, "not reachable from the Matomo server"; the answer line's cause names the side else
      // W2: while results from outside show, "Not checkable from the Matomo server", as the cells
      const state = sidedStatusOf({
        total: rows.length,
        off: 0,
        up: count('up'),
        down: count('down'),
        stale: count('stale'),
        notCheckable: count('not_checkable')
      }, rows.filter(r => r.serverOnlyDown).length, 0, this.showOutside);
      // neither side can check any of them: both named in one sentence (not when the outside has
      // no result yet or an old one)
      if (state.outcome === 'not_checkable' && this.showOutside && rows.every(r => r.outcome !== 'not_checkable' || !!r.outside && r.outside.outcome === 'not_checkable')) {
        return {
          outcome: state.outcome,
          text: Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiNotCheckableEither')
        };
      }
      return state;
    },
    /** "since 10:42 (no connection)": the oldest open outage of the failing addresses */
    downDetail(rows) {
      var _down$0$cause;
      const down = rows.filter(r => r.outcome === 'down');
      if (!down.length) {
        return '';
      }
      const keys = down.map(r => r.key);
      const starts = this.openIncidents.filter(i => i.open && i.type === 'outage' && keys.includes(i.targetKey || '')).map(i => i.start).sort();
      const parts = [];
      if (starts.length) {
        // the clock alone only while today is selected: else "since 22:06" reads as that day
        const since = this.todaySelected ? clockOrDate(starts[0], this.config.language, this.config.timezone || '', this.tick) : dateTime(starts[0], this.config.language, this.config.timezone || '');
        parts.push(Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiSince', since));
      }
      // 3a: when every one of them fails only from the Matomo server, the line before names the
      // side
      const cause = down.every(r => r.serverOnlyDown) ? down[0].server.text : (_down$0$cause = down[0].cause) !== null && _down$0$cause !== void 0 ? _down$0$cause : down[0].text;
      if (cause) {
        parts.push(`(${cause})`);
      }
      return parts.join(' ');
    },
    /**
     * The group's uptime from its hour strip (F1): reachable seconds / measured seconds of the
     * cells up to now, exact and the same as the strip by construction; measured share = measured
     * seconds / seconds of the period up to now of the addresses this server can check, as the
     * strip's tooltip counts. Without the strip: the addresses' uptimes weighted by how long each
     * was measured, rounded to 3 decimals (float sums never show 99.99 % for 100 %).
     */
    uptimeOf(rows, uptimeRows, timeline, source = 'local') {
      const {
        language
      } = this.config;
      if (timeline && timeline.cells.length) {
        const totals = stripTotals(timeline, this.tick, this.measurable(rows, source));
        if (totals.uptime === null) {
          return null;
        }
        return {
          value: percent(totals.uptime, language, 2),
          sub: Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiMeasured', sharePercent(totals.measured, language)),
          level: '',
          measured: totals.measured,
          uptime: totals.uptime
        };
      }
      const keys = rows.map(r => r.key);
      const own = uptimeRows.filter(r => r.source === source && keys.includes(r.targetKey));
      const measured = own.filter(r => r.uptimePercent !== null && r.coveragePercent > 0);
      if (!measured.length) {
        return null;
      }
      const weight = measured.reduce((sum, r) => sum + r.coveragePercent, 0);
      const up = measured.reduce((sum, r) => {
        var _r$uptimePercent;
        return sum + ((_r$uptimePercent = r.uptimePercent) !== null && _r$uptimePercent !== void 0 ? _r$uptimePercent : 0) * r.coveragePercent;
      }, 0);
      // measured as the strip counts a cell: when any of the addresses was measured (an
      // address that cannot be checked from this server adds nothing)
      const coverage = Math.max(...own.map(r => r.coveragePercent));
      const value = Math.round(up / weight * 1000) / 1000;
      return {
        value: percent(value, language, 2),
        sub: Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiMeasured', sharePercent(coverage, language)),
        level: '',
        measured: coverage,
        uptime: value
      };
    },
    /**
     * B4: a group's uptime figure: the server's, or the outside's when the group has results from
     * outside and that side is lower (or the only one), named "from outside"
     */
    lowerUptime(rows, uptimeRows, timelines, outside) {
      const server = this.uptimeOf(rows, uptimeRows, timelines[0]);
      const other = outside.cells ? this.uptimeOf(rows, uptimeRows, outside.strip ? timelines[1] : null, 'external') : null;
      if (other && (!server || other.uptime < server.uptime)) {
        return Object.assign(Object.assign({}, other), {}, {
          side: Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiFromOutside')
        });
      }
      return server ? Object.assign(Object.assign({}, server), {}, {
        side: ''
      }) : null;
    },
    /**
     * the addresses a strip cell sums: those this server cannot check measure nothing; from
     * outside, those checked from outside that can be checked
     */
    measurable(rows, source = 'local') {
      return Math.max(1, this.measurableCount(rows, source));
    },
    /**
     * measurable() without its floor of 1: from outside, the addresses with a result it can check
     * now, and on a past day those with an uptime that day (today an address the outside stopped
     * checking has hours earlier today, but no longer counts: L8 review 1). Today without any such
     * result (the outside stopped checking all of them), those with an uptime today: never "0 of 2
     * addresses" next to a measured lane (review of the 5.2.0 fixes, NIT 2)
     */
    measurableCount(rows, source) {
      if (source === 'external') {
        const current = r => !!r.outside && r.outside.outcome !== 'none' && r.outside.outcome !== 'not_checkable';
        const measured = r => !!r.outside && r.outside.uptime !== '';
        if (this.past) {
          return rows.filter(r => current(r) || measured(r)).length;
        }
        const now = rows.filter(current).length;
        return now > 0 ? now : rows.filter(measured).length;
      }
      return rows.filter(r => (r.serverOutcome || r.outcome) !== 'not_checkable').length;
    },
    certText(cert) {
      if (cert.level === 'expired') {
        return Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiCertificateExpired');
      }
      return keepUnits(cert.daysLeft === 1 ? Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiCertificateDay') : Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiCertificateDays', String(cert.daysLeft)));
    },
    /** Visitors > Uptime of this website for a period and date */
    pageUrl(period, date) {
      const params = {
        idSite: String(this.config.idSite),
        period,
        date
      };
      return `?${external_CoreHome_["MatomoUrl"].stringify(Object.assign({
        module: 'CoreHome',
        action: 'index'
      }, params))}#?${external_CoreHome_["MatomoUrl"].stringify(Object.assign(Object.assign({}, params), {}, {
        category: 'General_Visitors',
        subcategory: 'FeinwerkUptimeMonitor_Uptime'
      }))}`;
    },
    /**
     * D4 (final review): the addresses of the day's outages, each group named once, "Matomo:
     * JavaScript tracker, Interface and Tracker endpoint", then the website's
     */
    namedOutages(outages) {
      const {
        language
      } = this.config;
      const matomo = [];
      const site = [];
      // in the order of the outage list's row (OutageList what()): by kind, then key
      outages.filter((i, n, all) => all.findIndex(o => o.targetKey === i.targetKey) === n).sort((a, b) => KIND_ORDER.indexOf(a.kind || '') - KIND_ORDER.indexOf(b.kind || '') || (a.targetKey || '').localeCompare(b.targetKey || '')).forEach(i => {
        const name = this.names[i.targetKey || ''] || i.targetKey || '';
        (groupOf(i) === 'matomo' ? matomo : site).push(name);
      });
      const parts = [];
      if (matomo.length) {
        parts.push(Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiMatomoTarget', listOf(matomo, language)));
      }
      if (site.length) {
        parts.push(listOf(site, language));
      }
      // French puts a (no-break) space before the semicolon
      return parts.join(language.startsWith('fr') ? '\u00a0; ' : '; ');
    }
  }
}));
// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/UptimePage.vue?vue&type=script&lang=ts
 
// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/UptimePage.vue



UptimePagevue_type_script_lang_ts.render = render

/* harmony default export */ var UptimePage = (UptimePagevue_type_script_lang_ts);
// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-babel/node_modules/cache-loader/dist/cjs.js??ref--13-0!./node_modules/@vue/cli-plugin-babel/node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist/templateLoader.js??ref--6!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--1-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--1-1!./plugins/FeinwerkUptimeMonitor/vue/src/AdminPage.vue?vue&type=template&id=d6fa95a4

const AdminPagevue_type_template_id_d6fa95a4_hoisted_1 = ["lang"];
const AdminPagevue_type_template_id_d6fa95a4_hoisted_2 = {
  key: 0,
  class: "fwum-checks fwum-admin__server"
};
const AdminPagevue_type_template_id_d6fa95a4_hoisted_3 = {
  key: 0,
  class: "fwum-admin__php is-warn"
};
const AdminPagevue_type_template_id_d6fa95a4_hoisted_4 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
  class: "icon-warning",
  "aria-hidden": "true"
}, null, -1);
const AdminPagevue_type_template_id_d6fa95a4_hoisted_5 = {
  class: "fwum-muted"
};
const AdminPagevue_type_template_id_d6fa95a4_hoisted_6 = {
  key: 1,
  class: "fwum-admin__internet is-warn"
};
const AdminPagevue_type_template_id_d6fa95a4_hoisted_7 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
  class: "icon-warning",
  "aria-hidden": "true"
}, null, -1);
const AdminPagevue_type_template_id_d6fa95a4_hoisted_8 = {
  class: "fwum-muted"
};
const AdminPagevue_type_template_id_d6fa95a4_hoisted_9 = {
  key: 2,
  class: "fwum-admin__transport is-info"
};
const AdminPagevue_type_template_id_d6fa95a4_hoisted_10 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
  class: "icon-info",
  "aria-hidden": "true"
}, null, -1);
const AdminPagevue_type_template_id_d6fa95a4_hoisted_11 = {
  key: 3,
  class: "fwum-admin__https is-info"
};
const AdminPagevue_type_template_id_d6fa95a4_hoisted_12 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
  class: "icon-info",
  "aria-hidden": "true"
}, null, -1);
const AdminPagevue_type_template_id_d6fa95a4_hoisted_13 = {
  class: "fwum-muted"
};
const AdminPagevue_type_template_id_d6fa95a4_hoisted_14 = {
  class: "fwum-muted"
};
const AdminPagevue_type_template_id_d6fa95a4_hoisted_15 = ["href"];
const AdminPagevue_type_template_id_d6fa95a4_hoisted_16 = {
  key: 1,
  class: "fwum-loading",
  "aria-busy": "true"
};
const AdminPagevue_type_template_id_d6fa95a4_hoisted_17 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
  class: "loadingPiwik"
}, [/*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("img", {
  src: "plugins/Morpheus/images/loading-blue.gif",
  alt: ""
})], -1);
const AdminPagevue_type_template_id_d6fa95a4_hoisted_18 = [AdminPagevue_type_template_id_d6fa95a4_hoisted_17];
const AdminPagevue_type_template_id_d6fa95a4_hoisted_19 = {
  key: 2,
  class: "fwum-error",
  role: "alert"
};
const AdminPagevue_type_template_id_d6fa95a4_hoisted_20 = {
  key: 3,
  class: "fwum-table-wrap"
};
const AdminPagevue_type_template_id_d6fa95a4_hoisted_21 = ["id"];
const AdminPagevue_type_template_id_d6fa95a4_hoisted_22 = {
  class: "fwum-admin__name"
};
const AdminPagevue_type_template_id_d6fa95a4_hoisted_23 = ["href"];
const AdminPagevue_type_template_id_d6fa95a4_hoisted_24 = {
  key: 1
};
const AdminPagevue_type_template_id_d6fa95a4_hoisted_25 = ["title", "aria-label", "onClick"];
const AdminPagevue_type_template_id_d6fa95a4_hoisted_26 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
  class: "icon-edit",
  "aria-hidden": "true"
}, null, -1);
const AdminPagevue_type_template_id_d6fa95a4_hoisted_27 = [AdminPagevue_type_template_id_d6fa95a4_hoisted_26];
const AdminPagevue_type_template_id_d6fa95a4_hoisted_28 = {
  key: 0,
  class: "fwum-admin__meta fwum-muted"
};
const AdminPagevue_type_template_id_d6fa95a4_hoisted_29 = ["title"];
const AdminPagevue_type_template_id_d6fa95a4_hoisted_30 = ["id"];
const AdminPagevue_type_template_id_d6fa95a4_hoisted_31 = {
  scope: "col"
};
const AdminPagevue_type_template_id_d6fa95a4_hoisted_32 = {
  scope: "col"
};
const AdminPagevue_type_template_id_d6fa95a4_hoisted_33 = {
  key: 0,
  scope: "col"
};
const AdminPagevue_type_template_id_d6fa95a4_hoisted_34 = {
  scope: "col"
};
const AdminPagevue_type_template_id_d6fa95a4_hoisted_35 = {
  class: "fwum-admin__name"
};
const AdminPagevue_type_template_id_d6fa95a4_hoisted_36 = ["href"];
const AdminPagevue_type_template_id_d6fa95a4_hoisted_37 = {
  key: 1
};
const AdminPagevue_type_template_id_d6fa95a4_hoisted_38 = ["title", "aria-label", "onClick"];
const AdminPagevue_type_template_id_d6fa95a4_hoisted_39 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
  class: "icon-edit",
  "aria-hidden": "true"
}, null, -1);
const AdminPagevue_type_template_id_d6fa95a4_hoisted_40 = [AdminPagevue_type_template_id_d6fa95a4_hoisted_39];
const AdminPagevue_type_template_id_d6fa95a4_hoisted_41 = ["title"];
const AdminPagevue_type_template_id_d6fa95a4_hoisted_42 = {
  key: 2,
  class: "fwum-nc"
};
const AdminPagevue_type_template_id_d6fa95a4_hoisted_43 = {
  class: "fwum-note"
};
const AdminPagevue_type_template_id_d6fa95a4_hoisted_44 = ["aria-expanded", "aria-controls"];
const AdminPagevue_type_template_id_d6fa95a4_hoisted_45 = ["aria-expanded", "aria-controls"];
const AdminPagevue_type_template_id_d6fa95a4_hoisted_46 = ["href"];
const AdminPagevue_type_template_id_d6fa95a4_hoisted_47 = ["id"];
const AdminPagevue_type_template_id_d6fa95a4_hoisted_48 = {
  key: 4,
  class: "fwum-muted"
};
const AdminPagevue_type_template_id_d6fa95a4_hoisted_49 = {
  class: "fwum-checks"
};
const AdminPagevue_type_template_id_d6fa95a4_hoisted_50 = {
  key: 0
};
const AdminPagevue_type_template_id_d6fa95a4_hoisted_51 = {
  key: 2,
  class: "fwum-muted"
};
const AdminPagevue_type_template_id_d6fa95a4_hoisted_52 = ["href"];
const AdminPagevue_type_template_id_d6fa95a4_hoisted_53 = {
  key: 0
};
const AdminPagevue_type_template_id_d6fa95a4_hoisted_54 = {
  class: "fwum-muted"
};
const AdminPagevue_type_template_id_d6fa95a4_hoisted_55 = ["href"];
const AdminPagevue_type_template_id_d6fa95a4_hoisted_56 = {
  key: 1
};
const AdminPagevue_type_template_id_d6fa95a4_hoisted_57 = ["href"];
const AdminPagevue_type_template_id_d6fa95a4_hoisted_58 = {
  key: 2
};
const AdminPagevue_type_template_id_d6fa95a4_hoisted_59 = ["href"];
const AdminPagevue_type_template_id_d6fa95a4_hoisted_60 = ["href"];
function AdminPagevue_type_template_id_d6fa95a4_render(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_CopyChip = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("CopyChip");
  const _component_AdminStatus = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("AdminStatus");
  const _component_ContentBlock = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("ContentBlock");
  const _component_TargetPanel = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("TargetPanel");
  return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", {
    class: "fwum-admin",
    lang: _ctx.config.language || undefined
  }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createVNode"])(_component_ContentBlock, {
    "content-title": _ctx.translate('FeinwerkUptimeMonitor_MenuTitle')
  }, {
    default: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withCtx"])(() => [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("p", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate(_ctx.outside ? 'FeinwerkUptimeMonitor_UiAdminIntroOutside' : 'FeinwerkUptimeMonitor_UiAdminIntro')), 1), _ctx.phpDisabled.length || _ctx.config.internetOff || _ctx.config.httpsRedirect || _ctx.transportText ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("ul", AdminPagevue_type_template_id_d6fa95a4_hoisted_2, [_ctx.phpDisabled.length ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("li", AdminPagevue_type_template_id_d6fa95a4_hoisted_3, [AdminPagevue_type_template_id_d6fa95a4_hoisted_4, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", null, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("p", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiAdminPhpDisabled', _ctx.phpDisabled.join(', '))), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("p", AdminPagevue_type_template_id_d6fa95a4_hoisted_5, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate(_ctx.config.curlMissing ? 'FeinwerkUptimeMonitor_UiAdminCurlMissingHint' : 'FeinwerkUptimeMonitor_UiAdminPhpDisabledHint')), 1)])])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.config.internetOff ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("li", AdminPagevue_type_template_id_d6fa95a4_hoisted_6, [AdminPagevue_type_template_id_d6fa95a4_hoisted_7, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", null, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("p", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiInternetOff')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("p", AdminPagevue_type_template_id_d6fa95a4_hoisted_8, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiAdminInternetOffHint')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createVNode"])(_component_CopyChip, {
      class: "fwum-chip",
      line: _ctx.internetLine
    }, null, 8, ["line"])])])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.transportText ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("li", AdminPagevue_type_template_id_d6fa95a4_hoisted_9, [AdminPagevue_type_template_id_d6fa95a4_hoisted_10, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", null, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("p", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.transportText), 1)])])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.config.httpsRedirect ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("li", AdminPagevue_type_template_id_d6fa95a4_hoisted_11, [AdminPagevue_type_template_id_d6fa95a4_hoisted_12, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", null, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("p", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiAdminHttpsRedirect')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("p", AdminPagevue_type_template_id_d6fa95a4_hoisted_13, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiAdminHttpsRedirectHint')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createVNode"])(_component_CopyChip, {
      class: "fwum-chip",
      line: _ctx.httpsLine
    }, null, 8, ["line"]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("p", AdminPagevue_type_template_id_d6fa95a4_hoisted_14, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.trackerFacts.before), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("a", {
      href: _ctx.settingsUrl
    }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.trackerFacts.link), 9, AdminPagevue_type_template_id_d6fa95a4_hoisted_15), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.trackerFacts.after), 1)])])])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.loading && !_ctx.rows.length ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", AdminPagevue_type_template_id_d6fa95a4_hoisted_16, AdminPagevue_type_template_id_d6fa95a4_hoisted_18)) : _ctx.failed ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", AdminPagevue_type_template_id_d6fa95a4_hoisted_19, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("p", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiLoadFailed')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("button", {
      type: "button",
      class: "btn-flat",
      onClick: _cache[0] || (_cache[0] = (...args) => _ctx.load && _ctx.load(...args))
    }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiRetry')), 1)])) : _ctx.rows.length ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", AdminPagevue_type_template_id_d6fa95a4_hoisted_20, [_ctx.narrow ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("ul", {
      key: 0,
      id: `${_ctx.uid}-table`,
      class: "fwum-admin__list",
      role: "list"
    }, [(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderList"])(_ctx.visibleRows, row => {
      return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("li", {
        key: row.idSite
      }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", AdminPagevue_type_template_id_d6fa95a4_hoisted_22, [row.idSite > 0 ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("a", {
        key: 0,
        href: _ctx.pageUrl(row.idSite)
      }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(row.name), 9, AdminPagevue_type_template_id_d6fa95a4_hoisted_23)) : (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", AdminPagevue_type_template_id_d6fa95a4_hoisted_24, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(row.name), 1)), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("button", {
        type: "button",
        class: "btn-flat fwum-icon-only",
        title: _ctx.translate('FeinwerkUptimeMonitor_UiEditTargetsOf', row.name),
        "aria-label": _ctx.translate('FeinwerkUptimeMonitor_UiEditTargetsOf', row.name),
        onClick: $event => _ctx.openPanel(row)
      }, AdminPagevue_type_template_id_d6fa95a4_hoisted_27, 8, AdminPagevue_type_template_id_d6fa95a4_hoisted_25)]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
        class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(["fwum-admin__status", `is-${_ctx.status(row).outcome}`])
      }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createVNode"])(_component_AdminStatus, {
        row: row,
        status: _ctx.status(row),
        language: _ctx.config.language
      }, null, 8, ["row", "status", "language"])], 2), row.certificateDaysLeft !== null || row.lastCheckedAt ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", AdminPagevue_type_template_id_d6fa95a4_hoisted_28, [row.certificateDaysLeft !== null ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", {
        key: 0,
        class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(["fwum-admin__cert", _ctx.certClass(row)])
      }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiCertificateValue', _ctx.certText(row.certificateDaysLeft))), 3)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), row.lastCheckedAt ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", {
        key: 1,
        title: _ctx.when(row.lastCheckedAt, row.timezone)
      }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiChecked', _ctx.since(row.lastCheckedAt))), 9, AdminPagevue_type_template_id_d6fa95a4_hoisted_29)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)]);
    }), 128))], 8, AdminPagevue_type_template_id_d6fa95a4_hoisted_21)) : (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("table", {
      key: 1,
      id: `${_ctx.uid}-table`,
      class: "entityTable dataTable fwum-admin__table"
    }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("thead", null, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("tr", null, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("th", AdminPagevue_type_template_id_d6fa95a4_hoisted_31, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiSiteName')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("th", AdminPagevue_type_template_id_d6fa95a4_hoisted_32, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiStatus')), 1), _ctx.hasCerts ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("th", AdminPagevue_type_template_id_d6fa95a4_hoisted_33, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiCertificate')), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("th", AdminPagevue_type_template_id_d6fa95a4_hoisted_34, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiLastCheck')), 1)])]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("tbody", null, [(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderList"])(_ctx.visibleRows, row => {
      return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("tr", {
        key: row.idSite
      }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("td", AdminPagevue_type_template_id_d6fa95a4_hoisted_35, [row.idSite > 0 ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("a", {
        key: 0,
        href: _ctx.pageUrl(row.idSite)
      }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(row.name), 9, AdminPagevue_type_template_id_d6fa95a4_hoisted_36)) : (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", AdminPagevue_type_template_id_d6fa95a4_hoisted_37, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(row.name), 1)), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("button", {
        type: "button",
        class: "btn-flat fwum-icon-only",
        title: _ctx.translate('FeinwerkUptimeMonitor_UiEditTargetsOf', row.name),
        "aria-label": _ctx.translate('FeinwerkUptimeMonitor_UiEditTargetsOf', row.name),
        onClick: $event => _ctx.openPanel(row)
      }, AdminPagevue_type_template_id_d6fa95a4_hoisted_40, 8, AdminPagevue_type_template_id_d6fa95a4_hoisted_38)]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("td", {
        class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(["fwum-admin__status", `is-${_ctx.status(row).outcome}`])
      }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createVNode"])(_component_AdminStatus, {
        row: row,
        status: _ctx.status(row),
        language: _ctx.config.language
      }, null, 8, ["row", "status", "language"])], 2), _ctx.hasCerts ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("td", {
        key: 0,
        class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(["fwum-admin__cert", _ctx.certClass(row)])
      }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.certText(row.certificateDaysLeft)), 3)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("td", {
        class: "fwum-admin__when",
        title: row.lastCheckedAt ? _ctx.when(row.lastCheckedAt, row.timezone) : ''
      }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(row.lastCheckedAt ? _ctx.since(row.lastCheckedAt) : ''), 9, AdminPagevue_type_template_id_d6fa95a4_hoisted_41)]);
    }), 128))])], 8, AdminPagevue_type_template_id_d6fa95a4_hoisted_30)), _ctx.foldedRows.length ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", AdminPagevue_type_template_id_d6fa95a4_hoisted_42, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("p", AdminPagevue_type_template_id_d6fa95a4_hoisted_43, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.foldedText) + " ", 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("button", {
      type: "button",
      class: "fwum-link-button",
      "aria-expanded": _ctx.showFolded ? 'true' : 'false',
      "aria-controls": `${_ctx.uid}-table`,
      onClick: _cache[1] || (_cache[1] = $event => _ctx.showFolded = !_ctx.showFolded)
    }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate(_ctx.showFolded ? 'FeinwerkUptimeMonitor_UiHide' : 'FeinwerkUptimeMonitor_UiShow')), 9, AdminPagevue_type_template_id_d6fa95a4_hoisted_44), _ctx.foldWhy ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], {
      key: 0
    }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("button", {
      type: "button",
      class: "fwum-link-button",
      "aria-expanded": _ctx.whyOpen ? 'true' : 'false',
      "aria-controls": `${_ctx.uid}-why`,
      onClick: _cache[2] || (_cache[2] = $event => _ctx.whyOpen = !_ctx.whyOpen)
    }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiWhy')), 9, AdminPagevue_type_template_id_d6fa95a4_hoisted_45), !_ctx.config.allowPrivate ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("a", {
      key: 0,
      href: _ctx.settingsUrl
    }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiAllowPrivate')), 9, AdminPagevue_type_template_id_d6fa95a4_hoisted_46)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)], 64)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)]), _ctx.foldWhy ? Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withDirectives"])((Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("p", {
      key: 0,
      id: `${_ctx.uid}-why`,
      class: "fwum-note fwum-nc__why"
    }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.foldedWhy), 9, AdminPagevue_type_template_id_d6fa95a4_hoisted_47)), [[external_commonjs_vue_commonjs2_vue_root_Vue_["vShow"], _ctx.whyOpen]]) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)])) : !_ctx.loading ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("p", AdminPagevue_type_template_id_d6fa95a4_hoisted_48, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiFirstCheck')), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)]),
    _: 1
  }, 8, ["content-title"]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createVNode"])(_component_ContentBlock, {
    "content-title": _ctx.translate('FeinwerkUptimeMonitor_UiChecksAndAlerts')
  }, {
    default: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withCtx"])(() => [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("ul", AdminPagevue_type_template_id_d6fa95a4_hoisted_49, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("li", {
      class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(["fwum-checks__cron", _ctx.cronClass])
    }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
      class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(_ctx.cronIcon),
      "aria-hidden": "true"
    }, null, 2), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", null, [_ctx.cronOk ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("p", AdminPagevue_type_template_id_d6fa95a4_hoisted_50, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.cronText), 1)) : (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], {
      key: 1
    }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("p", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiCronHelp')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createVNode"])(_component_CopyChip, {
      class: "fwum-cron",
      line: _ctx.config.cronLine || ''
    }, null, 8, ["line"])], 64)), _ctx.config.internetOff ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("p", AdminPagevue_type_template_id_d6fa95a4_hoisted_51, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiCronInternetOff')), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)])], 2), _ctx.config.external ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("li", {
      key: 0,
      class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(["fwum-checks__outside", _ctx.config.external.active ? 'is-ok' : 'is-warn'])
    }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
      class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(_ctx.config.external.active ? 'icon-ok' : 'icon-warning'),
      "aria-hidden": "true"
    }, null, 2), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", null, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("p", null, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.outsideRowText) + " ", 1), _ctx.config.external.settingsUrl ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("a", {
      key: 0,
      href: _ctx.config.external.settingsUrl
    }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiOutsideSettings')), 9, AdminPagevue_type_template_id_d6fa95a4_hoisted_52)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)])])], 2)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), !_ctx.outsideAlerts || _ctx.config.sentinel === 'active' ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("li", {
      key: 1,
      class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(["fwum-checks__alerts", _ctx.alertsOk ? 'is-ok' : 'is-warn'])
    }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
      class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(_ctx.alertsOk ? 'icon-ok' : 'icon-warning'),
      "aria-hidden": "true"
    }, null, 2), _ctx.alertsOk ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", AdminPagevue_type_template_id_d6fa95a4_hoisted_53, [_ctx.config.sentinel === 'active' ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], {
      key: 0
    }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("p", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiSentinelActive')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("p", AdminPagevue_type_template_id_d6fa95a4_hoisted_54, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.sentinelFacts.before), 1), _ctx.config.sentinelSettings && _ctx.sentinelFacts.link ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("a", {
      key: 0,
      href: _ctx.config.sentinelSettings
    }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.sentinelFacts.link), 9, AdminPagevue_type_template_id_d6fa95a4_hoisted_55)) : (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], {
      key: 1
    }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.sentinelFacts.link), 1)], 64)), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.sentinelFacts.after), 1)])], 64)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)])) : _ctx.config.sentinel === 'old' ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", AdminPagevue_type_template_id_d6fa95a4_hoisted_56, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("p", null, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiSentinelOld', _ctx.config.sentinelVersion || '')) + " ", 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("a", {
      href: _ctx.pluginsUrl
    }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiSentinelPluginsLink')), 9, AdminPagevue_type_template_id_d6fa95a4_hoisted_57)])])) : (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", AdminPagevue_type_template_id_d6fa95a4_hoisted_58, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("p", null, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate(_ctx.sentinelKey)) + " ", 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("a", {
      href: _ctx.sentinelUrl,
      target: "_blank",
      rel: "noopener"
    }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiSentinelLink')), 9, AdminPagevue_type_template_id_d6fa95a4_hoisted_59)])]))], 2)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("p", null, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("a", {
      href: _ctx.settingsUrl
    }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiSettings')), 9, AdminPagevue_type_template_id_d6fa95a4_hoisted_60)])]),
    _: 1
  }, 8, ["content-title"]), _ctx.panelSite !== null ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createBlock"])(_component_TargetPanel, {
    key: 0,
    "id-site": _ctx.panelSite,
    "site-name": _ctx.panelName,
    notice: _ctx.config.internetOff ? _ctx.translate('FeinwerkUptimeMonitor_UiInternetOff') : '',
    onClose: _ctx.onPanelClose
  }, null, 8, ["id-site", "site-name", "notice", "onClose"])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)], 8, AdminPagevue_type_template_id_d6fa95a4_hoisted_1);
}
// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/AdminPage.vue?vue&type=template&id=d6fa95a4

// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/links.ts
/*!
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

/** Visitors > Uptime of a website for today (the admin overview's links) */
function uptimePageToday(idSite) {
  const query = external_CoreHome_["MatomoUrl"].stringify({
    module: 'CoreHome',
    action: 'index',
    idSite,
    period: 'day',
    date: 'today'
  });
  const hash = external_CoreHome_["MatomoUrl"].stringify({
    idSite,
    period: 'day',
    date: 'today',
    category: 'General_Visitors',
    subcategory: 'FeinwerkUptimeMonitor_Uptime'
  });
  return `?${query}#?${hash}`;
}
// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-babel/node_modules/cache-loader/dist/cjs.js??ref--13-0!./node_modules/@vue/cli-plugin-babel/node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist/templateLoader.js??ref--6!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--1-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--1-1!./plugins/FeinwerkUptimeMonitor/vue/src/AdminStatus.vue?vue&type=template&id=29596a4a

const AdminStatusvue_type_template_id_29596a4a_hoisted_1 = {
  class: "fwum-cell-label"
};
const AdminStatusvue_type_template_id_29596a4a_hoisted_2 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
  class: "fwum-dot",
  "aria-hidden": "true"
}, null, -1);
const AdminStatusvue_type_template_id_29596a4a_hoisted_3 = {
  key: 0,
  class: "fwum-admin__containers"
};
const AdminStatusvue_type_template_id_29596a4a_hoisted_4 = {
  key: 1,
  class: "fwum-admin__containers"
};
const AdminStatusvue_type_template_id_29596a4a_hoisted_5 = ["href"];
function AdminStatusvue_type_template_id_29596a4a_render(_ctx, _cache, $props, $setup, $data, $options) {
  return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], null, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", AdminStatusvue_type_template_id_29596a4a_hoisted_1, [AdminStatusvue_type_template_id_29596a4a_hoisted_2, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.status.text), 1)]), _ctx.row.containersDown && _ctx.row.containersDown.length > 3 ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", AdminStatusvue_type_template_id_29596a4a_hoisted_3, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate(`FeinwerkUptimeMonitor_UiAdminContainersDownMany${_ctx.status.side || ''}`, String(_ctx.row.containersDown.length))), 1)) : _ctx.row.containersDown && _ctx.row.containersDown.length ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", AdminStatusvue_type_template_id_29596a4a_hoisted_4, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.containerLine.before), 1), (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderList"])(_ctx.containerLine.parts, (part, i) => {
    return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], {
      key: i
    }, [part.index >= 0 ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("a", {
      key: 0,
      href: _ctx.pageUrl(_ctx.row.containersDown[part.index].idSite)
    }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(part.text), 9, AdminStatusvue_type_template_id_29596a4a_hoisted_5)) : (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], {
      key: 1
    }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(part.text), 1)], 64))], 64);
  }), 128)), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.containerLine.after), 1)])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)], 64);
}
// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/AdminStatus.vue?vue&type=template&id=29596a4a

// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-typescript/node_modules/cache-loader/dist/cjs.js??ref--15-0!./node_modules/babel-loader/lib!./node_modules/@vue/cli-plugin-typescript/node_modules/ts-loader??ref--15-2!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--1-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--1-1!./plugins/FeinwerkUptimeMonitor/vue/src/AdminStatus.vue?vue&type=script&lang=ts




/* harmony default export */ var AdminStatusvue_type_script_lang_ts = (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["defineComponent"])({
  props: {
    row: {
      type: Object,
      required: true
    },
    /**
     * the row's status; side FromServer or FromOutside when it names the side of a one-sided
     * failure
     */
    status: {
      type: Object,
      required: true
    },
    language: {
      type: String,
      default: ''
    }
  },
  computed: {
    /**
     * "Tag Manager container of A not reachable", "Tag Manager containers of A, B and C not
     * reachable" around its links (fr "du site A", "des sites A et B")
     */
    containerLine() {
      const mark = '\u0001';
      const names = (this.row.containersDown || []).map(s => s.name);
      // the status above names the side of a one-sided failure: the containers fail on that side
      // (UI review F1)
      const side = this.status.side || '';
      const [before, after = ''] = Object(external_CoreHome_["translate"])(names.length > 1 ? `FeinwerkUptimeMonitor_UiAdminContainersDownSeveral${side}` : `FeinwerkUptimeMonitor_UiAdminContainersDown${side}`, mark).split(mark);
      return {
        before,
        after,
        parts: listParts(names, this.language)
      };
    }
  },
  methods: {
    translate: external_CoreHome_["translate"],
    pageUrl: uptimePageToday
  }
}));
// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/AdminStatus.vue?vue&type=script&lang=ts
 
// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/AdminStatus.vue



AdminStatusvue_type_script_lang_ts.render = AdminStatusvue_type_template_id_29596a4a_render

/* harmony default export */ var AdminStatus = (AdminStatusvue_type_script_lang_ts);
// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-typescript/node_modules/cache-loader/dist/cjs.js??ref--15-0!./node_modules/babel-loader/lib!./node_modules/@vue/cli-plugin-typescript/node_modules/ts-loader??ref--15-2!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--1-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--1-1!./plugins/FeinwerkUptimeMonitor/vue/src/AdminPage.vue?vue&type=script&lang=ts










/* harmony default export */ var AdminPagevue_type_script_lang_ts = (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["defineComponent"])({
  components: {
    ContentBlock: external_CoreHome_["ContentBlock"],
    TargetPanel: TargetPanel,
    AdminStatus: AdminStatus,
    CopyChip: CopyChip
  },
  props: {
    config: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      rows: [],
      loading: true,
      failed: false,
      panelSite: null,
      panelName: '',
      /** the folded websites shown in the table again, and the reason open */
      showFolded: false,
      whyOpen: false,
      uid: `fwum-admin-${Math.random().toString(36).slice(2, 8)}`,
      /** the screen's clock: "3 minutes ago" follows it every minute */
      tick: Date.now(),
      timer: 0,
      /** narrower than a phone (B5): stacked rows instead of the table */
      narrow: false,
      resize: null
    };
  },
  computed: {
    /** Problems first: websites with outages, then those that cannot be checked, then the rest. */
    sorted() {
      const rank = row => {
        const {
          outcome
        } = this.status(row);
        if (outcome === 'down' || outcome === 'partial') {
          return 0;
        }
        return ['stale', 'not_checkable', 'off'].includes(outcome) ? 1 : 2;
      };
      // Matomo first (it carries every website), then problems first
      return [...this.rows].sort((a, b) => Number(b.idSite === 0) - Number(a.idSite === 0) || rank(a) - rank(b) || a.idSite - b.idSite);
    },
    /** websites (never Matomo) this server cannot check: one line below the table (D4) */
    foldedRows() {
      return this.sorted.filter(row => row.idSite > 0 && this.status(row).outcome === 'not_checkable');
    },
    /** shown again, the folded rows come last, right above their line */
    visibleRows() {
      const folded = this.foldedRows.map(row => row.idSite);
      const rest = this.sorted.filter(row => !folded.includes(row.idSite));
      return this.showFolded ? [...rest, ...this.foldedRows] : rest;
    },
    /** B3: the outside said it cannot check any of the folded websites either */
    foldedEither() {
      return this.outside && this.foldedRows.length > 0 && this.foldedRows.every(row => this.eitherSide(row));
    },
    /**
     * up to three websites by name (the answer without a click), more as a count; "from this
     * server" unless no side can check them (B3); while results from outside come in "from the
     * Matomo server", as the status rows say (follow-up W2)
     */
    foldedText() {
      const count = this.foldedRows.length;
      const side = this.outside ? 'FromServer' : '';
      const keys = this.foldedEither ? ['UiAdminCannotCheckNamedOne', 'UiAdminCannotCheckNamedMany', 'UiAdminCannotCheckMany'] : ['UiAdminNotCheckableNamedOne', 'UiAdminNotCheckableNamedMany', 'UiAdminNotCheckableMany'].map(key => `${key}${side}`);
      if (count <= 3) {
        const names = listOf(this.foldedRows.map(row => row.name), this.config.language);
        return Object(external_CoreHome_["translate"])(`FeinwerkUptimeMonitor_${keys[count === 1 ? 0 : 1]}`, names);
      }
      return Object(external_CoreHome_["translate"])(`FeinwerkUptimeMonitor_${keys[2]}`, String(count));
    },
    /**
     * how the checks are sent when it is not curl_multi side by side: one after the other through
     * curl_exec, or through PHP's own streams; nothing while Matomo's internet features are off
     * (nothing is sent) or while the php row names missing functions (no way works, or the
     * streams cannot send https): "they work as usual" would not be true there
     */
    transportText() {
      const keys = {
        curl_exec: 'FeinwerkUptimeMonitor_UiAdminTransportCurlExec',
        streams: 'FeinwerkUptimeMonitor_UiAdminTransportStreams'
      };
      const key = keys[this.config.transport || ''];
      return key && !this.config.internetOff && !this.phpDisabled.length ? Object(external_CoreHome_["translate"])(key) : '';
    },
    /** the PHP functions the latest check run did not find (the server's php.ini disables them) */
    phpDisabled() {
      return this.config.disabledPhpFunctions || [];
    },
    /**
     * the fold's "Why?" and "Allow private addresses": not while the line above the table names
     * the reason (PHP functions disabled, Matomo's internet features off)
     */
    foldWhy() {
      return !this.phpDisabled.length && !this.config.internetOff;
    },
    /** another plugin delivers results checked from outside: the overview combines both sides */
    outside() {
      return !!this.config.external && this.config.external.active;
    },
    /** P4: one row: checked from outside, when the latest results arrived, and its alerts */
    outsideRowText() {
      return this.outsideAlerts ? `${this.outsideText} ${this.outsideAlertsText}` : this.outsideText;
    },
    /** that plugin sends alerts for outages itself */
    outsideAlerts() {
      var _this$config$external;
      return this.outside && !!((_this$config$external = this.config.external) !== null && _this$config$external !== void 0 && _this$config$external.alerts);
    },
    /** someone sends alerts: Feinwerk Sentinel, or the plugin that checks from outside */
    alertsOk() {
      return this.config.sentinel === 'active' || this.outsideAlerts;
    },
    /** "<its own name> sends alerts for outages" */
    outsideAlertsText() {
      var _this$config$external2;
      return Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiOutsideAlerts', ((_this$config$external2 = this.config.external) === null || _this$config$external2 === void 0 ? void 0 : _this$config$external2.name) || '');
    },
    /** a system cron runs the checks (IntervalTracker on the server) */
    cronOk() {
      var _this$config$cron;
      return !!((_this$config$cron = this.config.cron) !== null && _this$config$cron !== void 0 && _this$config$cron.active);
    },
    /** L8: the cron runs, but while Matomo's internet features are off the checks send nothing */
    cronClass() {
      if (!this.cronOk) {
        return 'is-warn';
      }
      return this.config.internetOff ? 'is-info' : 'is-ok';
    },
    cronIcon() {
      if (!this.cronOk) {
        return 'icon-warning';
      }
      return this.config.internetOff ? 'icon-info' : 'icon-ok';
    },
    /** P2: the opt-in's line for [FeinwerkUptimeMonitor] (configLines.ts) */
    internetLine() {
      return INTERNET_LINE;
    },
    /** P2: the line for [General] (never its header: the section holds Matomo's salt) */
    httpsLine() {
      return 'assume_secure_protocol = 1';
    },
    /** L6: UiAdminHttpsTrackerAddress around the field's name (%1$s ... %2$s), linked */
    trackerFacts() {
      const [before, rest = ''] = Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiAdminHttpsTrackerAddress', '\u0001', '\u0002').split('\u0001');
      const [link, after = ''] = rest.split('\u0002');
      return {
        before,
        link,
        after
      };
    },
    cronText() {
      var _this$config$cron2;
      const seconds = ((_this$config$cron2 = this.config.cron) === null || _this$config$cron2 === void 0 ? void 0 : _this$config$cron2.intervalSeconds) || 60;
      return seconds <= 90 ? Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiCronActiveMinute') : Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiCronActive', duration(seconds, this.config.language));
    },
    /** UiSentinelFacts around its link words (%1$s ... %2$s) */
    sentinelFacts() {
      const [before, rest = ''] = Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiSentinelFacts', '\u0001', '\u0002').split('\u0001');
      const [link, after = ''] = rest.split('\u0002');
      return {
        before,
        link,
        after
      };
    },
    /** "Why?" of the folded websites: the server's reasons, and the outside's when it cannot too */
    foldedWhy() {
      const help = Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiAdminNotCheckableHelp');
      return this.foldedEither ? `${help} ${Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiNotCheckableOutsideHelp')}` : help;
    },
    /**
     * checked from outside too, with the time of the latest results (L8 review 6: resultsAt, not
     * reachedAt, which a push of settings moves too); or not active
     */
    outsideText() {
      const source = this.config.external;
      if (!source || !source.active || !source.reachedAt) {
        return Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiOutsidePaused');
      }
      if (!source.resultsAt) {
        return Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiOutsideActiveNoResults');
      }
      return Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiOutsideActive', ago(source.resultsAt, this.config.language, this.tick));
    },
    /** installed but deactivated, or not there at all */
    sentinelKey() {
      return this.config.sentinel === 'inactive' ? 'FeinwerkUptimeMonitor_UiSentinelInactive' : 'FeinwerkUptimeMonitor_UiSentinelMissing';
    },
    /** Administration > Plugins, where an old Sentinel gets its update */
    pluginsUrl() {
      return `?${external_CoreHome_["MatomoUrl"].stringify({
        module: 'CorePluginsAdmin',
        action: 'plugins'
      })}`;
    },
    /** Feinwerk Sentinel's store page in the page language (German or English) */
    sentinelUrl() {
      const lang = (this.config.language || '').startsWith('de') ? 'de' : 'en';
      return `https://plugins.feinwerk.io/${lang}/plugins/FeinwerkSentinel?mtm_campaign=plugin-link&mtm_source=FeinwerkUptimeMonitor`;
    },
    /** the certificate column only where some website has one (no column of empty cells) */
    hasCerts() {
      return this.rows.some(r => r.certificateDaysLeft !== null);
    },
    settingsUrl() {
      return `?${external_CoreHome_["MatomoUrl"].stringify({
        module: 'CoreAdminHome',
        action: 'generalSettings'
      })}#/FeinwerkUptimeMonitor`;
    }
  },
  mounted() {
    this.load();
    this.timer = window.setInterval(() => {
      this.tick = Date.now();
    }, 60000);
    if (this.$el instanceof HTMLElement) {
      this.resize = observeNarrow(this.$el, narrow => {
        this.narrow = narrow;
      });
    }
  },
  beforeUnmount() {
    window.clearInterval(this.timer);
    if (this.resize) {
      this.resize.disconnect();
    }
  },
  methods: {
    translate: external_CoreHome_["translate"],
    load() {
      this.loading = true;
      api.overview().then(rows => {
        this.rows = rows;
        this.failed = false;
        this.tick = Date.now();
      }).catch(() => {
        this.failed = true;
      }).finally(() => {
        this.loading = false;
      });
    },
    /** in the row's timezone (Matomo itself: UTC), named; a fixed offset names itself */
    when(iso, timezone) {
      const text = dateTime(iso, this.config.language, timezone || '');
      return zoneOf(timezone || '').name ? `${text} (${timezone})` : text;
    },
    since(iso) {
      return ago(iso, this.config.language, this.tick);
    },
    openPanel(row) {
      this.panelName = row.name;
      this.panelSite = row.idSite;
    },
    /**
     * the same rule as the cards of the uptime page (format.ts sidedStatusOf): a one-sided failure
     * names its side (3a: only from the Matomo server, amber); not checkable from either side (the
     * outside says so too): both named, as the page's answer line does (B3)
     */
    status(row) {
      const state = sidedStatusOf({
        total: row.targets,
        off: row.off,
        up: row.up,
        down: row.down,
        stale: row.stale,
        notCheckable: row.notCheckable
      }, this.outside ? row.downFromServerOnly || 0 : 0, this.outside ? row.downFromOutsideOnly || 0 : 0, this.outside);
      return state.outcome === 'not_checkable' && this.outside && this.eitherSide(row) ? {
        outcome: state.outcome,
        text: Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiNotCheckableEither')
      } : state;
    },
    /** B3: the outside cannot check any of the row's addresses that this server cannot check */
    eitherSide(row) {
      return row.notCheckable > 0 && (row.notCheckableOutside || 0) >= row.notCheckable;
    },
    certText(days) {
      if (days === null) {
        // no https address, or its certificate not read yet
        return '';
      }
      if (days < 0) {
        return Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiCertificateExpired');
      }
      return keepUnits(days === 1 ? Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiCertificateDay') : Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiCertificateDays', String(days)));
    },
    /** the soonest certificate's level (API certificateLevel) as a class: is-warning ... */
    certClass(row) {
      return row.certificateLevel ? `is-${row.certificateLevel}` : '';
    },
    pageUrl: uptimePageToday,
    onPanelClose(changed) {
      this.panelSite = null;
      if (changed) {
        this.load();
      }
    }
  }
}));
// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/AdminPage.vue?vue&type=script&lang=ts
 
// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/AdminPage.vue



AdminPagevue_type_script_lang_ts.render = AdminPagevue_type_template_id_d6fa95a4_render

/* harmony default export */ var AdminPage = (AdminPagevue_type_script_lang_ts);
// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/index.ts
/*!
 * Matomo - free/libre analytics platform
 *
 * @link    https://matomo.org
 * @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */


// CONCATENATED MODULE: ./node_modules/@vue/cli-service/lib/commands/build/entry-lib-no-default.js




/***/ })

/******/ });
});
//# sourceMappingURL=FeinwerkUptimeMonitor.umd.js.map