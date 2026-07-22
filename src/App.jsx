import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

function createToonGradient() {
  const data = new Uint8Array([70, 140, 200, 255]);
  const texture = new THREE.DataTexture(data, data.length, 1, THREE.LuminanceFormat);
  texture.needsUpdate = true;
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  return texture;
}

function addOutline(mesh, thickness = 0.035, color = 0x241a17) {
  const outlineMat = new THREE.MeshBasicMaterial({ color, side: THREE.BackSide });
  const outline = new THREE.Mesh(mesh.geometry, outlineMat);
  const s = 1 + thickness;
  outline.scale.set(s, s, s);
  mesh.add(outline);
  return outline;
}

function makeGlowTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const grd = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grd.addColorStop(0, "rgba(255,235,190,1)");
  grd.addColorStop(0.4, "rgba(255,200,140,0.55)");
  grd.addColorStop(1, "rgba(255,200,140,0)");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

export default function AnimeBuilding() {
  const mountRef = useRef(null);
  const cutawayRef = useRef({ groups: [], hidden: false });
  const [wallsHidden, setWallsHidden] = useState(false);

  function toggleWalls() {
    const state = cutawayRef.current;
    state.hidden = !state.hidden;
    state.groups.forEach((g) => {
      g.visible = !state.hidden;
    });
    setWallsHidden(state.hidden);
  }

  useEffect(() => {
    const mount = mountRef.current;
    let width = mount.clientWidth;
    let height = mount.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xffd8a8, 0.026);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 200);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    mount.appendChild(renderer.domElement);

    const gradientMap = createToonGradient();

    // ---------- Sky dome ----------
    const skyGeo = new THREE.SphereGeometry(60, 32, 16);
    const posAttr = skyGeo.attributes.position;
    const top = new THREE.Color(0xff9e6d);
    const bottom = new THREE.Color(0xffe3b0);
    const skyColors = [];
    for (let i = 0; i < posAttr.count; i++) {
      const y = posAttr.getY(i);
      const t = THREE.MathUtils.clamp((y / 60 + 0.15) / 1.15, 0, 1);
      const c = bottom.clone().lerp(top, t);
      skyColors.push(c.r, c.g, c.b);
    }
    skyGeo.setAttribute("color", new THREE.Float32BufferAttribute(skyColors, 3));
    const skyMat = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false });
    scene.add(new THREE.Mesh(skyGeo, skyMat));

    const glowTex = makeGlowTexture();
    const sun = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })
    );
    sun.scale.set(16, 16, 1);
    sun.position.set(-15, 11, -24);
    scene.add(sun);

    // ---------- Lights ----------
    scene.add(new THREE.HemisphereLight(0xffe3c4, 0x6b8a52, 0.9));
    const sunLight = new THREE.DirectionalLight(0xffd9a0, 1.15);
    sunLight.position.set(-10, 14, 7);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(1536, 1536);
    sunLight.shadow.camera.left = -16;
    sunLight.shadow.camera.right = 16;
    sunLight.shadow.camera.top = 16;
    sunLight.shadow.camera.bottom = -16;
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 50;
    sunLight.shadow.bias = -0.0015;
    scene.add(sunLight);
    const fillLight = new THREE.PointLight(0xfff2d9, 0.35, 12);
    fillLight.position.set(2, 3, 2);
    scene.add(fillLight);

    // ---------- Ground ----------
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(13, 36),
      new THREE.MeshToonMaterial({ color: 0x7fa65c, gradientMap })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const platform = new THREE.Mesh(
      new THREE.CylinderGeometry(5.2, 5.6, 0.4, 8),
      new THREE.MeshToonMaterial({ color: 0xcfc3a8, gradientMap })
    );
    platform.position.y = 0.2;
    platform.receiveShadow = true;
    platform.castShadow = true;
    scene.add(platform);
    addOutline(platform, 0.02);

    // ---------- Building ----------
    const WALL_W = 4.6;
    const WALL_H = 2.8;
    const WALL_D = 3.8;
    const WALL_T = 0.12;
    const halfW = WALL_W / 2;
    const halfD = WALL_D / 2;

    const building = new THREE.Group();
    building.position.y = 0.4;
    scene.add(building);

    // floor + rug (revealed once walls are hidden, but always present)
    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(WALL_W - 0.1, 0.08, WALL_D - 0.1),
      new THREE.MeshToonMaterial({ color: 0xd9c39c, gradientMap })
    );
    floor.position.y = 0.04;
    floor.receiveShadow = true;
    building.add(floor);

    const rug = new THREE.Mesh(
      new THREE.CircleGeometry(0.95, 24),
      new THREE.MeshToonMaterial({ color: 0xd2828f, gradientMap })
    );
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(-0.2, 0.09, 0.1);
    rug.receiveShadow = true;
    building.add(rug);

    const wallMat = new THREE.MeshToonMaterial({ color: 0xf1e6cf, gradientMap });
    const beamMat = new THREE.MeshToonMaterial({ color: 0x6b4226, gradientMap });
    const roofMat = new THREE.MeshToonMaterial({ color: 0x2f4d4a, gradientMap });
    const windowMat = new THREE.MeshBasicMaterial({ color: 0xffd98a });

    // back + left walls (always visible backdrop)
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(WALL_W, WALL_H, WALL_T), wallMat);
    backWall.position.set(0, WALL_H / 2, -halfD);
    backWall.castShadow = true;
    backWall.receiveShadow = true;
    building.add(backWall);
    addOutline(backWall, 0.02);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(WALL_T, WALL_H, WALL_D), wallMat);
    leftWall.position.set(-halfW, WALL_H / 2, 0);
    leftWall.castShadow = true;
    leftWall.receiveShadow = true;
    building.add(leftWall);
    addOutline(leftWall, 0.02);

    // corner beams
    const beamGeo = new THREE.BoxGeometry(0.16, WALL_H, 0.16);
    [
      [halfW - 0.08, halfD - 0.08],
      [-(halfW - 0.08), halfD - 0.08],
      [halfW - 0.08, -(halfD - 0.08)],
      [-(halfW - 0.08), -(halfD - 0.08)],
    ].forEach(([x, z]) => {
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.set(x, WALL_H / 2, z);
      beam.castShadow = true;
      building.add(beam);
      addOutline(beam, 0.05);
    });

    // roof (toggles with cutaway)
    const roofGroup = new THREE.Group();
    const roofGeo = new THREE.ConeGeometry(2.6, 1.9, 4);
    roofGeo.rotateY(Math.PI / 4);
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.scale.set(1.44, 1, 1.22);
    roof.position.y = WALL_H + 0.95;
    roof.castShadow = true;
    roofGroup.add(roof);
    addOutline(roof, 0.03);

    const capGeo = new THREE.ConeGeometry(0.4, 0.55, 4);
    capGeo.rotateY(Math.PI / 4);
    const cap = new THREE.Mesh(capGeo, roofMat);
    cap.position.y = 4.9;
    roofGroup.add(cap);
    addOutline(cap, 0.05);
    building.add(roofGroup);

    // front wall + facade decor (toggles with cutaway)
    const frontGroup = new THREE.Group();

    const frontWall = new THREE.Mesh(new THREE.BoxGeometry(WALL_W, WALL_H, WALL_T), wallMat);
    frontWall.position.set(0, WALL_H / 2, halfD);
    frontWall.castShadow = true;
    frontWall.receiveShadow = true;
    frontGroup.add(frontWall);
    addOutline(frontWall, 0.02);

    const awningGeo = new THREE.ConeGeometry(1.6, 0.9, 4);
    awningGeo.rotateY(Math.PI / 4);
    const awning = new THREE.Mesh(awningGeo, roofMat);
    awning.scale.set(1, 0.7, 0.5);
    awning.position.set(0, 2.73, halfD + 0.35);
    awning.castShadow = true;
    frontGroup.add(awning);
    addOutline(awning, 0.03);

    const door = new THREE.Mesh(
      new THREE.BoxGeometry(1.05, 1.82, 0.14),
      new THREE.MeshToonMaterial({ color: 0x4a2f22, gradientMap })
    );
    door.position.set(0, 0.91, halfD + 0.03);
    frontGroup.add(door);
    addOutline(door, 0.03);

    [[-1.5, 1.6, halfD + 0.03], [1.5, 1.6, halfD + 0.03]].forEach(([x, y, z]) => {
      const win = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.75, 0.1), windowMat);
      win.position.set(x, y, z);
      frontGroup.add(win);
      const glow = new THREE.PointLight(0xffb35c, 0.6, 3);
      glow.position.set(x, y, z);
      frontGroup.add(glow);
    });

    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(1.25, 0.5, 0.08),
      new THREE.MeshToonMaterial({ color: 0x8b4a3c, gradientMap })
    );
    sign.position.set(0, 2.45, halfD + 0.42);
    frontGroup.add(sign);
    addOutline(sign, 0.05);

    const lanternCapMat = new THREE.MeshToonMaterial({ color: 0x3a2a1c, gradientMap });
    const lanternBodyMat = new THREE.MeshToonMaterial({ color: 0xff9d4d, gradientMap, emissive: 0x943c00 });
    const lanterns = [];
    [-1.2, 1.2].forEach((x) => {
      const g = new THREE.Group();
      const string = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.4, 6), lanternCapMat);
      string.position.y = 0.24;
      g.add(string);
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.19, 8, 8), lanternBodyMat);
      g.add(body);
      addOutline(body, 0.06);
      const capTop = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.12, 0.07, 8), lanternCapMat);
      capTop.position.y = 0.19;
      g.add(capTop);
      const light = new THREE.PointLight(0xff9d4d, 0.9, 3.4);
      g.add(light);
      g.position.set(x, 2.15, halfD + 0.45);
      frontGroup.add(g);
      lanterns.push({ light, phase: Math.random() * Math.PI * 2 });
    });
    building.add(frontGroup);

    // right wall + its windows (toggles with cutaway)
    const rightGroup = new THREE.Group();
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(WALL_T, WALL_H, WALL_D), wallMat);
    rightWall.position.set(halfW, WALL_H / 2, 0);
    rightWall.castShadow = true;
    rightWall.receiveShadow = true;
    rightGroup.add(rightWall);
    addOutline(rightWall, 0.02);

    [[halfW + 0.03, 1.6, 0.9], [halfW + 0.03, 1.6, -0.9]].forEach(([x, y, z]) => {
      const win = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.75, 0.75), windowMat);
      win.position.set(x, y, z);
      rightGroup.add(win);
      const glow = new THREE.PointLight(0xffb35c, 0.55, 3);
      glow.position.set(x, y, z);
      rightGroup.add(glow);
    });
    building.add(rightGroup);

    cutawayRef.current.groups = [frontGroup, rightGroup, roofGroup];

    // ---------- Furniture ----------
    const woodMat = new THREE.MeshToonMaterial({ color: 0x8a5f3c, gradientMap });
    const cushionMatA = new THREE.MeshToonMaterial({ color: 0x4f8a86, gradientMap });
    const cushionMatB = new THREE.MeshToonMaterial({ color: 0xe3a8b4, gradientMap });
    const linenMat = new THREE.MeshToonMaterial({ color: 0xf3ecd9, gradientMap });

    // low table (chabudai) + cushions, sitting on the rug
    const table = new THREE.Group();
    const tableTop = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.58, 0.07, 16), woodMat);
    tableTop.position.y = 0.42;
    tableTop.castShadow = true;
    table.add(tableTop);
    addOutline(tableTop, 0.03);
    for (let i = 0; i < 4; i++) {
      const ang = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.4, 8), woodMat);
      leg.position.set(Math.cos(ang) * 0.4, 0.2, Math.sin(ang) * 0.4);
      leg.castShadow = true;
      table.add(leg);
    }
    table.position.set(-0.2, 0, 0.1);
    building.add(table);

    [
      [0.55, cushionMatA],
      [-0.55, cushionMatB],
    ].forEach(([offset, mat]) => {
      const cushion = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.09, 0.42), mat);
      cushion.position.set(-0.2 + offset * 0.7, 0.13, 0.1 + (offset > 0 ? 0.55 : -0.55));
      cushion.castShadow = true;
      building.add(cushion);
    });

    // futon bed along the back-left corner
    const mattress = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.16, 2.0), linenMat);
    mattress.position.set(-(halfW - 0.85), 0.12, -(halfD - 1.15));
    mattress.castShadow = true;
    mattress.receiveShadow = true;
    building.add(mattress);
    addOutline(mattress, 0.02);

    const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.14, 0.35), new THREE.MeshToonMaterial({ color: 0xffffff, gradientMap }));
    pillow.position.set(-(halfW - 0.85), 0.28, -(halfD - 0.35));
    pillow.rotation.z = 0.05;
    pillow.castShadow = true;
    building.add(pillow);

    const blanket = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.1, 0.7), cushionMatA);
    blanket.position.set(-(halfW - 0.85), 0.26, -(halfD - 1.85));
    blanket.castShadow = true;
    building.add(blanket);

    // shelf along the right wall with small decor
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.32, 1.5, 1.5), woodMat);
    shelf.position.set(halfW - 0.2, 0.75, -0.9);
    shelf.castShadow = true;
    shelf.receiveShadow = true;
    building.add(shelf);
    addOutline(shelf, 0.02);

    [
      [0.35, cushionMatB],
      [0, cushionMatA],
      [-0.35, woodMat],
    ].forEach(([offset, mat]) => {
      const item = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.22, 0.16), mat);
      item.position.set(halfW - 0.34, 1.35, -0.9 + offset);
      item.castShadow = true;
      building.add(item);
    });

    // standing paper lamp near the shelf
    const lampPole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.1, 8), beamMat);
    lampPole.position.set(halfW - 0.7, 0.55, 0.4);
    lampPole.castShadow = true;
    building.add(lampPole);
    const lampShade = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.3, 10), lanternBodyMat);
    lampShade.position.set(halfW - 0.7, 1.25, 0.4);
    lampShade.castShadow = true;
    building.add(lampShade);
    addOutline(lampShade, 0.05);
    const lampLight = new THREE.PointLight(0xffb35c, 0.7, 3);
    lampLight.position.set(halfW - 0.7, 1.2, 0.4);
    building.add(lampLight);
    lanterns.push({ light: lampLight, phase: Math.random() * Math.PI * 2 });

    // potted plant by the front window
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.13, 0.22, 8), woodMat);
    pot.position.set(1.6, 0.15, halfD - 0.5);
    pot.castShadow = true;
    building.add(pot);
    const leafMat = new THREE.MeshToonMaterial({ color: 0x6f9a4f, gradientMap });
    [[0, 0.4, 0, 0.22], [0.1, 0.55, 0.05, 0.16], [-0.1, 0.5, -0.08, 0.18]].forEach(([x, y, z, s]) => {
      const leaf = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0), leafMat);
      leaf.position.set(1.6 + x, y, halfD - 0.5 + z);
      leaf.scale.setScalar(s);
      leaf.castShadow = true;
      building.add(leaf);
    });

    // ---------- Cherry blossom tree ----------
    const tree = new THREE.Group();
    tree.position.set(-6.2, 0, -2.3);
    scene.add(tree);

    const trunkMat = new THREE.MeshToonMaterial({ color: 0x5a3d2b, gradientMap });
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.28, 2.8, 7), trunkMat);
    trunk.position.y = 1.4;
    trunk.castShadow = true;
    tree.add(trunk);
    addOutline(trunk, 0.04);

    const branchGeo = new THREE.CylinderGeometry(0.06, 0.12, 1.1, 6);
    [[0.45, 2.4, 0, 0.6], [-0.4, 2.6, 0.25, -0.5]].forEach(([x, y, z, rot]) => {
      const branch = new THREE.Mesh(branchGeo, trunkMat);
      branch.position.set(x, y, z);
      branch.rotation.z = rot;
      branch.castShadow = true;
      tree.add(branch);
    });

    const blossomMat = new THREE.MeshToonMaterial({ color: 0xf7b8cd, gradientMap });
    [
      [0, 3.15, 0, 0.95], [0.7, 2.9, 0.4, 0.65], [-0.65, 2.95, -0.25, 0.7],
      [0.25, 3.5, -0.4, 0.55], [-0.45, 3.4, 0.45, 0.5], [0.8, 3.35, -0.15, 0.45],
    ].forEach(([x, y, z, scale]) => {
      const blossom = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0), blossomMat);
      blossom.position.set(x, y, z);
      blossom.scale.setScalar(scale);
      blossom.castShadow = true;
      tree.add(blossom);
      addOutline(blossom, 0.05);
    });

    // ---------- Falling petals ----------
    const petalCount = 55;
    const petals = new THREE.InstancedMesh(
      new THREE.PlaneGeometry(0.1, 0.1),
      new THREE.MeshBasicMaterial({ color: 0xffc9dc, side: THREE.DoubleSide, transparent: true, opacity: 0.9 }),
      petalCount
    );
    petals.frustumCulled = false;
    scene.add(petals);
    const petalData = new Array(petalCount).fill(0).map(() => ({
      x: (Math.random() - 0.5) * 13,
      z: (Math.random() - 0.5) * 13,
      y: Math.random() * 7 + 0.5,
      speed: 0.25 + Math.random() * 0.35,
      swayPhase: Math.random() * Math.PI * 2,
      swaySpeed: 0.6 + Math.random() * 0.5,
      spin: (Math.random() - 0.5) * 2,
    }));
    const dummy = new THREE.Object3D();

    // ---------- Fireflies ----------
    const fireflies = [];
    for (let i = 0; i < 7; i++) {
      const f = new THREE.Mesh(
        new THREE.SphereGeometry(0.04, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0xd9ff9c, transparent: true })
      );
      f.userData = {
        angle: Math.random() * Math.PI * 2,
        radius: 2.8 + Math.random() * 3,
        ySpeed: 0.3 + Math.random() * 0.4,
        yPhase: Math.random() * Math.PI * 2,
        baseY: 0.5 + Math.random() * 1.4,
      };
      scene.add(f);
      fireflies.push(f);
    }

    // ---------- Camera rig ----------
    const target = new THREE.Vector3(0, 1.7, 0);
    let radius = 13;
    let theta = Math.PI / 4;
    let phi = 1.12;
    let autoRotate = true;
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;
    let idleTimer = null;

    function updateCameraPosition() {
      const sinPhi = Math.sin(phi);
      camera.position.x = target.x + radius * sinPhi * Math.sin(theta);
      camera.position.y = target.y + radius * Math.cos(phi);
      camera.position.z = target.z + radius * sinPhi * Math.cos(theta);
      camera.lookAt(target);
    }
    updateCameraPosition();

    function onPointerDown(e) {
      isDragging = true;
      autoRotate = false;
      lastX = e.clientX;
      lastY = e.clientY;
      clearTimeout(idleTimer);
      renderer.domElement.style.cursor = "grabbing";
    }
    function onPointerMove(e) {
      if (!isDragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      theta -= dx * 0.006;
      phi = THREE.MathUtils.clamp(phi - dy * 0.006, 0.45, 1.5);
      updateCameraPosition();
    }
    function onPointerUp() {
      isDragging = false;
      renderer.domElement.style.cursor = "grab";
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        autoRotate = true;
      }, 2200);
    }
    function onWheel(e) {
      e.preventDefault();
      radius = THREE.MathUtils.clamp(radius + e.deltaY * 0.007, 7, 22);
      updateCameraPosition();
    }
    renderer.domElement.style.touchAction = "none";
    renderer.domElement.style.cursor = "grab";
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    renderer.domElement.addEventListener("wheel", onWheel, { passive: false });

    // ---------- Resize ----------
    function handleResize() {
      width = mount.clientWidth;
      height = mount.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(mount);

    // ---------- Animation loop ----------
    const clock = new THREE.Clock();
    let frameId;
    function animate() {
      frameId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;

      if (autoRotate) {
        theta += dt * 0.1;
        updateCameraPosition();
      }

      lanterns.forEach((l) => {
        l.light.intensity = (l.light.intensity > 0.8 ? 0.75 : 0.6) + Math.sin(t * 3 + l.phase) * 0.15;
      });

      for (let i = 0; i < petalCount; i++) {
        const p = petalData[i];
        p.y -= p.speed * dt;
        if (p.y < 0) {
          p.y = 7 + Math.random() * 1.5;
          p.x = (Math.random() - 0.5) * 13;
          p.z = (Math.random() - 0.5) * 13;
        }
        const sway = Math.sin(t * p.swaySpeed + p.swayPhase) * 0.5;
        dummy.position.set(p.x + sway, p.y, p.z);
        dummy.rotation.set(t * p.spin, t * p.spin * 0.7, t * 0.5);
        dummy.updateMatrix();
        petals.setMatrixAt(i, dummy.matrix);
      }
      petals.instanceMatrix.needsUpdate = true;

      fireflies.forEach((f) => {
        const d = f.userData;
        d.angle += dt * 0.3;
        f.position.set(
          Math.cos(d.angle) * d.radius - 2,
          d.baseY + Math.sin(t * d.ySpeed + d.yPhase) * 0.3,
          Math.sin(d.angle) * d.radius - 1
        );
        f.material.opacity = 0.6 + Math.sin(t * 2 + d.yPhase) * 0.4;
      });

      renderer.render(scene, camera);
    }
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(idleTimer);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("wheel", onWheel);
      mount.removeChild(renderer.domElement);
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
      renderer.dispose();
    };
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: "640px",
        background: "#1a1410",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <div ref={mountRef} style={{ width: "100%", height: "100%" }} />

      <button
        onClick={toggleWalls}
        style={{
          position: "absolute",
          top: 14,
          right: 14,
          padding: "9px 16px",
          borderRadius: 999,
          border: "1px solid rgba(255,233,201,0.35)",
          background: wallsHidden ? "rgba(255,157,77,0.92)" : "rgba(26,20,16,0.55)",
          color: "#fff3e0",
          fontFamily: "Georgia, serif",
          fontSize: 13,
          letterSpacing: "0.02em",
          cursor: "pointer",
          backdropFilter: "blur(4px)",
          transition: "background 0.2s ease",
        }}
      >
        {wallsHidden ? "Show walls" : "Hide walls"}
      </button>

      <div
        style={{
          position: "absolute",
          bottom: 10,
          left: 0,
          right: 0,
          textAlign: "center",
          color: "#ffe9c9",
          fontFamily: "Georgia, serif",
          fontSize: 12,
          letterSpacing: "0.03em",
          opacity: 0.75,
          pointerEvents: "none",
        }}
      >
        drag to look around · scroll to zoom
      </div>
    </div>
  );
}