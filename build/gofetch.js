/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ var __webpack_modules__ = ({

/***/ "./src/common/utils.ts":
/*!*****************************!*\
  !*** ./src/common/utils.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"deepMerge\": () => (/* binding */ deepMerge),\n/* harmony export */   \"isAbsoluteURL\": () => (/* binding */ isAbsoluteURL),\n/* harmony export */   \"isResponse\": () => (/* binding */ isResponse)\n/* harmony export */ });\nfunction isAbsoluteURL(url) {\r\n    const r = new RegExp('^(?:[a-z+]+:)?//', 'i');\r\n    return r.test(url.toString());\r\n}\r\nfunction isResponse(fetch) {\r\n    return 'ok' in fetch;\r\n}\r\nfunction isObject(obj) {\r\n    return (obj && typeof obj === 'object' && !Array.isArray(obj));\r\n}\r\nfunction deepMerge(obj1, obj2) {\r\n    if (isObject(obj1) && isObject(obj2)) {\r\n        for (const key in obj2) {\r\n            if (isObject(obj2[key])) {\r\n                Object.assign(obj1, { [key]: {} });\r\n                deepMerge(obj1, { [key]: obj2[key] });\r\n            }\r\n            else {\r\n                Object.assign(obj1, { [key]: obj2[key] });\r\n            }\r\n        }\r\n        return obj1; // properties merged into obj1 and overwrite\r\n    }\r\n    else {\r\n        throw new TypeError('Parameter is not of type Object');\r\n    }\r\n}\r\n\n\n//# sourceURL=webpack://gofetch/./src/common/utils.ts?");

/***/ }),

/***/ "./src/gofetch.ts":
/*!************************!*\
  !*** ./src/gofetch.ts ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"Gofetch\": () => (/* binding */ Gofetch),\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _common_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./common/utils */ \"./src/common/utils.ts\");\n/* harmony import */ var _middleware_manager__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./middleware-manager */ \"./src/middleware-manager.ts\");\nvar __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {\r\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\r\n    return new (P || (P = Promise))(function (resolve, reject) {\r\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\r\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\r\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\r\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\r\n    });\r\n};\r\n\r\n\r\nclass Gofetch {\r\n    constructor(baseURL = window.location.origin, options = {}, fetch = new Request(new URL(baseURL.toString()), Object.assign(Object.assign({}, options), { body: undefined })), middlewares = new _middleware_manager__WEBPACK_IMPORTED_MODULE_1__[\"default\"]()) {\r\n        this._middlewares = new _middleware_manager__WEBPACK_IMPORTED_MODULE_1__[\"default\"]();\r\n        this._fetch = fetch;\r\n        this._defaultOptions = options;\r\n        this._middlewares = middlewares;\r\n    }\r\n    get fetch() {\r\n        return this._fetch.clone();\r\n    }\r\n    get body() {\r\n        return this.fetch.body;\r\n    }\r\n    get bodyUsed() {\r\n        return this.fetch.bodyUsed;\r\n    }\r\n    get headers() {\r\n        return this.fetch.headers;\r\n    }\r\n    get url() {\r\n        return this.fetch.url;\r\n    }\r\n    get raw() {\r\n        return this.fetch;\r\n    }\r\n    arrayBuffer() {\r\n        return this.fetch.arrayBuffer();\r\n    }\r\n    blob() {\r\n        return this.fetch.blob();\r\n    }\r\n    clone() {\r\n        return this._fetch.clone();\r\n    }\r\n    formData() {\r\n        return this.fetch.formData();\r\n    }\r\n    json() {\r\n        return this.fetch.json();\r\n    }\r\n    text() {\r\n        return this.fetch.text();\r\n    }\r\n    get(input, options = {}) {\r\n        return __awaiter(this, void 0, void 0, function* () {\r\n            let config = yield this.dispatchRequestMiddlewares({\r\n                options: (0,_common_utils__WEBPACK_IMPORTED_MODULE_0__.deepMerge)(this._defaultOptions, options)\r\n            });\r\n            const response = yield fetch(this.resolveURL(input), Object.assign(Object.assign({}, config.options), { method: 'GET' }));\r\n            const responseConfig = yield this.dispatchResponseMiddlewares({\r\n                body: response.body,\r\n                options: {\r\n                    headers: response.headers,\r\n                    status: response.status,\r\n                    statusText: response.statusText\r\n                }\r\n            });\r\n            return new Gofetch(this._fetch.url, this._defaultOptions, new Response(responseConfig.body, responseConfig.options), this._middlewares);\r\n        });\r\n    }\r\n    post(input, body, options = {}) {\r\n        return __awaiter(this, void 0, void 0, function* () {\r\n            let requestConfig = yield this.dispatchRequestMiddlewares({\r\n                body,\r\n                options: (0,_common_utils__WEBPACK_IMPORTED_MODULE_0__.deepMerge)(this._defaultOptions, options)\r\n            });\r\n            const response = yield fetch(this.resolveURL(input), Object.assign(Object.assign({}, requestConfig.options), { body: requestConfig.body, method: 'POST' }));\r\n            const responseConfig = yield this.dispatchResponseMiddlewares({\r\n                body: response.body,\r\n                options: {\r\n                    headers: response.headers,\r\n                    status: response.status,\r\n                    statusText: response.statusText\r\n                }\r\n            });\r\n            return new Gofetch(this._fetch.url, this._defaultOptions, new Response(responseConfig.body, responseConfig.options), this._middlewares);\r\n        });\r\n    }\r\n    resolveURL(path) {\r\n        const url = new URL(this._fetch.url);\r\n        if ((0,_common_utils__WEBPACK_IMPORTED_MODULE_0__.isAbsoluteURL)(path)) {\r\n            return path;\r\n        }\r\n        const paths = url.pathname.split('/').filter(_path => _path.length);\r\n        path.toString().split('/').filter(_path => _path.length).forEach(_path => paths.push(_path));\r\n        url.pathname = paths.join('/');\r\n        return url;\r\n    }\r\n    createInstance(baseURL, options) {\r\n        // merge defaults\r\n        options = (0,_common_utils__WEBPACK_IMPORTED_MODULE_0__.deepMerge)(this._defaultOptions, options);\r\n        return new Gofetch(baseURL, new Request(baseURL, options));\r\n    }\r\n    use(middleware) {\r\n        return this._middlewares.add(middleware);\r\n    }\r\n    dispatchResponseMiddlewares(config) {\r\n        return __awaiter(this, void 0, void 0, function* () {\r\n            for (const middleware of this._middlewares) {\r\n                if (middleware.onResponse) {\r\n                    const response = new Response(config.body, config.options);\r\n                    config = yield middleware.onResponse({\r\n                        body: response.clone().body,\r\n                        options: config.options,\r\n                        json: () => response.clone().json(),\r\n                        arrayBuffer: () => response.clone().arrayBuffer(),\r\n                        blob: () => response.clone().blob(),\r\n                        formData: () => response.clone().formData(),\r\n                        text: () => response.clone().text()\r\n                    });\r\n                }\r\n            }\r\n            return config;\r\n        });\r\n    }\r\n    dispatchRequestMiddlewares(config) {\r\n        return __awaiter(this, void 0, void 0, function* () {\r\n            for (const middleware of this._middlewares) {\r\n                if (middleware.onRequest) {\r\n                    config = yield middleware.onRequest(config);\r\n                }\r\n            }\r\n            return config;\r\n        });\r\n    }\r\n}\r\nconst gofetch = new Gofetch(); // base instance\r\ngofetch.use({\r\n    onResponse(config) {\r\n        return config;\r\n    }\r\n});\r\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (gofetch);\r\n\n\n//# sourceURL=webpack://gofetch/./src/gofetch.ts?");

