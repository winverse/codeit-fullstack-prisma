import express from 'express';
import { usersRouter } from './users.js';

const router = express.Router();

router.use('/users', usersRouter);

export const indexRouter = router;
