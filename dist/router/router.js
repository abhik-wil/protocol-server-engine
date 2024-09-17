"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
exports.router = express_1.default.Router();
const index_1 = require("../controller/index");
const logger = require("../utils/logger");
// buss > beckn
exports.router.post("/createPayload", index_1.businessToBecknWrapper);
// bkn > buss
exports.router.post("/ondc/:method", index_1.becknToBusiness);
exports.router.post("/updateSession", index_1.updateSession);
exports.router.get("/health", (req, res) => {
    logger.info("Recieved request");
    res.send({ status: "working" });
});
