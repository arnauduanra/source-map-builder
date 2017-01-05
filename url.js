"use strict";
/**
 * @file 地址处理
 * @author xuld <xuld@vip.qq.com>
 */
var nu = require("url");
var np = require("path");
/**
 * 解析指定地址对应的绝对地址。
 * @param base 要解析的基地址。
 * @param url 要解析的相对地址或绝对地址。
 * @return 返回已解析的地址。
 * @example resolveUrl("a/b/c", "../d") // "a/d"
 */
function resolveUrl(base, url) {
    return nu.resolve(base, url);
}
exports.resolveUrl = resolveUrl;
/**
 * 解析指定地址对应的相对地址。
 * @param base 要解析的基地址。
 * @param url 要解析的相对地址或绝对地址。
 * @return 返回已解析的地址。
 * @example relativeUrl("a/b/c", "a/b/d") // "../d"
 */
function relativeUrl(base, url) {
    // 忽略其它 URI 地址。
    if (/^[\w+\-\.]+:(?:[^/]|$)/.test(url)) {
        return url;
    }
    var urlObject1 = nu.parse(base, false, true);
    var urlObject2 = nu.parse(url, false, true);
    // 协议不同直接取绝对路径。
    if (urlObject1.protocol !== urlObject2.protocol) {
        return nu.format(urlObject2);
    }
    // 协议相同但主机不同，取协议外的绝对路径。
    if (urlObject1.host !== urlObject2.host || urlObject1.auth !== urlObject2.auth) {
        if (urlObject2.slashes) {
            delete urlObject2.protocol;
        }
        return nu.format(urlObject2);
    }
    // base 和 url 必须同时是相对路径或绝对路径，否则不处理。
    if (urlObject1.pathname && urlObject2.pathname && (urlObject1.pathname.charCodeAt(0) === 47 /*/*/) !== (urlObject2.pathname.charCodeAt(0) === 47 /*/*/)) {
        return nu.format(urlObject2);
    }
    // 计算相同的开头部分，以分隔符为界。
    base = urlObject1.pathname ? np.posix.normalize(urlObject1.pathname) : "";
    url = urlObject2.pathname ? np.posix.normalize(urlObject2.pathname) : "";
    var index = -1;
    for (var i = 0; i < base.length && i < url.length; i++) {
        var ch1 = base.charCodeAt(i);
        var ch2 = url.charCodeAt(i);
        // 发现不同字符后终止。
        if (ch1 !== ch2) {
            break;
        }
        // 如果发现一个分隔符，则之前的内容认为是公共头。
        if (ch1 === 47 /*/*/) {
            index = i;
        }
    }
    // 重新追加不同的路径部分。
    var result = url.substr(index + 1) || (i === base.length ? "" : ".");
    for (i = index + 1; i < base.length; i++) {
        if (base.charCodeAt(i) === 47 /*/*/) {
            if (result === ".") {
                result = "../";
            }
            else {
                result = "../" + result;
            }
        }
    }
    return result + (urlObject2.search || "") + (urlObject2.hash || "");
}
exports.relativeUrl = relativeUrl;
/**
 * 规范化指定地址的格式。
 * @param url 要处理的地址。
 * @return 返回处理后的地址。
 * @example normalizeUrl('abc/') // 'abc/'
 * @example normalizeUrl('./abc.js') // 'abc.js'
 */
function normalizeUrl(url) {
    // 忽略其它 URI 地址。
    if (!url || /^[\w+\-\.]+:(?:[^/]|$)/.test(url)) {
        return url;
    }
    var urlObject = nu.parse(url, false, true);
    if (urlObject.pathname) {
        urlObject.pathname = np.posix.normalize(urlObject.pathname);
    }
    return nu.format(urlObject);
}
exports.normalizeUrl = normalizeUrl;
/**
 * 判断指定地址是否是绝对地址。
 * @param url 要判断的地址。
 * @return 如果是绝对地址则返回 true，否则返回 false。
 * @example isAbsoluteUrl('/') // true
 */
function isAbsoluteUrl(url) {
    return /^(?:\/|[\w+\-\.]+:)/.test(url);
}
exports.isAbsoluteUrl = isAbsoluteUrl;
