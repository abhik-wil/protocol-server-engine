"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractPath = exports.extractBusinessData = exports.createBecknObject = void 0;
const uuid_1 = require("uuid");
const ondc_payload_module_1 = __importDefault(require("ondc-payload-module"));
const logger = require("../utils/logger");
const buildTags = (tags) => {
    return Object.keys(tags).map((key) => {
        const subObject = tags[key];
        let display = subObject["display"] === undefined
            ? {}
            : { display: subObject["display"] };
        delete subObject["display"];
        const list = Object.keys(subObject).map((subKey) => {
            const value = subObject[subKey];
            return {
                descriptor: {
                    code: subKey,
                },
                value: typeof value === "string" ? value : value.toString(),
            };
        });
        return Object.assign(Object.assign({ descriptor: {
                code: key,
            } }, display), { list: list });
    });
};
const buildContext = (session, action) => {
    console.log("buiding context");
    const contextConfig = [
        {
            beckn_key: "bap_id",
            value: "session.bap_id",
        },
        {
            beckn_key: "bap_uri",
            value: "session.bap_uri",
        },
        {
            beckn_key: "bpp_id",
            value: "session.bpp_id",
        },
        {
            beckn_key: "bpp_uri",
            value: "session.bpp_uri",
        },
        {
            beckn_key: "location.country.code",
            value: "session.country",
        },
        {
            beckn_key: "location.city.code",
            value: "session.cityCode",
        },
        {
            beckn_key: "transaction_id",
            value: "session.currentTransactionId",
        },
        // {
        //   beckn_key: "message_id",
        //   value: "",
        // },
        {
            beckn_key: "timestamp",
            value: "new Date().toISOString()",
        },
        {
            beckn_key: "domain",
            value: "session.domain",
        },
        {
            beckn_key: "version",
            value: "session.version",
        },
        {
            beckn_key: "ttl",
            value: "session.ttl",
        },
        {
            beckn_key: "action",
            value: "action",
        },
    ];
    let context = {
        message_id: (0, uuid_1.v4)(),
    };
    contextConfig.map((item) => {
        try {
            // if (eval(item.value))
            createNestedField(context, item.beckn_key, eval(item.value));
        }
        catch (err) {
            logger.info(item.value +
                eval(item.value) +
                " is undefined, will not be mapping that");
        }
    });
    console.log("context", context);
    return context;
};
const createNestedField = (obj, path, value) => {
    const keys = path.split(".");
    let currentObj = obj;
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        const isArrayIndex = /\[\d+\]/.test(key); // Check if the key represents an array index
        if (isArrayIndex) {
            const arrayKey = key.substring(0, key.indexOf("["));
            const index = parseInt(key.match(/\[(\d+)\]/)[1], 10);
            if (!currentObj[arrayKey]) {
                currentObj[arrayKey] = [];
            }
            if (!currentObj[arrayKey][index]) {
                currentObj[arrayKey][index] = {};
            }
            currentObj = currentObj[arrayKey][index];
        }
        else {
            if (!currentObj[key]) {
                currentObj[key] = {};
            }
            currentObj = currentObj[key];
        }
    }
    currentObj[keys[keys.length - 1]] = value;
};
const createPayload = (config, action, data, session, ondc) => {
    const payload = {};
    const startPoint = "START";
    const endPoint = "END";
    const cancelName = "Ride Cancellation";
    const successStatus = "SUCCESS";
    const fulfillmentText = "fulfillment";
    const messageId = (0, uuid_1.v4)();
    const paymentId = (0, uuid_1.v4)();
    const timestamp = new Date().toISOString();
    const newTranscationId = (0, uuid_1.v4)();
    config.map((item) => {
        try {
            if (eval(item.value) && (item.check ? eval(item.check) : true))
                createNestedField(payload, item.beckn_key, item.compute ? eval(item.compute) : eval(item.value));
        }
        catch (err) {
            console.log("error", err);
            logger.info(item.value + " is undefined, will not be mapping that");
        }
    });
    return payload;
};
const constructValueObject = (data, key = "business_key") => {
    const dataArray = data.split(",").map((val) => val.trim());
    let objArray = [];
    dataArray.forEach((item) => {
        const obj = {};
        const itemArray = item.split(":").map((val) => val.trim());
        obj[key] = itemArray[0];
        const value = "obj." + itemArray[1];
        obj["value"] = value.split(".").join("?.");
        objArray.push(obj);
    });
    return objArray;
};
const constructPath = (data) => {
    if (data.startsWith(".")) {
        data = data.substring(1, data.length);
    }
    data = "obj." + data;
    return data.split(".").join("?.");
};
const decodeInputString = (input) => {
    const tokens = input
        .split(/([\[\]\{\}])/)
        .filter((token) => token.trim() !== "");
    if (input.split(".")[0] === "session") {
        return tokens[0].split(".").join("?.");
    }
    if (tokens.length === 1) {
        return "obj?." + tokens[0].split(".").join("?.");
    }
    let i = 0;
    let initalConfig = {};
    let currentConfig = initalConfig;
    let lastTokenSquareBracket = false;
    let lastTokenCurlyBracket = false;
    while (i < tokens.length) {
        if (lastTokenSquareBracket) {
            if (tokens[i] === "]") {
                currentConfig.type = "Array";
                lastTokenSquareBracket = false;
                if (tokens[i + 1] !== "{") {
                    currentConfig.value = {};
                    currentConfig = currentConfig.value;
                }
            }
            else {
                currentConfig.check =
                    "_?." + tokens[i].substring(2, tokens[i].length - 1);
            }
        }
        else if (lastTokenCurlyBracket) {
            if (tokens[i] === "}") {
                if (i === tokens.length - 1) {
                    if (!currentConfig.value) {
                        currentConfig.value = {};
                    }
                    currentConfig.value.type = "Object";
                    currentConfig.value.value = constructValueObject(tokens[i - 1], "key");
                    currentConfig = currentConfig.value;
                }
                else {
                    currentConfig.commanData = constructValueObject(tokens[i - 1]);
                    currentConfig.value = {};
                    currentConfig = currentConfig.value;
                }
                lastTokenCurlyBracket = false;
            }
        }
        else if (tokens[i] === "[") {
            lastTokenSquareBracket = true;
        }
        else if (tokens[i] === "{") {
            lastTokenCurlyBracket = true;
        }
        else if (tokens[i] !== "[" ||
            tokens[i] !== "{" ||
            tokens[i] !== "]" ||
            tokens[i] !== "}") {
            currentConfig.path = constructPath(tokens[i]);
        }
        i += 1;
    }
    return initalConfig;
};
const extractData = (obj, config, commData = {}) => {
    var _a, _b;
    if ((_a = config === null || config === void 0 ? void 0 : config.commanData) === null || _a === void 0 ? void 0 : _a.length) {
        config.commanData.map((item) => {
            createNestedField(commData, item.business_key, typeof item.value === "string"
                ? eval(item.value)
                : extractData(obj, item));
        });
    }
    const item = config.value;
    if (item.type === "Array") {
        const response = [];
        (_b = eval(item.path)) === null || _b === void 0 ? void 0 : _b.some((data) => {
            const _ = data;
            if (item.check ? eval(item.check) : true) {
                const result = extractData(data, item, commData);
                if (result) {
                    response.push(result);
                }
            }
        });
        return response;
    }
    else if (item.type === "String") {
        let data = {};
        data[`${item.key}`] = eval(item.path);
        return Object.assign(Object.assign({}, data), commData);
    }
    else if (item.type === "Object") {
        const data = {};
        item.value.map((val) => {
            if (!eval(val.value)) {
                // console.log(`key ${val.value} not found`);
                // data[val.key] = undefined;
            }
            else {
                data[val.key] = eval(val.value);
            }
        });
        return Object.assign(Object.assign({}, data), commData);
    }
};
const createBusinessPayload = (myconfig, obj) => {
    const payload = {};
    try {
        myconfig.map((conf) => {
            if (conf.extractionPath) {
                conf = Object.assign(Object.assign({}, conf), { value: decodeInputString(conf.extractionPath) });
                createNestedField(payload, conf.business_key, typeof conf.value === "string"
                    ? eval(conf.value)
                    : extractData(obj, conf).flat(Infinity));
            }
        });
        return payload;
    }
    catch (e) {
        logger.info("error while creating bussniss payload", e);
        return payload;
    }
};
const createBecknObject = (session, type, data, config) => {
    if (config.sessionData) {
        const updatedSession = createPayload(config.sessionData, type, data, session, ondc_payload_module_1.default);
        session = Object.assign(Object.assign({}, session), updatedSession);
    }
    const payload = createPayload(config.mapping, type, data, session, ondc_payload_module_1.default);
    return { payload, session };
};
exports.createBecknObject = createBecknObject;
const extractBusinessData = (type, payload, session, protocol) => {
    if (protocol.sessionData) {
        const parsedSchema = createBusinessPayload(protocol.sessionData, payload);
        console.log("parsedSchaems", parsedSchema);
        session = Object.assign(Object.assign({}, session), parsedSchema);
    }
    const result = createBusinessPayload(protocol.mapping, payload);
    return { result, session };
};
exports.extractBusinessData = extractBusinessData;
const extractPath = (path, obj) => {
    const payload = {};
    try {
        const value = decodeInputString(path);
        createNestedField(payload, "data", typeof value === "string"
            ? eval(value)
            : extractData(obj, { value }).flat(Infinity));
        return payload;
    }
    catch (e) {
        logger.info("error while creating bussniss payload", e);
        return payload;
    }
};
exports.extractPath = extractPath;
