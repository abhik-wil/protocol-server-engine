"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const router_1 = require("./router/router");
const app = (0, express_1.default)();
const db_1 = __importDefault(require("./core/db"));
require("dotenv").config();
const loadConfig_1 = require("./core/loadConfig");
const utils_1 = require("./utils/utils");
// import { contextValidation } from "./core/contextValidation";
// import PayloadModule from "./core/payloadModule";
// import ondc from "ondc-payload-module";
const logger = require("./utils/logger");
const USE_DB = (0, utils_1.parseBoolean)(process.env.USE_DB);
const PORT = process.env.PORT;
app.use(body_parser_1.default.json({ limit: "10mb" }));
app.use(express_1.default.json());
loadConfig_1.configLoader
    .init()
    .then((data) => {
    console.log('---------upper---------');
    logger.info("Config loaded successfully.");
    console.log('----hdshdskdkd--------------');
    if (USE_DB) {
        (0, db_1.default)();
    }
    app.use(router_1.router);
    app.listen(PORT, () => {
        logger.info("server listening at port " + PORT);
    });
})
    .catch((e) => {
    logger.error("Error loading config file:", e);
});
