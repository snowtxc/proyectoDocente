<script setup lang="ts">
import { usePlanificacionService } from "~/services/planificacionService/planificacionService";

interface Props {
    modelValue?: string;
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: undefined,
});

const emit = defineEmits(["update:modelValue"]);

const updateValue = (value) => {
    emit("update:modelValue", value);
};

// Función para limpiar la selección
const clearSelection = () => {
    emit("update:modelValue", undefined); // O puedes usar una cadena vacía ''
};
</script>

<template>
    <div class="relative">
        <USelectMenu
            @change="updateValue"
            searchable
            searchable-placeholder="Buscar estado"
            class="w-full"
            option-attribute="nombre"
            :search-attributes="['nombre']"
            :options="['En curso', 'Finalizada', 'Pendiente']"
            :multiple="false"
            :model-value="props.modelValue"
        >
            <template #label>
                <span v-if="modelValue === '' || modelValue === undefined">
                    {{ "Seleccionar Estado" }}
                </span>
                <span v-else class="truncate flex flex-wrap gap-2">
                    <UBadge
                        :label="props.modelValue"
                        :variant="'outline'"
                        :color="(getColorsEstado(props.modelValue ?? '') as any)"
                    />
                </span>
            </template>

            <template #option="{ option }">
                <UBadge
                    :label="option"
                    :variant="'outline'"
                    :color="(getColorsEstado(option ?? '') as any)"
                />
            </template>
        </USelectMenu>

        <button
            v-if="props.modelValue !== undefined && props.modelValue !== ''"
            @click="clearSelection"
            class="absolute top-2 right-2 text-sm text-gray-500 hover:text-gray-700"
        >
             <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
        </button>
    </div>
</template>
