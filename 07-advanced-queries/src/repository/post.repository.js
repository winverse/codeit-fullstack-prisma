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

// === 고급 쿼리 함수들 ===

// 1. 간단한 검색 - 제목 또는 작성자 이름으로 검색
async function searchPosts(search = '') {
  if (!search) {
    return await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { name: true, email: true } },
        _count: { select: { comments: true } },
      },
    });
  }

  return await prisma.post.findMany({
    where: {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { name: { contains: search, mode: 'insensitive' } } },
      ],
    },
    orderBy: { createdAt: 'desc' },
    include: {
      author: { select: { name: true, email: true } },
      _count: { select: { comments: true } },
    },
  });
}

// 기본 페이지네이션 함수
async function getPostsWithPagination(page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  const [posts, totalCount] = await Promise.all([
    prisma.post.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { name: true, email: true } },
        _count: { select: { comments: true } },
      },
    }),
    prisma.post.count(),
  ]);

  return {
    posts,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      hasNext: page < Math.ceil(totalCount / limit),
    },
  };
}

// 인기 게시글 조회 (댓글 수 기준)
async function getPopularPosts(limit = 5) {
  return await prisma.post.findMany({
    take: limit,
    orderBy: {
      comments: { _count: 'desc' },
    },
    include: {
      author: { select: { name: true, email: true } },
      _count: { select: { comments: true } },
    },
  });
}

export const postRepository = {
  createPost,
  findPostById,
  findAllPosts,
  updatePost,
  deletePost,
  // 고급 쿼리 함수들 (README.md 기준)
  searchPosts,
  getPostsWithPagination,
  getPopularPosts,
};
