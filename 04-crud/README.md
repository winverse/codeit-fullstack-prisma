# 04: Prisma Client 기본: CRUD 마스터하기

`03-migration-seeding`에서 준비된 프로젝트를 기반으로, 데이터베이스 로직을 처리하는 **Repository**와 API 엔드포인트를 정의하는 **Router**를 구현합니다. 특히, 여러 라우터를 효율적으로 관리하기 위해 `routes/index.js`를 사용하는 확장성 있는 구조를 학습합니다.

---

## 🎯 목표

- Repository 패턴을 적용하여 데이터베이스 로직을 분리한다.
- `routes/index.js`를 통해 여러 라우터를 모듈화하고, 서버에 통합 등록할 수 있다.
- Express 라우터를 사용하여 CRUD API를 구현하고, Repository와 연결한다.

---

## 💻 이번 단계에서 추가/수정되는 코드

### 폴더 구조

```
src/
├── server.js          # 서버 설정 (수정)
├── repository/
│   └── user.repository.js  # User Repository (신규)
└── routes/
    ├── index.js       # 라우터 통합 (신규)
    └── users.js       # User 라우터 (신규)
```

---

## 1. Repository 패턴 구현

먼저 데이터베이스 로직을 담당하는 Repository를 구현합니다.

**`src/repository/user.repository.js`**

```javascript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createUser(data) {
  return await prisma.user.create({ data });
}

async function findUserById(id) {
  return await prisma.user.findUnique({ where: { id: Number(id) } });
}

async function findAllUsers() {
  return await prisma.user.findMany();
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
```

---

## 2. 라우터 구조

`src/routes` 폴더에 `index.js`를 두어 라우터들을 관리합니다. User 도메인 라우터는 `users.js`(복수형)로 명명하여 `/users` 리소스를 처리함을 명시합니다.

## 3. User 라우터 구현

**`src/routes/users.js`**

```javascript
import express from 'express';
import { userRepository } from '../repository/user.repository.js';

export const userRouter = express.Router();

// 모든 사용자 조회: GET /api/users
userRouter.get('/', async (req, res) => {
  try {
    const users = await userRepository.findAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// 특정 사용자 조회: GET /api/users/:id
userRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userRepository.findUserById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// 새 사용자 생성: POST /api/users
userRouter.post('/', async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const newUser = await userRepository.createUser({ email, name });
    res.status(201).json(newUser);
  } catch (error) {
    // if (error instanceof Prisma.PrismaClientKnownRequestError) {} 으로 처리 할수 있도록 next로 넘겨버리는게 잘쓰는 방법
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// 사용자 정보 수정: PUT /api/users/:id
userRouter.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email, name } = req.body;

    const updatedUser = await userRepository.updateUser(id, { email, name });
    res.json(updatedUser);
  } catch (error) {
    // if (error instanceof Prisma.PrismaClientKnownRequestError) {} 으로 처리 할수 있도록 next로 넘겨버리는게 잘쓰는 방법
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    }
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// 사용자 삭제: DELETE /api/users/:id
userRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await userRepository.deleteUser(id);
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(500).json({ error: 'Failed to delete user' });
  }
});
```

## 4. 통합 라우터 구현 (`src/routes/index.js`)

`users.js`에서 구현한 라우터를 가져와, `/users` 경로에 등록합니다. 앞으로 `posts.js` 등 다른 라우터가 생기면 이 파일에 추가하면 됩니다.

**`src/routes/index.js`**

```javascript
import express from 'express';
import { usersRouter } from './users.js';

export const router = express.Router();

// /api/users 경로에 users 라우터 연결
router.use('/users', usersRouter);

// 향후 다른 라우터들도 여기에 추가
// router.use('/posts', postsRouter);
// router.use('/comments', commentsRouter);
```

## 5. 서버에 통합 라우터 적용 (`src/server.js` 수정)

`server.js`는 이제 `routes/index.js` 하나만 import하여 `/api` 경로에 등록합니다.

**`src/server.js`**

```javascript
import express from 'express';
import { indexRouter as apiRouter } from './routes/index.js'; // 통합 라우터 import

const app = express();
const PORT = 3000;

app.use(express.json());
app.use('/api', apiRouter); // /api 경로에 등록

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
```

---

## 🚀 실습 과정

### 1단계: 폴더 구조 생성

```bash
# repository와 routes 폴더 생성
mkdir -p src/repository src/routes
```

### 2단계: Repository 구현

- `src/repository/user.repository.js` 파일 생성
- Prisma Client를 활용한 CRUD 메서드 구현

### 3단계: 라우터 구현

- `src/routes/users.js` - User API 엔드포인트 구현
- `src/routes/index.js` - 라우터 통합 관리

### 4단계: 서버 연결

- `src/server.js` 수정하여 API 라우터 연결

### 5단계: 테스트

```bash
# 서버 실행
npm run dev

# API 테스트 (Postman, 또는 curl 사용)
# 모든 사용자 조회
GET http://localhost:3000/api/users

# 특정 사용자 조회
GET http://localhost:3000/api/users/1

# 새 사용자 생성
POST http://localhost:3000/api/users
Content-Type: application/json

{
  "email": "newuser@example.com",
  "name": "New User"
}
```

## 📚 핵심 개념

- **Repository 패턴**: 데이터베이스 로직을 비즈니스 로직에서 분리하여 코드의 재사용성과 테스트 용이성을 높입니다.
- **라우터 모듈화**: 도메인별로 라우터를 분리하고 `index.js`에서 통합 관리하여 확장성을 확보합니다.
- **에러 핸들링**: Prisma 에러 코드(`P2002`, `P2025` 등)를 활용한 적절한 HTTP 상태 코드 반환
- **RESTful API**: HTTP 메서드와 경로를 활용한 직관적인 API 설계

---

## 🚀 다음 단계

이제 `04-crud-challenge` 폴더에서 Post Repository와 라우터를 추가로 구현하고, User-Post 관계를 활용한 고급 CRUD 작업을 실습합니다.
