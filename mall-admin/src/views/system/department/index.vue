<template>
  <div class="system-department">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">部门管理</h2>
        <p class="page-desc">管理组织架构和部门信息</p>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          添加部门
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
        <el-form-item label="部门名称">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入部门名称"
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
        ref="tableRef"
        v-loading="loading"
        :data="tableData"
        row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="部门名称" min-width="200">
          <template #default="{ row }">
            <span class="department-name">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="code" label="部门编码" width="150" />
        <el-table-column prop="parentName" label="上级部门" width="150">
          <template #default="{ row }">
            {{ row.parentName || '顶级部门' }}
          </template>
        </el-table-column>
        <el-table-column prop="managerName" label="负责人" width="120" />
        <el-table-column prop="phone" label="联系电话" width="130" />
        <el-table-column prop="email" label="邮箱" width="180" />
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
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="success" link @click="handleAddChild(row)">
              添加子部门
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

    <!-- 部门表单弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
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
            <el-form-item label="部门名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入部门名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门编码" prop="code">
              <el-input v-model="formData.code" placeholder="请输入部门编码" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="上级部门" prop="parentId">
              <el-tree-select
                v-model="formData.parentId"
                :data="departmentTree"
                placeholder="请选择上级部门"
                check-strictly
                :render-after-expand="false"
                style="width: 100%"
                node-key="id"
                :props="{ label: 'name', children: 'children' }"
                clearable
              />
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

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="负责人" prop="managerName">
              <el-input v-model="formData.managerName" placeholder="请输入负责人姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="formData.phone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱地址" />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="描述">
          <el-input
            v-model="formData.description"
            type="textarea"
            placeholder="请输入部门描述"
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
 * 部门管理页面
 * 提供部门的树形结构管理功能
 * @author 刘白 & AI Assistant
 * @since 1.0.0
 */

import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import { Plus, Expand, Fold, Search, Refresh } from '@element-plus/icons-vue';
import { formatDateTime, buildTree } from '@/utils';
import type { Department } from '@/types';

// 响应式数据
const loading = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);
const parentDept = ref<Department | null>(null);
const submitLoading = ref(false);
const formRef = ref<FormInstance>();
const tableRef = ref();

// 搜索表单
const searchForm = reactive({
  name: '',
  status: undefined as number | undefined,
});

// 表格数据
const tableData = ref<Department[]>([]);
const selectedRows = ref<Department[]>([]);
const departmentList = ref<Department[]>([]);

// 表单数据
const formData = reactive({
  id: '',
  name: '',
  code: '',
  parentId: '',
  managerName: '',
  phone: '',
  email: '',
  sort: 0,
  status: 1,
  description: '',
});

// 弹窗标题
const dialogTitle = computed(() => {
  if (parentDept.value) {
    return `为 ${parentDept.value.name} 添加子部门`;
  }
  return isEdit.value ? '编辑部门' : '添加部门';
});

// 部门树形数据（用于选择上级部门）
const departmentTree = computed(() => {
  const tree = buildTree(departmentList.value, {
    id: 'id',
    parentId: 'parentId',
    children: 'children'
  });
  // 如果是编辑模式，需要过滤掉当前部门及其子部门
  if (isEdit.value && formData.id) {
    return filterCurrentDept(tree, formData.id);
  }
  return tree;
});

// 表单验证规则
const formRules: FormRules = {
  name: [
    { required: true, message: '请输入部门名称', trigger: 'blur' },
    { min: 2, max: 50, message: '部门名称长度在2-50个字符', trigger: 'blur' },
  ],
  code: [
    { required: true, message: '请输入部门编码', trigger: 'blur' },
    { min: 2, max: 20, message: '部门编码长度在2-20个字符', trigger: 'blur' },
  ],
  sort: [
    { required: true, message: '请输入排序值', trigger: 'blur' },
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
  ],
};

// 过滤当前部门及其子部门（编辑时不能选择自己或子部门作为上级）
const filterCurrentDept = (tree: Department[], currentId: string): Department[] => {
  return tree.filter(dept => {
    if (dept.id === currentId) {
      return false;
    }
    if (dept.children) {
      dept.children = filterCurrentDept(dept.children, currentId);
    }
    return true;
  });
};

