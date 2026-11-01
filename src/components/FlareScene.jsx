
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;
  uniform float uTime;

  void main() {
    vUv = uv;

    vec3 p = position;
    float x = uv.x;

    // Asymmetrical comet:
    // A growing head followed by a long, narrow tail.
    float head = smoothstep(0.0, 0.22, x);
    float tail = mix(1.0, 0.075, smoothstep(0.18, 1.0, x));
    float width = head * tail;

    float curve =
      sin(x * 3.0 - uTime * 0.28) * 0.12 +
      sin(x * 7.0 + uTime * 0.18) * 0.035;

    p.y = curve + (uv.y - 0.5) * width * 2.5;

    // Subtle depth and flowing motion.
    p.z += sin(x * 5.0 - uTime * 0.4) * 0.12;
    p.z += cos(uv.y * 6.0 + x * 4.0 - uTime * 0.3) * 0.035;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  uniform float uTime;

  void main() {
    float x = vUv.x;
    float y = abs(vUv.y - 0.5) * 2.0;

    // Match the asymmetrical comet geometry.
    float head = smoothstep(0.0, 0.22, x);
    float tail = mix(1.0, 0.075, smoothstep(0.18, 1.0, x));
    float width = head * tail;

    float edge = 1.0 - smoothstep(width * 0.72, width, y);

    float endFade =
      smoothstep(0.0, 0.035, x) *
      (1.0 - smoothstep(0.96, 1.0, x));

    // Warm head gradually transitions into a blue tail.
    float warm = 1.0 - smoothstep(0.20, 0.57, x);
    float blue = smoothstep(0.28, 0.72, x);

    vec3 deepBlue = vec3(0.003, 0.012, 0.065);
    vec3 electricBlue = vec3(0.015, 0.20, 1.0);
    vec3 cyanBlue = vec3(0.02, 0.58, 1.0);

    vec3 orange = vec3(1.0, 0.19, 0.015);
    vec3 amber = vec3(1.0, 0.53, 0.055);
    vec3 golden = vec3(1.0, 0.82, 0.32);
    vec3 hotCore = vec3(1.0, 0.97, 0.78);

    // Blue tail.
    vec3 blueColor = mix(
      deepBlue,
      electricBlue,
      smoothstep(0.0, 0.65, x)
    );

    blueColor = mix(
      blueColor,
      cyanBlue,
      0.25 + 0.25 * sin(x * 18.0 - uTime * 0.7)
    );

    // Orange and amber around the comet head.
    vec3 warmColor = mix(
      orange,
      amber,
      smoothstep(0.0, 0.55, x)
    );

    warmColor = mix(
      warmColor,
      golden,
      pow(max(0.0, 1.0 - y * 1.5), 2.0) * 0.8
    );

    vec3 color = mix(blueColor, warmColor, warm);

    // Bright yellow-white central head.
    float coreWidth = mix(0.28, 0.09, smoothstep(0.05, 0.5, x));
    float core = exp(-pow(y / max(coreWidth, 0.001), 2.0) * 2.0);

    float headGlow =
      (1.0 - smoothstep(0.12, 0.48, x)) *
      core;

    color = mix(color, golden, headGlow * 0.8);
    color = mix(color, hotCore, headGlow * 0.72);

    // Fine flowing streaks in the blue tail.
    float streakPattern = sin(
      y * 85.0 + x * 18.0 - uTime * 1.5
    );

    float streaks = pow(
      max(0.0, streakPattern),
      12.0
    );

    float streakStrength = blue * streaks * edge * 0.48;

    color = mix(
      color,
      vec3(0.18, 0.68, 1.0),
      streakStrength
    );

    // Fine orange light around the head.
    float orangeRim =
      pow(max(0.0, y), 1.4) *
      (1.0 - smoothstep(0.22, 0.55, x));

    color = mix(color, orange, orangeRim * 0.32);

    // Soft, bright comet body.
    float bodyAlpha = edge * endFade;

    float intensity = mix(0.72, 1.0, core);

    float alpha = bodyAlpha * intensity;

    gl_FragColor = vec4(color * 1.35, alpha);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export default function FlareScene() {
  const host = useRef(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;

    const scene = new THREE.Scene();

    const camera = new THREE.OrthographicCamera(
      -4, 4, 2.5, -2.5, 0.1, 100
    );

    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;

    el.appendChild(renderer.domElement);

    const geometry = new THREE.PlaneGeometry(
      7.2, 2.5, 240, 100
    );

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
      uniforms: {
        uTime: { value: 0 }
      }
    });

    const flare = new THREE.Mesh(geometry, material);
    scene.add(flare);

    const pointer = { x: 0, y: 0 };
    const clock = new THREE.Clock();

    let frame;
    let disposed = false;

    const resize = () => {
      const width = Math.max(el.clientWidth, 1);
      const height = Math.max(el.clientHeight, 1);
      const aspect = width / height;

      const viewHeight = 5;
      const viewWidth = viewHeight * aspect;

      camera.left = -viewWidth / 2;
      camera.right = viewWidth / 2;
      camera.top = viewHeight / 2;
      camera.bottom = -viewHeight / 2;
      camera.updateProjectionMatrix();

      const scale = Math.min(
        1,
        (viewWidth * 0.9) / 7.2,
        (viewHeight * 0.85) / 2.5
      );

      flare.scale.setScalar(scale);

      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, 1.5)
      );

      renderer.setSize(width, height);
    };

    const onPointer = (event) => {
      const rect = el.getBoundingClientRect();

      pointer.x =
        ((event.clientX - rect.left) / rect.width - 0.5) * 2;

      pointer.y =
        ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    el.addEventListener('pointermove', onPointer, {
      passive: true
    });

    const observer = new ResizeObserver(resize);
    observer.observe(el);
    resize();

    const animate = () => {
      if (disposed) return;

      frame = requestAnimationFrame(animate);

      const t = clock.getElapsedTime();

      material.uniforms.uTime.value = t;

      flare.position.x = Math.sin(t * 0.25) * 0.16;
      flare.position.y = Math.sin(t * 0.38) * 0.10;

      flare.rotation.z = Math.sin(t * 0.2) * 0.025;

      flare.rotation.y +=
        (pointer.x * 0.07 - flare.rotation.y) * 0.02;

      flare.rotation.x +=
        (-pointer.y * 0.04 - flare.rotation.x) * 0.02;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      disposed = true;

      cancelAnimationFrame(frame);
      observer.disconnect();

      el.removeEventListener('pointermove', onPointer);

      geometry.dispose();
      material.dispose();
      renderer.dispose();

      renderer.domElement.remove();
    };
  }, []);

  return (
    <div
      className="flare-scene"
      ref={host}
      role="img"
      aria-label="Flowing comet with a golden-orange head and electric-blue tail"
    />
  );
}
