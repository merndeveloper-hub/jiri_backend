import mongoose from "mongoose";
//import { DB_USER, DB_PASS, DB_NAME } from "../index.js";


//MONGODB_URI="mongodb+srv://username:password@clustername.mongodb.net/databaseName?retryWrites=true&w=majority"

//mongodb+srv://owais:<db_password>@cluster0.1wehduf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
// if(!DB_URI) {
//   throw new Error('Please define the MONGODB_URI environment variable inside .env.<development/production>.local');
// }

 let connect =  "mongodb+srv://volfji1_db_user:i7sSw25aDkCpYLHx@cluster0.3vlsbmo.mongodb.net/"
// console.log(connect,"connect");

mongoose.connect(
 // "mongodb+srv://owais:WangChao786123@cluster0.1wehduf.mongodb.net/firststab?retryWrites=true&w=majority&appName=Cluster0"
//  `mongodb+srv://${DB_USER}:${DB_PASS}@cluster0.1wehduf.mongodb.net/${DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`
connect
);

export default mongoose;
