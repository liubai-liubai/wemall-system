<template>
  <div class="system-role">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">角色管理</h2>
        <p class="page-desc">管理系统角色和权限分配</p>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          添加角色
        </el-button>
      </div>
    </div>

    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="角色名称">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入角色名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="角色编码">
          <el-input
            v-model="searchForm.code"
            placeholder="请输入角色编码"
            clearable
            style="width: 200px"
          />
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
        <el-table-column prop="name" label="角色名称" width="150" />
        <el-table-column prop="code" label="角色编码" width="150" />
        <el-table-column prop="description" label="描述" min-width="200">
          <template #default="{ row }">
            {{ row.description || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="userCount" label="用户数量" width="100">
          <template #default="{ row }">
            <el-tag type="info">{{ row.userCount || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button type="primary" link size="small" @click="handleEdit(row)">
                编辑
              </el-button>
              <el-button type="warning" link size="small" @click="handlePermission(row)">
                权限分配
              </el-button>
              <el-button
                :type="row.status === 1 ? 'danger' : 'success'"
                link
                size="small"
                @click="handleToggleStatus(row)"
              >
                {{ row.status === 1 ? '禁用' : '启用' }}
              </el-button>
              <el-button type="danger" link size="small" @click="handleDelete(row)">
                删除
              </el-button>
            </div>
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

    <!-- 角色表单弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑角色' : '添加角色'"
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
            <el-form-item label="角色名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入角色名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色编码" prop="code">
              <el-input
                v-model="formData.code"
                placeholder="请输入角色编码"
                :disabled="isEdit"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="排序" prop="sort">
              <el-input-number
                v-model="formData.sort"
                :min="0"
                :max="999"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="formData.status">
                <el-radio :label="1">启用</el-radio>
                <el-radio :label="0">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="描述">
          <el-input
            v-model="formData.description"
            type="textarea"
            placeholder="请输入角色描述"
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

    <!-- 权限分配弹窗 -->
    <el-dialog
      v-model="permissionDialogVisible"
      title="权限分配"
      width="600px"
      @close="handlePermissionDialogClose"
    >
      <div class="permission-content">
        <div class="permission-header">
          <span class="role-name">角色：{{ currentRole?.name }}</span>
          <div class="tree-actions">
            <el-button size="small" @click="expandAllPermissions">展开所有</el-button>
            <el-button size="small" @click="collapseAllPermissions">折叠所有</el-button>
            <el-button size="small" @click="checkAllPermissions">全选</el-button>
            <el-button size="small" @click="uncheckAllPermissions">取消全选</el-button>
          </div>
        </div>
        
        <el-tree
          ref="permissionTreeRef"
          :data="permissionTree"
          show-checkbox
          node-key="id"
          :props="{ label: 'name', children: 'children' }"
          :default-checked-keys="checkedPermissions"
          class="permission-tree"
        />
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="permissionDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="permissionLoading" @click="handleSavePermissions">
            保存
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
/**
 * 角色管理页面
 * 提供角色的增删改查和权限分配功能
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import { Plus, Search, Refresh } from '@element-plus/icons-vue';
import { formatDateTime } from '@/utils';
import type { Role, Permission } from '@/types';
// 导入API接口
import { 
  getRoleList, 
  getAllRoles, 
  createRole, 
  updateRole, 
  deleteRole,
  getRolePermissionIds 
} from '@/api/role';
import { getPermissionTree } from '@/api/permission';

// 响应式数据
const loading = ref(false);
const dialogVisible = ref(false);
const permissionDialogVisible = ref(false);
const isEdit = ref(false);
const submitLoading = ref(false);
const permissionLoading = ref(false);
const formRef = ref<FormInstance>();
const permissionTreeRef = ref();

// 搜索表单
const searchForm = reactive({
  name: '',
  code: '',
  status: undefined as number | undefined,
});

// 分页数据
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0,
});

// 表格数据
const tableData = ref<Role[]>([]);
const selectedRows = ref<Role[]>([]);

// 表单数据
const formData = reactive({
  id: '',
  name: '',
  code: '',
  description: '',
  sort: 0,
  status: 1,
});

// 权限相关数据
const currentRole = ref<Role | null>(null);
const permissionTree = ref<Permission[]>([]);
const checkedPermissions = ref<string[]>([]);

// 表单验证规则
const formRules: FormRules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 50, message: '角色名称长度在2-50个字符', trigger: 'blur' },
  ],
  code: [
    { required: true, message: '请输入角色编码', trigger: 'blur' },
    { min: 2, max: 20, message: '角色编码长度在2-20个字符', trigger: 'blur' },
  ],
  sort: [
    { required: true, message: '请输入排序值', trigger: 'blur' },
  ],
};

// 获取角色列表
const fetchRoles = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.page,
      size: pagination.size,
      name: searchForm.name || undefined,
      code: searchForm.code || undefined,
      status: searchForm.status
    };
    
    const response = await getRoleList(params);
    if (response.code === 200 && response.data) {
      tableData.value = (response.data as any).list || [];
      pagination.total = (response.data as any).total || 0;
    } else {
      throw new Error(response.message || '获取角色列表失败');
    }
  } catch (error: any) {
    console.error('获取角色列表失败:', error);
    ElMessage.error(error.message || '获取角色列表失败');
    tableData.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
  }
};

// 获取权限树
const fetchPermissions = async () => {
  try {
    const response = await getPermissionTree();
    if (response.code === 200 && response.data) {
      // 将PermissionTreeNode转换为Permission类型
      const convertToPermission = (node: any): Permission => ({
        id: node.id,
        name: node.name,
        code: node.code,
        type: node.type,
        parentId: node.parentId,
        path: node.path,
        component: node.component,
        icon: node.icon,
        sort: node.sort || 0,
        status: node.status,
        children: node.children ? node.children.map(convertToPermission) : undefined,
        createdAt: node.createdAt || new Date().toISOString(),
        updatedAt: node.updatedAt || new Date().toISOString(),
      });
      
      permissionTree.value = response.data.map(convertToPermission);
    } else {
      throw new Error(response.message || '获取权限列表失败');
    }
  } catch (error: any) {
    console.error('获取权限列表失败:', error);
    ElMessage.error('获取权限列表失败');
  }
};

// 搜索处理
const handleSearch = () => {
  pagination.page = 1;
  fetchRoles();
};

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    name: '',
    code: '',
    status: undefined,
  });
  handleSearch();
};

// 分页处理
const handlePageChange = (page: number) => {
  pagination.page = page;
  fetchRoles();
};

const handleSizeChange = (size: number) => {
  pagination.size = size;
  pagination.page = 1;
  fetchRoles();
};

// 选择处理
const handleSelectionChange = (selection: Role[]) => {
  selectedRows.value = selection;
};

// 添加角色
const handleAdd = () => {
  isEdit.value = false;
  resetForm();
  dialogVisible.value = true;
};

// 编辑角色
const handleEdit = (row: Role) => {
  isEdit.value = true;
  Object.assign(formData, {
    id: row.id,
    name: row.name,
    code: row.code,
    description: row.description || '',
    sort: row.sort,
    status: row.status,
  });
  dialogVisible.value = true;
};

// 删除角色
const handleDelete = async (row: Role) => {
  try {
    await ElMessageBox.confirm(`确定要删除角色"${row.name}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    const response = await deleteRole(row.id);
    if (response.code === 200) {
      ElMessage.success('删除成功');
      fetchRoles();
    } else {
      throw new Error(response.message || '删除失败');
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除角色失败:', error);
      ElMessage.error(error.message || '删除失败');
    }
  }
};

// 切换状态
const handleToggleStatus = async (row: Role) => {
  const action = row.status === 1 ? '禁用' : '启用';
  try {
    await ElMessageBox.confirm(`确定要${action}该角色吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    const newStatus = row.status === 1 ? 0 : 1;
    const response = await updateRole(row.id, { status: newStatus });
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

// 权限分配
const handlePermission = async (row: Role) => {
  currentRole.value = row;
  
  try {
    // 获取角色的权限ID列表
    const response = await getRolePermissionIds(row.id);
    if (response.code === 200 && response.data) {
      checkedPermissions.value = response.data;
    } else {
      checkedPermissions.value = [];
    }
  } catch (error: any) {
    console.error('获取角色权限失败:', error);
    checkedPermissions.value = [];
  }
  
  permissionDialogVisible.value = true;
};

// 权限树操作
const expandAllPermissions = () => {
  if (permissionTreeRef.value) {
    // 递归展开所有权限节点
    const expandNode = (data: Permission[]) => {
      data.forEach(item => {
        permissionTreeRef.value.store.nodesMap[item.id]?.expand();
        if (item.children && item.children.length > 0) {
          expandNode(item.children);
        }
      });
    };
    expandNode(permissionTree.value);
    ElMessage.success('已展开所有权限');
  }
};

const collapseAllPermissions = () => {
  if (permissionTreeRef.value) {
    // 递归折叠所有权限节点
    const collapseNode = (data: Permission[]) => {
      data.forEach(item => {
        permissionTreeRef.value.store.nodesMap[item.id]?.collapse();
        if (item.children && item.children.length > 0) {
          collapseNode(item.children);
        }
      });
    };
    collapseNode(permissionTree.value);
    ElMessage.success('已折叠所有权限');
  }
};

const checkAllPermissions = () => {
  if (permissionTreeRef.value) {
    // 获取所有权限ID
    const getAllPermissionIds = (data: Permission[]): string[] => {
      const ids: string[] = [];
      data.forEach(item => {
        ids.push(item.id);
        if (item.children && item.children.length > 0) {
          ids.push(...getAllPermissionIds(item.children));
        }
      });
      return ids;
    };
    const allIds = getAllPermissionIds(permissionTree.value);
    permissionTreeRef.value.setCheckedKeys(allIds);
  }
};

const uncheckAllPermissions = () => {
  if (permissionTreeRef.value) {
    permissionTreeRef.value.setCheckedKeys([]);
  }
};

// 保存权限
const handleSavePermissions = async () => {
  if (!permissionTreeRef.value || !currentRole.value) return;
  
  try {
    permissionLoading.value = true;
    
    const checkedKeys = permissionTreeRef.value.getCheckedKeys();
    const halfCheckedKeys = permissionTreeRef.value.getHalfCheckedKeys();
    const allCheckedKeys = [...checkedKeys, ...halfCheckedKeys];
    
    // 调用API保存权限
    const response = await updateRole(currentRole.value.id, { 
      permissionIds: allCheckedKeys 
    });
    
    if (response.code === 200) {
      ElMessage.success('权限保存成功');
      permissionDialogVisible.value = false;
    } else {
      throw new Error(response.message || '权限保存失败');
    }
  } catch (error: any) {
    console.error('保存权限失败:', error);
    ElMessage.error(error.message || '权限保存失败');
  } finally {
    permissionLoading.value = false;
  }
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    submitLoading.value = true;

    const submitData = {
      name: formData.name,
      code: formData.code,
      description: formData.description,
      sort: formData.sort,
      status: formData.status,
      permissionIds: [] // 创建时暂时不分配权限，后续通过权限分配功能进行
    };

    let response;
    if (isEdit.value) {
      // 编辑时不修改权限，权限通过专门的权限分配功能修改
      const { permissionIds, ...updateData } = submitData;
      response = await updateRole(formData.id, updateData);
    } else {
      response = await createRole(submitData);
    }

    if (response.code === 200) {
      const action = isEdit.value ? '更新' : '创建';
      ElMessage.success(`${action}成功`);
      dialogVisible.value = false;
      fetchRoles();
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
    name: '',
    code: '',
    description: '',
    sort: 0,
    status: 1,
  });
};

// 弹窗关闭处理
const handleDialogClose = () => {
  resetForm();
  if (formRef.value) {
    formRef.value.clearValidate();
  }
};

// 权限弹窗关闭处理
const handlePermissionDialogClose = () => {
  currentRole.value = null;
  checkedPermissions.value = [];
};

// 初始化
onMounted(() => {
  fetchRoles();
  fetchPermissions();
});
</script>

<style lang="scss" scoped>
.system-role {
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

.permission-content {
  .permission-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid #eee;
    
    .role-name {
      font-weight: 500;
      color: #333;
    }
    
    .tree-actions {
      .el-button {
        margin-left: 8px;
      }
    }
  }
  
  .permission-tree {
    max-height: 400px;
    overflow-y: auto;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    padding: 8px;
  }
}

.dialog-footer {
  text-align: right;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: nowrap;
  min-width: 240px;
  
  .el-button {
    padding: 2px 6px;
    font-size: 12px;
    height: auto;
    min-height: 22px;
    white-space: nowrap;
    flex-shrink: 0;
    
    &.el-button--small {
      padding: 2px 6px;
    }
    
    // 进一步减少内边距
    &.el-button--text.is-link {
      padding: 2px 6px;
    }
  }
}
</style> 