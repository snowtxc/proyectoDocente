import type { DriveListModeEnum } from "~/utils/enums/DriveListModeEnum";

export interface ListFoldersDTO {
    folderId? : string;
    listMode? : DriveListModeEnum
}

export interface DriveFolder{
    id: string;
    name: string;
}

export interface DriveFolderList {
    isRoot:boolean;
    folders: DriveFolder[]
}