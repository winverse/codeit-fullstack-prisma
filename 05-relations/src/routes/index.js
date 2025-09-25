import express from 'express';
import { usersRouter } from './users.js';
import { postsRouter } from './posts.js';

const router = express.Router();

router.use('/users', usersRouter);
router.use('/posts', postsRouter);

export const indexRouter = router;