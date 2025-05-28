-- ===================================
-- 微信小程序商城系统 - 初始化数据
-- 创建超级管理员和基础权限数据
-- @author 刘白 & AI Assistant
-- @since 1.0.0
-- ===================================

-- 1. 创建根部门
INSERT INTO `departments` (`id`, `name`, `parent_id`, `leader_id`, `phone`, `email`, `sort`, `status`, `created_at`, `updated_at`) VALUES
('00000000-0000-0000-0000-000000000001', '总公司', NULL, NULL, '400-000-0000', 'admin@company.com', 1, 1, NOW(), NOW()),
('00000000-0000-0000-0000-000000000002', '技术部', '00000000-0000-0000-0000-000000000001', NULL, '400-000-0001', 'tech@company.com', 1, 1, NOW(), NOW()),
('00000000-0000-0000-0000-000000000003', '运营部', '00000000-0000-0000-0000-000000000001', NULL, '400-000-0002', 'ops@company.com', 2, 1, NOW(), NOW());

-- 2. 创建角色
INSERT INTO `roles` (`id`, `name`, `code`, `description`, `status`, `sort`, `created_at`, `updated_at`) VALUES
('00000000-0000-0000-0000-000000000001', '超级管理员', 'super_admin', '拥有系统全部权限的超级管理员角色', 1, 1, NOW(), NOW()),
('00000000-0000-0000-0000-000000000002', '系统管理员', 'admin', '系统管理员，拥有大部分管理权限', 1, 2, NOW(), NOW()),
('00000000-0000-0000-0000-000000000003', '运营管理员', 'operator', '运营管理员，主要负责商城运营相关功能', 1, 3, NOW(), NOW());

-- 3. 创建权限树 - 遵循菜单、按钮、接口三种类型
-- 3.1 一级菜单权限
INSERT INTO `permissions` (`id`, `name`, `code`, `type`, `parent_id`, `path`, `component`, `icon`, `sort`, `status`, `created_at`, `updated_at`) VALUES
-- 仪表盘
('10000000-0000-0000-0000-000000000001', '仪表盘', 'dashboard', 'menu', NULL, '/dashboard', 'Dashboard', 'Dashboard', 1, 1, NOW(), NOW()),
-- 系统管理
('20000000-0000-0000-0000-000000000001', '系统管理', 'system', 'menu', NULL, '/system', 'Layout', 'Setting', 2, 1, NOW(), NOW()),
-- 商城管理
('30000000-0000-0000-0000-000000000001', '商城管理', 'mall', 'menu', NULL, '/mall', 'Layout', 'ShoppingCart', 3, 1, NOW(), NOW());

-- 3.2 系统管理子菜单
INSERT INTO `permissions` (`id`, `name`, `code`, `type`, `parent_id`, `path`, `component`, `icon`, `sort`, `status`, `created_at`, `updated_at`) VALUES
-- 用户管理
('21000000-0000-0000-0000-000000000001', '用户管理', 'system:user', 'menu', '20000000-0000-0000-0000-000000000001', '/system/user', 'system/user/index', 'User', 1, 1, NOW(), NOW()),
-- 部门管理  
('22000000-0000-0000-0000-000000000001', '部门管理', 'system:department', 'menu', '20000000-0000-0000-0000-000000000001', '/system/department', 'system/department/index', 'OfficeBuilding', 2, 1, NOW(), NOW()),
-- 角色管理
('23000000-0000-0000-0000-000000000001', '角色管理', 'system:role', 'menu', '20000000-0000-0000-0000-000000000001', '/system/role', 'system/role/index', 'UserFilled', 3, 1, NOW(), NOW()),
-- 权限管理
('24000000-0000-0000-0000-000000000001', '权限管理', 'system:permission', 'menu', '20000000-0000-0000-0000-000000000001', '/system/permission', 'system/permission/index', 'Lock', 4, 1, NOW(), NOW());

