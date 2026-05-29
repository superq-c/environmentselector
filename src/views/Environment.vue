<script setup lang="ts">
import { onMounted, ref, h } from 'vue'
import {
  NCard,
  NButton,
  NDataTable,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NSwitch,
  NSpace,
  NIcon,
  NPopconfirm,
  NTag,
  useMessage,
} from 'naive-ui'
import { AddOutline, TrashOutline } from '@vicons/ionicons5'
import { useEnvironmentStore } from '../stores/environment'
import PathPicker from '../components/PathPicker.vue'
import type { Environment } from '../types'

const store = useEnvironmentStore()
const message = useMessage()

const showModal = ref(false)
const editingId = ref<string | null>(null)
const form = ref({
  name: '',
  env_type: 'java',
  variables: {} as Record<string, string>,
  add_to_path: [] as string[],
})

// 自定义变量的键值对列表（用于自定义类型）
const customVars = ref<{ key: string; value: string; addToPath: boolean }[]>([])

const envTypeOptions = [
  { label: 'Java', value: 'java' },
  { label: 'Node.js', value: 'node' },
  { label: 'Python', value: 'python' },
  { label: 'Go', value: 'go' },
  { label: '自定义', value: 'custom' },
]

const presetVariables: Record<string, Record<string, string>> = {
  java: { JAVA_HOME: '' },
  node: { NODE_HOME: '' },
  python: { PYTHON_HOME: '' },
  go: { GOROOT: '' },
  custom: {},
}

