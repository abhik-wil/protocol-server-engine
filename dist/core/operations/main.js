"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dynamicFlow = exports.dynamicReponse = void 0;
const utils_1 = require("./utils");
const dynamicReponse = (req_body, callback) => {
    var _a;
    const context = {
        req_body: req_body,
    };
    if (Object.keys(callback).length > 1) {
        for (const payloads in callback) {
            if (payloads != "default") {
                const result = (0, utils_1.evaluateOperation)(context, (_a = callback[payloads].condition) === null || _a === void 0 ? void 0 : _a.operation);
                if (result) {
                    return {
                        callback: callback[payloads].callback,
                        serviceUrl: callback[payloads].service_url,
                        sync: callback[payloads].sync,
                    };
                }
            }
        }
    }
    return {
        callback: callback["default"].callback,
        serviceUrl: callback["default"].service_url,
        sync: callback["default"].sync,
    };
};
exports.dynamicReponse = dynamicReponse;
const dynamicFlow = (req_body, callback) => {
    var _a;
    const context = {
        req_body: req_body,
    };
    if (Object.keys(callback).length > 1) {
        for (const payloads in callback) {
            if (payloads != "default") {
                const result = (0, utils_1.evaluateOperation)(context, (_a = callback[payloads].condition) === null || _a === void 0 ? void 0 : _a.operation);
                if (result) {
                    return callback[payloads].config_id;
                }
            }
        }
    }
    return callback["default"].config_id;
};
exports.dynamicFlow = dynamicFlow;
module.exports = { dynamicReponse: exports.dynamicReponse, dynamicFlow: exports.dynamicFlow };
