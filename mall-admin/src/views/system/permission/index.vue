<template>
  <div class="system-permission">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">权限管理</h2>
        <p class="page-desc">管理系统菜单权限和操作权限</p>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          添加权限
        </el-button>
        <el-button @click="expandAll">
          <el-icon><Expand /></el-icon>
          展开所有
        </el-button>
        <el-button @click="collapseAll">
          <el-icon><Fold /></el-icon>
          折叠所有
        </el-button>
      </div>
    </div>

    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="权限名称">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入权限名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="权限编码">
          <el-input
            v-model="searchForm.code"
            placeholder="请输入权限编码"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="权限类型">
          <el-select
            v-model="searchForm.type"
            placeholder="请选择权限类型"
            clearable
            style="width: 150px"
          >
            <el-option label="菜单" value="menu" />
            <el-option label="按钮" value="button" />
            <el-option label="接口" value="api" />
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
        ref="tableRef"
        v-loading="loading"
        :data="tableData"
        row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="权限名称" min-width="200">
          <template #default="{ row }">
            <span class="permission-name">
              <el-icon v-if="row.icon" class="permission-icon">
                <component :is="row.icon" />
              </el-icon>
              {{ row.name }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="code" label="权限编码" width="200" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag
              :type="getTypeTagType(row.type)"
              size="small"
            >
              {{ getTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="path" label="路由路径" width="200">
          <template #default="{ row }">
            {{ row.path || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="component" label="组件" width="200">
          <template #default="{ row }">
            {{ row.component || '-' }}
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
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="success" link @click="handleAddChild(row)">
              添加子权限
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
    </el-card>

    <!-- 权限表单弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="700px"
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
            <el-form-item label="权限名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入权限名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="权限编码" prop="code">
              <el-input v-model="formData.code" placeholder="请输入权限编码" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="权限类型" prop="type">
              <el-select
                v-model="formData.type"
                placeholder="请选择权限类型"
                style="width: 100%"
                @change="handleTypeChange"
              >
                <el-option label="菜单" value="menu" />
                <el-option label="按钮" value="button" />
                <el-option label="接口" value="api" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="上级权限" prop="parentId">
              <el-tree-select
                v-model="formData.parentId"
                :data="permissionTree"
                placeholder="请选择上级权限"
                check-strictly
                :render-after-expand="false"
                style="width: 100%"
                node-key="id"
                :props="{ label: 'name', children: 'children' }"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row v-if="formData.type === 'menu'" :gutter="20">
          <el-col :span="12">
            <el-form-item label="路由路径" prop="path">
              <el-input v-model="formData.path" placeholder="请输入路由路径" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="组件路径" prop="component">
              <el-input v-model="formData.component" placeholder="请输入组件路径" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item v-if="formData.type === 'menu'" label="图标" prop="icon">
              <el-input v-model="formData.icon" placeholder="请输入图标名称">
                <template #prepend>
                  <el-icon v-if="formData.icon">
                    <component :is="formData.icon" />
                  </el-icon>
                  <span v-else>图标</span>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
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
        </el-row>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="formData.type === 'menu'" label="是否隐藏">
          <el-switch v-model="formData.hidden" />
          <span class="form-tip">隐藏的菜单不会在侧边栏显示</span>
        </el-form-item>

        <el-form-item v-if="formData.type === 'menu'" label="是否缓存">
          <el-switch v-model="formData.keepAlive" />
          <span class="form-tip">开启后页面会被缓存</span>
        </el-form-item>

        <el-form-item label="备注">
          <el-input
            v-model="formData.remark"
            type="textarea"
            placeholder="请输入备注信息"
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
 * 权限管理页面
 * 提供权限的树形结构管理功能
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import { Plus, Search, Refresh, Expand, Fold } from '@element-plus/icons-vue';
import { formatDateTime, buildTree } from '@/utils';
import type { Permission } from '@/types';
// 导入API接口
import { 
  getPermissionTree, 
  createPermission, 
  updatePermission, 
  deletePermission 
} from '@/api/permission';

// 响应式数据
const loading = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);
const parentPermission = ref<Permission | null>(null);
const submitLoading = ref(false);
const formRef = ref<FormInstance>();
const tableRef = ref();

// 搜索表单
const searchForm = reactive({
  name: '',
  code: '',
  type: '',
  status: undefined as number | undefined,
});

// 表格数据
const tableData = ref<Permission[]>([]);
const selectedRows = ref<Permission[]>([]);
const permissionList = ref<Permission[]>([]);

// 表单数据
const formData = reactive({
  id: '',
  name: '',
  code: '',
  type: 'menu' as 'menu' | 'button' | 'api',
  parentId: '',
  path: '',
  component: '',
  icon: '',
  sort: 0,
  status: 1,
  hidden: false,
  keepAlive: false,
  remark: '',
});

// 弹窗标题
const dialogTitle = computed(() => {
  if (parentPermission.value) {
    return `为 ${parentPermission.value.name} 添加子权限`;
  }
  return isEdit.value ? '编辑权限' : '添加权限';
});

// 权限树形数据（用于选择上级权限）
const permissionTree = computed(() => {
  const tree = buildTree(permissionList.value, {
    id: 'id',
    parentId: 'parentId',
    children: 'children'
  });
  // 如果是编辑模式，需要过滤掉当前权限及其子权限
  if (isEdit.value && formData.id) {
    return filterCurrentPermission(tree, formData.id);
  }
  return tree;
});

// 表单验证规则
const formRules: FormRules = {
  name: [
    { required: true, message: '请输入权限名称', trigger: 'blur' },
    { min: 2, max: 50, message: '权限名称长度在2-50个字符', trigger: 'blur' },
  ],
  code: [
    { required: true, message: '请输入权限编码', trigger: 'blur' },
    { min: 2, max: 50, message: '权限编码长度在2-50个字符', trigger: 'blur' },
  ],
  type: [
    { required: true, message: '请选择权限类型', trigger: 'change' },
  ],
  sort: [
    { required: true, message: '请输入排序值', trigger: 'blur' },
  ],
  path: [
    { required: true, message: '请输入路由路径', trigger: 'blur' },
  ],
};

// 获取类型标签类型
const getTypeTagType = (type: string) => {
  const typeMap = {
    menu: 'primary',
    button: 'success',
    api: 'warning',
  };
  return typeMap[type as keyof typeof typeMap] || 'info';
};

// 获取类型标签文本
const getTypeLabel = (type: string) => {
  const typeMap = {
    menu: '菜单',
    button: '按钮',
    api: '接口',
  };
  return typeMap[type as keyof typeof typeMap] || type;
};

// 过滤当前权限及其子权限（编辑时不能选择自己或子权限作为上级）
const filterCurrentPermission = (tree: Permission[], currentId: string): Permission[] => {
  return tree.filter(permission => {
    if (permission.id === currentId) {
      return false;
    }
    if (permission.children) {
      permission.children = filterCurrentPermission(permission.children, currentId);
    }
    return true;
  });
};

// 获取权限列表
const fetchPermissions = async () => {
  loading.value = true;
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
        hidden: node.hidden || false,
        keepAlive: node.keepAlive || false,
        remark: node.remark || '',
        children: node.children ? node.children.map(convertToPermission) : undefined,
        createdAt: node.createdAt || new Date().toISOString(),
        updatedAt: node.updatedAt || new Date().toISOString(),
      });

      const permissions = response.data.map(convertToPermission);
      
      // 先保存完整的权限列表（扁平化）
      const flattenPermissions = (permissions: Permission[]): Permission[] => {
        const result: Permission[] = [];
        permissions.forEach(perm => {
          result.push(perm);
          if (perm.children && perm.children.length > 0) {
            result.push(...flattenPermissions(perm.children));
          }
        });
        return result;
      };
      
      permissionList.value = flattenPermissions(permissions);
      
      // 应用搜索过滤
      let filteredData = [...permissions];
      if (searchForm.name) {
        const filterByName = (permissions: Permission[]): Permission[] => {
          return permissions.filter(perm => {
            const match = perm.name.includes(searchForm.name);
            if (perm.children) {
              perm.children = filterByName(perm.children);
              return match || perm.children.length > 0;
            }
            return match;
          });
        };
        filteredData = filterByName(filteredData);
      }
      
      if (searchForm.code) {
        const filterByCode = (permissions: Permission[]): Permission[] => {
          return permissions.filter(perm => {
            const match = perm.code.includes(searchForm.code);
            if (perm.children) {
              perm.children = filterByCode(perm.children);
              return match || perm.children.length > 0;
            }
            return match;
          });
        };
        filteredData = filterByCode(filteredData);
      }
      
      if (searchForm.type) {
        const filterByType = (permissions: Permission[]): Permission[] => {
          return permissions.filter(perm => {
            const match = perm.type === searchForm.type;
            if (perm.children) {
              perm.children = filterByType(perm.children);
              return match || perm.children.length > 0;
            }
            return match;
          });
        };
        filteredData = filterByType(filteredData);
      }
      
      if (searchForm.status !== undefined) {
        const filterByStatus = (permissions: Permission[]): Permission[] => {
          return permissions.filter(perm => {
            const match = perm.status === searchForm.status;
            if (perm.children) {
              perm.children = filterByStatus(perm.children);
              return match || perm.children.length > 0;
            }
            return match;
          });
        };
        filteredData = filterByStatus(filteredData);
      }
      
      tableData.value = filteredData;
    } else {
      throw new Error(response.message || '获取权限列表失败');
    }
  } catch (error: any) {
    console.error('获取权限列表失败:', error);
    ElMessage.error(error.message || '获取权限列表失败');
    permissionList.value = [];
    tableData.value = [];
  } finally {
    loading.value = false;
  }
};

