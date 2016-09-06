$(document).ready(function () {
  var container, camera, controls, scene, sceneEdge, renderer, mesh, meshEdge, globalLight, ambientLight;
  var shadermaterial, facematerial;
  var WIDTH = $('#canvas').width();
  var HEIGHT = $('#canvas').height();

  function createScene(geometry, materials) {
    shadermaterial = new THREE.ShaderMaterial({
      fragmentShader: document.getElementById('fs').innerHTML,
      vertexShader: document.getElementById('vs').innerHTML,
      uniforms: {
        edgeColor: {
          type: 'v4',
          value: new THREE.Vector4(0, 0, 0, 0)
        },
        edge: {
          type: 'i',
          value: true
        },
        lightDirection: {
          type: 'v3',
          value: globalLight.position
        },
        texture: {
          type: 't',
          value: new THREE.TextureLoader('texture/toon.png')
        }
      }
    });
    shadermaterial.morphTargets = true;
    if (materials) {
      for (var i = 0, l = materials.length; i < l; i++) {
        materials[i].morphTargets = true;
      }
      facematerial = new THREE.MeshFaceMaterial(materials);
    }
    mesh = new THREE.SkinnedMesh(geometry, facematerial);
    mesh.scale.set(1, 1, 1);
    mesh.position.set(0, 0, 0);
    meshEdge = new THREE.SkinnedMesh(geometry, shadermaterial);
    scene.add(mesh);
    sceneEdge.add(meshEdge);
  }

  function init() {
    camera = new THREE.PerspectiveCamera(55, WIDTH / HEIGHT, 0.1, 1000);
    camera.position.set(0, 0, 10);
    controls = new THREE.OrbitControls(camera); 
    scene = new THREE.Scene();
    sceneEdge = new THREE.Scene();
    ambientLight = new THREE.AmbientLight('white');
    scene.add(ambientLight);
    sceneEdge.add(ambientLight);
    globalLight = new THREE.DirectionalLight('white');
    globalLight.position.set(1, 0, 0).normalize();
    var loader = new THREE.JSONLoader(true);
    loader.load('mesh/sheep.js', createScene);
    renderer = new THREE.WebGLRenderer({
      antialias: true
    });
    renderer.sortObjects = false;
    scene.add(globalLight);
    renderer.setSize(WIDTH, HEIGHT);
    renderer.setClearColor('lightgray', 1);
    var canvas = document.getElementById('canvas');
    canvas.appendChild(renderer.domElement);
  }

  function render() {
    if (mesh) {
      mesh.material.side = THREE.FrontSide;
//      mesh.material.uniforms.edgeColor.value = new THREE.Vector4(0, 0, 0, 0);
//      mesh.material.uniforms.edge.value = false;
    }
    renderer.render(scene, camera);
    if (mesh) {
      mesh.material.side = THREE.BackSide;
      meshEdge.material.uniforms.edgeColor.value = new THREE.Vector4(0, 0, 0, 1);
      meshEdge.material.uniforms.edge.value = true;
    }
//    renderer.render(sceneEdge, camera);
    requestAnimationFrame(render);
  }
  init();
  render();
});
