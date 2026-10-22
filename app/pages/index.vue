<script setup lang="ts">
definePageMeta({ layout: 'default-two' })

const SEO_TITLE = 'Flopi Docentes — Tu planificación, lista en una charla'
const SEO_DESCRIPTION = 'Flopi es una asistente para docentes de inicial y primaria de Uruguay. Le contás los días y el tema, y arma cada tramo del día con su meta y su plan, usando los contenidos del programa. Lo ajustás y lo descargás en PDF o Word.'

useSeoMeta({
  titleTemplate: '',
  title: SEO_TITLE,
  ogTitle: SEO_TITLE,
  description: SEO_DESCRIPTION,
  ogDescription: SEO_DESCRIPTION,
})

// Los pasos reales de la charla, en el orden en que pasan.
const pasos = [
  {
    titulo: 'Elegís el grupo y los días',
    texto: 'Un día, una semana o los que necesites. Flopi busca solo en lo que corresponde al grado del grupo.',
    icono: 'i-tabler-users-group',
  },
  {
    titulo: 'Contás el tema de cada tramo',
    texto: 'Escribilo con tus palabras ("quiero trabajar fracciones") o elegí un área. Te muestra los contenidos y criterios de logro para que marques los tuyos.',
    icono: 'i-tabler-message-circle',
  },
  {
    titulo: 'Flopi redacta',
    texto: 'Arma la meta de aprendizaje, el plan de la clase, las adecuaciones y los recursos. Sumás los tramos que quieras a cada día.',
    icono: 'i-tabler-pencil',
  },
  {
    titulo: 'La ajustás y la descargás',
    texto: 'Pedile cambios hablando o editá el texto vos. Cuando te convence, la bajás en PDF o Word.',
    icono: 'i-tabler-download',
  },
]

// Lo que hay cargado hoy en el sistema.
const programa = [
  { cifra: '2.946', nombre: 'contenidos' },
  { cifra: '2.642', nombre: 'criterios de logro' },
  { cifra: '10', nombre: 'competencias generales' },
  { cifra: '12', nombre: 'grados, de Inicial 3 a 9no' },
]

const partesDelDocumento = [
  { titulo: 'Meta de aprendizaje', texto: 'Una oración clara de lo que van a lograr los estudiantes.' },
  { titulo: 'Contenido, criterio y competencias', texto: 'Los que elegiste, con el texto del programa.' },
  { titulo: 'Plan de aprendizaje', texto: 'Los pasos de la intervención docente, con las preguntas para hacerle al grupo.' },
  { titulo: 'Adecuaciones y recursos', texto: 'Apoyos para quienes los necesiten y los materiales de ese día.' },
]
</script>

