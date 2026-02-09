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
    status: boolean;
    relogin: boolean;
    isRoot:boolean;
    folders: DriveFolder[]
}

export interface SyncFileResult {
    status : boolean;
    relogin: boolean;
    id: string;
    link : string;
}