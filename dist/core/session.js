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
exports.findSession = exports.getSession = exports.insertSession = void 0;
exports.generateSession = generateSession;
const cache_1 = require("./cache");
const fs_1 = __importDefault(require("fs"));
const yaml_1 = __importDefault(require("yaml"));
const path_1 = __importDefault(require("path"));
const json_schema_ref_parser_1 = __importDefault(require("@apidevtools/json-schema-ref-parser"));
const utils_1 = require("../utils/utils");
const loadConfig_1 = require("./loadConfig");
const localConfig = (0, utils_1.parseBoolean)(process.env.localConfig);
const SERVER_TYPE = process.env.SERVER_TYPE;
const insertSession = (session) => __awaiter(void 0, void 0, void 0, function* () {
    yield cache_1.cache.set(session.transaction_id, session, 86400);
});
exports.insertSession = insertSession;
const getSession = (transaction_id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield cache_1.cache.get(transaction_id);
});
exports.getSession = getSession;
function loadConfig() {
    if (!SERVER_TYPE) {
        throw new Error("SERVER_TYPE not defined in env variables");
    }
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            if (localConfig) {
                let config = yaml_1.default.parse(fs_1.default.readFileSync(path_1.default.join(__dirname, "../configs/index.yaml"), "utf8"));
                const schema = yield json_schema_ref_parser_1.default.dereference(config);
                // this.config = schema;
                config = schema;
                resolve(schema[SERVER_TYPE]);
            }
            else {
                const build_spec = loadConfig_1.configLoader.getConfig();
                resolve(build_spec[SERVER_TYPE]);
            }
        }
        catch (e) {
            throw new Error(e);
        }
    }));
}
const getConfigBasedOnFlow = (flowId) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // this.config = await loadConfig();
            const config = (yield loadConfig());
            let filteredProtocol = null;
            let filteredCalls = null;
            let filteredDomain = null;
            let filteredSessiondata = null;
            let filteredAdditionalFlows = null;
            let filteredsummary = "";
            let filteredSchema = null;
            let filteredApi = null;
            // this.config.flows.forEach((flow) => {
            config.flows.forEach((flow) => {
                if (flow.id === flowId) {
                    const { protocol, calls, domain, sessionData, additioalFlows, summary, schema, api, } = flow;
                    filteredProtocol = protocol;
                    filteredCalls = calls;
                    filteredDomain = domain;
                    filteredSessiondata = sessionData;
                    filteredAdditionalFlows = additioalFlows || [];
                    filteredsummary = summary;
                    (filteredSchema = schema), (filteredApi = api);
                }
            });
            resolve({
                filteredCalls,
                filteredProtocol,
                filteredDomain,
                filteredSessiondata,
                filteredAdditionalFlows,
                filteredsummary,
                filteredSchema,
                filteredApi,
            });
        }
        catch (err) {
            console.log("error", err);
        }
    }));
});
function generateSession(session_body) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const { country, cityCode, transaction_id, configName } = session_body;
            const { filteredCalls, filteredProtocol, filteredDomain, filteredSessiondata, filteredAdditionalFlows, filteredsummary, filteredSchema, filteredApi, } = (yield getConfigBasedOnFlow(configName));
            const session = Object.assign(Object.assign(Object.assign(Object.assign({}, session_body), { bap_id: process.env.SUBSCRIBER_ID, bap_uri: process.env.callbackUrl, ttl: "PT10M", domain: filteredDomain, summary: filteredsummary }), filteredSessiondata), { currentTransactionId: transaction_id, transactionIds: [transaction_id], 
                // protocol: filteredProtocol,
                calls: filteredCalls, additioalFlows: filteredAdditionalFlows, 
                // schema: filteredSchema,
                api: filteredApi });
            yield (0, exports.insertSession)(session);
            resolve(true);
        }));
    });
}
const findSession = (body) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let session = "session";
        const allSessions = yield cache_1.cache.get();
        console.log("allSessions", allSessions);
        for (const ses of allSessions) {
            const sessionData = yield (0, exports.getSession)(ses);
            console.log("sessionDat", sessionData.transactionIds);
            if (sessionData.transactionIds.includes(body.context.transaction_id)) {
                console.log("<got session>");
                session = sessionData;
                break;
            }
        }
        return session;
    }
    catch (error) {
        console.error("Error finding session:", error);
        throw error;
    }
});
exports.findSession = findSession;
module.exports = { generateSession, getSession: exports.getSession, insertSession: exports.insertSession, findSession: exports.findSession };
