import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 새 댓글 생성
async function createComment(data) {
  return await prisma.comment.create({
    data: {
      content: data.content,
      postId: data.postId,
      authorId: data.authorId,
    },
    include: {
      author: true,
    },
  });
}

// 모든 댓글 조회 (작성자 정보 포함)
async function findAllComments() {
  return await prisma.comment.findMany({
    include: {
      author: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

// 특정 게시글의 댓글 목록 조회
async function findCommentsByPostId(postId) {
  return await prisma.comment.findMany({
    where: { postId: Number(postId) },
    include: {
      author: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

// ID로 특정 댓글 조회
async function findCommentById(id) {
  return await prisma.comment.findUnique({
    where: { id: Number(id) },
    include: {
      author: true,
      post: true,
    },
  });
}

// 댓글 수정
async function updateComment(id, data) {
  return await prisma.comment.update({
    where: { id: Number(id) },
    data: {
      content: data.content,
    },
    include: {
      author: true,
    },
  });
}

// 댓글 삭제
async function deleteComment(id) {
  return await prisma.comment.delete({
    where: { id: Number(id) },
  });
}

export const commentRepository = {
  createComment,
  findAllComments,
  findCommentsByPostId,
  findCommentById,
  updateComment,
  deleteComment,
};
