import { findOne } from "../../helpers/index.js";
import {admin} from "../../config/firebase/firebaseConfig.js"

const sendNotification = async (req, res) => {
  try {
    console.log(req.body, "body");

    const { fcmToken, title, body, senderId } = req.body;
    // 1. Get receiver info
    // const receiver = await db.users.findOne({ id: receiverId });
    const sender = await findOne("user", { _id: senderId });
    if (!sender) {
      return res
        .status(400)
        .json({ status: 400, message: "Sender Not Found!" });
    }

    // const receiver = await findOne("user", { _id: receiverId });
    // if (!receiver) {
    //   return res
    //     .status(400)
    //     .json({ status: 400, message: "Receiver Not Found!" });
    // }

    // 2. Create message
    const message = {
      notification: { title, body },
      token: fcmToken,
      data: { senderId: String(senderId) }, // optional
    };

    // 3. Send notification
    const response = await admin.messaging().send(message);
    console.log(response, "response");

    return res
      .status(200)
      .json({ status: 200, message: "Successfully send notification" });
  } catch (e) {
    return res.status(500).json({ status: 500, message: e.message });
  }
};

export default sendNotification;
