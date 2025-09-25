import express from 'express';
import { userRepository } from '../repository/user.repository.js';

const router = express.Router();

// --- 기존 CRUD 라우트 ---

// 모든 사용자 조회 (게시글 포함)
router.get('/', async (req, res) => {
  const users = await userRepository.findAllUsers();
  res.json(users);
});

// 특정 사용자 조회 (게시글 포함)
router.get('/:id', async (req, res) => {
  const user = await userRepository.findUserById(req.params.id);
  res.json(user);
});

// 사용자 생성
router.post('/', async (req, res) => {
  const newUser = await userRepository.createUser(req.body);
  res.status(201).json(newUser);
});

// 사용자 정보 수정
router.put('/:id', async (req, res) => {
  const updatedUser = await userRepository.updateUser(req.params.id, req.body);
  res.json(updatedUser);
});

// 사용자 삭제
router.delete('/:id', async (req, res) => {
  await userRepository.deleteUser(req.params.id);
  res.status(204).send();
});

// --- 트랜잭션 라우트 ---

// 사용자 생성과 동시에 게시글 생성
router.post('/with-post', async (req, res) => {
  try {
    const { user, post } = req.body;
    const result = await userRepository.createUserAndPost(user, post);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export const usersRouter = router;
