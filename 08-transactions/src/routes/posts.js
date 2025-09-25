import express from 'express';
import { postRepository } from '../repository/post.repository.js';

const router = express.Router();

// 모든 게시글 조회 (필터링, 정렬, 페이지네이션)
router.get('/', async (req, res) => {
  // 정렬 옵션
  const { sort = 'createdAt', order = 'desc' } = req.query;
  const orderBy = { [sort]: order };

  // 페이지네이션 옵션
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const take = limit;

  // 검색(필터링) 옵션
  const { search } = req.query;
  const where = {};
  if (search) {
    where.title = { contains: search, mode: 'insensitive' };
  }

  const [posts, total] = await Promise.all([
    postRepository.findAllPosts({ where, orderBy, skip, take }),
    postRepository.countPosts(where),
  ]);

  res.json({
    data: posts,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  });
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
