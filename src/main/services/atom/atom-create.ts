import { writeJsonWithSchema } from "@main/utils/json";
import type { DomainsDict, Status } from "@shared/domain/types";
import { AtomMetaSchema, type AtomMeta } from "@shared/schemas/atom";
import { ElectronsDictSchema } from "@shared/schemas/electron";
import type { AtomId, DomainId } from "@shared/schemas/ids";
import { isEexist } from "@shared/utils/warning";
import { randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { assignDomain } from "../worldline/wordline-domain-add";
import type { CreateAtomOutput } from "@shared/domain/study";

export type AtomCreatePayload = Omit<AtomMeta, 'id'|'domainId'|'createdAt'|'updatedAt'>


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
            return { 
                status: 'error', 
                code: 'ERR_ATOM_ALREADY_EXISTS',
                details: `${name} - ${rootPath}`
            };
        }
        return { 
            status: 'error', 
            code: 'ERR_ATOM_INVALID',
            details: `${(error as Error).message} - ${rootPath}: ${name}`
        };
    }

    let domainId: DomainId|null;
    let domainData: DomainsDict | null = null;
    if(domainName && domainName.trim().length > 0){
        const domainResult = await assignDomain(rootPath, domainName);
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
    if(atomWriteResult.status === 'write-failed'){
        return {
            status: "error", 
            code: 'ERR_ATOM_META_WRITE_FAILED',
            details: `${name} - ${rootPath}`
        }
    }else if(atomWriteResult.status === 'invalid'){
        return {
            status: "error", 
            code: 'ERR_ATOM_META_INVALID',
            details: `${name} - ${rootPath}`
        }
    }
    const electronsWriteResult = await writeJsonWithSchema(
        join(atomMetaPath, "electrons.json"),
        ElectronsDictSchema,
        {}
    );
    if (electronsWriteResult.status === 'write-failed') {
        return {
            status: "error", 
            code: 'ERR_ELECTRON_META_WRITE_FAILED',
            details: `${name} - ${rootPath}`
        };
    }else if(electronsWriteResult.status === 'invalid'){
        return {
            status: "error", 
            code: 'ERR_ELECTRON_META_INVALID',
            details: `${name} - ${rootPath}`
        }
    }
    return {
        status: "ok", 
            data:{
            atomMeta: atomContent,
            domain: domainData
        }
    }
}