import { DepartmentService } from './src/services/department-service.js';

async function testService() {
  try {
    console.log('开始测试DepartmentService...');
    
    const service = new DepartmentService();
    const result = await service.getDepartmentTree();
    
    console.log('Service调用成功:', result.length);
    
  } catch (error) {
    console.error('Service调用失败:', error.message);
    console.error('Stack:', error.stack);
  }
}

testService(); 