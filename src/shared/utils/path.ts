export function getFileData(filename: string): { base: string; ext: string } {
    const dot = filename.lastIndexOf('.')
    if (dot <= 0) return { 
        base: filename, 
        ext: '' 
    }

    return { 
        base: filename.slice(0, dot), 
        ext: filename.slice(dot + 1).toLowerCase() 
    }
}