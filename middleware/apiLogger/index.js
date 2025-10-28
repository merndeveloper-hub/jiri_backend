// middleware/apiLogger.js

import { v4 as uuidv4 } from "uuid";
import { insertNewDocument } from "../../helpers/index.js";

export const apiLogger = async (req, res, next) => {
  const start = Date.now();
  const reqId = uuidv4();
  req.reqId = reqId;

  const { method, originalUrl, headers, body, ip } = req;

  // Capture response
  const originalSend = res.send;
  let responseBody;

  res.send = function (bodyToSend) {
    responseBody = bodyToSend;
    return originalSend.call(this, bodyToSend);
  };

  res.on("finish", async () => {
    const duration = Date.now() - start;

    try {
      await insertNewDocument("apiLog", {
        route: originalUrl,
        method,
        statusCode: res.statusCode,
        reqHeaders: headers,
        reqBody: body,
        resBody: tryParse(responseBody),
        responseTime: duration,
        timestamp: new Date(),
        ip,
        userId: req.user?.id || null,
        reqId,
      });
      // await ApiLog.create({
      //   route: originalUrl,
      //   method,
      //   statusCode: res.statusCode,
      //   reqHeaders: headers,
      //   reqBody: body,
      //   resBody: tryParse(responseBody),
      //   responseTime: duration,
      //   timestamp: new Date(),
      //   ip,
      //   userId: req.user?.id || null,
      //   reqId
      // });
    } catch (err) {
      console.error("Failed to log API request:", err);
    }
  });

  next();
};

function tryParse(body) {
  try {
    return typeof body === "string" ? JSON.parse(body) : body;
  } catch (e) {
    return body;
  }
}
