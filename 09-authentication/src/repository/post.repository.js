import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createPost(data) {
  return await prisma.post.create({ data });
}

async function findPostById(id) {
  return await prisma.post.findUnique({
    where: { id: Number(id) },
    include: { author: true },
  });
}

// findAllPosts 함수를 필터링, 정렬, 페이지네이션 옵션을 받도록 수정
async function findAllPosts(options) {
  const { where, orderBy, skip, take } = options;
  return await prisma.post.findMany({
    where,
    orderBy,
    skip,
    take,
    include: { author: true },
  });
}

async function updatePost(id, data) {
  return await prisma.post.update({ where: { id: Number(id) }, data });
}

async function deletePost(id) {
  return await prisma.post.delete({ where: { id: Number(id) } });
}

// 페이지네이션을 위한 전체 포스트 수 계산 함수
async function countPosts(where) {
  return await prisma.post.count({ where });
}

export const postRepository = {
  createPost,
  findPostById,
  findAllPosts,
  updatePost,
  deletePost,
  countPosts,
};