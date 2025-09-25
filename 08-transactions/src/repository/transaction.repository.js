import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 1. 안전한 게시글 삭제 (댓글까지 함께)
async function deletePostWithComments(postId) {
  return await prisma.$transaction(async (tx) => {
    // 댓글 수 확인
    const commentCount = await tx.comment.count({ where: { postId } });

    // 댓글 삭제
    await tx.comment.deleteMany({ where: { postId } });

    // 게시글 삭제
    const deletedPost = await tx.post.delete({
      where: { id: postId },
      include: { author: { select: { name: true } } },
    });

    return {
      deletedPost,
      deletedCommentsCount: commentCount,
    };
  });
}

// 2. 게시글 + 첫 댓글 동시 생성
async function createPostWithComment(authorId, postData, commentContent) {
  return await prisma.$transaction(async (tx) => {
    const post = await tx.post.create({
      data: { ...postData, authorId },
      include: { author: { select: { name: true } } },
    });

    const comment = await tx.comment.create({
      data: {
        content: commentContent,
        authorId,
        postId: post.id,
      },
      include: { author: { select: { name: true } } },
    });

    return { post, comment };
  });
}

export const transactionRepository = {
  deletePostWithComments,
  createPostWithComment,
};
