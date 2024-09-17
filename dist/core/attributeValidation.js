"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = validateAttributes;
function validateAttributes(examples, attributes, example_sets, logKey = "") {
    var _a;
    let errors = [];
    for (const key in examples) {
        const newKey = logKey ? logKey + "." + key : key;
        if (key !== "tags")
            if (typeof examples[key] === "object" &&
                typeof attributes[key] === "object") {
                if (!attributes[key]) {
                    // console.log(`null value found for, ${key} in  ${example_sets}`);
                    errors.push(`null value found for : ${newKey} in  ${example_sets}`);
                }
                else if (Array.isArray(examples[key])) {
                    for (let i = 0; i < ((_a = examples[key]) === null || _a === void 0 ? void 0 : _a.length); i++) {
                        const exampleItem = examples[key][i];
                        const attributeItem = attributes[key];
                        //use if array has no keys like: category_ids
                        if (typeof exampleItem === "string" && attributeItem) {
                            //found
                        }
                        else {
                            const err = validateAttributes(exampleItem, attributeItem, example_sets, newKey + "." + i);
                            errors = [...errors, ...err];
                        }
                    }
                }
                else {
                    const err = validateAttributes(examples[key], attributes[key], example_sets, newKey);
                    errors = [...errors, ...err];
                }
            }
            else if (!attributes.hasOwnProperty(key)) {
                // console.log(`keys not found, ${key} in  ${example_sets}`);
                errors.push(`Additional keys found : ${newKey} in  ${example_sets}`);
            }
    }
    // console.log("Attribute validation succesful");
    return errors;
}