-- 3.3 用户管理按钮权限
INSERT INTO `permissions` (`id`, `name`, `code`, `type`, `parent_id`, `path`, `component`, `icon`, `sort`, `status`, `created_at`, `updated_at`) VALUES
('21001000-0000-0000-0000-000000000001', '查看用户', 'system:user:view', 'button', '21000000-0000-0000-0000-000000000001', NULL, NULL, NULL, 1, 1, NOW(), NOW()),
('21002000-0000-0000-0000-000000000001', '新增用户', 'system:user:add', 'button', '21000000-0000-0000-0000-000000000001', NULL, NULL, NULL, 2, 1, NOW(), NOW()),
('21003000-0000-0000-0000-000000000001', '编辑用户', 'system:user:edit', 'button', '21000000-0000-0000-0000-000000000001', NULL, NULL, NULL, 3, 1, NOW(), NOW()),
('21004000-0000-0000-0000-000000000001', '删除用户', 'system:user:delete', 'button', '21000000-0000-0000-0000-000000000001', NULL, NULL, NULL, 4, 1, NOW(), NOW()),
('21005000-0000-0000-0000-000000000001', '重置密码', 'system:user:reset', 'button', '21000000-0000-0000-0000-000000000001', NULL, NULL, NULL, 5, 1, NOW(), NOW()),
('21006000-0000-0000-0000-000000000001', '分配角色', 'system:user:assign', 'button', '21000000-0000-0000-0000-000000000001', NULL, NULL, NULL, 6, 1, NOW(), NOW());

-- 3.4 部门管理按钮权限
INSERT INTO `permissions` (`id`, `name`, `code`, `type`, `parent_id`, `path`, `component`, `icon`, `sort`, `status`, `created_at`, `updated_at`) VALUES
('22001000-0000-0000-0000-000000000001', '查看部门', 'system:department:view', 'button', '22000000-0000-0000-0000-000000000001', NULL, NULL, NULL, 1, 1, NOW(), NOW()),
('22002000-0000-0000-0000-000000000001', '新增部门', 'system:department:add', 'button', '22000000-0000-0000-0000-000000000001', NULL, NULL, NULL, 2, 1, NOW(), NOW()),
('22003000-0000-0000-0000-000000000001', '编辑部门', 'system:department:edit', 'button', '22000000-0000-0000-0000-000000000001', NULL, NULL, NULL, 3, 1, NOW(), NOW()),
('22004000-0000-0000-0000-000000000001', '删除部门', 'system:department:delete', 'button', '22000000-0000-0000-0000-000000000001', NULL, NULL, NULL, 4, 1, NOW(), NOW());

-- 3.5 角色管理按钮权限
INSERT INTO `permissions` (`id`, `name`, `code`, `type`, `parent_id`, `path`, `component`, `icon`, `sort`, `status`, `created_at`, `updated_at`) VALUES
('23001000-0000-0000-0000-000000000001', '查看角色', 'system:role:view', 'button', '23000000-0000-0000-0000-000000000001', NULL, NULL, NULL, 1, 1, NOW(), NOW()),
('23002000-0000-0000-0000-000000000001', '新增角色', 'system:role:add', 'button', '23000000-0000-0000-0000-000000000001', NULL, NULL, NULL, 2, 1, NOW(), NOW()),
('23003000-0000-0000-0000-000000000001', '编辑角色', 'system:role:edit', 'button', '23000000-0000-0000-0000-000000000001', NULL, NULL, NULL, 3, 1, NOW(), NOW()),
('23004000-0000-0000-0000-000000000001', '删除角色', 'system:role:delete', 'button', '23000000-0000-0000-0000-000000000001', NULL, NULL, NULL, 4, 1, NOW(), NOW()),
('23005000-0000-0000-0000-000000000001', '分配权限', 'system:role:permission', 'button', '23000000-0000-0000-0000-000000000001', NULL, NULL, NULL, 5, 1, NOW(), NOW());

