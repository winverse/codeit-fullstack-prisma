# 05: 관계 쿼리와 N+1 문제

## 학습 목표
- `include`로 관계 데이터 조회하기
- N+1 문제 이해하고 해결하기  
- `select`로 필요한 필드만 조회하기

---
## 0. 조회하기 전에!
**`src/repository/user.repository.js`**
```javascript
// 사용자와 게시글 함께 조회
async function findUserWithPosts(id) {
  // 여기에 여러가지 방법이 들어갈 수 있음!
}
```


## 1. 관계 데이터 조회하기 (`include`)

```javascript
// 사용자와 작성한 게시글 함께 조회
const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: {
    posts: true, // 관계 데이터 포함
  },
});
```

```js
// 모든 유저의 게시글 조회하기
async function findUsersWithPosts() {

}
```

## 2. N+1 문제란?

**정의**: 1번의 쿼리로 해결할 수 있는 작업을 N+1번의 쿼리로 처리하는 성능 문제

### ❌ 잘못된 방법 (N+1 발생)
```javascript
// 사용자 10명이면 총 11번의 쿼리!
const users = await prisma.user.findMany(); // 1번

for (const user of users) {
  user.posts = await prisma.post.findMany({  // N번
    where: { authorId: user.id }
  });
}
```

### ✅ 올바른 방법 (include 사용)
```javascript
// 단 1번의 쿼리로 모든 데이터 조회
const users = await prisma.user.findMany({
  include: { posts: true }
});
```

### 성능 차이
| 사용자 수 | N+1 방식 | include 방식 | 개선 |
|-----------|----------|-------------|------|
| 10명      | 11번 쿼리 | 1번 쿼리     | 11배 |
| 100명     | 101번 쿼리 | 1번 쿼리     | 101배 |

---

## 3. 필드 선택하기 (`select`)

필요한 필드만 조회해서 성능을 더욱 향상시킬 수 있습니다.

### include vs select

```javascript
// include: 모든 필드 + 관계 데이터
const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: { posts: true } // User 모든 필드 + posts
});

// select: 특정 필드만 선택
const user = await prisma.user.findUnique({
  where: { id: 1 },
  select: { 
    id: true, 
    email: true,
    posts: true // 관계도 select 가능
  }
});
```

### 중첩 select로 최적화

```javascript
// 게시글과 작성자의 특정 필드만
const post = await prisma.post.findUnique({
  where: { id: 1 },
  include: {
    author: {
      select: { id: true, email: true } // 필요한 필드만
    }
  }
});
```

---

## 4. 실습 코드

### Repository 함수 추가

**`src/repository/user.repository.js`**
```javascript
// 사용자와 게시글 함께 조회
async function findUserWithPosts(id) {
  return await prisma.user.findUnique({
    where: { id },
    include: { posts: true },
  });
}

export const userRepository = {
  // ... 기존 함수들 ...
  findUserWithPosts,
};
```

### API 엔드포인트 추가

**`src/routes/users.js`**
```javascript
// 사용자와 게시글 조회
router.get('/:id/posts', async (req, res) => {
  const user = await userRepository.findUserWithPosts(parseInt(req.params.id));
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json(user);
});
```

---

## 5. 핵심 정리

### N+1 문제 체크리스트
- [ ] 반복문 안에서 쿼리를 실행하고 있나요?
- [ ] 관계 데이터 조회 시 `include`를 사용했나요?
- [ ] 한 번의 쿼리로 필요한 데이터를 모두 가져오나요?

### 성능 최적화 팁
1. **미리 계획하기**: 어떤 관계 데이터가 필요한지 사전 파악
2. **적절한 include**: 필요한 관계만 포함
3. **select 활용**: 불필요한 필드 제외
4. **쿼리 로그 확인**: 실제 실행되는 SQL 확인

---

## 다음 단계

`05-relations-challenge`에서 Comment 모델을 포함한 3-way 관계 쿼리를 실습해봅시다.