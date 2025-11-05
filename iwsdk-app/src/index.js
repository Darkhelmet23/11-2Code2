import {
  Mesh,
  MeshStandardMaterial,
  SphereGeometry,
  SessionMode,
  World,
  PlaneGeometry,
  AssetManager, 
  AssetType,
} from '@iwsdk/core';

import {
  Interactable,
  PanelUI,
  ScreenSpace
} from '@iwsdk/core';
import { LocomotionEnvironment, EnvironmentType } from '@iwsdk/core';


import { PanelSystem } from './panel.js'; // system for displaying "Enter VR" panel on Quest 1
import { TextureLoader, RepeatWrapping, DirectionalLight } from 'three';
const assets = { 
  myRobot: {
    url: '/gltf/plantSansevieria/car.glb',
    type: AssetType.GLTF,
    priority: 'critical',
  },
  keys: {
    url: '/gltf/plantSansevieria/keys.glb',
    type: AssetType.GLTF,
    priority: 'critical',
  },
  car3: {
    url: '/gltf/plantSansevieria/car3.glb',
    type: AssetType.GLTF,
    priority: 'critical',
  },
    car2: {
    url: '/gltf/plantSansevieria/car2.glb',
    type: AssetType.GLTF,
    priority: 'critical',
  },
    cop: {
    url: '/gltf/plantSansevieria/cop.glb',
    type: AssetType.GLTF,
    priority: 'critical',
  },
};

World.create(document.getElementById('scene-container'), {
  assets,
  xr: {
    sessionMode: SessionMode.ImmersiveVR,
    offer: 'always',
    features: { }
  },

  features: { 
    locomotion: true
  },

}).then((world) => {

  const { camera } = world;

  
  // Create a green sphere
  const sphereGeometry = new SphereGeometry(0.5, 32, 32);
  const greenMaterial = new MeshStandardMaterial({ color: 0x33ff33 });
  const sphere = new Mesh(sphereGeometry, greenMaterial);
  sphere.position.set(2, 2, 2);
  const sphereEntity = world.createTransformEntity(sphere);
  sphereEntity.addComponent(Interactable);      
  sphereEntity.object3D.addEventListener("pointerdown", changeColor);
  function changeColor( ) {
    sphereEntity.destroy();
    } 
 
    
  
  const floorTexture = new TextureLoader().load('/textures/floor.jpg');
  floorTexture.wrapS = floorTexture.wrapT = RepeatWrapping;
  floorTexture.repeat.set(4, 6 );  
  const floorMaterial = new MeshStandardMaterial({ map: floorTexture });
  const floorGeometry = new PlaneGeometry(100, 100);
  const floorMesh = new Mesh(floorGeometry, floorMaterial);
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.position.set(0, 0, 0);
  const floorEntity = world.createTransformEntity(floorMesh);
  
  floorEntity.addComponent(LocomotionEnvironment, { type: EnvironmentType.STATIC });
  const robotModel = AssetManager.getGLTF('myRobot').scene;
  const robotEntity = world.createTransformEntity(robotModel);
  robotModel.scale.set(120, 120, 120);
  robotModel.position.set(-2, 0, -5);
  
  const keysModel = AssetManager.getGLTF('keys').scene;
  keysModel.scale.set(2, 2, 2);
  keysModel.position.set(21, 0, 5);
   // move keys beside the car
  const keysEntity = world.createTransformEntity(keysModel);

  const car3Model = AssetManager.getGLTF('car3').scene;
  car3Model.scale.set(0.8, 0.8, 0.8); // move keys beside the car

  const car2Model = AssetManager.getGLTF('car2').scene;
  car2Model.scale.set(0.01, 0.01, 0.01); // move keys beside the car

  const copModel = AssetManager.getGLTF('cop').scene;
  copModel.scale.set(1, 1, 1); // move keys beside the car
  copModel.rotation.y = Math.PI / 2;

for (let i = 0; i < 4; i++) {
  const clone = car3Model.clone(true);
  clone.position.set((i * 6)+2, 0.8, 5); // spread out
  world.createTransformEntity(clone);
}
for (let i = 0; i < 4; i++) {
  const clone = car2Model.clone(true);
  clone.position.set((i * 6)+5, 0, 5); // spread out
  world.createTransformEntity(clone);
}
for (let i = 0; i < 4; i++) {
  const clone = robotModel.clone(true);
  clone.position.set((-i * 6)-2, 0, -5); // spread out
  world.createTransformEntity(clone);
}
for (let i = 0; i < 4; i++) {
  const clone = copModel.clone(true);
  clone.position.set((-i * 6)-5, 0, -5); // spread out
  world.createTransformEntity(clone);
}
  // vvvvvvvv EVERYTHING BELOW WAS ADDED TO DISPLAY A BUTTON TO ENTER VR FOR QUEST 1 DEVICES vvvvvv
  //          (for some reason IWSDK doesn't show Enter VR button on Quest 1)
  world.registerSystem(PanelSystem);
  
  if (isMetaQuest1()) {
    const panelEntity = world
      .createTransformEntity()
      .addComponent(PanelUI, {
        config: '/ui/welcome.json',
        maxHeight: 0.8,
        maxWidth: 1.6
      })
      .addComponent(Interactable)
      .addComponent(ScreenSpace, {
        top: '20px',
        left: '20px',
        height: '40%'
      });
    panelEntity.object3D.position.set(0, 1.29, -1.9);
  } else {
    // Skip panel on non-Meta-Quest-1 devices
    // Useful for debugging on desktop or newer headsets.
    console.log('Panel UI skipped: not running on Meta Quest 1 (heuristic).');
  }
  function isMetaQuest1() {
    try {
      const ua = (navigator && (navigator.userAgent || '')) || '';
      const hasOculus = /Oculus|Quest|Meta Quest/i.test(ua);
      const isQuest2or3 = /Quest\s?2|Quest\s?3|Quest2|Quest3|MetaQuest2|Meta Quest 2/i.test(ua);
      return hasOculus && !isQuest2or3;
    } catch (e) {
      return false;
    }
  }

});
