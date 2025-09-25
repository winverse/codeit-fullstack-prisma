import express from 'express';
import { usersRouter } from './users.js';
import { postsRouter } from './posts.js';
import { commentsRouter } from './comments.js';

const router = express.Router();

router.use('/users', usersRouter);
router.use('/posts', postsRouter);
router.use('/comments', commentsRouter);

export const indexRouter = router;
