import type { Prompt } from "~/types/prompt";

export const MetaDeAprendizajePrompt = {

    generarMetaAprendizaje : (
        instruction : string, 
        params: any)=>{

            return instruction
            .replace("@criteriosDeLogros", params['criteriosDeLogros'])
            .replace("@contenido", params['contenido'])
            .replace("@competenciasEspecificas", params['competenciasEspecificas'])
            .replace("@grados", params['grados']);    
    },

    mejorarRedaccionMetaAprendizaje : (
        instruction : string, 
        params: any)=>{
            return instruction
            .replace("@metaDeAprendizaje", params['metaAprendizajeText']);
    },

    generarInstructionByPrompt : function(prompt: Prompt,  params:any){

        let result: string;
        
        switch(prompt.id){
            case 1:
                result = this.generarMetaAprendizaje(prompt.instruction, params);
                break;
            case 2: 
                result = this.mejorarRedaccionMetaAprendizaje(prompt.instruction, params);
        }
        
        return result;
    }   
}
