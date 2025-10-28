// const loggerInstance = require('./common/utils/logger/logger')
// const CommonHeaders = require('./common/model/header')



// const loggerMiddleware = async (req, res, next) => {
//     req = await extractEndpoint(req);
//     const commonHeaders = new CommonHeaders(
//         req.headers["x-channel-id"],
//         req.headers["x-sub-channel-id"],
//         req.headers["x-req-id"],
//         req.headers["x-country-code"],
//         req.headers['x-endpoint']

//     )

//     const logger = loggerInstance.pinoChildInstance(commonHeaders["xChannelId"], {
//         reqId: commonHeaders["xReqId"],
//         endpointName: commonHeaders['xEndpoint'],
//         fileName: "loggerMiddleware.js",
//         TopicName: "Test-Topic",
//         Partition: "Test-Partition",

//     });


//     let ReqUrl = req.protocol + ':' + req.headers.host + req.originalUrl;

//     const logMessage = {
//         message: 'Incoming Request',
//         RequestData: {
//             url: ReqUrl,
//             reqMethod: req.method,
//             body: req.body
//         }
//     };

//     logger.level == "info" ? logger.info(logMessage) : logger.debug(logMessage)
   
//     const originalJson = res.json;


//     res.json = function (data) {
//         const responseLog = {
//             message: 'Outgoing Response',
//             ResponseData: {
//                 statusCode: res.statusCode,
//                 data: data,
//             }
//         };
     

//         logger.level == "info" ? logger.info(responseLog) : logger.debug(responseLog)
       

//        return originalJson.call(this, data);
//     };

//     next();
// };

// function extractEndpoint(req) {
//     let parts = req.originalUrl.split('/');
//     req.headers['x-endpoint'] = parts[parts.length - 1]

//     return req

// }

// module.exports = loggerMiddleware






// services/userService.js
import { pinoInstance } from '../logger.js';

const log = pinoInstance.child({ context: 'userService' });

export async function createUser(userData) {
  try {
    log.info({ userData }, 'Creating new user');
    // ... your logic here ...
  } catch (err) {
    log.error({ err }, 'Error while creating user');
    throw err;
  }
}


// routes/userRoutes.js
import express from 'express';
import { createUser } from '../services/userService.js';

const router = express.Router();

router.post('/users', async (req, res) => {
  try {
    req.log.info('User creation started');
    const user = await createUser(req.body);
    req.log.info('User creation successful');
    res.status(201).json(user);
  } catch (error) {
    req.log.error({ error }, 'User creation failed');
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;





