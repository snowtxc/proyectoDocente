<template>

    <div class="flex justify-end py-2 mx-5">
        <slot name="actions"> </slot>

        <UButton
        type="button"
        label="Guardar"
        class="ml-4"
        :icon="!readOnly ? 'tabler:device-floppy' : ''"
        color="primary"
        @click="guardarDocumento"
        :loading="disableEdit"
        v-if="!readOnly"
        />
    </div>

    <div id="webviewer" ref="viewer" />

</template>

<script>

export default {
  name: 'WebViewer',
  data (){
    return {
        instance: null
    }
  },
  props: {
    url: String,
    readOnly:  Boolean,
    disableEdit: Boolean
  },

  emits: {

  },

  expose: [

  ],

  methods: {
    async guardarDocumento(){

        if (!this.instance) return;

        const { documentViewer, annotationManager } = this.instance.Core;
        const doc = documentViewer.getDocument();

        const data = await doc.getFileData({});
        const arr = new Uint8Array(data);
        const blob = new Blob([arr], { type: 
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        });
      
        this.$emit('onSave', blob);
    },
  },

  mounted () {
    import('@pdftron/webviewer').then(WebViewer => {
      WebViewer.default({
        path: '/lib/webviewer',
        initialDoc: this.url, 
        licenseKey: 'demo:1758031751372:6046c33a030000000032706d0e54e339dd5dfeb99e404d007ae264bd36',
        enableOfficeEditing: this.readOnly ? false : true,
      }, this.$refs.viewer).then((instance) => {
        this.instance = instance;
      })
    })
    }
};
</script>

<style>
#webviewer {
  height: 85vh;
}
</style>
