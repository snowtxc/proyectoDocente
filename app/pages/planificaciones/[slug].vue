<script setup lang="ts">
import type { Planificacion } from '~/types/planificacion';
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum';
import { format,parseISO } from "date-fns";
import { es } from 'date-fns/locale';

const { $apiRest } = useNuxtApp();

const route = useRoute();
const slug = route.params.slug as string;

const loadedPlanificacion =  ref<Planificacion>(null);

const { data: planificacion, error, refresh } = await useAsyncData('posts', async () => {
  const response = await $apiRest(apiPlanificacionesRoutes.getBySlug(slug), HttpMethodEnum.GET);
  return response;
});

const grupo  = computed(()=>{
  return planificacion.value.grupo;
})

const fechaDesdeFormatted = computed(()=>{
  const fecha = parseISO(planificacion.value.fechaDesde);
  let fechaFormateada = format(fecha, "iiii d 'de' MMMM", { locale: es });
  fechaFormateada = fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);
  return fechaFormateada;
})

const fechaHastaFormatted = computed(()=>{
  const fecha = parseISO(planificacion.value.fechaHasta);
  let fechaFormateada = format(fecha, "iiii d 'de' MMMM", { locale: es });
  fechaFormateada = fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);
  return fechaFormateada;
})


const fechas = computed(() => loadedPlanificacion.value?.fechas ?? []);

const selectedFecha = ref(fechas?.value.length > 0 ? fechas[0] : null);

const changeSelectedFecha = (direction: "prev" | "next") => {
  const currentIndex = fechas?.value.findIndex(
    (fecha) => fecha === selectedFecha.value
  );
  if (direction === "prev" && currentIndex > 0) {
    selectedFecha.value = fechas.value[currentIndex - 1];
  } else if (direction === "next" && currentIndex < fechas.value.length - 1) {
    selectedFecha.value = fechas.value[currentIndex + 1];
  }
};

const items = ref([
  {
    title: 'Address',
    description: 'Add your address here',
    icon: 'i-lucide-house'
  },
  {
    title: 'Shipping',
    description: 'Set your preferred shipping method',
    icon: 'i-lucide-truck'
  },
  {
    title: 'Checkout',
    description: 'Confirm your order'
  }
])

watch(
  () => fechas.value,
  (newVal) => {
    selectedFecha.value = newVal[0];
  }
);

onMounted(async () => {
  const planificacion = await $apiRest(apiPlanificacionesRoutes.getBySlug(slug), HttpMethodEnum.GET);
});

const progress = computed(() => {
  const totalFechas = fechas.value.length;
  if (!selectedFecha.value || totalFechas === 0) {
    return 0;
  }
  const currentIndex = fechas.value.findIndex(
    (fecha) => fecha === selectedFecha.value
  );
  return ((currentIndex + 1) / totalFechas) * 100; // Progress in percentage
});

const tabItems = [{
  label: 'All'
}, {
  label: 'Unread'
}]
const selectedTab = ref(0)

const dropdownItems = [[{
  label: 'Mark as unread',
  icon: 'i-heroicons-check-circle'
}, {
  label: 'Mark as important',
  icon: 'i-heroicons-exclamation-circle'
}], [{
  label: 'Star thread',
  icon: 'i-heroicons-star'
}, {
  label: 'Mute thread',
  icon: 'i-heroicons-pause-circle'
}]]

const { data: mails } = await useFetch<any[]>('/api/mails', { default: () => [] })

// Filter mails based on the selected tab
const filteredMails = computed(() => {
  if (selectedTab.value === 1) {
    return mails.value.filter(mail => !!mail.unread)
  }

  return mails.value
})

const selectedMail = ref<any | null>()

const isMailPanelOpen = computed({
  get() {
    return !!selectedMail.value
  },
  set(value: boolean) {
    if (!value) {
      selectedMail.value = null
    }
  }
})

// Reset selected mail if it's not in the filtered mails
watch(filteredMails, () => {
  if (!filteredMails.value.find(mail => mail.id === selectedMail.value?.id)) {
    selectedMail.value = null
  }
})
</script>

<template>
  <UDashboardPage>
    <UDashboardPanel
      id="grupo"
      :width="400"
      :resizable="{ min: 300, max: 500 }"
    >
      <UDashboardNavbar
        :title="grupo.nombre"
      >
        <template #right>
          <BadgeGrado
          v-for="grado in planificacion.grupo.grados"
          :key="grado.id"
          :grado="grado">
        </BadgeGrado>
      
        </template>
      </UDashboardNavbar>

      <div>
        <!-- <UStepper disabled :items="items"/> -->

        <UStepper :items="items" class="w-full" />
      </div>

    </UDashboardPanel>

    <UDashboardPanel
      collapsible
      grow
      side="right"
    >
    <UDashboardNavbar>
      <template #toggle>
        <UDashboardNavbarToggle icon="i-heroicons-x-mark" />

        <UDivider
          orientation="vertical"
          class="mx-1.5 lg:hidden"
        />
      </template>

      <template #left>
        <UDashboardNavbar
        :title="planificacion.nombre"
      >
        <template #right>
            <UBadge class="ml-2">
              {{ fechaDesdeFormatted }} - {{ fechaHastaFormatted }}
            </UBadge>
        </template>
      </UDashboardNavbar>
      </template>

      <template #right>
        <UTooltip text="Archive">
          <UButton
            icon="tabler:brand-google-drive"
            color="gray"
            variant="ghost"
          />
        </UTooltip>

        <UTooltip text="Move to junk">
          <UButton
            icon="tabler:trash"
            color="gray"
            variant="ghost"
          />
        </UTooltip>

        <UDivider
          orientation="vertical"
          class="mx-1.5"
        />

        <UPopover :popper="{ placement: 'bottom-start' }">
          <template #default="{ open }">
            <UTooltip
              text="Snooze"
              :prevent="open"
            >
              <UButton
                icon="i-heroicons-clock"
                color="gray"
                variant="ghost"
                :class="[open && 'bg-gray-50 dark:bg-gray-800']"
              />
            </UTooltip>
          </template>

          <template #panel="{ close }">
            <DatePicker @close="close" />
          </template>
        </UPopover>
      </template>

    
    </UDashboardNavbar>
      <template v-if="selectedMail">
        <!-- ~/components/inbox/InboxMail.vue -->
        <InboxMail :mail="selectedMail" />
      </template>
      <div
        v-else
        class="flex-1 hidden lg:flex items-center justify-center"
      >
        <UIcon
          name="i-heroicons-inbox"
          class="w-32 h-32 text-gray-400 dark:text-gray-500"
        />
      </div>
    </UDashboardPanel>
  </UDashboardPage>
  
</template>
