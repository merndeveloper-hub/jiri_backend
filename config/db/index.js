import mongoose from "mongoose";
import { DB_USER, DB_PASS, DB_NAME } from "../index.js";


let connect = `mongodb+srv://${DB_USER}:${DB_PASS}@${DB_NAME}cluster0.3vlsbmo.mongodb.net/`

//let connect = "mongodb+srv://volfji1_db_user:i7sSw25aDkCpYLHx@cluster0.3vlsbmo.mongodb.net/"

mongoose.connect(

    connect
);

export default mongoose;
