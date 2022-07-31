import { Controller } from "@hotwired/stimulus";
import { cover } from "intrinsic-scale";

export default class extends Controller {
  declare readonly srcsValue: string;
  declare readonly sizesValue: string;
  declare readonly preloadValue: boolean;
  declare readonly totalFramesValue: number;

  declare readonly outputTarget: HTMLCanvasElement;

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
  observer: IntersectionObserver | null = null;
  isUpdatingFrame: boolean = false;
  imgToCanvas: HTMLImageElement = new Image();
  outputContext: CanvasRenderingContext2D | null = null;
  outputWidth: number = 0;
  outputHeight: number = 0;

  connect() {
    this.processValues();
    if (this.preloadValue) this.preloadImages();
    this.setupViewportObserver();
    this.outputContext = this.outputTarget.getContext("2d");
    this.imgToCanvas.onload = () => {
      this.drawToCanvas();
    };
  }

  disconnect() {
    if (this.observer) this.observer.disconnect();
    window.removeEventListener("scroll", this.handleScrollUpdate);
  }

  // convert stimulus element values into usable class values
  processValues(): void {
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

    const { width, height } = this.outputTarget.getClientRects()[0];

    this.outputWidth = width;
    this.outputHeight = height;
    this.outputTarget.width = width;
    this.outputTarget.height = height;
  }

  // preload all images for a given video set
  preloadImages(): void {
    for (let i = 0; i <= this.totalFramesValue; i++) {
      this.preloadImage(i);
    }
  }

  // preload an individual image
  async preloadImage(i: number): Promise<void> {
    const frameUrl = this.generateFrameUrl(i);
    const newImg = document.createElement("img");
    newImg.src = frameUrl;
  }

  // generate a url with leading zeros from frame file format
  generateFrameUrl(i: number): string {
    if (!this.frameFileFormat) return "";
    const frameNumberWithLeadingZeros = i
      .toString()
      .padStart(this.totalFramesValue.toString().length, "0");
    return `${this.frameFileFormat?.replace("#", frameNumberWithLeadingZeros)}`;
  }

  // setup observer to calc progress through viewport
  setupViewportObserver(): void {
    let options = {
      root: null,
      rootMargin: `${window.innerHeight}px`,
      threshold: 1.0,
    };

    this.observer = new IntersectionObserver(
      this.handleIntersectionUpdate,
      options
    );

    this.observer.observe(this.outputTarget);
  }

  // attach or remove scroll behavior when div is intersecting
  handleIntersectionUpdate = (entries: IntersectionObserverEntry[]): void => {
    if (entries[0].isIntersecting) {
      document.addEventListener("scroll", this.handleScrollUpdate);
    } else {
      document.removeEventListener("scroll", this.handleScrollUpdate);
    }
  };

  // debounce and handle scrolling through parent
  handleScrollUpdate = () => {
    requestAnimationFrame(() => {
      if (this.isUpdatingFrame) return;
      this.isUpdatingFrame = true;

      const frameNumber = this.frameToShow();
      this.updateOutputFrame(frameNumber);
      this.isUpdatingFrame = false;
    });
  };

  // get frame by calcing percentage of scrolling complete
  frameToShow(): number {
    const { top, height } = this.element.getClientRects()[0];
    const perc = (top * -1) / height;
    const clampedPerc = Math.min(Math.max(perc, 0), 1);

    return Math.round(clampedPerc * this.totalFramesValue);
  }

  // update frame on output canvas
  updateOutputFrame(frameNumber: number): void {
    const url = this.generateFrameUrl(frameNumber);
    this.imgToCanvas.src = url;
  }

  // draw image data to canvas after its loaded
  drawToCanvas() {
    const { width, height, x, y } = cover(
      this.outputWidth,
      this.outputHeight,
      960,
      540
    );

    this.outputContext?.drawImage(this.imgToCanvas, x, y, width, height);
  }
}
