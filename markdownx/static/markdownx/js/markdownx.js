(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * **Markdownx**
 *
 * Frontend (JavaScript) management of Django-Markdownx module.
 *
 * Written in JavaScript (ECMA Script 2016), compiled in (ECMA5 - 2011).
 *
 * Requirements:
 * - Modern browser with support for HTML5 and ECMA 2011+ (IE 10+).
 */
// Import, definitions and constant ------------------------------------------------------------------------------------
"use strict";
exports.__esModule = true;
var utils_1 = require("./utils");
var UPLOAD_URL_ATTRIBUTE = "data-markdownx-upload-urls-path", PROCESSING_URL_ATTRIBUTE = "data-markdownx-urls-path";
// ---------------------------------------------------------------------------------------------------------------------
/**
 *
 * @param editor
 * @param preview
 */
var MarkdownX = function (editor, preview) {
    var _this = this;
    this.editor = editor;
    this.preview = preview;
    this.editorIsResizable = this.editor.style.resize == 'none';
    this.timeout = null;
    this.getEditorHeight = function () { return _this.editor.scrollHeight + "px"; };
    this.markdownify = function () {
        clearTimeout(_this.timeout);
        _this.timeout = setTimeout(_this.getMarkdown, 500);
    };
    this.updateHeight = function () {
        _this.editorIsResizable ? _this.editor.style.height = _this.getEditorHeight() : null;
    };
    this.onInputChangeEvent = function () {
        _this.updateHeight();
        _this.markdownify();
    };
    // this.onHtmlEvents = (event: Event): void => {
    //
    //     event.preventDefault();
    //     event.stopPropagation()
    //
    // };
    this.onDragEnterEvent = function (event) {
        event.dataTransfer.dropEffect = 'copy';
        event.preventDefault();
        event.stopPropagation();
    };
    this.onDragLeaveEvent = function (event) {
        event.preventDefault();
        event.stopPropagation();
    };
    this.onDropEvent = function (event) {
        if (event.dataTransfer && event.dataTransfer.files.length)
            Object.keys(event.dataTransfer.files).map(function (fileKey) { return _this.sendFile(event.dataTransfer.files[fileKey]); });
        event.preventDefault();
        event.stopPropagation();
    };
    this.onKeyDownEvent = function (event) {
        var TAB_ASCII_CODE = 9;
        if (event.keyCode !== TAB_ASCII_CODE)
            return null;
        var start = _this.editor.selectionStart, end = _this.editor.selectionEnd, value = _this.editor.value;
        _this.editor.value = value.substring(0, start) + "\t" + value.substring(end);
        _this.editor.selectionStart = _this.editor.selectionEnd = start++;
        _this.markdownify();
        _this.editor.focus();
        return false;
    };
    this.sendFile = function (file) {
        _this.editor.style.opacity = 0.3;
        var xhr = new utils_1.Request(_this.editor.getAttribute(UPLOAD_URL_ATTRIBUTE), // URL
        utils_1.preparePostData({ image: file }) // Data
        );
        xhr.success = function (resp) {
            var response = JSON.parse(resp);
            if (response.image_code) {
                _this.insertImage(response.image_code);
                utils_1.triggerCustomEvent('markdownx.fileUploadEnd', [response]);
            }
            else if (response.image_path) {
                // For backwards-compatibility
                _this.insertImage("![](\"" + response.image_path + "\")");
                utils_1.triggerCustomEvent('markdownx.fileUploadEnd', [response]);
            }
            else {
                console.error('Wrong response', response);
                utils_1.triggerCustomEvent('markdownx.fileUploadError', [response]);
            }
            _this.preview.innerHTML = _this.response;
            _this.editor.style.opacity = 1;
        };
        xhr.error = function (response) {
            console.error(response);
            _this.editor.style.opacity = 1;
            utils_1.triggerCustomEvent('fileUploadError', [response]);
        };
        xhr.send();
    };
    this.getMarkdown = function () {
        var xhr = new utils_1.Request(_this.editor.getAttribute(PROCESSING_URL_ATTRIBUTE), // URL
        utils_1.preparePostData({ content: _this.editor.value }) // Data
        );
        xhr.success = function (response) {
            _this.preview.innerHTML = response;
            _this.updateHeight();
            utils_1.triggerCustomEvent('markdownx.update', [response]);
        };
        xhr.error = function (response) {
            console.error(response);
            utils_1.triggerCustomEvent('markdownx.updateError', [response]);
        };
        xhr.send();
    };
    this.insertImage = function (textToInsert) {
        var cursorPosition = _this.editor.selectionStart, text = _this.editor.value, textBeforeCursor = text.substring(0, cursorPosition), textAfterCursor = text.substring(cursorPosition, text.length);
        _this.editor.value = "" + textBeforeCursor + textToInsert + textAfterCursor;
        _this.editor.selectionStart = cursorPosition + textToInsert.length;
        _this.editor.selectionEnd = cursorPosition + textToInsert.length;
        utils_1.triggerEvent(_this.editor, 'keyup');
        _this.updateHeight();
        _this.markdownify();
    };
    // Events
    // ----------------------------------------------------------------------------------------------
    var 
    // documentListeners = {
    //       object: document,
    //       listeners: [
    //           { type: 'drop'     , capture: false, listener: this.onHtmlEvents },
    //           { type: 'dragover' , capture: false, listener: this.onHtmlEvents },
    //           { type: 'dragenter', capture: false, listener: this.onHtmlEvents },
    //           { type: 'dragleave', capture: false, listener: this.onHtmlEvents }
    //       ]
    // },
    editorListeners = {
        object: this.editor,
        listeners: [
            { type: 'drop', capture: false, listener: this.onDropEvent },
            { type: 'input', capture: true, listener: this.onInputChangeEvent },
            { type: 'keydown', capture: true, listener: this.onKeyDownEvent },
            { type: 'dragover', capture: false, listener: this.onDragEnterEvent },
            { type: 'dragenter', capture: false, listener: this.onDragEnterEvent },
            { type: 'dragleave', capture: false, listener: this.onDragLeaveEvent },
            { type: 'compositionstart', capture: true, listener: this.onKeyDownEvent }
        ]
    };
    // Initialise
    // ----------------------------------------------------------------------------------------------
    utils_1.mountEvents(editorListeners);
    // mountEvents(documentListeners);
    utils_1.triggerCustomEvent('markdownx.init');
    this.getMarkdown();
    this.updateHeight();
    this.markdownify();
};
(function (funcName, baseObj) {
    // The public function name defaults to window.docReady
    // but you can pass in your own object and own function
    // name and those will be used.
    // if you want to put them in a different namespace
    funcName = funcName || "docReady";
    baseObj = baseObj || window;
    var readyList = [], readyFired = false, readyEventHandlersInstalled = false;
    /**
     * Called when the document is ready. This function protects itself
     * against being called more than once.
     */
    var ready = function () {
        if (!readyFired) {
            // Must be `true` before the callbacks are called.
            readyFired = true;
            // if a callback here happens to add new ready handlers,
            // the docReady() function will see that it already fired
            // and will schedule the callback to run right after
            // this event loop finishes so all handlers will still execute
            // in order and no new ones will be added to the readyList
            // while we are processing the list
            readyList.map(function (ready) { return ready.fn.call(window, ready.ctx); });
            // allow any closures held by these functions to free
            readyList = [];
        }
    };
    var readyStateChange = function () { return document.readyState === "complete" ? ready() : null; };
    // This is the one public interface
    // docReady(fn, context);
    // the context argument is optional - if present, it will be passed
    // as an argument to the callback
    baseObj[funcName] = function (callback, context) {
        // if ready has already fired, then just schedule the callback
        // to fire asynchronously, but right away
        if (readyFired) {
            setTimeout(function () { return callback(context); }, 1);
            return;
        }
        else {
            // add the function and context to the list
            readyList.push({ fn: callback, ctx: context });
        }
        // If the document is already ready, schedule the ready
        // function to run.
        if (document.readyState === "complete") {
            setTimeout(ready, 1);
        }
        else if (!readyEventHandlersInstalled) {
            // otherwise if we don't have event handlers installed,
            // install them first choice is DOMContentLoaded event.
            document.addEventListener("DOMContentLoaded", ready, false);
            // backup is window load event
            window.addEventListener("load", ready, false);
            readyEventHandlersInstalled = true;
        }
    };
})("docReady", window);
docReady(function () {
    var EDITORS = document.querySelectorAll('.markdownx > .markdownx-editor'), PREVIEWS = document.querySelectorAll('.markdownx > .markdownx-preview'), EDITOR_INDEX = 0, PREVIEW_INDEX = 1;
    return utils_1.zip(EDITORS, PREVIEWS).map(function (item) { return new MarkdownX(item[EDITOR_INDEX], item[PREVIEW_INDEX]); });
});

},{"./utils":2}],2:[function(require,module,exports){
"use strict";
exports.__esModule = true;
/**
 * Looks for a cookie, and if found, returns the values.
 *
 * NOTE: Only the first item in the array is returned
 * to eliminate the need for array deconstruction in
 * the target.
 *
 * @param {string} name - The name of the cookie.
 * @returns {string | null}
 */
function getCookie(name) {
    if (document.cookie && document.cookie.length) {
        var cookies = document.cookie
            .split(';')
            .filter(function (cookie) { return cookie.indexOf(name + "=") !== -1; })[0];
        try {
            return decodeURIComponent(cookies.trim().substring(name.length + 1));
        }
        catch (e) {
            if (e instanceof TypeError) {
                console.info("No cookie with key \"" + name + "\". Wrong name?");
                return null;
            }
            throw e;
        }
    }
    return null;
}
exports.getCookie = getCookie;
/**
 * @example
 *
 *
 * @param rows
 * @returns
 */
function zip() {
    var rows = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        rows[_i] = arguments[_i];
    }
    if (rows[0].constructor == Array)
        return rows[0].slice().map(function (_, c) { return rows.map(function (row) { return row[c]; }); });
    // ToDo: To be updated to Objects.values in ECMA2017 after the method is fully ratified.
    var asArray = rows.map(function (row) { return Object.keys(row).map(function (key) { return row[key]; }); });
    return asArray[0].slice().map(function (_, c) { return asArray.map(function (row) { return row[c]; }); });
}
exports.zip = zip;
/**
 *
 * @param events
 * @returns
 */
function mountEvents(events) {
    return events.listeners.map(function (series) {
        return events.object.addEventListener(series.type, series.listener, series.capture);
    });
}
exports.mountEvents = mountEvents;
/**
 *
 * @param data
 * @param csrf
 * @returns {FormData}
 */
function preparePostData(data, csrf) {
    if (csrf === void 0) { csrf = true; }
    var form = new FormData();
    if (csrf)
        form.append("csrfmiddlewaretoken", getCookie('csrftoken'));
    Object.keys(data).map(function (key) { return form.append(key, data[key]); });
    return form;
}
exports.preparePostData = preparePostData;
/**
 * Handles AJAX POST requests.
 */
var Request = (function () {
    /**
     *
     * @param url
     * @param data
     */
    function Request(url, data) {
        this.xhr = new XMLHttpRequest();
        this.url = url;
        this.data = data;
    }
    /**
     *
     * @param event
     */
    Request.prototype.progress = function (event) {
        if (event.lengthComputable)
            console.log((event.loaded / event.total) * 100 + '% uploaded');
    };
    /**
     *
     * @param response
     */
    Request.prototype.error = function (response) {
        console.error(response);
    };
    /**
     *
     * @param response
     */
    Request.prototype.success = function (response) {
        console.info(response);
    };
    /**
     *
     */
    Request.prototype.send = function () {
        var _this = this;
        var SUCCESS = this.success, ERROR = this.error, PROGRESS = this.progress;
        this.xhr.open('POST', this.url, true);
        this.xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        this.xhr.upload.onprogress = function (event) { return PROGRESS(event); };
        this.xhr.onerror = function (event) {
            ERROR(_this.xhr.responseText);
        };
        this.xhr.onload = function (event) {
            var data = null;
            if (_this.xhr.readyState == XMLHttpRequest.DONE) {
                if (!_this.xhr.responseType || _this.xhr.responseType === "text") {
                    data = _this.xhr.responseText;
                }
                else if (_this.xhr.responseType === "document") {
                    data = _this.xhr.responseXML;
                }
                else {
                    data = _this.xhr.response;
                }
            }
            SUCCESS(data);
        };
        this.xhr.send(this.data);
    };
    return Request;
}());
exports.Request = Request;
/**
 *
 * @param el
 * @param type
 */
function triggerEvent(el, type) {
    // modern browsers, IE9+
    var e = document.createEvent('HTMLEvents');
    e.initEvent(type, false, true);
    el.dispatchEvent(e);
}
exports.triggerEvent = triggerEvent;
/**
 *
 * @param type
 * @param args
 */
function triggerCustomEvent(type, args) {
    if (args === void 0) { args = null; }
    // modern browsers, IE9+
    var event = new CustomEvent(type, { 'detail': args });
    document.dispatchEvent(event);
}
exports.triggerCustomEvent = triggerCustomEvent;

},{}]},{},[1]);
