import ReactDOM from 'react-dom';
import React from 'react';
import App from './App';

export class Track {
  MAXLOWPASS = 8000
  
  name: string
  context: AudioContext
  element: HTMLMediaElement
  audio: MediaElementAudioSourceNode
  filter: BiquadFilterNode
  delay: DelayNode
  steps: (0 | 1) []

  constructor(name: string, context: AudioContext) {
    this.name = name
    this.context = context
    this.element = document.querySelector('.' + name) as HTMLMediaElement
    this.audio = this.context.createMediaElementSource(this.element)
    this.delay = this.context.createDelay()
    this.filter = this.context.createBiquadFilter()
    this.delay.delayTime.value = 100
    this.filter.type = 'lowpass'
    this.filter.frequency.setValueAtTime(this.MAXLOWPASS, this.context.currentTime)
    this.filter.gain.setValueAtTime(100, this.context.currentTime)
    this.steps = [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1]
    this.audio.connect(this.filter)
    this.filter.connect(this.context.destination)
    this.filter.connect(this.delay)
  }

  play (step: number) {
    if (this.steps[step] === 1) {
      if (this.element.currentTime !== 0) {
        this.element.pause()
        this.element.currentTime = 0;
      }
      
      this.element.play()
    }
  }

  changeStep (step: number) {
    this.steps[step] = (this.steps[step]) ? 0 : 1
  }

  setFilterFrequency (frequency: number) {
    this.filter.frequency.setValueAtTime(frequency, this.context.currentTime)
  }
}

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

  tracks: {
    [key:string]: Track
  } = {}

  constructor () {
    this.createWorker()
  }

  createContext () {
    if (this.audioContext) return
    this.audioContext = new AudioContext()
    this.createTracks()
  }

  createWorker () {
    this.worker = new Worker('./MetronomeWorker.js')
    this.sendIntervalToWorker()
    this.worker.addEventListener('message', (e) => {
      if (e.data === 'step') this.doStep()
    })
  }

  createTracks () {
    this.instruments.forEach((instrument) => {
      this.tracks[instrument] = new Track(instrument, this.audioContext!)
    })
  }

  play () {
    this.createContext()
    
    this.isPlaying = !this.isPlaying
    
    if (this.isPlaying) {
      this.worker.postMessage('startWorker')
    } else if (!this.isPlaying) {
      this.currentStep = 0
      this.worker.postMessage('stopWorker')
      return
    }
  }

  doStep () {
    this.playAudio()
    this.drawUi()
    this.advanceStep()
  }

  playAudio () {
    Object.keys(this.tracks).forEach((track) => {
      this.tracks[track].play(this.currentStep)
    })
  }

  drawUi () {
    ReactDOM.render(<App />, document.getElementById('root'))
  }

  advanceStep () {
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
