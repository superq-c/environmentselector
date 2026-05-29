<script setup lang="ts">
import { NInput, NButton, NIcon, NSpace, NDropdown } from 'naive-ui'
import { FolderOpenOutline } from '@vicons/ionicons5'
import { open } from '@tauri-apps/plugin-dialog'

const props = defineProps<{
  value: string
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:value', value: string): void
}>()

const dropdownOptions = [
  { label: '选择文件夹', key: 'directory' },
  { label: '选择文件', key: 'file' },
]

async function handleSelect(key: string) {
  const isDirectory = key === 'directory'
  const selected = await open({
    directory: isDirectory,
    multiple: false,
    defaultPath: props.value || undefined,
  })
  if (selected) {
    emit('update:value', selected as string)
  }
}
</script>

<template>
  <n-space style="width: 100%">
    <n-input
      :value="value"
      :placeholder="placeholder || '请选择路径'"
      @update:value="(v: string) => emit('update:value', v)"
      style="flex: 1"
    />
    <n-dropdown :options="dropdownOptions" @select="handleSelect" trigger="click">
      <n-button>
        <template #icon>
          <n-icon><FolderOpenOutline /></n-icon>
        </template>
        浏览
      </n-button>
    </n-dropdown>
  </n-space>
</template>
