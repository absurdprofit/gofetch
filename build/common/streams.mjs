/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ var __webpack_modules__ = ({

/***/ "./src/common/streams.ts":
/*!*******************************!*\
  !*** ./src/common/streams.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"BufferStream\": () => (/* binding */ BufferStream),\n/* harmony export */   \"ConsoleStream\": () => (/* binding */ ConsoleStream),\n/* harmony export */   \"GZipTransformStream\": () => (/* binding */ GZipTransformStream),\n/* harmony export */   \"IdleBufferStream\": () => (/* binding */ IdleBufferStream),\n/* harmony export */   \"ProgressStream\": () => (/* binding */ ProgressStream)\n/* harmony export */ });\nvar __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {\r\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\r\n    return new (P || (P = Promise))(function (resolve, reject) {\r\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\r\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\r\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\r\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\r\n    });\r\n};\r\nclass IdleBufferStream extends TransformStream {\r\n    constructor() {\r\n        const buffer = [];\r\n        let finished = false;\r\n        let promise;\r\n        super({\r\n            start(controller) {\r\n                promise = new Promise((resolve) => {\r\n                    const onIdle = (deadline) => __awaiter(this, void 0, void 0, function* () {\r\n                        while (deadline.timeRemaining() > 0 && buffer.length) {\r\n                            controller.enqueue(buffer.shift()); // transfer frames from buffer to controller\r\n                        } // until the browser needs control again\r\n                        if (!finished || buffer.length)\r\n                            requestIdleCallback(onIdle); // if we're not finished we go again\r\n                        else\r\n                            resolve(); // if we are finished we resolve the promise\r\n                    });\r\n                    requestIdleCallback(onIdle);\r\n                });\r\n            },\r\n            transform(chunk, controller) {\r\n                return __awaiter(this, void 0, void 0, function* () {\r\n                    chunk = yield chunk;\r\n                    buffer.push(chunk); // buffer the chunks\r\n                    if (chunk === null) {\r\n                        return promise; // will terminate the transformer once promise resolves\r\n                    }\r\n                });\r\n            },\r\n            flush() {\r\n                finished = true;\r\n                return promise; // will terminate the transformer once the promise resolves\r\n            }\r\n        });\r\n    }\r\n}\r\nclass ProgressStream extends TransformStream {\r\n}\r\nclass GZipTransformStream extends TransformStream {\r\n}\r\nclass ConsoleStream extends TransformStream {\r\n    constructor() {\r\n        super({\r\n            start() { },\r\n            transform(chunk, controller) {\r\n                return __awaiter(this, void 0, void 0, function* () {\r\n                    chunk = yield chunk;\r\n                    if (chunk === null)\r\n                        controller.terminate();\r\n                    else {\r\n                        controller.enqueue(chunk);\r\n                        console.log(chunk);\r\n                    }\r\n                });\r\n            },\r\n            flush() { }\r\n        });\r\n    }\r\n}\r\nclass BufferStream extends WritableStream {\r\n    constructor(props) {\r\n        const queuingStrategy = new CountQueuingStrategy({ highWaterMark: 1 });\r\n        super({\r\n            write(chunk) {\r\n                return new Promise((resolve, reject) => {\r\n                    if (props.onChunk)\r\n                        props.onChunk(chunk);\r\n                    resolve();\r\n                });\r\n            },\r\n            close() {\r\n                if (props.onEnd)\r\n                    props.onEnd();\r\n            },\r\n            abort(error) { }\r\n        }, queuingStrategy);\r\n    }\r\n}\r\n\n\n//# sourceURL=webpack://gofetch/./src/common/streams.ts?");

/***/ })

/******/ });
/************************************************************************/
/******/ // The require scope
/******/ var __webpack_require__ = {};
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
/******/ var __webpack_exports__ = {};
/******/ __webpack_modules__["./src/common/streams.ts"](0, __webpack_exports__, __webpack_require__);
/******/ var __webpack_exports__BufferStream = __webpack_exports__.BufferStream;
/******/ var __webpack_exports__ConsoleStream = __webpack_exports__.ConsoleStream;
/******/ var __webpack_exports__GZipTransformStream = __webpack_exports__.GZipTransformStream;
/******/ var __webpack_exports__IdleBufferStream = __webpack_exports__.IdleBufferStream;
/******/ var __webpack_exports__ProgressStream = __webpack_exports__.ProgressStream;
/******/ export { __webpack_exports__BufferStream as BufferStream, __webpack_exports__ConsoleStream as ConsoleStream, __webpack_exports__GZipTransformStream as GZipTransformStream, __webpack_exports__IdleBufferStream as IdleBufferStream, __webpack_exports__ProgressStream as ProgressStream };
/******/ 
