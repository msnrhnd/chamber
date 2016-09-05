$(document).ready(function () {
  var container, camera, scene, sceneEdge, projector, renderer, mesh, meshEdge, lightCameraVisibility = false,
      globalLight;
  var shadermaterial, facematerial;
  var WIDTH = $('canvas').width();
  var HEIGHT = $('canvas').height();
  
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
          value: THREE.TextureLoader('texture/toon.png')
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
    mesh.position.set(-7.5, 7.5, 7.5);
    meshEdge = mesh.clone();
    scene.add(mesh);
    sceneEdge.add(meshEdge);
  }

  function init() {
    camera = new THREE.PerspectiveCamera(55, WIDTH / HEIGHT, 1, 1000);
    camera.position.set(0, 0, 0);
    scene = new THREE.Scene();
    sceneEdge = new THREE.Scene();
    globalLight = new THREE.DirectionalLight('white');
    globalLight.position.set(1, 0, 0).normalize();
    var sphere = new THREE.Mesh(
      new THREE.SphereGeometry(2, 16, 16),
      new THREE.MeshPhongMaterial({
        side: THREE.FrontSide, shading: THREE.FlatShading, color: "#f00"
      })
    );
    var geometry = new THREE.CubeGeometry( 30, 30, 30 );
    var material = new THREE.MeshPhongMaterial( { color: 0xff0000 } );
    var cube = new THREE.Mesh( geometry, material );
    scene.add(cube);
//    var loader = new THREE.JSONLoader(true);
//    loader.load('mesh/sheep.js', createScene);
    renderer = new THREE.WebGLRenderer({
      antialias: true
    });
    //    renderer.sortObjects = false;
    scene.add(globalLight);
    scene.add(camera);
    scene.add(sphere);
    renderer.setSize(WIDTH, HEIGHT);
    renderer.setClearColor('lightgray', 1);
    primary = document.getElementById('primary');
    primary.appendChild(renderer.domElement);
    renderer.render(scene, camera);
  }

  function render() {
    if (mesh) {
      if (meshFlg) {
        meshEdge.material.side = THREE.FrontSide;
        mesh.material.uniforms.edgeColor.value = new THREE.Vector4(0, 0, 0, 0);
        mesh.material.uniforms.edge.value = false;
      }
      renderer.render(scene, camera);
      if (meshFlg) {
        meshEdge.material.side = THREE.BackSide;
        meshEdge.material.uniforms.edgeColor.value = new THREE.Vector4(0, 0, 0, 1);
        meshEdge.material.uniforms.edge.value = true;
        renderer.render(sceneEdge, camera);
      }
    }
  }
  var meshFlg = true;
  init();
});
