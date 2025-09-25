import { prisma } from './index.js';

// 기본 CRUD 함수들 (04-crud-challenge 완성본)
async function createPost(data) {
  return await prisma.post.create({
    data: {
      title: data.title,
      content: data.content,
      authorId: data.authorId,
    },
  });
}

async function findAllPosts() {
  return await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

async function findPostById(id) {
  return await prisma.post.findUnique({
    where: { id: Number(id) },
  });
}

async function updatePost(id, data) {
  return await prisma.post.update({
    where: { id: Number(id) },
    data: {
      title: data.title,
      content: data.content,
    },
  });
}

async function deletePost(id) {
  return await prisma.post.delete({
    where: { id: Number(id) },
  });
}

export const postRepository = {
  createPost,
  findPostById,
  findAllPosts,
  updatePost,
  deletePost,
};