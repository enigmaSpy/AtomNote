import { CONTROL_CHARS, RESERVED_NAMES, RESTRICTED_SYMBOLS, TRAILING_FORBIDDEN } from "@shared/constants";

export type ValidStatus =
    | {valid: true}
    | {valid: false, reason: string}

export function validateFileName(filename: string):ValidStatus{
    const trimmed = filename.trim();
    if(!trimmed){
        return {valid: false, reason: 'Nazwa nie może być pusty'}
    }
    if(trimmed.length > 255){
        return {valid: false, reason: 'Nazwa nie może być dłuższa, niż 255 znaków'}
    }
    for (const symbol of RESTRICTED_SYMBOLS) {
        if(trimmed.includes(symbol)){
            return {valid: false, reason: `Nazwa nie może zawierać znaków: ${RESTRICTED_SYMBOLS.toString()}`}
        }
    }
    for (const char of CONTROL_CHARS){
        if(trimmed.includes(char)){
            return {valid: false, reason: `Nazwa zawiera niedozwolone znaki kontrolne`}
        }
    }
    for (const name of RESERVED_NAMES){
        if(trimmed === name){
            return {valid: false, reason: `Nazwa nie może mieć nazwy: ${RESERVED_NAMES.toString()}`}
        }
    }
    for(const char of TRAILING_FORBIDDEN){
        if(trimmed.endsWith(char)){
            return {valid: false, reason: `Nazwa nie może się kończyć: ${TRAILING_FORBIDDEN.toString()}`}
        }
    }
    if(trimmed.startsWith('_')||trimmed.startsWith('.')){
        return {valid: false, reason: `Nazwa nie może się zaczynać: ${TRAILING_FORBIDDEN.toString()}`}
    }
    return {valid: true}
}