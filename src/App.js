import React from 'react'
import logo from './logo.svg'
import './App.css'
import { globe } from './globe'

export class App extends React.Component {

  componentDidMount() {
    globe.init()
  }

  render() {
    return (
      <div className='app'>
        <div className='mySvgContainer' />
      </div>
    )
  }
}
