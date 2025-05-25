/**
 * 模型导出索引
 * 统一导出所有模型类，方便其他模块使用
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

// 用户相关模型
export {
  AdminUserModel,
  AdminUserDTO
} from './user.js';

// 角色相关模型
export {
  RoleModel,
  RoleDTO,
  RoleSimpleDTO
} from './role.js';

// 权限相关模型
export {
  PermissionModel,
  PermissionDTO,
  MenuPermissionDTO,
  PermissionTreeNode
} from './permission.js';

// 部门相关模型
export {
  DepartmentModel,
  DepartmentDTO,
  DepartmentSimpleDTO,
  DepartmentTreeNode
} from './department.js';

/**
 * 模型使用说明：
 * 
 * 1. 实体模型 (Model)：
 *    - 扩展基础接口，添加业务方法
 *    - 用于业务逻辑处理
 *    - 提供数据验证和转换功能
 * 
 * 2. 数据传输对象 (DTO)：
 *    - 用于API响应的标准化数据格式
 *    - 包含额外的计算字段和状态信息
 *    - 支持数据脱敏和格式化
 * 
 * 3. 简化数据传输对象 (SimpleDTO)：
 *    - 用于下拉选择等简单场景
 *    - 只包含必要的字段
 *    - 减少数据传输量
 * 
 * 4. 树节点模型 (TreeNode)：
 *    - 用于树形结构的构建和操作
 *    - 提供树形数据的增删改查方法
 *    - 支持递归操作和深度计算
 * 
 * 使用示例：
 * 
 * ```typescript
 * import { AdminUserModel, AdminUserDTO } from '../models/index.js';
 * 
 * // 创建用户实体模型
 * const userModel = new AdminUserModel(userData);
 * 
 * // 检查用户状态
 * if (userModel.isActive()) {
 *   // 用户激活状态的业务逻辑
 * }
 * 
 * // 转换为DTO用于API响应
 * const userDTO = new AdminUserDTO(userData, {
 *   maskSensitiveData: true,
 *   roles: ['admin'],
 *   permissions: ['user:read']
 * });
 * ```
 */ 