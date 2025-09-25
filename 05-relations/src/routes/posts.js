import express from 'express';
import { postRepository } from '../repository/post.repository.js';

export const postsRouter = express.Router();

// POST /posts - 새 게시글 생성
postsRouter.post('/', async (req, res) => {
  try {
    const newPost = await postRepository.createPost(req.body);
    res.status(201).json(newPost);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /posts - 모든 게시글 조회
postsRouter.get('/', async (req, res) => {
  try {
    const posts = await postRepository.findAllPosts();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /posts/:id - 특정 게시글 조회
postsRouter.get('/:id', async (req, res) => {
  try {
    const post = await postRepository.findPostById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /posts/:id - 게시글 수정
postsRouter.put('/:id', async (req, res) => {
  try {
    const updatedPost = await postRepository.updatePost(
      req.params.id,
      req.body,
    );
    res.json(updatedPost);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /posts/:id - 게시글 삭제
postsRouter.delete('/:id', async (req, res) => {
  try {
    await postRepository.deletePost(req.params.id);
    res.json({ message: '게시글이 성공적으로 삭제되었습니다.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});