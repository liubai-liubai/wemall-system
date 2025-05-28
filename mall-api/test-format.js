import { PrismaClient } from '@prisma/client';
import { formatDepartment } from './src/utils/format.js';

const prisma = new PrismaClient();

async function testFormat() {
  try {
    console.log('开始测试formatDepartment...');
    
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
    
    console.log('原始数据:', JSON.stringify(departments[0], null, 2));
    
    const formatted = formatDepartment(departments[0]);
    console.log('格式化后:', JSON.stringify(formatted, null, 2));
    
  } catch (error) {
    console.error('测试失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testFormat(); 