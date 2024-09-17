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
exports.updateSession = exports.businessToBecknMethod = exports.businessToBecknWrapper = exports.becknToBusiness = void 0;
const axios_1 = __importDefault(require("axios"));
const router = require("express").Router();
const mapper_core_1 = require("../core/mapper_core");
const session_1 = require("../core/session");
const auth_core_1 = require("../core/auth_core");
const utils_1 = require("../utils/utils");
const IS_VERIFY_AUTH = (0, utils_1.parseBoolean)(process.env.IS_VERIFY_AUTH);
const IS_SYNC = (0, utils_1.parseBoolean)(process.env.BUSINESS_SERVER_IS_SYNC);
const schema_1 = require("../core/schema");
const SERVER_TYPE = process.env.SERVER_TYPE;
const PROTOCOL_SERVER = process.env.PROTOCOL_SERVER;
const logger = require("../utils/logger");
const responses_1 = require("../utils/responses");
const main_1 = require("../core/operations/main");
const loadConfig_1 = require("../core/loadConfig");
const attributeValidation_1 = __importDefault(require("../core/attributeValidation"));
const ASYNC_MODE = "ASYNC";
const SYNC_MODE = "SYNC";
const becknToBusiness = (req, res) => {
    var _a;
    const body = req.body;
    const transaction_id = (_a = body === null || body === void 0 ? void 0 : body.context) === null || _a === void 0 ? void 0 : _a.transaction_id;
    const config = body.context.action;
    validateIncommingRequest(body, transaction_id, config, res);
};
exports.becknToBusiness = becknToBusiness;
const validateIncommingRequest = (body, transaction_id, config, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    try {
        if (IS_VERIFY_AUTH !== false) {
            if (!(yield (0, auth_core_1.verifyHeader)(body))) {
                return res.status(401).send(responses_1.signNack);
            }
        }
        let session = null;
        let sessionId = null;
        if (SERVER_TYPE === "BPP") {
            session = yield (0, session_1.getSession)(transaction_id);
            const configObject = loadConfig_1.configLoader.getConfig();
            const configName = (0, main_1.dynamicFlow)(body, configObject[SERVER_TYPE]["flow_selector"][config]);
            if (!session) {
                yield (0, session_1.generateSession)({
                    version: body.context.version,
                    country: (_c = (_b = (_a = body === null || body === void 0 ? void 0 : body.context) === null || _a === void 0 ? void 0 : _a.location) === null || _b === void 0 ? void 0 : _b.country) === null || _c === void 0 ? void 0 : _c.code,
                    cityCode: (_f = (_e = (_d = body === null || body === void 0 ? void 0 : body.context) === null || _d === void 0 ? void 0 : _d.location) === null || _e === void 0 ? void 0 : _e.city) === null || _f === void 0 ? void 0 : _f.code,
                    configName: configName || process.env.flow,
                    transaction_id: transaction_id,
                });
                session = yield (0, session_1.getSession)(transaction_id);
            }
        }
        else {
            session = yield (0, session_1.findSession)(body);
            if (!session) {
                console.log("No session exists");
                return res.status(200).send(responses_1.errorNack);
            }
        }
        logger.info("Recieved request: " + JSON.stringify(body));
        // const schemaConfig = configLoader.getSchema(session.configName);
        const schemaConfig = loadConfig_1.configLoader.getSchema();
        if (schemaConfig[config]) {
            const schema = schemaConfig[config];
            const schemaValidation = yield (0, schema_1.validateSchema)(body, schema);
            if (!(schemaValidation === null || schemaValidation === void 0 ? void 0 : schemaValidation.status) && (schemaValidation === null || schemaValidation === void 0 ? void 0 : schemaValidation.message)) {
                return res.status(200).send((0, utils_1.buildNackPayload)(schemaValidation.message));
            }
        }
        else {
            logger.info(`Schema config missing for ${config}`);
        }
        const attributeConfig = loadConfig_1.configLoader.getAttributeConfig(session.configName);
        if (attributeConfig) {
            const attrErrors = (0, attributeValidation_1.default)(body, attributeConfig[config], config);
            if (attrErrors.length) {
                logger.error("Attribute validation failed: " + attrErrors);
                // return res
                //   .status(200)
                //   .send(buildNackPayload(JSON.stringify(attrErrors)));
            }
            else {
                logger.info("Attribute validation SUCCESS");
            }
        }
        else {
            logger.info(`Attribute config missing for ${session.configName}`);
        }
        res.send(responses_1.ack);
        handleRequest(body, session, sessionId !== null && sessionId !== void 0 ? sessionId : "");
    }
    catch (err) {
        console.log(((_g = err === null || err === void 0 ? void 0 : err.data) === null || _g === void 0 ? void 0 : _g.message) || err);
    }
});
const handleRequest = (response, session, sessionId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const action = (_a = response === null || response === void 0 ? void 0 : response.context) === null || _a === void 0 ? void 0 : _a.action;
        const messageId = (_b = response === null || response === void 0 ? void 0 : response.context) === null || _b === void 0 ? void 0 : _b.message_id;
        const is_buyer = SERVER_TYPE === "BAP" ? true : false;
        if (!action) {
            return console.log("Action not defined");
        }
        if (!messageId) {
            return console.log("Message ID not defined");
        }
        if (is_buyer) {
            let config = null;
            let isUnsolicited = true;
            session.calls.map((call) => {
                var _a, _b, _c;
                if ((_b = (_a = call.callback) === null || _a === void 0 ? void 0 : _a.message_id) === null || _b === void 0 ? void 0 : _b.includes(response.context.message_id)) {
                    config = (_c = call.callback) === null || _c === void 0 ? void 0 : _c.config;
                    isUnsolicited = false;
                }
            });
            if (isUnsolicited) {
                config = action;
            }
            console.log("config >>>>>", config);
            const mapping = loadConfig_1.configLoader.getMapping(session.configName);
            const protocol = mapping ? mapping[config] : null;
            const { result: businessPayload, session: updatedSession } = (0, mapper_core_1.extractBusinessData)(action, response, session, protocol);
            businessPayload.context = {};
            businessPayload.context.message_id = response.context.message_id;
            let urlEndpint = null;
            let mode = ASYNC_MODE;
            const updatedCalls = updatedSession.calls.map((call) => {
                var _a, _b;
                if (isUnsolicited && call.callback.config === action) {
                    call.callback.unsolicited = [
                        ...(call.callback.unsolicited || []),
                        response,
                    ];
                    urlEndpint = call.callback.unsolicitedEndpoint;
                }
                if ((_b = (_a = call.callback) === null || _a === void 0 ? void 0 : _a.message_id) === null || _b === void 0 ? void 0 : _b.includes(response.context.message_id)) {
                    call.callback.becknPayload = [
                        ...(call.callback.becknPayload || []),
                        response,
                    ];
                    call.callback.businessPayload = [
                        ...(call.callback.businessPayload || []),
                        businessPayload,
                    ];
                    urlEndpint = call.callback.endpoint;
                    mode = (call === null || call === void 0 ? void 0 : call.mode) || ASYNC_MODE;
                }
                return call;
            });
            updatedSession.calls = updatedCalls;
            (0, session_1.insertSession)(updatedSession);
            if (updatedSession === null || updatedSession === void 0 ? void 0 : updatedSession.schema) {
                delete updatedSession.schema;
            }
            logger.info("mode>>>>>>>>> " + mode);
            if (mode === ASYNC_MODE) {
                yield axios_1.default.post(`${process.env.BACKEND_SERVER_URL}/${urlEndpint}`, {
                    businessPayload,
                    updatedSession,
                    messageId,
                    sessionId,
                    response,
                });
            }
        }
        else {
            const mapping = loadConfig_1.configLoader.getMapping(session.configName);
            const protocol = mapping ? mapping[action] : null;
            let { callback, serviceUrl, sync } = (0, main_1.dynamicReponse)(response, session.api[action]);
            callback = callback ? callback : action;
            const { payload: becknPayload, session: updatedSession } = (0, mapper_core_1.createBecknObject)(session, action, response, protocol);
            (0, session_1.insertSession)(updatedSession);
            let url;
            if (serviceUrl !== undefined) {
                url = `${process.env.BACKEND_SERVER_URL}${serviceUrl}`;
            }
            else {
                url = `${process.env.BACKEND_SERVER_URL}/${callback}`;
            }
            const mockResponse = yield axios_1.default.post(`${url}`, becknPayload);
            if (mockResponse)
                if (sync) {
                    (0, exports.businessToBecknMethod)(mockResponse.data);
                }
        }
        // throw new Error("an error occurred")
    }
    catch (e) {
        console.log(e);
        logger.error(JSON.stringify(e));
    }
});
const businessToBecknWrapper = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const body = req.body;
        const { status, message, code } = (yield (0, exports.businessToBecknMethod)(body));
        if ((_a = message === null || message === void 0 ? void 0 : message.updatedSession) === null || _a === void 0 ? void 0 : _a.schema) {
            delete message.updatedSession.schema;
        }
        res.status(code).send({ status: status, message: message });
    }
    catch (e) {
        console.log(">>>>>", e);
        res.status(500).send({ error: true, message: (e === null || e === void 0 ? void 0 : e.message) || e });
    }
});
exports.businessToBecknWrapper = businessToBecknWrapper;
const businessToBecknMethod = (body) => __awaiter(void 0, void 0, void 0, function* () {
    logger.info("inside businessToBecknMethod controller: ", body);
    try {
        //except target i can fetch rest from my payload
        let { type, config, data, transactionId, target, configName } = body;
        let seller = false;
        if (SERVER_TYPE === "BPP") {
            (data = body),
                (transactionId = data.context.transaction_id),
                (type = data.context.action),
                (config = type);
            seller = true;
        }
        let session = body.session;
        ////////////// session validation ////////////////////
        if (session && session.createSession && session.data) {
            yield (0, session_1.generateSession)({
                country: session.data.country,
                cityCode: session.data.cityCode,
                bpp_id: session.data.bpp_id,
                configName: configName,
                transaction_id: transactionId,
            });
            session = yield (0, session_1.getSession)(transactionId);
        }
        else {
            session = yield (0, session_1.getSession)(transactionId); // session will be premade with beckn to business usecase
            if (!session) {
                return {
                    status: "Bad Request",
                    message: "session not found",
                    code: 400,
                };
                //   return res.status(400).send({ error: "session not found" }); ------->
            }
        }
        if (SERVER_TYPE === "BAP") {
            session = Object.assign(Object.assign({}, session), data);
        }
        ////////////// session validation ////////////////////
        // const protocol = mapping[session.configName][config];
        // const protocol = session.protocol[config];
        const mapping = loadConfig_1.configLoader.getMapping(session.configName);
        const protocol = mapping ? mapping[config] : null;
        // console.log("protocol: ", protocol);
        // console.log("mapping: ", mapping);
        ////////////// MAPPING/EXTRACTION ////////////////////////
        // console.log(session, type, data, protocol, "logs");
        const { payload: becknPayload, session: updatedSession } = (0, mapper_core_1.createBecknObject)(session, type, data, protocol);
        // console.log("becknPayload: ", becknPayload);
        // console.log("seesion: ", session.bap_uri, session);
        if (!seller) {
            becknPayload.context.bap_uri = `${process.env.SUBSCRIBER_URL}/ondc`;
        }
        // else {
        //   becknPayload.context.bpp_uri = "http://localhost:5500/ondc/";
        // }
        let url;
        const GATEWAY_URL = process.env.GATEWAY_URL;
        if (target === "GATEWAY") {
            url = GATEWAY_URL;
        }
        else {
            url =
                SERVER_TYPE === "BPP"
                    ? becknPayload.context.bap_uri
                    : becknPayload.context.bpp_uri;
        }
        if (!url && type != "search") {
            return {
                status: "Bad Request",
                message: "callback url not provided",
                code: 400,
            };
            // return res.status(400).send({message:"callback url not provided",success: false})  ---->
        }
        if (url[url.length - 1] != "/") {
            //"add / if not exists in bap uri"
            url = url + "/";
        }
        ////////////// MAPPING/EXTRACTION ////////////////////////
        /////////////////// AUTH/SIGNING /////////////////
        const signedHeader = yield (0, auth_core_1.generateHeader)(becknPayload);
        /////////////////// AUTH/SIGNING /////////////////
        const header = { headers: { Authorization: signedHeader } };
        //////////////////// SEND TO NETWORK /////////////////////////
        const response = yield axios_1.default.post(`${url}${type}`, becknPayload, header);
        console.log("response: ", response.data);
        //////////////////// SEND TO NETWORK /////////////////////////
        /// UPDTTED CALLS ///////
        let mode = null;
        if (SERVER_TYPE === "BAP") {
            const updatedCalls = updatedSession.calls.map((call) => {
                var _a;
                const message_id = becknPayload.context.message_id;
                if (call.config === config) {
                    // call.message_id = message_id;
                    call.becknPayload = [...((call === null || call === void 0 ? void 0 : call.becknPayload) || []), becknPayload];
                    mode = (call === null || call === void 0 ? void 0 : call.mode) || ASYNC_MODE;
                    call.callback.message_id = [
                        ...(((_a = call.callback) === null || _a === void 0 ? void 0 : _a.message_id) || []),
                        message_id,
                    ];
                }
                return call;
            });
            updatedSession.calls = updatedCalls;
        }
        /// UPDTTED CALLS ///////
        (0, session_1.insertSession)(updatedSession);
        logger.info("mode::::::::: " + mode);
        if (mode === SYNC_MODE) {
            return new Promise((resolve, reject) => {
                setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
                    const newSession = yield (0, session_1.getSession)(transactionId);
                    let businessPayload = null;
                    let onBecknPayload = null;
                    newSession.calls.map((call) => {
                        if (call.config === config) {
                            businessPayload = call.callback.businessPayload;
                            onBecknPayload = call.callback.becknPayload;
                        }
                    });
                    const becknPayloads = {
                        action: becknPayload,
                        on_action: onBecknPayload,
                    };
                    if (!businessPayload) {
                        reject("Response timeout");
                    }
                    resolve({
                        status: "true",
                        message: {
                            updatedSession: newSession,
                            becknPayload: becknPayloads,
                            businessPayload,
                        },
                        code: 200,
                    });
                }), 7000);
            });
        }
        else {
            return {
                status: "true",
                message: {
                    updatedSession,
                    becknPayload,
                    becknReponse: response.data,
                },
                code: 200,
            };
            // res.send({ updatedSession, becknPayload, becknReponse: response.data });
        }
    }
    catch (e) {
        console.log(">>>>>", e === null || e === void 0 ? void 0 : e.message, e);
        return { status: "Error", message: responses_1.errorNack, code: 500 };
        //   res.status(500).send(errorNack);
    }
});
exports.businessToBecknMethod = businessToBecknMethod;
const updateSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { sessionData, transactionId } = req.body;
    if (!sessionData || !transactionId) {
        return res
            .status(400)
            .send({ message: "session Data || transcationID required" });
    }
    const session = yield (0, session_1.getSession)(transactionId);
    if (!session) {
        return res.status(400).send({ message: "No session found" });
    }
    (0, session_1.insertSession)(Object.assign(Object.assign({}, session), sessionData));
    res.send({ message: "session updated" });
});
exports.updateSession = updateSession;
// module.exports = {
//   becknToBusiness,
//   businessToBecknMethod,
//   businessToBecknWrapper,
//   updateSession,
// };
