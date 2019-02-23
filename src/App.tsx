import React, { Component } from 'react'
import './App.css'
import Metronome, { Track } from './Metronome'
import Slider from 'react-rangeslider'

interface StepProps {
  step: number
  track: Track
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

  track: Track

  constructor (props: StepProps) {
    super(props)
    this.pressStep = this.pressStep.bind(this)
    this.track = this.props.track
  }

  componentDidMount () {
    this.setState({ pressed: this.props.pressed })
  }

  pressStep () {
    this.track.changeStep(this.props.step)
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
    selectedTempo: 0,
    filterFrequencies: {
      kick: 0,
      clap: 0,
      hh: 0,
      oh: 0
    }
  }

  constructor (props: {}) {
    super(props)
    this.metronome = new Metronome()
    this.handlePlay = this.handlePlay.bind(this)
    this.handleTempo = this.handleTempo.bind(this)
    this.setTempo = this.setTempo.bind(this)
    this.state.selectedTempo = this.metronome.tempo
    Object.keys(this.metronome.tracks).forEach((track) => {
      this.state.filterFrequencies[track] = this.metronome.tracks[track].filter.frequency
    })
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

  handleFrequencyChange = (track, value) => {
    const filterFrequencies = {...this.state.filterFrequencies}
    filterFrequencies[track] = value;
    this.setState({filterFrequencies})
    this.metronome.tracks[track].setFilterFrequency(value)
  }

  render() {
    const tracks = Object.keys(this.metronome.tracks)

    return (
      <div>
        {tracks.map((track, i) => {
          return <div key={i}>
            {this.metronome.tracks[track].steps.map((step, i) => {
              return <Step
                key={i} 
                step={i} 
                metronome={this.metronome} 
                track={this.metronome.tracks[track]} 
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

        {tracks.map((track, i) => {
          return <div key={i}>
            <Slider
              min={0}
              max={this.metronome.tracks[track].MAXLOWPASS}
              value={this.state.filterFrequencies[track]}
              orientation="vertical"
              onChange={this.handleFrequencyChange.bind(this, track)}
            />  
          </div>
        })}
      </div>
    )
  }
}

export default App

