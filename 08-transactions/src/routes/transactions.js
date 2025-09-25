import express from 'express';
import { transactionRepository } from '../repository/transaction.repository.js';

const router = express.Router();

// 1. 게시글 + 첫 댓글 동시 생성
router.post('/posts-with-comment', async (req, res) => {
  try {
    const { authorId, title, content, commentContent } = req.body;

    // 입력값 검증
    if (!authorId || !title || !content || !commentContent) {
      return res.status(400).json({
        error: 'authorId, title, content, commentContent는 모두 필수입니다.',
      });
    }

    const result = await transactionRepository.createPostWithComment(
      parseInt(authorId),
      { title, content, published: true },
      commentContent,
    );

    res.status(201).json({
      message: '게시글과 첫 댓글이 함께 생성되었습니다.',
      ...result,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. 안전한 게시글 삭제 (댓글까지 함께)
router.delete('/posts/:id', async (req, res) => {
  try {
    const postId = parseInt(req.params.id);

    if (isNaN(postId)) {
      return res
        .status(400)
        .json({ error: '올바른 게시글 ID를 입력해주세요.' });
    }

    const result = await transactionRepository.deletePostWithComments(postId);

    res.json({
      message: '게시글과 댓글이 안전하게 삭제되었습니다.',
      ...result,
    });
  } catch (error) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

export const transactionsRouter = router;
