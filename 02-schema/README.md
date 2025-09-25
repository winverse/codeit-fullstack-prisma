# 02. Prisma 스키마 설계

데이터베이스의 테이블 구조를 정의하는 Prisma 스키마 작성법을 배웁니다. 이 단계에서는 블로그의 핵심 데이터 모델인 `User`와 `Post`를 정의하고, 두 모델 간의 1:N ## 🔄 스키마 변경 및 마이그레이션 실습

이제 실제 개발에서 자주 발생하는 상황을 경험해봅시다. 스키마를 수정하고 마이그레이션을 적용하는 과정입니다.

### 시나리오: User 모델에 name 필드 추가

현재 `User` 모델에는 `email`만 있습니다. 사용자의 이름을 저장할 `name` 필드를 추가해보겠습니다.

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

// 👇 User 모델 추가 (name 필드는 나중에 마이그레이션으로 추가할 예정)
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
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

## ⚡ 스키마 적용하기

스키마를 정의한 후에는 반드시 아래 명령어들을 실행해야 합니다:

### 0. 환경 설정 (필수)

먼저 데이터베이스 연결을 위한 `.env` 파일을 프로젝트 루트에 생성하세요:

```bash
# .env 파일 생성
touch .env
```

`.env` 파일에 다음 내용을 추가하세요:

```env
# PostgreSQL 연결 URL (본인의 데이터베이스 정보에 맞게 수정)
DATABASE_URL="postgresql://username:password@localhost:5432/learn_prisma"

# 또는 비밀번호가 없는 경우
DATABASE_URL="postgresql://username@localhost:5432/learn_prisma"
```

### 1. Prisma Client 생성

```bash
npx prisma generate
```

- 정의한 스키마를 바탕으로 타입스크립트 타입이 포함된 Prisma Client를 생성합니다.
- 스키마를 변경할 때마다 반드시 실행해야 합니다.

### 2. 초기 마이그레이션 생성

```bash
npx prisma migrate dev --name init
```

- 정의한 스키마를 바탕으로 첫 번째 마이그레이션을 생성합니다.
- `prisma/migrations/` 폴더에 마이그레이션 파일이 생성됩니다.
- 데이터베이스에 테이블이 생성됩니다.
- 자동으로 `prisma generate`도 실행됩니다.

### 3. 적용 확인

DBeaver에서 생성된 테이블들을 확인해보세요. 또는 `npx prisma studio`를 실행하여 브라우저(`http://localhost:5555`)에서도 확인할 수 있습니다.

---

## 스키마 변경 및 마이그레이션 실습

이제 실제 개발에서 자주 발생하는 상황을 경험해봅시다. 스키마를 수정하고 마이그레이션을 적용하는 과정입니다.

이제 `db push`로 적용된 스키마를 마이그레이션 시스템으로 전환해보겠습니다. 현재 데이터베이스 상태를 마이그레이션으로 기록하기 위해 아래 명령어를 실행합니다:

```bash
# 현재 데이터베이스 상태를 기준으로 초기 마이그레이션 생성
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > init.sql

# 생성된 SQL을 마이그레이션으로 등록
npx prisma migrate resolve --applied init
```

> **💡 설명**: `db push`를 사용한 후 마이그레이션으로 전환할 때는 `migrate dev`를 바로 사용하면 데이터베이스가 리셋될 수 있습니다. 위 방법으로 안전하게 전환할 수 있습니다.

### 시나리오: User 모델에 name 필드 추가

현재 `User` 모델에는 `email`만 있습니다. 사용자의 이름을 저장할 `name` 필드를 추가해보겠습니다.

#### 1단계: 스키마 수정

`prisma/schema.prisma`의 `User` 모델을 다음과 같이 수정합니다:

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?  // 👈 새로 추가된 필드
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

#### 2단계: 마이그레이션 생성 및 적용

이제 `db push` 대신 **마이그레이션**을 사용해보겠습니다:

```bash
npx prisma migrate dev --name add-user-name
```

이 명령어는:

- 스키마 변경사항을 분석합니다
- `prisma/migrations/` 폴더에 마이그레이션 파일을 생성합니다
- 데이터베이스에 변경사항을 적용합니다
- 자동으로 `prisma generate`를 실행합니다

