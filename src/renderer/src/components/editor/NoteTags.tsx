const EMPTY_TAGS =  new Set<string>() as ReadonlySet<string>;
export const NoteTags = () => {
    
    const electronTags = EMPTY_TAGS;
    return (
        <div>
            {electronTags?.size ? (
                [...electronTags].map((tag)=>(
                    <div key={tag}>{tag}</div>
                ))
            ):(
                <div>Brak tagów do wyświetlenia</div>
            )}
            <div>+dodaj tag</div>
        </div>
    )
}
