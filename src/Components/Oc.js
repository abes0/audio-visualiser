class Oc {
  constructor({ context, type, freq, gain }) {
    this.ctx = context
    this.oc = this.ctx.createOscillator()
    this.freqency = this.oc.frequency
    this.gainNode = this.ctx.createGain()
    this.type = type || this.oc.type
    this.freqValue = freq || this.freqency.value
    this.gain = gain || 0.4
  }

  start({ connectTarget, type, freq, gain } = {}) {
    this.oc = this.oc || this.ctx.createOscillator()
    this.type = type || this.type
    this.freqValue = freq || this.freqValue
    this.gain = gain || this.gain
    this.oc.type = this.type
    this.oc.frequency.value = this.freqValue

    this.gainNode.gain.value = this.gain

    this.oc.connect(this.gainNode)
    if (connectTarget) {
      this.gainNode.connect(connectTarget)
      connectTarget.connect(this.ctx.destination)
    } else {
      this.gainNode.connect(this.ctx.destination)
    }

    this.oc.start(0)
  }

  stop() {
    this.oc.stop(0)
    this.oc.disconnect(this.gainNode)
    this.oc = null

    this.gainNode = null
  }
}

export default Oc
