import { Pane } from "tweakpane"

const FFT_SIZE = 256

class Sound0 {
  isPlaying = false
  isFreqency = false
  isTimeDomain = true
  isMix = false
  isInput = false
  constructor() {
    this.elemSetup()
    this.commonAudioSetup()
    this.musicAudioSetup()
    // this.inputAudioSetup()
    this.addGUI()
    this.canvasSetup()
    // this.addOcillator()
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

  commonAudioSetup() {
    this.audioCtx = new AudioContext()
    // AudioAnalyzer
    this.analyser = this.audioCtx.createAnalyser()
    this.analyser.fftSize = FFT_SIZE

    // Freq
    this.freqLength = this.analyser.frequencyBinCount
    this.freqArray = new Uint8Array(this.freqLength)

    // TimeDomain
    this.tdLength = this.analyser.fftSize
    this.tdArray = new Float32Array(this.tdLength)
  }

  musicAudioSetup() {
    console.log("Audio setup")
    this.track =
      this.track || this.audioCtx.createMediaElementSource(this.sample)
    this.analyser.connect(this.audioCtx.destination)
    this.track.connect(this.analyser)
  }

  async inputAudioSetup() {
    console.log("InputAudio setup")
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    this.input = this.input || this.audioCtx.createMediaStreamSource(stream)
    this.input.connect(this.analyser)
  }

  addOcillator() {
    this.oc = this.audioCtx.createOscillator()
    this.gain = this.audioCtx.createGain()
    //
    this.gain.value = 1.0
    //
    console.log(this.oc.type)
    this.oc.frequency.value = 440
    this.oc.connect(this.gain)
    this.gain.connect(this.audioCtx.destination)
    // this.oc.connect(this.audioCtx.destination)
    this.oc.start(0)

    this.lfo = this.audioCtx.createOscillator()
    this.lfo.type = "sine"
    this.lfo.frequency.value = 1
    this.depth = this.audioCtx.createGain()
    this.depth.gain.value = 50
    this.lfo.connect(this.depth).connect(this.oc.frequency)
    this.lfo.start()
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

  addGUI() {
    this.gui = new Pane()
    const params = {
      Frequency: this.isFreqency,
      TimeDomain: this.isTimeDomain,
      isMix: this.isMix,
      isInput: this.isInput,
    }
    this.gui.addInput(params, "Frequency").on("change", (e) => {
      this.isFreqency = e.value
    })
    this.gui
      .addInput(params, "TimeDomain")
      .on("change", (e) => (this.isTimeDomain = e.value))
    this.gui
      .addInput(params, "isMix")
      .on("change", (e) => (this.isMix = e.value))
    this.gui.addInput(params, "isInput").on("change", (e) => {
      if (e.value) {
        this.inputAudioSetup()
        this.isPlaying = true
        this.sample.pause()
        this.onTick()
        this.playBtn.style.display = "none"
        this.stopBtn.style.display = "none"
      } else {
        this.musicAudioSetup()
        this.isPlaying = false
        this.playBtn.style.display = "inline-block"
        this.stopBtn.style.display = "inline-block"
      }
    })
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
    this.isPlaying = false
    this.sample.pause()
  }

  onTick() {
    if (this.isPlaying) requestAnimationFrame(this.onTick.bind(this))
    const { width, height } = this.canvas
    this.canvasCtx.clearRect(0, 0, width, height)
    this.canvasCtx.beginPath()

    // フレケンシードメイン（周波数領域）
    if (
      (this.isFreqency && !this.isMix) ||
      (this.isFreqency && !this.isTimeDomain)
    ) {
      this.analyser.getByteFrequencyData(this.freqArray)
      // console.log(this.freqArray)
      const freqX_shift = (width * 0.5) / this.freqLength
      // xスタート位置
      let x = width / 2
      let _x = width / 2
      this.canvasCtx.beginPath()
      for (let i = 0; i < this.freqLength; i++) {
        const d = this.freqArray[i]
        const v = d / 256
        let y = 0
        if (i % 2 === 0 && v !== 0) {
          y = height / 2 - v * (height / 2)
        } else {
          y = height / 2 + v * (height / 2)
        }

        if (i === 0) {
          this.canvasCtx.moveTo(x, y)
        } else {
          this.canvasCtx.lineTo(x, y)
        }
        x += freqX_shift
      }

      for (let i = 0; i < this.freqLength; i++) {
        const d = this.freqArray[i]
        const v = d / 256
        let y = 0
        if (i % 2 === 0 && v !== 0) {
          y = height / 2 - v * (height / 2)
        } else {
          y = height / 2 + v * (height / 2)
        }

        if (i === 0) {
          this.canvasCtx.moveTo(_x, y)
        } else {
          this.canvasCtx.lineTo(_x, y)
        }
        _x -= freqX_shift
      }
    }

    // タイムドメイン（時間領域）
    if (
      (this.isTimeDomain && !this.isMix) ||
      (this.isTimeDomain && !this.isFreqency)
    ) {
      const tdX_shift = width / this.tdLength
      this.analyser.getFloatTimeDomainData(this.tdArray)
      let tdX = 0
      for (let i = 0; i < this.tdLength; i++) {
        const d = this.tdArray[i]
        const v = d / 2
        const y = height / 2 + v * height
        if (i === 0) {
          this.canvasCtx.moveTo(tdX, y)
        } else {
          this.canvasCtx.lineTo(tdX, y)
        }
        tdX += tdX_shift
      }
    }

    // Mixed
    if (this.isFreqency && this.isTimeDomain && this.isMix) {
      this.analyser.getByteFrequencyData(this.freqArray)
      this.analyser.getFloatTimeDomainData(this.tdArray)
      const x_shift = (width * 0.5) / this.freqLength
      let x = width / 2
      let _x = width / 2

      for (let i = 0; i < this.freqLength; i++) {
        // Freq
        const freq_d = this.freqArray[i]
        const freq_v = freq_d / 256
        let freq_y = 0
        if (i % 2 === 0 && freq_v !== 0) {
          freq_y = height / 2 - freq_v * (height / 2)
        } else {
          freq_y = height / 2 + freq_v * (height / 2)
        }

        // TimeDomain
        const td_d = this.tdArray[this.freqLength + i]
        const td_v = td_d / 2
        const td_y = height / 2 + td_v * height

        if (i === 0) {
          this.canvasCtx.moveTo(x, freq_y * 0.5 + td_y * 0.5)
        } else {
          this.canvasCtx.lineTo(x, freq_y * 0.5 + td_y * 0.5)
        }
        x += x_shift
      }

      for (let i = 0; i < this.freqLength; i++) {
        // Freq
        const freq_d = this.freqArray[i]
        const freq_v = freq_d / 256
        let freq_y = 0
        if (i % 2 === 0 && freq_v !== 0) {
          freq_y = height / 2 - freq_v * (height / 2)
        } else {
          freq_y = height / 2 + freq_v * (height / 2)
        }

        // TimeDomain
        const td_d = this.tdArray[this.freqLength - i]
        const td_v = td_d / 2
        const td_y = height / 2 + td_v * height
        // console.log({ freq_y, td_y })

        if (i === 0) {
          this.canvasCtx.moveTo(_x, freq_y * 0.5 + td_y * 0.5)
        } else {
          this.canvasCtx.lineTo(_x, freq_y * 0.5 + td_y * 0.5)
        }
        _x -= x_shift
      }
    }

    this.canvasCtx.stroke()
  }
}

export default Sound0
