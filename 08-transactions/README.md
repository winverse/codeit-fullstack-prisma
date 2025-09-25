# 강의: 08. 트랜잭션(Transactions) - 안전한 데이터 처리

**데이터 일관성을 보장**하는 트랜잭션 처리를 학습합니다. 두 가지 핵심 패턴을 통해 안전한 데이터 처리 방법을 익혀봅시다.

## 🎯 학습 목표

- 트랜잭션의 개념과 필요성을 이해할 수 있다.
- 게시글 삭제와 생성 시나리오에서 트랜잭션을 적용할 수 있다.

---

## 💡 트랜잭션이 필요한 이유

### 문제 상황: 게시글 삭제 시나리오

```javascript
// ❌ 위험한 코드: 트랜잭션 없이 순차 삭제
async function deletePostUnsafe(postId) {
  // 1. 댓글 삭제
  await prisma.comment.deleteMany({ where: { postId } });

  // 2. 게시글 삭제 (만약 여기서 에러가 발생하면?)
  await prisma.post.delete({ where: { id: postId } });

  // 결과: 댓글만 삭제되고 게시글은 남아있는 불일치 상태 발생!
}
```

### 해결책: 트랜잭션으로 안전하게 처리

```javascript
// ✅ 안전한 코드: 트랜잭션으로 원자적 처리
async function deletePostSafe(postId) {
  return await prisma.$transaction(async (tx) => {
    // 1. 댓글 삭제
    await tx.comment.deleteMany({ where: { postId } });

    // 2. 게시글 삭제
    const deletedPost = await tx.post.delete({ where: { id: postId } });

    return deletedPost;
    // 모든 작업이 성공하거나, 하나라도 실패하면 전체 롤백!
  });
}
```

---

## 📚 핵심 트랜잭션 패턴

### 1. 안전한 게시글 삭제 (src/repository/transaction.repository.js)

```javascript
// 게시글과 댓글을 함께 안전하게 삭제
async function deletePostWithComments(postId) {
  return await prisma.$transaction(async (tx) => {
    // 1. 댓글 수 확인
    const commentCount = await tx.comment.count({ where: { postId } });

    // 2. 댓글 삭제
    await tx.comment.deleteMany({ where: { postId } });

    // 3. 게시글 삭제
    const deletedPost = await tx.post.delete({ where: { id: postId } });

    return { deletedPost, deletedCommentsCount: commentCount };
  });
}
```

### 2. 게시글 + 댓글 동시 생성

```javascript
// 게시글과 첫 댓글을 함께 생성
async function createPostWithComment(authorId, postData, commentContent) {
  return await prisma.$transaction(async (tx) => {
    // 1. 게시글 생성
    const post = await tx.post.create({
      data: { ...postData, authorId },
    });

    // 2. 첫 댓글 생성
    const comment = await tx.comment.create({
      data: {
        content: commentContent,
        authorId,
        postId: post.id,
      },
    });

    return { post, comment };
  });
}
```

---

## 🔧 실제 구현

### `src/repository/transaction.repository.js`

```javascript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// 1. 안전한 게시글 삭제 (댓글까지 함께)
async function deletePostWithComments(postId) {
  return await prisma.$transaction(async (tx) => {
    const commentCount = await tx.comment.count({ where: { postId } });
    await tx.comment.deleteMany({ where: { postId } });
    const deletedPost = await tx.post.delete({ where: { id: postId } });
    return { deletedPost, deletedCommentsCount: commentCount };
  });
}

// 2. 게시글 + 첫 댓글 동시 생성
async function createPostWithComment(authorId, postData, commentContent) {
  return await prisma.$transaction(async (tx) => {
    const post = await tx.post.create({ data: { ...postData, authorId } });
    const comment = await tx.comment.create({
      data: { content: commentContent, authorId, postId: post.id },
    });
    return { post, comment };
  });
}

export const transactionRepository = {
  deletePostWithComments,
  createPostWithComment,
};
```

---

### `src/routes/transactions.js`

```javascript
import express from 'express';
import { transactionRepository } from '../repository/transaction.repository.js';

const router = express.Router();

// 1. 안전한 게시글 삭제
router.delete('/posts/:id', async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const result = await transactionRepository.deletePostWithComments(postId);
    res.json({
      message: '게시글과 댓글이 안전하게 삭제되었습니다.',
      ...result,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. 게시글 + 댓글 생성
router.post('/posts-with-comment', async (req, res) => {
  try {
    const { authorId, title, content, commentContent } = req.body;
    const result = await transactionRepository.createPostWithComment(
      authorId,
      { title, content, published: true },
      commentContent,
    );
    res
      .status(201)
      .json({ message: '게시글과 댓글이 함께 생성되었습니다.', ...result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export const transactionsRouter = router;
```

---

## 🧪 테스트

### 서버 실행

```bash
cd 08-transactions
npm install && npm run seed && npm run dev
```

### API 테스트

```bash
# 1. 게시글 + 댓글 생성
curl -X POST "http://localhost:3000/transactions/posts-with-comment" \
  -H "Content-Type: application/json" \
  -d '{
    "authorId": 1,
    "title": "트랜잭션 테스트",
    "content": "안전한 생성 테스트",
    "commentContent": "첫 댓글!"
  }'

# 2. 게시글 삭제 (댓글까지 함께)
curl -X DELETE "http://localhost:3000/transactions/posts/1"
```

---

## 📋 핵심 정리

### 트랜잭션이 필요한 이유

- **연관된 데이터 변경**: 게시글 삭제 시 댓글도 함께
- **데이터 일관성 보장**: 모든 작업이 성공하거나 모두 실패

### 주의사항

- 트랜잭션은 **최대한 짧게** 유지
- **외부 API 호출 금지**
- DB 작업만 포함

---

## 🎉 다음 단계

**09장 Production**에서는 실제 배포를 위한 최적화를 학습합니다. 🚀