// 搜索处理
const handleSearch = () => {
  fetchPermissions();
};

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    name: '',
    code: '',
    type: '',
    status: undefined,
  });
  handleSearch();
};

// 展开所有
const expandAll = () => {
  if (tableRef.value) {
    // 递归展开所有节点
    const expandNode = (data: Permission[]) => {
      data.forEach(item => {
        tableRef.value.toggleRowExpansion(item, true);
        if (item.children && item.children.length > 0) {
          expandNode(item.children);
        }
      });
    };
    expandNode(tableData.value);
    ElMessage.success('已展开所有权限');
  }
};

// 折叠所有
const collapseAll = () => {
  if (tableRef.value) {
    // 递归折叠所有节点
    const collapseNode = (data: Permission[]) => {
      data.forEach(item => {
        tableRef.value.toggleRowExpansion(item, false);
        if (item.children && item.children.length > 0) {
          collapseNode(item.children);
        }
      });
    };
    collapseNode(tableData.value);
    ElMessage.success('已折叠所有权限');
  }
};

// 选择处理
const handleSelectionChange = (selection: Permission[]) => {
  selectedRows.value = selection;
};

// 添加权限
const handleAdd = () => {
  isEdit.value = false;
  parentPermission.value = null;
  resetForm();
  dialogVisible.value = true;
};

