/**
 * 角色相关测试数据fixtures
 * @author 刘白 & AI Assistant
 */

export const mockRoles = {
  /**
   * 模拟超级管理员角色
   */
  superAdmin: {
    id: 'role_001',
    name: '超级管理员',
    code: 'super_admin',
    description: '系统超级管理员，拥有所有权限',
    sort: 0,
    status: 1,
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-01T00:00:00Z')
  },

  /**
   * 模拟商城管理员角色
   */
  mallAdmin: {
    id: 'role_002',
    name: '商城管理员',
    code: 'mall_admin',
    description: '商城业务管理员，管理商品、订单等',
    sort: 10,
    status: 1,
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-01T00:00:00Z')
  },

  /**
   * 模拟客服角色
   */
  customerService: {
    id: 'role_003',
    name: '客服专员',
    code: 'customer_service',
    description: '客服专员，处理用户咨询和售后',
    sort: 20,
    status: 1,
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-01T00:00:00Z')
  },

  /**
   * 模拟禁用角色
   */
  disabledRole: {
    id: 'role_004',
    name: '已禁用角色',
    code: 'disabled_role',
    description: '已禁用的角色',
    sort: 999,
    status: 0,
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-01T00:00:00Z')
  }
};

export const mockPermissions = {
  /**
   * 模拟用户管理权限
   */
  userManage: {
    id: 'perm_001',
    name: '用户管理',
    code: 'user:manage',
    type: 'menu',
    parent_id: null,
    path: '/user',
    component: 'UserManage',
    icon: 'user',
    sort: 10,
    status: 1,
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-01T00:00:00Z')
  },

  /**
   * 模拟商品管理权限
   */
  productManage: {
    id: 'perm_002',
    name: '商品管理',
    code: 'product:manage',
    type: 'menu',
    parent_id: null,
    path: '/product',
    component: 'ProductManage',
    icon: 'shopping',
    sort: 20,
    status: 1,
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-01T00:00:00Z')
  },

  /**
   * 模拟商品查看权限
   */
  productView: {
    id: 'perm_003',
    name: '查看商品',
    code: 'product:view',
    type: 'button',
    parent_id: 'perm_002',
    path: null,
    component: null,
    icon: null,
    sort: 1,
    status: 1,
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-01T00:00:00Z')
  },

  /**
   * 模拟商品编辑权限
   */
  productEdit: {
    id: 'perm_004',
    name: '编辑商品',
    code: 'product:edit',
    type: 'button',
    parent_id: 'perm_002',
    path: null,
    component: null,
    icon: null,
    sort: 2,
    status: 1,
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-01T00:00:00Z')
  }
};

export const mockRolePermissions = {
  /**
   * 超级管理员的权限关联
   */
  superAdminPermissions: [
    {
      id: 'rp_001',
      role_id: 'role_001',
      permission_id: 'perm_001',
      created_at: new Date('2024-01-01T00:00:00Z'),
      permission: mockPermissions.userManage
    },
    {
      id: 'rp_002',
      role_id: 'role_001',
      permission_id: 'perm_002',
      created_at: new Date('2024-01-01T00:00:00Z'),
      permission: mockPermissions.productManage
    },
    {
      id: 'rp_003',
      role_id: 'role_001',
      permission_id: 'perm_003',
      created_at: new Date('2024-01-01T00:00:00Z'),
      permission: mockPermissions.productView
    },
    {
      id: 'rp_004',
      role_id: 'role_001',
      permission_id: 'perm_004',
      created_at: new Date('2024-01-01T00:00:00Z'),
      permission: mockPermissions.productEdit
    }
  ],

  /**
   * 商城管理员的权限关联
   */
  mallAdminPermissions: [
    {
      id: 'rp_005',
      role_id: 'role_002',
      permission_id: 'perm_002',
      created_at: new Date('2024-01-01T00:00:00Z'),
      permission: mockPermissions.productManage
    },
    {
      id: 'rp_006',
      role_id: 'role_002',
      permission_id: 'perm_003',
      created_at: new Date('2024-01-01T00:00:00Z'),
      permission: mockPermissions.productView
    }
  ]
};

export const mockCreateRoleRequest = {
  /**
   * 有效的创建角色请求
   */
  valid: {
    name: '新角色',
    code: 'new_role',
    description: '新创建的角色',
    sort: 50,
    permissionIds: ['perm_003']
  },

  /**
   * 重复编码的创建角色请求
   */
  duplicateCode: {
    name: '重复角色',
    code: 'super_admin', // 与现有角色编码重复
    description: '编码重复的角色',
    sort: 60,
    permissionIds: []
  },

  /**
   * 无效权限ID的创建角色请求
   */
  invalidPermissions: {
    name: '无效权限角色',
    code: 'invalid_perm_role',
    description: '包含无效权限ID的角色',
    sort: 70,
    permissionIds: ['invalid_perm_id']
  }
};

export const mockUpdateRoleRequest = {
  /**
   * 有效的更新角色请求
   */
  valid: {
    name: '更新后的角色名',
    description: '更新后的描述',
    sort: 15,
    permissionIds: ['perm_002', 'perm_003']
  },

  /**
   * 重复名称的更新角色请求
   */
  duplicateName: {
    name: '商城管理员', // 与现有角色名重复
    description: '更新描述',
    sort: 25
  }
}; 