#### 3단계: 마이그레이션 확인

```bash
# 생성된 마이그레이션 파일 확인
ls -la prisma/migrations/

# DBeaver에서 변경된 스키마 확인 (또는 npx prisma studio 사용 가능)
```

### 🆚 `db push` vs `migrate dev` 비교

| 구분                  | `prisma db push`          | `prisma migrate dev`      |
| --------------------- | ------------------------- | ------------------------- |
| **용도**              | 개발 중 빠른 프로토타이핑 | 체계적인 스키마 버전 관리 |
| **마이그레이션 파일** | 생성하지 않음             | SQL 파일로 생성           |
| **운영 환경**         | 사용하지 않음             | 권장 방법                 |
| **협업**              | 팀원과 공유 어려움        | 마이그레이션 파일로 공유  |
| **롤백**              | 어려움                    | 가능                      |

### 📂 생성된 마이그레이션 파일 구조

```
prisma/
├── schema.prisma
├── .env
└── migrations/
    ├── migration_lock.toml
    ├── 20240925123456_init/
    │   └── migration.sql  (초기 테이블 생성 - name 필드 없음)
    └── 20240925124567_add_user_name/
        └── migration.sql  (name 필드 추가)
```

각 마이그레이션 파일에는 실제 SQL 명령어가 저장됩니다:

**초기 테이블 생성 (`20240925123456_init/migration.sql`)**:

```sql
-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
-- CreateTable, CreateIndex, AddForeignKey 등...
```

**name 필드 추가 (`20240925124567_add_user_name/migration.sql`)**:

```sql
-- AlterTable
ALTER TABLE "User" ADD COLUMN "name" TEXT;
```

---

## 🚀 마이그레이션 배포하기

개발이 완료된 마이그레이션을 다른 환경(운영 서버, 팀원 PC 등)에 적용하는 방법을 알아봅시다.

### 시나리오별 마이그레이션 적용

#### 시나리오 1: 개발 환경 (기존 프로젝트 계속 작업)

02-schema에서 작업을 이어서 계속하는 경우:

```bash
# 스키마 변경사항이 있다면 새 마이그레이션 생성
npx prisma migrate dev --name describe-your-changes
```

#### 시나리오 2: 새로운 환경 (빈 데이터베이스)

**팀원이 프로젝트를 clone했거나, 새로운 데이터베이스 환경을 설정하는 경우:**

```bash
# 1. 환경변수 설정
# .env 파일에 새로운 데이터베이스 URL 설정
DATABASE_URL="postgresql://username:password@localhost:5432/new_database"

# 2. 모든 마이그레이션을 순서대로 적용
npx prisma migrate deploy

# 3. Prisma Client 생성
npx prisma generate
```

### 🆚 `migrate dev` vs `migrate deploy` 차이점

| 명령어           | 용도                   | 환경             | 특징                                                                           |
| ---------------- | ---------------------- | ---------------- | ------------------------------------------------------------------------------ |
| `migrate dev`    | 개발 중 스키마 변경    | 개발 환경        | • 새 마이그레이션 생성<br>• 데이터베이스 리셋 가능<br>• 자동으로 generate 실행 |
| `migrate deploy` | 기존 마이그레이션 적용 | 프로덕션/새 환경 | • 마이그레이션 파일만 적용<br>• 안전한 배포용<br>• generate 별도 실행 필요     |

### 💡 마이그레이션 상태 확인

```bash
# 현재 마이그레이션 상태 확인
npx prisma migrate status

# 마이그레이션 히스토리 보기
npx prisma migrate diff --from-migrations ./prisma/migrations --to-schema-datamodel prisma/schema.prisma
```

> **💡 중요**: `db push`는 개발 초기 단계에서 빠른 실험용으로 사용하고, 스키마가 어느 정도 안정화되면 `migrate dev`로 전환하는 것이 좋습니다.

---

## 🚀 다음 단계

이제 `02-schema-challenge` 폴더에서, `User`와 `Post` 모델을 직접 만들어보고, 추가로 `Comment` 모델을 설계하여 스키마를 확장하는 실습을 진행합니다.
