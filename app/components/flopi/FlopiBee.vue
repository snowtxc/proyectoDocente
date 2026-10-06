<script setup lang="ts">
// Flopi, la abejita del asistente. Tiene moña azul, como la de la túnica escolar.
withDefaults(defineProps<{
  size?: number
  // quieta: flota y parpadea · pensando: aletea rápido y se mueve · contenta: salta
  animo?: 'quieta' | 'pensando' | 'contenta'
  // Sin animación de vuelo (para avatares chicos repetidos en la pantalla).
  fija?: boolean
  // Borde blanco tipo calcomanía, para que se vea bien sobre fondos oscuros.
  calco?: boolean
}>(), {
  size: 96,
  animo: 'quieta',
  fija: false,
  calco: false,
})
</script>

<template>
  <span
    class="flopi"
    :class="[`flopi--${animo}`, { 'flopi--fija': fija, 'flopi--calco': calco }]"
    :style="{ width: `${size}px`, height: `${size}px` }"
    role="img"
    aria-label="Flopi, la abejita asistente"
  >
    <svg viewBox="0 0 120 120" width="100%" height="100%" aria-hidden="true">
      <!-- Alas -->
      <g class="flopi__alas">
        <ellipse class="flopi__ala flopi__ala--izq" cx="72" cy="44" rx="13" ry="21" fill="#dbe9ff" stroke="#172061" stroke-width="2.5" />
        <ellipse class="flopi__ala flopi__ala--der" cx="92" cy="46" rx="13" ry="21" fill="#f4f8ff" stroke="#172061" stroke-width="2.5" />
      </g>

      <!-- Aguijón -->
      <path d="M103 82 l11 5 -11 5z" fill="#172061" />

      <!-- Cuerpo -->
      <g>
        <ellipse cx="74" cy="84" rx="31" ry="25" fill="#f9bc1c" />
        <path d="M70 60.5c6 7 6 40 0 47.5 M88 62.5c6 7 6 36 0 43" fill="none" stroke="#172061" stroke-width="8" stroke-linecap="round" />
        <ellipse cx="74" cy="84" rx="31" ry="25" fill="none" stroke="#172061" stroke-width="3" />
      </g>

      <!-- Cabeza -->
      <g class="flopi__cabeza">
        <!-- Antenas -->
        <g class="flopi__antenas" fill="none" stroke="#172061" stroke-width="3" stroke-linecap="round">
          <path d="M34 44c-4-10-2-17 4-21" />
          <path d="M52 41c1-10 5-16 12-17" />
          <circle cx="38.5" cy="22" r="3.5" fill="#172061" />
          <circle cx="65" cy="23.5" r="3.5" fill="#172061" />
        </g>

        <circle cx="42" cy="68" r="27" fill="#ffd04a" stroke="#172061" stroke-width="3" />

        <!-- Mejillas -->
        <ellipse cx="25" cy="76" rx="5.5" ry="3.5" fill="#ff9a8b" opacity="0.75" />
        <ellipse cx="58" cy="78" rx="5.5" ry="3.5" fill="#ff9a8b" opacity="0.75" />

        <!-- Ojos -->
        <g class="flopi__ojos">
          <ellipse cx="32" cy="65" rx="4.6" ry="6" fill="#172061" />
          <ellipse cx="51" cy="66" rx="4.6" ry="6" fill="#172061" />
          <circle cx="33.6" cy="62.6" r="1.7" fill="#fff" />
          <circle cx="52.6" cy="63.6" r="1.7" fill="#fff" />
        </g>

        <!-- Sonrisa -->
        <path class="flopi__boca" d="M35 77c3.5 4.5 9.5 4.8 13 .6" fill="none" stroke="#172061" stroke-width="3" stroke-linecap="round" />

        <!-- Moña azul -->
        <g class="flopi__mona">
          <path d="M44 95 31 88.5c-2-1-4 .5-4 2.6v9.800000000000001c0 2.1 2 3.6 4 2.6z M44 95l13-6.5c2-1 4 .5 4 2.6v9.8c0 2.1-2 3.6-4 2.6z" fill="#3044d6" stroke="#172061" stroke-width="2.5" stroke-linejoin="round" />
          <circle cx="44" cy="95" r="4.2" fill="#4460ee" stroke="#172061" stroke-width="2.5" />
        </g>
      </g>
    </svg>
  </span>
</template>

<style scoped>
.flopi {
  display: inline-block;
  flex-shrink: 0;
  line-height: 0;
  animation: flopi-flotar 3.2s ease-in-out infinite;
}

.flopi svg {
  overflow: visible;
}

.flopi--calco svg {
  filter: drop-shadow(2px 0 0 #fff) drop-shadow(-2px 0 0 #fff) drop-shadow(0 2px 0 #fff) drop-shadow(0 -2px 0 #fff);
}

.flopi__ala {
  transform-box: fill-box;
  transform-origin: 50% 100%;
}

.flopi__ala--izq { animation: flopi-aleteo-izq 0.16s ease-in-out infinite alternate; }
.flopi__ala--der { animation: flopi-aleteo-der 0.16s ease-in-out infinite alternate; }

.flopi__ojos {
  transform-box: fill-box;
  transform-origin: center;
  animation: flopi-parpadeo 4.5s infinite;
}

.flopi__antenas {
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: flopi-antenas 3.2s ease-in-out infinite;
}

/* Pensando: vuela en un pequeño ocho y aletea más rápido. */
.flopi--pensando {
  animation: flopi-pensar 1.6s ease-in-out infinite;
}

.flopi--pensando .flopi__ala--izq,
.flopi--pensando .flopi__ala--der {
  animation-duration: 0.08s;
}

.flopi--pensando .flopi__antenas {
  animation-duration: 0.5s;
}

/* Contenta: un salto con giro. */
.flopi--contenta {
  animation: flopi-saltar 0.9s cubic-bezier(0.3, 1.4, 0.5, 1) 2, flopi-flotar 3.2s ease-in-out 1.8s infinite;
}

/* Avatar fijo: solo aletea y parpadea. */
.flopi--fija {
  animation: none;
}

@keyframes flopi-flotar {
  0%, 100% { transform: translateY(0) rotate(-2deg); }
  50% { transform: translateY(-7%) rotate(2deg); }
}

@keyframes flopi-pensar {
  0% { transform: translate(0, 0) rotate(-4deg); }
  25% { transform: translate(8%, -8%) rotate(3deg); }
  50% { transform: translate(0, -3%) rotate(-3deg); }
  75% { transform: translate(-8%, -8%) rotate(4deg); }
  100% { transform: translate(0, 0) rotate(-4deg); }
}

@keyframes flopi-saltar {
  0%, 100% { transform: translateY(0) rotate(0); }
  45% { transform: translateY(-22%) rotate(-10deg); }
  70% { transform: translateY(-4%) rotate(6deg); }
}

@keyframes flopi-aleteo-izq {
  from { transform: rotate(-22deg) scaleX(1); }
  to { transform: rotate(-40deg) scaleX(0.8); }
}

@keyframes flopi-aleteo-der {
  from { transform: rotate(8deg) scaleX(1); }
  to { transform: rotate(26deg) scaleX(0.8); }
}

@keyframes flopi-parpadeo {
  0%, 92%, 100% { transform: scaleY(1); }
  95% { transform: scaleY(0.1); }
}

@keyframes flopi-antenas {
  0%, 100% { transform: rotate(-3deg); }
  50% { transform: rotate(4deg); }
}

@media (prefers-reduced-motion: reduce) {
  .flopi,
  .flopi * {
    animation: none !important;
  }
}
</style>
