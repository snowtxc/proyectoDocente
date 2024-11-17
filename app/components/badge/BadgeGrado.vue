<script setup lang="ts">
import type { Grado } from '~/types/grado';
import { CicloGradoEnum } from '~/utils/enums/CicloGradoEnum';

interface Props {
    grado: Grado
}

const props = withDefaults(defineProps<Props>() , {});

</script>


<template>
    <UBadge
        :label="props.grado.nombre"
        :color="
            props.grado.ciclo_grado_id == CicloGradoEnum.TRAMO_1 ? 'red' : 
            props.grado.ciclo_grado_id == CicloGradoEnum.TRAMO_2 ? 'orange': 
            props.grado.ciclo_grado_id == CicloGradoEnum.TRAMO_3 ? 'blue' :
            props.grado.ciclo_grado_id == CicloGradoEnum.TRAMO_4 ? 'green' : 'red'"
        variant="subtle"
        class="capitalize"
    />
</template>