// 获取部门列表
const fetchDepartments = async () => {
  loading.value = true;
  try {
    // TODO: 调用API获取部门列表
    const mockData: Department[] = [
      {
        id: '1',
        name: '总公司',
        code: 'HQ',
        parentId: '',
        parentName: '',
        managerName: '张三',
        phone: '13800138000',
        email: 'hq@example.com',
        sort: 1,
        status: 1,
        description: '总公司',
        createdAt: '2024-01-01 09:00:00',
        updatedAt: '2024-01-01 09:00:00',
      },
      {
        id: '2',
        name: '技术部',
        code: 'TECH',
        parentId: '1',
        parentName: '总公司',
        managerName: '李四',
        phone: '13800138001',
        email: 'tech@example.com',
        sort: 1,
        status: 1,
        description: '技术研发部门',
        createdAt: '2024-01-01 09:00:00',
        updatedAt: '2024-01-01 09:00:00',
      },
      {
        id: '3',
        name: '产品部',
        code: 'PRODUCT',
        parentId: '1',
        parentName: '总公司',
        managerName: '王五',
        phone: '13800138002',
        email: 'product@example.com',
        sort: 2,
        status: 1,
        description: '产品设计部门',
        createdAt: '2024-01-01 09:00:00',
        updatedAt: '2024-01-01 09:00:00',
      },
    ];
    
    departmentList.value = mockData;
    tableData.value = buildTree(mockData, {
      id: 'id',
      parentId: 'parentId',
      children: 'children'
    });
  } catch (error) {
    ElMessage.error('获取部门列表失败');
  } finally {
    loading.value = false;
  }
};

// 搜索处理
const handleSearch = () => {
  // TODO: 实现搜索逻辑
  fetchDepartments();
};

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    name: '',
    status: undefined,
  });
  handleSearch();
};

// 展开所有
const expandAll = () => {
  if (tableRef.value) {
    // TODO: 实现展开所有逻辑
    ElMessage.success('已展开所有部门');
  }
};

// 折叠所有
const collapseAll = () => {
  if (tableRef.value) {
    // TODO: 实现折叠所有逻辑
    ElMessage.success('已折叠所有部门');
  }
};

// 选择处理
const handleSelectionChange = (selection: Department[]) => {
  selectedRows.value = selection;
};

// 添加部门
const handleAdd = () => {
  isEdit.value = false;
  parentDept.value = null;
  resetForm();
  dialogVisible.value = true;
};

// 添加子部门
const handleAddChild = (row: Department) => {
  isEdit.value = false;
  parentDept.value = row;
  resetForm();
  formData.parentId = row.id;
  dialogVisible.value = true;
};

// 编辑部门
const handleEdit = (row: Department) => {
  isEdit.value = true;
  parentDept.value = null;
  Object.assign(formData, {
    id: row.id,
    name: row.name,
    code: row.code,
    parentId: row.parentId,
    managerName: row.managerName || '',
    phone: row.phone || '',
    email: row.email || '',
    sort: row.sort,
    status: row.status,
    description: row.description || '',
  });
  dialogVisible.value = true;
};

// 删除部门
const handleDelete = async (row: Department) => {
  try {
    await ElMessageBox.confirm('删除部门将同时删除其所有子部门，确定要删除吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    // TODO: 调用API删除部门
    ElMessage.success('删除成功');
    fetchDepartments();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
    }
  }
};

// 切换状态
const handleToggleStatus = async (row: Department) => {
  const action = row.status === 1 ? '禁用' : '启用';
  try {
    await ElMessageBox.confirm(`确定要${action}该部门吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    // TODO: 调用API切换状态
    row.status = row.status === 1 ? 0 : 1;
    ElMessage.success(`${action}成功`);
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`${action}失败`);
    }
  }
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    submitLoading.value = true;

    // TODO: 调用API提交表单
    const action = isEdit.value ? '更新' : '创建';
    ElMessage.success(`${action}成功`);
    
    dialogVisible.value = false;
    fetchDepartments();
  } catch (error) {
    console.error('表单验证失败:', error);
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
    parentId: '',
    managerName: '',
    phone: '',
    email: '',
    sort: 0,
    status: 1,
    description: '',
  });
};

// 弹窗关闭处理
const handleDialogClose = () => {
  resetForm();
  parentDept.value = null;
  if (formRef.value) {
    formRef.value.clearValidate();
  }
};

// 初始化
onMounted(() => {
  fetchDepartments();
});
</script>

<style lang="scss" scoped>
.system-department {
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

.department-name {
  font-weight: 500;
  color: #333;
}

.dialog-footer {
  text-align: right;
}
</style> 