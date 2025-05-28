<template>
  <div class="system-user">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">管理员用户</h2>
        <p class="page-desc">管理系统管理员账户信息</p>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          添加用户
        </el-button>
      </div>
    </div>

    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="用户名">
          <el-input
            v-model="searchForm.username"
            placeholder="请输入用户名"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="真实姓名">
          <el-input
            v-model="searchForm.realName"
            placeholder="请输入真实姓名"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="部门">
          <el-select
            v-model="searchForm.departmentId"
            placeholder="请选择部门"
            clearable
            style="width: 200px"
          >
            <el-option
              v-for="dept in departmentOptions"
              :key="dept.id"
              :label="dept.name"
              :value="dept.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 150px"
          >
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card" shadow="never">
      <el-table
        v-loading="loading"
        :data="tableData"
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="realName" label="真实姓名" width="120" />
        <el-table-column prop="email" label="邮箱" width="200" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="departmentName" label="部门" width="150" />
        <el-table-column prop="roleName" label="角色" width="150">
          <template #default="{ row }">
            <el-tag
              v-for="role in row.roles"
              :key="role.id"
              type="primary"
              size="small"
              style="margin-right: 4px"
            >
              {{ role.name }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastLoginTime" label="最后登录" width="160">
          <template #default="{ row }">
            {{ row.lastLoginTime ? formatDateTime(row.lastLoginTime) : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="warning" link @click="handleResetPassword(row)">
              重置密码
            </el-button>
            <el-button
              :type="row.status === 1 ? 'danger' : 'success'"
              link
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 用户表单弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑用户' : '添加用户'"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用户名" prop="username">
              <el-input
                v-model="formData.username"
                placeholder="请输入用户名"
                :disabled="isEdit"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="真实姓名" prop="realName">
              <el-input v-model="formData.realName" placeholder="请输入真实姓名" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="formData.email" placeholder="请输入邮箱" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="formData.phone" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="部门" prop="departmentId">
              <el-select
                v-model="formData.departmentId"
                placeholder="请选择部门"
                style="width: 100%"
              >
                <el-option
                  v-for="dept in departmentOptions"
                  :key="dept.id"
                  :label="dept.name"
                  :value="dept.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色" prop="roleIds">
              <el-select
                v-model="formData.roleIds"
                placeholder="请选择角色"
                multiple
                style="width: 100%"
              >
                <el-option
                  v-for="role in roleOptions"
                  :key="role.id"
                  :label="role.name"
                  :value="role.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item v-if="!isEdit" label="密码" prop="password">
          <el-input
            v-model="formData.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="备注">
          <el-input
            v-model="formData.remark"
            type="textarea"
            placeholder="请输入备注"
            :rows="3"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
/**
 * 管理员用户管理页面
 * 提供用户的增删改查功能
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import { Plus, Search, Refresh } from '@element-plus/icons-vue';
import { formatDateTime } from '@/utils';
import type { AdminUser, Department, Role } from '@/types';
// 导入API接口
import { 
  getAdminUserList, 
  createAdminUser, 
  updateAdminUser, 
  deleteAdminUser, 
  resetAdminUserPassword,
  toggleAdminUserStatus 
} from '@/api/admin-user';
import { getDepartmentTree } from '@/api/department';
import { getAllRoles } from '@/api/role';

// 响应式数据
const loading = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);
const submitLoading = ref(false);
const formRef = ref<FormInstance>();

// 搜索表单
const searchForm = reactive({
  username: '',
  realName: '',
  departmentId: '',
  status: undefined as number | undefined,
});

// 分页数据
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0,
});

// 表格数据
const tableData = ref<AdminUser[]>([]);
const selectedRows = ref<AdminUser[]>([]);

// 表单数据
const formData = reactive({
  id: '',
  username: '',
  realName: '',
  email: '',
  phone: '',
  departmentId: '',
  roleIds: [] as string[],
  password: '',
  status: 1,
  remark: '',
});

// 选项数据
const departmentOptions = ref<Department[]>([]);
const roleOptions = ref<Role[]>([]);

// 表单验证规则
const formRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在2-20个字符', trigger: 'blur' },
  ],
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' },
    { min: 2, max: 10, message: '姓名长度在2-10个字符', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
  ],
  departmentId: [
    { required: true, message: '请选择部门', trigger: 'change' },
  ],
  roleIds: [
    { required: true, message: '请选择角色', trigger: 'change' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在6-20个字符', trigger: 'blur' },
  ],
};

// 获取用户列表
const fetchUsers = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.page,
      size: pagination.size,
      username: searchForm.username || undefined,
      realName: searchForm.realName || undefined,
      departmentId: searchForm.departmentId || undefined,
      status: searchForm.status
    };
    
    const response = await getAdminUserList(params);
    if (response.code === 200 && response.data) {
      tableData.value = response.data.list || [];
      pagination.total = response.data.total || 0;
    } else {
      throw new Error(response.message || '获取用户列表失败');
    }
  } catch (error: any) {
    console.error('获取用户列表失败:', error);
    ElMessage.error(error.message || '获取用户列表失败');
    tableData.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
  }
};

// 获取部门选项
const fetchDepartments = async () => {
  try {
    const response = await getDepartmentTree();
    if (response.code === 200 && response.data) {
      // 将树形结构扁平化为选项列表
      const flattenDepartments = (departments: Department[]): Department[] => {
        const result: Department[] = [];
        departments.forEach(dept => {
          result.push(dept);
          if (dept.children && dept.children.length > 0) {
            result.push(...flattenDepartments(dept.children));
          }
        });
        return result;
      };
      departmentOptions.value = flattenDepartments(response.data);
    }
  } catch (error: any) {
    console.error('获取部门列表失败:', error);
    ElMessage.error('获取部门列表失败');
  }
};

// 获取角色选项
const fetchRoles = async () => {
  try {
    const response = await getAllRoles();
    if (response.code === 200 && response.data) {
      roleOptions.value = response.data;
    }
  } catch (error: any) {
    console.error('获取角色列表失败:', error);
    ElMessage.error('获取角色列表失败');
  }
};

// 搜索处理
const handleSearch = () => {
  pagination.page = 1;
  fetchUsers();
};

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    username: '',
    realName: '',
    departmentId: '',
    status: undefined,
  });
  handleSearch();
};

// 分页处理
const handlePageChange = (page: number) => {
  pagination.page = page;
  fetchUsers();
};

const handleSizeChange = (size: number) => {
  pagination.size = size;
  pagination.page = 1;
  fetchUsers();
};

// 选择处理
const handleSelectionChange = (selection: AdminUser[]) => {
  selectedRows.value = selection;
};

// 添加用户
const handleAdd = () => {
  isEdit.value = false;
  resetForm();
  dialogVisible.value = true;
};

// 编辑用户
const handleEdit = (row: AdminUser) => {
  isEdit.value = true;
  Object.assign(formData, {
    id: row.id,
    username: row.username,
    realName: row.realName,
    email: row.email,
    phone: row.phone,
    departmentId: row.departmentId,
    roleIds: row.roles?.map(r => r.id) || [],
    status: row.status,
    remark: row.remark || '',
    password: '',
  });
  dialogVisible.value = true;
};

// 删除用户
const handleDelete = async (row: AdminUser) => {
  try {
    await ElMessageBox.confirm(`确定要删除用户"${row.username}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    const response = await deleteAdminUser(row.id);
    if (response.code === 200) {
      ElMessage.success('删除成功');
      fetchUsers();
    } else {
      throw new Error(response.message || '删除失败');
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除用户失败:', error);
      ElMessage.error(error.message || '删除失败');
    }
  }
};

// 切换状态
const handleToggleStatus = async (row: AdminUser) => {
  const action = row.status === 1 ? '禁用' : '启用';
  try {
    await ElMessageBox.confirm(`确定要${action}该用户吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    const newStatus = row.status === 1 ? 0 : 1;
    const response = await toggleAdminUserStatus(row.id, newStatus);
    if (response.code === 200) {
      row.status = newStatus;
      ElMessage.success(`${action}成功`);
    } else {
      throw new Error(response.message || `${action}失败`);
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('切换状态失败:', error);
      ElMessage.error(error.message || `${action}失败`);
    }
  }
};

// 重置密码
const handleResetPassword = async (row: AdminUser) => {
  try {
    await ElMessageBox.confirm(`确定要重置用户"${row.username}"的密码吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    const response = await resetAdminUserPassword(row.id, '123456');
    if (response.code === 200) {
      ElMessage.success('密码重置成功，新密码为：123456');
    } else {
      throw new Error(response.message || '密码重置失败');
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('重置密码失败:', error);
      ElMessage.error(error.message || '密码重置失败');
    }
  }
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    submitLoading.value = true;

    const submitData = {
      username: formData.username,
      realName: formData.realName,
      email: formData.email,
      phone: formData.phone,
      departmentId: formData.departmentId,
      roleIds: formData.roleIds,
      status: formData.status,
      remark: formData.remark,
      ...(isEdit.value ? {} : { password: formData.password })
    };

    let response;
    if (isEdit.value) {
      response = await updateAdminUser(formData.id, submitData);
    } else {
      response = await createAdminUser(submitData);
    }

    if (response.code === 200) {
      const action = isEdit.value ? '更新' : '创建';
      ElMessage.success(`${action}成功`);
      dialogVisible.value = false;
      fetchUsers();
    } else {
      throw new Error(response.message || '操作失败');
    }
  } catch (error: any) {
    console.error('提交表单失败:', error);
    ElMessage.error(error.message || '操作失败');
  } finally {
    submitLoading.value = false;
  }
};

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    id: '',
    username: '',
    realName: '',
    email: '',
    phone: '',
    departmentId: '',
    roleIds: [],
    password: '',
    status: 1,
    remark: '',
  });
};

// 弹窗关闭处理
const handleDialogClose = () => {
  resetForm();
  if (formRef.value) {
    formRef.value.clearValidate();
  }
};

// 初始化
onMounted(() => {
  fetchUsers();
  fetchDepartments();
  fetchRoles();
});
</script>

<style lang="scss" scoped>
.system-user {
  padding: 0;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.header-left {
  flex: 1;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
}

.page-desc {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.search-card,
.table-card {
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
}

.search-form {
  :deep(.el-form-item) {
    margin-bottom: 16px;
  }
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.dialog-footer {
  text-align: right;
}
</style> 