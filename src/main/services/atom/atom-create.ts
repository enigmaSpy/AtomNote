import type { Status } from "@shared/domain/types";
import { AtomMetaSchema, type AtomMeta } from "@shared/schemas/atom";
import type { AtomId } from "@shared/schemas/ids";
import { writeJsonWithSchema } from "@shared/utils/json";
import { isEexist } from "@shared/utils/warning";
import { randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

type AtomPayload = Omit<AtomMeta, 'id'|'createdAt'|'updatedAt'>
export  async function createAtom(rootPath:string, name: string, atomPayload:AtomPayload):Promise<Status<AtomMeta>>{
    const id= randomUUID() as AtomId;
    const atomContent:AtomMeta ={
        ...atomPayload,
        id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
    try {
        await mkdir(join(rootPath, name),{recursive:false});
    } catch (error) {
        if(isEexist(error)){
            return { status: 'error', message: "Atom już istnieje" };
        }
        return { status: 'error', message: (error as Error).message};
    }
    const writeResult = await writeJsonWithSchema(
        join(rootPath, name, 'atom.json'),
        AtomMetaSchema,
        atomContent
    );
    if(writeResult.status !== 'ok'){
        return {status: "error", message:writeResult.status}
    }
    return {status: "ok", data:atomContent}
}