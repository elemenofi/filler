export class Midi {
  midiAccess: WebMidi.MIDIAccess | undefined

  constructor() {
    this.midiAccess = undefined;  // global MIDIAccess object 

    window
      .navigator
      .requestMIDIAccess()
      .then(
        (access) => this.onMIDISuccess(access), 
        (message) => this.onMIDIFailure(message)
      );
  }

  onMIDISuccess (midiAccess) {
    console.log("MIDI ready!" );
    this.midiAccess = midiAccess;  // store in the global (in real usage, would probably keep in an object instance)
  }

  onMIDIFailure (msg) {
    console.log("Failed to get MIDI access - " + msg);
  }
}