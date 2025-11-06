import React, { useEffect, useRef } from 'react';

class SiriWaveCanvas {
  constructor(container, options = {}) {
    this.container = container;
    this.opt = {
      style: 'ios',
      ratio: window.devicePixelRatio || 1,
      speed: 0.2,
      amplitude: 1,
      frequency: 6,
      color: '#fff',
      cover: true, // Changed to true for better fitting
      width: 40,
      height: 40,
      autostart: true,
      pixelDepth: 0.02,
      lerpSpeed: 0.1,
      globalCompositeOperation: 'lighter',
      ...options
    };

    this.phase = 0;
    this.run = false;
    this.curves = [];
    
    this.speed = Number(this.opt.speed);
    this.amplitude = Number(this.opt.amplitude);
    this.width = Number(this.opt.ratio * this.opt.width);
    this.height = Number(this.opt.ratio * this.opt.height);
    this.heightMax = Number(this.height / 2) - 2;
    this.color = this.hexToRgb(this.opt.color);
    
    this.interpolation = {
      speed: this.speed,
      amplitude: this.amplitude,
    };

    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    
    if (!this.ctx) {
      throw new Error('Unable to create 2D Context');
    }

    // Set canvas dimensions
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    
    // Ensure canvas fits perfectly in container
    if (this.opt.cover === true) {
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
    } else {
      this.canvas.style.width = `${this.width / this.opt.ratio}px`;
      this.canvas.style.height = `${this.height / this.opt.ratio}px`;
    }
    
    this.canvas.style.borderRadius = '50%';
    this.canvas.style.display = 'block'; // Ensure proper display

    // Initialize curves
    this.initializeCurves();
    
    // Clear container and append canvas
    this.container.innerHTML = '';
    this.container.appendChild(this.canvas);
    
    if (this.opt.autostart) {
      this.start();
    }
  }

  hexToRgb(hex) {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`
      : '255,255,255';
  }

  initializeCurves() {
    const curveDefinitions = [
      { attenuation: -2, lineWidth: 0.5, opacity: 0.1 },
      { attenuation: -6, lineWidth: 0.5, opacity: 0.2 },
      { attenuation: 4, lineWidth: 0.5, opacity: 0.4 },
      { attenuation: 2, lineWidth: 1, opacity: 0.6 },
      { attenuation: 1, lineWidth: 1.5, opacity: 1 },
    ];

    this.curves = curveDefinitions.map(def => new ClassicCurve(this, def));
  }

  intLerp(v0, v1, t) {
    return v0 * (1 - t) + v1 * t;
  }

  lerp(propertyStr) {
    const prop = this.interpolation[propertyStr];
    if (prop !== null) {
      this[propertyStr] = this.intLerp(this[propertyStr], prop, this.opt.lerpSpeed);
      if (Math.abs(this[propertyStr] - prop) < 0.001) {
        this.interpolation[propertyStr] = null;
      }
    }
    return this[propertyStr];
  }

  clear() {
    this.ctx.globalCompositeOperation = 'destination-out';
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.globalCompositeOperation = 'source-over';
  }

  draw() {
    this.curves.forEach(curve => curve.draw());
  }

  startDrawCycle() {
    if (!this.run) return;
    
    this.clear();
    this.lerp('amplitude');
    this.lerp('speed');
    this.draw();
    this.phase = (this.phase + (Math.PI / 2) * this.speed) % (2 * Math.PI);
    
    this.animationFrameId = requestAnimationFrame(() => this.startDrawCycle());
  }

  start() {
    if (!this.canvas) return;
    this.phase = 0;
    if (!this.run) {
      this.run = true;
      this.startDrawCycle();
    }
  }

  stop() {
    this.phase = 0;
    this.run = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  setSpeed(value) {
    this.interpolation.speed = value;
  }

  setAmplitude(value) {
    this.interpolation.amplitude = value;
  }

  dispose() {
    this.stop();
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
      this.canvas = null;
    }
  }
}

class ClassicCurve {
  constructor(ctrl, definition) {
    this.ctrl = ctrl;
    this.definition = definition;
    this.ATT_FACTOR = 4;
    this.GRAPH_X = 2;
    this.AMPLITUDE_FACTOR = 0.6;
  }

  globalAttFn(x) {
    return Math.pow(this.ATT_FACTOR / (this.ATT_FACTOR + Math.pow(x, this.ATT_FACTOR)), this.ATT_FACTOR);
  }

  xPos(i) {
    return this.ctrl.width * ((i + this.GRAPH_X) / (this.GRAPH_X * 2));
  }

  yPos(i) {
    return (
      this.AMPLITUDE_FACTOR *
      (this.globalAttFn(i) *
        (this.ctrl.heightMax * this.ctrl.amplitude) *
        (1 / this.definition.attenuation) *
        Math.sin(this.ctrl.opt.frequency * i - this.ctrl.phase))
    );
  }

  draw() {
    const { ctx } = this.ctrl;
    ctx.beginPath();
    
    const finalColor = this.definition.color || this.ctrl.color;
    ctx.strokeStyle = `rgba(${finalColor},${this.definition.opacity})`;
    ctx.lineWidth = this.definition.lineWidth;
    
    ctx.moveTo(0, this.ctrl.heightMax);
    
    for (let i = -this.GRAPH_X; i <= this.GRAPH_X; i += this.ctrl.opt.pixelDepth) {
      ctx.lineTo(this.xPos(i), this.ctrl.heightMax + this.yPos(i));
    }
    
    ctx.stroke();
  }
}

const SiriWave = ({ 
  width = 40, 
  height = 40, 
  speed = 0.2, 
  amplitude = 1, 
  frequency = 6, 
  color = '#00f0ff',
  autostart = true,
  speaking = false 
}) => {
  const containerRef = useRef();
  const siriWaveRef = useRef();

  useEffect(() => {
    if (containerRef.current && !siriWaveRef.current) {
      siriWaveRef.current = new SiriWaveCanvas(containerRef.current, {
        width,
        height,
        speed,
        amplitude,
        frequency,
        color,
        autostart,
        style: 'ios',
        cover: true
      });
    }

    return () => {
      if (siriWaveRef.current) {
        siriWaveRef.current.dispose();
        siriWaveRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (siriWaveRef.current) {
      if (speaking) {
        siriWaveRef.current.setSpeed(0.4);
        siriWaveRef.current.setAmplitude(1.5);
      } else {
        siriWaveRef.current.setSpeed(0.2);
        siriWaveRef.current.setAmplitude(0.5);
      }
    }
  }, [speaking]);

  return (
    <div 
      ref={containerRef}
      style={{ 
        width: `${width}px`, 
        height: `${height}px`,
        position: 'relative',
        borderRadius: '50%',
        background: speaking 
          ? 'radial-gradient(circle at 30% 30%, rgba(48,209,88,0.8) 0%, rgba(0,122,255,0.6) 50%, rgba(255,45,146,0.4) 100%)'
          : 'radial-gradient(circle at 30% 30%, rgba(0,122,255,0.6) 0%, rgba(88,86,214,0.5) 50%, rgba(255,45,146,0.4) 100%)',
        boxShadow: speaking 
          ? '0 0 20px rgba(48,209,88,0.6)' 
          : '0 0 15px rgba(0,122,255,0.4)',
        overflow: 'visible', // Changed from 'hidden' to 'visible'
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    />
  );
};

export default SiriWave;
