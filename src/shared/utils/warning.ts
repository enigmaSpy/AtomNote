import type { StructuralWarning, WarningReason } from "@shared/domain/types";

export interface WarningCollector{
    warnings: StructuralWarning[]
    pushWarning: (path: string, reason: WarningReason, message: string)=>void
}

export const createWarningCollector = ()=>{
    const warnings: StructuralWarning[] = []
    const pushWarning = (path:string, reason: WarningReason, message :string)=>{
            warnings.push({
            path,
            reason,
            message
        })
    }
    return { warnings, pushWarning }
}

export const isEnoent =(err: unknown):boolean=> (err as NodeJS.ErrnoException).code === 'ENOENT';