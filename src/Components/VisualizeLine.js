import { Pane } from "tweakpane"
class VisualizeLine {
  constructor({ el, isFreqency = true, isTimeDomain = false, isMix = false }) {
    this.el = el
    this.isFreqency = isFreqency
    this.isTimeDomain = isTimeDomain
    this.isMix = isMix
    this.init()
  }
  init() {
    this.canvas = document.createElement("canvas")
    this.canvasCtx = this.canvas.getContext("2d")
    this.el.appendChild(this.canvas)
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
  }

  draw({ analyser, freqArray, freqLength, tdArray, tdLength }) {
    const { width, height } = this.canvas
    this.canvasCtx.clearRect(0, 0, width, height)
    this.canvasCtx.beginPath()

    // フレケンシードメイン（周波数領域）
    if (
      (this.isFreqency && !this.isMix) ||
      (this.isFreqency && !this.isTimeDomain)
    ) {
      if (freqArray && freqLength) {
        analyser.getByteFrequencyData(freqArray)
        const freqX_shift = (width * 0.5) / freqLength
        // xスタート位置
        let x = width / 2
        let _x = width / 2
        for (let i = 0; i < freqLength; i++) {
          const d = freqArray[i]
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

        for (let i = 0; i < freqLength; i++) {
          const d = freqArray[i]
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
    }

    // タイムドメイン（時間領域）
    if (
      (this.isTimeDomain && !this.isMix) ||
      (this.isTimeDomain && !this.isFreqency)
    ) {
      if (tdArray && tdLength) {
        const tdX_shift = width / tdLength
        analyser.getFloatTimeDomainData(tdArray)
        let tdX = 0
        for (let i = 0; i < tdLength; i++) {
          const d = tdArray[i]
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
    }

    // Mixed
    if (this.isFreqency && this.isTimeDomain && this.isMix) {
      analyser.getByteFrequencyData(freqArray)
      analyser.getFloatTimeDomainData(tdArray)
      const x_shift = (width * 0.5) / freqLength
      let x = width / 2
      let _x = width / 2

      for (let i = 0; i < freqLength; i++) {
        // Freq
        const freq_d = freqArray[i]
        const freq_v = freq_d / 256
        let freq_y = 0
        if (i % 2 === 0 && freq_v !== 0) {
          freq_y = height / 2 - freq_v * (height / 2)
        } else {
          freq_y = height / 2 + freq_v * (height / 2)
        }

        // TimeDomain
        const td_d = tdArray[freqLength + i]
        const td_v = td_d / 2
        const td_y = height / 2 + td_v * height

        if (i === 0) {
          this.canvasCtx.moveTo(x, freq_y * 0.5 + td_y * 0.5)
        } else {
          this.canvasCtx.lineTo(x, freq_y * 0.5 + td_y * 0.5)
        }
        x += x_shift
      }

      for (let i = 0; i < freqLength; i++) {
        // Freq
        const freq_d = freqArray[i]
        const freq_v = freq_d / 256
        let freq_y = 0
        if (i % 2 === 0 && freq_v !== 0) {
          freq_y = height / 2 - freq_v * (height / 2)
        } else {
          freq_y = height / 2 + freq_v * (height / 2)
        }

        // TimeDomain
        const td_d = tdArray[freqLength - i]
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

    // 描画出力
    this.canvasCtx.stroke()
  }
}

export default VisualizeLine
