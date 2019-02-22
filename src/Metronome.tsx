import ReactDOM from 'react-dom';
import React from 'react';
import App from './App';

class Metronome {
  worker // Worker
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
  filters: {
    [key: string]: BiquadFilterNode
  } = {}

  steps = {
    kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1],
    clap: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    hh:   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    oh:   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  }

  constructor () {
    this.createWorker()
  }

  createWorker () {
    this.worker = new Worker('./MetronomeWorker.js')
    this.sendIntervalToWorker()
    this.worker.addEventListener('message', (e) => {
      if (e.data === 'tick') this.advanceStep()
    })
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
    // this.filters[instrument] = this.audioContext!.createBiquadFilter()
    // this.filters[instrument].type = 'lowpass'
    // this.delays[instrument] = this.audioContext!.createDelay()
    // this.delays[instrument].delayTime.value = 0.1;
    // this.tracks[instrument].connect(this.delays[instrument])
    // this.tracks[instrument].connect(this.filters[instrument])
    this.tracks[instrument].connect(this.audioContext!.destination)
    // this.delays[instrument].connect(this.audioContext!.destination)
    // this.filters[instrument].connect(this.audioContext!.destination)
  }

  play () {
    if (!this.audioContext) {
      this.createAudioContext()
    }
    
    this.isPlaying = !this.isPlaying
    
    if (this.isPlaying) {
      this.worker.postMessage('startWorker')
    } else if (!this.isPlaying) {
      this.currentStep = 0
      this.worker.postMessage('stopWorker')
      return
    }
  }

  drawUi () {
    ReactDOM.render(<App />, document.getElementById('root'))
  }

  advanceStep () {
    this.instruments.forEach((instrument) => {
      const _instrument = this.steps[instrument]
      const _audio = this.audioElements[instrument]

      // this.filters[instrument].frequency.setValueAtTime(1000, this.audioContext!.currentTime + this.getInterval())
      // this.filters[instrument].gain.setValueAtTime(1000, this.audioContext!.currentTime +  + this.getInterval())

      if (_instrument && _instrument[this.currentStep] === 1) {
        _audio.pause()
        _audio.currentTime = 0;
        _audio.play()
      }
    })

    this.drawUi()

    this.currentStep++

    if (this.currentStep === 16) {
      this.currentStep = 0
    }
  }

  getInterval (): number {
    return (this.MINUTE / this.tempo) / this.RESOLUTION
  }

  setTempo (tempo: number) {
    console.log('Metronome: setting new tempo to ' + tempo)
    this.tempo = tempo
    this.sendIntervalToWorker()
  }

  sendIntervalToWorker () {
    this.worker.postMessage({ interval: this.getInterval()})
  }
}

export default Metronome
