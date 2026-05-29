import { defineStore } from 'pinia'
import { ref } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import type { Tool, ToolFlag } from '../types'

export const useToolStore = defineStore('tool', () => {
  const tools = ref<Tool[]>([])

  async function fetchTools() {
    tools.value = await invoke<Tool[]>('get_tools')
  }

  async function addTool(name: string, path: string, availableFlags: ToolFlag[] = []) {
    tools.value = await invoke<Tool[]>('add_tool', { name, path, availableFlags })
  }

  async function updateTool(id: string, name: string, path: string, availableFlags: ToolFlag[] = []) {
    tools.value = await invoke<Tool[]>('update_tool', { id, name, path, availableFlags })
  }

  async function deleteTool(id: string) {
    tools.value = await invoke<Tool[]>('delete_tool', { id })
  }

  return { tools, fetchTools, addTool, updateTool, deleteTool }
})
