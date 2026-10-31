import type { DomainsDict, Status } from "@shared/domain/types";
import type { DomainId } from "@shared/schemas/ids";
import { WorldlineMetaSchema } from "@shared/schemas/worldline";
import { readJsonWithSchema, writeJsonWithSchema } from "@shared/utils/json";
import { randomUUID } from "crypto";
import { join } from "path";

export async function addDomain(rootPath:string, domainName: string):Promise<Status<DomainsDict>>{
    const worldlineMetaPath = join(rootPath, '.worldline_data', 'worldline.json');
    const readResult = await readJsonWithSchema(
        worldlineMetaPath,
        WorldlineMetaSchema
    );
    if(readResult.status !== 'ok'){
        return {
            status: 'error',
            message: readResult.status
        }
    }
    if(!readResult.data) return{
            status: 'error',
            message: 'Błąd odczytania metadanych Worldline'
    }
    const clearName = domainName.trim();
    if (!clearName) {
        return {
            status: 'error',
            message: 'Nazwa domeny nie może być pusta'
        };
    }
    const domains = readResult.data.domains;
    const existingDomain  = Object.entries(domains).find(
        ([_, domain])=> domain.name.toLocaleLowerCase() === clearName.toLocaleLowerCase()
    )
    if(existingDomain){
        const [domainId, domain] = existingDomain;
        return {status: 'ok', data: {
            [domainId as DomainId]:domain
        }}
    }
    const domainId= randomUUID() as DomainId;
    const updatedDomains: DomainsDict={
        ...domains,
        [domainId]:{
            name: clearName
        }
    }
    
    const writeResult = await writeJsonWithSchema(
        worldlineMetaPath,
        WorldlineMetaSchema,
        {
            ...readResult.data,
            domains: updatedDomains
        }
    );
    if(writeResult.status !== 'ok'){
        return {
            status: 'error',
            message: writeResult.status
        }
    }
    return {status: 'ok', data: {[domainId]: {name: clearName}}}
}