// 添加子权限
const handleAddChild = (row: Permission) => {
  isEdit.value = false;
  parentPermission.value = row;
  resetForm();
  formData.parentId = row.id;
  // 根据父级类型设置子级类型
  if (row.type === 'menu') {
    formData.type = 'menu';
  } else {
    formData.type = 'button';
  }
  dialogVisible.value = true;
};

// 编辑权限
const handleEdit = (row: Permission) => {
  isEdit.value = true;
  parentPermission.value = null;
  Object.assign(formData, {
    id: row.id,
    name: row.name,
    code: row.code,
    type: row.type,
    parentId: row.parentId || '',
    path: row.path || '',
    component: row.component || '',
    icon: row.icon || '',
    sort: row.sort,
    status: row.status,
    hidden: row.hidden || false,
    keepAlive: row.keepAlive || false,
    remark: row.remark || '',
  });
  dialogVisible.value = true;
};

// 删除权限
const handleDelete = async (row: Permission) => {
  try {
    await ElMessageBox.confirm(`确定要删除权限"${row.name}"吗？删除后将同时删除其所有子权限。`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    const response = await deletePermission(row.id);
    if (response.code === 200) {
      ElMessage.success('删除成功');
      fetchPermissions();
    } else {
      throw new Error(response.message || '删除失败');
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除权限失败:', error);
      ElMessage.error(error.message || '删除失败');
    }
  }
};

// 切换状态
const handleToggleStatus = async (row: Permission) => {
  const action = row.status === 1 ? '禁用' : '启用';
  try {
    await ElMessageBox.confirm(`确定要${action}该权限吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    const newStatus = row.status === 1 ? 0 : 1;
    const response = await updatePermission(row.id, { status: newStatus });
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

// 权限类型变更处理
const handleTypeChange = (type: string) => {
  // 如果是按钮或接口类型，清空路由和组件相关字段
  if (type !== 'menu') {
    formData.path = '';
    formData.component = '';
    formData.icon = '';
    formData.hidden = false;
    formData.keepAlive = false;
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
      type: formData.type,
      parentId: formData.parentId || undefined,
      path: formData.path || undefined,
      component: formData.component || undefined,
      icon: formData.icon || undefined,
      sort: formData.sort,
      status: formData.status,
    };

    let response;
    if (isEdit.value) {
      response = await updatePermission(formData.id, submitData);
    } else {
      response = await createPermission(submitData);
    }

    if (response.code === 200) {
      const action = isEdit.value ? '更新' : '创建';
      ElMessage.success(`${action}成功`);
      dialogVisible.value = false;
      fetchPermissions();
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
    type: 'menu',
    parentId: '',
    path: '',
    component: '',
    icon: '',
    sort: 0,
    status: 1,
    hidden: false,
    keepAlive: false,
    remark: '',
  });
};

// 弹窗关闭处理
const handleDialogClose = () => {
  resetForm();
  parentPermission.value = null;
  if (formRef.value) {
    formRef.value.clearValidate();
  }
};

// 初始化
onMounted(() => {
  fetchPermissions();
});
</script>

<style lang="scss" scoped>
.system-permission {
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

.header-right {
  .el-button {
    margin-left: 8px;
  }
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

.permission-name {
  display: flex;
  align-items: center;
  font-weight: 500;
  color: #333;
  
  .permission-icon {
    margin-right: 8px;
    color: #666;
  }
}

.form-tip {
  margin-left: 12px;
  font-size: 12px;
  color: #999;
}

.dialog-footer {
  text-align: right;
}
</style> 