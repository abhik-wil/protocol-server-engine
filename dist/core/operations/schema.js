"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Output = exports.Input = void 0;
const utils_1 = require("./utils");
class IOElement {
    __process() {
        if (this.operation) {
            this.value = (0, utils_1.evaluateOperation)(this.context, this.operation);
        }
        return this;
    }
    getValue() {
        return this.value;
    }
}
class Input extends IOElement {
    constructor(context, config, type = undefined) {
        super();
        this.context = context;
        this.operation = config.operation;
        this.value = config.value;
        this.type = type;
        this.__process();
    }
}
exports.Input = Input;
class Output extends IOElement {
    constructor(value) {
        super();
        this.value = value;
    }
    getValue() {
        this.__process;
        return this.value;
    }
}
exports.Output = Output;
module.exports = {
    Input,
    Output,
};
