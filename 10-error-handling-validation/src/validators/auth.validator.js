import { z } from 'zod';

export const signUpSchema = z.object({
  email: z.string().email({ message: '유효한 이메일 형식이 아닙니다.' }),
  password: z.string().min(6, { message: '비밀번호는 6자 이상이어야 합니다.' }),
  name: z.string().min(2, { message: '이름은 2자 이상이어야 합니다.' }).optional(),
});
