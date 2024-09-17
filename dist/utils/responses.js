"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorNack = exports.sessionAck = exports.sessionNack = exports.signNack = exports.invalidNack = exports.schemaNack = exports.ack = void 0;
exports.ack = {
    message: {
        ack: {
            status: "ACK",
        },
    },
};
exports.schemaNack = {
    message: {
        ack: {
            status: "NACK",
        },
    },
    error: {
        code: "346001",
        path: "string",
        message: "Schema validation error",
    },
};
exports.invalidNack = {
    message: {
        ack: {
            status: "NACK",
        },
    },
    error: {
        code: "10000",
        path: "string",
        message: "Generic bad or invalid request error",
    },
};
exports.signNack = {
    message: {
        ack: {
            status: "NACK",
        },
    },
    error: {
        code: "20001",
        path: "string",
        message: "Cannot verify signature for request",
    },
};
exports.sessionNack = {
    message: {
        ack: {
            status: "NACK",
        },
    },
    error: {
        message: "Session does not exist",
    },
};
exports.sessionAck = {
    message: {
        ack: {
            status: "ACK",
            message: "Session Generated",
        },
    },
};
exports.errorNack = {
    message: {
        ack: {
            status: "NACK",
        },
    },
    error: {
        message: "Internal Server Error",
    },
};
// module.exports = {
//   ack,
//   schemaNack,
//   signNack,
//   invalidNack,
//   sessionNack,
//   sessionAck,
//   errorNack,
// };
