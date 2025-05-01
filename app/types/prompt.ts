import type { BaseModel } from "./base.model";

export interface Prompt extends BaseModel{
    description: string;
    additional_description: string;
    instruction: string;
    additional_instruction: string;
}