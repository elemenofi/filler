import React, { Component } from 'react'
import Metronome from "./Metronome";

class Twist extends Component<{ metronome: Metronome }, {}> {
  metronome: Metronome

  constructor (props) {
    super(props)
    this.metronome = this.props.metronome
  }

  render() {
    return (
      <div>Hallo</div>
    )
  }
}

export default Twist