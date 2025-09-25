import express from 'express';
import { userRepository } from '../repository/user.repository.js';

const router = express.Router();

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

// 사용자와 게시글 조회 (Relations API)
router.get('/:id/posts', async (req, res) => {
  const user = await userRepository.findUserWithPosts(parseInt(req.params.id));
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json(user);
});

export const usersRouter = router;