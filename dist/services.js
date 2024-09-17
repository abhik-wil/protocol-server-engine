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
Object.defineProperty(exports, "__esModule", { value: true });
const mapper_core_1 = require("./core/mapper_core");
const session_1 = require("./core/session");
// import validateSchema from "./core/schema";
const getBecknObject = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        const config = payload.context.action;
        // const payload = req.body
        const transaction_id = payload.context.transaction_id;
        let session = yield (0, session_1.getSession)(transaction_id);
        if (!session) {
            yield (0, session_1.generateSession)({
                version: payload.context.version,
                country: payload.context.location.country.code,
                cityCode: payload.context.location.city.code,
                configName: "metro-flow-1",
                currentTransactionId: transaction_id,
            });
            session = yield (0, session_1.getSession)(transaction_id);
        }
        const { payload: becknPayload, session: updatedSession } = (0, mapper_core_1.createBecknObject)(session, session.protocolCalls[config], payload, session.protocolCalls[config].protocol);
        (0, session_1.insertSession)(updatedSession);
        resolve(becknPayload);
    }));
});
module.exports = getBecknObject;
