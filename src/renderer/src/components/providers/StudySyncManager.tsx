import { useStudyActions } from "@renderer/store/studyStore";
import { useWorldlineStore } from "@renderer/store/worldlineStore";
import { useEffect, type ReactNode } from "react";

interface StudySyncManagerProps{
    children: ReactNode;
}
export const StudySyncManager = ({children}:StudySyncManagerProps) => {
    const activeElectronId = useWorldlineStore((state)=>state.activeElectronId);

    const {loadStudyData, clearStudyData} = useStudyActions();
    useEffect(()=>{
        if(activeElectronId){
            loadStudyData();
        }else{
            clearStudyData();
        }        
    },[activeElectronId, loadStudyData, clearStudyData]);
    return(
        <>
            {children}
        </>
    )
}
