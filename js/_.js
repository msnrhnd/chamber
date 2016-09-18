$(document).ready(function () {
  var camera, controls, scene, mesh, faceMesh, renderer, thickness;
  var edgeMaterial, faceMaterial;
  var EPS = 0.000001;
  var MESH_DIR = 'mesh';
  var side;
  var $wrapper = $('#wrapper');
  var $finder = $('#finder');

  function setCSS() {
    var w = $(window).width();
    var h = $(window).height();
    side = Math.min(h, w);
    $wrapper.css({
      width: side,
      height: side,
      left: (w - side) / 2,
      top: (h - side) / 2
    });
  }

  function load(path) {
    if (scene) {
      scene.remove(mesh);
      scene.remove(faceMesh);
    }
    var loader = new THREE.JSONLoader();
    loader.load(path, createScene);
  }

  function createScene(geometry, materials) {
    scene = new THREE.Scene();
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
    var o = geometry.boundingSphere.center;
    var r = geometry.boundingSphere.radius;
    thickness = r / 100
    edgeMaterial = new THREE.ShaderMaterial({
      fragmentShader: document.getElementById('fs').innerHTML,
      vertexShader: document.getElementById('vs').innerHTML,
      uniforms: {
        thickness: {
          type: 'f',
          value: thickness
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
    scene.add(faceMesh);
    setCamera(r);
  }

  function setCamera(r) {
    camera = new THREE.OrthographicCamera(-r, r, r, -r, -r * 2, r * 2);
    camera.position.set(EPS, 0, 0);
    controls = new THREE.OrbitControls(camera, $wrapper[0]);
  }

  function setRenderer() {
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(side, side);
    renderer.setClearColor('lightgray', 1);
    renderer.autoClear = false;
    $wrapper[0].appendChild(renderer.domElement);
  }
  
  function render() {
    renderer.clear();
    if (mesh) {
      mesh.material.side = THREE.BackSide;
      mesh.material.uniforms.thickness.value = thickness / Math.pow(camera.zoom, 1/2);
      renderer.render(scene, camera);
    }
    if (faceMesh) {
      faceMesh.material.side = THREE.FrontSide;
      renderer.render(scene, camera);
    }
    requestAnimationFrame(render);
  }

  $(document).on('click', '.load', function(e) {
    $finder.fadeOut();
    $('#open-folder').fadeIn();
    var path = $(e.target).attr('path');
    load(path);
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

  $('#open-folder').click(function(e) {
    $('#open-folder').hide();
    $finder.fadeIn();
  });

  (function () {
    var fd = new FormData();
    fd.append('action', 'init');
    fd.append('mesh_dir', MESH_DIR);
    $.ajax('htbin/_.cgi', {
      type: 'post',
      processData: false,
      contentType: false,
      data: fd,
      dataType: 'json',
      timeout: 12000,
      success: function (tree) {
        tree.state = {'opened': true};
        $finder.on('click', '.jstree-anchor', function (e) {
          $(this).jstree(true).toggle_node(e.target);
        }).jstree({'core': {'data': tree}});
      },
      error: function (e) {
        console.log(e);
      }
    });
  })();

  $(window).resize(function () {
    setCSS();
    renderer.setSize(side, side);
    renderer.setPixelRatio(window.devicePixelRatio);
    if (camera) {
      camera.aspect = 1;
      camera.updateProjectionMatrix();
    }
  });
  $finder.hide();
  setCSS();
  setRenderer();
  load(MESH_DIR + '/基礎生物/DNA.js');
  render();
});
