<script setup lang="ts">
import type { Grupo } from '~/types/grupo'
import type { Grado } from '~/types/grado'
import { ModeEnum } from '~/utils/enums/ModeEnum'
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum'
import { apiGradoRoutes, apiGrupoRoutes } from '~/utils/apiRoutes'
import { DEFAULT_GRUPO_LOGO, grupoImagen } from '~/utils/grupo'

// Formulario de un grupo (nuevo o para editar): nombre, año, grados y una imagen opcional.
// Flopi usa los grados para buscar en el programa y, en un grupo multigrado, divide el plan por grado.
const props = defineProps<{
  mode: ModeEnum
  grupoSelected?: Grupo | null
  // Los grados que ya cargó la página; si no vienen, se piden.
  grados?: Grado[]
}>()

const emit = defineEmits(['on:update', 'close'])

const { $apiRest } = useNuxtApp()
const toast = useToast()

const editando = computed(() => props.mode === ModeEnum.UPDATE && !!props.grupoSelected)

// ---------------------------------------------------------------- Estado

const nombre = ref(props.grupoSelected?.nombre ?? '')
const year = ref<number>(props.grupoSelected?.year ?? new Date().getFullYear())
const esMultiGrado = ref<boolean>(!!props.grupoSelected?.esMultiGrado)
const elegidos = ref<number[]>((props.grupoSelected?.grados ?? []).map(grado => grado.id))
const archivo = ref<File | null>(null)
const vistaImagen = ref<string | null>(null)
const imagenRota = ref(false)
const guardando = ref(false)
const intentado = ref(false)
const entrada = ref<HTMLInputElement>()

const listaGrados = ref<Grado[]>(props.grados ?? [])
const cargandoGrados = ref(false)

onMounted(async () => {
  if (listaGrados.value.length) return

  cargandoGrados.value = true
  try {
    listaGrados.value = await $apiRest<Grado[]>(apiGradoRoutes.listAll, HttpMethodEnum.GET)
  } catch {
    toast.error({ title: 'No se pudieron cargar los grados', message: 'Cerrá y volvé a abrir el formulario.' })
  } finally {
    cargandoGrados.value = false
  }
})

// ---------------------------------------------------------------- Año

// El año pasado, este y el que viene (en noviembre ya se arman los grupos del año siguiente).
const anios = computed(() => {
  const actual = new Date().getFullYear()
  const lista = [actual - 1, actual, actual + 1]

  return lista.includes(year.value) ? lista : [year.value, ...lista].sort((a, b) => a - b)
})

// ---------------------------------------------------------------- Grados

// Agrupados como en el programa: inicial, primaria y media básica.
const secciones = computed(() => {
  const ordenados = [...listaGrados.value].sort((a, b) => a.id - b.id)
  const de = (desde: number, hasta: number) => ordenados.filter(g => g.ciclo_grado_id >= desde && g.ciclo_grado_id <= hasta)

  return [
    { titulo: 'Inicial', grados: de(1, 1) },
    { titulo: 'Primaria', grados: de(2, 4) },
    { titulo: '7mo a 9no', grados: de(5, 6) },
  ].filter(seccion => seccion.grados.length)
})

// "Inicial 4 años" se muestra como "4 años" dentro de la sección Inicial.
const nombreCorto = (grado: Grado) => grado.nombre.replace(/^Inicial\s+/i, '')

const alternarGrado = (grado: Grado) => {
  if (!esMultiGrado.value) {
    elegidos.value = [grado.id]
    return
  }

  elegidos.value = elegidos.value.includes(grado.id)
    ? elegidos.value.filter(id => id !== grado.id)
    : [...elegidos.value, grado.id]
}

// Al dejar de ser multigrado queda uno solo (el primero que había elegido).
watch(esMultiGrado, (multi) => {
  if (!multi && elegidos.value.length > 1) elegidos.value = elegidos.value.slice(0, 1)
})

const gradosElegidos = computed(() => listaGrados.value.filter(grado => elegidos.value.includes(grado.id)))

// ---------------------------------------------------------------- Imagen

const imagenGuardada = computed(() => {
  const url = grupoImagen(props.grupoSelected)
  return url !== DEFAULT_GRUPO_LOGO ? url : null
})
const imagen = computed(() => imagenRota.value ? null : (vistaImagen.value ?? imagenGuardada.value))
const inicial = computed(() => nombre.value.trim().charAt(0).toUpperCase() || '?')

