import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDepartments() {
  try {
    console.log('开始测试departments查询...');
    
    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: {
            admin_users: true,
          },
        },
      },
      orderBy: [{ sort: 'asc' }, { created_at: 'asc' }],
    });
    
    console.log('查询成功，部门数量:', departments.length);
    console.log('部门数据:', JSON.stringify(departments, null, 2));
    
  } catch (error) {
    console.error('查询失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDepartments(); 