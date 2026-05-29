import { defineStore } from 'pinia'
import { ref } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import type { Environment } from '../types'

export const useEnvironmentStore = defineStore('environment', () => {
  const environments = ref<Environment[]>([])

  async function fetchEnvironments() {
    environments.value = await invoke<Environment[]>('get_environments')
  }

  async function addEnvironment(
    name: string,
    env_type: string,
    variables: Record<string, string>,
    addToPath: string[]
  ) {
    environments.value = await invoke<Environment[]>('add_environment', {
      name,
      envType: env_type,
      variables,
      addToPath,
    })
  }

  async function updateEnvironment(
    id: string,
    name: string,
    env_type: string,
    variables: Record<string, string>,
    addToPath: string[]
  ) {
    environments.value = await invoke<Environment[]>('update_environment', {
      id,
      name,
      envType: env_type,
      variables,
      addToPath,
    })
  }

  async function deleteEnvironment(id: string) {
    environments.value = await invoke<Environment[]>('delete_environment', { id })
  }

  return { environments, fetchEnvironments, addEnvironment, updateEnvironment, deleteEnvironment }
})
