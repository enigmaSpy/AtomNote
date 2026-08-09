import { WorldlineTree } from "../WorldlineTree"
import { NoteEditor } from "./NoteEditor"
//TODO sadasdsa
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