<template>
  <div class="bg-white text-mona-950">
    <AppHeader />

    <!-- ============ Inicio ============ -->
    <section class="bg-panal border-b-2 border-miel-200">
      <div class="max-w-6xl mx-auto grid lg:grid-cols-[minmax(0,1fr)_minmax(0,27rem)] items-center gap-10 lg:gap-14 px-4 sm:px-6 py-12 lg:py-20">
        <div>
          <p class="inline-flex items-center gap-2 text-sm font-extrabold text-mona-700 bg-mona-50 border-2 border-mona-100 rounded-full px-3.5 py-1">
            <UIcon name="i-tabler-school" class="w-4 h-4" />
            Para docentes de inicial y primaria de Uruguay
          </p>

          <h1 class="font-display font-bold text-mona-900 leading-[0.95] mt-5 text-[clamp(2.5rem,6.2vw,4.4rem)]">
            Tu planificación,<br>
            lista en <span class="subrayado">una charla</span>.
          </h1>

          <p class="mt-6 text-xl text-mona-800/85 leading-relaxed max-w-xl">
            Flopi es una abejita que conoce el programa. Le contás para qué días planificás y qué querés
            trabajar, y te arma cada tramo con su meta y su plan para que los ajustes a tu manera.
          </p>

          <div class="mt-8 flex flex-wrap items-center gap-3">
            <NuxtLink to="/signup" class="boton-miel inline-flex items-center gap-2 px-7 py-4 rounded-2xl font-display text-xl font-semibold">
              Crear mi cuenta
              <UIcon name="i-tabler-arrow-right" class="w-6 h-6" />
            </NuxtLink>
            <NuxtLink to="/login" class="boton-mona inline-flex items-center px-6 py-4 rounded-2xl font-display text-xl font-semibold">
              Ya tengo cuenta
            </NuxtLink>
          </div>
        </div>

        <LandingDemoChat />
      </div>
    </section>

    <!-- ============ Cómo funciona ============ -->
    <section id="como-funciona" class="scroll-mt-20 max-w-6xl mx-auto px-4 sm:px-6 py-16 lg:py-24">
      <h2 class="font-display text-4xl sm:text-5xl font-bold text-mona-900 leading-none max-w-2xl">
        Día por día, sin formularios eternos
      </h2>
      <p class="mt-4 text-lg text-mona-800/80 max-w-2xl">
        Flopi pregunta de a una cosa por vez. Podés responder con un clic o escribiendo.
      </p>

      <ol class="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
        <li v-for="(paso, i) in pasos" :key="paso.titulo" class="relative">
          <div class="celda">
            <span class="font-display text-3xl font-bold text-mona-900">{{ i + 1 }}</span>
          </div>
          <h3 class="font-display text-2xl font-bold text-mona-900 mt-4 leading-tight">{{ paso.titulo }}</h3>
          <p class="mt-2 text-mona-800/85 leading-relaxed">{{ paso.texto }}</p>
        </li>
      </ol>
    </section>

    <!-- ============ El programa ============ -->
    <section id="programa" class="scroll-mt-20 bg-panal-mona text-white">
      <div class="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center px-4 sm:px-6 py-16 lg:py-24">
        <div>
          <h2 class="font-display text-4xl sm:text-5xl font-bold leading-none">
            Flopi redacta.<br>
            <span class="text-miel-300">El programa no lo inventa.</span>
          </h2>
          <p class="mt-6 text-lg text-mona-100 leading-relaxed">
            Los contenidos, los criterios de logro y las competencias generales están cargados en el
            sistema, tal como figuran en el programa. Flopi solo puede elegir entre esos, y vos confirmás
            cada uno con un clic antes de que escriba nada.
          </p>
          <p class="mt-4 text-lg text-mona-100 leading-relaxed">
            En el documento final, ese texto se copia del programa. La inteligencia artificial escribe
            la meta y el plan de la clase, que son tuyos para cambiar.
          </p>
        </div>

        <dl class="grid grid-cols-2 gap-4">
          <div v-for="dato in programa" :key="dato.nombre" class="rounded-3xl bg-white/10 border-2 border-white/15 px-5 py-6">
            <dd class="font-display text-5xl font-bold text-miel-300 leading-none">{{ dato.cifra }}</dd>
            <dt class="mt-2 text-mona-100 font-bold leading-snug">{{ dato.nombre }}</dt>
          </div>
        </dl>
      </div>
    </section>

    <!-- ============ El documento ============ -->
    <section id="documento" class="scroll-mt-20 max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center px-4 sm:px-6 py-16 lg:py-24">
      <!-- La hoja -->
      <div class="bg-white rounded-3xl border-2 border-mona-200 shadow-[0_10px_0_0_var(--color-mona-100)] overflow-hidden lg:-rotate-1">
        <p class="font-display text-2xl font-bold text-mona-900 text-center tracking-wide pt-5">LUNES 13 DE ABRIL</p>
        <div class="m-4 rounded-2xl border-2 border-mona-200 overflow-hidden text-[14px] leading-relaxed">
          <p class="font-display text-lg font-bold italic text-mona-900 text-center bg-mona-50 border-b-2 border-mona-200 py-1.5">TRAMO I</p>
          <div class="grid grid-cols-2 border-b-2 border-mona-200">
            <p class="px-3 py-2 border-r-2 border-b-2 border-mona-200"><span class="rotulo">Espacio de Conocimiento:</span> De comunicación</p>
            <p class="px-3 py-2 border-b-2 border-mona-200"><span class="rotulo">Competencia general:</span> DPyC- Comunicación</p>
            <p class="px-3 py-2 border-r-2 border-mona-200"><span class="rotulo">Contenido:</span> Las categorías de palabras y los grupos sintácticos.</p>
            <p class="px-3 py-2"><span class="rotulo">Unidad Curricular:</span> Lengua Española</p>
          </div>
          <div class="px-3 py-2.5 space-y-2">
            <p>
              <span class="rotulo">Meta de aprendizaje:</span>
              Los estudiantes identificarán y clasificarán sustantivos, verbos y adjetivos presentes en la reseña de un cuento
              para reconocer cómo cada clase de palabra aporta sentido al texto.
            </p>
            <p><span class="rotulo">Actividad:</span> Clasificación de palabras en una reseña.</p>
            <p><span class="rotulo">Plan de aprendizaje y desarrollo de la intervención docente:</span></p>
            <ul class="list-disc pl-6 space-y-0.5">
              <li>Leer en voz alta la reseña elegida.</li>
              <li>
                Guiar la exploración del texto con preguntas:
                <ul class="list-[circle] pl-6">
                  <li>¿De qué o de quién se habla en cada oración?</li>
                  <li>¿Qué acciones aparecen?</li>
                </ul>
              </li>
              <li>Proponer el trabajo en duplas con colores para cada clase de palabra.</li>
            </ul>
          </div>
        </div>
      </div>

      <div>
        <h2 class="font-display text-4xl sm:text-5xl font-bold text-mona-900 leading-none">
          Una hoja lista para llevar al aula
        </h2>
        <p class="mt-4 text-lg text-mona-800/80">
          Este ejemplo lo escribió Flopi para un grupo de 6to que quería trabajar las clases de palabras. Cada día lleva los tramos que le sumes.
        </p>

        <ul class="mt-8 space-y-5">
          <li v-for="parte in partesDelDocumento" :key="parte.titulo" class="flex gap-3.5">
            <span class="hexagono mt-1" aria-hidden="true" />
            <div>
              <h3 class="font-display text-xl font-bold text-mona-900 leading-tight">{{ parte.titulo }}</h3>
              <p class="text-mona-800/85">{{ parte.texto }}</p>
            </div>
          </li>
        </ul>

        <p class="mt-8 flex flex-wrap items-center gap-2 text-mona-900 font-bold">
          Se descarga en
          <span class="inline-flex items-center gap-1.5 bg-mona-50 border-2 border-mona-100 rounded-xl px-3 py-1">
            <UIcon name="i-tabler-file-type-pdf" class="w-5 h-5 text-red-600" /> PDF
          </span>
          y
          <span class="inline-flex items-center gap-1.5 bg-mona-50 border-2 border-mona-100 rounded-xl px-3 py-1">
            <UIcon name="i-tabler-file-type-docx" class="w-5 h-5 text-mona-600" /> Word
          </span>
        </p>
      </div>
    </section>

    <!-- ============ Cierre ============ -->
    <section class="bg-miel-300 border-y-2 border-miel-500">
      <div class="max-w-4xl mx-auto flex flex-col items-center text-center px-4 sm:px-6 py-16">
        <FlopiBee :size="150" />
        <h2 class="font-display text-4xl sm:text-6xl font-bold text-mona-900 leading-none mt-4">
          ¿Arrancamos con la primera?
        </h2>
        <p class="mt-4 text-xl text-mona-900/80 max-w-xl">
          Creá tu cuenta, cargá tu grupo y pedile a Flopi la planificación de la semana.
        </p>
        <NuxtLink to="/signup" class="boton-cierre inline-flex items-center gap-2 px-8 py-4 mt-8 rounded-2xl font-display text-xl font-semibold">
          Crear mi cuenta
          <UIcon name="i-tabler-arrow-right" class="w-6 h-6" />
        </NuxtLink>
      </div>
    </section>

    <AppFooter />
  </div>