-- 3.6 权限管理按钮权限
INSERT INTO `permissions` (`id`, `name`, `code`, `type`, `parent_id`, `path`, `component`, `icon`, `sort`, `status`, `created_at`, `updated_at`) VALUES
('24001000-0000-0000-0000-000000000001', '查看权限', 'system:permission:view', 'button', '24000000-0000-0000-0000-000000000001', NULL, NULL, NULL, 1, 1, NOW(), NOW()),
('24002000-0000-0000-0000-000000000001', '新增权限', 'system:permission:add', 'button', '24000000-0000-0000-0000-000000000001', NULL, NULL, NULL, 2, 1, NOW(), NOW()),
('24003000-0000-0000-0000-000000000001', '编辑权限', 'system:permission:edit', 'button', '24000000-0000-0000-0000-000000000001', NULL, NULL, NULL, 3, 1, NOW(), NOW()),
('24004000-0000-0000-0000-000000000001', '删除权限', 'system:permission:delete', 'button', '24000000-0000-0000-0000-000000000001', NULL, NULL, NULL, 4, 1, NOW(), NOW());

-- 3.7 API接口权限
INSERT INTO `permissions` (`id`, `name`, `code`, `type`, `parent_id`, `path`, `component`, `icon`, `sort`, `status`, `created_at`, `updated_at`) VALUES
-- 用户管理API
('21100000-0000-0000-0000-000000000001', '用户列表API', 'api:admin-users:list', 'api', '21000000-0000-0000-0000-000000000001', NULL, NULL, NULL, 1, 1, NOW(), NOW()),
('21100000-0000-0000-0000-000000000002', '用户详情API', 'api:admin-users:detail', 'api', '21000000-0000-0000-0000-000000000001', NULL, NULL, NULL, 2, 1, NOW(), NOW()),
('21100000-0000-0000-0000-000000000003', '创建用户API', 'api:admin-users:create', 'api', '21000000-0000-0000-0000-000000000001', NULL, NULL, NULL, 3, 1, NOW(), NOW()),
('21100000-0000-0000-0000-000000000004', '更新用户API', 'api:admin-users:update', 'api', '21000000-0000-0000-0000-000000000001', NULL, NULL, NULL, 4, 1, NOW(), NOW()),
('21100000-0000-0000-0000-000000000005', '删除用户API', 'api:admin-users:delete', 'api', '21000000-0000-0000-0000-000000000001', NULL, NULL, NULL, 5, 1, NOW(), NOW()),
-- 部门管理API
('22100000-0000-0000-0000-000000000001', '部门列表API', 'api:departments:list', 'api', '22000000-0000-0000-0000-000000000001', NULL, NULL, NULL, 1, 1, NOW(), NOW()),
('22100000-0000-0000-0000-000000000002', '部门详情API', 'api:departments:detail', 'api', '22000000-0000-0000-0000-000000000001', NULL, NULL, NULL, 2, 1, NOW(), NOW()),
('22100000-0000-0000-0000-000000000003', '创建部门API', 'api:departments:create', 'api', '22000000-0000-0000-0000-000000000001', NULL, NULL, NULL, 3, 1, NOW(), NOW()),
('22100000-0000-0000-0000-000000000004', '更新部门API', 'api:departments:update', 'api', '22000000-0000-0000-0000-000000000001', NULL, NULL, NULL, 4, 1, NOW(), NOW()),
('22100000-0000-0000-0000-000000000005', '删除部门API', 'api:departments:delete', 'api', '22000000-0000-0000-0000-000000000001', NULL, NULL, NULL, 5, 1, NOW(), NOW()),
-- 角色管理API
('23100000-0000-0000-0000-000000000001', '角色列表API', 'api:roles:list', 'api', '23000000-0000-0000-0000-000000000001', NULL, NULL, NULL, 1, 1, NOW(), NOW()),
('23100000-0000-0000-0000-000000000002', '角色详情API', 'api:roles:detail', 'api', '23000000-0000-0000-0000-000000000001', NULL, NULL, NULL, 2, 1, NOW(), NOW()),
('23100000-0000-0000-0000-000000000003', '创建角色API', 'api:roles:create', 'api', '23000000-0000-0000-0000-000000000001', NULL, NULL, NULL, 3, 1, NOW(), NOW()),
('23100000-0000-0000-0000-000000000004', '更新角色API', 'api:roles:update', 'api', '23000000-0000-0000-0000-000000000001', NULL, NULL, NULL, 4, 1, NOW(), NOW()),
('23100000-0000-0000-0000-000000000005', '删除角色API', 'api:roles:delete', 'api', '23000000-0000-0000-0000-000000000001', NULL, NULL, NULL, 5, 1, NOW(), NOW()),
-- 权限管理API
('24100000-0000-0000-0000-000000000001', '权限列表API', 'api:permissions:list', 'api', '24000000-0000-0000-0000-000000000001', NULL, NULL, NULL, 1, 1, NOW(), NOW()),
('24100000-0000-0000-0000-000000000002', '权限详情API', 'api:permissions:detail', 'api', '24000000-0000-0000-0000-000000000001', NULL, NULL, NULL, 2, 1, NOW(), NOW()),
('24100000-0000-0000-0000-000000000003', '创建权限API', 'api:permissions:create', 'api', '24000000-0000-0000-0000-000000000001', NULL, NULL, NULL, 3, 1, NOW(), NOW()),
('24100000-0000-0000-0000-000000000004', '更新权限API', 'api:permissions:update', 'api', '24000000-0000-0000-0000-000000000001', NULL, NULL, NULL, 4, 1, NOW(), NOW()),
('24100000-0000-0000-0000-000000000005', '删除权限API', 'api:permissions:delete', 'api', '24000000-0000-0000-0000-000000000001', NULL, NULL, NULL, 5, 1, NOW(), NOW());

