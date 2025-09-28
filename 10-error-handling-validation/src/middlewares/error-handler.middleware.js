import { Prisma } from '@prisma/client';

export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Prisma의 특정 에러 코드 처리
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') { // Unique constraint failed
      const field = err.meta?.target?.[0];
      return res.status(409).json({ message: `${field}가 이미 사용 중입니다.` });
    }
  }

  // 기타 예상 가능한 에러 처리 (추후 확장 가능)
  // if (err instanceof CustomError) { ... }

  // 처리되지 않은 모든 에러
  res.status(500).json({ message: '서버 내부 오류가 발생했습니다.' });
};
