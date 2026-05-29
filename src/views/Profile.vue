<script setup lang="ts">
import { onMounted, ref, computed, h } from 'vue'
import type { GroupInfo } from '../types'
import {
  NCard,
  NButton,
  NDataTable,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NCheckbox,
  NCheckboxGroup,
  NSpace,
  NIcon,
  NPopconfirm,
  NTag,
  NDivider,
  useMessage,
} from 'naive-ui'
import { AddOutline } from '@vicons/ionicons5'
import { useProfileStore } from '../stores/profile'
import { useEnvironmentStore } from '../stores/environment'
import { useToolStore } from '../stores/tool'
import PathPicker from '../components/PathPicker.vue'
import type { Profile } from '../types'

const profileStore = useProfileStore()
const envStore = useEnvironmentStore()
const toolStore = useToolStore()
const message = useMessage()

const showModal = ref(false)
const editingId = ref<string | null>(null)
const form = ref({
  name: '',
  project_path: '',
  environment_ids: [] as string[],
  tool_id: '',
  enabled_flags: [] as string[],
  extra_variables: {} as Record<string, string>,
  group: '' as string | null,
})

const envOptions = computed(() =>
  envStore.environments.map((e) => ({ label: e.name, value: e.id }))
)

const toolOptions = computed(() =>
  toolStore.tools.map((t) => ({ label: t.name, value: t.id }))
)

const selectedTool = computed(() =>
  toolStore.tools.find((t) => t.id === form.value.tool_id)
)

const groupList = ref<GroupInfo[]>([])

const groupOptions = computed(() =>
  groupList.value.map((g) => ({ label: g.name, value: g.name }))
)

async function fetchGroups() {
  groupList.value = await profileStore.getGroups()
}

const columns = [
  { title: '名称', key: 'name', width: 150 },
  {
    title: '分组',
    key: 'group',
    width: 100,
    render(row: Profile) {
      return row.group
        ? h(NTag, { type: 'warning', size: 'small' }, { default: () => row.group })
        : h('span', { style: 'color: #999' }, '未分组')
    },
  },
  { title: '项目路径', key: 'project_path', ellipsis: { tooltip: true } },
  {
    title: '环境',
    key: 'environment_ids',
    width: 200,
    render(row: Profile) {
      return h(NSpace, { size: 4 }, {
        default: () => row.environment_ids.map((id) => {
          const env = envStore.environments.find((e) => e.id === id)
          return h(NTag, { type: 'success', size: 'small' }, { default: () => env?.name || id })
        }),
      })
    },
  },
  {
    title: '工具',
    key: 'tool_id',
    width: 120,
    render(row: Profile) {
      const tool = toolStore.tools.find((t) => t.id === row.tool_id)
      return h(NTag, { type: 'info' }, { default: () => tool?.name || row.tool_id })
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    render(row: Profile) {
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
  form.value = {
    name: '',
    project_path: '',
    environment_ids: [],
    tool_id: toolStore.tools[0]?.id || '',
    enabled_flags: [],
    extra_variables: {},
    group: '',
  }
  showModal.value = true
}

function handleEdit(profile: Profile) {
  editingId.value = profile.id
  form.value = {
    name: profile.name,
    project_path: profile.project_path,
    environment_ids: [...profile.environment_ids],
    tool_id: profile.tool_id,
    enabled_flags: [...profile.enabled_flags],
    extra_variables: { ...profile.extra_variables },
    group: profile.group,
  }
  showModal.value = true
}

async function handleDelete(id: string) {
  try {
    await profileStore.deleteProfile(id)
    message.success('已删除')
  } catch (e: any) {
    message.error(`删除失败: ${e}`)
  }
}

async function handleSubmit() {
  try {
    const group = form.value.group || ''
    if (editingId.value) {
      await profileStore.updateProfile(
        editingId.value,
        form.value.name,
        form.value.project_path,
        form.value.environment_ids,
        form.value.tool_id,
        form.value.enabled_flags,
        form.value.extra_variables,
        group
      )
    } else {
      await profileStore.addProfile(
        form.value.name,
        form.value.project_path,
        form.value.environment_ids,
        form.value.tool_id,
        form.value.enabled_flags,
        form.value.extra_variables,
        group
      )
    }
    showModal.value = false
    message.success('已保存')
    await fetchGroups()
  } catch (e: any) {
    message.error(`保存失败: ${e}`)
  }
}

function addExtraVar() {
  const key = `VAR_${Object.keys(form.value.extra_variables).length + 1}`
  form.value.extra_variables[key] = ''
}

onMounted(() => {
  profileStore.fetchProfiles()
  envStore.fetchEnvironments()
  toolStore.fetchTools()
  fetchGroups()
})
</script>

<template>
  <div>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px">
      <h2>项目配置</h2>
      <n-button type="primary" @click="handleAdd">
        <template #icon><n-icon><AddOutline /></n-icon></template>
        添加项目
      </n-button>
    </div>

    <n-card>
      <n-data-table :columns="columns" :data="profileStore.profiles" :bordered="false" />
    </n-card>

    <n-modal v-model:show="showModal" preset="dialog" title="项目配置" style="width: 700px">
      <n-form label-placement="left" label-width="100">
        <n-form-item label="项目名称">
          <n-input v-model:value="form.name" placeholder="如：Spring Boot 项目" />
        </n-form-item>

        <n-form-item label="分组">
          <n-select
            v-model:value="form.group"
            :options="groupOptions"
            filterable
            tag
            placeholder="输入或选择分组（可留空）"
            clearable
          />
        </n-form-item>

        <n-form-item label="项目路径">
          <PathPicker
            :value="form.project_path"
            placeholder="请选择项目路径"
            @update:value="(v: string) => form.project_path = v"
          />
        </n-form-item>

        <n-form-item label="环境配置">
          <n-select
            v-model:value="form.environment_ids"
            :options="envOptions"
            multiple
            placeholder="选择需要的环境"
          />
        </n-form-item>

        <n-form-item label="启动工具">
          <n-select
            v-model:value="form.tool_id"
            :options="toolOptions"
            placeholder="选择工具"
          />
        </n-form-item>

        <n-divider v-if="selectedTool && selectedTool.available_flags.length > 0">
          启动参数
        </n-divider>

        <n-form-item v-if="selectedTool && selectedTool.available_flags.length > 0" label="参数选项">
          <n-checkbox-group v-model:value="form.enabled_flags">
            <n-space vertical>
              <n-checkbox
                v-for="flag in selectedTool.available_flags"
                :key="flag.flag"
                :value="flag.flag"
                :label="flag.label + ' (' + flag.flag + ')'"
              />
            </n-space>
          </n-checkbox-group>
        </n-form-item>

        <n-divider>额外环境变量</n-divider>

        <n-form-item
          v-for="(_, key) in form.extra_variables"
          :key="String(key)"
          :label="String(key)"
        >
          <n-input v-model:value="form.extra_variables[String(key)]" />
        </n-form-item>

        <n-button dashed block @click="addExtraVar">
          添加环境变量
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
