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
exports.cache = void 0;
const node_cache_1 = __importDefault(require("node-cache"));
const dbServices_1 = require("./dbServices");
const utils_1 = require("./../utils/utils");
const defaultCacheOptions = { stdTTL: 100, checkperiod: 120 };
const USE_DB = (0, utils_1.parseBoolean)(process.env.USE_DB);
class NodeCacheAdapter {
    constructor(options) {
        // super();
        this.cache = new node_cache_1.default(options);
    }
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            if (USE_DB) {
                if (key === undefined || key === "") {
                    return yield (0, dbServices_1.fetchAllTransactionsIDs)();
                }
                return yield (0, dbServices_1.fetchTransactionById)(key);
            }
            else {
                if (key === undefined || key === "") {
                    return this.cache.keys();
                }
                return this.cache.get(key);
            }
        });
    }
    set(uniqueIdentifier, data, ttl) {
        return __awaiter(this, void 0, void 0, function* () {
            if (USE_DB) {
                yield (0, dbServices_1.upsertTransaction)(data);
            }
            else {
                this.cache.set(uniqueIdentifier, data, ttl);
            }
        });
    }
}
exports.cache = new NodeCacheAdapter(defaultCacheOptions);
