import express from "express";


// import getMe from "./single.js";
 import deleteUserAccount from "./delete.js";
import exportUserData from "./add.js";

const router = express.Router();




// //----------delete User Account --------------------//
 router.delete("/:id",  deleteUserAccount);

//----------user export data --------------------//
router.post("/:id",  exportUserData);

export default router;
