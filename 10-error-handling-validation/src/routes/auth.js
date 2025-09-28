import express from 'express';
import { userRepository } from '../repository/user.repository.js';
import { hashPassword, comparePassword } from '../utils/hash.util.js';
import { generateTokens } from '../utils/jwt.util.js';
import { setAuthCookies, clearAuthCookies } from '../utils/cookie.util.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import { signUpSchema } from '../validators/auth.validator.js';

export const authRouter = express.Router();

// 회원가입 API
authRouter.post('/signup', validate(signUpSchema), async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    const hashedPassword = await hashPassword(password);

    const user = await userRepository.createUser({
      email,
      password: hashedPassword,
      name,
    });

    // 비밀번호를 제외한 사용자 정보 반환
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
});

// 로그인 API
authRouter.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await userRepository.findUserByEmail(email);

    if (!user) {
      return res
        .status(401)
        .json({ message: '인증 정보가 유효하지 않습니다.' });
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: '인증 정보가 유효하지 않습니다.' });
    }

    const tokens = generateTokens(user);
    setAuthCookies(res, tokens);

    res.status(200).json({ message: '로그인 성공' });
  } catch (error) {
    next(error);
  }
});

// 로그아웃 API
authRouter.post('/logout', (req, res) => {
  clearAuthCookies(res);
  res.status(200).json({ message: '로그아웃 성공' });
});

// 내 정보 조회 API (인증 필요)
authRouter.get('/me', authMiddleware, (req, res) => {
  res.status(200).json(req.user);
});
