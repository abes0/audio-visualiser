import "./style.scss"
import { gsap } from "gsap"

const FFT_SIZE = 256

class Main {
  isPlaying = false
  constructor() {
    this.elemSetup()
    // this.sample.addEventListener('loadstart', this.audioSetup.bind(this))
    this.audioSetup()
    this.canvasSetup()
    // this.onTick()
  }

  elemSetup() {
    this.app = document.querySelector("#app")
    this.playBtn = document.querySelector("#play")
    this.stopBtn = document.querySelector("#stop")

    this.playHandler = this.play.bind(this)
    this.playBtn.addEventListener("click", this.playHandler)

    this.stopHandler = this.stop.bind(this)
    this.stopBtn.addEventListener("click", this.stopHandler)

    this.sample = document.querySelector("#sample")
  }

  audioSetup() {
    console.log("Audio setup")
    // AudioContext
    this.audioCtx = new AudioContext()
    this.track = this.audioCtx.createMediaElementSource(this.sample)

    // AudioAnalyzer
    this.analyser = this.audioCtx.createAnalyser()
    this.analyser.fftSize = FFT_SIZE
    this.bufferLength = this.analyser.frequencyBinCount
    this.dataArray = new Uint8Array(this.bufferLength)
    // this.analyser.getByteTimeDomainData(this.dataArray);
    this.analyser.connect(this.audioCtx.destination)
    this.track.connect(this.analyser)
  }

  canvasSetup() {
    this.canvas = document.createElement("canvas")
    this.canvasCtx = this.canvas.getContext("2d")
    this.app.appendChild(this.canvas)
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
    Object.assign(this.canvas.style, {
      display: "block",
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      pointerEvents: "none",
    })

    // config
    this.canvasCtx.strokeStyle = "red"
    this.canvasCtx.lineWidth = 1
  }

  play() {
    // 一時停止されたオーディオコンテキストの時間の流れを再開
    if (this.audioCtx.state === "suspended") {
      this.audioCtx.resume()
    }
    this.isPlaying = true
    this.sample.play()
    this.onTick()
  }

  stop() {
    // this.isPlaying = false
    this.sample.pause()
  }

  onTick() {
    if (this.isPlaying) requestAnimationFrame(this.onTick.bind(this))
    this.analyser.getByteFrequencyData(this.dataArray)
    console.log(this.dataArray)
    const { width, height } = this.canvas
    this.canvasCtx.clearRect(0, 0, width, height)
    for (let i = 0, length = this.dataArray.length; i < length; i++) {
      const d = this.dataArray[i]
      this.canvasCtx.beginPath()
      this.canvasCtx.moveTo(
        i * ((width * 0.5) / length) + (length / 2) * (width / length),
        height / 2 - (d / 255) * (height * 0.45)
      )
      this.canvasCtx.lineTo(
        i * ((width * 0.5) / length) + (length / 2) * (width / length),
        height / 2 + (d / 255) * (height * 0.45)
      )

      // 左右反転
      this.canvasCtx.moveTo(
        -i * ((width * 0.5) / length) + (length / 2) * (width / length),
        height / 2 - (d / 255) * (height * 0.45)
      )
      this.canvasCtx.lineTo(
        -i * ((width * 0.5) / length) + (length / 2) * (width / length),
        height / 2 + (d / 255) * (height * 0.45)
      )
      this.canvasCtx.stroke()
    }
  }
}

new Main()