</template>

<style scoped>
/* Subrayado de fibra amarilla bajo "una charla". */
.subrayado {
  background-image: linear-gradient(transparent 62%, var(--color-miel-300) 62%, var(--color-miel-300) 92%, transparent 92%);
  padding: 0 0.08em;
  white-space: nowrap;
}

/* Etiquetas del documento: negrita subrayada, con el color del espacio de conocimiento. */
.rotulo {
  font-weight: 800;
  text-decoration: underline;
  text-underline-offset: 2px;
  color: #ed028c;
}

/* Celda de panal con el número del paso. */
.celda {
  width: 4.5rem;
  height: 5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-miel-300);
  clip-path: polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%);
}

.hexagono {
  flex-shrink: 0;
  width: 1.1rem;
  height: 1.25rem;
  background-color: var(--color-miel-400);
  clip-path: polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%);
}


.boton-cierre {
  background-color: var(--color-mona-800);
  color: #fff;
  box-shadow: 0 5px 0 0 var(--color-mona-950);
  transition: transform 0.1s ease, box-shadow 0.1s ease, background-color 0.15s ease;
}

.boton-cierre:hover {
  background-color: var(--color-mona-700);
}

.boton-cierre:active {
  transform: translateY(3px);
  box-shadow: 0 2px 0 0 var(--color-mona-950);
}

@media (prefers-reduced-motion: reduce) {
  .boton-cierre { transition: none; }
  .boton-cierre:active { transform: none; }
}
</style>
