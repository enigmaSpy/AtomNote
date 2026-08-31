import { useStudyActions } from "@renderer/store/studyStore";
import { useWorldlineStore } from "@renderer/store/worldlineStore";
import { getCurrentFileName } from "@renderer/utils/currentFileName";
import { useEffect, type ReactNode } from "react";

interface StudySyncManagerProps{
    children: ReactNode;
}
export const StudySyncManager = ({children}:StudySyncManagerProps) => {
    const activeElectronId = useWorldlineStore((state)=>state.activeElectronId);
    const rootPath = useWorldlineStore(state=>state.worldlineData?.worldline.rootPath);

    const {loadStudyData, clearStudyData} = useStudyActions();
    useEffect(()=>{
        const {atomName} = getCurrentFileName();
        if(activeElectronId && rootPath && atomName){
            loadStudyData(rootPath, atomName, activeElectronId);
        }else{
            clearStudyData();
        }        
    },[activeElectronId,rootPath, loadStudyData, clearStudyData]);
    return(
        <>
            {children}
        </>
    )
}
