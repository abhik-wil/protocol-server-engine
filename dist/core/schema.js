"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSchema = void 0;
const ajv_1 = __importDefault(require("ajv"));
const ajv = new ajv_1.default({
    allErrors: true,
    strict: "log",
});
const ajv_formats_1 = __importDefault(require("ajv-formats"));
const utils_1 = require("../utils/utils");
(0, ajv_formats_1.default)(ajv);
require("ajv-errors")(ajv);
const logger = require("../utils/logger");
// logger = log.init();
const validateSchema = (payload, schema) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    logger.info(`Inside schema validation service for ${(_a = payload === null || payload === void 0 ? void 0 : payload.context) === null || _a === void 0 ? void 0 : _a.action} api protocol server`);
    try {
        const validate = ajv.compile(schema);
        const valid = validate(payload);
        if (!valid) {
            let error_list = validate.errors;
            logger.error(JSON.stringify((0, utils_1.formatted_error)(error_list)));
            logger.error("Schema validation : FAIL");
            const erroPath = JSON.stringify((0, utils_1.formatted_error)(error_list));
            return { status: false, message: erroPath };
        }
        else {
            logger.info("Schema validation : SUCCESS");
            return { status: true };
        }
    }
    catch (error) {
        logger.error(error);
    }
});
exports.validateSchema = validateSchema;
// module.exports = validateSchema;
