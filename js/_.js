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
    mesh = new THREE.SkinnedMesh(geometry, shadermaterial);
    mesh.scale.set(1, 1, 1);
    mesh.position.set(0, 0, 0);
    meshEdge = mesh.clone();
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
    globalLight = new THREE.DirectionalLight('white');
    scene.add(globalLight);
    sceneEdge.add(ambientLight);
    globalLight.position.set(1, 0, 0).normalize();
    var loader = new THREE.JSONLoader(true);
    loader.load('mesh/sheep.js', createScene);
    renderer = new THREE.WebGLRenderer({
      antialias: true
    });
    renderer.setSize(WIDTH, HEIGHT);
    renderer.setClearColor('white', 1);
    renderer.setClearColor('lightgray', 1);
    renderer.sortObjects = false;
    renderer.autoClear = false;
    var canvas = document.getElementById('canvas');
    canvas.appendChild(renderer.domElement);
  }

  function render() {
    renderer.clear();
    if (meshEdge) {
      meshEdge.material.side = THREE.BackSide;
      meshEdge.material.uniforms.edgeColor.value = new THREE.Vector4(0, 0, 0, 1);
      meshEdge.material.uniforms.edge.value = true;
    }
    renderer.render(sceneEdge, camera);
    if (mesh) {
      meshEdge.material.side = THREE.FrontSide;
      mesh.material.uniforms.edgeColor.value = new THREE.Vector4(0, 0, 0, 0);
      mesh.material.uniforms.edge.value = false;
    }
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
  init();
  render();
});





