import express from 'express';
import { getEnvVar } from './utils/env.js';
import { globalErrorHandler } from './middleware/errorHandler.js';
import cookieParser from 'cookie-parser';
const port = getEnvVar("PORT");
const app = express();
app.use(cookieParser());
app.use(globalErrorHandler);
app.listen(port, () => {
    console.log(`Listening on port:${port}`);
});
//# sourceMappingURL=index.js.map