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

export const userRepository = {
  createUser,
  findUserById,
  findAllUsers,
  updateUser,
  deleteUser,
};