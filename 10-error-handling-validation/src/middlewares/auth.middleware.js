import { verifyToken } from '../utils/jwt.util.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const authMiddleware = async (req, res, next) => {
  try {
    // 1. 쿠키에서 Access Token 가져오기
    const { accessToken } = req.cookies;

    if (!accessToken) {
      return res.status(401).json({ message: '인증 정보가 없습니다.' });
    }

    // 2. Access Token 검증
    const payload = verifyToken(accessToken, 'access');

    if (!payload) {
      return res.status(401).json({ message: '인증 정보가 유효하지 않습니다.' });
    }

    // 3. 페이로드의 userId를 사용하여 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true }, // 비밀번호는 제외
    });

    if (!user) {
      return res.status(401).json({ message: '인증 정보와 일치하는 사용자가 없습니다.' });
    }

    // 4. req.user에 조회된 사용자 정보 저장
    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};
