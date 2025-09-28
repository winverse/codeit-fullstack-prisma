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

// 1. 간단한 검색 - 댓글 내용이나 작성자 이름으로 검색
async function searchComments(search) {
  return await prisma.comment.findMany({
    where: {
      OR: [
        { content: { contains: search } },
        { author: { name: { contains: search } } },
      ],
    },
    include: {
      author: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

// 2. 간단한 페이지네이션
async function getCommentsWithPagination(page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      skip,
      take: limit,
      include: { author: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.comment.count(),
  ]);

  return {
    comments,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// 3. 복잡한 쿼리 - 댓글 + 작성자 + 게시글 정보
async function getCommentsWithDetails(postId) {
  return await prisma.comment.findMany({
    where: { postId: parseInt(postId) },
    include: {
      author: { select: { id: true, name: true } },
      post: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export const commentRepository = {
  createComment,
  findAllComments,
  findCommentsByPostId,
  findCommentById,
  updateComment,
  deleteComment,
  searchComments,
  getCommentsWithPagination,
  getCommentsWithDetails,
};
