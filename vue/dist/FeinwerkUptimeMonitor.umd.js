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

// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-babel/node_modules/cache-loader/dist/cjs.js??ref--13-0!./node_modules/@vue/cli-plugin-babel/node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist/templateLoader.js??ref--6!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--1-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--1-1!./plugins/FeinwerkUptimeMonitor/vue/src/UptimePage.vue?vue&type=template&id=f8021f7e

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
const _hoisted_7 = ["disabled"];
const _hoisted_8 = {
  key: 1,
  class: "fwum-note",
  role: "status"
};
const _hoisted_9 = ["aria-labelledby"];
const _hoisted_10 = {
  class: "fwum-card__head"
};
const _hoisted_11 = ["id"];
const _hoisted_12 = {
  class: "fwum-muted"
};
const _hoisted_13 = ["aria-labelledby"];
const _hoisted_14 = {
  class: "fwum-card__head"
};
const _hoisted_15 = ["id"];
const _hoisted_16 = {
  key: 0,
  class: "fwum-muted"
};
const _hoisted_17 = {
  class: "fwum-figures"
};
const _hoisted_18 = {
  key: 0
};
const _hoisted_19 = {
  class: "fwum-figures__sub"
};
const _hoisted_20 = {
  key: 1
};
const _hoisted_21 = {
  class: "fwum-figures__sub"
};
const _hoisted_22 = {
  key: 2
};
const _hoisted_23 = {
  class: "fwum-targets"
};
const _hoisted_24 = ["title"];
const _hoisted_25 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
  class: "fwum-dot",
  "aria-hidden": "true"
}, null, -1);
const _hoisted_26 = {
  class: "fwum-targets__label"
};
const _hoisted_27 = {
  class: "fwum-targets__text"
};
const _hoisted_28 = {
  class: "fwum-targets__uptime"
};
const _hoisted_29 = {
  key: 0,
  class: "fwum-note"
};
const _hoisted_30 = ["href"];
const _hoisted_31 = {
  key: 1,
  class: "fwum-spark"
};
const _hoisted_32 = {
  class: "fwum-muted"
};
const _hoisted_33 = {
  key: 2,
  class: "fwum-note"
};
const _hoisted_34 = ["aria-labelledby"];
const _hoisted_35 = {
  class: "fwum-card__head"
};
const _hoisted_36 = ["id"];
const _hoisted_37 = {
  key: 1,
  class: "fwum-muted"
};
const _hoisted_38 = {
  key: 2,
  class: "fwum-card__actions"
};
const _hoisted_39 = ["disabled"];
const _hoisted_40 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
  class: "icon-reload",
  "aria-hidden": "true"
}, null, -1);
const _hoisted_41 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
  class: "icon-edit",
  "aria-hidden": "true"
}, null, -1);
const _hoisted_42 = {
  key: 0,
  class: "fwum-note",
  role: "status"
};
const _hoisted_43 = {
  key: 1,
  class: "fwum-muted"
};
const _hoisted_44 = {
  key: 2,
  class: "fwum-table-wrap"
};
const _hoisted_45 = {
  class: "fwum-grid"
};
const _hoisted_46 = {
  scope: "col"
};
const _hoisted_47 = {
  scope: "col"
};
const _hoisted_48 = {
  scope: "col"
};
const _hoisted_49 = {
  key: 0,
  scope: "col"
};
const _hoisted_50 = ["title"];
const _hoisted_51 = {
  class: "fwum-cell-label"
};
const _hoisted_52 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
  class: "fwum-dot",
  "aria-hidden": "true"
}, null, -1);
const _hoisted_53 = {
  class: "fwum-targets__label"
};
const _hoisted_54 = {
  class: "fwum-targets__text"
};
const _hoisted_55 = {
  class: "fwum-num"
};
const _hoisted_56 = {
  key: 3,
  class: "fwum-note"
};
const _hoisted_57 = ["href"];
function render(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_Sparkline = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("Sparkline");
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
  }, [_ctx.nothingChecked ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", _hoisted_6, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("p", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiFirstCheck')), 1), _ctx.canCheck ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("button", {
    key: 0,
    type: "button",
    class: "btn",
    disabled: _ctx.checking,
    onClick: _cache[1] || (_cache[1] = (...args) => _ctx.checkNow && _ctx.checkNow(...args))
  }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate(_ctx.checking ? 'FeinwerkUptimeMonitor_UiChecking' : 'FeinwerkUptimeMonitor_UiCheckNow')), 9, _hoisted_7)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.checkNote && !_ctx.siteCardShown ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("p", _hoisted_8, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.checkNote), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.showMatomo && !_ctx.matomoRows.length && _ctx.matomoAllOff ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("section", {
    key: 2,
    class: "fwum-card",
    "aria-labelledby": `${_ctx.uid}-matomo-off`
  }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", _hoisted_10, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", {
    id: `${_ctx.uid}-matomo-off`,
    class: "fwum-card__title",
    role: "heading",
    "aria-level": "3"
  }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiMatomo')), 9, _hoisted_11)]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("p", _hoisted_12, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiAllOffMatomo')), 1)], 8, _hoisted_9)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.showMatomo && _ctx.matomoRows.length ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("section", {
    key: 3,
    class: "fwum-card",
    "aria-labelledby": `${_ctx.uid}-matomo`
  }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", _hoisted_14, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", {
    id: `${_ctx.uid}-matomo`,
    class: "fwum-card__title",
    role: "heading",
    "aria-level": "3"
  }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiMatomo')), 9, _hoisted_15), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
    class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(["fwum-state", `is-${_ctx.matomoState.outcome}`])
  }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.matomoState.text), 3), _ctx.checkedText(_ctx.matomoRows) ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", _hoisted_16, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.checkedText(_ctx.matomoRows)), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("dl", _hoisted_17, [_ctx.matomoUptime ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", _hoisted_18, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("dt", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiUptime')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("dd", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.matomoUptime.value), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("dd", _hoisted_19, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.matomoUptime.coverage), 1)])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.trackerTime ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", _hoisted_20, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("dt", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.trackerTime.label), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("dd", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.trackerTime.value), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("dd", _hoisted_21, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.trackerTime.sub), 1)])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.matomoCert ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", _hoisted_22, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("dt", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiCertificate')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("dd", {
    class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(`is-${_ctx.matomoCert.level}`)
  }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.matomoCert.text), 3)])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("ul", _hoisted_23, [(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderList"])(_ctx.matomoRows, row => {
    return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("li", {
      key: row.key,
      class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(`is-${row.outcome}`),
      title: row.title
    }, [_hoisted_25, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", _hoisted_26, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(row.label), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", _hoisted_27, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(row.text), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", _hoisted_28, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(row.uptime), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
      class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(["fwum-targets__cert", `is-${row.certLevel}`])
    }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(row.cert), 3)], 10, _hoisted_24);
  }), 128))]), _ctx.matomoRows.some(r => r.outcome === 'not_checkable') ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("p", _hoisted_29, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiNotCheckableHelp')) + " ", 1), _ctx.config.isSuperUser && !_ctx.config.embedded ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("a", {
    key: 0,
    href: _ctx.settingsUrl
  }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiSettings')), 9, _hoisted_30)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.sparkValues.length > 1 ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", _hoisted_31, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createVNode"])(_component_Sparkline, {
    values: _ctx.sparkValues,
    label: _ctx.sparkLabel
  }, null, 8, ["values", "label"]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", _hoisted_32, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.sparkLabel), 1)])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.config.queuedTracking && _ctx.trackerTime && _ctx.trackerTime.processing ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("p", _hoisted_33, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiQueuedTracking')), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)], 8, _hoisted_13)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.siteCardShown ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("section", {
    key: 4,
    class: "fwum-card",
    "aria-labelledby": `${_ctx.uid}-site`
  }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", _hoisted_35, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", {
    id: `${_ctx.uid}-site`,
    class: "fwum-card__title",
    role: "heading",
    "aria-level": "3"
  }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiThisWebsite')), 9, _hoisted_36), _ctx.siteRows.length ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", {
    key: 0,
    class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(["fwum-state", `is-${_ctx.siteState.outcome}`])
  }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.siteState.text), 3)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.checkedText(_ctx.siteRows) ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", _hoisted_37, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.checkedText(_ctx.siteRows)), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.config.variant === 'page' && _ctx.config.isAdmin ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", _hoisted_38, [_ctx.siteRows.length || !_ctx.siteTargetCount ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("button", {
    key: 0,
    type: "button",
    class: "btn-flat fwum-icon-button",
    disabled: _ctx.checking,
    onClick: _cache[2] || (_cache[2] = (...args) => _ctx.checkNow && _ctx.checkNow(...args))
  }, [_hoisted_40, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(" " + Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate(_ctx.checking ? 'FeinwerkUptimeMonitor_UiChecking' : 'FeinwerkUptimeMonitor_UiCheckNow')), 1)], 8, _hoisted_39)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("button", {
    type: "button",
    class: "btn-flat fwum-icon-button",
    onClick: _cache[3] || (_cache[3] = $event => _ctx.panelOpen = true)
  }, [_hoisted_41, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(" " + Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiEditTargets')), 1)])])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)]), _ctx.checkNote ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("p", _hoisted_42, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.checkNote), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), !_ctx.siteRows.length ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("p", _hoisted_43, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate(_ctx.siteTargetCount ? 'FeinwerkUptimeMonitor_UiAllOffSite' : 'FeinwerkUptimeMonitor_UiFirstCheck')), 1)) : (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", _hoisted_44, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("table", _hoisted_45, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("thead", null, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("tr", null, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("th", _hoisted_46, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiAddress')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("th", _hoisted_47, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiResponse')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("th", _hoisted_48, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiUptime')), 1), _ctx.siteHasCerts ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("th", _hoisted_49, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiCertificate')), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)])]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("tbody", null, [(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderList"])(_ctx.siteRows, row => {
    return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("tr", {
      key: row.key,
      class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(`is-${row.outcome}`)
    }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("td", {
      title: row.title
    }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", _hoisted_51, [_hoisted_52, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", _hoisted_53, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(row.label), 1)])], 8, _hoisted_50), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("td", _hoisted_54, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(row.text), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("td", _hoisted_55, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(row.uptime), 1), _ctx.siteHasCerts ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("td", {
      key: 0,
      class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(["fwum-targets__cert", `is-${row.certLevel}`])
    }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(row.cert), 3)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)], 2);
  }), 128))])])])), _ctx.siteRows.some(r => r.outcome === 'not_checkable') ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("p", _hoisted_56, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiNotCheckableHelp')) + " ", 1), _ctx.config.isSuperUser && !_ctx.config.embedded ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("a", {
    key: 0,
    href: _ctx.settingsUrl
  }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiSettings')), 9, _hoisted_57)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)], 8, _hoisted_34)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.config.variant === 'page' ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createBlock"])(_component_OutageList, {
    key: 5,
    incidents: _ctx.incidents,
    labels: _ctx.labels,
    language: _ctx.config.language,
    truncated: _ctx.incidentsCut
  }, null, 8, ["incidents", "labels", "language", "truncated"])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.config.feedback ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createBlock"])(_component_FeedbackBar, {
    key: 6,
    "id-site": _ctx.config.idSite,
    topic: "page",
    question: _ctx.translate('FeinwerkUptimeMonitor_FeedbackQuestion_page'),
    feedback: _ctx.config.feedback
  }, null, 8, ["id-site", "question", "feedback"])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createVNode"])(_component_PromoLine, {
    promo: _ctx.config.promo,
    "dismiss-label": _ctx.translate('FeinwerkUptimeMonitor_PromoDismiss')
  }, null, 8, ["promo", "dismiss-label"]), _ctx.panelOpen ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createBlock"])(_component_TargetPanel, {
    key: 7,
    "id-site": _ctx.config.idSite,
    "site-name": _ctx.config.siteName || '',
    onClose: _ctx.onPanelClose
  }, null, 8, ["id-site", "site-name", "onClose"])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)], 64))], 10, _hoisted_1);
}
// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/UptimePage.vue?vue&type=template&id=f8021f7e

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
  incidents(idSite, period, timezoneOf = 0) {
    return get('getIncidents', Object.assign(Object.assign({
      idSite
    }, period), {}, {
      limit: 50,
      timezoneOf
    }));
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
function milliseconds(value, language) {
  return value === null ? '' : `${new Intl.NumberFormat(locale(language)).format(value)} ms`;
}
function dateTime(iso, language) {
  return new Intl.DateTimeFormat(locale(language), {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(iso));
}
/** "3 minutes ago" in the page language. */
function ago(iso, language) {
  const seconds = Math.round((new Date(iso).getTime() - Date.now()) / 1000);
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
      text: Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiPartlyDown', String(c.down), String(c.total))
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
// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-babel/node_modules/cache-loader/dist/cjs.js??ref--13-0!./node_modules/@vue/cli-plugin-babel/node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist/templateLoader.js??ref--6!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--1-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--1-1!./plugins/FeinwerkUptimeMonitor/vue/src/OutageList.vue?vue&type=template&id=6ec0eb70

const OutageListvue_type_template_id_6ec0eb70_hoisted_1 = {
  class: "fwum-outages"
};
const OutageListvue_type_template_id_6ec0eb70_hoisted_2 = {
  class: "fwum-outages__title",
  role: "heading",
  "aria-level": "3"
};
const OutageListvue_type_template_id_6ec0eb70_hoisted_3 = {
  key: 0,
  class: "fwum-muted"
};
const OutageListvue_type_template_id_6ec0eb70_hoisted_4 = {
  key: 1,
  class: "fwum-table-wrap"
};
const OutageListvue_type_template_id_6ec0eb70_hoisted_5 = {
  class: "entityTable fwum-outages__table"
};
const OutageListvue_type_template_id_6ec0eb70_hoisted_6 = {
  scope: "col"
};
const OutageListvue_type_template_id_6ec0eb70_hoisted_7 = {
  scope: "col"
};
const OutageListvue_type_template_id_6ec0eb70_hoisted_8 = {
  scope: "col"
};
const OutageListvue_type_template_id_6ec0eb70_hoisted_9 = {
  scope: "col"
};
const OutageListvue_type_template_id_6ec0eb70_hoisted_10 = {
  key: 0,
  scope: "col"
};
const OutageListvue_type_template_id_6ec0eb70_hoisted_11 = {
  key: 0,
  class: "fwum-ongoing"
};
const OutageListvue_type_template_id_6ec0eb70_hoisted_12 = {
  key: 0
};
const OutageListvue_type_template_id_6ec0eb70_hoisted_13 = {
  key: 0,
  class: "fwum-note"
};
function OutageListvue_type_template_id_6ec0eb70_render(_ctx, _cache, $props, $setup, $data, $options) {
  return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", OutageListvue_type_template_id_6ec0eb70_hoisted_1, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", OutageListvue_type_template_id_6ec0eb70_hoisted_2, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiOutages')), 1), _ctx.incidents.length === 0 ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("p", OutageListvue_type_template_id_6ec0eb70_hoisted_3, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiNoOutages')), 1)) : (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", OutageListvue_type_template_id_6ec0eb70_hoisted_4, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("table", OutageListvue_type_template_id_6ec0eb70_hoisted_5, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("thead", null, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("tr", null, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("th", OutageListvue_type_template_id_6ec0eb70_hoisted_6, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiStart')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("th", OutageListvue_type_template_id_6ec0eb70_hoisted_7, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiDuration')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("th", OutageListvue_type_template_id_6ec0eb70_hoisted_8, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiWhat')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("th", OutageListvue_type_template_id_6ec0eb70_hoisted_9, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiCause')), 1), _ctx.hasExternal ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("th", OutageListvue_type_template_id_6ec0eb70_hoisted_10, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiSource')), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)])]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("tbody", null, [(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderList"])(_ctx.incidents, incident => {
    return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("tr", {
      key: incident.idIncident
    }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("td", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.when(incident.start)), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("td", null, [incident.open ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", OutageListvue_type_template_id_6ec0eb70_hoisted_11, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiOngoing')) + ", ", 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(" " + Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.length(incident.durationSeconds)), 1)]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("td", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.what(incident)), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("td", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.cause(incident)), 1), _ctx.hasExternal ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("td", OutageListvue_type_template_id_6ec0eb70_hoisted_12, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.source(incident.source)), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)]);
  }), 128))])]), _ctx.truncated ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("p", OutageListvue_type_template_id_6ec0eb70_hoisted_13, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiOutagesNewest', '20')), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)]))]);
}
// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/OutageList.vue?vue&type=template&id=6ec0eb70

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
    /** more outages than the ones listed */
    truncated: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    /** the column helps only once results come from outside (the free plugin checks from Matomo) */
    hasExternal() {
      return this.incidents.some(i => i.source === 'external');
    }
  },
  methods: {
    translate: external_CoreHome_["translate"],
    when(iso) {
      return dateTime(iso, this.language);
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



OutageListvue_type_script_lang_ts.render = OutageListvue_type_template_id_6ec0eb70_render

/* harmony default export */ var OutageList = (OutageListvue_type_script_lang_ts);
// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-babel/node_modules/cache-loader/dist/cjs.js??ref--13-0!./node_modules/@vue/cli-plugin-babel/node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist/templateLoader.js??ref--6!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--1-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--1-1!./plugins/FeinwerkUptimeMonitor/vue/src/TargetPanel.vue?vue&type=template&id=dc4c6f82

const TargetPanelvue_type_template_id_dc4c6f82_hoisted_1 = ["aria-labelledby"];
const TargetPanelvue_type_template_id_dc4c6f82_hoisted_2 = {
  class: "fwum-panel__head"
};
const TargetPanelvue_type_template_id_dc4c6f82_hoisted_3 = ["id"];
const TargetPanelvue_type_template_id_dc4c6f82_hoisted_4 = ["aria-label", "title"];
const TargetPanelvue_type_template_id_dc4c6f82_hoisted_5 = {
  class: "fwum-panel__body"
};
const TargetPanelvue_type_template_id_dc4c6f82_hoisted_6 = {
  key: 0,
  class: "fwum-muted",
  "aria-busy": "true"
};
const TargetPanelvue_type_template_id_dc4c6f82_hoisted_7 = {
  key: 1,
  class: "fwum-inline-error",
  role: "alert"
};
const TargetPanelvue_type_template_id_dc4c6f82_hoisted_8 = {
  key: 2,
  class: "fwum-inline-error",
  role: "alert"
};
const TargetPanelvue_type_template_id_dc4c6f82_hoisted_9 = {
  key: 3,
  class: "fwum-edit-list"
};
const TargetPanelvue_type_template_id_dc4c6f82_hoisted_10 = ["data-fwum-key"];
const TargetPanelvue_type_template_id_dc4c6f82_hoisted_11 = {
  class: "fwum-edit-list__check"
};
const TargetPanelvue_type_template_id_dc4c6f82_hoisted_12 = ["checked", "disabled", "onChange"];
const TargetPanelvue_type_template_id_dc4c6f82_hoisted_13 = {
  class: "fwum-muted"
};
const TargetPanelvue_type_template_id_dc4c6f82_hoisted_14 = {
  key: 0,
  class: "fwum-edit-list__edit"
};
const TargetPanelvue_type_template_id_dc4c6f82_hoisted_15 = ["aria-label", "onKeydown"];
const TargetPanelvue_type_template_id_dc4c6f82_hoisted_16 = ["disabled", "onClick"];
const TargetPanelvue_type_template_id_dc4c6f82_hoisted_17 = ["onClick"];
const TargetPanelvue_type_template_id_dc4c6f82_hoisted_18 = {
  key: 1,
  class: "fwum-edit-list__confirm",
  role: "group"
};
const TargetPanelvue_type_template_id_dc4c6f82_hoisted_19 = ["disabled", "onClick"];
const TargetPanelvue_type_template_id_dc4c6f82_hoisted_20 = ["onClick"];
const TargetPanelvue_type_template_id_dc4c6f82_hoisted_21 = {
  key: 2,
  class: "fwum-edit-list__url"
};
const TargetPanelvue_type_template_id_dc4c6f82_hoisted_22 = ["title"];
const TargetPanelvue_type_template_id_dc4c6f82_hoisted_23 = ["onClick"];
const TargetPanelvue_type_template_id_dc4c6f82_hoisted_24 = ["disabled", "onClick"];
const TargetPanelvue_type_template_id_dc4c6f82_hoisted_25 = {
  key: 4,
  class: "fwum-suggestions"
};
const TargetPanelvue_type_template_id_dc4c6f82_hoisted_26 = ["disabled", "onClick"];
const TargetPanelvue_type_template_id_dc4c6f82_hoisted_27 = {
  class: "fwum-add__row"
};
const TargetPanelvue_type_template_id_dc4c6f82_hoisted_28 = ["aria-label"];
const TargetPanelvue_type_template_id_dc4c6f82_hoisted_29 = {
  value: "web"
};
const TargetPanelvue_type_template_id_dc4c6f82_hoisted_30 = {
  value: "proxy"
};
const TargetPanelvue_type_template_id_dc4c6f82_hoisted_31 = ["aria-label"];
const TargetPanelvue_type_template_id_dc4c6f82_hoisted_32 = {
  class: "fwum-panel__foot"
};
const TargetPanelvue_type_template_id_dc4c6f82_hoisted_33 = ["disabled"];
function TargetPanelvue_type_template_id_dc4c6f82_render(_ctx, _cache, $props, $setup, $data, $options) {
  return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", {
    class: "fwum-panel-backdrop",
    onClick: _cache[8] || (_cache[8] = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withModifiers"])((...args) => _ctx.close && _ctx.close(...args), ["self"]))
  }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", {
    ref: "panel",
    class: "fwum-panel",
    role: "dialog",
    "aria-modal": "true",
    "aria-labelledby": _ctx.titleId,
    tabindex: "-1"
  }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", TargetPanelvue_type_template_id_dc4c6f82_hoisted_2, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("h2", {
    id: _ctx.titleId,
    class: "fwum-panel__title"
  }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.siteName ? _ctx.translate('FeinwerkUptimeMonitor_UiTargetsTitleOf', _ctx.siteName) : _ctx.translate('FeinwerkUptimeMonitor_UiTargetsTitle')), 9, TargetPanelvue_type_template_id_dc4c6f82_hoisted_3), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("button", {
    type: "button",
    class: "fwum-panel__close",
    "aria-label": _ctx.translate('FeinwerkUptimeMonitor_UiClose'),
    title: _ctx.translate('FeinwerkUptimeMonitor_UiClose'),
    onClick: _cache[0] || (_cache[0] = (...args) => _ctx.close && _ctx.close(...args))
  }, "×", 8, TargetPanelvue_type_template_id_dc4c6f82_hoisted_4)]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", TargetPanelvue_type_template_id_dc4c6f82_hoisted_5, [_ctx.loading ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("p", TargetPanelvue_type_template_id_dc4c6f82_hoisted_6, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiLoading')), 1)) : _ctx.loadFailed ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", TargetPanelvue_type_template_id_dc4c6f82_hoisted_7, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiLoadFailed')) + " ", 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("button", {
    type: "button",
    class: "btn-flat",
    onClick: _cache[1] || (_cache[1] = (...args) => _ctx.load && _ctx.load(...args))
  }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiRetry')), 1)])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.error ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("p", TargetPanelvue_type_template_id_dc4c6f82_hoisted_8, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.error), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.targets.length ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("ul", TargetPanelvue_type_template_id_dc4c6f82_hoisted_9, [(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderList"])(_ctx.targets, target => {
    return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("li", {
      key: target.targetKey,
      "data-fwum-key": target.targetKey
    }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("label", TargetPanelvue_type_template_id_dc4c6f82_hoisted_11, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("input", {
      type: "checkbox",
      "data-fwum-focus": "toggle",
      checked: target.enabled,
      disabled: _ctx.busy,
      onChange: $event => _ctx.toggle(target)
    }, null, 40, TargetPanelvue_type_template_id_dc4c6f82_hoisted_12), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.kindLabel(target.kind, target.targetKey)), 1)]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", TargetPanelvue_type_template_id_dc4c6f82_hoisted_13, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.sourceLabel(target.urlSource)), 1), _ctx.editing === target.targetKey ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", TargetPanelvue_type_template_id_dc4c6f82_hoisted_14, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withDirectives"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("input", {
      "onUpdate:modelValue": _cache[2] || (_cache[2] = $event => _ctx.draftUrl = $event),
      type: "url",
      class: "browser-default fwum-input",
      "data-fwum-focus": "url",
      "aria-label": _ctx.translate('FeinwerkUptimeMonitor_UiUrl'),
      onKeydown: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withKeys"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withModifiers"])($event => _ctx.draftUrl && _ctx.saveUrl(target), ["prevent"]), ["enter"])
    }, null, 40, TargetPanelvue_type_template_id_dc4c6f82_hoisted_15), [[external_commonjs_vue_commonjs2_vue_root_Vue_["vModelText"], _ctx.draftUrl]]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("button", {
      type: "button",
      class: "btn-flat",
      disabled: _ctx.busy || !_ctx.draftUrl,
      onClick: $event => _ctx.saveUrl(target)
    }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiSave')), 9, TargetPanelvue_type_template_id_dc4c6f82_hoisted_16), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("button", {
      type: "button",
      class: "btn-flat",
      onClick: $event => _ctx.cancel(target.targetKey)
    }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiCancel')), 9, TargetPanelvue_type_template_id_dc4c6f82_hoisted_17)])) : _ctx.removing === target.targetKey ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", TargetPanelvue_type_template_id_dc4c6f82_hoisted_18, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiRemoveConfirm', target.url || '')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("button", {
      type: "button",
      class: "btn-flat",
      "data-fwum-focus": "confirm",
      disabled: _ctx.busy,
      onClick: $event => _ctx.remove(target)
    }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiDelete')), 9, TargetPanelvue_type_template_id_dc4c6f82_hoisted_19), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("button", {
      type: "button",
      class: "btn-flat",
      onClick: $event => _ctx.cancel(target.targetKey)
    }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiCancel')), 9, TargetPanelvue_type_template_id_dc4c6f82_hoisted_20)])) : (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", TargetPanelvue_type_template_id_dc4c6f82_hoisted_21, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
      title: target.url || ''
    }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(target.url), 9, TargetPanelvue_type_template_id_dc4c6f82_hoisted_22), target.url !== null ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("button", {
      key: 0,
      type: "button",
      class: "btn-flat",
      "data-fwum-focus": "change",
      onClick: $event => _ctx.startEdit(target)
    }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiChange')), 9, TargetPanelvue_type_template_id_dc4c6f82_hoisted_23)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), target.urlSource !== 'default' ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("button", {
      key: 1,
      type: "button",
      class: "btn-flat",
      disabled: _ctx.busy,
      onClick: $event => _ctx.startRemove(target)
    }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiDelete')), 9, TargetPanelvue_type_template_id_dc4c6f82_hoisted_24)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)]))], 8, TargetPanelvue_type_template_id_dc4c6f82_hoisted_10);
  }), 128))])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.suggestions.length ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", TargetPanelvue_type_template_id_dc4c6f82_hoisted_25, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("h3", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiSuggestions')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("ul", null, [(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderList"])(_ctx.suggestions, suggestion => {
    return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("li", {
      key: suggestion.key + suggestion.url
    }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.kindLabel(suggestion.kind, suggestion.key)) + ": " + Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(suggestion.url), 1), _ctx.canAdopt(suggestion) ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("button", {
      key: 0,
      type: "button",
      class: "btn-flat",
      disabled: _ctx.busy,
      onClick: $event => _ctx.adopt(suggestion)
    }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiAdopt')), 9, TargetPanelvue_type_template_id_dc4c6f82_hoisted_26)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)]);
  }), 128))])])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.idSite > 0 ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("form", {
    key: 5,
    class: "fwum-add",
    onSubmit: _cache[5] || (_cache[5] = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withModifiers"])((...args) => _ctx.add && _ctx.add(...args), ["prevent"]))
  }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("h3", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiAdd')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", TargetPanelvue_type_template_id_dc4c6f82_hoisted_27, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withDirectives"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("select", {
    "onUpdate:modelValue": _cache[3] || (_cache[3] = $event => _ctx.newKind = $event),
    class: "browser-default fwum-select",
    "aria-label": _ctx.translate('FeinwerkUptimeMonitor_UiAddKind')
  }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("option", TargetPanelvue_type_template_id_dc4c6f82_hoisted_29, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiAddWeb')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("option", TargetPanelvue_type_template_id_dc4c6f82_hoisted_30, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiKind_proxy')), 1)], 8, TargetPanelvue_type_template_id_dc4c6f82_hoisted_28), [[external_commonjs_vue_commonjs2_vue_root_Vue_["vModelSelect"], _ctx.newKind]]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withDirectives"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("input", {
    "onUpdate:modelValue": _cache[4] || (_cache[4] = $event => _ctx.newUrl = $event),
    type: "url",
    class: "browser-default fwum-input",
    placeholder: "https://",
    "aria-label": _ctx.translate('FeinwerkUptimeMonitor_UiUrl')
  }, null, 8, TargetPanelvue_type_template_id_dc4c6f82_hoisted_31), [[external_commonjs_vue_commonjs2_vue_root_Vue_["vModelText"], _ctx.newUrl]])])], 32)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", TargetPanelvue_type_template_id_dc4c6f82_hoisted_32, [_ctx.idSite > 0 ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("button", {
    key: 0,
    type: "button",
    class: "btn",
    disabled: _ctx.busy || !_ctx.newUrl,
    onClick: _cache[6] || (_cache[6] = (...args) => _ctx.add && _ctx.add(...args))
  }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiAdd')), 9, TargetPanelvue_type_template_id_dc4c6f82_hoisted_33)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("button", {
    type: "button",
    class: "btn-flat",
    onClick: _cache[7] || (_cache[7] = (...args) => _ctx.close && _ctx.close(...args))
  }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiClose')), 1)])], 8, TargetPanelvue_type_template_id_dc4c6f82_hoisted_1)]);
}
// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/TargetPanel.vue?vue&type=template&id=dc4c6f82

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
    onKey(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        this.close();
      } else if (event.key === 'Tab') {
        this.trap(event);
      }
    },
    /** @param focus after success: [target key, control] to focus once the list is back */
    run(request, focus = null) {
      this.busy = true;
      this.error = '';
      request.then(() => {
        this.changed = true;
        this.editing = '';
        this.removing = '';
        this.focusAfter = focus;
        this.load();
      }).catch(e => {
        this.error = errorText(e);
        this.$nextTick(() => this.restoreFocus());
      }).finally(() => {
        this.busy = false;
      });
    },
    toggle(target) {
      this.run(api.updateTarget(this.idSite, target.targetKey, '', target.enabled ? '0' : '1'), [target.targetKey, 'toggle']);
    },
    startEdit(target) {
      this.editing = target.targetKey;
      this.draftUrl = target.url || '';
      this.focusRow(target.targetKey, 'url');
    },
    saveUrl(target) {
      this.run(api.updateTarget(this.idSite, target.targetKey, this.draftUrl.trim(), ''), [target.targetKey, 'change']);
    },
    remove(target) {
      this.run(api.deleteTarget(this.idSite, target.targetKey));
    },
    add() {
      if (!this.newUrl) {
        return;
      }
      this.run(api.addTarget(this.idSite, this.newKind, this.newUrl.trim()).then(row => {
        this.newUrl = '';
        return row;
      }));
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



TargetPanelvue_type_script_lang_ts.render = TargetPanelvue_type_template_id_dc4c6f82_render

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
// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-typescript/node_modules/cache-loader/dist/cjs.js??ref--15-0!./node_modules/babel-loader/lib!./node_modules/@vue/cli-plugin-typescript/node_modules/ts-loader??ref--15-2!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--1-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--1-1!./plugins/FeinwerkUptimeMonitor/vue/src/UptimePage.vue?vue&type=script&lang=ts









const MATOMO_KINDS = ['ui', 'tracker', 'js'];
const ORDER = ['ui', 'tracker', 'js', 'web', 'proxy', 'container'];
/* harmony default export */ var UptimePagevue_type_script_lang_ts = (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["defineComponent"])({
  components: {
    Sparkline: Sparkline,
    OutageList: OutageList,
    TargetPanel: TargetPanel,
    FeedbackBar: FeedbackBar,
    PromoLine: PromoLine
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
      matomo: null,
      site: null,
      matomoUptimeRows: [],
      siteUptimeRows: [],
      incidents: [],
      /** more outages than the 20 shown */
      incidentsCut: false,
      series: [],
      seriesIsProcessing: true,
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
    /** the website card: always next to Matomo's, unless the first check has not run at all */
    siteCardShown() {
      return this.showSite && !!this.site && (this.siteRows.length > 0 || !this.nothingChecked);
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
    siteHasCerts() {
      return this.siteRows.some(r => r.cert !== '');
    },
    matomoState() {
      return this.summary(this.matomoRows);
    },
    siteState() {
      return this.summary(this.siteRows);
    },
    nothingChecked() {
      var _this$matomo3, _this$site3;
      const all = [...(((_this$matomo3 = this.matomo) === null || _this$matomo3 === void 0 ? void 0 : _this$matomo3.targets) || []), ...(((_this$site3 = this.site) === null || _this$site3 === void 0 ? void 0 : _this$site3.targets) || [])];
      return all.every(t => !t.states.local && !t.states.external);
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
    matomoUptime() {
      const rows = this.matomoUptimeRows.filter(r => r.source === 'local' && MATOMO_KINDS.includes(r.kind) && r.uptimePercent !== null);
      if (!rows.length) {
        return null;
      }
      const worst = rows.reduce((a, b) => {
        var _b$uptimePercent, _a$uptimePercent;
        return ((_b$uptimePercent = b.uptimePercent) !== null && _b$uptimePercent !== void 0 ? _b$uptimePercent : 100) < ((_a$uptimePercent = a.uptimePercent) !== null && _a$uptimePercent !== void 0 ? _a$uptimePercent : 100) ? b : a;
      });
      return {
        value: percent(worst.uptimePercent, this.config.language, 2),
        coverage: Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiMeasured', percent(worst.coveragePercent, this.config.language, 0))
      };
    },
    trackerTime() {
      var _this$matomo5;
      const processing = (_this$matomo5 = this.matomo) === null || _this$matomo5 === void 0 ? void 0 : _this$matomo5.processing;
      if (processing && processing.samples > 0 && processing.p50Ms !== null) {
        return {
          label: Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiTrackerProcessing'),
          value: milliseconds(processing.p50Ms, this.config.language),
          sub: Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiMedianLastHour'),
          processing: true
        };
      }
      // without tracking traffic in the last hour there is no processing time; the endpoint's
      // time is in the list below
      return null;
    },
    matomoCert() {
      var _this$matomo6;
      const certs = (((_this$matomo6 = this.matomo) === null || _this$matomo6 === void 0 ? void 0 : _this$matomo6.targets) || []).map(t => t.certificate).filter(c => c !== null);
      if (!certs.length) {
        return null;
      }
      const soonest = certs.reduce((a, b) => b.daysLeft < a.daysLeft ? b : a);
      return {
        text: this.certText(soonest),
        level: soonest.level
      };
    },
    sparkValues() {
      return this.series.map(p => p.p50Ms);
    },
    sparkLabel() {
      return Object(external_CoreHome_["translate"])(this.seriesIsProcessing ? 'FeinwerkUptimeMonitor_UiResponseTime' : 'FeinwerkUptimeMonitor_UiEndpointTime');
    }
  },
  watch: {
    period() {
      this.load();
    }
  },
  mounted() {
    this.load();
  },
  methods: {
    translate: external_CoreHome_["translate"],
    load() {
      this.loading = true;
      this.failed = false;
      const {
        idSite
      } = this.config;
      const {
        period
      } = this;
      const requests = [];
      if (this.showMatomo) {
        requests.push(api.status(0).then(s => {
          this.matomo = s;
        }));
        requests.push(api.uptime(0, period, idSite).then(r => {
          this.matomoUptimeRows = r;
        }));
        requests.push(this.loadSeries(period));
      }
      if (this.showSite) {
        requests.push(api.status(idSite).then(s => {
          this.site = s;
        }));
        requests.push(api.uptime(idSite, period).then(r => {
          this.siteUptimeRows = r;
        }));
      }
      if (this.config.variant === 'page') {
        const matomoIncidents = this.showMatomo ? api.incidents(0, period, idSite) : Promise.resolve([]);
        requests.push(Promise.all([api.incidents(idSite, period), matomoIncidents]).then(([own, matomo]) => {
          const all = [...own, ...matomo].sort((a, b) => b.start.localeCompare(a.start));
          this.incidentsCut = all.length > 20;
          this.incidents = all.slice(0, 20);
        }));
      }
      return Promise.all(requests).then(() => {
        this.loaded = true;
      }).catch(() => {
        this.failed = true;
      }).finally(() => {
        this.loading = false;
      });
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
      let title = target.url || targetLabel(target);
      if (!state) {
        text = Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiNotMeasuredYet');
      } else if (state.stale) {
        outcome = 'stale';
        text = Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiNoRecentCheck', dateTime(state.checkedAt, this.config.language));
      } else if (state.outcome === 'up') {
        text = milliseconds(state.responseMs, this.config.language);
      } else if (state.outcome === 'not_checkable') {
        text = Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiNotCheckable');
        title = Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiTitleWithHelp', title, Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiNotCheckableHelp'));
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
        checkedAt: state && !state.stale ? state.checkedAt : ''
      };
    },
    /**
     * The card's answer: not reachable only when nothing answered; a partial failure is counted.
     */
    summary(rows) {
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
    checkedText(rows) {
      const newest = rows.map(r => r.checkedAt).filter(t => t !== '').sort().pop();
      return newest ? Object(external_CoreHome_["translate"])('FeinwerkUptimeMonitor_UiChecked', ago(newest, this.config.language)) : '';
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
// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-babel/node_modules/cache-loader/dist/cjs.js??ref--13-0!./node_modules/@vue/cli-plugin-babel/node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist/templateLoader.js??ref--6!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--1-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--1-1!./plugins/FeinwerkUptimeMonitor/vue/src/AdminPage.vue?vue&type=template&id=afc30ec6

const AdminPagevue_type_template_id_afc30ec6_hoisted_1 = ["lang"];
const AdminPagevue_type_template_id_afc30ec6_hoisted_2 = {
  key: 0,
  class: "fwum-loading",
  "aria-busy": "true"
};
const AdminPagevue_type_template_id_afc30ec6_hoisted_3 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
  class: "loadingPiwik"
}, [/*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("img", {
  src: "plugins/Morpheus/images/loading-blue.gif",
  alt: ""
})], -1);
const AdminPagevue_type_template_id_afc30ec6_hoisted_4 = [AdminPagevue_type_template_id_afc30ec6_hoisted_3];
const AdminPagevue_type_template_id_afc30ec6_hoisted_5 = {
  key: 1,
  class: "fwum-error",
  role: "alert"
};
const AdminPagevue_type_template_id_afc30ec6_hoisted_6 = {
  key: 2,
  class: "fwum-table-wrap"
};
const AdminPagevue_type_template_id_afc30ec6_hoisted_7 = {
  class: "entityTable dataTable fwum-admin__table"
};
const AdminPagevue_type_template_id_afc30ec6_hoisted_8 = {
  scope: "col"
};
const AdminPagevue_type_template_id_afc30ec6_hoisted_9 = {
  scope: "col"
};
const AdminPagevue_type_template_id_afc30ec6_hoisted_10 = {
  key: 0,
  scope: "col"
};
const AdminPagevue_type_template_id_afc30ec6_hoisted_11 = {
  scope: "col",
  class: "fwum-wide-only"
};
const AdminPagevue_type_template_id_afc30ec6_hoisted_12 = {
  class: "fwum-admin__name"
};
const AdminPagevue_type_template_id_afc30ec6_hoisted_13 = ["href"];
const AdminPagevue_type_template_id_afc30ec6_hoisted_14 = {
  key: 1
};
const AdminPagevue_type_template_id_afc30ec6_hoisted_15 = ["title", "aria-label", "onClick"];
const AdminPagevue_type_template_id_afc30ec6_hoisted_16 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
  class: "icon-edit",
  "aria-hidden": "true"
}, null, -1);
const AdminPagevue_type_template_id_afc30ec6_hoisted_17 = [AdminPagevue_type_template_id_afc30ec6_hoisted_16];
const AdminPagevue_type_template_id_afc30ec6_hoisted_18 = {
  class: "fwum-cell-label"
};
const AdminPagevue_type_template_id_afc30ec6_hoisted_19 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
  class: "fwum-dot",
  "aria-hidden": "true"
}, null, -1);
const AdminPagevue_type_template_id_afc30ec6_hoisted_20 = ["title"];
const AdminPagevue_type_template_id_afc30ec6_hoisted_21 = {
  key: 0
};
const AdminPagevue_type_template_id_afc30ec6_hoisted_22 = ["title"];
const AdminPagevue_type_template_id_afc30ec6_hoisted_23 = {
  key: 3,
  class: "fwum-muted"
};
const AdminPagevue_type_template_id_afc30ec6_hoisted_24 = {
  class: "fwum-cron"
};
const AdminPagevue_type_template_id_afc30ec6_hoisted_25 = {
  key: 0
};
const AdminPagevue_type_template_id_afc30ec6_hoisted_26 = {
  key: 1
};
const AdminPagevue_type_template_id_afc30ec6_hoisted_27 = {
  key: 2,
  class: "fwum-muted"
};
const AdminPagevue_type_template_id_afc30ec6_hoisted_28 = ["href"];
function AdminPagevue_type_template_id_afc30ec6_render(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_ContentBlock = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("ContentBlock");
  const _component_TargetPanel = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("TargetPanel");
  return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", {
    class: "fwum-admin",
    lang: _ctx.config.language || undefined
  }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createVNode"])(_component_ContentBlock, {
    "content-title": _ctx.translate('FeinwerkUptimeMonitor_MenuTitle')
  }, {
    default: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withCtx"])(() => [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("p", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiAdminIntro')), 1), _ctx.loading && !_ctx.rows.length ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", AdminPagevue_type_template_id_afc30ec6_hoisted_2, AdminPagevue_type_template_id_afc30ec6_hoisted_4)) : _ctx.failed ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", AdminPagevue_type_template_id_afc30ec6_hoisted_5, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("p", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiLoadFailed')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("button", {
      type: "button",
      class: "btn-flat",
      onClick: _cache[0] || (_cache[0] = (...args) => _ctx.load && _ctx.load(...args))
    }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiRetry')), 1)])) : _ctx.rows.length ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", AdminPagevue_type_template_id_afc30ec6_hoisted_6, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("table", AdminPagevue_type_template_id_afc30ec6_hoisted_7, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("thead", null, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("tr", null, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("th", AdminPagevue_type_template_id_afc30ec6_hoisted_8, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiSiteName')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("th", AdminPagevue_type_template_id_afc30ec6_hoisted_9, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiStatus')), 1), _ctx.hasCerts ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("th", AdminPagevue_type_template_id_afc30ec6_hoisted_10, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiCertificate')), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("th", AdminPagevue_type_template_id_afc30ec6_hoisted_11, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiLastCheck')), 1)])]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("tbody", null, [(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderList"])(_ctx.sorted, row => {
      return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("tr", {
        key: row.idSite
      }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("td", AdminPagevue_type_template_id_afc30ec6_hoisted_12, [row.idSite > 0 ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("a", {
        key: 0,
        href: _ctx.pageUrl(row.idSite)
      }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(row.name), 9, AdminPagevue_type_template_id_afc30ec6_hoisted_13)) : (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", AdminPagevue_type_template_id_afc30ec6_hoisted_14, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(row.name), 1)), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("button", {
        type: "button",
        class: "btn-flat fwum-icon-only",
        title: _ctx.translate('FeinwerkUptimeMonitor_UiEditTargetsOf', row.name),
        "aria-label": _ctx.translate('FeinwerkUptimeMonitor_UiEditTargetsOf', row.name),
        onClick: $event => _ctx.openPanel(row)
      }, AdminPagevue_type_template_id_afc30ec6_hoisted_17, 8, AdminPagevue_type_template_id_afc30ec6_hoisted_15)]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("td", {
        class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(["fwum-admin__status", `is-${_ctx.status(row).outcome}`])
      }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", AdminPagevue_type_template_id_afc30ec6_hoisted_18, [AdminPagevue_type_template_id_afc30ec6_hoisted_19, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.status(row).text), 1)]), row.lastCheckedAt ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", {
        key: 0,
        class: "fwum-muted fwum-narrow-only",
        title: _ctx.when(row.lastCheckedAt)
      }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.since(row.lastCheckedAt)), 9, AdminPagevue_type_template_id_afc30ec6_hoisted_20)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)], 2), _ctx.hasCerts ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("td", AdminPagevue_type_template_id_afc30ec6_hoisted_21, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.certText(row.certificateDaysLeft)), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("td", {
        class: "fwum-wide-only",
        title: row.lastCheckedAt ? _ctx.when(row.lastCheckedAt) : ''
      }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(row.lastCheckedAt ? _ctx.since(row.lastCheckedAt) : ''), 9, AdminPagevue_type_template_id_afc30ec6_hoisted_22)]);
    }), 128))])])])) : !_ctx.loading ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("p", AdminPagevue_type_template_id_afc30ec6_hoisted_23, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiFirstCheck')), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)]),
    _: 1
  }, 8, ["content-title"]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createVNode"])(_component_ContentBlock, {
    "content-title": _ctx.translate('FeinwerkUptimeMonitor_UiCron')
  }, {
    default: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withCtx"])(() => [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("p", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiCronHelp')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", AdminPagevue_type_template_id_afc30ec6_hoisted_24, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("code", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.config.cronLine), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("button", {
      type: "button",
      class: "btn-flat",
      onClick: _cache[1] || (_cache[1] = (...args) => _ctx.copy && _ctx.copy(...args))
    }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate(_ctx.copied ? 'FeinwerkUptimeMonitor_UiCopied' : 'FeinwerkUptimeMonitor_UiCopy')), 1)])]),
    _: 1
  }, 8, ["content-title"]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createVNode"])(_component_ContentBlock, {
    "content-title": _ctx.translate('FeinwerkUptimeMonitor_UiAlerts')
  }, {
    default: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withCtx"])(() => [_ctx.config.sentinel === 'active' ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("p", AdminPagevue_type_template_id_afc30ec6_hoisted_25, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiSentinelActive')), 1)) : (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("p", AdminPagevue_type_template_id_afc30ec6_hoisted_26, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiSentinelAbsent')), 1)), _ctx.config.sentinel === 'active' ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("p", AdminPagevue_type_template_id_afc30ec6_hoisted_27, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiSentinelFacts')), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("p", null, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("a", {
      href: _ctx.settingsUrl
    }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('FeinwerkUptimeMonitor_UiSettings')), 9, AdminPagevue_type_template_id_afc30ec6_hoisted_28)])]),
    _: 1
  }, 8, ["content-title"]), _ctx.panelSite !== null ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createBlock"])(_component_TargetPanel, {
    key: 0,
    "id-site": _ctx.panelSite,
    "site-name": _ctx.panelName,
    onClose: _ctx.onPanelClose
  }, null, 8, ["id-site", "site-name", "onClose"])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)], 8, AdminPagevue_type_template_id_afc30ec6_hoisted_1);
}
// CONCATENATED MODULE: ./plugins/FeinwerkUptimeMonitor/vue/src/AdminPage.vue?vue&type=template&id=afc30ec6

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
      panelName: ''
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
      return [...this.rows].sort((a, b) => rank(a) - rank(b) || a.idSite - b.idSite);
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
  },
  methods: {
    translate: external_CoreHome_["translate"],
    load() {
      this.loading = true;
      api.overview().then(rows => {
        this.rows = rows;
        this.failed = false;
      }).catch(() => {
        this.failed = true;
      }).finally(() => {
        this.loading = false;
      });
    },
    when(iso) {
      return dateTime(iso, this.config.language);
    },
    since(iso) {
      return ago(iso, this.config.language);
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



AdminPagevue_type_script_lang_ts.render = AdminPagevue_type_template_id_afc30ec6_render

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