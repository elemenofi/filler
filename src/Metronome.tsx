class Metronome {
  timerWorker: Worker
  audioContext: AudioContext

  isPlaying = false
  tempo = 120.0    

  // How far ahead to schedule audio (sec)
  // This is calculated from lookahead, and overlaps 
  // with next interval (in case the timer is late)
  scheduleAheadTime = 0.1
  // How frequently to call scheduling function 
  lookahead = 25.0

  // The start time of the entire sequence.
  startTime = 0
  // when the next step is due.
  nextStepTime = 0.0

  // current16thNote
  currentStep = 0
  // 0 == 16th, 1 == 8th, 2 == quarter note       
  stepResolution = 0 
  // length of "beep" (in seconds)      
  stepLength = 0.1

  audioElement: HTMLAudioElement | null
  track: MediaElementAudioSourceNode

  constructor () {
    this.audioContext = new AudioContext()
    this.audioElement = document.querySelector('audio')
    this.track = this.audioContext.createMediaElementSource(this.audioElement!)
    this.track.connect(this.audioContext.destination)

    this.timerWorker = new Worker('./MetronomeWorker.js')

    this.timerWorker.onmessage = (e) => {
      if (e.data === 'tick') {
        // console.log('tick!')
        this.scheduleSteps()
      } else {
        console.log(e.data)
      }
    }

    this.timerWorker.postMessage({ interval: this.lookahead })
  }

  play () {
    this.isPlaying = !this.isPlaying

    if (this.isPlaying) {
      this.nextStepTime = this.audioContext.currentTime
      this.timerWorker.postMessage('startWorker')
      return 'stop'
    } else {
      this.timerWorker.postMessage('stopWorker')
      return 'play' 
    }
  }

  scheduleSteps () {
    // while there are steps that will need to play before the next worker interval, 
    // schedule them and advance the pointer.
    while (this.nextStepTime < this.audioContext.currentTime + this.scheduleAheadTime) {
      this.doStep()
      this.nextStep()
    }
  }

  doStep () {
    this.audioElement!.play()
  }

  nextStep () {
    const secondsPerBeat = 60.0 / this.tempo
    this.nextStepTime += 0.25 * secondsPerBeat
  }

  setTempo (tempo: number) {
    console.log('Metronome: setting new tempo to ' + tempo)
    this.tempo = tempo
  }
}

export default Metronome
