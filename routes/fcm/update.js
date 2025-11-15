import {
  insertNewDocument,
  updateDocument,findOne
} from "../../helpers/index.js";

const updateFcmToken = async (req, res) => {
  try {
    const { fcmToken,id } = req.params;
   const findUser = await findOne("user", { _id: id });
    if (!findUser) {
      return res
        .status(400)
        .json({ status: 400, message: "User Not Found!" });
    }
    const findToken = await findOne("token", { fcmToken,user_id:id });
    if (findToken) {
      const insertToken = await updateDocument(
        "token",
        {user_id:id},
        {
          fcmToken,
        }
      );

      return res
        .status(200)
        .send({
          status: 200,
          message: "FCM token updated successfully",
          insertToken,
        });
    }


    const insertToken = await insertNewDocument("token", {
      user_id:id,
      fcmToken,
    });

    return res
      .status(200)
      .send({
        status: 200,
        message: "FCM token updated successfully",
        insertToken,
      });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ status: 500, message: e.message });
  }
};

export default updateFcmToken;
