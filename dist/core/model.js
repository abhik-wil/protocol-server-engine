"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const transactionSchema = new mongoose_1.default.Schema({
    configName: {
        type: String,
        required: true,
    },
    transaction_id: {
        type: String,
        required: true,
        unique: true,
    },
}, { strict: false });
exports.Transaction = mongoose_1.default.model("Transaction", transactionSchema);
