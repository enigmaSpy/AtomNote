import electronLogo from './assets/electron.svg'

function App(): React.JSX.Element {
  console.log(window.api)  
  return (
    <>
      <img alt="logo" className="logo" src={electronLogo} />
    </>
  )
}

export default App
