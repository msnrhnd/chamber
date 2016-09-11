$(document).ready(function () {
  var container, camera, controls, scene, faceScene, mesh, faceMesh, globalLight, ambientLight, renderer;
  var edgeMaterial, faceMaterial;
  var ANGLE = 55;
  var WIDTH = $(window).width();
  var HEIGHT = $(window).height();
  $('#canvas').css({
    width: WIDTH,
    height: HEIGHT
  });

  function createScene(geometry, materials) {
    geometry.computeBoundingBox();
    var box = geometry.boundingBox;
    var h = box.max.z - box.min.z;
    var w = box.max.x - box.min.x;
    var d = box.max.y - box.min.y;
    var xmax = h / 2 / Math.tan(ANGLE / 2);
    camera = new THREE.PerspectiveCamera(ANGLE, WIDTH / HEIGHT, 0.1, xmax);
    camera.position.set(-xmax, 0, 0);
    controls = new THREE.OrbitControls(camera);
    edgeMaterial = new THREE.ShaderMaterial({
      fragmentShader: document.getElementById('fs').innerHTML,
      vertexShader: document.getElementById('vs').innerHTML,
      uniforms: {
        tickness: {
          type: 'f',
          value: Math.pow(w * h * d, 1 / 3) / 100
        },
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
