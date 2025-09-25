# 03. 데이터베이스 

## 🚀 시작하기 전에

02-schema 단계에서 생성한 마이그레이션이 적용된 상태에서 진행합니다.(Database Seeding)

`02-schema`에서 마이그레이션을 적용하여 생성된 테이블에 테스트를 위한 초기 데이터를 삽입하는 방법을 배웁니다.

## 🎯 학습 목표

- `seed.js` 스크립트를 작성하여, 관계가 설정된 모델들의 초기 데이터를 데이터베이스에 삽입할 수 있다.
- `package.json`에 `seed` 스크립트를 등록하고 `npm run seed` 명령어로 실행할 수 있다.
- Faker.js를 활용하여 현실적인 더미 데이터를 생성할 수 있다.
- User-Post 관계가 있는 데이터를 체계적으로 생성하는 시딩 로직을 구현할 수 있다.

---

## 마이그레이션 적용하기

이미 생성된 마이그레이션 파일들을 새로운 데이터베이스에 적용하는 방법을 알아보겠습니다.

```bash
# 02-schema에서 작업을 이어서 하는 경우
# 마이그레이션 상태 확인
npx prisma migrate status

# 새로운 환경에서 시작하는 경우  
# .env 파일 설정 후 마이그레이션 적용 (자세한 방법은 02-schema 참고)
npx prisma migrate deploy
npx prisma generate
```

---

## 💻 이번 단계에서 추가된 코드

`02-schema` 단계의 코드에서, 아래 파일들이 추가/수정됩니다.

### `scripts/seed.js` (신규 생성)

Faker.js를 사용하여 현실적인 더미 데이터를 생성하는 스크립트입니다.

```bash
# Faker.js 설치 (개발 의존성으로)
npm install -D @faker-js/faker
```

```javascript
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
const prisma = new PrismaClient();

async function main() {
  const NUM_USERS_TO_CREATE = 5; // 생성할 유저 수
  console.log('🌱 시딩 시작...');

  // 랜덤 유저 생성
  const usersPromises = Array.from({ length: NUM_USERS_TO_CREATE }).map(() =>
    prisma.user.create({
      data: {
        email: faker.internet.email(),
        name: faker.person.fullName(),
      },
    }),
  );

  const users = await Promise.all(usersPromises);

  // 각 유저가 1-3개의 랜덤 포스트 작성
  for (const user of users) {
    const postCount = faker.number.int({ min: 1, max: 3 });
    const postPromises = Array.from({ length: postCount }).map(() =>
      prisma.post.create({
        data: {
          title: faker.lorem.sentence({ min: 3, max: 8 }),
          content: faker.lorem.paragraphs({ min: 2, max: 5 }, '\n\n'),
          authorId: user.id,
        },
      }),
    );

    await Promise.all(postPromises);
  }

  console.log(`✅ ${users.length}명의 유저가 생성되었습니다`);
  console.log('✅ 데이터 시딩 완료');
}

main()
  .catch((e) => {
    console.error('❌ 시딩 에러:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### `package.json` 수정

`npm run seed` 명령어로 시딩을 실행할 수 있도록 스크립트를 추가합니다.

```json
// package.json
{
  // ... 기존 내용
  "scripts": {
    "dev": "nodemon src/server.js",
    "format": "prettier --write .",
    "seed": "node scripts/seed.js"
  },
  // ...
}
```

---

## 📚 개념 정리

- **시딩 (Seeding)**: 비어있는 데이터베이스에 애플리케이션 테스트나 초기 운영에 필요한 데이터를 미리 채워 넣는 과정입니다. `npm run seed` 명령어를 실행하면, `package.json`에 지정된 스크립트를 실행하여 데이터를 삽입합니다.
- **Faker.js**: 다양한 종류의 가짜 데이터를 생성해주는 라이브러리입니다. 이름, 이메일, 문장, 숫자 등을 현실적으로 생성하여 테스트 데이터 작성에 유용합니다.
- **관계형 데이터 생성**: User와 Post처럼 관계가 있는 모델의 시드 데이터를 생성할 때는, 먼저 부모 데이터(User)를 생성한 후 자식 데이터(Post)에서 부모의 ID를 참조하는 방식으로 작성합니다.

---

## 🚀 실습 과정

### 1단계: Faker.js 설치 및 시딩

```bash
# Faker.js 설치
npm install -D @faker-js/faker

# 시딩 실행
npm run seed

# 결과 확인
# DBeaver에서 데이터 확인 (또는 npx prisma studio 사용 가능)
```

### 2단계: 데이터 확인

DBeaver에서 생성된 데이터를 확인하고, User-Post 관계가 제대로 설정되었는지 확인해보세요. (Prisma Studio 사용도 가능합니다)

---

## 🚀 다음 단계

이제 `03-migration-seeding-challenge` 폴더에서, `Comment` 모델을 포함한 전체 스키마를 마이그레이션하고, `Comment` 데이터까지 시딩 스크립트에 추가하는 실습을 진행합니다.