import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function createUser(data) {
  return await prisma.user.create({ data });
}

async function findUserById(id) {
  return await prisma.user.findUnique({
    where: { id: Number(id) },
    include: { posts: true },
  });
}

async function findAllUsers() {
  return await prisma.user.findMany({
    include: { posts: true },
  });
}

async function updateUser(id, data) {
  return await prisma.user.update({ where: { id: Number(id) }, data });
}

async function deleteUser(id) {
  return await prisma.user.delete({ where: { id: Number(id) } });
}

// 트랜잭션을 사용하여 유저와 포스트를 동시에 생성하는 함수
async function createUserAndPost(userData, postData) {
  return await prisma.$transaction(async (tx) => {
    // 1. 유저 생성
    const newUser = await tx.user.create({ data: userData });

    // 2. 생성된 유저의 ID를 사용하여 포스트 생성
    const newPost = await tx.post.create({
      data: {
        ...postData,
        authorId: newUser.id,
      },
    });

    return { newUser, newPost };
  });
}

export const userRepository = {
  createUser,
  findUserById,
  findAllUsers,
  updateUser,
  deleteUser,
  createUserAndPost,
};