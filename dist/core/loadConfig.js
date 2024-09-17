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
exports.configLoader = void 0;
const axios_1 = __importDefault(require("axios"));
const utils_1 = require("../utils/utils");
const SERVER_TYPE = process.env.SERVER_TYPE;
const localConfig = (0, utils_1.parseBoolean)(process.env.localConfig);
const fs_1 = __importDefault(require("fs"));
const yaml_1 = __importDefault(require("yaml"));
const path_1 = __importDefault(require("path"));
const json_schema_ref_parser_1 = __importDefault(require("@apidevtools/json-schema-ref-parser"));
class ConfigLoader {
    constructor() {
        this.config = null;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (localConfig) {
                    const config = yaml_1.default.parse(fs_1.default.readFileSync(path_1.default.join(__dirname, "../configs/index.yaml"), "utf8"));
                    const schema = yield json_schema_ref_parser_1.default.dereference(config);
                    this.config = schema;
                    return;
                }
                else {
                    const url = process.env.config_url;
                    if (!url) {
                        throw new Error("Config url not found");
                    }
                    const response = yield axios_1.default.get(url);
                    if (response.data.version !== process.env.VERSION) {
                        throw new Error(`Config version mismatch: Config version - ${response.data.version}, App version - ${process.env.VERSION}`);
                    }
                    this.config = response.data;
                    return response.data;
                }
            }
            catch (e) {
                throw new Error(e);
            }
        });
    }
    getConfig() {
        return this.config;
    }
    getSchema() {
        return this.config.schema;
    }
    getMapping(configName) {
        var _a;
        if (!SERVER_TYPE) {
            throw new Error("SERVER_TYPE not found");
        }
        let mapping = null;
        (_a = this.config[SERVER_TYPE].flows) === null || _a === void 0 ? void 0 : _a.forEach((flow) => {
            if (flow.id === configName) {
                mapping = flow.protocol;
                return;
            }
        });
        return mapping;
    }
    getAttributeConfig(configName) {
        return this.config.attributes[configName];
    }
}
exports.configLoader = new ConfigLoader();
