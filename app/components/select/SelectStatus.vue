<script setup lang="ts">
import { PlanificacionEstadoEnum } from "~/utils/enums/PlanificacionEstado.enum";

interface Props {
    modelValue?: PlanificacionEstadoEnum;
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


const options = [
    { label : 'En curso', value: PlanificacionEstadoEnum.EN_CURSO},
    { label : 'Sin empezar', value: PlanificacionEstadoEnum.PENDIENTE},
    { label : 'Finalizada' , value: PlanificacionEstadoEnum.FINALIZADA}
]


const optionSelectedLabel = computed(()=>{
    if(!props.modelValue)
        return null;

    return options.find(x => x.value == props.modelValue).label;
});
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
            value-attribute="value"
            :options="options"
            :multiple="false"
            :model-value="props.modelValue"
        >
            <template #label>
                <button
                    v-if="props.modelValue !== undefined"
                    @click="clearSelection"
                    class="relative top-1"
                   
                >
                    <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
                </button>
                <span v-if="modelValue === undefined || modelValue == null">
                    {{ "Seleccionar Estado" }}
                </span>
                <span v-else class="truncate flex flex-wrap gap-2">
                    <UBadge
                        :label="optionSelectedLabel"
                        :variant="'outline'"
                        :color="(getColorsEstado(props.modelValue) as any)"
                    />
                </span>
            </template>

            <template #option="{ option }">
                <UBadge
                    :label="option.label"
                    :variant="'outline'"
                    :color="(getColorsEstado(option.value ?? '') as any)"
                />
            </template>
        </USelectMenu>
    </div>
</template>
