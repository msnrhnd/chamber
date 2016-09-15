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
    var o = geometry.boundingSphere.center;
    var r = geometry.boundingSphere.radius;
    camera = new THREE.OrthographicCamera(-r, r, r, -r, -r * 2, r * 2);
    camera.position.set(.1, 0, 0);
    controls = new THREE.OrbitControls(camera, $wrapper[0]);
    controls.maxPolarAngle = Math.PI;
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
    mesh.position.set(-o.x, -o.y, -o.z);
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
    scene.add(ambientLight);
    faceScene.add(ambientLight);
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(WIDTH, HEIGHT);
    renderer.setClearColor('lightgray', 1);
    renderer.autoClear = false;
    //    load('mesh/sheep.js');
    load('mesh/spiral.js');
    //    load('mesh/weared_human.js');
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
    console.log(filename)
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
  $('#refresh').click(function () {
    $('canvas').remove();
    init();
    render();
  });
});
