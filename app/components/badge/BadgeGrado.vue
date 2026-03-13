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
        size="md"
        :label="props.grado.nombre"
        :color="
            props.grado.ciclo_grado_id == CicloGradoEnum.TRAMO_1 ? 'error' :  
            props.grado.ciclo_grado_id == CicloGradoEnum.TRAMO_2 ? 'warning': 
            props.grado.ciclo_grado_id == CicloGradoEnum.TRAMO_3 ? 'secondary' : 
            props.grado.ciclo_grado_id == CicloGradoEnum.TRAMO_4 ? 'success' : 'error'"
        variant="subtle"
        class="capitalize"
    />
</template>