(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function() {
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
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/hope.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/hope.ts":
/*!*********************!*\
  !*** ./src/hope.ts ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const nexttick_1 = __webpack_require__(/*! ./nexttick */ "./src/nexttick.ts");
class Hope {
    constructor(callback) {
        //当前promise的成功结果
        this.successRes = null;
        //当前promise的失败结果
        this.failRes = null;
        //当父promise成功时，当前promise的处理函数，第一个promise是没有这个的
        this.resolveProcessing = null;
        //当父promise失败时，当前promise的处理函数，第一个promise是没有这个的
        this.rejectProcessing = null;
        this.children = [];
        this.state = "pending";
        if (callback != null) {
            try {
                callback(this.handleReturnValue.bind(this, "resolve"), this.handleReturnValue.bind(this, "reject"));
            }
            catch (err) {
                if (this.state == "pending") {
                    this.reject(err);
                }
            }
        }
    }
    /**当前promise成功 */
    resolve(data) {
        if (this.state == "pending") {
            this.state = "resolved";
            this.successRes = data;
            this.children.forEach(child => {
                nexttick_1.NextTick(() => {
                    child.onParentResolve(data);
                });
            });
        }
    }
    /**当前promise失败 */
    reject(reason) {
        if (this.state == "pending") {
            this.state = "rejected";
            this.failRes = reason;
            let cache = this.children.slice();
            nexttick_1.NextTick(() => {
                if (this.children.length == 0)
                    console.log("unhandled error:" + this.failRes);
                cache.forEach(child => {
                    child.onParentReject(reason);
                });
            });
        }
    }
    /**当父promise成功时 */
    onParentResolve(data) {
        if (this.resolveProcessing != null) {
            try {
                let res = this.resolveProcessing.call(undefined, data);
                this.handleReturnValue("resolve", res);
            }
            catch (err) {
                this.reject(err);
            }
        }
    }
    /**当父promise失败时 */
    onParentReject(reason) {
        if (this.rejectProcessing != null) {
            try {
                let res = this.rejectProcessing.call(undefined, reason);
                this.handleReturnValue("resolve", res);
            }
            catch (err) {
                this.reject(err);
            }
        }
    }
    /**当增加一个子promise时 */
    onReceiveChildPromise(childPromise) {
        if (this.state == "rejected") {
            nexttick_1.NextTick(() => {
                childPromise.onParentReject(this.failRes);
            });
        }
        if (this.state == "resolved") {
            nexttick_1.NextTick(() => {
                childPromise.onParentResolve(this.successRes);
            });
        }
        this.children.push(childPromise);
    }
    /**then调用 */
    then(successCb, failCb) {
        var childPromise = new Hope(null);
        childPromise.resolveProcessing = typeof successCb === "function" ? successCb : (res) => { return res; };
        childPromise.rejectProcessing = typeof failCb === "function" ? failCb : (err) => { throw err; };
        this.onReceiveChildPromise(childPromise);
        return childPromise;
    }
    /**根据处理函数返回的结果决定最终的状态和值并触发后续的子promise */
    handleReturnValue(type, callbackValue) {
        if (type == "reject") {
            this.reject(callbackValue);
            return;
        }
        if (callbackValue == this) {
            this.reject(new TypeError("circle promise"));
            return;
        }
        if (callbackValue instanceof Hope) {
            callbackValue.then(res => {
                this.resolve(res);
            }, reason => {
                this.reject(reason);
            });
            return;
        }
        if (callbackValue != null && (typeof callbackValue === "object" || typeof callbackValue === "function")) {
            let end = false;
            try {
                let then = callbackValue.then;
                if (typeof then === "function") {
                    nexttick_1.NextTick(() => {
                        try {
                            then.call(callbackValue, res => {
                                if (end)
                                    return;
                                end = true;
                                this.handleReturnValue("resolve", res);
                            }, reason => {
                                if (end)
                                    return;
                                end = true;
                                this.reject(reason);
                            });
                        }
                        catch (err) {
                            if (end)
                                return;
                            end = true;
                            this.reject(err);
                        }
                    });
                }
                else {
                    this.resolve(callbackValue);
                }
            }
            catch (err) {
                if (end)
                    return;
                end = true;
                this.reject(err);
            }
        }
        else {
            this.resolve(callbackValue);
        }
    }
    catch(failCb) {
        var childPromise = new Hope(null);
        childPromise.resolveProcessing = (res) => { return res; };
        childPromise.rejectProcessing = typeof failCb === "function" ? failCb : (err) => { throw err; };
        this.onReceiveChildPromise(childPromise);
        return childPromise;
    }
    finally(finalCb) {
        if (typeof finalCb !== "function")
            throw new Error("finally callback can not be empty and should be a function");
        var childPromise = new Hope(null);
        childPromise.resolveProcessing = () => { return finalCb(); };
        childPromise.rejectProcessing = (err) => { finalCb(); throw err; };
        this.onReceiveChildPromise(childPromise);
        return childPromise;
    }
    static all(promises) {
        let result = [];
        let state = "pending";
        let promise = new Hope((resolve, reject) => {
            promises.forEach((promise, index) => {
                promise.then(res => {
                    if (state === "pending") {
                        result.push({ index: index, res: res });
                        if (result.length == promises.length) {
                            state = "resolved";
                            let allres = result.sort((left, right) => left.index - right.index).map(item => item.res);
                            resolve(allres);
                        }
                    }
                }, err => {
                    if (state === "pending") {
                        state = "rejected";
                        reject(err);
                    }
                });
            });
        });
        return promise;
    }
    static any(promises) {
        let errors = [];
        let state = "pending";
        let promise = new Hope((resolve, reject) => {
            promises.forEach((promise, index) => {
                promise.then(res => {
                    if (state === "pending") {
                        state = "resolved";
                        resolve(res);
                    }
                }, err => {
                    if (state === "pending") {
                        errors.push({ index: index, err: err });
                        if (errors.length == promises.length) {
                            state = "resolved";
                            let allerrors = errors.sort((left, right) => left.index - right.index).map(item => item.err);
                            reject(allerrors);
                        }
                    }
                });
            });
        });
        return promise;
    }
    static race(promises) {
        let state = "pending";
        let promise = new Hope((resolve, reject) => {
            promises.forEach((promise, index) => {
                promise.then(res => {
                    if (state === "pending") {
                        state = "resolved";
                        resolve(res);
                    }
                }, err => {
                    if (state === "pending") {
                        state = "rejected";
                        reject(err);
                    }
                });
            });
        });
        return promise;
    }
    static reject(err) {
        return new Hope((resolve, reject) => {
            reject(err);
        });
    }
    static resolve(res) {
        return new Hope((resolve, reject) => {
            resolve(res);
        });
    }
}
exports.Hope = Hope;


/***/ }),

/***/ "./src/nexttick.ts":
/*!*************************!*\
  !*** ./src/nexttick.ts ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
let tickRef = null;
function NextTick(callback) {
    if (tickRef == null) {
        if (typeof window === "undefined" && typeof process === "object") {
            tickRef = process.nextTick;
        }
        else {
            tickRef = forBrowser();
        }
    }
    tickRef(callback);
}
exports.NextTick = NextTick;
function forBrowser() {
    let targetNode = document.createTextNode("hello");
    let config = { characterData: true };
    let nextickcbs = [];
    let callback = function () {
        while (nextickcbs.length > 0) {
            let queue = nextickcbs.slice();
            nextickcbs = [];
            queue.forEach(n => n());
        }
    };
    let observer = new MutationObserver(callback);
    observer.observe(targetNode, config);
    let counter = 0;
    function nextTick(cb) {
        nextickcbs.push(cb);
        targetNode.textContent = "" + counter++;
    }
    return nextTick;
}


/***/ })

/******/ });
});
//# sourceMappingURL=hope.js.map