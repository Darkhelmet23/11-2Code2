import {
  Mesh,
  MeshStandardMaterial,
  SphereGeometry,
  SessionMode,
  World,
  PlaneGeometry,
  AssetManager,
  AssetType,
} from "@iwsdk/core";

import { Interactable, PanelUI, ScreenSpace, OneHandGrabbable } from "@iwsdk/core";
import { TextureLoader, RepeatWrapping, CanvasTexture, MeshBasicMaterial } from "three";
import { LocomotionEnvironment, EnvironmentType } from "@iwsdk/core";
import { PanelSystem } from "./panel.js";


const assets = {
  tree: {
    url: "/gltf/plantSansevieria/tree.glb",
    type: AssetType.GLTF,
    priority: "critical",
  },
  treasure: {
    url: "/gltf/plantSansevieria/treasure.glb",
    type: AssetType.GLTF,
    priority: "critical",
  },
    treasure2: {
    url: "/gltf/plantSansevieria/treasure2.glb",
    type: AssetType.GLTF,
    priority: "critical",
  },
    treasure3: {
    url: "/gltf/plantSansevieria/treasure3.glb",
    type: AssetType.GLTF,
    priority: "critical",
  },
};

World.create(document.getElementById("scene-container"), {
  assets,
  xr: {
    sessionMode: SessionMode.ImmersiveVR,
    offer: "always",
    features: {},
  },
  features: {
    locomotion: true,
  },
}).then((world) => {
  const { camera } = world;

  // === Floor ===
  const floorTexture = new TextureLoader().load("/textures/floor.jpg");
  floorTexture.wrapS = floorTexture.wrapT = RepeatWrapping;
  floorTexture.repeat.set(4, 6);
  const floorMaterial = new MeshStandardMaterial({ map: floorTexture });
  const floorGeometry = new PlaneGeometry(100, 100);
  const floorMesh = new Mesh(floorGeometry, floorMaterial);
  floorMesh.rotation.x = -Math.PI / 2;
  const floorEntity = world.createTransformEntity(floorMesh);
  floorEntity.addComponent(LocomotionEnvironment, {
    type: EnvironmentType.STATIC,
  });
  let score = 0;
  const totalTreasures = 3;
  const treasure1 = AssetManager.getGLTF("treasure").scene;
  treasure1.position.set(12, 1, 2);
  treasure1.scale.set(0.02, 0.02, 0.02);
  const treasure1Entity = world.createTransformEntity(treasure1);
  treasure1Entity.addComponent(Interactable);
  treasure1Entity.object3D.addEventListener("pointerdown", () => {
    treasure1Entity.destroy();
    score++;
    showTemporaryMessage('Nice shot', 3000);
  });
  const treasure2 = AssetManager.getGLTF("treasure2").scene;
  treasure2.position.set(2, 1, 14);
  treasure2.scale.set(0.02, 0.02, 0.02);
  const treasure2Entity = world.createTransformEntity(treasure2);
  treasure2Entity.addComponent(Interactable);
  treasure2Entity.object3D.addEventListener("pointerdown", () => {
    treasure2Entity.destroy();
    score++;
    showTemporaryMessage('Nice shot', 3000);
  });
  const treasure3 = AssetManager.getGLTF("treasure3").scene;
  treasure3.position.set(3, 1, -20);
  treasure3.scale.set(0.02, 0.02, 0.02);
  const treasure3Entity = world.createTransformEntity(treasure3);
  treasure3Entity.addComponent(Interactable);
  treasure3Entity.object3D.addEventListener("pointerdown", () => {
    treasure3Entity.destroy();
    score++;
    showTemporaryMessage('Nice shot', 3000);
  });

  // === TREES ===
  const baseTree = AssetManager.getGLTF("tree").scene;
  const treeCount = 240;
  const treeLayout = [];

  for (let i = 0; i < treeCount; i++) {
    const scale = Math.round((0.01 + Math.random() * 0.09) * 100) / 100;
    const x = Math.round((Math.random() - 0.5) * 100 * 10) / 10;
    const z = Math.round((Math.random() - 0.5) * 100 * 10) / 10;
    const rotationY = Math.round(Math.random() * Math.PI * 2 * 100) / 100;
    treeLayout.push({ x, z, scale, rotationY });
  }
  for (const tree of treeLayout) {
    const treeClone = baseTree.clone(true);
    treeClone.scale.set(tree.scale, tree.scale, tree.scale);
    treeClone.position.set(tree.x, 0, tree.z);
    treeClone.rotation.y = tree.rotationY;
    world.createTransformEntity(treeClone);
  }
   var messageBoard; // { canvas, ctx, texture, entity } — hoisted
  function showMessage(message) {
    const { ctx, canvas, texture, entity } = initMessageBoard();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 120px sans-serif';
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 8;
    ctx.fillStyle = '#111010ff';
    ctx.strokeText(String(message), canvas.width / 2, canvas.height / 2);
    ctx.fillText(String(message), canvas.width / 2, canvas.height / 2);
    texture.needsUpdate = true;
    entity.object3D.visible = true;
  }
  function hideMessage() {
    if (!messageBoard) return;
    const { ctx, canvas, texture, entity } = messageBoard;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    texture.needsUpdate = true;
    entity.object3D.visible = false;
  }
  function showTemporaryMessage(message, duration = 2000) {
    showMessage(message);
    setTimeout(hideMessage, duration);
  }
  function initMessageBoard() {
    if (messageBoard) return messageBoard;
    const canvas = document.createElement('canvas');
    canvas.width = 2000;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const texture = new CanvasTexture(canvas);
    const aspect = canvas.width / canvas.height;
    const boardWidth = 3;
    const boardHeight = boardWidth / aspect;
    const boardMat = new MeshBasicMaterial({ map: texture, transparent: true, depthTest: false });
    const boardGeo = new PlaneGeometry(boardWidth, boardHeight);
    const boardMesh = new Mesh(boardGeo, boardMat);
    const entity = world.createTransformEntity(boardMesh);
    entity.object3D.position.set(1, 3, -5);
    entity.object3D.visible = false;
    messageBoard = { canvas, ctx, texture, entity };
    return messageBoard;
  }
 

  // === Main Game Loop ===
function gameLoop() {
  requestAnimationFrame(gameLoop);
  if (score >= totalTreasures) {
    showMessage('You found all treasures! 🎉');
  }
  
}
gameLoop();

  // === Quest 1 Panel ===
  world.registerSystem(PanelSystem);
  if (isMetaQuest1()) {
    const panelEntity = world
      .createTransformEntity()
      .addComponent(PanelUI, {
        config: "/ui/welcome.json",
        maxHeight: 0.8,
        maxWidth: 1.6,
      })
      .addComponent(Interactable)
      .addComponent(ScreenSpace, {
        top: "20px",
        left: "20px",
        height: "40%",
      });
    panelEntity.object3D.position.set(0, 1.29, -1.9);
  } else {
    console.log("Panel UI skipped: not running on Meta Quest 1.");
  }

  function isMetaQuest1() {
    try {
      const ua = navigator?.userAgent || "";
      const hasOculus = /Oculus|Quest|Meta Quest/i.test(ua);
      const isQuest2or3 =
        /Quest\s?2|Quest\s?3|Quest2|Quest3|MetaQuest2|Meta Quest 2/i.test(ua);
      return hasOculus && !isQuest2or3;
    } catch {
      return false;
    }
  }
});
