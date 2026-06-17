<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue'
import {
  NButton,
  NCard,
  NCheckbox,
  NDataTable,
  NDivider,
  NForm,
  NFormItem,
  NIcon,
  NInput,
  NModal,
  NPopconfirm,
  NSelect,
  NSpace,
  NTag,
  useMessage,
} from 'naive-ui'
import { AddOutline, TrashOutline } from '@vicons/ionicons5'
import PathPicker from '../components/PathPicker.vue'
import { useEnvironmentStore } from '../stores/environment'
import { useToolStore } from '../stores/tool'
import type { Tool, ToolFlag } from '../types'

const store = useToolStore()
const envStore = useEnvironmentStore()
const message = useMessage()

const showModal = ref(false)
const editingId = ref<string | null>(null)
const form = ref({
  name: '',
  path: '',
  environment_ids: [] as string[],
  launch_template: '',
  available_flags: [] as ToolFlag[],
})

const envOptions = computed(() =>
  envStore.environments.map((env) => ({ label: env.name, value: env.id }))
)

const columns = [
  { title: '名称', key: 'name', width: 150 },
  { title: '路径', key: 'path' },
  {
    title: '启动环境',
    key: 'environment_ids',
    width: 220,
    render(row: Tool) {
      if (!row.environment_ids?.length) {
        return h('span', { style: 'color: #999' }, '系统环境')
      }
      return h(NSpace, { size: 4 }, {
        default: () => row.environment_ids.map((id) => {
          const env = envStore.environments.find((item) => item.id === id)
          return h(NTag, { type: 'success', size: 'small' }, { default: () => env?.name || id })
        }),
      })
    },
  },
  {
    title: '支持的参数',
    key: 'available_flags',
    width: 300,
    render(row: Tool) {
      return h(NSpace, {}, {
        default: () => row.available_flags.map((flag) =>
          h(NTag, { type: flag.dangerous ? 'error' : 'info', size: 'small' }, { default: () => flag.label })
        ),
      })
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    render(row: Tool) {
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

function resetForm() {
  form.value = {
    name: '',
    path: '',
    environment_ids: [],
    launch_template: '',
    available_flags: [],
  }
}

function handleAdd() {
  editingId.value = null
  resetForm()
  showModal.value = true
}

function handleEdit(tool: Tool) {
  editingId.value = tool.id
  form.value = {
    name: tool.name,
    path: tool.path,
    environment_ids: [...(tool.environment_ids || [])],
    launch_template: tool.launch_template || '',
    available_flags: tool.available_flags.map((flag) => ({ ...flag })),
  }
  showModal.value = true
}

async function handleDelete(id: string) {
  try {
    await store.deleteTool(id)
    message.success('已删除')
  } catch (e: any) {
    message.error(`删除失败: ${e}`)
  }
}

function addFlag() {
  form.value.available_flags.push({
    flag: '',
    label: '',
    dangerous: false,
    has_value: false,
  })
}

function removeFlag(index: number) {
  form.value.available_flags.splice(index, 1)
}

async function handleSubmit() {
  try {
    const validFlags = form.value.available_flags.filter((flag) => flag.flag.trim() && flag.label.trim())

    if (editingId.value) {
      await store.updateTool(
        editingId.value,
        form.value.name,
        form.value.path,
        form.value.environment_ids,
        form.value.launch_template,
        validFlags
      )
    } else {
      await store.addTool(
        form.value.name,
        form.value.path,
        form.value.environment_ids,
        form.value.launch_template,
        validFlags
      )
    }
    showModal.value = false
    message.success('已保存')
  } catch (e: any) {
    message.error(`保存失败: ${e}`)
  }
}

onMounted(() => {
  store.fetchTools()
  envStore.fetchEnvironments()
})
</script>

<template>
  <div>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px">
      <h2>工具管理</h2>
      <n-button type="primary" @click="handleAdd">
        <template #icon><n-icon><AddOutline /></n-icon></template>
        添加工具
      </n-button>
    </div>

    <n-card>
      <n-data-table :columns="columns" :data="store.tools" :bordered="false" />
    </n-card>

    <n-modal v-model:show="showModal" preset="dialog" title="工具配置" style="width: 840px">
      <n-form label-placement="left" label-width="110">
        <n-form-item label="名称">
          <n-input v-model:value="form.name" placeholder="例如：Codex" />
        </n-form-item>

        <n-form-item label="路径">
          <PathPicker
            :value="form.path"
            placeholder="例如：codex 或选择可执行文件"
            :directory="false"
            @update:value="(value: string) => form.path = value"
          />
        </n-form-item>

        <n-form-item label="启动环境">
          <n-select
            v-model:value="form.environment_ids"
            :options="envOptions"
            multiple
            clearable
            placeholder="选择工具自身启动所需的环境，留空则使用系统环境"
          />
        </n-form-item>

        <n-form-item label="启动模板">
          <n-input
            v-model:value="form.launch_template"
            type="textarea"
            placeholder="可选。留空使用 &quot;{tool}&quot; {args}。可使用 {tool}、{args} 以及环境变量占位符，如 {NODE_HOME}\\node.exe C:\\path\\codex.js {args}"
            :autosize="{ minRows: 2, maxRows: 4 }"
          />
        </n-form-item>

        <n-divider>启动参数</n-divider>

        <div
          v-for="(flag, index) in form.available_flags"
          :key="index"
          style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px; padding: 12px; background: #f8f8f8; border-radius: 8px"
        >
          <n-input
            v-model:value="flag.flag"
            placeholder="参数名，例如 --model"
            style="width: 200px"
          />
          <n-input
            v-model:value="flag.label"
            placeholder="显示名称"
            style="width: 150px"
          />
          <n-checkbox v-model:checked="flag.has_value">
            需要值
          </n-checkbox>
          <n-checkbox v-model:checked="flag.dangerous">
            危险
          </n-checkbox>
          <div style="flex: 1"></div>
          <n-button type="error" size="small" @click="removeFlag(index)">
            <template #icon><n-icon><TrashOutline /></n-icon></template>
            删除
          </n-button>
        </div>

        <n-button dashed block @click="addFlag">
          <template #icon><n-icon><AddOutline /></n-icon></template>
          添加参数
        </n-button>
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
