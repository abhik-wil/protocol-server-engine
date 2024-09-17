"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringifybase64 = exports.greaterORlessthan = exports.equalReturn = exports.AndOrOperation = exports.EqualOperation = exports.ReadOperation = exports.GenerateTmpstmpOperation = exports.GenerateUuidOperation = void 0;
const schema_1 = require("./schema");
const crypto_1 = __importDefault(require("crypto"));
const schema_2 = require("./schema");
class Operator {
    constructor(context) {
        this.context = context;
    }
    setInput(input) {
        this.input = input.__process();
        return this;
    }
    __process() {
        return this;
    }
    getOutput() {
        return this.__process().output.__process();
    }
}
class GenerateUuidOperation extends Operator {
    __process() {
        this.output = new schema_1.Output(crypto_1.default.randomUUID());
        return this;
    }
}
exports.GenerateUuidOperation = GenerateUuidOperation;
class GenerateTmpstmpOperation extends Operator {
    __process() {
        this.output = new schema_1.Output(new Date().toISOString());
        return this;
    }
}
exports.GenerateTmpstmpOperation = GenerateTmpstmpOperation;
class ReadOperation extends Operator {
    __process() {
        this.output = new schema_1.Output(this.getAttribute(this.context, this.input.getValue().split(".")));
        return this;
    }
    getAttribute(data, keyArr) {
        let key = isNaN(keyArr[0]) ? keyArr[0] : parseInt(keyArr[0]);
        if (data[key] && data[key] != undefined) {
            if (keyArr.length == 1) {
                return data[key];
            }
            return this.getAttribute(data[key], keyArr.slice(1, keyArr.length));
        }
        return undefined;
    }
}
exports.ReadOperation = ReadOperation;
class EqualOperation extends Operator {
    __process() {
        var _a, _b, _c, _d, _e;
        let flag = 0;
        let value = this === null || this === void 0 ? void 0 : this.readValue((_c = (_b = (_a = this === null || this === void 0 ? void 0 : this.input) === null || _a === void 0 ? void 0 : _a.value[0]) === null || _b === void 0 ? void 0 : _b.operation) === null || _c === void 0 ? void 0 : _c.input);
        if (value == undefined)
            value = "undefined"; //handle cases where value is not present
        if ((_e = (_d = this === null || this === void 0 ? void 0 : this.input) === null || _d === void 0 ? void 0 : _d.value) === null || _e === void 0 ? void 0 : _e.includes(value)) {
            flag = 1;
        }
        this.output = new schema_1.Output(flag);
        return this;
    }
    readValue(readValue) {
        const read = new ReadOperation(this.context);
        read.input = new schema_2.Input(this.context, readValue);
        return read.getOutput().getValue();
    }
}
exports.EqualOperation = EqualOperation;
class AndOrOperation extends Operator {
    __process() {
        this.output = new schema_1.Output(this.match(this.input.value));
        return this;
    }
    match(input) {
        if (input.length) {
            let result = input.map((element) => {
                var _a, _b;
                if (((_a = element === null || element === void 0 ? void 0 : element.operation) === null || _a === void 0 ? void 0 : _a.type) == "EQUAL") {
                    const EQUAL = new EqualOperation(this.context);
                    EQUAL.input = new schema_2.Input(this.context, (_b = element === null || element === void 0 ? void 0 : element.operation) === null || _b === void 0 ? void 0 : _b.input);
                    return EQUAL.getOutput().getValue();
                }
            });
            if (this.input.type == "AND")
                return result.includes(0) ? false : true;
            else if (this.input.type == "OR")
                return result.includes(1) ? true : false;
        }
    }
}
exports.AndOrOperation = AndOrOperation;
class equalReturn extends Operator {
    __process() {
        this.output = new schema_1.Output(this.match(this.input.value));
        return this;
    }
    match(input) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        for (let i = 0; i < input.length; i++) {
            if (input[i].operation.type == "EQUAL") {
                const EQUAL = new EqualOperation(this.context);
                EQUAL.input = new schema_2.Input(this.context, (_b = (_a = input[i]) === null || _a === void 0 ? void 0 : _a.operation) === null || _b === void 0 ? void 0 : _b.input);
                if (EQUAL.getOutput().getValue()) {
                    return (_d = (_c = input[i]) === null || _c === void 0 ? void 0 : _c.operation) === null || _d === void 0 ? void 0 : _d.input.value[2];
                }
            }
            else {
                const GREATERLESSTHAN = new greaterORlessthan(this.context);
                GREATERLESSTHAN.input = new schema_2.Input(this.context, (_f = (_e = input[i]) === null || _e === void 0 ? void 0 : _e.operation) === null || _f === void 0 ? void 0 : _f.input, input[i].operation.type);
                if (GREATERLESSTHAN.getOutput().getValue()) {
                    return (_h = (_g = input[i]) === null || _g === void 0 ? void 0 : _g.operation) === null || _h === void 0 ? void 0 : _h.input.value[2];
                }
            }
        }
    }
}
exports.equalReturn = equalReturn;
class greaterORlessthan extends Operator {
    __process() {
        // this.output = new Output(this.match(this.input.value));
        this.output = new schema_1.Output(this.match());
        return this;
    }
    match() {
        var _a, _b, _c, _d, _e, _f;
        const value = parseInt(this === null || this === void 0 ? void 0 : this.readValue((_c = (_b = (_a = this === null || this === void 0 ? void 0 : this.input) === null || _a === void 0 ? void 0 : _a.value[0]) === null || _b === void 0 ? void 0 : _b.operation) === null || _c === void 0 ? void 0 : _c.input));
        this.input.value[1] = parseInt((_d = this === null || this === void 0 ? void 0 : this.input) === null || _d === void 0 ? void 0 : _d.value[1]);
        return this.input.type === "GREATERTHAN" && value > ((_e = this === null || this === void 0 ? void 0 : this.input) === null || _e === void 0 ? void 0 : _e.value[1])
            ? 1
            : this.input.type === "LESSTHAN" && value < ((_f = this === null || this === void 0 ? void 0 : this.input) === null || _f === void 0 ? void 0 : _f.value[1])
                ? 1
                : 0;
    }
    readValue(readValue) {
        const read = new ReadOperation(this.context);
        read.input = new schema_2.Input(this.context, readValue);
        return read.getOutput().getValue();
    }
}
exports.greaterORlessthan = greaterORlessthan;
class stringifybase64 extends Operator {
    __process() {
        this.output = new schema_1.Output(this.stringify());
        return this;
    }
    stringify() {
        let response = JSON.stringify(this.context.req_body);
        response = Buffer.from(response, "utf-8").toString("base64"); //convert to base64
        return response;
    }
}
exports.stringifybase64 = stringifybase64;
module.exports = {
    GenerateUuidOperation,
    GenerateTmpstmpOperation,
    ReadOperation,
    EqualOperation,
    AndOrOperation,
    equalReturn,
    stringifybase64,
};
