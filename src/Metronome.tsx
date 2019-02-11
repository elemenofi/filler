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

  // array of objects for the notes that have been put into the web audio,
  // and may or may not have played yet.
  stepsInQueue: {
    note: number, 
    time: number
  }[] = []

  constructor () {
    this.audioContext = new AudioContext()

    // if we wanted to load audio files, etc., this is where we should do it.  

    this.timerWorker = new Worker('./MetronomeWorker.js')

    this.timerWorker.onmessage = (e) => {
      if (e.data === 'tick') {
        // console.log('tick!')
        this.scheduler()
      } else {
        console.log(e.data)
      }
    }

    this.timerWorker.postMessage({ interval: this.lookahead })
  }

  play () {
    this.isPlaying = !this.isPlaying

    if (this.isPlaying) {
      this.currentStep = 0
      this.nextStepTime = this.audioContext.currentTime
      this.timerWorker.postMessage('start')
      return 'stop'
    } else {
      this.timerWorker.postMessage('stop')
      return 'play'
    }
  }

  nextNote () {
    // Advance current note and time by a 16th note...
    // Notice this picks up the CURRENT 
    // tempo value to calculate beat length.
    const secondsPerBeat = 60.0 / this.tempo

    // Add beat length to last beat time
    this.nextStepTime += 0.25 * secondsPerBeat

    // Advance the beat number, wrap to zero
    this.currentStep++    

    if (this.currentStep == 16) {
      this.currentStep = 0
    }
  }

  scheduleNote (beatNumber: number, time: number) {
    // push the note on the queue, even if we're not playing.
    this.stepsInQueue.push({ 
      note: beatNumber, 
      time: time 
    })

    let osc = this.audioContext.createOscillator()
    osc.connect(this.audioContext.destination)
    osc.frequency.value = 440.0
    osc.start(time)
    osc.stop(time + this.stepLength)
  }

  scheduler () {
    // while there are notes that will need to play before the next interval, 
    // schedule them and advance the pointer.
    while (this.nextStepTime < this.audioContext.currentTime + this.scheduleAheadTime) {
      this.scheduleNote(this.currentStep, this.nextStepTime)
      this.nextNote()
    }
  }

  setTempo (tempo: number) {
    console.log('Metronome: setting new tempo to ' + tempo)
    this.tempo = tempo
  }
}

export default Metronome