const TIPOS = ['jpg', 'jpeg', 'png', 'gif']
const MAXIMO_MB = 2

const elegirImagen = () => entrada.value?.click()

const alElegirImagen = (evento: Event) => {
  const elegido = (evento.target as HTMLInputElement).files?.[0]
  ;(evento.target as HTMLInputElement).value = ''
  if (!elegido) return

  const extension = elegido.name.split('.').pop()?.toLowerCase() ?? ''

  if (!TIPOS.includes(extension)) {
    toast.error({ title: 'Ese archivo no sirve', message: 'La imagen tiene que ser JPG, PNG o GIF.' })
    return
  }

  if (elegido.size > MAXIMO_MB * 1024 * 1024) {
    toast.error({ title: 'Imagen muy pesada', message: `Puede pesar hasta ${MAXIMO_MB} MB.` })
    return
  }

  const lector = new FileReader()
  lector.onload = () => {
    archivo.value = elegido
    vistaImagen.value = lector.result as string
    imagenRota.value = false
  }
  lector.readAsDataURL(elegido)
}

const quitarImagenNueva = () => {
  archivo.value = null
  vistaImagen.value = null
}

// ---------------------------------------------------------------- Guardar

const errores = computed(() => ({
  nombre: !nombre.value.trim() ? 'Poné un nombre para el grupo.' : '',
  grados: !elegidos.value.length
    ? (esMultiGrado.value ? 'Elegí los grados del grupo.' : 'Elegí el grado del grupo.')
    : esMultiGrado.value && elegidos.value.length < 2 ? 'Un grupo multigrado tiene al menos dos grados. Elegí otro o desactivá "Multigrado".' : '',
}))

const valido = computed(() => !errores.value.nombre && !errores.value.grados)

const mensajeDe = (error: any) => {
  const lista = error?.errors ? Object.values(error.errors).flat() : (error && typeof error === 'object' && !error.message ? Object.values(error).flat() : [])
  return (lista.find(v => typeof v === 'string') as string | undefined) ?? (typeof error === 'string' ? error : (error?.message ?? 'Probá de nuevo.'))
}

