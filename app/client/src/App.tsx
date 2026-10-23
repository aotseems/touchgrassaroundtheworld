import { useState } from 'react'
import reactLogo from './assets/react.svg'

import './App.css'

import Catalog from './Catalog'

function App() {

  const [count, setCount] = useState(0)

  return (
    <>

      <section id="left">

        

      </section>

      <section id="center">
        <Catalog />
      </section>

    </>
  )

}

export default App
