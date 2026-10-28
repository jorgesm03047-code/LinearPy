import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
interface Props {
  u?: [number, number, number];
  v?: [number, number, number];
  cross?: [number, number, number];
  showPlane?: boolean;
}
export function Viewport3D({
  u = [1, 2, 3],
  v = [4, 5, 6],
  cross = [-3, 6, -3],
  showPlane = true,
}: Props) {
  const mount = useRef<HTMLDivElement>(null);
  const action = useRef<(name: string) => void>(() => {});
  const [error, setError] = useState(false);
  const signature = JSON.stringify([u, v, cross, showPlane]);
  useEffect(() => {
    const container = mount.current;
    if (!container) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch {
      setError(true);
      return;
    }
    setError(false);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#101f29');
    const extent =
      Math.max(...u.map(Math.abs), ...v.map(Math.abs), ...cross.map(Math.abs), 4) * 1.6;
    const camera = new THREE.PerspectiveCamera(45, 1, extent / 10000, extent * 100);
    const initial = new THREE.Vector3(1, 0.85, 1.25).normalize().multiplyScalar(extent * 2.9);
    camera.position.copy(initial);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    const canvas = renderer.domElement;
    canvas.tabIndex = 0;
    canvas.setAttribute(
      'aria-label',
      'Escena 3D con escala numérica en los ejes y vectores u, v y su producto cruz. Usa las flechas para orbitar y los botones para acercar o restablecer.',
    );
    canvas.setAttribute('role', 'img');
    container.appendChild(canvas);
    const render = () => renderer.render(scene, camera);
    const controls = new OrbitControls(camera, canvas);
    controls.enablePan = false;
    controls.minDistance = extent * 0.1;
    controls.maxDistance = extent * 10;
    controls.addEventListener('change', render);
    scene.add(new THREE.GridHelper(extent * 2, 16, 0x426275, 0x253a48));
    scene.add(new THREE.AxesHelper(extent));
    const rawTickStep = extent / 4;
    const magnitude = 10 ** Math.floor(Math.log10(rawTickStep));
    const normalizedStep = rawTickStep / magnitude;
    const tickStep =
      (normalizedStep <= 1 ? 1 : normalizedStep <= 2 ? 2 : normalizedStep <= 5 ? 5 : 10) *
      magnitude;
    const labelMaterials: THREE.SpriteMaterial[] = [];
    const label = (text: string, position: THREE.Vector3, color = '#d0dce6') => {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 64;
      const context = canvas.getContext('2d');
      if (!context) return;
      context.font = '32px ui-sans-serif, system-ui, sans-serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillStyle = color;
      context.fillText(text, canvas.width / 2, canvas.height / 2);
      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false,
      });
      labelMaterials.push(material);
      const sprite = new THREE.Sprite(material);
      sprite.position.copy(position);
      sprite.scale.set(tickStep * 0.34, tickStep * 0.17, 1);
      sprite.renderOrder = 2;
      scene.add(sprite);
    };
    const lastTick = Math.floor(extent / tickStep) * tickStep;
    for (let tick = -lastTick; tick <= lastTick + tickStep / 2; tick += tickStep) {
      if (Math.abs(tick) < tickStep / 100) continue;
      label(String(Number(tick.toPrecision(3))), new THREE.Vector3(tick, -tickStep * 0.16, 0));
      label(String(Number(tick.toPrecision(3))), new THREE.Vector3(tickStep * 0.16, tick, 0));
      label(String(Number(tick.toPrecision(3))), new THREE.Vector3(0, -tickStep * 0.16, tick));
    }
    label('0', new THREE.Vector3(-tickStep * 0.18, -tickStep * 0.18, 0));
    label('x', new THREE.Vector3(extent * 1.04, 0, 0), '#70c7ee');
    label('y', new THREE.Vector3(0, extent * 1.04, 0), '#b8e986');
    label('z', new THREE.Vector3(0, 0, extent * 1.04), '#f4ad4e');
    const arrow = (values: [number, number, number], color: number) => {
      const vector = new THREE.Vector3(...values);
      const length = vector.length();
      if (length > 0)
        scene.add(
          new THREE.ArrowHelper(
            vector.normalize(),
            new THREE.Vector3(),
            length,
            color,
            Math.min(length * 0.22, extent * 0.12),
            Math.min(length * 0.09, extent * 0.05),
          ),
        );
    };
    arrow(u, 0x55b9e7);
    arrow(v, 0xf4ad4e);
    arrow(cross, 0xf4f7f9);
    if (showPlane) {
      const uv = new THREE.Vector3(...u),
        vv = new THREE.Vector3(...v),
        sum = uv.clone().add(vv);
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(),
        uv,
        sum,
        new THREE.Vector3(),
        sum,
        vv,
      ]);
      geometry.computeVertexNormals();
      scene.add(
        new THREE.Mesh(
          geometry,
          new THREE.MeshBasicMaterial({
            color: 0x258ac0,
            opacity: 0.2,
            transparent: true,
            side: THREE.DoubleSide,
          }),
        ),
      );
    }
    action.current = (name) => {
      if (name === 'reset') camera.position.copy(initial);
      else if (name === 'in' || name === 'out')
        camera.position.multiplyScalar(name === 'in' ? 0.8 : 1.25);
      else {
        const sphere = new THREE.Spherical().setFromVector3(camera.position);
        sphere.theta += name === 'left' ? -0.2 : name === 'right' ? 0.2 : 0;
        sphere.phi = THREE.MathUtils.clamp(
          sphere.phi + (name === 'up' ? -0.2 : name === 'down' ? 0.2 : 0),
          0.1,
          Math.PI - 0.1,
        );
        camera.position.setFromSpherical(sphere);
      }
      controls.update();
      render();
    };
    const onKey = (event: KeyboardEvent) => {
      const actions: Record<string, string> = {
        ArrowLeft: 'left',
        ArrowRight: 'right',
        ArrowUp: 'up',
        ArrowDown: 'down',
        '+': 'in',
        '-': 'out',
        Home: 'reset',
      };
      const name = actions[event.key];
      if (name) {
        event.preventDefault();
        action.current(name);
      }
    };
    canvas.addEventListener('keydown', onKey);
    const resize = () => {
      const width = container.clientWidth,
        height = container.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      render();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    controls.update();
    resize();
    return () => {
      observer.disconnect();
      controls.dispose();
      canvas.removeEventListener('keydown', onKey);
      scene.traverse((object) => {
        const item = object as THREE.Mesh;
        if (item.geometry) item.geometry.dispose();
        if (item.material) {
          const materials = Array.isArray(item.material) ? item.material : [item.material];
          materials.forEach((material) => material.dispose());
        }
      });
      labelMaterials.forEach((material) => material.map?.dispose());
      renderer.dispose();
      canvas.remove();
      action.current = () => {};
    };
    // La firma agrupa las coordenadas para reconstruir solo cuando cambian los valores.
  }, [signature]);
  return (
    <div>
      <div className="viewport-container" ref={mount}>
        {error ? (
          <p className="viewport-controls-hint" role="status">
            Tu navegador no pudo iniciar WebGL. Los cálculos y procedimientos siguen disponibles.
          </p>
        ) : (
          <div className="viewport-controls-hint">
            Arrastra con un dedo para rotar · Pellizca para acercar · También puedes usar los
            controles inferiores.
          </div>
        )}
      </div>
      <div className="viewport-buttons" aria-label="Controles de la cámara 3D">
        {[
          ['left', '←', 'Girar a la izquierda'],
          ['right', '→', 'Girar a la derecha'],
          ['up', '↑', 'Girar hacia arriba'],
          ['down', '↓', 'Girar hacia abajo'],
          ['in', '+', 'Acercar'],
          ['out', '−', 'Alejar'],
          ['reset', 'Restablecer', 'Restablecer cámara'],
        ].map(([name, label, aria]) => (
          <button type="button" key={name} aria-label={aria} onClick={() => action.current(name)}>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