const guardar = async () => {
  intentado.value = true
  if (!valido.value) return

  const datos = new FormData()
  datos.append('nombre', nombre.value.trim())
  datos.append('year', String(year.value))
  datos.append('esMultiGrado', esMultiGrado.value ? '1' : '0')
  datos.append('grados', JSON.stringify(gradosElegidos.value.map(grado => ({ id: grado.id }))))
  if (archivo.value) datos.append('logo', archivo.value)

  guardando.value = true

  try {
    const grupo = editando.value
      ? await $apiRest<Grupo>(apiGrupoRoutes.update(props.grupoSelected!.id), HttpMethodEnum.POST, datos)
      : await $apiRest<Grupo>(apiGrupoRoutes.create, HttpMethodEnum.POST, datos)

    toast.success({
      title: editando.value ? 'Cambios guardados' : '¡Grupo creado!',
      message: editando.value ? grupo.nombre : `${grupo.nombre} ya está listo para planificar con Flopi.`,
    })
    emit('on:update')
    emit('close')
  } catch (error: any) {
    toast.error({ title: 'No se pudo guardar el grupo', message: mensajeDe(error) })
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <form class="flex flex-col min-h-full" novalidate @submit.prevent="guardar">
    <div class="flex-1 space-y-6 px-4 sm:px-6 py-5">
      <!-- Cómo se va a ver el grupo: igual que su tarjeta en Mis grupos -->
      <div class="vista-grupo" aria-hidden="true">
        <div class="franja relative h-14">
          <span class="absolute top-2.5 right-3 font-display text-base font-bold text-mona-900 bg-white/85 rounded-xl px-2.5 py-0.5">{{ year }}</span>
        </div>
        <div class="relative px-4 -mt-8">
          <img
            v-if="imagen"
            :src="imagen"
            alt=""
            class="w-16 h-16 rounded-2xl border-4 border-white object-cover bg-miel-50 shadow-sm"
            @error="imagenRota = true"
          >
          <span
            v-else
            class="w-16 h-16 rounded-2xl border-4 border-white bg-mona-800 text-miel-300 shadow-sm flex items-center justify-center font-display text-3xl font-bold"
          >
            {{ inicial }}
          </span>
        </div>
        <div class="px-4 pt-2 pb-4">
          <p class="font-display text-xl font-bold leading-tight break-words" :class="nombre.trim() ? 'text-mona-900' : 'text-mona-800/40'">
            {{ nombre.trim() || 'Tu grupo' }}
          </p>
          <div class="flex flex-wrap items-center gap-1 mt-1.5 min-h-6">
            <BadgeGrado v-for="grado in gradosElegidos" :key="grado.id" :grado="grado" />
            <span v-if="esMultiGrado && gradosElegidos.length > 1" class="text-[10px] font-extrabold uppercase tracking-wide text-mona-700 bg-mona-50 rounded-full px-2 py-0.5">
              Multigrado
            </span>
            <span v-if="!gradosElegidos.length" class="text-xs text-mona-800/50">Sin grado todavía</span>
          </div>
        </div>
      </div>

      <!-- Nombre -->
      <div>
        <label for="grupo-nombre" class="etiqueta">Nombre del grupo</label>
        <UInput
          id="grupo-nombre"
          v-model="nombre"
          size="xl"
          class="w-full"
          maxlength="255"
          placeholder="Por ejemplo: 4to A"
          :autofocus="!editando"
          :color="intentado && errores.nombre ? 'error' : undefined"
          :highlight="intentado && !!errores.nombre"
          :aria-invalid="intentado && !!errores.nombre"
        />
        <p v-if="intentado && errores.nombre" class="error">{{ errores.nombre }}</p>
      </div>

      <!-- Año -->
      <div>
        <p class="etiqueta">Año lectivo</p>
        <div class="flex gap-2" role="radiogroup" aria-label="Año lectivo">
          <button
            v-for="anio in anios"
            :key="anio"
            type="button"
            role="radio"
            class="anio"
            :class="{ elegido: year === anio }"
            :aria-checked="year === anio"
            @click="year = anio"
          >
            {{ anio }}
          </button>
        </div>
      </div>

      <!-- Grados -->
      <div>
        <div class="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <div>
            <p class="etiqueta !mb-0">{{ esMultiGrado ? 'Grados' : 'Grado' }}</p>
            <p class="text-sm text-mona-800/70">
              {{ esMultiGrado ? 'Tocá todos los grados del grupo.' : 'Flopi lo usa para buscar en el programa.' }}
            </p>
          </div>
          <label class="multigrado">
            <USwitch v-model="esMultiGrado" />
            <span>
              <span class="block font-bold text-mona-900">Multigrado</span>
              <span class="block text-xs text-mona-800/70">Varios grados juntos</span>
            </span>
          </label>
        </div>

        <div class="mt-3 space-y-3" :class="{ 'con-error': intentado && errores.grados }">
          <p v-if="cargandoGrados" class="flex items-center gap-2 text-sm text-mona-800/70">
            <UIcon name="i-tabler-loader-2" class="w-4 h-4 animate-spin" /> Cargando los grados…
          </p>
          <div v-for="seccion in secciones" :key="seccion.titulo">
            <p class="text-[11px] font-extrabold uppercase tracking-wide text-mona-700/80 mb-1.5">{{ seccion.titulo }}</p>
            <div class="flex flex-wrap gap-2" :role="esMultiGrado ? 'group' : 'radiogroup'" :aria-label="seccion.titulo">
              <button
                v-for="grado in seccion.grados"
                :key="grado.id"
                type="button"
                class="grado"
                :class="{ elegido: elegidos.includes(grado.id) }"
                :role="esMultiGrado ? undefined : 'radio'"
                :aria-checked="esMultiGrado ? undefined : elegidos.includes(grado.id)"
                :aria-pressed="esMultiGrado ? elegidos.includes(grado.id) : undefined"
                @click="alternarGrado(grado)"
              >
                <UIcon v-if="elegidos.includes(grado.id)" name="i-tabler-check" class="w-4 h-4" />
                {{ nombreCorto(grado) }}
              </button>
            </div>
          </div>
        </div>
        <p v-if="intentado && errores.grados" class="error">{{ errores.grados }}</p>
        <p v-else-if="esMultiGrado" class="text-xs text-mona-800/70 mt-2">
          En un grupo multigrado, Flopi arma el plan con una parte para todos y otra para cada grado.
        </p>
      </div>

      <!-- Imagen -->
      <div>
        <p class="etiqueta">Imagen <span class="font-normal text-mona-800/60">(opcional)</span></p>
        <div class="flex flex-wrap items-center gap-3">
          <button type="button" class="boton-mona inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm" @click="elegirImagen">
            <UIcon name="i-tabler-photo" class="w-4 h-4" />
            {{ imagen ? 'Cambiar la imagen' : 'Subir una imagen' }}
          </button>
          <button v-if="archivo" type="button" class="text-sm font-bold text-mona-800/70 hover:text-red-700" @click="quitarImagenNueva">
            {{ imagenGuardada ? 'Dejar la que tenía' : 'Quitar' }}
          </button>
        </div>
        <p class="text-xs text-mona-800/65 mt-1.5">Una foto de la clase o el logo de la escuela. JPG, PNG o GIF, hasta {{ MAXIMO_MB }} MB. Sin imagen, va la inicial del nombre.</p>
        <input ref="entrada" type="file" class="hidden" accept=".jpg,.jpeg,.png,.gif" @change="alElegirImagen">
      </div>
    </div>

    <!-- Acciones: quedan a mano aunque el formulario sea largo -->
    <div class="acciones">
      <button type="button" class="px-4 py-2.5 rounded-xl font-bold text-mona-800 hover:bg-mona-50" :disabled="guardando" @click="emit('close')">
        Cancelar
      </button>
      <button type="submit" class="boton-miel inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-display text-lg font-semibold" :disabled="guardando">
        <UIcon :name="guardando ? 'i-tabler-loader-2' : 'i-tabler-check'" class="w-5 h-5" :class="{ 'animate-spin': guardando }" />
        {{ guardando ? 'Guardando…' : (editando ? 'Guardar cambios' : 'Crear grupo') }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.vista-grupo {
  border: 2px solid var(--color-mona-100);
  border-radius: 1.25rem;
  overflow: hidden;
  background: #fff;
}

.franja {
  background-color: var(--color-miel-300);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='97' viewBox='0 0 56 97'%3E%3Cpath d='M28 1 55 16.5v31L28 63 1 47.5v-31z M28 63v33 M1 47.5 -26 63 M55 47.5 82 63' fill='none' stroke='%23d07c00' stroke-opacity='.35' stroke-width='2'/%3E%3C/svg%3E");
  background-size: 42px 73px;
}

.etiqueta {
  display: block;
  font-size: 0.9rem;
  font-weight: 800;
  color: var(--color-mona-900);
  margin-bottom: 0.45rem;
}

.error {
  margin-top: 0.4rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #b91c1c;
}

.anio {
  flex: 1;
  padding: 0.55rem 0.5rem;
  border: 2px solid var(--color-mona-100);
  border-radius: 0.9rem;
  background: #fff;
  font-family: var(--font-display);
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--color-mona-800);
}

.anio:hover {
  border-color: var(--color-mona-300);
}

.anio.elegido {
  border-color: var(--color-mona-600);
  background: var(--color-mona-600);
  color: #fff;
}

.multigrado {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.4rem 0.7rem;
  border-radius: 0.8rem;
  background: var(--color-mona-50);
  cursor: pointer;
  font-size: 0.9rem;
}

.grado {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  min-width: 3.5rem;
  justify-content: center;
  padding: 0.5rem 0.85rem;
  border: 2px solid var(--color-mona-100);
  border-radius: 0.9rem;
  background: #fff;
  font-weight: 700;
  color: var(--color-mona-900);
  transition: border-color 0.12s ease, background-color 0.12s ease;
}

.grado:hover {
  border-color: var(--color-mona-300);
}

.grado.elegido {
  border-color: var(--color-mona-600);
  background: var(--color-mona-50);
  color: var(--color-mona-900);
  box-shadow: inset 0 0 0 1px var(--color-mona-600);
}

.con-error .grado:not(.elegido) {
  border-color: #fecaca;
}

.acciones {
  position: sticky;
  bottom: 0;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 0.85rem 1rem;
  border-top: 2px solid var(--color-mona-50);
  background: #fff;
}

@media (min-width: 640px) {
  .acciones {
    padding: 0.9rem 1.5rem;
  }
}
</style>
