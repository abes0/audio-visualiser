import Oc from "@Components/Oc"
import VisualizeLine from "@Components/VisualizeLine"

const FFT_SIZE = 256

class Sound1 {
  constructor() {
    this.isPlaying = false
    this.soundList = {}
    this.isKeydownList = {}
    this.timer = null
    this.eventRegster()
  }

  eventRegster() {
    document.addEventListener("keypress", this.eKeyDown.bind(this))
    document.addEventListener("keyup", this.eKeyUp.bind(this))
    this.ctx = new AudioContext()
    this.analyser = this.ctx.createAnalyser()
    this.analyser.fftSize = FFT_SIZE
    this.analyserFreqLength = this.analyser.frequencyBinCount
    this.analyserFreqArray = new Uint8Array(this.analyserFreqLength)
    this.analyserTdLength = this.analyser.fftSize
    this.analyserTdArray = new Float32Array(this.analyserTdLength)
    this.visual = new VisualizeLine({ el: document.querySelector("#app") })
    this.visual.addGUI()
    this.onTick()
  }

  eKeyDown(e) {
    if (
      e.key !== "q" &&
      e.key !== "w" &&
      e.key !== "e" &&
      e.key !== "r" &&
      e.key !== "t" &&
      e.key !== "y" &&
      e.key !== "u" &&
      e.key !== "i" &&
      e.key !== "a" &&
      e.key !== "l"
    )
      return

    if (this.isKeydownList[e.key]) return
    this.isKeydownList[e.key] = true
    const oc = (this.soundList[e.key] = new Oc({ context: this.ctx }))
    switch (e.key) {
      case "q":
        oc.start({ freq: 261, connectTarget: this.analyser })
        break
      case "w":
        oc.start({ freq: 294, connectTarget: this.analyser })
        break
      case "e":
        oc.start({ freq: 330, connectTarget: this.analyser })
        break
      case "r":
        oc.start({ freq: 349, connectTarget: this.analyser })
        break
      case "t":
        oc.start({ freq: 392, connectTarget: this.analyser })
        break
      case "y":
        oc.start({ freq: 440, connectTarget: this.analyser })
        break
      case "u":
        oc.start({ freq: 494, connectTarget: this.analyser })
        break
      case "i":
        oc.start({ freq: 522, connectTarget: this.analyser })
        break
      case "a":
        oc.start({ freq: 880, connectTarget: this.analyser })
        break
      case "l":
        oc.start({ freq: 100, connectTarget: this.analyser })
        break
      default:
        return
    }

    if (this.timer) {
      clearTimeout(this.timer)
    }

    if (!this.isPlaying) {
      this.isPlaying = true
      this.onTick()
    }
  }

  eKeyUp(e) {
    if (this.soundList[e.key]) {
      this.isKeydownList[e.key] = false
      this.soundList[e.key].stop()
    }

    const isKeyDownNow = Object.values(this.isKeydownList).some((i) => i)
    if (this.isPlaying && !isKeyDownNow) {
      this.timer = setTimeout(() => {
        this.isPlaying = isKeyDownNow
      }, 500)
    }
  }

  onTick() {
    if (this.isPlaying) requestAnimationFrame(this.onTick.bind(this))
    this.visual.draw({
      analyser: this.analyser,
      freqArray: this.analyserFreqArray,
      freqLength: this.analyserFreqLength,
      tdArray: this.analyserTdArray,
      tdLength: this.analyserTdLength,
    })
  }
}

export default Sound1