/***/ }),

/***/ "./src/middleware-manager.ts":
/*!***********************************!*\
  !*** ./src/middleware-manager.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ MiddlewareManager)\n/* harmony export */ });\nclass MiddlewareManager {\r\n    constructor() {\r\n        this.middlewareMap = new Map();\r\n    }\r\n    add(middleware) {\r\n        const index = this.middlewareMap.size;\r\n        this.middlewareMap.set(index, middleware);\r\n        return index;\r\n    }\r\n    remove(index) {\r\n        return this.middlewareMap.delete(index);\r\n    }\r\n    [Symbol.iterator]() {\r\n        let index = -1;\r\n        let data = Array.from(this.middlewareMap.values()).filter(Boolean);\r\n        return {\r\n            next: () => ({ value: data[++index], done: !(index in data) })\r\n        };\r\n    }\r\n}\r\n\n\n//# sourceURL=webpack://gofetch/./src/middleware-manager.ts?");

/***/ })

/******/ });
/************************************************************************/
/******/ // The module cache
/******/ var __webpack_module_cache__ = {};
/******/ 
/******/ // The require function
/******/ function __webpack_require__(moduleId) {
/******/ 	// Check if module is in cache
/******/ 	var cachedModule = __webpack_module_cache__[moduleId];
/******/ 	if (cachedModule !== undefined) {
/******/ 		return cachedModule.exports;
/******/ 	}
/******/ 	// Create a new module (and put it into the cache)
/******/ 	var module = __webpack_module_cache__[moduleId] = {
/******/ 		// no module.id needed
/******/ 		// no module.loaded needed
/******/ 		exports: {}
/******/ 	};
/******/ 
/******/ 	// Execute the module function
/******/ 	__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 
/******/ 	// Return the exports of the module
/******/ 	return module.exports;
/******/ }
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/define property getters */
/******/ (() => {
/******/ 	// define getter functions for harmony exports
/******/ 	__webpack_require__.d = (exports, definition) => {
/******/ 		for(var key in definition) {
/******/ 			if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/hasOwnProperty shorthand */
/******/ (() => {
/******/ 	__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ })();
/******/ 
/******/ /* webpack/runtime/make namespace object */
/******/ (() => {
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = (exports) => {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/ })();
/******/ 
/************************************************************************/
/******/ 
/******/ // startup
/******/ // Load entry module and return exports
/******/ // This entry module can't be inlined because the eval devtool is used.
/******/ var __webpack_exports__ = __webpack_require__("./src/gofetch.ts");
/******/ var __webpack_exports__Gofetch = __webpack_exports__.Gofetch;
/******/ var __webpack_exports__default = __webpack_exports__["default"];
/******/ export { __webpack_exports__Gofetch as Gofetch, __webpack_exports__default as default };
/******/ 
