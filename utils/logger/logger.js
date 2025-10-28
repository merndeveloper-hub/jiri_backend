import pino from 'pino';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === Step 1: Ensure log directory exists ===
const logDirectory = path.join(__dirname, 'logs');
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

// === Step 2: Generate weekly log filename ===
function getWeeklyLogFileName() {
  const now = new Date();
  const sunday = new Date(now.setDate(now.getDate() - now.getDay())); // start of week
  const dateStr = sunday.toISOString().slice(0, 10);
  return path.join(logDirectory, `app-${dateStr}.log`);
}

// === Step 3: Setup base logger options ===
const options = {
  useLevelLabels: true,
  level: 'info',
  messageKey: 'message',
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
  redact: {
    paths: ['password', 'pid'],
    remove: true,
  },
  formatters: {
    level(label) {
      return { level: label };
    },
  },
};

// === Step 4: Create logger instance ===
const stream = fs.createWriteStream(getWeeklyLogFileName(), { flags: 'a' });
const logger = pino(options, stream);

// === Step 5: Middleware to attach req.log ===
function pinoHttpMiddleware(req, res, next) {
  req.log = logger.child({
    reqId: req.headers['xReqId'] || Date.now().toString(),
    method: req.method,
    url: req.originalUrl,
  });
  next();
}

// === Step 6: Endpoint to dynamically change log level ===
async function changed(req, res) {
  const { newLevel, logTime = 1 } = req.body;
  const validLevels = ['debug', 'info', 'warn', 'error'];

  if (validLevels.includes(newLevel)) {
    const prevLevel = options.level;
    options.level = newLevel;
    logger.level = newLevel;

    res.send(`Log level changed to '${newLevel}' for ${logTime} minute(s).`);

    setTimeout(() => {
      options.level = prevLevel;
      logger.level = prevLevel;
    }, Number(logTime) * 60 * 1000);
  } else {
    res.status(400).send('Invalid log level.');
  }
}

export {
  logger as pinoInstance,
  pinoHttpMiddleware,
  changed,
};
