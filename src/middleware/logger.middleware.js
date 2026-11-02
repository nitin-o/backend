
import morgan from "morgan";
import logger from "../utils/logger.js";
import fs from "node:fs";
import path from "node:path";

const logDirectory = path.resolve(process.cwd(), "logs");

fs.mkdirSync(logDirectory, { recursive: true });

const accessLogStream = fs.createWriteStream(
    path.join(logDirectory, "access.log"),
    { flags: "a" }
);

const stream = {
    write: (message) => {
        const logMessage = message.trim();

        logger.info(logMessage);
        accessLogStream.write(logMessage + "\n");
    }
};

const loggerMiddleware = morgan(
    ":date[iso] :method :url :status :response-time ms - IP: :remote-addr",
    { stream }
);

export default loggerMiddleware;