-- 4. 创建超级管理员用户 admin/password (密码使用bcrypt加密)
-- 密码: password -> $2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
INSERT INTO `admin_users` (`id`, `username`, `password`, `email`, `phone`, `real_name`, `department_id`, `status`, `created_at`, `updated_at`) VALUES
('00000000-0000-0000-0000-000000000001', 'admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@company.com', '13800000000', '超级管理员', '00000000-0000-0000-0000-000000000002', 1, NOW(), NOW());

-- 5. 分配超级管理员角色
INSERT INTO `admin_user_roles` (`id`, `user_id`, `role_id`, `created_at`) VALUES
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', NOW());

-- 6. 为超级管理员角色分配所有权限
INSERT INTO `role_permissions` (`id`, `role_id`, `permission_id`, `created_at`) 
SELECT 
    CONCAT('00000000-0000-0000-', LPAD(ROW_NUMBER() OVER (ORDER BY id), 12, '0')) as id,
    '00000000-0000-0000-0000-000000000001' as role_id,
    id as permission_id,
    NOW() as created_at
FROM `permissions` 
WHERE status = 1;

-- 7. 创建基础系统配置
INSERT INTO `system_configs` (`id`, `key`, `value`, `name`, `description`, `type`, `group`, `sort`, `is_public`, `created_at`, `updated_at`) VALUES
('00000000-0000-0000-0000-000000000001', 'system.name', '微信小程序商城管理系统', '系统名称', '系统显示名称', 'text', 'basic', 1, 1, NOW(), NOW()),
('00000000-0000-0000-0000-000000000002', 'system.version', '1.0.0', '系统版本', '当前系统版本号', 'text', 'basic', 2, 1, NOW(), NOW()),
('00000000-0000-0000-0000-000000000003', 'system.copyright', '© 2024 刘白 & AI Assistant', '版权信息', '系统版权信息', 'text', 'basic', 3, 1, NOW(), NOW()),
('00000000-0000-0000-0000-000000000004', 'security.password_length', '6', '密码最小长度', '用户密码最小长度要求', 'number', 'security', 1, 0, NOW(), NOW()),
('00000000-0000-0000-0000-000000000005', 'security.login_retry_times', '5', '登录重试次数', '登录失败最大重试次数', 'number', 'security', 2, 0, NOW(), NOW()),
('00000000-0000-0000-0000-000000000006', 'jwt.expires_in', '7d', 'JWT过期时间', 'JWT令牌过期时间', 'text', 'security', 3, 0, NOW(), NOW());

-- 8. 初始化完成提示
SELECT '=== 初始化数据创建完成 ===' as message;
SELECT '超级管理员账号: admin' as account;
SELECT '超级管理员密码: password' as password;
SELECT '请登录后及时修改默认密码!' as notice; 