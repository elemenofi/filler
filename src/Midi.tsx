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
    this.midiAccess!
      .inputs
      .forEach((entry) => { 
        console.log(entry)
        entry.onmidimessage = this.onMIDIMessage;
      });
    console.log(this.midiAccess!.inputs)
  }

  onMIDIFailure (msg) {
    console.log("Failed to get MIDI access - " + msg);
  }

  onMIDIMessage(event) {
    var str = "MIDI message received at timestamp " + event.timestamp + "[" + event.data.length + " bytes]: ";
    for (var i=0; i<event.data.length; i++) {
      str += "0x" + event.data[i].toString(16) + " ";
    }
    console.log(str);
  }
}