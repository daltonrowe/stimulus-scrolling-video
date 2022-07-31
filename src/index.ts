import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  declare readonly srcsValue: string;
  declare readonly sizesValue: string;
  declare readonly preloadValue: boolean;
  declare readonly totalFramesValue: number;

  static targets = ["output"];

  static values = {
    sizes: String,
    srcs: String,
    preload: Boolean,
    totalFrames: Number,
  };

  srcs: string[] = [];
  sizes: number[] = [];
  frameFileFormat: string | null = null;

  connect() {
    this.processValues();
    if (this.preloadValue) this.preloadImages();
  }

  disconnect() {}

  processValues() {
    this.srcs = this.srcsValue.split(",");
    this.sizes = this.sizesValue
      .split(",")
      .map((size: string) => parseInt(size));

    let sizeToUse = 0;
    for (let i = 0; i < this.sizes.length; i++) {
      const size = this.sizes[i];
      if (window.innerWidth >= size) sizeToUse = i;
    }

    this.frameFileFormat = this.srcs[sizeToUse];
  }

  preloadImages() {
    for (let i = 0; i <= this.totalFramesValue; i++) {
      const frameUrl = this.generateFrameUrl(i);
      const newImg = document.createElement("img");
      newImg.src = frameUrl;
    }
  }

  generateFrameUrl(i: number) {
    const frameNumberWithLeadingZeros = i
      .toString()
      .padStart(this.totalFramesValue.toString().length, "0");
    return `${this.frameFileFormat?.replace("#", frameNumberWithLeadingZeros)}`;
  }
}
