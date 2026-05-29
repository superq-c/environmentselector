<script setup lang="ts">
import { NLayout, NLayoutSider, NLayoutContent, NMenu, NIcon, NMessageProvider } from 'naive-ui'
import { useRouter, useRoute } from 'vue-router'
import { computed, h } from 'vue'
import {
  RocketOutline,
  ServerOutline,
  TerminalOutline,
  FolderOpenOutline,
  FolderOutline,
} from '@vicons/ionicons5'

const router = useRouter()
const route = useRoute()

const menuOptions = [
  {
    label: '启动面板',
    key: 'dashboard',
    icon: () => h(NIcon, null, { default: () => h(RocketOutline) }),
  },
  {
    label: '环境管理',
    key: 'environments',
    icon: () => h(NIcon, null, { default: () => h(ServerOutline) }),
  },
  {
    label: '工具管理',
    key: 'tools',
    icon: () => h(NIcon, null, { default: () => h(TerminalOutline) }),
  },
  {
    label: '项目配置',
    key: 'profiles',
    icon: () => h(NIcon, null, { default: () => h(FolderOpenOutline) }),
  },
  {
    label: '分组管理',
    key: 'groups',
    icon: () => h(NIcon, null, { default: () => h(FolderOutline) }),
  },
]

const activeKey = computed(() => route.name as string)

function handleMenuUpdate(key: string) {
  router.push({ name: key })
}
</script>

<template>
  <n-layout has-sider style="height: 100vh">
    <n-layout-sider
      bordered
      :width="200"
      :native-scrollbar="false"
      style="background: #fff"
    >
      <div style="padding: 16px; text-align: center; font-size: 18px; font-weight: 600; color: #18a058">
        DevEnv Launcher
      </div>
      <n-menu
        :value="activeKey"
        :options="menuOptions"
        @update:value="handleMenuUpdate"
      />
    </n-layout-sider>
    <n-layout-content style="background: #f5f5f5">
      <n-message-provider>
        <div style="padding: 24px">
          <router-view />
        </div>
      </n-message-provider>
    </n-layout-content>
  </n-layout>
</template>
