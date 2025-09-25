import express from 'express';
import { commentRepository } from '../repository/comment.repository.js';

export const commentsRouter = express.Router();

// POST /comments - 새 댓글 생성
commentsRouter.post('/', async (req, res) => {
  try {
    const newComment = await commentRepository.createComment(req.body);
    res.status(201).json(newComment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /comments - 모든 댓글 조회
commentsRouter.get('/', async (req, res) => {
  try {
    const comments = await commentRepository.findAllComments();
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /comments/post/:postId - 특정 게시글의 댓글 목록 조회
commentsRouter.get('/post/:postId', async (req, res) => {
  try {
    const comments = await commentRepository.findCommentsByPostId(
      req.params.postId,
    );
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /comments/:id - 특정 댓글 조회
commentsRouter.get('/:id', async (req, res) => {
  try {
    const comment = await commentRepository.findCommentById(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: '댓글을 찾을 수 없습니다.' });
    }
    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /comments/:id - 댓글 수정
commentsRouter.put('/:id', async (req, res) => {
  try {
    const updatedComment = await commentRepository.updateComment(
      req.params.id,
      req.body,
    );
    res.json(updatedComment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /comments/:id - 댓글 삭제
commentsRouter.delete('/:id', async (req, res) => {
  try {
    await commentRepository.deleteComment(req.params.id);
    res.json({ message: '댓글이 성공적으로 삭제되었습니다.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
