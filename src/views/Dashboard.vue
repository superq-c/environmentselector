<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import type { GroupInfo } from '../types'
import {
  NCard,
  NButton,
  NSpace,
  NTag,
  NEmpty,
  NIcon,
  NGrid,
  NGi,
  NSelect,
  useMessage,
} from 'naive-ui'
import { RocketOutline, FolderOutline, TerminalOutline } from '@vicons/ionicons5'
import { useProfileStore } from '../stores/profile'
import { useEnvironmentStore } from '../stores/environment'
import { useToolStore } from '../stores/tool'
import type { Profile } from '../types'

const profileStore = useProfileStore()
const envStore = useEnvironmentStore()
const toolStore = useToolStore()
const message = useMessage()

const selectedProfileId = ref<string | null>(null)
const launching = ref(false)
const selectedGroup = ref<string>('__all__')
const groupList = ref<GroupInfo[]>([])

const ALL_GROUP = '__all__'

const groupOptions = computed(() => {
  const options = [{ label: '全部', value: ALL_GROUP }]
  for (const g of groupList.value) {
    options.push({ label: g.name, value: g.name })
  }
  return options
})

async function fetchGroups() {
  groupList.value = await profileStore.getGroups()
}

const filteredProfiles = computed(() => {
  if (selectedGroup.value === ALL_GROUP) {
    return profileStore.profiles
  }
  return profileStore.profiles.filter((p) => p.group === selectedGroup.value)
})

const selectedProfile = computed(() =>
  profileStore.profiles.find((p) => p.id === selectedProfileId.value)
)

const profileTool = computed(() => {
  if (!selectedProfile.value) return null
  return toolStore.tools.find((t) => t.id === selectedProfile.value!.tool_id)
})

function getProfileEnvironments(profile: Profile) {
  return envStore.environments.filter((e) => profile.environment_ids.includes(e.id))
}

function getProfileTool(profile: Profile) {
  return toolStore.tools.find((t) => t.id === profile.tool_id)
}

function handleSelect(profile: Profile) {
  selectedProfileId.value = profile.id
}

function handleGroupChange(group: string) {
  selectedGroup.value = group
  selectedProfileId.value = null
  profileStore.setLastSelectedGroup(group === ALL_GROUP ? '' : group)
}

async function handleLaunch() {
  if (!selectedProfile.value) return
  launching.value = true
  try {
    await profileStore.launchProfile(selectedProfile.value.id, {})
    message.success(`${profileTool.value?.name || '工具'} 已启动`)
  } catch (e: any) {
    message.error(`启动失败: ${e}`)
  } finally {
    launching.value = false
  }
}

onMounted(async () => {
  await Promise.all([
    profileStore.fetchProfiles(),
    envStore.fetchEnvironments(),
    toolStore.fetchTools(),
    fetchGroups(),
  ])
  const lastGroup = await profileStore.getLastSelectedGroup()
  if (lastGroup && groupList.value.some((g) => g.name === lastGroup)) {
    selectedGroup.value = lastGroup
  }
})
</script>

<template>
  <div>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px">
      <h2 style="display: flex; align-items: center; gap: 8px; margin: 0">
        <n-icon :size="24" color="#18a058"><RocketOutline /></n-icon>
        启动面板
      </h2>
      <n-select
        :value="selectedGroup"
        :options="groupOptions"
        style="width: 200px"
        @update:value="handleGroupChange"
      />
    </div>

    <n-card v-if="profileStore.profiles.length === 0">
      <n-empty description="暂无项目配置，请先在「项目配置」页面添加" />
    </n-card>

    <n-card v-else-if="filteredProfiles.length === 0">
      <n-empty description="当前分组下暂无项目配置" />
    </n-card>

    <template v-else>
      <!-- 项目卡片网格 -->
      <n-grid :x-gap="16" :y-gap="16" :cols="3" responsive="screen" style="margin-bottom: 24px">
        <n-gi v-for="profile in filteredProfiles" :key="profile.id">
          <n-card
            :style="{
              cursor: 'pointer',
              border: selectedProfileId === profile.id ? '2px solid #18a058' : '2px solid transparent',
              transition: 'all 0.3s',
              height: '280px',
              display: 'flex',
              'flex-direction': 'column',
            }"
            :content-style="{ padding: 0, flex: 1, overflow: 'hidden' }"
            hoverable
            @click="handleSelect(profile)"
          >
            <template #header>
              <div style="display: flex; align-items: center; gap: 8px">
                <n-icon :size="18" color="#18a058"><FolderOutline /></n-icon>
                <span style="font-size: 16px; font-weight: 600">{{ profile.name }}</span>
              </div>
            </template>

            <div class="card-body">
              <n-space vertical :size="12">
                <!-- 项目路径 -->
                <div style="font-size: 13px; color: #666; word-break: break-all">
                  {{ profile.project_path }}
                </div>

                <!-- 环境标签 -->
                <n-space :size="4">
                  <n-tag
                    v-for="env in getProfileEnvironments(profile)"
                    :key="env.id"
                    type="success"
                    size="small"
                  >
                    {{ env.name }}
                  </n-tag>
                </n-space>

                <!-- 工具标签 -->
                <n-space :size="4">
                  <n-tag type="info" size="small">
                    <template #icon>
                      <n-icon><TerminalOutline /></n-icon>
                    </template>
                    {{ getProfileTool(profile)?.name || '未知工具' }}
                  </n-tag>
                </n-space>

                <!-- 参数标签 -->
                <n-space v-if="profile.enabled_flags.length > 0" :size="4">
                  <n-tag
                    v-for="flag in profile.enabled_flags"
                    :key="flag"
                    type="warning"
                    size="small"
                  >
                    {{ flag }}
                  </n-tag>
                </n-space>
              </n-space>
            </div>
          </n-card>
        </n-gi>
      </n-grid>

      <!-- 启动按钮 -->
      <n-button
        v-if="selectedProfile"
        type="success"
        size="large"
        block
        :loading="launching"
        @click="handleLaunch"
      >
        <template #icon>
          <n-icon><RocketOutline /></n-icon>
        </template>
        启动 {{ profileTool?.name || '工具' }} - {{ selectedProfile.name }}
      </n-button>
    </template>
  </div>
</template>

<style scoped>
.card-body {
  overflow-y: auto;
  overflow-x: hidden;
  flex: 1;
  padding: var(--n-card-padding, 16px);
  scrollbar-width: thin;
  scrollbar-color: #d0d0d0 transparent;
}

.card-body::-webkit-scrollbar {
  width: 6px;
  height: 0;
}

.card-body::-webkit-scrollbar-track {
  background: transparent;
}

.card-body::-webkit-scrollbar-thumb {
  background-color: #d0d0d0;
  border-radius: 3px;
}

.card-body::-webkit-scrollbar-thumb:hover {
  background-color: #b0b0b0;
}
</style>
