# 02. Prisma 스키마 설계

데이터베이스의 테이블 구조를 정의하는 Prisma 스키마 작성법을 배웁니다. 이 단계에서는 블로그의 핵심 데이터 모델인 `User`와 `Post`를 정의하고, 두 모델 간의 1:N 관계를 설정합니다.

## 🎯 학습 목표

- Prisma 스키마의 기본 구조(`generator`, `datasource`)를 이해한다.
- `model` 키워드를 사용하여 데이터베이스 테이블에 매핑될 모델을 정의할 수 있다.
- `String`, `Int`, `DateTime` 등 Prisma의 기본 데이터 타입을 사용할 수 있다.
- `@id`, `@default`, `@unique`, `@updatedAt` 등 필드 속성의 역할을 이해하고 적용할 수 있다.
- `@relation` 속성을 사용하여 모델 간의 1:N 관계를 설정할 수 있다.

---

## 💻 이번 단계에서 변경된 코드

`01-setup` 단계의 코드에서, `prisma/schema.prisma` 파일에 아래 모델들이 추가됩니다.

### `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 👇 User 모델 추가
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  posts     Post[] // 사용자가 작성한 게시글 목록 (1:N 관계)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// 👇 Post 모델 추가
model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  author    User     @relation(fields: [authorId], references: [id]) // 작성자 정보 (N:1 관계)
  authorId  Int      // 외래 키 (Foreign Key)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## 📚 개념 정리

- **`model`**: 데이터베이스의 테이블에 해당합니다. 모델의 각 필드는 테이블의 컬럼이 됩니다.
- **필드 속성(Attributes)**: `@` 기호로 시작하며, 필드의 동작이나 제약 조건을 정의합니다.
  - `@id`: 이 필드가 테이블의 Primary Key(기본 키)임을 나타냅니다.
  - `@default(...)`: 필드의 기본값을 설정합니다. `autoincrement()`는 숫자를 자동 증가시키고, `now()`는 현재 시간을 기록합니다.
  - `@unique`: 이 필드의 값은 테이블 내에서 항상 고유해야 함을 보장합니다.
  - `@updatedAt`: 레코드가 업데이트될 때마다 현재 시간으로 자동 업데이트됩니다.
- **관계(Relation)**: 모델 간의 연결을 정의합니다.
  - `posts Post[]`: `User` 모델에서 `Post` 모델을 배열 형태로 가질 때, 1:N 관계를 의미합니다.
  - `@relation(...)`: 관계의 상세 내용을 정의합니다. `fields`에는 현재 모델의 외래 키 필드를, `references`에는 상대 모델의 기본 키 필드를 지정합니다.

---

## 🚀 다음 단계

이제 `02-schema-challenge` 폴더에서, `User`와 `Post` 모델을 직접 만들어보고, 추가로 `Comment` 모델을 설계하여 스키마를 확장하는 실습을 진행합니다.