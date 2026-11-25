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

// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-babel/node_modules/cache-loader/dist/cjs.js??ref--13-0!./node_modules/@vue/cli-plugin-babel/node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist/templateLoader.js??ref--6!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--1-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--1-1!./plugins/FeinwerkUptimeMonitor/vue/src/UptimePage.vue?vue&type=template&id=1604bff4

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
const _hoisted_13 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
  class: "fwum-dot",
  "aria-hidden": "true"
}, null, -1);
const _hoisted_14 = {
  class: "fwum-state"
};
const _hoisted_15 = {
  key: 0,
  class: "fwum-answer__detail"
};
const _hoisted_16 = {
  key: 1,
  class: "fwum-muted"
};
const _hoisted_17 = {
  key: 0,
  class: "fwum-answer__actions"
};
const _hoisted_18 = ["disabled"];
const _hoisted_19 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
  class: "icon-reload",
  "aria-hidden": "true"
}, null, -1);
const _hoisted_20 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
  class: "icon-edit",
  "aria-hidden": "true"
}, null, -1);
const _hoisted_21 = {
  key: 0,
  class: "fwum-note",
  role: "status"
};
const _hoisted_22 = {
  key: 1,
  class: "fwum-figures"
};
const _hoisted_23 = {
  key: 1,
  class: "fwum-figures__sub"
};
const _hoisted_24 = {
  key: 2,
  class: "fwum-figures__spark"
};
const _hoisted_25 = {
  key: 2,
  class: "fwum-note"
};
const _hoisted_26 = {
  key: 3,
  class: "fwum-strips"
};
const _hoisted_27 = {
  key: 0,
  class: "fwum-strips__name",
  "aria-hidden": "true"
};
const _hoisted_28 = {
  key: 0,
  class: "fwum-legend"
};
const _hoisted_29 = {
  class: "is-up"
};
const _hoisted_30 = {
  class: "is-partial"
};
const _hoisted_31 = {
  class: "is-down"
};
const _hoisted_32 = {
  class: "is-none"
};
const _hoisted_33 = {
  key: 4,
  class: "fwum-table-wrap"
};
const _hoisted_34 = {
  class: "dataTable fwum-table"
};
const _hoisted_35 = {
  scope: "col",
  class: "label"
};
const _hoisted_36 = {
  scope: "col"
};
const _hoisted_37 = {
  scope: "col"
};
const _hoisted_38 = {
  key: 0,
  scope: "col"
};
const _hoisted_39 = {
  class: "fwum-group-row"
};
const _hoisted_40 = ["colspan"];
const _hoisted_41 = {
  key: 0,
  class: "fwum-group-empty"
};
const _hoisted_42 = ["colspan"];
const _hoisted_43 = {
  class: "fwum-muted"
};
const _hoisted_44 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
  class: "icon-edit",
  "aria-hidden": "true"
}, null, -1);
const _hoisted_45 = ["href"];
const _hoisted_46 = ["title"];
const _hoisted_47 = {
  class: "fwum-cell-label"
};
const _hoisted_48 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
  class: "fwum-dot",
  "aria-hidden": "true"
}, null, -1);
const _hoisted_49 = {
  class: "fwum-targets__label"
};
const _hoisted_50 = {
  class: "column fwum-targets__text"
};
const _hoisted_51 = {
  class: "column"
};
const _hoisted_52 = {
  key: 0,
  class: "fwum-muted"
};
const _hoisted_53 = {
  key: 1,
  class: "fwum-targets"
};
const _hoisted_54 = ["title"];
const _hoisted_55 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
  class: "fwum-dot",
  "aria-hidden": "true"
}, null, -1);
const _hoisted_56 = {
  class: "fwum-targets__label"
};
const _hoisted_57 = {
  class: "fwum-targets__text"
};
const _hoisted_58 = {
  class: "fwum-targets__uptime"
};
const _hoisted_59 = {
  key: 6,
  class: "fwum-nc"
};
const _hoisted_60 = {
  class: "fwum-note"
};
const _hoisted_61 = ["aria-expanded", "aria-controls"];
const _hoisted_62 = ["href"];
const _hoisted_63 = ["id"];
const _hoisted_64 = {
  key: 7,
  class: "fwum-open-page"
};
const _hoisted_65 = ["href"];
function render(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_Sparkline = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("Sparkline");
  const _component_HourStrip = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("HourStrip");
  const _component_PromoCard = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("PromoCard");
  const _component_OutageList = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("OutageList");
  const _component_FeedbackBar = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("FeedbackBar");
  const _component_PromoLine = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("PromoLine");
  const _component_TargetPanel = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("TargetPanel");
  return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", {
    class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(["fwum-page", `fwum-page--${_ctx.config.variant}`]),
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
  }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", _hoisted_11, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", _hoisted_12, [(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderList"])(_ctx.answer, (line, i) => {
    return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("p", {
      key: line.key,
      class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(["fwum-answer__line", `is-${line.outcome}`])
    }, [_hoisted_13, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("strong", _hoisted_14, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(line.text), 1), line.detail ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", _hoisted_15, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(line.detail), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), i === _ctx.freshnessLine && _ctx.freshness ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", _hoisted_16, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.freshness), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)], 2);
  }), 128))]), _ctx.isPage && _ctx.config.isAdmin ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", _hoisted_17, [_ctx.siteRows.length || !_ctx.siteTargetCount ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("button", {
    key: 0,
    type: "button",
    class: "btn-flat fwum-icon-button",
    disabled: _ctx.checking,
    onClick: _cache[3] || (_cache[3] = (...args) => _ctx.checkNow && _ctx.checkNow(...args))
  }, [_hoisted_19, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(" " + Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate(_ctx.checking ? 'FeinwerkUptimeMonitor_UiChecking' : 'FeinwerkUptimeMonitor_UiCheckNow')), 1)], 8, _hoisted_18)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("button", {
    type: "button",
    class: "btn-flat fwum-icon-button",
    onClick: _cache[4] || (_cache[4] = $event => _ctx.panelOpen = true)
  }, [_hoisted_20, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(" " + Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiEditTargets')), 1)])])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)]), _ctx.checkNote ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("p", _hoisted_21, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.checkNote), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.figures.length ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("dl", _hoisted_22, [(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderList"])(_ctx.figures, figure => {
    return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", {
      key: figure.key
    }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("dt", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(figure.label), 1), figure.value ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("dd", {
      key: 0,
      class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(figure.level ? `is-${figure.level}` : undefined)
    }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(figure.value), 3)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), figure.sub ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("dd", _hoisted_23, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(figure.sub), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), figure.key === 'tracker' && _ctx.sparkValues.length > 1 ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("dd", _hoisted_24, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createVNode"])(_component_Sparkline, {
      values: _ctx.sparkValues,
      label: _ctx.sparkLabel,
      width: _ctx.isPage ? 160 : 120,
      height: 28
    }, null, 8, ["values", "label", "width"])])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)]);
  }), 128))])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.config.queuedTracking && _ctx.trackerTime ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("p", _hoisted_25, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiQueuedTracking')), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.strips.length ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", _hoisted_26, [(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderList"])(_ctx.strips, strip => {
    return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", {
      key: strip.key,
      class: "fwum-strips__row"
    }, [_ctx.isPage ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", _hoisted_27, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(strip.name), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createVNode"])(_component_HourStrip, {
      cells: strip.timeline.cells,
      grain: strip.timeline.grain,
      days: strip.timeline.days || '',
      name: strip.name,
      language: _ctx.config.language,
      timezone: _ctx.config.timezone || '',
      targets: strip.targets,
      small: !_ctx.isPage,
      now: _ctx.tick
    }, null, 8, ["cells", "grain", "days", "name", "language", "timezone", "targets", "small", "now"])]);
  }), 128)), _ctx.isPage ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("ul", _hoisted_28, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("li", _hoisted_29, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiReachable')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("li", _hoisted_30, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiPartlyReachable')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("li", _hoisted_31, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiNotReachable')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("li", _hoisted_32, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiNotMeasured')), 1)])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.isPage ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", _hoisted_33, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("table", _hoisted_34, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("thead", null, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("tr", null, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("th", _hoisted_35, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiAddress')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("th", _hoisted_36, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiResponse')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("th", _hoisted_37, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiUptime')), 1), _ctx.hasCerts ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("th", _hoisted_38, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiCertificate')), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)])]), (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderList"])(_ctx.groups, group => {
    return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("tbody", {
      key: group.key
    }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("tr", _hoisted_39, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("th", {
      colspan: _ctx.columnCount,
      scope: "rowgroup"
    }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(group.name), 9, _hoisted_40)]), !group.rows.length ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("tr", _hoisted_41, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("td", {
      colspan: _ctx.columnCount,
      class: "label"
    }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", _hoisted_43, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(group.note), 1), group.key === 'site' && _ctx.config.isAdmin ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("button", {
      key: 0,
      type: "button",
      class: "btn-flat fwum-icon-button",
      onClick: _cache[5] || (_cache[5] = $event => _ctx.panelOpen = true)
    }, [_hoisted_44, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(" " + Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiEditTargets')), 1)])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), group.key === 'matomo' && _ctx.config.isSuperUser && !_ctx.config.embedded ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("a", {
      key: 1,
      class: "fwum-inline-link",
      href: _ctx.adminUrl
    }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiEditTargets')), 9, _hoisted_45)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)], 8, _hoisted_42)])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderList"])(group.rows, row => {
      return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("tr", {
        key: row.key,
        class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(`is-${row.outcome}`)
      }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("td", {
        class: "label",
        title: row.title
      }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", _hoisted_47, [_hoisted_48, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", _hoisted_49, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(row.label), 1)])], 8, _hoisted_46), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("td", _hoisted_50, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(row.text), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("td", _hoisted_51, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(row.uptime), 1), _ctx.hasCerts ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("td", {
        key: 0,
        class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(["column fwum-targets__cert", `is-${row.certLevel}`])
      }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(row.cert), 3)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)], 2);
    }), 128))]);
  }), 128))])])) : _ctx.widgetGroup ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], {
    key: 5
  }, [!_ctx.widgetGroup.rows.length ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("p", _hoisted_52, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.widgetGroup.note), 1)) : (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("ul", _hoisted_53, [(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderList"])(_ctx.widgetRows, row => {
    return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("li", {
      key: row.key,
      class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(`is-${row.outcome}`),
      title: row.title
    }, [_hoisted_55, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", _hoisted_56, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(row.label), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", _hoisted_57, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(row.text), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", _hoisted_58, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(row.uptime), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
      class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(["fwum-targets__cert", `is-${row.certLevel}`])
    }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(row.cert), 3)], 10, _hoisted_54);
  }), 128))]))], 64)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.notCheckableCount ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", _hoisted_59, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("p", _hoisted_60, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.notCheckableText) + " ", 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("button", {
    type: "button",
    class: "fwum-link-button",
    "aria-expanded": _ctx.whyOpen ? 'true' : 'false',
    "aria-controls": `${_ctx.uid}-why`,
    onClick: _cache[6] || (_cache[6] = $event => _ctx.whyOpen = !_ctx.whyOpen)
  }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiWhy')), 9, _hoisted_61), _ctx.config.isSuperUser && !_ctx.config.embedded ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("a", {
    key: 0,
    href: _ctx.settingsUrl
  }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiAllowPrivate')), 9, _hoisted_62)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withDirectives"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("p", {
    id: `${_ctx.uid}-why`,
    class: "fwum-note fwum-nc__why"
  }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiNotCheckableHelp')), 1), !(_ctx.config.isSuperUser && !_ctx.config.embedded) ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], {
    key: 0
  }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiNotCheckableSettings')), 1)], 64)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)], 8, _hoisted_63), [[external_commonjs_vue_commonjs2_vue_root_Vue_["vShow"], _ctx.whyOpen]])])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), !_ctx.isPage && _ctx.widgetDown && !_ctx.config.embedded ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("p", _hoisted_64, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("a", {
    href: _ctx.uptimePageUrl
  }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiOpenPage')), 9, _hoisted_65)])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createVNode"])(_component_PromoCard, {
    card: _ctx.config.promoCard || null,
    "dismiss-label": _ctx.translate('FeinwerkUptimeMonitor_PromoDismiss')
  }, null, 8, ["card", "dismiss-label"]), _ctx.isPage ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createBlock"])(_component_OutageList, {
    key: 8,
    incidents: _ctx.shownIncidents,
    labels: _ctx.labels,
    language: _ctx.config.language,
    timezone: _ctx.config.timezone || '',
    total: _ctx.incidents.length,
    "total-is-minimum": _ctx.incidentsMore,
    "can-show-more": _ctx.canShowMore,
    "loading-more": _ctx.loadingMore,
    onMore: _ctx.showMoreOutages
  }, null, 8, ["incidents", "labels", "language", "timezone", "total", "total-is-minimum", "can-show-more", "loading-more", "onMore"])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)], 64)), _ctx.config.feedback ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createBlock"])(_component_FeedbackBar, {
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
    onClose: _ctx.onPanelClose
  }, null, 8, ["id-site", "site-name", "onClose"])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)], 64))], 10, _hoisted_1);
}
// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/UptimePage.vue?vue&type=template&id=1604bff4

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
  /** limit: 1 to 1000 per request; the page asks for more with "Show more" */
  incidents(idSite, period, timezoneOf = 0, limit = 100) {
    return get('getIncidents', Object.assign(Object.assign({
      idSite
    }, period), {}, {
      limit,
      timezoneOf
    }));
  },
  /** the outages still open now ("since when" in the answer line), whatever period is viewed */
  openIncidents(idSite, timezoneOf = 0) {
    return external_CoreHome_["AjaxHelper"].fetch({
      method: `${MODULE}.getIncidents`,
      idSite,
      period: 'day',
      date: 'today',
      state: 'open',
      limit: 100,
      timezoneOf
    }, {
      createErrorNotification: false
    });
  },
  /**
   * The hour strip: one cell per hour (a day) or per day, checked from the Matomo server, like
   * the rest of the page. A failing strip leaves the page as it is: no toast.
   */
  timeline(idSite, period, timezoneOf = 0) {
    return external_CoreHome_["AjaxHelper"].fetch(Object.assign(Object.assign({
      method: `${MODULE}.getTimeline`,
      idSite
    }, period), {}, {
      source: 'local',
      timezoneOf
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
function milliseconds(value, language) {
  return value === null ? '' : `${new Intl.NumberFormat(locale(language)).format(value)} ms`;
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
/** The day of a time ("Mar 14") in the website's timezone, for the strip of longer periods. */
function dayOf(iso, language, timezone = '') {
  return formatIn(iso, language, timezone, {
    month: 'short',
    day: 'numeric'
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
function duration(seconds, language = '') {
  const number = n => new Intl.NumberFormat(locale(language), {
    maximumFractionDigits: 1
  }).format(n);
  if (seconds < 3600) {
    return Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiMinutes', number(Math.max(1, Math.round(seconds / 60))));
  }
  if (seconds < 172800) {
    return Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiHours', number(Math.round(seconds / 360) / 10));
  }
  return Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiDays', number(Math.round(seconds / 86400)));
}
function hostOf(url) {
  if (!url) {
    return '';
  }
  try {
    return new URL(url).host;
  } catch (e) {
    return url;
  }
}
/** Host and path, so that two addresses on one host stay apart. */
function hostAndPath(url) {
  if (!url) {
    return '';
  }
  try {
    const parsed = new URL(url);
    return parsed.pathname === '/' ? parsed.host : `${parsed.host}${parsed.pathname}`;
  } catch (e) {
    return url;
  }
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
  return cause === 'http_status' && detail ? `${text} ${detail.replace('HTTP ', '')}` : text;
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
 * The seconds of each strip cell up to now: an hour, or a day up to the next cell's start (23 or
 * 25 hours on a clock change), the running cell up to now, a future cell none.
 */
function elapsedSeconds(cells, grain, now) {
  const nominal = (grain === 'hour' ? 3600 : 86400) * 1000;
  const starts = cells.map(c => new Date(c.time).getTime());
  return cells.map((cell, i) => {
    if (cell.state === 'future') {
      return 0;
    }
    const end = i + 1 < starts.length ? starts[i + 1] : starts[i] + nominal;
    return Math.max(0, (Math.min(end, now) - starts[i]) / 1000);
  });
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
  const lengths = elapsedSeconds(timeline.cells, timeline.grain, now);
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
// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-babel/node_modules/cache-loader/dist/cjs.js??ref--13-0!./node_modules/@vue/cli-plugin-babel/node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist/templateLoader.js??ref--6!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--1-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--1-1!./plugins/FeinwerkUptimeMonitor/vue/src/OutageList.vue?vue&type=template&id=ae864986

const OutageListvue_type_template_id_ae864986_hoisted_1 = {
  class: "fwum-outages"
};
const OutageListvue_type_template_id_ae864986_hoisted_2 = {
  class: "fwum-outages__head"
};
const OutageListvue_type_template_id_ae864986_hoisted_3 = {
  class: "fwum-outages__title",
  role: "heading",
  "aria-level": "3"
};
const OutageListvue_type_template_id_ae864986_hoisted_4 = {
  key: 0,
  class: "fwum-muted"
};
const OutageListvue_type_template_id_ae864986_hoisted_5 = {
  key: 0,
  class: "fwum-muted"
};
const OutageListvue_type_template_id_ae864986_hoisted_6 = {
  key: 1,
  class: "fwum-table-wrap"
};
const OutageListvue_type_template_id_ae864986_hoisted_7 = {
  class: "dataTable fwum-table fwum-outages__table"
};
const OutageListvue_type_template_id_ae864986_hoisted_8 = {
  scope: "col",
  class: "label"
};
const OutageListvue_type_template_id_ae864986_hoisted_9 = {
  scope: "col",
  class: "fwum-outages__wide"
};
const OutageListvue_type_template_id_ae864986_hoisted_10 = {
  scope: "col"
};
const OutageListvue_type_template_id_ae864986_hoisted_11 = {
  scope: "col"
};
const OutageListvue_type_template_id_ae864986_hoisted_12 = {
  key: 0,
  scope: "col"
};
const OutageListvue_type_template_id_ae864986_hoisted_13 = {
  class: "label fwum-outages__start"
};
const OutageListvue_type_template_id_ae864986_hoisted_14 = {
  class: "fwum-outages__narrow"
};
const OutageListvue_type_template_id_ae864986_hoisted_15 = {
  class: "fwum-sr"
};
const OutageListvue_type_template_id_ae864986_hoisted_16 = {
  key: 0,
  class: "fwum-ongoing"
};
const OutageListvue_type_template_id_ae864986_hoisted_17 = {
  class: "fwum-nowrap"
};
const OutageListvue_type_template_id_ae864986_hoisted_18 = {
  class: "fwum-outages__wide"
};
const OutageListvue_type_template_id_ae864986_hoisted_19 = {
  key: 0,
  class: "fwum-ongoing"
};
const OutageListvue_type_template_id_ae864986_hoisted_20 = {
  key: 0
};
const OutageListvue_type_template_id_ae864986_hoisted_21 = ["disabled"];
function OutageListvue_type_template_id_ae864986_render(_ctx, _cache, $props, $setup, $data, $options) {
  return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", OutageListvue_type_template_id_ae864986_hoisted_1, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", OutageListvue_type_template_id_ae864986_hoisted_2, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", OutageListvue_type_template_id_ae864986_hoisted_3, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiOutages')), 1), _ctx.countText ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", OutageListvue_type_template_id_ae864986_hoisted_4, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.countText), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)]), _ctx.incidents.length === 0 ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("p", OutageListvue_type_template_id_ae864986_hoisted_5, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiNoOutages')), 1)) : (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", OutageListvue_type_template_id_ae864986_hoisted_6, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("table", OutageListvue_type_template_id_ae864986_hoisted_7, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("thead", null, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("tr", null, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("th", OutageListvue_type_template_id_ae864986_hoisted_8, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiStart')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("th", OutageListvue_type_template_id_ae864986_hoisted_9, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiDuration')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("th", OutageListvue_type_template_id_ae864986_hoisted_10, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiWhat')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("th", OutageListvue_type_template_id_ae864986_hoisted_11, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiCause')), 1), _ctx.hasExternal ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("th", OutageListvue_type_template_id_ae864986_hoisted_12, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiSource')), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)])]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("tbody", null, [(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderList"])(_ctx.incidents, incident => {
    return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("tr", {
      key: incident.idIncident
    }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("td", OutageListvue_type_template_id_ae864986_hoisted_13, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.when(incident.start)) + " ", 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", OutageListvue_type_template_id_ae864986_hoisted_14, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", OutageListvue_type_template_id_ae864986_hoisted_15, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiDuration')) + ": ", 1), incident.open ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", OutageListvue_type_template_id_ae864986_hoisted_16, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiOngoing')) + ", ", 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", OutageListvue_type_template_id_ae864986_hoisted_17, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.length(incident.durationSeconds)), 1)])]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("td", OutageListvue_type_template_id_ae864986_hoisted_18, [incident.open ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", OutageListvue_type_template_id_ae864986_hoisted_19, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiOngoing')) + ", ", 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(" " + Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.length(incident.durationSeconds)), 1)]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("td", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.what(incident)), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("td", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.cause(incident)), 1), _ctx.hasExternal ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("td", OutageListvue_type_template_id_ae864986_hoisted_20, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.source(incident.source)), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)]);
  }), 128))])])])), _ctx.canShowMore ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("button", {
    key: 2,
    type: "button",
    class: "btn-flat fwum-more",
    disabled: _ctx.loadingMore,
    onClick: _cache[0] || (_cache[0] = $event => _ctx.$emit('more'))
  }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate(_ctx.loadingMore ? 'FeinwerkUptimeMonitor_UiLoading' : 'FeinwerkUptimeMonitor_UiShowMore')), 9, OutageListvue_type_template_id_ae864986_hoisted_21)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)]);
}
// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/OutageList.vue?vue&type=template&id=ae864986

// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-typescript/node_modules/cache-loader/dist/cjs.js??ref--15-0!./node_modules/babel-loader/lib!./node_modules/@vue/cli-plugin-typescript/node_modules/ts-loader??ref--15-2!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--1-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--1-1!./plugins/FeinwerkUptimeMonitor/vue/src/OutageList.vue?vue&type=script&lang=ts



/* harmony default export */ var OutageListvue_type_script_lang_ts = (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["defineComponent"])({
  props: {
    incidents: {
      type: Array,
      required: true
    },
    labels: {
      type: Object,
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
    /** the outages of the period that were loaded (the list shows the first ones) */
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
    }
  },
  emits: ['more'],
  computed: {
    /** "20 of 57" above a cut list (the UI review's later item 10) */
    countText() {
      if (this.incidents.length === 0 || this.incidents.length >= this.total && !this.totalIsMinimum) {
        return '';
      }
      return Object(external_CoreHome_["translate"])(this.totalIsMinimum ? 'FeinwerkUptimeMonitor_UiOutagesOfAtLeast' : 'FeinwerkUptimeMonitor_UiOutagesOf', String(this.incidents.length), String(this.total));
    },
    /** the column helps only once results come from outside (the free plugin checks from Matomo) */
    hasExternal() {
      return this.incidents.some(i => i.source === 'external');
    }
  },
  methods: {
    translate: external_CoreHome_["translate"],
    when(iso) {
      return dateTime(iso, this.language, this.timezone);
    },
    length(seconds) {
      return duration(seconds, this.language);
    },
    what(incident) {
      if (incident.type === 'gap') {
        return Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiGap');
      }
      return this.labels[incident.targetKey || ''] || incident.targetKey || '';
    },
    cause(incident) {
      return incident.type === 'gap' ? '' : causeText(incident.cause, incident.detail);
    },
    source(source) {
      return Object(external_CoreHome_["translate"])(source === 'external' ? 'FeinwerkUptimeMonitor_UiFromOutside' : 'FeinwerkUptimeMonitor_UiFromServer');
    }
  }
}));
// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/OutageList.vue?vue&type=script&lang=ts
 
// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/OutageList.vue



OutageListvue_type_script_lang_ts.render = OutageListvue_type_template_id_ae864986_render

/* harmony default export */ var OutageList = (OutageListvue_type_script_lang_ts);
// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-babel/node_modules/cache-loader/dist/cjs.js??ref--13-0!./node_modules/@vue/cli-plugin-babel/node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist/templateLoader.js??ref--6!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--1-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--1-1!./plugins/FeinwerkUptimeMonitor/vue/src/TargetPanel.vue?vue&type=template&id=6fa18eac

const TargetPanelvue_type_template_id_6fa18eac_hoisted_1 = ["aria-labelledby"];
const TargetPanelvue_type_template_id_6fa18eac_hoisted_2 = {
  class: "fwum-panel__head"
};
const TargetPanelvue_type_template_id_6fa18eac_hoisted_3 = ["id"];
const TargetPanelvue_type_template_id_6fa18eac_hoisted_4 = ["aria-label", "title"];
const TargetPanelvue_type_template_id_6fa18eac_hoisted_5 = {
  class: "fwum-panel__body"
};
const TargetPanelvue_type_template_id_6fa18eac_hoisted_6 = {
  key: 0,
  class: "fwum-muted",
  "aria-busy": "true"
};
const TargetPanelvue_type_template_id_6fa18eac_hoisted_7 = {
  key: 1,
  class: "fwum-inline-error",
  role: "alert"
};
const TargetPanelvue_type_template_id_6fa18eac_hoisted_8 = {
  key: 2,
  class: "fwum-inline-error",
  role: "alert"
};
const TargetPanelvue_type_template_id_6fa18eac_hoisted_9 = {
  key: 3,
  class: "fwum-suggestions"
};
const TargetPanelvue_type_template_id_6fa18eac_hoisted_10 = {
  class: "fwum-suggestions__kind"
};
const TargetPanelvue_type_template_id_6fa18eac_hoisted_11 = {
  class: "fwum-suggestions__url"
};
const TargetPanelvue_type_template_id_6fa18eac_hoisted_12 = ["disabled", "onClick"];
const TargetPanelvue_type_template_id_6fa18eac_hoisted_13 = {
  key: 4,
  class: "fwum-edit-list"
};
const TargetPanelvue_type_template_id_6fa18eac_hoisted_14 = ["data-fwum-key"];
const TargetPanelvue_type_template_id_6fa18eac_hoisted_15 = {
  class: "fwum-edit-list__row"
};
const TargetPanelvue_type_template_id_6fa18eac_hoisted_16 = {
  class: "fwum-edit-list__toggle"
};
const TargetPanelvue_type_template_id_6fa18eac_hoisted_17 = ["checked", "disabled", "aria-label", "onChange"];
const TargetPanelvue_type_template_id_6fa18eac_hoisted_18 = {
  "aria-hidden": "true"
};
const TargetPanelvue_type_template_id_6fa18eac_hoisted_19 = {
  class: "fwum-edit-list__url"
};
const TargetPanelvue_type_template_id_6fa18eac_hoisted_20 = {
  class: "fwum-muted"
};
const TargetPanelvue_type_template_id_6fa18eac_hoisted_21 = {
  key: 0,
  class: "fwum-edit-list__actions"
};
const TargetPanelvue_type_template_id_6fa18eac_hoisted_22 = ["title", "aria-label", "onClick"];
const TargetPanelvue_type_template_id_6fa18eac_hoisted_23 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
  class: "icon-edit",
  "aria-hidden": "true"
}, null, -1);
const TargetPanelvue_type_template_id_6fa18eac_hoisted_24 = [TargetPanelvue_type_template_id_6fa18eac_hoisted_23];
const TargetPanelvue_type_template_id_6fa18eac_hoisted_25 = ["title", "aria-label", "disabled", "onClick"];
const TargetPanelvue_type_template_id_6fa18eac_hoisted_26 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
  class: "icon-delete",
  "aria-hidden": "true"
}, null, -1);
const TargetPanelvue_type_template_id_6fa18eac_hoisted_27 = [TargetPanelvue_type_template_id_6fa18eac_hoisted_26];
const TargetPanelvue_type_template_id_6fa18eac_hoisted_28 = {
  key: 0,
  class: "fwum-edit-list__edit"
};
const TargetPanelvue_type_template_id_6fa18eac_hoisted_29 = ["aria-label", "aria-invalid", "onKeydown"];
const TargetPanelvue_type_template_id_6fa18eac_hoisted_30 = ["disabled", "onClick"];
const TargetPanelvue_type_template_id_6fa18eac_hoisted_31 = ["onClick"];
const TargetPanelvue_type_template_id_6fa18eac_hoisted_32 = {
  key: 0,
  class: "fwum-inline-error"
};
const TargetPanelvue_type_template_id_6fa18eac_hoisted_33 = {
  key: 1,
  class: "fwum-edit-list__confirm",
  role: "group"
};
const TargetPanelvue_type_template_id_6fa18eac_hoisted_34 = ["disabled", "onClick"];
const TargetPanelvue_type_template_id_6fa18eac_hoisted_35 = ["onClick"];
const TargetPanelvue_type_template_id_6fa18eac_hoisted_36 = {
  key: 2,
  class: "fwum-inline-error",
  role: "alert"
};
const TargetPanelvue_type_template_id_6fa18eac_hoisted_37 = {
  class: "fwum-add__row"
};
const TargetPanelvue_type_template_id_6fa18eac_hoisted_38 = ["aria-label"];
const TargetPanelvue_type_template_id_6fa18eac_hoisted_39 = {
  value: "web"
};
const TargetPanelvue_type_template_id_6fa18eac_hoisted_40 = {
  value: "proxy"
};
const TargetPanelvue_type_template_id_6fa18eac_hoisted_41 = ["aria-label", "aria-invalid"];
const TargetPanelvue_type_template_id_6fa18eac_hoisted_42 = ["disabled"];
const TargetPanelvue_type_template_id_6fa18eac_hoisted_43 = {
  key: 0,
  class: "fwum-inline-error"
};
const TargetPanelvue_type_template_id_6fa18eac_hoisted_44 = {
  key: 1,
  class: "fwum-inline-error",
  role: "alert"
};
const TargetPanelvue_type_template_id_6fa18eac_hoisted_45 = {
  class: "fwum-panel__foot"
};
const TargetPanelvue_type_template_id_6fa18eac_hoisted_46 = ["disabled"];
function TargetPanelvue_type_template_id_6fa18eac_render(_ctx, _cache, $props, $setup, $data, $options) {
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
  }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", TargetPanelvue_type_template_id_6fa18eac_hoisted_2, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("h2", {
    id: _ctx.titleId,
    class: "fwum-panel__title"
  }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.siteName ? _ctx.translate('FeinwerkUptimeMonitor_UiTargetsTitleOf', _ctx.siteName) : _ctx.translate('FeinwerkUptimeMonitor_UiTargetsTitle')), 9, TargetPanelvue_type_template_id_6fa18eac_hoisted_3), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("button", {
    type: "button",
    class: "fwum-panel__close",
    "aria-label": _ctx.translate('FeinwerkUptimeMonitor_UiClose'),
    title: _ctx.translate('FeinwerkUptimeMonitor_UiClose'),
    onClick: _cache[0] || (_cache[0] = (...args) => _ctx.close && _ctx.close(...args))
  }, "×", 8, TargetPanelvue_type_template_id_6fa18eac_hoisted_4)]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", TargetPanelvue_type_template_id_6fa18eac_hoisted_5, [_ctx.loading ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("p", TargetPanelvue_type_template_id_6fa18eac_hoisted_6, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiLoading')), 1)) : _ctx.loadFailed ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", TargetPanelvue_type_template_id_6fa18eac_hoisted_7, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiLoadFailed')) + " ", 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("button", {
    type: "button",
    class: "btn-flat",
    onClick: _cache[1] || (_cache[1] = (...args) => _ctx.load && _ctx.load(...args))
  }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiRetry')), 1)])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.error && _ctx.errorOnTop ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("p", TargetPanelvue_type_template_id_6fa18eac_hoisted_8, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.error), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.suggestions.length ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("section", TargetPanelvue_type_template_id_6fa18eac_hoisted_9, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("h3", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiSuggestions')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("ul", null, [(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderList"])(_ctx.suggestions, suggestion => {
    return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("li", {
      key: suggestion.key + suggestion.url
    }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", TargetPanelvue_type_template_id_6fa18eac_hoisted_10, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.kindLabel(suggestion.kind, suggestion.key)), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", TargetPanelvue_type_template_id_6fa18eac_hoisted_11, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(suggestion.url), 1), _ctx.canAdopt(suggestion) ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("button", {
      key: 0,
      type: "button",
      class: "btn-flat",
      disabled: _ctx.busy,
      onClick: $event => _ctx.adopt(suggestion)
    }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiAdopt')), 9, TargetPanelvue_type_template_id_6fa18eac_hoisted_12)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)]);
  }), 128))])])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.targets.length ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("ul", TargetPanelvue_type_template_id_6fa18eac_hoisted_13, [(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderList"])(_ctx.targets, target => {
    return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("li", {
      key: target.targetKey,
      "data-fwum-key": target.targetKey
    }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", TargetPanelvue_type_template_id_6fa18eac_hoisted_15, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("label", TargetPanelvue_type_template_id_6fa18eac_hoisted_16, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("input", {
      type: "checkbox",
      "data-fwum-focus": "toggle",
      checked: target.enabled,
      disabled: _ctx.busy,
      "aria-label": _ctx.translate('FeinwerkUptimeMonitor_UiCheckTarget', _ctx.addressOf(target)),
      onChange: $event => _ctx.toggle(target, $event)
    }, null, 40, TargetPanelvue_type_template_id_6fa18eac_hoisted_17), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("small", TargetPanelvue_type_template_id_6fa18eac_hoisted_18, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate(target.enabled ? 'FeinwerkUptimeMonitor_UiOn' : 'FeinwerkUptimeMonitor_UiOff')), 1)]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", {
      class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(["fwum-edit-list__address", {
        'is-off': !target.enabled
      }])
    }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", TargetPanelvue_type_template_id_6fa18eac_hoisted_19, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.addressOf(target)), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", TargetPanelvue_type_template_id_6fa18eac_hoisted_20, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.kindLabel(target.kind, target.targetKey)) + ", " + Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.sourceLabel(target.urlSource)), 1)], 2), _ctx.editing !== target.targetKey && _ctx.removing !== target.targetKey ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", TargetPanelvue_type_template_id_6fa18eac_hoisted_21, [target.url !== null ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("button", {
      key: 0,
      type: "button",
      class: "btn-flat fwum-icon-only",
      "data-fwum-focus": "change",
      title: _ctx.translate('FeinwerkUptimeMonitor_UiChange'),
      "aria-label": `${_ctx.translate('FeinwerkUptimeMonitor_UiChange')}: ${target.url}`,
      onClick: $event => _ctx.startEdit(target)
    }, TargetPanelvue_type_template_id_6fa18eac_hoisted_24, 8, TargetPanelvue_type_template_id_6fa18eac_hoisted_22)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), target.urlSource !== 'default' ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("button", {
      key: 1,
      type: "button",
      class: "btn-flat fwum-icon-only",
      title: _ctx.translate('FeinwerkUptimeMonitor_UiDelete'),
      "aria-label": `${_ctx.translate('FeinwerkUptimeMonitor_UiDelete')}: ${target.url}`,
      disabled: _ctx.busy,
      onClick: $event => _ctx.startRemove(target)
    }, TargetPanelvue_type_template_id_6fa18eac_hoisted_27, 8, TargetPanelvue_type_template_id_6fa18eac_hoisted_25)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)]), _ctx.editing === target.targetKey ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", TargetPanelvue_type_template_id_6fa18eac_hoisted_28, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withDirectives"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("input", {
      "onUpdate:modelValue": _cache[2] || (_cache[2] = $event => _ctx.draftUrl = $event),
      type: "url",
      class: "browser-default fwum-input",
      "data-fwum-focus": "url",
      "aria-label": _ctx.translate('FeinwerkUptimeMonitor_UiUrl'),
      "aria-invalid": _ctx.draftUrl !== '' && !_ctx.validUrl(_ctx.draftUrl),
      onKeydown: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withKeys"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withModifiers"])($event => _ctx.validUrl(_ctx.draftUrl) && _ctx.saveUrl(target), ["prevent"]), ["enter"])
    }, null, 40, TargetPanelvue_type_template_id_6fa18eac_hoisted_29), [[external_commonjs_vue_commonjs2_vue_root_Vue_["vModelText"], _ctx.draftUrl]]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("button", {
      type: "button",
      class: "btn-flat",
      disabled: _ctx.busy || !_ctx.validUrl(_ctx.draftUrl),
      onClick: $event => _ctx.saveUrl(target)
    }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiSave')), 9, TargetPanelvue_type_template_id_6fa18eac_hoisted_30), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("button", {
      type: "button",
      class: "btn-flat",
      onClick: $event => _ctx.cancel(target.targetKey)
    }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiCancel')), 9, TargetPanelvue_type_template_id_6fa18eac_hoisted_31), _ctx.draftUrl !== '' && !_ctx.validUrl(_ctx.draftUrl) ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("p", TargetPanelvue_type_template_id_6fa18eac_hoisted_32, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_ErrorUrl')), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)])) : _ctx.removing === target.targetKey ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", TargetPanelvue_type_template_id_6fa18eac_hoisted_33, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiRemoveConfirm', target.url || '')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("button", {
      type: "button",
      class: "btn-flat",
      "data-fwum-focus": "confirm",
      disabled: _ctx.busy,
      onClick: $event => _ctx.remove(target)
    }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiDelete')), 9, TargetPanelvue_type_template_id_6fa18eac_hoisted_34), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("button", {
      type: "button",
      class: "btn-flat",
      onClick: $event => _ctx.cancel(target.targetKey)
    }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiCancel')), 9, TargetPanelvue_type_template_id_6fa18eac_hoisted_35)])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.error && _ctx.errorAt === target.targetKey ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("p", TargetPanelvue_type_template_id_6fa18eac_hoisted_36, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.error), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)], 8, TargetPanelvue_type_template_id_6fa18eac_hoisted_14);
  }), 128))])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.idSite > 0 ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("form", {
    key: 5,
    class: "fwum-add",
    onSubmit: _cache[5] || (_cache[5] = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withModifiers"])((...args) => _ctx.add && _ctx.add(...args), ["prevent"]))
  }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("h3", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiAdd')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", TargetPanelvue_type_template_id_6fa18eac_hoisted_37, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withDirectives"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("select", {
    "onUpdate:modelValue": _cache[3] || (_cache[3] = $event => _ctx.newKind = $event),
    class: "browser-default fwum-select",
    "aria-label": _ctx.translate('FeinwerkUptimeMonitor_UiAddKind')
  }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("option", TargetPanelvue_type_template_id_6fa18eac_hoisted_39, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiAddWeb')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("option", TargetPanelvue_type_template_id_6fa18eac_hoisted_40, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiKind_proxy')), 1)], 8, TargetPanelvue_type_template_id_6fa18eac_hoisted_38), [[external_commonjs_vue_commonjs2_vue_root_Vue_["vModelSelect"], _ctx.newKind]]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withDirectives"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("input", {
    "onUpdate:modelValue": _cache[4] || (_cache[4] = $event => _ctx.newUrl = $event),
    type: "url",
    class: "browser-default fwum-input",
    placeholder: "https://",
    "aria-label": _ctx.translate('FeinwerkUptimeMonitor_UiUrl'),
    "aria-invalid": _ctx.newUrl !== '' && !_ctx.validUrl(_ctx.newUrl)
  }, null, 8, TargetPanelvue_type_template_id_6fa18eac_hoisted_41), [[external_commonjs_vue_commonjs2_vue_root_Vue_["vModelText"], _ctx.newUrl]]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("button", {
    type: "submit",
    class: "btn-flat",
    disabled: _ctx.busy || !_ctx.validUrl(_ctx.newUrl)
  }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiAdd')), 9, TargetPanelvue_type_template_id_6fa18eac_hoisted_42)]), _ctx.newUrl !== '' && _ctx.newUrl !== 'https://' && !_ctx.validUrl(_ctx.newUrl) ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("p", TargetPanelvue_type_template_id_6fa18eac_hoisted_43, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_ErrorUrl')), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.error && _ctx.errorAt === 'add' ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("p", TargetPanelvue_type_template_id_6fa18eac_hoisted_44, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.error), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)], 32)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", TargetPanelvue_type_template_id_6fa18eac_hoisted_45, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("button", {
    type: "button",
    class: "btn",
    disabled: _ctx.busy,
    onClick: _cache[6] || (_cache[6] = (...args) => _ctx.done && _ctx.done(...args))
  }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiDone')), 9, TargetPanelvue_type_template_id_6fa18eac_hoisted_46)])], 8, TargetPanelvue_type_template_id_6fa18eac_hoisted_1)]);
}
// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/TargetPanel.vue?vue&type=template&id=6fa18eac

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



