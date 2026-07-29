import electronLogo from './assets/electron.svg'

function App(): React.JSX.Element {
  console.log(window.api.worldline.parse('C:\\dev\\worldline-test').then(r => console.log(r)))  
  return (
    <>
      <img alt="logo" className="logo" src={electronLogo} />
    </>
  )
}

export default App
