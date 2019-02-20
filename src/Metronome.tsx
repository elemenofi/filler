class Metronome {
  clock // number
  audioContext: AudioContext | undefined
  isPlaying = false
  tempo = 140.0
  MINUTE = 60000
  RESOLUTION = 4
  currentStep = 0

  instruments = ['kick', 'clap', 'hh', 'oh']
  audioElements: any = {}
  tracks: any = {}

  steps = {
    kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    clap: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0],
    hh:   [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    oh:   [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
  }

  constructor () {
  }

  createAudioContext () {
    this.audioContext = new AudioContext()
    this.instruments.forEach((instrument) => this.createInstrument(instrument))
  }

  createInstrument (instrument) {
    this.audioElements[instrument] = document.querySelector('.' + instrument)
    this.tracks[instrument] = this.audioContext!.createMediaElementSource(this.audioElements![instrument])
    this.tracks[instrument].connect(this.audioContext!.destination)
  }

  play () {
    if (!this.audioContext) {
      this.createAudioContext()
    }
    
    this.isPlaying = !this.isPlaying
    
    if (!this.isPlaying) {
      clearInterval(this.clock)
      return
    }

    this.startInterval()
  }

  startInterval () {
    this.clock = setInterval(() => {
      console.log('Step' + this.currentStep)

      this.instruments.forEach((instrument) => {
        if (this.steps[instrument]) console.log(this.steps[instrument][this.currentStep])
        if (this.steps[instrument] && this.steps[instrument][this.currentStep]) {
          this.audioElements[instrument].play()
        }
      })

      this.currentStep++

      if (this.currentStep === 16) {
        this.currentStep = 0
      }

    }, this.getInterval())
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
