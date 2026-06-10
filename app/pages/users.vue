<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import type { User } from '~/types/user'
import type { ListResponse } from '~/types/list-response'
import { apiUserRoutes } from '~/utils/apiRoutes'
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum'
import { useAuthStore } from '~/utils/authStore'
import { getAuthUser, hasUserRole } from '~/utils/authRoles'

const { $apiRest } = useNuxtApp()
const authStore = useAuthStore()
const toast = useToast()

const page = ref(1)
const rowsPerPage = ref(10)
const totalRows = ref(0)
const users = ref<User[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const renewingUserId = ref<number | null>(null)
const searchTimeOut = ref<ReturnType<typeof setTimeout> | null>(null)

const filters = ref({
  search: '',
  role: '',
  with_trashed: false,
})

const roleOptions = [
  { label: 'Todos', value: '' },
  { label: 'Clientes', value: 'cliente' },
  { label: 'Administradores', value: 'administrador' },
]

const columns = [
  {
    id: 'fullName',
    key: 'fullName',
    accessorKey: 'Nombre completo',
    header: 'Nombre completo',
    label: 'Nombre completo',
  },
  {
    id: 'email',
    key: 'email',
    accessorKey: 'Correo',
    header: 'Correo',
    label: 'Correo',
  },
  {
    id: 'planName',
    key: 'planName',
    accessorKey: 'Plan',
    header: 'Plan',
    label: 'Plan',
  },
  {
    id: 'expiresAt',
    key: 'expiresAt',
    accessorKey: 'Vencimiento',
    header: 'Vencimiento',
    label: 'Vencimiento',
  },
  {
    id: 'planStatus',
    key: 'planStatus',
    accessorKey: 'Estado',
    header: 'Estado',
    label: 'Estado',
  },
  {
    id: 'actions',
    key: 'actions',
    accessorKey: 'Acciones',
    header: 'Acciones',
    label: 'Acciones',
  },
]

const currentUser = computed(() => getAuthUser(authStore.user))
const isAdmin = computed(() => hasUserRole(currentUser.value, 'administrador'))

const listReq = computed(() => ({
  page: page.value,
  rowsPerPage: rowsPerPage.value,
  filters: {
    search: filters.value.search || undefined,
    role: filters.value.role || undefined,
    with_trashed: filters.value.with_trashed,
  },
}))

const getFullName = (user: User) => {
  return [user.nombre1, user.nombre2, user.apellido1, user.apellido2]
    .filter(Boolean)
    .join(' ')
}

const getPlanName = (user: User) => {
  return user.plan_status?.planNombre || user.plan?.nombre || 'Sin plan'
}

const getExpirationDate = (user: User) => {
  const value = user.plan_status?.vencimiento || user.current_plan_usuario?.vencimiento

  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('es-UY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value.replace(' ', 'T')))
}

const getPlanStatus = (user: User) => {
  return user.plan_status?.estado || 'sin_plan'
}

const getPlanStatusLabel = (user: User) => {
  const status = getPlanStatus(user)

  if (status === 'vigente') {
    return 'Activo'
  }

  if (status === 'vencido') {
    return 'Vencido'
  }

  return 'Sin plan'
}

const getPlanStatusColor = (user: User) => {
  const status = getPlanStatus(user)

  if (status === 'vigente') {
    return 'success'
  }

  if (status === 'vencido') {
    return 'error'
  }

  return 'neutral'
}

const loadUsers = async () => {
  if (!isAdmin.value) {
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await $apiRest<ListResponse<User[]>>(
      apiUserRoutes.getPaginate,
      HttpMethodEnum.POST,
      listReq.value
    )

    users.value = response.list || []
    totalRows.value = response.totalCount || 0
  } catch (error: any) {
    console.error('Error loading users:', error)
    errorMessage.value = error.message || 'No se pudo cargar el listado de usuarios.'
    users.value = []
    totalRows.value = 0
    toast.error({
      title: 'Error',
      message: errorMessage.value,
      color: 'red',
    })
  } finally {
    isLoading.value = false
  }
}

const onSearch = () => {
  if (searchTimeOut.value) {
    clearTimeout(searchTimeOut.value)
  }

  searchTimeOut.value = setTimeout(() => {
    page.value = 1
    loadUsers()
  }, 400)
}

const renewPlan = async (user: User, months: 1 | 6 | 12) => {
  renewingUserId.value = user.id

  try {
    await $apiRest<User>(
      apiUserRoutes.renewPlan(user.id),
      HttpMethodEnum.POST,
      { months }
    )

    toast.success({
      title: 'Plan renovado',
      message: `Se renov\u00f3 el plan de ${getFullName(user)}.`,
      color: 'green',
      icon: 'i-heroicons-check-circle',
    })

    await loadUsers()
  } catch (error: any) {
    console.error('Error renewing plan:', error)
    toast.error({
      title: 'Error al renovar',
      message: error.message || 'No se pudo renovar el plan.',
      color: 'red',
    })
  } finally {
    renewingUserId.value = null
  }
}

watch(
  () => page.value,
  () => {
    loadUsers()
  }
)

watch(
  () => [filters.value.role, filters.value.with_trashed],
  () => {
    page.value = 1
    loadUsers()
  }
)

watch(
  () => isAdmin.value,
  (canManageUsers) => {
    if (canManageUsers && !users.value.length && !isLoading.value) {
      loadUsers()
    }
  }
)

onMounted(async () => {
  await loadUsers()
})
</script>

<template>
  <UDasboardPage>
    <UDashboardPanel grow>
      <UDashboardNavbar title="Usuarios">
        <template #trailing>
          <UBadge :label="totalRows" variant="subtle" />
        </template>

        <template #right>
          <UInput
            v-model="filters.search"
            icon="i-heroicons-funnel"
            autocomplete="off"
            placeholder="Buscar usuarios..."
            class="hidden lg:block w-72"
            :disabled="isLoading"
            @input="onSearch"
            @keydown.esc="($event.target as HTMLInputElement).blur()"
          />
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #default>
          <div class="w-full border-b border-gray-200 dark:border-gray-700 flex gap-3 items-center flex-wrap">
            <div class="relative w-56">
              <UIcon
                name="i-heroicons-user-group"
                class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <select
                v-model="filters.role"
                class="w-full rounded-md border border-gray-300 bg-white py-2 pl-9 pr-8 text-sm text-gray-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                :disabled="isLoading"
              >
                <option
                  v-for="option in roleOptions"
                  :key="option.value || 'all'"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </div>

            <UCheckbox
              v-model="filters.with_trashed"
              label="Incluir eliminados"
              :disabled="isLoading"
            />
          </div>
        </template>
      </UDashboardToolbar>

      <UAlert
        v-if="errorMessage"
        color="error"
        variant="subtle"
        icon="i-heroicons-exclamation-triangle"
        title="No se pudo cargar usuarios"
        :description="errorMessage"
        class="m-4"
      />

      <UTable
        :data="users"
        :columns="columns"
        :loading="isLoading"
        class="w-full"
        empty="No se encontr\u00f3 ning\u00fan usuario."
      >
        <template #fullName-cell="{ row }">
          <div class="flex items-center gap-3">
            <UAvatar
              :src="row.original.url_image_profile || undefined"
              :alt="getFullName(row.original)"
              size="xs"
            />
            <span class="text-gray-900 dark:text-white font-medium">
              {{ getFullName(row.original) || 'Sin nombre' }}
            </span>
          </div>
        </template>

        <template #email-cell="{ row }">
          <span class="text-gray-700 dark:text-gray-300">
            {{ row.original.email }}
          </span>
        </template>

        <template #planName-cell="{ row }">
          <span class="text-gray-700 dark:text-gray-300">
            {{ getPlanName(row.original) }}
          </span>
        </template>

        <template #expiresAt-cell="{ row }">
          <span class="text-gray-700 dark:text-gray-300">
            {{ getExpirationDate(row.original) }}
          </span>
        </template>

        <template #planStatus-cell="{ row }">
          <UBadge
            :label="getPlanStatusLabel(row.original)"
            :color="getPlanStatusColor(row.original)"
            variant="subtle"
          />
        </template>

        <template #actions-cell="{ row }">
          <div class="flex flex-wrap items-center gap-2">
            <UButton
              label="1 mes"
              icon="i-heroicons-arrow-path"
              size="xs"
              color="primary"
              variant="outline"
              :loading="renewingUserId === row.original.id"
              :disabled="renewingUserId !== null"
              @click="renewPlan(row.original, 1)"
            />
            <UButton
              label="6 meses"
              icon="i-heroicons-arrow-path"
              size="xs"
              color="primary"
              variant="outline"
              :loading="renewingUserId === row.original.id"
              :disabled="renewingUserId !== null"
              @click="renewPlan(row.original, 6)"
            />
            <UButton
              :label="'1 a\u00f1o'"
              icon="i-heroicons-arrow-path"
              size="xs"
              color="primary"
              variant="outline"
              :loading="renewingUserId === row.original.id"
              :disabled="renewingUserId !== null"
              @click="renewPlan(row.original, 12)"
            />
          </div>
        </template>
      </UTable>

      <div class="flex justify-end px-4 py-3 border-t border-gray-200 dark:border-gray-700">
        <UPagination
          v-model:page="page"
          :items-per-page="rowsPerPage"
          :total="totalRows"
          :disabled="isLoading"
        />
      </div>
    </UDashboardPanel>
  </UDasboardPage>
</template>
