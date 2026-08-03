import { ElectronContext } from "./ElectronContext"
import { WorldlineTree } from "./WorldlineTree"

export const GardenView = () => {
  return (
    <main style={{display:'flex'}}>
        <WorldlineTree/>
        <div
            style={{width:'30vw'}}
        >
          <ElectronContext/>
        </div>
        <div
        style={{flex:'30vw'}}
        >c</div>
    </main>
  )
}
