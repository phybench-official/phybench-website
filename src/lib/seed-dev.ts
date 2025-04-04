import { PrismaClient } from '@prisma/client';

// 生产环境数据库URL
const PRODUCTION_DATABASE_URL = process.env.PROD_DATABASE_URL;

// 开发环境数据库URL
const DEVELOPMENT_DATABASE_URL = process.env.DATABASE_URL;

if (!PRODUCTION_DATABASE_URL) {
  console.error('请设置环境变量 PRODUCTION_DATABASE_URL');
  process.exit(1);
}

if (!DEVELOPMENT_DATABASE_URL) {
  console.error('请设置环境变量 DATABASE_URL 作为开发环境数据库URL');
  process.exit(1);
}

// 创建连接到生产环境的Prisma Client
const productionPrisma = new PrismaClient({
  datasources: {
    db: {
      url: PRODUCTION_DATABASE_URL,
    },
  },
});

// 创建连接到开发环境的Prisma Client
const developmentPrisma = new PrismaClient();

async function seedDevDatabase() {
  console.log('开始从生产环境数据库导入数据到开发环境数据库...');

  try {
    // 从生产环境获取所有数据
    const users = await productionPrisma.user.findMany();
    const accounts = await productionPrisma.account.findMany();
    const sessions = await productionPrisma.session.findMany();
    const verificationTokens = await productionPrisma.verificationToken.findMany();
    const authenticators = await productionPrisma.authenticator.findMany();
    const problems = await productionPrisma.problem.findMany({
      include: {
        variables: true,
        aiPerformances: true,
        examiners: true,
      },
    });
    const scoreEvents = await productionPrisma.scoreEvent.findMany();

    console.log(`找到 ${users.length} 个用户`);
    console.log(`找到 ${problems.length} 个问题`);
    console.log(`找到 ${scoreEvents.length} 个积分事件`);

    // 清空开发环境数据库
    console.log('清空开发环境数据库...');
    await developmentPrisma.$transaction([
      developmentPrisma.scoreEvent.deleteMany(),
      developmentPrisma.aiPerformance.deleteMany(),
      developmentPrisma.problemVariable.deleteMany(),
      developmentPrisma.problem.deleteMany(),
      developmentPrisma.authenticator.deleteMany(),
      developmentPrisma.session.deleteMany(),
      developmentPrisma.verificationToken.deleteMany(),
      developmentPrisma.account.deleteMany(),
      developmentPrisma.user.deleteMany(),
    ]);

    // 导入数据到开发环境
    console.log('导入用户数据...');
    for (const user of users) {
      await developmentPrisma.user.create({
        data: {
          ...user,
          accounts: undefined,
          sessions: undefined,
          Authenticator: undefined,
          problems: undefined,
          examineProblems: undefined,
          offerProblems: undefined,
          scoreEvents: undefined,
        },
      });
    }

    console.log('导入账户数据...');
    for (const account of accounts) {
      await developmentPrisma.account.create({
        data: {
          ...account,
          user: undefined,
        },
      });
    }

    console.log('导入会话数据...');
    for (const session of sessions) {
      await developmentPrisma.session.create({
        data: {
          ...session,
          user: undefined,
        },
      });
    }

    console.log('导入验证令牌数据...');
    for (const token of verificationTokens) {
      await developmentPrisma.verificationToken.create({
        data: token,
      });
    }

    console.log('导入验证器数据...');
    for (const authenticator of authenticators) {
      await developmentPrisma.authenticator.create({
        data: {
          ...authenticator,
          user: undefined,
        },
      });
    }

    console.log('导入问题数据...');
    for (const problem of problems) {
      const { variables, aiPerformances, ...problemData } = problem;
      
      // 创建问题
      const createdProblem = await developmentPrisma.problem.create({
        data: {
          ...problemData,
          examiners: problem.examiners && problem.examiners.length > 0 ? {
            connect: problem.examiners.map(examiner => ({ id: examiner.id }))
          } : undefined,
          variables: undefined,
          aiPerformances: undefined,
          scoreEvents: undefined,
        },
      });

      // 创建问题变量
      if (variables && variables.length > 0) {
        for (const variable of variables) {
          await developmentPrisma.problemVariable.create({
            data: {
              ...variable,
              problemId: createdProblem.id,
              problem: undefined,
            },
          });
        }
      }

      // 创建AI表现
      if (aiPerformances && aiPerformances.length > 0) {
        for (const performance of aiPerformances) {
          await developmentPrisma.aiPerformance.create({
            data: {
              ...performance,
              problemId: createdProblem.id,
              problem: undefined,
            },
          });
        }
      }
    }

    console.log('导入积分事件数据...');
    for (const event of scoreEvents) {
      await developmentPrisma.scoreEvent.create({
        data: {
          ...event,
          user: undefined,
          problem: undefined,
        },
      });
    }

    console.log('数据导入成功！');

  } catch (error) {
    console.error('导入数据时出错:', error);
  } finally {
    await productionPrisma.$disconnect();
    await developmentPrisma.$disconnect();
  }
}

seedDevDatabase()
  .then(() => {
    console.log('开发环境数据库填充完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('发生错误:', error);
    process.exit(1);
  });
