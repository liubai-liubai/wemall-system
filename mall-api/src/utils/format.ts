/**
 * 数据格式转换工具
 * 解决数据库字段命名(snake_case)和TypeScript接口(camelCase)的映射问题
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

/**
 * 将数据库字段格式转换为前端格式
 * @param data 数据库数据
 * @returns 转换后的数据
 */
export function formatDatabaseData<T = any>(data: any): T {
  if (!data) return data;
  
  if (Array.isArray(data)) {
    return data.map(item => formatDatabaseData(item)) as T;
  }
  
  if (data instanceof Date) {
    return data as T;
  }
  
  if (typeof data === 'object' && data.constructor === Object) {
    const formatted: any = {};
    
    Object.keys(data).forEach(key => {
      // 转换字段名
      const camelKey = toCamelCase(key);
      formatted[camelKey] = formatDatabaseData(data[key]);
    });
    
    return formatted;
  }
  
  return data;
}

/**
 * 将前端字段格式转换为数据库格式
 * @param data 前端数据
 * @returns 转换后的数据
 */
export function formatApiData<T = any>(data: any): T {
  if (!data) return data;
  
  if (Array.isArray(data)) {
    return data.map(item => formatApiData(item)) as T;
  }
  
  if (typeof data === 'object') {
    const formatted: any = {};
    
    Object.keys(data).forEach(key => {
      // 转换字段名
      const snakeKey = toSnakeCase(key);
      formatted[snakeKey] = formatApiData(data[key]);
    });
    
    return formatted;
  }
  
  return data;
}

/**
 * 将snake_case转换为camelCase
 * @param str snake_case字符串
 * @returns camelCase字符串
 */
function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * 将camelCase转换为snake_case
 * @param str camelCase字符串
 * @returns snake_case字符串
 */
function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * 格式化管理员用户数据
 * @param user 数据库用户数据
 * @returns 格式化后的用户数据
 */
export function formatAdminUser(user: any): any {
  if (!user) return null;
  
  const { password, admin_user_roles, ...userWithoutPassword } = user;
  
  return {
    ...formatDatabaseData(userWithoutPassword),
    roles: admin_user_roles ? admin_user_roles.map((aur: any) => formatDatabaseData(aur.role)) : [],
  };
}

/**
 * 格式化角色数据
 * @param role 数据库角色数据
 * @returns 格式化后的角色数据
 */
export function formatRole(role: any): any {
  if (!role) return null;
  
  const { role_permissions, _count, ...roleData } = role;
  
  return {
    ...formatDatabaseData(roleData),
    permissions: role_permissions ? role_permissions.map((rp: any) => formatDatabaseData(rp.permission)) : [],
    userCount: _count?.admin_user_roles || 0,
  };
}

/**
 * 格式化部门数据
 * @param department 数据库部门数据
 * @returns 格式化后的部门数据
 */
export function formatDepartment(department: any): any {
  if (!department) return null;
  
  const { _count, ...deptData } = department;
  
  return {
    ...formatDatabaseData(deptData),
    userCount: _count?.admin_users || 0,
  };
}

/**
 * 格式化权限数据
 * @param permission 数据库权限数据
 * @returns 格式化后的权限数据
 */
export function formatPermission(permission: any): any {
  if (!permission) return null;
  
  return formatDatabaseData(permission);
} 