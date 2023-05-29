import Oc from "@Components/Oc"
class Sound2 {
  constructor() {
    console.log("sound2")
    // window.addEventListener("load", () => this.play())
    document.querySelector("#play").addEventListener("click", () => {
      console.log("click")
      this.play()
    })
  }

  play() {
    this.ctx = new AudioContext()
    this.gainNode1 = this.ctx.createGain()
    this.gainNode1.gain.value = 0.5

    // this.gainNode2 = this.ctx.createGain()
    // this.gainNode2.gain.value = 0.6

    this.oc1 = this.ctx.createOscillator()
    this.oc1.type = "sine"
    this.oc1.frequency.value = 261

    this.oc2 = this.ctx.createOscillator()
    this.oc1.type = "sine"
    this.oc2.frequency.value = 392

    this.oc1.connect(this.gainNode1)
    this.oc2.connect(this.gainNode1)
    // .connect(this.ctx.destination)

    this.gainNode1.connect(this.ctx.destination)
    // this.gainNode2.connect(this.ctx.destination)

    this.oc1.start(0)
    this.oc2.start(0)
  }
}

export default Sound2
