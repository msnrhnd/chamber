$(document).ready(function () {
  var container, camera, controls, scene, faceScene, mesh, faceMesh, globalLight, ambientLight, renderer;
  var edgeMaterial, faceMaterial, rt;
  var ANGLE = 55;
  var HEIGHT = $(window).height();
  var WIDTH = HEIGHT;
  $('#canvas').css({
    width: WIDTH,
    height: HEIGHT,
    left: ($(window).width() - WIDTH) / 2
  });
  var canvas = document.getElementById('canvas');
  
  function createScene(geometry, materials) {
    geometry.computeBoundingSphere();
    var r = geometry.boundingSphere.radius;
    var xmin = r / Math.tan(THREE.Math.degToRad(ANGLE) / 2);
    camera = new THREE.PerspectiveCamera(ANGLE, WIDTH / HEIGHT, r / 10, r * 10);
    camera.position.set(xmin, 0, 0);
    controls = new THREE.OrbitControls(camera, canvas);
    edgeMaterial = new THREE.ShaderMaterial({
      fragmentShader: document.getElementById('fs').innerHTML,
      vertexShader: document.getElementById('vs').innerHTML,
      uniforms: {
        tickness: {
          type: 'f',
          value: r / 100
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
    rt = renderer.devicePixelRatio;
    renderer.setSize(WIDTH, HEIGHT);
    renderer.setClearColor('lightgray', 1);
    renderer.autoClear = false;
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
