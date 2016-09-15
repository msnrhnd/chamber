$(document).ready(function () {
  var container, camera, controls, scene, faceScene, mesh, faceMesh, globalLight, ambientLight, renderer;
  var edgeMaterial, faceMaterial;
  var ANGLE = 55;
  var $wrapper = $('#wrapper');
  var WIDTH, HEIGHT;

  function drawCanvas() {
    HEIGHT = $(window).height();
    WIDTH = HEIGHT;
    $wrapper.css({
      width: WIDTH,
      height: HEIGHT,
      left: ($(window).width() - WIDTH) / 2
    });
  }
  $(window).resize(function () {
    drawCanvas();
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();
    renderer.setSize(WIDTH, HEIGHT);
    renderer.setPixelRatio(window.devicePixelRatio);
  });

  function createScene(geometry, materials) {
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
    var r = geometry.boundingSphere.radius;
    var xmin = r / Math.tan(THREE.Math.degToRad(ANGLE) / 2);
    camera = new THREE.PerspectiveCamera(ANGLE, WIDTH / HEIGHT, r / 10, r * 10);
    camera.position.set(xmin, r / 2, 0);
    controls = new THREE.OrbitControls(camera, $wrapper[0]);
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
    faceMaterial = new THREE.MeshFaceMaterial(materials);
    mesh = new THREE.Mesh(geometry, edgeMaterial);
    mesh.position.set(0, 0, 0);
    mesh.scale.set(1, 1, 1);
    scene.add(mesh);
    faceMesh = mesh.clone();
    faceMesh.material = faceMaterial;
    faceScene.add(faceMesh);
  }

  function load(path) {
    var loader = new THREE.JSONLoader();
    loader.load(path, createScene);
  }

  function init() {
    ambientLight = new THREE.AmbientLight('white');
    scene = new THREE.Scene();
    faceScene = new THREE.Scene();
    faceScene.add(ambientLight);
    scene.add(ambientLight);
    load('mesh/sheep.json');
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(WIDTH, HEIGHT);
    renderer.setClearColor('lightgray', 1);
    renderer.autoClear = false;
    $wrapper[0].appendChild(renderer.domElement);
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
  drawCanvas();
  init();
  render();
  $('#upload').click(function () {
    $('#file-input').val('');
    $('#file-input').trigger('click');
  });
  $('#file-input').change(function () {
    var filename = $('#file-input').val().split('\\')[2];
  });
  $('#download').click(function () {
    var type = 'image/png';
    var canvas = document.getElementsByTagName('canvas')[0];
    var imgData = canvas.toDataURL(type);
    var bin = atob(imgData.split(',')[1]);
    var buffer = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) {
      buffer[i] = bin.charCodeAt(i);
    }
    var blob = new Blob([buffer.buffer], {
      type: type
    });
    var a = document.createElement('a');
    a.download = 'image.png';
    a.href = window.URL.createObjectURL(blob);
    a.click();
  });
});
