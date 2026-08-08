import { NoteEditor } from "./NoteEditor"
import { WorldlineTree } from "./WorldlineTree"

export const GardenView = () => {
  return (
    <main style={{display:'flex'}}>
        <WorldlineTree/>
        <div
            style={{width:'30vw'}}
        >
          <NoteEditor/>
        </div>
        <div
        style={{flex:'30vw'}}
        >c</div>
    </main>
  )
}
