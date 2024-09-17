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
exports.default = connectDB;
const mongoose_1 = __importDefault(require("mongoose"));
const connectionString = process.env.DATABASE_CONNECTION_STRING;
function connectDB() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!connectionString) {
                throw new Error("Database connection string not found");
            }
            yield mongoose_1.default.connect(connectionString);
            console.log("MongoDB connected successfully");
        }
        catch (error) {
            console.error("MongoDB connection failed:", error === null || error === void 0 ? void 0 : error.message);
            process.exit(1);
        }
    });
}
// module.exports = connectDB;