TargetPanelvue_type_script_lang_ts.render = TargetPanelvue_type_template_id_6fa18eac_render

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
// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-babel/node_modules/cache-loader/dist/cjs.js??ref--13-0!./node_modules/@vue/cli-plugin-babel/node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist/templateLoader.js??ref--6!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--1-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--1-1!./plugins/FeinwerkUptimeMonitor/vue/src/PromoLine.vue?vue&type=template&id=b84cf056

const PromoLinevue_type_template_id_b84cf056_hoisted_1 = ["data-fwpromo-id", "data-fwpromo-days", "data-fwpromo-demo"];
const PromoLinevue_type_template_id_b84cf056_hoisted_2 = ["title"];
const PromoLinevue_type_template_id_b84cf056_hoisted_3 = ["href", "target", "rel", "title"];
const PromoLinevue_type_template_id_b84cf056_hoisted_4 = ["title", "aria-label"];
const PromoLinevue_type_template_id_b84cf056_hoisted_5 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
  "aria-hidden": "true"
}, "×", -1);
const PromoLinevue_type_template_id_b84cf056_hoisted_6 = [PromoLinevue_type_template_id_b84cf056_hoisted_5];
function PromoLinevue_type_template_id_b84cf056_render(_ctx, _cache, $props, $setup, $data, $options) {
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
  }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.promo.text), 9, PromoLinevue_type_template_id_b84cf056_hoisted_2), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("a", {
    class: "fwpromo-line__link",
    href: _ctx.promo.url,
    target: _ctx.promo.external === false ? undefined : '_blank',
    rel: _ctx.promo.external === false ? undefined : 'noopener',
    title: _ctx.promo.note || undefined
  }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.promo.link), 9, PromoLinevue_type_template_id_b84cf056_hoisted_3), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("button", {
    type: "button",
    class: "fwpromo-line__dismiss fwpromo-dismiss",
    title: _ctx.dismissLabel,
    "aria-label": _ctx.dismissLabel
  }, PromoLinevue_type_template_id_b84cf056_hoisted_6, 8, PromoLinevue_type_template_id_b84cf056_hoisted_4)], 8, PromoLinevue_type_template_id_b84cf056_hoisted_1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true);
}
// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/PromoLine.vue?vue&type=template&id=b84cf056

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
  }
}));
// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/PromoLine.vue?vue&type=script&lang=ts
 
// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/PromoLine.vue



PromoLinevue_type_script_lang_ts.render = PromoLinevue_type_template_id_b84cf056_render

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
function mark() {
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
  node.appendChild(mark());
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
// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-babel/node_modules/cache-loader/dist/cjs.js??ref--13-0!./node_modules/@vue/cli-plugin-babel/node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist/templateLoader.js??ref--6!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--1-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--1-1!./plugins/FeinwerkUptimeMonitor/vue/src/HourStrip.vue?vue&type=template&id=231bb32c

const HourStripvue_type_template_id_231bb32c_hoisted_1 = ["aria-label"];
const HourStripvue_type_template_id_231bb32c_hoisted_2 = ["tabindex", "onMouseenter", "onFocus"];
const HourStripvue_type_template_id_231bb32c_hoisted_3 = {
  class: "fwum-sr"
};
const HourStripvue_type_template_id_231bb32c_hoisted_4 = {
  key: 1,
  class: "fwum-strip__axis",
  "aria-hidden": "true"
};
function HourStripvue_type_template_id_231bb32c_render(_ctx, _cache, $props, $setup, $data, $options) {
  return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", {
    class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(["fwum-strip", {
      'fwum-strip--small': _ctx.small
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
    }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", HourStripvue_type_template_id_231bb32c_hoisted_3, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.texts[i]), 1)], 42, HourStripvue_type_template_id_231bb32c_hoisted_2);
  }), 128))], 42, HourStripvue_type_template_id_231bb32c_hoisted_1), _ctx.active >= 0 && !_ctx.hidden ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", {
    key: 0,
    class: "fwum-strip__tip",
    style: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeStyle"])(_ctx.tipStyle),
    "aria-hidden": "true"
  }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.texts[_ctx.active]), 5)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.cells.length > 1 ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", HourStripvue_type_template_id_231bb32c_hoisted_4, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.times[0]), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.times[_ctx.times.length - 1]), 1)])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)], 2);
}
// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/HourStrip.vue?vue&type=template&id=231bb32c

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
    /** the screen's clock (ms), so that the running cell's length follows it; 0: Date.now() */
    now: {
      type: Number,
      default: 0
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
      return this.cells.map(cell => {
        if (this.grain !== 'hour') {
          return dayOf(cell.time, this.language, this.zone);
        }
        const hour = hourOf(cell.time, this.language, this.zone);
        return withDay ? `${dayOf(cell.time, this.language, this.zone)}, ${hour}` : hour;
      });
    },
    texts() {
      // the cell's length: up to the next cell, the running one up to now
      const lengths = elapsedSeconds(this.cells, this.grain, this.now || Date.now());
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



HourStripvue_type_script_lang_ts.render = HourStripvue_type_template_id_231bb32c_render

/* harmony default export */ var HourStrip = (HourStripvue_type_script_lang_ts);
// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-typescript/node_modules/cache-loader/dist/cjs.js??ref--15-0!./node_modules/babel-loader/lib!./node_modules/@vue/cli-plugin-typescript/node_modules/ts-loader??ref--15-2!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--1-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--1-1!./plugins/FeinwerkUptimeMonitor/vue/src/UptimePage.vue?vue&type=script&lang=ts












const MATOMO_KINDS = ['ui', 'tracker', 'js'];
const ORDER = ['ui', 'tracker', 'js', 'web', 'proxy', 'container'];
/** the answer line names the worst group first */
const SEVERITY = ['down', 'partial', 'stale', 'not_checkable', 'none', 'off', 'up'];
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
    HourStrip: HourStrip
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
      /** outages still open now, for "since when" in the answer line */
      openIncidents: [],
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
      uid: `fwum-${Math.random().toString(36).slice(2, 8)}`
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
    showMatomo() {
      return this.config.variant !== 'site' && !this.config.isAnonymous;
    },
    showSite() {
      return this.config.variant !== 'matomo';
    },
    canCheck() {
      // the Matomo widget checks Matomo's own addresses: super users only
      const allowed = this.config.variant === 'matomo' ? this.config.isSuperUser : this.config.isAdmin;
      return allowed && !this.config.embedded;
    },
    matomoRows() {
      var _this$matomo;
      return (((_this$matomo = this.matomo) === null || _this$matomo === void 0 ? void 0 : _this$matomo.targets) || []).filter(t => t.enabled && MATOMO_KINDS.includes(t.kind)).sort((a, b) => ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind)).map(t => this.row(t, this.matomoUptimeRows));
    },
    siteRows() {
      var _this$site;
      return (((_this$site = this.site) === null || _this$site === void 0 ? void 0 : _this$site.targets) || []).filter(t => t.enabled).sort((a, b) => ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind) || a.targetKey.localeCompare(b.targetKey)).map(t => this.row(t, this.siteUptimeRows));
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
      const params = {
        idSite: String(this.config.idSite),
        period: this.period.period,
        date: this.period.date
      };
      return `?${external_CoreHome_["MatomoUrl"].stringify(Object.assign({
        module: 'CoreHome',
        action: 'index'
      }, params))}#?${external_CoreHome_["MatomoUrl"].stringify(Object.assign(Object.assign({}, params), {}, {
        category: 'General_Visitors',
        subcategory: 'FeinwerkUptimeMonitor_Uptime'
      }))}`;
    },
    /** the website's targets, switched on or off (none before a new website's first check run) */
    siteTargetCount() {
      var _this$site2;
      return (((_this$site2 = this.site) === null || _this$site2 === void 0 ? void 0 : _this$site2.targets) || []).length;
    },
    /** Matomo's own addresses exist but every one is switched off */
    matomoAllOff() {
      var _this$matomo2;
      const own = (((_this$matomo2 = this.matomo) === null || _this$matomo2 === void 0 ? void 0 : _this$matomo2.targets) || []).filter(t => MATOMO_KINDS.includes(t.kind));
      return own.length > 0 && own.every(t => !t.enabled);
    },
    nothingChecked() {
      var _this$matomo3, _this$site3;
      const all = [...(((_this$matomo3 = this.matomo) === null || _this$matomo3 === void 0 ? void 0 : _this$matomo3.targets) || []), ...(((_this$site3 = this.site) === null || _this$site3 === void 0 ? void 0 : _this$site3.targets) || [])];
      return all.every(t => !t.states.local && !t.states.external);
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
          state: this.groupState(this.matomoRows, this.matomoAllOff)
        });
      }
      if (this.showSite) {
        out.push({
          key: 'site',
          name: Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiThisWebsite'),
          rows: this.siteRows,
          note: Object(external_CoreHome_["translate"])(this.siteTargetCount ? 'FeinwerkUptimeMonitor_UiAllOffSite' : 'FeinwerkUptimeMonitor_UiFirstCheck'),
          state: this.groupState(this.siteRows, this.siteTargetCount > 0)
        });
      }
      return out;
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
      return [...groups].sort((a, b) => SEVERITY.indexOf(a.state.outcome) - SEVERITY.indexOf(b.state.outcome)).map(g => {
        const down = g.rows.filter(r => r.outcome === 'down');
        const state = down.length === 1 ? Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiAddressDown', down[0].label) : g.state.text;
        return {
          key: g.key,
          outcome: g.state.outcome,
          text: this.isPage ? Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiAnswerGroup', g.name, state) : g.state.text,
          detail: this.downDetail(g)
        };
      });
    },
    /** the answer line that carries the freshness: the first one of a group with results */
    freshnessLine() {
      const checked = key => this.groups.some(g => g.key === key && g.rows.some(r => r.checkedAt !== ''));
      const index = this.answer.findIndex(line => line.key === 'all' || checked(line.key));
      return Math.max(0, index);
    },
    /** "checked 3 minutes ago": the newest current result of the screen */
    freshness() {
      const newest = this.groups.flatMap(g => g.rows).map(r => r.checkedAt).filter(t => t !== '').sort().pop();
      return newest ? Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiChecked', ago(newest, this.config.language, this.tick)) : '';
    },
    labels() {
      var _this$matomo4, _this$site4;
      const out = {};
      (((_this$matomo4 = this.matomo) === null || _this$matomo4 === void 0 ? void 0 : _this$matomo4.targets) || []).forEach(t => {
        out[t.targetKey] = Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiMatomoTarget', targetLabel(t));
      });
      (((_this$site4 = this.site) === null || _this$site4 === void 0 ? void 0 : _this$site4.targets) || []).forEach(t => {
        out[t.targetKey] = targetLabel(t);
      });
      return out;
    },
    /** uptime Matomo, uptime website, the tracker's processing time, the soonest certificate */
    figures() {
      const out = [];
      const matomo = this.showMatomo ? this.uptimeOf(this.matomoRows, this.matomoUptimeRows, this.matomoTimeline) : null;
      if (matomo) {
        out.push(Object.assign({
          key: 'matomo',
          label: Object(external_CoreHome_["translate"])(this.isPage ? 'FeinwerkUptimeMonitor_UiUptimeMatomo' : 'FeinwerkUptimeMonitor_UiUptime')
        }, matomo));
      }
      const site = this.showSite ? this.uptimeOf(this.siteRows, this.siteUptimeRows, this.siteTimeline) : null;
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
          level: ''
        });
      } else if (this.showMatomo && this.sparkValues.length > 1) {
        // no tracking traffic in the last hour: the endpoint's response times per hour
        out.push({
          key: 'tracker',
          label: this.sparkLabel,
          value: '',
          sub: '',
          level: ''
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
          sub: this.isPage ? this.labels[soonest.key] || soonest.label : soonest.label,
          level: soonest.certLevel
        });
      }
      return out;
    },
    /** the median processing time of real tracking requests in the last hour */
    trackerTime() {
      var _this$matomo5;
      const processing = (_this$matomo5 = this.matomo) === null || _this$matomo5 === void 0 ? void 0 : _this$matomo5.processing;
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
      const add = (key, name, timeline, rows) => {
        if (timeline && timeline.cells.length) {
          out.push({
            key,
            name,
            timeline,
            targets: this.measurable(rows)
          });
        }
      };
      if (this.showMatomo) {
        add('matomo', Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiMatomo'), this.matomoTimeline, this.matomoRows);
      }
      if (this.showSite) {
        add('site', Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiThisWebsite'), this.siteTimeline, this.siteRows);
      }
      return out;
    },
    hasCerts() {
      return this.groups.some(g => g.rows.some(r => r.cert !== ''));
    },
    columnCount() {
      return this.hasCerts ? 4 : 3;
    },
    /** the widget's one group */
    widgetGroup() {
      return this.groups.length ? this.groups[0] : null;
    },
    widgetDown() {
      return !!this.widgetGroup && this.widgetGroup.rows.some(r => r.outcome === 'down');
    },
    /** a widget with an outage lists only the failing addresses */
    widgetRows() {
      if (!this.widgetGroup) {
        return [];
      }
      return this.widgetDown ? this.widgetGroup.rows.filter(r => r.outcome === 'down') : this.widgetGroup.rows;
    },
    notCheckableCount() {
      const rows = this.isPage ? this.groups.flatMap(g => g.rows) : this.widgetRows;
      return rows.filter(r => r.outcome === 'not_checkable').length;
    },
    notCheckableText() {
      return this.notCheckableCount === 1 ? Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiNotCheckableOne') : Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiNotCheckableMany', String(this.notCheckableCount));
    },
    shownIncidents() {
      // with a cut request, only the first `limit` of the merged list are surely the newest
      const cap = this.incidentsMore ? Math.min(this.outagesShown, this.incidentLimit) : this.outagesShown;
      return this.incidents.slice(0, cap);
    },
    canShowMore() {
      // more of the loaded list, or a larger request; at the API's limit a cut list ends here
      const moreLoaded = this.shownIncidents.length < this.incidents.length && !(this.incidentsMore && this.outagesShown >= this.incidentLimit && this.incidentLimit >= INCIDENT_LIMIT_MAX);
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
  },
  methods: {
    translate: external_CoreHome_["translate"],
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
      if (this.showMatomo) {
        requests.push(api.status(0).then(s => {
          this.matomo = s;
        }));
        requests.push(api.uptime(0, period, idSite).then(r => {
          this.matomoUptimeRows = r;
        }));
        requests.push(this.loadSeries(period));
        // the strip is an addition: without it the page still answers
        requests.push(api.timeline(0, period, idSite).catch(() => null).then(t => {
          this.matomoTimeline = t;
        }));
        open.push(api.openIncidents(0, idSite).catch(() => []));
      }
      if (this.showSite) {
        requests.push(api.status(idSite).then(s => {
          this.site = s;
        }));
        requests.push(api.uptime(idSite, period).then(r => {
          this.siteUptimeRows = r;
        }));
        requests.push(api.timeline(idSite, period).catch(() => null).then(t => {
          this.siteTimeline = t;
        }));
        open.push(api.openIncidents(idSite).catch(() => []));
      }
      requests.push(Promise.all(open).then(lists => {
        this.openIncidents = [].concat(...lists);
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
      const matomoIncidents = this.showMatomo ? api.incidents(0, period, idSite, limit) : Promise.resolve([]);
      return Promise.all([api.incidents(idSite, period, 0, limit), matomoIncidents]).then(([own, matomo]) => {
        this.incidentsMore = own.length >= limit || matomo.length >= limit;
        this.incidents = [...own, ...matomo].sort((a, b) => b.start.localeCompare(a.start));
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
      this.checking = true;
      this.checkNote = '';
      const idSite = this.showSite ? this.config.idSite : 0;
      api.checkNow(idSite).then(answer => {
        if (answer.locked) {
          this.checkNote = Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiCheckBusy');
          return undefined;
        }
        return this.load();
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
    row(target, uptimeRows) {
      const state = target.states.local;
      let outcome = state ? state.outcome : 'none';
      let text = '';
      const title = target.url || targetLabel(target);
      if (!state) {
        text = Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiNotMeasuredYet');
      } else if (state.stale) {
        outcome = 'stale';
        text = Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiNoRecentCheck', dateTime(state.checkedAt, this.config.language, this.config.timezone || ''));
      } else if (state.outcome === 'up') {
        text = milliseconds(state.responseMs, this.config.language);
      } else if (state.outcome === 'not_checkable') {
        text = Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiNotCheckable');
      } else {
        text = causeText(state.error, state.httpStatus !== null ? `HTTP ${state.httpStatus}` : null);
      }
      const uptime = uptimeRows.find(r => r.targetKey === target.targetKey && r.source === 'local');
      return {
        key: target.targetKey,
        label: targetLabel(target),
        outcome,
        text,
        title,
        uptime: uptime && uptime.uptimePercent !== null ? percent(uptime.uptimePercent, this.config.language, 2) : '',
        cert: target.certificate ? this.certText(target.certificate) : '',
        certLevel: target.certificate ? target.certificate.level : '',
        certDays: target.certificate ? target.certificate.daysLeft : null,
        checkedAt: state && !state.stale ? state.checkedAt : ''
      };
    },
    /**
     * A group's answer: not reachable only when nothing answered; a partial failure is counted
     * (format.ts statusOf, the same rule as the admin overview).
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
      return statusOf({
        total: rows.length,
        off: 0,
        up: count('up'),
        down: count('down'),
        stale: count('stale'),
        notCheckable: count('not_checkable')
      });
    },
    /** "since 10:42 (no connection)": the oldest open outage of the failing addresses */
    downDetail(group) {
      if (group.state.outcome !== 'down' && group.state.outcome !== 'partial') {
        return '';
      }
      const down = group.rows.filter(r => r.outcome === 'down');
      const keys = down.map(r => r.key);
      const starts = this.openIncidents.filter(i => i.open && i.type === 'outage' && keys.includes(i.targetKey || '')).map(i => i.start).sort();
      const parts = [];
      if (starts.length) {
        parts.push(Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiSince', clockOrDate(starts[0], this.config.language, this.config.timezone || '', this.tick)));
      }
      const cause = down.length ? down[0].text : '';
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
    uptimeOf(rows, uptimeRows, timeline) {
      const {
        language
      } = this.config;
      if (timeline && timeline.cells.length) {
        const totals = stripTotals(timeline, this.tick, this.measurable(rows));
        if (totals.uptime === null) {
          return null;
        }
        return {
          value: percent(totals.uptime, language, 2),
          sub: Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiMeasured', sharePercent(totals.measured, language)),
          level: ''
        };
      }
      const keys = rows.map(r => r.key);
      const own = uptimeRows.filter(r => r.source === 'local' && keys.includes(r.targetKey));
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
      return {
        value: percent(Math.round(up / weight * 1000) / 1000, language, 2),
        sub: Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiMeasured', sharePercent(coverage, language)),
        level: ''
      };
    },
    /** the addresses a strip cell sums: those this server cannot check measure nothing */
    measurable(rows) {
      return Math.max(1, rows.filter(r => r.outcome !== 'not_checkable').length);
    },
    certText(cert) {
      if (cert.level === 'expired') {
        return Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiCertificateExpired');
      }
      return cert.daysLeft === 1 ? Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiCertificateDay') : Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiCertificateDays', String(cert.daysLeft));
    }
  }
}));
// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/UptimePage.vue?vue&type=script&lang=ts
 
// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/UptimePage.vue



UptimePagevue_type_script_lang_ts.render = render

/* harmony default export */ var UptimePage = (UptimePagevue_type_script_lang_ts);
// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-babel/node_modules/cache-loader/dist/cjs.js??ref--13-0!./node_modules/@vue/cli-plugin-babel/node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist/templateLoader.js??ref--6!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--1-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--1-1!./plugins/FeinwerkUptimeMonitor/vue/src/AdminPage.vue?vue&type=template&id=5038811d

const AdminPagevue_type_template_id_5038811d_hoisted_1 = ["lang"];
const AdminPagevue_type_template_id_5038811d_hoisted_2 = {
  key: 0,
  class: "fwum-loading",
  "aria-busy": "true"
};
const AdminPagevue_type_template_id_5038811d_hoisted_3 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
  class: "loadingPiwik"
}, [/*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("img", {
  src: "plugins/Morpheus/images/loading-blue.gif",
  alt: ""
})], -1);
const AdminPagevue_type_template_id_5038811d_hoisted_4 = [AdminPagevue_type_template_id_5038811d_hoisted_3];
const AdminPagevue_type_template_id_5038811d_hoisted_5 = {
  key: 1,
  class: "fwum-error",
  role: "alert"
};
const AdminPagevue_type_template_id_5038811d_hoisted_6 = {
  key: 2,
  class: "fwum-table-wrap"
};
const AdminPagevue_type_template_id_5038811d_hoisted_7 = ["id"];
const AdminPagevue_type_template_id_5038811d_hoisted_8 = {
  scope: "col"
};
const AdminPagevue_type_template_id_5038811d_hoisted_9 = {
  scope: "col"
};
const AdminPagevue_type_template_id_5038811d_hoisted_10 = {
  key: 0,
  scope: "col"
};
const AdminPagevue_type_template_id_5038811d_hoisted_11 = {
  scope: "col",
  class: "fwum-wide-only"
};
const AdminPagevue_type_template_id_5038811d_hoisted_12 = {
  class: "fwum-admin__name"
};
const AdminPagevue_type_template_id_5038811d_hoisted_13 = ["href"];
const AdminPagevue_type_template_id_5038811d_hoisted_14 = {
  key: 1
};
const AdminPagevue_type_template_id_5038811d_hoisted_15 = ["title", "aria-label", "onClick"];
const AdminPagevue_type_template_id_5038811d_hoisted_16 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
  class: "icon-edit",
  "aria-hidden": "true"
}, null, -1);
const AdminPagevue_type_template_id_5038811d_hoisted_17 = [AdminPagevue_type_template_id_5038811d_hoisted_16];
const AdminPagevue_type_template_id_5038811d_hoisted_18 = {
  class: "fwum-cell-label"
};
const AdminPagevue_type_template_id_5038811d_hoisted_19 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
  class: "fwum-dot",
  "aria-hidden": "true"
}, null, -1);
const AdminPagevue_type_template_id_5038811d_hoisted_20 = ["title"];
const AdminPagevue_type_template_id_5038811d_hoisted_21 = {
  key: 0
};
const AdminPagevue_type_template_id_5038811d_hoisted_22 = ["title"];
const AdminPagevue_type_template_id_5038811d_hoisted_23 = {
  key: 0,
  class: "fwum-nc"
};
const AdminPagevue_type_template_id_5038811d_hoisted_24 = {
  class: "fwum-note"
};
const AdminPagevue_type_template_id_5038811d_hoisted_25 = ["aria-expanded", "aria-controls"];
const AdminPagevue_type_template_id_5038811d_hoisted_26 = ["aria-expanded", "aria-controls"];
const AdminPagevue_type_template_id_5038811d_hoisted_27 = ["href"];
const AdminPagevue_type_template_id_5038811d_hoisted_28 = ["id"];
const AdminPagevue_type_template_id_5038811d_hoisted_29 = {
  key: 3,
  class: "fwum-muted"
};
const AdminPagevue_type_template_id_5038811d_hoisted_30 = {
  class: "fwum-checks"
};
const AdminPagevue_type_template_id_5038811d_hoisted_31 = {
  key: 0
};
const AdminPagevue_type_template_id_5038811d_hoisted_32 = {
  class: "fwum-cron"
};
const AdminPagevue_type_template_id_5038811d_hoisted_33 = {
  key: 0
};
const AdminPagevue_type_template_id_5038811d_hoisted_34 = {
  class: "fwum-muted"
};
const AdminPagevue_type_template_id_5038811d_hoisted_35 = {
  key: 1
};
const AdminPagevue_type_template_id_5038811d_hoisted_36 = ["href"];
const AdminPagevue_type_template_id_5038811d_hoisted_37 = {
  key: 2
};
const AdminPagevue_type_template_id_5038811d_hoisted_38 = ["href"];
const AdminPagevue_type_template_id_5038811d_hoisted_39 = ["href"];
function AdminPagevue_type_template_id_5038811d_render(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_ContentBlock = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("ContentBlock");
  const _component_TargetPanel = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("TargetPanel");
  return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", {
    class: "fwum-admin",
    lang: _ctx.config.language || undefined
  }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createVNode"])(_component_ContentBlock, {
    "content-title": _ctx.translate('FeinwerkUptimeMonitor_MenuTitle')
  }, {
    default: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withCtx"])(() => [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("p", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiAdminIntro')), 1), _ctx.loading && !_ctx.rows.length ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", AdminPagevue_type_template_id_5038811d_hoisted_2, AdminPagevue_type_template_id_5038811d_hoisted_4)) : _ctx.failed ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", AdminPagevue_type_template_id_5038811d_hoisted_5, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("p", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiLoadFailed')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("button", {
      type: "button",
      class: "btn-flat",
      onClick: _cache[0] || (_cache[0] = (...args) => _ctx.load && _ctx.load(...args))
    }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiRetry')), 1)])) : _ctx.rows.length ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", AdminPagevue_type_template_id_5038811d_hoisted_6, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("table", {
      id: `${_ctx.uid}-table`,
      class: "entityTable dataTable fwum-admin__table"
    }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("thead", null, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("tr", null, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("th", AdminPagevue_type_template_id_5038811d_hoisted_8, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiSiteName')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("th", AdminPagevue_type_template_id_5038811d_hoisted_9, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiStatus')), 1), _ctx.hasCerts ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("th", AdminPagevue_type_template_id_5038811d_hoisted_10, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiCertificate')), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("th", AdminPagevue_type_template_id_5038811d_hoisted_11, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiLastCheck')), 1)])]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("tbody", null, [(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderList"])(_ctx.visibleRows, row => {
      return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("tr", {
        key: row.idSite
      }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("td", AdminPagevue_type_template_id_5038811d_hoisted_12, [row.idSite > 0 ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("a", {
        key: 0,
        href: _ctx.pageUrl(row.idSite)
      }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(row.name), 9, AdminPagevue_type_template_id_5038811d_hoisted_13)) : (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", AdminPagevue_type_template_id_5038811d_hoisted_14, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(row.name), 1)), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("button", {
        type: "button",
        class: "btn-flat fwum-icon-only",
        title: _ctx.translate('FeinwerkUptimeMonitor_UiEditTargetsOf', row.name),
        "aria-label": _ctx.translate('FeinwerkUptimeMonitor_UiEditTargetsOf', row.name),
        onClick: $event => _ctx.openPanel(row)
      }, AdminPagevue_type_template_id_5038811d_hoisted_17, 8, AdminPagevue_type_template_id_5038811d_hoisted_15)]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("td", {
        class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(["fwum-admin__status", `is-${_ctx.status(row).outcome}`])
      }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", AdminPagevue_type_template_id_5038811d_hoisted_18, [AdminPagevue_type_template_id_5038811d_hoisted_19, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.status(row).text), 1)]), row.lastCheckedAt ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", {
        key: 0,
        class: "fwum-muted fwum-narrow-only",
        title: _ctx.when(row.lastCheckedAt, row.timezone)
      }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.since(row.lastCheckedAt)), 9, AdminPagevue_type_template_id_5038811d_hoisted_20)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)], 2), _ctx.hasCerts ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("td", AdminPagevue_type_template_id_5038811d_hoisted_21, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.certText(row.certificateDaysLeft)), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("td", {
        class: "fwum-wide-only",
        title: row.lastCheckedAt ? _ctx.when(row.lastCheckedAt, row.timezone) : ''
      }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(row.lastCheckedAt ? _ctx.since(row.lastCheckedAt) : ''), 9, AdminPagevue_type_template_id_5038811d_hoisted_22)]);
    }), 128))])], 8, AdminPagevue_type_template_id_5038811d_hoisted_7), _ctx.foldedRows.length ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", AdminPagevue_type_template_id_5038811d_hoisted_23, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("p", AdminPagevue_type_template_id_5038811d_hoisted_24, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.foldedText) + " ", 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("button", {
      type: "button",
      class: "fwum-link-button",
      "aria-expanded": _ctx.showFolded ? 'true' : 'false',
      "aria-controls": `${_ctx.uid}-table`,
      onClick: _cache[1] || (_cache[1] = $event => _ctx.showFolded = !_ctx.showFolded)
    }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate(_ctx.showFolded ? 'FeinwerkUptimeMonitor_UiHide' : 'FeinwerkUptimeMonitor_UiShow')), 9, AdminPagevue_type_template_id_5038811d_hoisted_25), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("button", {
      type: "button",
      class: "fwum-link-button",
      "aria-expanded": _ctx.whyOpen ? 'true' : 'false',
      "aria-controls": `${_ctx.uid}-why`,
      onClick: _cache[2] || (_cache[2] = $event => _ctx.whyOpen = !_ctx.whyOpen)
    }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiWhy')), 9, AdminPagevue_type_template_id_5038811d_hoisted_26), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("a", {
      href: _ctx.settingsUrl
    }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiAllowPrivate')), 9, AdminPagevue_type_template_id_5038811d_hoisted_27)]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withDirectives"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("p", {
      id: `${_ctx.uid}-why`,
      class: "fwum-note fwum-nc__why"
    }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiAdminNotCheckableHelp')), 9, AdminPagevue_type_template_id_5038811d_hoisted_28), [[external_commonjs_vue_commonjs2_vue_root_Vue_["vShow"], _ctx.whyOpen]])])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)])) : !_ctx.loading ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("p", AdminPagevue_type_template_id_5038811d_hoisted_29, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiFirstCheck')), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)]),
    _: 1
  }, 8, ["content-title"]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createVNode"])(_component_ContentBlock, {
    "content-title": _ctx.translate('FeinwerkUptimeMonitor_UiChecksAndAlerts')
  }, {
    default: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withCtx"])(() => [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("ul", AdminPagevue_type_template_id_5038811d_hoisted_30, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("li", {
      class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(_ctx.cronOk ? 'is-ok' : 'is-warn')
    }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
      class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(_ctx.cronOk ? 'icon-ok' : 'icon-warning'),
      "aria-hidden": "true"
    }, null, 2), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", null, [_ctx.cronOk ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("p", AdminPagevue_type_template_id_5038811d_hoisted_31, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.cronText), 1)) : (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], {
      key: 1
    }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("p", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiCronHelp')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", AdminPagevue_type_template_id_5038811d_hoisted_32, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("code", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.config.cronLine), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("button", {
      type: "button",
      class: "btn-flat",
      onClick: _cache[3] || (_cache[3] = (...args) => _ctx.copy && _ctx.copy(...args))
    }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate(_ctx.copied ? 'FeinwerkUptimeMonitor_UiCopied' : 'FeinwerkUptimeMonitor_UiCopy')), 1)])], 64))])], 2), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("li", {
      class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(_ctx.config.sentinel === 'active' ? 'is-ok' : 'is-warn')
    }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
      class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(_ctx.config.sentinel === 'active' ? 'icon-ok' : 'icon-warning'),
      "aria-hidden": "true"
    }, null, 2), _ctx.config.sentinel === 'active' ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", AdminPagevue_type_template_id_5038811d_hoisted_33, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("p", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiSentinelActive')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("p", AdminPagevue_type_template_id_5038811d_hoisted_34, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiSentinelFacts')), 1)])) : _ctx.config.sentinel === 'old' ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", AdminPagevue_type_template_id_5038811d_hoisted_35, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("p", null, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiSentinelOld', _ctx.config.sentinelVersion || '')) + " ", 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("a", {
      href: _ctx.pluginsUrl
    }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiSentinelPluginsLink')), 9, AdminPagevue_type_template_id_5038811d_hoisted_36)])])) : (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", AdminPagevue_type_template_id_5038811d_hoisted_37, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("p", null, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate(_ctx.sentinelKey)) + " ", 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("a", {
      href: _ctx.sentinelUrl,
      target: "_blank",
      rel: "noopener"
    }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiSentinelLink')), 9, AdminPagevue_type_template_id_5038811d_hoisted_38)])]))], 2)]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("p", null, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("a", {
      href: _ctx.settingsUrl
    }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiSettings')), 9, AdminPagevue_type_template_id_5038811d_hoisted_39)])]),
    _: 1
  }, 8, ["content-title"]), _ctx.panelSite !== null ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createBlock"])(_component_TargetPanel, {
    key: 0,
    "id-site": _ctx.panelSite,
    "site-name": _ctx.panelName,
    onClose: _ctx.onPanelClose
  }, null, 8, ["id-site", "site-name", "onClose"])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)], 8, AdminPagevue_type_template_id_5038811d_hoisted_1);
}
// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/AdminPage.vue?vue&type=template&id=5038811d

// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-typescript/node_modules/cache-loader/dist/cjs.js??ref--15-0!./node_modules/babel-loader/lib!./node_modules/@vue/cli-plugin-typescript/node_modules/ts-loader??ref--15-2!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--1-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--1-1!./plugins/FeinwerkUptimeMonitor/vue/src/AdminPage.vue?vue&type=script&lang=ts





/* harmony default export */ var AdminPagevue_type_script_lang_ts = (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["defineComponent"])({
  components: {
    ContentBlock: external_CoreHome_["ContentBlock"],
    TargetPanel: TargetPanel
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
      copied: false,
      panelSite: null,
      panelName: '',
      /** the folded websites shown in the table again, and the reason open */
      showFolded: false,
      whyOpen: false,
      uid: `fwum-admin-${Math.random().toString(36).slice(2, 8)}`,
      /** the screen's clock: "3 minutes ago" follows it every minute */
      tick: Date.now(),
      timer: 0
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
    /** up to three websites by name (the answer without a click), more as a count */
    foldedText() {
      const count = this.foldedRows.length;
      if (count <= 3) {
        const names = listOf(this.foldedRows.map(row => row.name), this.config.language);
        return count === 1 ? Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiAdminNotCheckableNamedOne', names) : Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiAdminNotCheckableNamedMany', names);
      }
      return Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiAdminNotCheckableMany', String(count));
    },
    /** a system cron runs the checks (IntervalTracker on the server) */
    cronOk() {
      var _this$config$cron;
      return !!((_this$config$cron = this.config.cron) !== null && _this$config$cron !== void 0 && _this$config$cron.active);
    },
    cronText() {
      var _this$config$cron2;
      const seconds = ((_this$config$cron2 = this.config.cron) === null || _this$config$cron2 === void 0 ? void 0 : _this$config$cron2.intervalSeconds) || 60;
      return seconds <= 90 ? Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiCronActiveMinute') : Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiCronActive', duration(seconds, this.config.language));
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
  },
  beforeUnmount() {
    window.clearInterval(this.timer);
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
    /** the same rule as the cards of the uptime page (format.ts statusOf) */
    status(row) {
      return statusOf({
        total: row.targets,
        off: row.off,
        up: row.up,
        down: row.down,
        stale: row.stale,
        notCheckable: row.notCheckable
      });
    },
    certText(days) {
      if (days === null) {
        // no https address, or its certificate not read yet
        return '';
      }
      if (days < 0) {
        return Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiCertificateExpired');
      }
      return days === 1 ? Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiCertificateDay') : Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiCertificateDays', String(days));
    },
    pageUrl(idSite) {
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
    },
    /** The clipboard API needs HTTPS; many intranet Matomos run on HTTP: then the classic way. */
    copy() {
      const text = this.config.cronLine || '';
      const done = () => {
        this.copied = true;
      };
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
            done();
          }
        } finally {
          document.body.removeChild(area);
        }
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done).catch(fallback);
      } else {
        fallback();
      }
    },
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



AdminPagevue_type_script_lang_ts.render = AdminPagevue_type_template_id_5038811d_render

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