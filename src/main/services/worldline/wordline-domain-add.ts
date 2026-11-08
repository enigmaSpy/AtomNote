import { readJsonWithSchema, writeJsonWithSchema } from "@main/utils/json";
import type { DomainsDict, Status } from "@shared/domain/types";
import type { DomainId } from "@shared/schemas/ids";
import { WorldlineMetaSchema } from "@shared/schemas/worldline";
import { randomUUID } from "crypto";
import { join } from "path";

export async function assignDomain(rootPath:string, domainName: string):Promise<Status<DomainsDict>>{
    const worldlineMetaPath = join(rootPath, '.worldline_data', 'worldline.json');
    const readResult = await readJsonWithSchema(
        worldlineMetaPath,
        WorldlineMetaSchema
    );
    if(readResult.status === 'not-found'){
        return {
            status: 'error',
            code: 'ERR_WORLDLINE_NOT_FOUND',
            details: `${rootPath}`
        }
    }else if(readResult.status === 'invalid'){
        return{
            status: 'error',
            code: 'ERR_WORLDLINE_INVALID',
            details: `${rootPath}`
        }
    }
    if(!readResult.data) return{
            status: 'error',
            code: 'ERR_READ_FAILED',
            details: `${rootPath} - ${domainName}`
    }
    const clearName = domainName.trim();
    if (!clearName) {
        return {
            status: 'error',
            code: 'ERR_INVALID_NAME',
            details: `${domainName}`
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
            code: 'ERR_WORLDLINE_WRITE_FAILED',
            details: `${rootPath} - ${domainName}`
        }
    }
    return {status: 'ok', data: {[domainId]: {name: clearName}}}
}