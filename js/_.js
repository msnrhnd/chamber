$(document).ready(function () {
  var camera, controls, scene, mesh, edgeMesh, renderer, aLight, dLight, thickness;
  var edgeMaterial, material;
  var EPS = 0.000001;
  var edgeColor_value = new THREE.Vector4(0, 0, 0, 1);
  var MESH_DIR = 'mesh';
  var side;
  var shading = 'phong';
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
    $('.button, #finder').css({
      fontSize: side/16
    });
  }

  function load(path) {
    if (scene) {
      scene.remove(mesh);
      scene.remove(edgeMesh);
      scene.remove(dLight);
      scene.remove(aLight);
    }
    var loader;
    var ext = path.split('.')[1];
    switch (ext) {
    case 'js':
      loader = new THREE.JSONLoader();
      break;
    case 'pdb':
      loader = new THREE.PDBLoader();
      break;
    }
    loader.load(path, createScene);
  }

  function createScene(geometry, materials) {
    scene = new THREE.Scene();
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
    var o = geometry.boundingSphere.center;
    var r = geometry.boundingSphere.radius;
    thickness = r / 100;
    dLight = new THREE.DirectionalLight('white', .8);
    dLight.position.set(r, r, r);
    scene.add(dLight);
    aLight = new THREE.AmbientLight('dimgray');
    scene.add(aLight);
    material = new THREE.MeshFaceMaterial(materials);
    mesh = new THREE.Mesh(geometry, material);
    switch (shading) {
    case 'basic':
      setBasic(material);
      break;
    case 'phong':
      setPhong(material);
      break;
    }
    mesh.position.set(-o.x, -o.y, -o.z);
    scene.add(mesh);
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
          value: edgeColor_value
        }
      }
    });
    edgeMesh = mesh.clone();
    edgeMesh.material = edgeMaterial;
    scene.add(edgeMesh);
    setCamera(r);
  }

  function setCamera(r) {
    camera = new THREE.OrthographicCamera(-r, r, r, -r, -r * 12, r * 12);
    camera.position.set(EPS, 0, 0);
    // var pLight = new THREE.PointLight('white', 50, r);
    // pLight.position.set(r,r,r);
//    camera.add(pLight);
    controls = new THREE.OrbitControls(camera, $wrapper[0]);
  }

  function setRenderer() {
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(side, side);
    renderer.setClearColor('white', .8);
    renderer.autoClear = false;
    $wrapper[0].appendChild(renderer.domElement);
  }

  function render() {
    renderer.clear();
    if (mesh) {
      mesh.material.side = THREE.FrontSide;
      renderer.render(scene, camera);
    }
    if (edgeMesh) {
      edgeMesh.material.side = THREE.BackSide;
      edgeMesh.material.uniforms.edgeColor.value = shading == 'basic' ? edgeColor_value : new THREE.Vector4(1, 1, 1, 0);
      edgeMesh.material.uniforms.thickness.value = shading == 'basic' ? thickness / Math.pow(camera.zoom, 1 / 2) : '0';
      renderer.render(scene, camera);
    }
    requestAnimationFrame(render);
  }

  $(document).on('click', '.load', function (e) {
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

  function setBasic(material) {
    shading = 'basic';
    var materials_length = material.materials.length;
    for (var i = 0; i < materials_length; i++) {
      var c = material.materials[i].color;
      var o = material.materials[i].opacity;
      var isTransparent = o < 1 ? true : false;
      material.materials[i] = new THREE.MeshBasicMaterial({
        color: c,
        opacity: o,
        transparent: isTransparent
      });
    }
  }

  function setPhong(material) {
    shading = 'phong';
    var materials_length = material.materials.length;
    for (var i = 0; i < materials_length; i++) {
      var c = material.materials[i].color;
      var o = material.materials[i].opacity;
      var isTransparent = o < 1 ? true : false;
      material.materials[i] = new THREE.MeshPhongMaterial({
        color: c,
        specular: new THREE.Color('white'),
        emissive: new THREE.Color('black'),
        transparent: isTransparent,
        opacity: o,
        shininess: 10
      });
    }
  }

  $('#shading').click(function () {
    switch (shading) {
    case 'basic':
      setPhong(material);
      shading = 'phong';
      break;
    case 'phong':
      setBasic(material);
      shading = 'basic';
      break;
    }
  });

  $('#open-folder').click(function (e) {
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
        tree.state = {
          'opened': true
        };
        $finder.on('click', '.jstree-anchor', function (e) {
          $(this).jstree(true).toggle_node(e.target);
        }).jstree({
          'core': {
            'data': tree
          }
        });
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
