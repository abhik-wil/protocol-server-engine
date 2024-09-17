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
exports.fetchAllTransactionsIDs = exports.fetchTransactionById = exports.upsertTransaction = void 0;
const model_1 = require("./model");
const upsertTransaction = (transactionData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filter = { transaction_id: transactionData.transaction_id }; // Filter by unique field
        const options = { new: true, upsert: true }; // Create a new document if it doesn't exist, and return the updated document
        const updatedTransaction = yield model_1.Transaction.findOneAndUpdate(filter, transactionData, options);
        console.log("Transaction upserted:", transactionData.transaction_id);
        return updatedTransaction;
    }
    catch (error) {
        console.error("Error upserting transaction:", error);
        throw error;
    }
});
exports.upsertTransaction = upsertTransaction;
const fetchTransactionById = (transactionId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transaction = yield model_1.Transaction.findOne({
            transaction_id: transactionId,
        });
        if (!transaction) {
            console.log("Transaction not found");
            return null;
        }
        console.log("Transaction found:", transactionId);
        return transaction._doc;
    }
    catch (error) {
        console.error("Error fetching transaction:", error);
        throw error;
    }
});
exports.fetchTransactionById = fetchTransactionById;
const fetchAllTransactionsIDs = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transactions = yield model_1.Transaction.find({}, "transaction_id -_id"); // Only select the transaction_id field and exclude the _id field
        const transactionIds = transactions.map((transaction) => transaction.transaction_id);
        console.log("All transaction IDs:", transactionIds);
        return transactionIds;
    }
    catch (error) {
        console.error("Error fetching all transactions:", error);
        throw error;
    }
});
exports.fetchAllTransactionsIDs = fetchAllTransactionsIDs;
