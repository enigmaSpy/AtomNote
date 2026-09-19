import { join } from "path";

export async function getPath(rootPath: string, atomName: string):Promise<string>{
    return join(rootPath, atomName);
}