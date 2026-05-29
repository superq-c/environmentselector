import { defineStore } from 'pinia'
import { ref } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import type { Profile, GroupInfo } from '../types'

export const useProfileStore = defineStore('profile', () => {
  const profiles = ref<Profile[]>([])

  async function fetchProfiles() {
    profiles.value = await invoke<Profile[]>('get_profiles')
  }

  async function addProfile(
    name: string,
    projectPath: string,
    environmentIds: string[],
    toolId: string,
    enabledFlags: string[],
    extraVariables: Record<string, string>,
    group: string
  ) {
    profiles.value = await invoke<Profile[]>('add_profile', {
      name,
      projectPath,
      environmentIds,
      toolId,
      enabledFlags,
      extraVariables,
      group,
    })
  }

  async function updateProfile(
    id: string,
    name: string,
    projectPath: string,
    environmentIds: string[],
    toolId: string,
    enabledFlags: string[],
    extraVariables: Record<string, string>,
    group: string
  ) {
    profiles.value = await invoke<Profile[]>('update_profile', {
      id,
      name,
      projectPath,
      environmentIds,
      toolId,
      enabledFlags,
      extraVariables,
      group,
    })
  }

  async function deleteProfile(id: string) {
    profiles.value = await invoke<Profile[]>('delete_profile', { id })
  }

  async function launchProfile(profileId: string, flagValues: Record<string, string>) {
    return await invoke<number>('launch_profile', { profileId, flagValues })
  }

  async function getLastSelectedGroup(): Promise<string> {
    return await invoke<string>('get_last_selected_group')
  }

  async function setLastSelectedGroup(group: string) {
    await invoke('set_last_selected_group', { group })
  }

  async function getGroups(): Promise<GroupInfo[]> {
    return await invoke<GroupInfo[]>('get_groups')
  }

  async function addGroup(name: string): Promise<GroupInfo[]> {
    return await invoke<GroupInfo[]>('add_group', { name })
  }

  async function renameGroup(oldName: string, newName: string): Promise<GroupInfo[]> {
    return await invoke<GroupInfo[]>('rename_group', { oldName, newName })
  }

  async function deleteGroup(name: string): Promise<GroupInfo[]> {
    return await invoke<GroupInfo[]>('delete_group', { name })
  }

  return {
    profiles,
    fetchProfiles,
    addProfile,
    updateProfile,
    deleteProfile,
    launchProfile,
    getLastSelectedGroup,
    setLastSelectedGroup,
    getGroups,
    addGroup,
    renameGroup,
    deleteGroup,
  }
})
