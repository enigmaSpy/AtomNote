import type { DomainsDict, Status } from "@shared/domain/types";
import { AtomMetaSchema, type AtomMeta } from "@shared/schemas/atom";
import { ElectronsDictSchema } from "@shared/schemas/electron";
import type { AtomId, DomainId } from "@shared/schemas/ids";
import { writeJsonWithSchema } from "@shared/utils/json";
import { isEexist } from "@shared/utils/warning";
import { randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { addDomain } from "../worldline/wordline-domain-add";

export type AtomCreatePayload = Omit<AtomMeta, 'id'|'domainId'|'createdAt'|'updatedAt'>
export type CreateAtomOutput = {
    atomMeta: AtomMeta
    domain: DomainsDict | null
}

export  async function createAtom(rootPath:string, name: string, domainName:string|null, atomPayload:AtomCreatePayload):Promise<Status<CreateAtomOutput>>{
    const id= randomUUID() as AtomId;
    const atomContent:AtomMeta ={
        ...atomPayload,
        id,
        domainId: null,
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

    let domainId: DomainId|null;
    let domainData: DomainsDict | null = null;
    if(domainName && domainName.trim().length > 0){
        const domainResult = await addDomain(rootPath, domainName);
        if(domainResult.status === 'ok'){
            domainId = Object.keys(domainResult.data)[0] as DomainId;
            atomContent.domainId = domainId;
            domainData = domainResult.data;
        }
    }

    const atomMetaPath = join(rootPath, name,'.atom_data');
    const atomWriteResult = await writeJsonWithSchema(
        join(atomMetaPath, 'atom.json'),
        AtomMetaSchema,
        atomContent
    );
    if(atomWriteResult.status !== 'ok'){
        return {status: "error", message:atomWriteResult.status}
    }
    const electronsWriteResult = await writeJsonWithSchema(
        join(atomMetaPath, "electrons.json"),
        ElectronsDictSchema,
        {}
    );
    if (electronsWriteResult.status !== 'ok') {
    return {
        status: 'error',
        message: electronsWriteResult.status
    };
}
    return {
            status: "ok", 
            data:{
            atomMeta: atomContent,
            domain: domainData
        }
    }
}