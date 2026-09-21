<template>
  <n-modal
    :show="show"
    preset="card"
    class="auth-modal-card"
    title=""
    :bordered="false"
    size="huge"
    @update:show="handleClose"
  >
    <div class="auth-header">
      <img src="/godot-logo.svg" alt="Godot Logo" class="auth-logo" />
      <h2 class="auth-title">
        {{ currentTab === 'login' ? '欢迎登录 Godot 中文论坛' : '创建中文社区账号' }}
      </h2>
      <p class="auth-subtitle">
        与千万开发者共同交流 GDScript、C#、着色器与独立游戏创作
      </p>
    </div>

    <n-tabs v-model:value="currentTab" type="segment" animated class="mb-4">
      <n-tab name="login">密码登录</n-tab>
      <n-tab name="register">新用户注册</n-tab>
    </n-tabs>

    <!-- Login Form -->
    <div v-if="currentTab === 'login'" class="flex flex-col gap-3">
      <div>
        <label class="text-xs text-gray-400 mb-1 block">用户名 / 邮箱</label>
        <n-input
          v-model:value="loginUsername"
          placeholder="请输入用户名（如 godot_dev）"
          @keyup.enter="handleLogin"
        >
          <template #prefix>👤</template>
        </n-input>
      </div>

      <div>
        <label class="text-xs text-gray-400 mb-1 block">密码</label>
        <n-input
          v-model:value="loginPassword"
          type="password"
          show-password-on="click"
          placeholder="请输入密码"
          @keyup.enter="handleLogin"
        >
          <template #prefix>🔒</template>
        </n-input>
      </div>

      <n-button
        type="primary"
        block
        class="mt-2"
        :loading="submitting"
        @click="handleLogin"
      >
        立即登录
      </n-button>

      <!-- Quick Demo Account -->
      <div class="demo-account-box">
        <span class="demo-account-title">⚡ 快速体验账号（一键填充）</span>
        <div class="demo-account-buttons">
          <n-button size="tiny" secondary @click="fillDemo('godot_dev')">
            开发者账号
          </n-button>
          <n-button size="tiny" secondary @click="fillDemo('indie_creator')">
            独立制作人
          </n-button>
          <n-button size="tiny" secondary @click="fillDemo('admin')">
            版主账号
          </n-button>
        </div>
      </div>
    </div>

    <!-- Register Form -->
    <div v-else class="flex flex-col gap-3">
      <div>
        <label class="text-xs text-gray-400 mb-1 block">用户名（字母/数字）</label>
        <n-input
          v-model:value="regUsername"
          placeholder="用于登录与个人主页 URL"
        >
          <template #prefix>👤</template>
        </n-input>
      </div>

      <div>
        <label class="text-xs text-gray-400 mb-1 block">社区昵称</label>
        <n-input
          v-model:value="regNickname"
          placeholder="在论坛发帖时显示的名称"
        >
          <template #prefix>🏷️</template>
        </n-input>
      </div>

      <div>
        <label class="text-xs text-gray-400 mb-1 block">密码</label>
        <n-input
          v-model:value="regPassword"
          type="password"
          show-password-on="click"
          placeholder="至少 6 位字符"
          @keyup.enter="handleRegister"
        >
          <template #prefix>🔒</template>
        </n-input>
      </div>

      <n-button
        type="primary"
        block
        class="mt-2"
        :loading="submitting"
        @click="handleRegister"
      >
        完成注册并进入社区
      </n-button>
    </div>
  </n-modal>
</template>

<script setup lang="ts">
import { useUser } from '@/hooks/useUser'

const props = defineProps<{
  show: boolean
  defaultTab?: 'login' | 'register'
}>()

const emit = defineEmits<{
  (e: 'update:show', val: boolean): void
}>()

const message = useMessage()
const { login, register } = useUser()

const currentTab = ref<'login' | 'register'>('login')
const submitting = ref(false)

const loginUsername = ref('')
const loginPassword = ref('')

const regUsername = ref('')
const regNickname = ref('')
const regPassword = ref('')

watch(
  () => props.defaultTab,
  (val) => {
    if (val) currentTab.value = val
  },
  { immediate: true }
)

const handleClose = (val: boolean) => {
  emit('update:show', val)
}

const fillDemo = (username: string) => {
  loginUsername.value = username
  loginPassword.value = '123456'
}

const handleLogin = async () => {
  if (!loginUsername.value.trim()) {
    message.warning('请输入用户名！')
    return
  }
  submitting.value = true
  try {
    await login(loginUsername.value, loginPassword.value)
    message.success(`欢迎回来，${loginUsername.value}！`)
    emit('update:show', false)
  } finally {
    submitting.value = false
  }
}

const handleRegister = async () => {
  if (!regUsername.value.trim()) {
    message.warning('请输入用户名！')
    return
  }
  submitting.value = true
  try {
    await register(regUsername.value, regNickname.value, regPassword.value)
    message.success(`注册成功，欢迎加入社区！`)
    emit('update:show', false)
  } finally {
    submitting.value = false
  }
}
</script>

<style src="@/styles/auth.css" scoped></style>
