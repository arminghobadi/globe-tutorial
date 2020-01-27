import React from 'react'
import './App.css'

export class App extends React.Component {

  componentDidMount() {
    const globe = require('./globe')
  }

  render() {
    return (
      <div className='app'>
        <div className='mySvgContainer' />
      </div>
    )
  }
}
