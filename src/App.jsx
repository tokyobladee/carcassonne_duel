import React from 'react'
import styled from 'styled-components'
import Game from './components/Game'

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d);
  padding: 20px;
`

const Title = styled.h1`
  color: white;
  text-align: center;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
  margin-bottom: 20px;
`

function App() {
  return (
    <AppContainer>
      <Title>Каркасон Дуель</Title>
      <Game />
    </AppContainer>
  )
}

export default App