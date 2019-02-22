import React, { Component, ChangeEvent } from 'react'
import './App.css'
import Metronome from './Metronome'

interface StepProps {
  step: number
  track: string
  metronome: Metronome
  pressed: string
}

interface StepState {
  pressed: string
}

class Step extends Component<StepProps, StepState> {
  state = {
    pressed: 'passive'
  }

  constructor (props: StepProps) {
    super(props)
    this.pressStep = this.pressStep.bind(this)
  }

  componentDidMount () {
    this.setState({ pressed: this.props.pressed })
  }

  pressStep () {
    this.props.metronome!.changeStep(this.props.step, this.props.track)
    this.setState({ pressed: (this.state.pressed === 'pressed') ? 'passive' : 'pressed' })
  }

  render() {
    let sequenced = ''
    if (this.props.metronome.currentStep === this.props.step) {
      sequenced = 'sequenced'
    }
    return (
      <div
        className={'step ' + this.state.pressed + ' ' + sequenced}
        onClick={this.pressStep}
      >{this.props.step}</div>
    )
  }
}

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
    const tracks = Object.keys(this.metronome.steps)

    return (
      <div>
        {tracks.map((track, i) => {
          return <div key={i}>
            {this.metronome.steps[track].map((step, i) => {
              return <Step
                key={i} 
                step={i} 
                metronome={this.metronome} 
                track={track} 
                pressed={(step === 1) ? 'pressed' : 'passive'}
              />
            })}
          </div>
        })}

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

