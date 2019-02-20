import React, { Component, ChangeEvent } from 'react'
import './App.css'
import Metronome from './Metronome'

class App extends Component {
  metronome: Metronome

  state = {
    selectedTempo: 0
  }

  constructor (props: {}) {
    super(props)
    this.metronome = new Metronome()
    this.handlePlay = this.handlePlay.bind(this)
    this.handleTempo = this.handleTempo.bind(this)
    this.setTempo = this.setTempo.bind(this)
    this.state.selectedTempo = this.metronome.tempo
  }

  handlePlay () {
    this.metronome.play()
  }

  handleTempo () {
    this.metronome.setTempo(this.state.selectedTempo)
  }

  setTempo (e) {
    this.setState({
      selectedTempo: e.currentTarget.value
    })
  }

  render() {
    return (
      <div>
        <input
          value={this.state.selectedTempo}
          onChange={this.setTempo}
        ></input>
        <button 
          onClick={this.handleTempo}
        >Set</button>
        <button 
          onClick={this.handlePlay}
        >Play/Stop</button>
      </div>
    )
  }
}

export default App
