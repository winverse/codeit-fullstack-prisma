import express from 'express';
import cookieParser from 'cookie-parser';
import { indexRouter as apiRouter } from './routes/index.js';
import { errorHandler } from './middlewares/error-handler.middleware.js';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cookieParser());
app.use('/', apiRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
