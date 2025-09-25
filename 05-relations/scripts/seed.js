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
  const allPosts = [];
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

    const userPosts = await Promise.all(postPromises);
    allPosts.push(...userPosts);
  }
  console.log(`✅ ${allPosts.length}개의 게시글이 생성되었습니다`);

  // 각 게시글에 0-5개의 랜덤 댓글 작성
  for (const post of allPosts) {
    const commentCount = faker.number.int({ min: 0, max: 5 });
    const commentPromises = Array.from({ length: commentCount }).map(() => {
      const randomUser = users[faker.number.int({ min: 0, max: users.length - 1 })];
      return prisma.comment.create({
        data: {
          content: faker.lorem.sentences({ min: 1, max: 3 }),
          authorId: randomUser.id,
          postId: post.id,
        },
      });
    });

    await Promise.all(commentPromises);
  }

  console.log(`✅ ${users.length}명의 유저가 생성되었습니다`);
  console.log('✅ 데이터 시딩 완료');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });