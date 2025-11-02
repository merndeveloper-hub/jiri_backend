import mongoose from "mongoose";
import subscriptionTransactionSchema from "./subscribtion.js";

const subscriptionTransaction = mongoose.model("subscriptionTransaction", subscriptionTransactionSchema);

export default subscriptionTransaction;
