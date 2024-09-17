"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateOperation = evaluateOperation;
const operations_1 = require("./operations");
const schema_1 = require("./schema");
function evaluateOperation(context, op) {
    var opt = __getOperation(context, op.type);
    if (!opt) {
        throw new Error("Invalid operation type");
    }
    if (op["input"]) {
        opt.input = __evaluateInput(context, op["input"], op.type);
    }
    return opt.getOutput().getValue();
}
function __evaluateInput(context, inputObj, type) {
    var input = new schema_1.Input(context, inputObj, type);
    return input;
}
function __getOperation(context, op) {
    switch (op) {
        case "GENERATE_UUID":
            return new operations_1.GenerateUuidOperation(context);
        case "READ":
            return new operations_1.ReadOperation(context);
        case "GENERATE_TIMESTAMP":
            return new operations_1.GenerateTmpstmpOperation(context);
        case "EQUAL":
            return new operations_1.EqualOperation(context);
        case "AND":
        case "OR":
            return new operations_1.AndOrOperation(context);
        case "EQUALRETURN":
            return new operations_1.equalReturn(context);
        case "STRINGIFY":
            return new operations_1.stringifybase64(context);
    }
}
// module.exports = { evaluateOperation };
