import ReactDOM from 'react-dom';
import React from 'react';
import App from './App';

class Metronome {
  clock // number
  audioContext: AudioContext | undefined
  isPlaying = false
  tempo = 120.0
  MINUTE = 60000
  RESOLUTION = 4
  currentStep = 0

  instruments = ['kick', 'clap', 'hh', 'oh']
  audioElements: any = {}
  tracks: any = {}
  delays: any = {}

  steps = {
    kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1],
    clap: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    hh:   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    oh:   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  }

  constructor () {
  }

  changeStep (step: number, track: string) {
    this.steps[track][step] = (this.steps[track][step]) ? 0 : 1
  }

  createAudioContext () {
    this.audioContext = new AudioContext()
    this.instruments.forEach((instrument) => this.createInstrument(instrument))
  }

  createInstrument (instrument) {
    this.audioElements[instrument] = document.querySelector('.' + instrument)
    this.tracks[instrument] = this.audioContext!.createMediaElementSource(this.audioElements![instrument])
    // this.delays[instrument] = this.audioContext!.createDelay()
    // this.delays[instrument].delayTime.value = 0.1;
    // this.tracks[instrument].connect(this.delays[instrument])
    this.tracks[instrument].connect(this.audioContext!.destination)
    // this.delays[instrument].connect(this.audioContext!.destination)
  }

  play () {
    if (!this.audioContext) {
      this.createAudioContext()
    }
    
    this.isPlaying = !this.isPlaying
    
    if (!this.isPlaying) {
      this.currentStep = 0
      clearInterval(this.clock)
      return
    }

    this.startInterval()
  }

  drawUi () {
    ReactDOM.render(<App />, document.getElementById('root'))
  }

  advanceStep () {
    this.instruments.forEach((instrument) => {
      if (this.steps[instrument] && this.steps[instrument][this.currentStep] === 1) {
        console.log('playing step ' + this.currentStep)
        this.audioElements[instrument].pause()
        this.audioElements[instrument].currentTime = 0;
        this.audioElements[instrument].play()
      }
    })

    this.drawUi()

    this.currentStep++

    if (this.currentStep === 16) {
      this.currentStep = 0
    }
  }

  startInterval () {
    this.clock = setInterval(() => this.advanceStep(), this.getInterval())
  }

  getInterval (): number {
    return (this.MINUTE / this.tempo) / this.RESOLUTION
  }

  setTempo (tempo: number) {
    console.log('Metronome: setting new tempo to ' + tempo)
    this.tempo = tempo
  }
}

export default Metronome