const columns = [
  { title: '名称', key: 'name', width: 150 },
  { title: '类型', key: 'env_type', width: 100 },
  {
    title: '环境变量',
    key: 'variables',
    render(row: Environment) {
      return Object.entries(row.variables)
        .map(([k, v]) => `${k}=${v}`)
        .join(', ')
    },
  },
  {
    title: '添加到PATH',
    key: 'add_to_path',
    width: 120,
    render(row: Environment) {
      if (row.add_to_path && row.add_to_path.length > 0) {
        return row.add_to_path.map((k) =>
          h(NTag, { type: 'success', size: 'small', style: 'margin: 2px' }, { default: () => k })
        )
      }
      return h(NTag, { type: 'default', size: 'small' }, { default: () => '无' })
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    render(row: Environment) {
      return h(NSpace, {}, {
        default: () => [
          h(NButton, { size: 'small', onClick: () => handleEdit(row) }, { default: () => '编辑' }),
          h(NPopconfirm, { onPositiveClick: () => handleDelete(row.id) }, {
            trigger: () => h(NButton, { size: 'small', type: 'error' }, { default: () => '删除' }),
            default: () => '确认删除？',
          }),
        ],
      })
    },
  },
]

function handleAdd() {
  editingId.value = null
  form.value = { name: '', env_type: 'java', variables: { JAVA_HOME: '' }, add_to_path: [] }
  customVars.value = []
  showModal.value = true
}

function handleEdit(env: Environment) {
  editingId.value = env.id
  form.value = {
    name: env.name,
    env_type: env.env_type,
    variables: { ...env.variables },
    add_to_path: [...(env.add_to_path || [])],
  }
  // 将自定义类型的变量转为数组形式
  if (env.env_type === 'custom') {
    customVars.value = Object.entries(env.variables).map(([key, value]) => ({
      key,
      value,
      addToPath: (env.add_to_path || []).includes(key),
    }))
  } else {
    customVars.value = []
  }
  showModal.value = true
}

async function handleDelete(id: string) {
  try {
    await store.deleteEnvironment(id)
    message.success('已删除')
  } catch (e: any) {
    message.error(`删除失败: ${e}`)
  }
}

function handleEnvTypeChange(type: string) {
  form.value.variables = { ...presetVariables[type] }
  form.value.add_to_path = []
  if (type === 'custom') {
    customVars.value = []
  }
}

function toggleAddToPath(key: string, checked: boolean) {
  if (checked) {
    if (!form.value.add_to_path.includes(key)) {
      form.value.add_to_path.push(key)
    }
  } else {
    form.value.add_to_path = form.value.add_to_path.filter((k) => k !== key)
  }
}

function addCustomVar() {
  customVars.value.push({ key: '', value: '', addToPath: false })
}

function removeCustomVar(index: number) {
  customVars.value.splice(index, 1)
}

async function handleSubmit() {
  try {
    // 如果是自定义类型，将 customVars 转为 variables 和 add_to_path
    if (form.value.env_type === 'custom') {
      const vars: Record<string, string> = {}
      const addToPath: string[] = []
      for (const item of customVars.value) {
        if (item.key.trim()) {
          vars[item.key.trim()] = item.value
          if (item.addToPath) {
            addToPath.push(item.key.trim())
          }
        }
      }
      form.value.variables = vars
      form.value.add_to_path = addToPath
    }

    if (editingId.value) {
      await store.updateEnvironment(
        editingId.value,
        form.value.name,
        form.value.env_type,
        form.value.variables,
        form.value.add_to_path
      )
    } else {
      await store.addEnvironment(
        form.value.name,
        form.value.env_type,
        form.value.variables,
        form.value.add_to_path
      )
    }
    showModal.value = false
    message.success('已保存')
  } catch (e: any) {
    message.error(`保存失败: ${e}`)
  }
}

onMounted(() => store.fetchEnvironments())
</script>

<template>
  <div>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px">
      <h2>环境管理</h2>
      <n-button type="primary" @click="handleAdd">
        <template #icon><n-icon><AddOutline /></n-icon></template>
        添加环境
      </n-button>
    </div>

    <n-card>
      <n-data-table :columns="columns" :data="store.environments" :bordered="false" />
    </n-card>

    <n-modal v-model:show="showModal" preset="dialog" title="环境配置" style="width: 700px">
      <n-form label-placement="left" label-width="100">
        <n-form-item label="名称">
          <n-input v-model:value="form.name" placeholder="如：Java 21" />
        </n-form-item>
        <n-form-item label="类型">
          <n-select
            v-model:value="form.env_type"
            :options="envTypeOptions"
            @update:value="handleEnvTypeChange"
          />
        </n-form-item>

        <!-- 非自定义类型的变量 -->
        <template v-if="form.env_type !== 'custom'">
          <n-form-item
            v-for="(_, key) in form.variables"
            :key="key"
            :label="String(key)"
          >
            <n-space style="width: 100%" align="center">
              <PathPicker
                v-if="['JAVA_HOME', 'GOROOT', 'NODE_HOME', 'PYTHON_HOME'].includes(String(key))"
                :value="form.variables[String(key)]"
                :placeholder="`请选择 ${String(key)} 路径`"
                @update:value="(v: string) => form.variables[String(key)] = v"
                style="flex: 1"
              />
              <n-input
                v-else
                v-model:value="form.variables[String(key)]"
                :placeholder="`请输入 ${String(key)} 的值`"
                style="flex: 1"
              />
              <n-space align="center" :size="4">
                <span style="font-size: 12px; color: #666">添加到PATH</span>
                <n-switch
                  :value="form.add_to_path.includes(String(key))"
                  @update:value="(checked: boolean) => toggleAddToPath(String(key), checked)"
                />
              </n-space>
            </n-space>
          </n-form-item>
        </template>

        <!-- 自定义类型的变量 -->
        <template v-else>
          <n-form-item
            v-for="(item, index) in customVars"
            :key="index"
            :label="'变量 ' + (index + 1)"
          >
            <n-space style="width: 100%" align="center">
              <n-input
                v-model:value="item.key"
                placeholder="变量名"
                style="width: 150px"
              />
              <PathPicker
                v-if="['JAVA_HOME', 'GOROOT', 'NODE_HOME', 'PYTHON_HOME'].includes(item.key)"
                :value="item.value"
                placeholder="请选择路径"
                @update:value="(v: string) => item.value = v"
                style="flex: 1"
              />
              <n-input
                v-else
                v-model:value="item.value"
                placeholder="变量值"
                style="flex: 1"
              />
              <n-space align="center" :size="4">
                <span style="font-size: 12px; color: #666">PATH</span>
                <n-switch v-model:value="item.addToPath" />
              </n-space>
              <n-button type="error" @click="removeCustomVar(index)">
                <template #icon><n-icon><TrashOutline /></n-icon></template>
              </n-button>
            </n-space>
          </n-form-item>
          <n-button dashed block @click="addCustomVar">
            <template #icon><n-icon><AddOutline /></n-icon></template>
            添加变量
          </n-button>
        </template>
      </n-form>
      <template #action>
        <n-space>
          <n-button @click="showModal = false">取消</n-button>
          <n-button type="primary" @click="handleSubmit">保存</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>
