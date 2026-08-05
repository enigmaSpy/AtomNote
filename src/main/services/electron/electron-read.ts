import { readFileApp } from "@shared/utils/file";
import { isEnoent } from "@shared/utils/warning";


export async function readElectron(rootPath, atomName, filename){
    try {
        
        return await readFileApp(rootPath, atomName, '__cache__', filename);
    } catch (error) {
        if (isEnoent(error)){
            return await readFileApp(rootPath, atomName, filename);
        }else{
            console.error("nie można odczytać pliku: ", error);
            return
        }
    }
}