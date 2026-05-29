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
  NIcon,
  NPopconfirm,
  NTag,
  NEmpty,
  useMessage,
} from 'naive-ui'
import { AddOutline, FolderOutline } from '@vicons/ionicons5'
import { useProfileStore } from '../stores/profile'
import type { GroupInfo } from '../types'

const profileStore = useProfileStore()
const message = useMessage()

const groups = ref<GroupInfo[]>([])
const showAddModal = ref(false)
const editingName = ref<string | null>(null)
const newName = ref('')

const columns = [
  {
    title: '分组名称',
    key: 'name',
    render(row: GroupInfo) {
      if (!row.name) {
        return h('span', { style: 'color: #999' }, '未分组')
      }
      return h('div', { style: 'display: flex; align-items: center; gap: 8px' }, [
        h(NIcon, { size: 16, color: '#18a058' }, { default: () => h(FolderOutline) }),
        h('span', null, row.name),
      ])
    },
  },
  {
    title: '项目数量',
    key: 'count',
    width: 120,
    render(row: GroupInfo) {
      return h(NTag, { type: 'info', size: 'small' }, { default: () => `${row.count} 个项目` })
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    render(row: GroupInfo) {
      if (!row.name) return h('span')
      return h('div', { style: 'display: flex; gap: 8px' }, [
        h(NButton, { size: 'small', onClick: () => handleRename(row) }, { default: () => '重命名' }),
        h(NPopconfirm, { onPositiveClick: () => handleDelete(row.name) }, {
          trigger: () => h(NButton, { size: 'small', type: 'error' }, { default: () => '删除' }),
          default: () => `删除分组「${row.name}」后，该分组下的项目将变为未分组。确认删除？`,
        }),
      ])
    },
  },
]

async function fetchGroups() {
  groups.value = await profileStore.getGroups()
}

function handleAdd() {
  editingName.value = null
  newName.value = ''
  showAddModal.value = true
}

function handleRename(group: GroupInfo) {
  editingName.value = group.name
  newName.value = group.name
  showAddModal.value = true
}

async function handleSubmit() {
  const trimmed = newName.value.trim()
  if (!trimmed) {
    message.warning('分组名称不能为空')
    return
  }
  try {
    if (editingName.value) {
      await profileStore.renameGroup(editingName.value, trimmed)
      message.success('已重命名')
    } else {
      await profileStore.addGroup(trimmed)
      message.success('已添加')
    }
    showAddModal.value = false
    await fetchGroups()
    await profileStore.fetchProfiles()
  } catch (e: any) {
    message.error(`操作失败: ${e}`)
  }
}

async function handleDelete(name: string) {
  try {
    await profileStore.deleteGroup(name)
    message.success('已删除')
    await fetchGroups()
    await profileStore.fetchProfiles()
  } catch (e: any) {
    message.error(`删除失败: ${e}`)
  }
}

onMounted(() => {
  fetchGroups()
})
</script>

<template>
  <div>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px">
      <h2 style="display: flex; align-items: center; gap: 8px; margin: 0">
        <n-icon :size="24" color="#18a058"><FolderOutline /></n-icon>
        分组管理
      </h2>
      <n-button type="primary" @click="handleAdd">
        <template #icon><n-icon><AddOutline /></n-icon></template>
        新建分组
      </n-button>
    </div>

    <n-card v-if="groups.length === 0">
      <n-empty description="暂无分组，点击「新建分组」创建" />
    </n-card>

    <n-card v-else>
      <n-data-table :columns="columns" :data="groups" :bordered="false" />
    </n-card>

    <n-modal v-model:show="showAddModal" preset="dialog" :title="editingName ? '重命名分组' : '新建分组'" style="width: 400px">
      <n-form label-placement="left" label-width="80">
        <n-form-item label="分组名称">
          <n-input v-model:value="newName" placeholder="请输入分组名称" @keyup.enter="handleSubmit" />
        </n-form-item>
      </n-form>
      <template #action>
        <div style="display: flex; gap: 8px; justify-content: flex-end">
          <n-button @click="showAddModal = false">取消</n-button>
          <n-button type="primary" @click="handleSubmit">确定</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>
