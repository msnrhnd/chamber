$(document).ready(function () {
  var container, camera, controls, scene, faceScene, mesh, faceMesh, globalLight, ambientLight, renderer;
  var edgeMaterial, faceMaterial;
  var WIDTH = $(window).width();
  var HEIGHT = $(window).height();
  $('#canvas').css({width: WIDTH, height: HEIGHT});

  function createScene(geometry, materials) {
    geometry.computeBoundingBox();
    var box = geometry.boundingBox;
    var h = box.max.z - box.min.z;
    var angle = 55;
    var xmax = h / 2 / Math.tan(angle/2);
    camera = new THREE.PerspectiveCamera(angle, WIDTH / HEIGHT, 0.1, xmax);
    camera.position.set(-xmax, 0, 0);
    controls = new THREE.OrbitControls(camera);
    edgeMaterial = new THREE.ShaderMaterial({
      fragmentShader: document.getElementById('fs').innerHTML,
      vertexShader: document.getElementById('vs').innerHTML,
      uniforms: {
        edgeColor: {
          type: 'v4',
          value: new THREE.Vector4(0, 0, 0, 1)
        }
      }
    });
    edgeMaterial.morphTargets = true;
    faceMaterial = new THREE.MultiMaterial(materials);
    mesh = new THREE.Mesh(geometry, edgeMaterial);
    mesh.position.set(0, 0, 0);
    mesh.scale.set(1, 1, 1);
    scene.add(mesh);
    faceMesh = mesh.clone();
    faceMesh.material = faceMaterial;
    faceScene.add(faceMesh);
  }

  function init() {
    ambientLight = new THREE.AmbientLight('white');
    scene = new THREE.Scene();
    faceScene = new THREE.Scene();
    faceScene.add(ambientLight);
    scene.add(ambientLight);
    var loader = new THREE.JSONLoader(true);
    loader.load('mesh/sheep.js', createScene);
    renderer = new THREE.WebGLRenderer({
      antialias: true
    });
    renderer.setSize(WIDTH, HEIGHT);
    renderer.setClearColor('lightgray', 1);
    renderer.autoClear = false;
    var canvas = document.getElementById('canvas');
    canvas.appendChild(renderer.domElement);
  }

  function render() {
    renderer.clear();
    if (mesh) {
      mesh.material.side = THREE.BackSide;
      renderer.render(scene, camera);
    }
    if (faceMesh) {
      faceMesh.material.side = THREE.FrontSide;
      renderer.render(faceScene, camera);
    }
    requestAnimationFrame(render);
  }
  init();
  render();
});

