import express from 'express';
import { postRepository } from '../repository/post.repository.js';

const router = express.Router();

// 게시글 목록 조회 (기본 페이지네이션)
router.get('/', async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await postRepository.getPostsWithPagination(page, limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 검색 API
router.get('/search', async (req, res) => {
  try {
    const { q: search } = req.query;
    const posts = await postRepository.searchPosts(search);
    res.json({ posts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 인기 게시글 조회 (댓글 수 기준)
router.get('/popular', async (req, res) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 5;
    const popularPosts = await postRepository.getPopularPosts(limit);
    res.json({ posts: popularPosts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 특정 게시글 조회
router.get('/:id', async (req, res) => {
  const post = await postRepository.findPostById(req.params.id);
  res.json(post);
});

// 게시글 생성
router.post('/', async (req, res) => {
  const newPost = await postRepository.createPost(req.body);
  res.status(201).json(newPost);
});

// 게시글 수정
router.put('/:id', async (req, res) => {
  const updatedPost = await postRepository.updatePost(req.params.id, req.body);
  res.json(updatedPost);
});

// 게시글 삭제
router.delete('/:id', async (req, res) => {
  await postRepository.deletePost(req.params.id);
  res.status(204).send();
});

export const postsRouter = router;
