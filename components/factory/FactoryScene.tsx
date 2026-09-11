'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { Parameters } from '@/lib/factory/simulation';
import { stations } from '@/lib/factory/simulation';

type Props = { params: Parameters; running: boolean; warning: boolean; buffer: number; selected: number; onSelect: (index: number) => void };

export default function FactoryScene(props: Props) {
  const host = useRef<HTMLDivElement>(null);
  const live = useRef(props);
  const cameraAction = useRef<(action: string) => void>(() => {});
  const [failed, setFailed] = useState(false);
  useEffect(() => { live.current = props; }, [props]);

  useEffect(() => {
    const root = host.current;
    if (!root) return;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' }); }
    catch { setFailed(true); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.domElement.setAttribute('aria-label', '智慧冲压产线三维模型。拖动旋转，滚轮缩放；也可使用视角按钮和下方工序按钮。');
    renderer.domElement.setAttribute('role', 'img');
    root.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, .1, 120);
    camera.position.set(20, 19, 26);
    const orbit = new OrbitControls(camera, renderer.domElement);
    orbit.target.set(0, 1, 0);
    orbit.enableDamping = true;
    orbit.enablePan = false;
    orbit.minDistance = 12;
    orbit.maxDistance = 55;
    orbit.maxPolarAngle = Math.PI * .47;
    orbit.minPolarAngle = .15;
    scene.add(new THREE.HemisphereLight(0xc8eeff, 0x25344b, 3));
    const light = new THREE.DirectionalLight(0xffffff, 4);
    light.position.set(-5, 18, 10); light.castShadow = true;
    light.shadow.mapSize.set(1024, 1024);
    Object.assign(light.shadow.camera, { left: -20, right: 20, top: 15, bottom: -15 });
    light.shadow.bias = -.001;
    scene.add(light);
    const rim = new THREE.DirectionalLight(0x5bdfff, 3); rim.position.set(5, 8, -12); scene.add(rim);

    const mats = {
      steel: new THREE.MeshStandardMaterial({ color: 0xacc2d2, metalness: .72, roughness: .3 }),
      white: new THREE.MeshStandardMaterial({ color: 0xd9e6ee, metalness: .35, roughness: .32 }),
      navy: new THREE.MeshStandardMaterial({ color: 0x1c3349, metalness: .5, roughness: .4 }),
      dark: new THREE.MeshStandardMaterial({ color: 0x0b1726, metalness: .3, roughness: .5 }),
      amber: new THREE.MeshStandardMaterial({ color: 0xffb631, metalness: .4, roughness: .35 }),
      cyan: new THREE.MeshStandardMaterial({ color: 0x46d6ef, emissive: 0x199eb5, emissiveIntensity: .6, roughness: .35 }),
      green: new THREE.MeshStandardMaterial({ color: 0x62f1b1, emissive: 0x1ad583, emissiveIntensity: .8 }),
      glass: new THREE.MeshPhysicalMaterial({ color: 0x80d9ed, metalness: .05, roughness: .12, transparent: true, opacity: .22, side: THREE.DoubleSide, depthWrite: false }),
    };
    const geometries: THREE.BufferGeometry[] = [];
    const textures: THREE.Texture[] = [];
    function box(parent: THREE.Object3D, x: number, y: number, z: number, w: number, h: number, d: number, mat: THREE.Material) {
      const geo = new THREE.BoxGeometry(w, h, d); geometries.push(geo);
      const mesh = new THREE.Mesh(geo, mat); mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
    }
    function roller(parent: THREE.Object3D, x: number, y: number, z: number, radius: number, length: number, mat = mats.steel) {
      const geo = new THREE.CylinderGeometry(radius, radius, length, 24); geometries.push(geo);
      const mesh = new THREE.Mesh(geo, mat); mesh.rotation.x = Math.PI / 2; mesh.position.set(x, y, z); mesh.castShadow = true; parent.add(mesh);
      box(mesh, radius * .48, length / 2 + .01, 0, radius * .85, .025, .05, mats.navy);
      return mesh;
    }
    box(scene, 0, -.35, 0, 29, .55, 10, mats.navy);
    box(scene, 0, -.04, 0, 28.8, .04, 9.8, mats.dark);
    const grid = new THREE.GridHelper(28, 28, 0x335569, 0x1e354a); grid.position.y = 0; scene.add(grid);
    for (const z of [-4.6, 4.6]) box(scene, 0, .02, z, 27, .025, .035, mats.cyan);
    box(scene, 0, 1, 0, 25.5, .23, 1.3, mats.navy);
    for (const z of [-.73, .73]) box(scene, 0, 1.18, z, 25.5, .16, .08, mats.steel);
    for (let x = -12; x < 13; x += .7) roller(scene, x, 1.16, 0, .085, 1.28);
    for (let x = -11; x < 13; x += 3) for (const z of [-.5, .5]) box(scene, x, .5, z, .1, 1, .1, mats.steel);

    const groups: THREE.Group[] = [], lamps: THREE.Mesh[] = [], rotors: { mesh: THREE.Mesh; key: keyof Parameters }[] = [];
    const highlights: THREE.Mesh[] = [];
    const labelMaterials: THREE.SpriteMaterial[] = [];
    const stationX = [-10.5, -7, -3.5, 0, 3.5, 7, 10.5];
    function label(text: string, x: number, y: number) {
      const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 96;
      const context = canvas.getContext('2d'); if (!context) return;
      context.fillStyle = 'rgba(8,22,39,.85)'; context.fillRect(0, 0, 512, 96);
      context.strokeStyle = '#467289'; context.strokeRect(1, 1, 510, 94);
      context.font = '600 36px sans-serif'; context.fillStyle = '#d6edf5'; context.textAlign = 'center'; context.fillText(text, 256, 61);
      const texture = new THREE.CanvasTexture(canvas); textures.push(texture);
      const material = new THREE.SpriteMaterial({ map: texture, depthTest: false }); labelMaterials.push(material);
      const sprite = new THREE.Sprite(material); sprite.position.set(x, y, 0); sprite.scale.set(2.9, .55, 1); scene.add(sprite);
    }
    stationX.forEach((x, i) => {
      const group = new THREE.Group(); group.position.x = x; group.userData.station = i; scene.add(group); groups.push(group);
      box(group, 0, .16, 0, 2.7, .3, 3.15, mats.navy);
      const highlight = box(group, 0, .33, 1.48, 2.7, .04, .06, mats.cyan); highlights.push(highlight);
      box(group, -.95, 2.5, -.85, .06, .6, .06, mats.steel);
      const lamp = box(group, -.95, 2.85, -.85, .15, .18, .15, mats.green); lamps.push(lamp);
      label(`${String(i + 1).padStart(2, '0')} / ${['COIL', 'LEVELER', 'CLEAN', 'FILM', 'MARK', 'PRESS', 'AOI'][i]}`, x, i === 5 ? 5.7 : 3.6);
      if (i === 0) {
        box(group, 0, .8, 0, .7, 1.5, 1.9, mats.white);
        const coil = roller(group, 0, 1.85, 0, 1.07, 1.3); rotors.push({ mesh: coil, key: 'leveler' });
        for (const z of [-.67, .67]) {
          const g = new THREE.TorusGeometry(.84, .03, 8, 48); geometries.push(g);
          const ring = new THREE.Mesh(g, mats.navy); ring.position.set(0, 1.85, z); group.add(ring);
          roller(group, 0, 1.85, z, .28, .08, mats.dark);
        }
      } else if (i === 1 || i === 2 || i === 3) {
        for (const z of [-.95, .95]) {
          box(group, 0, 1.3, z, 2.25, 2.05, .25, i === 2 ? mats.white : mats.navy);
          box(group, 0, 2.4, z, 2.3, .12, .3, mats.steel);
        }
        for (let j = -1; j <= 1; j++) {
          rotors.push({ mesh: roller(group, j * .65, 1.48, 0, .23, 1.75, i === 2 ? mats.white : mats.steel), key: i === 3 ? 'film' : i === 2 ? 'cleaning' : 'leveler' });
          rotors.push({ mesh: roller(group, j * .65, 1.03, 0, .2, 1.75), key: 'leveler' });
        }
        if (i === 3 || i === 2) {
          const roll = roller(group, 0, 2.42, 0, .42, 1.6, i === 3 ? mats.cyan : mats.white);
          rotors.push({ mesh: roll, key: i === 3 ? 'film' : 'cleaning' });
          box(group, 0, 1.87, 0, .045, 1.15, 1.4, i === 3 ? mats.glass : mats.white);
        }
      } else if (i === 4) {
        box(group, .65, 1.7, -.8, .25, 2.8, .3, mats.white);
        box(group, .1, 2.95, 0, 1.35, .3, 1.65, mats.white);
        box(group, 0, 2.5, 0, .5, .6, .5, mats.navy);
        box(group, 0, 1.9, 0, .012, .7, .012, mats.cyan);
      } else if (i === 5) {
        for (const xx of [-1.05, 1.05]) for (const z of [-.85, .85]) box(group, xx, 2.25, z, .28, 4, .28, mats.white);
        box(group, 0, 4.3, 0, 2.75, .9, 2.5, mats.white);
        box(group, 0, 4.28, 1.27, 1.8, .25, .03, mats.navy);
        box(group, 0, 1.43, 0, 1.8, .4, 1.8, mats.steel);
        box(group, 0, 3.28, 0, .6, 1.2, .6, mats.steel);
      } else {
        for (const xx of [-1.1, 1.1]) box(group, xx, 1.8, 0, .22, 3, 2, mats.white);
        box(group, 0, 3.15, 0, 2.5, .3, 2.2, mats.white);
        box(group, 0, 2.1, -.97, 2.05, 1.8, .035, mats.glass);
        box(group, 0, 2.75, 0, .5, .28, .5, mats.navy);
        box(group, 0, 2.55, 0, .2, .05, .2, mats.cyan);
      }
      // Operator HMI on the front of each station.
      box(group, .82, 1.5, 1.18, .55, .44, .15, mats.dark);
      box(group, .82, 1.53, 1.27, .43, .28, .015, mats.cyan);
    });
    const ram = box(groups[5], 0, 2.35, 0, 1.85, .5, 1.8, mats.amber);
    const scanner = box(groups[6], 0, 1.3, 0, .025, .04, 1.3, mats.green);
    function robot(x: number, z: number) {
      const base = new THREE.Group(); base.position.set(x, 0, z); scene.add(base);
      box(base, 0, .15, 0, .9, .3, .9, mats.navy);
      const shoulder = new THREE.Group(); shoulder.position.y = .6; base.add(shoulder);
      box(shoulder, 0, .45, 0, .35, 1.1, .38, mats.amber);
      roller(shoulder, 0, 1, 0, .28, .5, mats.dark);
      const elbow = new THREE.Group(); elbow.position.set(0, 1, 0); shoulder.add(elbow);
      box(elbow, .55, 0, 0, 1.15, .3, .32, mats.amber);
      box(elbow, 1.05, -.25, 0, .22, .55, .24, mats.steel);
      for (const zz of [-.18, .18]) box(elbow, 1.05, -.55, zz, .1, .25, .07, mats.dark);
      return { shoulder, elbow };
    }
    const loader = robot(5, 2.1), unloader = robot(9, -2.1);
    const parts = Array.from({ length: 20 }, (_, i) => {
      const part = box(scene, -12 + i * 1.25, 1.33, 0, .5, .035, .85, mats.steel);
      return part;
    });
    const stock = Array.from({ length: 10 }, (_, i) => box(scene, 12.8, .4 + i * .08, 2.5, .75, .05, 1.2, mats.steel));
    const picking = new THREE.Raycaster(), pointer = new THREE.Vector2();
    let down = { x: 0, y: 0 };
    function pointerDown(e: PointerEvent) { down = { x: e.clientX, y: e.clientY }; }
    function pointerUp(e: PointerEvent) {
      if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > 5) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set((e.clientX - rect.left) / rect.width * 2 - 1, -(e.clientY - rect.top) / rect.height * 2 + 1);
      picking.setFromCamera(pointer, camera);
      const hit = picking.intersectObjects(groups, true)[0];
      if (!hit) return;
      let node: THREE.Object3D | null = hit.object;
      while (node && node.userData.station === undefined) node = node.parent;
      if (node) live.current.onSelect(node.userData.station);
    }
    renderer.domElement.addEventListener('pointerdown', pointerDown);
    renderer.domElement.addEventListener('pointerup', pointerUp);
    let contextLost = false;
    const lost = (e: Event) => { e.preventDefault(); contextLost = true; setFailed(true); };
    renderer.domElement.addEventListener('webglcontextlost', lost);
    function homeCamera() {
      const distance = Math.max(29, 46 / Math.max(.5, camera.aspect));
      camera.position.set(20, 19, 26).normalize().multiplyScalar(distance);
      orbit.maxDistance = Math.max(55, distance + 10);
      orbit.target.set(0, 1, 0);
    }
    const resize = new ResizeObserver(() => {
      const width = root.clientWidth, height = root.clientHeight;
      if (!width || !height) return;
      camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height); homeCamera();
    }); resize.observe(root);
    cameraAction.current = action => {
      if (action === 'top') { camera.position.set(0, 33, .01); orbit.target.set(0, 0, 0); }
      else if (action === 'front') { camera.position.set(0, 12, 33); orbit.target.set(0, 1, 0); }
      else if (action === 'in' || action === 'out') camera.position.sub(orbit.target).multiplyScalar(action === 'in' ? .85 : 1.15).clampLength(12, 55).add(orbit.target);
      else homeCamera();
      orbit.update();
    };
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0, previous = 0, phase = 0, loaderPhase = 0, unloaderPhase = 0;
    function render(now: number) {
      frame = requestAnimationFrame(render);
      const dt = Math.min((now - previous) / 1000, .06); previous = now;
      if (document.hidden || contextLost) return;
      const p = live.current;
      if (p.running && !reduced.matches) {
        phase += dt * p.params.speed / 60;
        loaderPhase += dt * p.params.loader / 60;
        unloaderPhase += dt * p.params.unloader / 60;
        ram.position.y = 2.15 + Math.cos(phase * Math.PI * 2) * .38;
        scanner.position.x = Math.sin(phase * 3) * .9;
        loader.shoulder.rotation.y = Math.sin(loaderPhase * 3) * .8 - 1;
        loader.elbow.rotation.z = Math.sin(loaderPhase * 3) * .35;
        unloader.shoulder.rotation.y = Math.sin(unloaderPhase * 3) * .8 + 1;
        unloader.elbow.rotation.z = Math.sin(unloaderPhase * 3) * .35;
        rotors.forEach(({ mesh, key }) => { mesh.rotation.y += dt * p.params[key] / 10; });
        const actual = Math.min(p.params.speed, p.params.loader, p.params.unloader, p.params.marking, p.params.leveler / .25);
        parts.forEach(part => { part.position.x += dt * actual / 35; if (part.position.x > 12.5) part.position.x = -12.5; });
      }
      groups.forEach((_, i) => { highlights[i].visible = i === p.selected; lamps[i].material = !p.running ? mats.amber : p.warning && (i === 5 || i === 6) ? mats.amber : mats.green; });
      stock.forEach((part, i) => { part.visible = i < Math.ceil(p.buffer / 6); });
      orbit.update(); renderer.render(scene, camera);
    }
    frame = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(frame); resize.disconnect(); orbit.dispose();
      renderer.domElement.removeEventListener('pointerdown', pointerDown);
      renderer.domElement.removeEventListener('pointerup', pointerUp);
      renderer.domElement.removeEventListener('webglcontextlost', lost);
      geometries.forEach(g => g.dispose()); Object.values(mats).forEach(m => m.dispose());
      labelMaterials.forEach(m => m.dispose()); textures.forEach(t => t.dispose());
      grid.geometry.dispose(); (grid.material as THREE.Material).dispose();
      renderer.dispose(); renderer.domElement.remove(); cameraAction.current = () => {};
    };
  }, []);

  return <div className="factory-scene-shell">
    <div ref={host} className="factory-scene-canvas" />
    {failed ? <div className="factory-scene-fallback"><strong>当前设备未能加载 3D 视图</strong><p>仍可使用下方工序、参数和 AI 完整体验仿真。</p><div>{stations.map((s, i) => <button key={s.name} onClick={() => props.onSelect(i)}>{i + 1}. {s.name}</button>)}</div></div> : null}
    <div className="factory-camera-tools" aria-label="三维视角">
      <button onClick={() => cameraAction.current('home')}>透视</button>
      <button onClick={() => cameraAction.current('top')}>俯视</button>
      <button onClick={() => cameraAction.current('front')}>正面</button>
      <button aria-label="放大模型" onClick={() => cameraAction.current('in')}>＋</button>
      <button aria-label="缩小模型" onClick={() => cameraAction.current('out')}>−</button>
    </div>
  </div>;
}
