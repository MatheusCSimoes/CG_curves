var container;
var camera, scene, renderer, mouse;
var particles, numParticles = 100, numPoints = 6;
var controlPointsObject, particlesGeometry;
var raycaster, pointIntersectIndex;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var nextClickAddPoint = false;
var drawBezier = true;
var drawHermite = false;
var drawCatmull = false;
var drawBspline = false;
var buttonBezier = document.getElementById( "bezier" );
var buttonHermite = document.getElementById( "hermite" );
var buttonBspline = document.getElementById( "bSpline" );
var buttonCatmull = document.getElementById( "catmull" );

init();
animate();

//MAIN REFERENCE: https://threejs.org/docs/index.html#manual/en/introduction/Creating-a-scene

function init() {
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );

  container = document.createElement( 'div' );
  container.appendChild( renderer.domElement );
  document.body.appendChild( container );

  camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 1, 10000 );
  camera.position.set( 0, 0, 100 );
  camera.lookAt( 0, 0, 0 );

  mouse = new THREE.Vector2();

  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0xf0f0f0 );

  //test of instersection to move controlPoints
  raycaster = new THREE.Raycaster();
  raycaster.linePrecision = 10;
  raycaster.params.Points.threshold = 10;
  controlPointsObject = new THREE.Object3D();
  //initial points
  var positions = new Float32Array( numParticles * 3 );

  positions[0] = -0.75 * windowHalfX; positions[1] = 0.4 * windowHalfY; positions[2] = 10;
  positions[3] = -0.5 * windowHalfX; positions[4] = -10; positions[5] = 10;
  positions[6] = -0.25 * windowHalfX; positions[7] = 0.4 * windowHalfY; positions[8] = 10;
  positions[9] = 0.25 * windowHalfX; positions[10] = 0.4 * windowHalfY; positions[11] = 10;
  positions[12] = 0.50 * windowHalfX; positions[13] = -10; positions[14] = 10;
  positions[15] = 0.75 * windowHalfX; positions[16] = 0.4 * windowHalfY; positions[17] = 10;

  var geometry = new THREE.BufferGeometry();
  geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
  geometry.setDrawRange(0, numPoints);
  var material = new THREE.PointsMaterial( {
    color: new THREE.Color( 0x000000 ),
    size: 10
  } );
  //
  particles = new THREE.Points( geometry, material );
  // console.log(particles);
  getParticlesGeometry();

  scene.add( particles );
  controlPointsObject.add( particles	);
  scene.add( controlPointsObject );
  //
  document.addEventListener( 'mousedown', onDocumentMouseDown, false );
  document.addEventListener( 'mouseup', onDocumentMouseUp, false );
  document.addEventListener( 'mousemove', onDocumentMouseMove, false );
  //
  window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;
  renderer.setSize( window.innerWidth, window.innerHeight );
}

//button events
document.getElementById( "addPoint" ).addEventListener( 'click', function () {
  nextClickAddPoint = true;
}, false );

document.getElementById( "removePoint" ).addEventListener( 'click', function () {
  numPoints = (numPoints - 1) < 0 ? 0 : numPoints - 1;
  particles.geometry.setDrawRange(0, numPoints);
  particles.geometry.needsUpdate = true;

  if(drawBezier) updateBezierCurve();
  if(drawHermite) updateHermiteCurve();
  if(drawCatmull) updateCatmullCurve();
  if(drawBspline) updateBsplineCurve();
}, false );

document.getElementById( "bezier" ).addEventListener( 'click', function () {
  if(!drawBezier) {
    drawBezier = true;
    updateBezierCurve();
    buttonBezier.style["background-color"] = "green";
    // buttonBezier.style["border-color"] = "green";
  }
  else {
    drawBezier = false;
    clearBezierCurve();
    buttonBezier.style["background-color"] = "red";
    // buttonBezier.style["border-color"] = "red";
  }
}, false );

document.getElementById( "hermite" ).addEventListener( 'click', function () {
  if(!drawHermite) {
    drawHermite = true;
    updateHermiteCurve();
    buttonHermite.style["background-color"] = "green";
  }
  else {
    drawHermite = false;
    clearHermiteCurve();
    buttonHermite.style["background-color"] = "red";
  }
}, false );

document.getElementById( "catmull" ).addEventListener( 'click', function () {
  if(!drawCatmull) {
    drawCatmull = true;
    updateCatmullCurve();
    buttonCatmull.style["background-color"] = "green";
  }
  else {
    drawCatmull = false;
    clearCatmullCurve();
    buttonCatmull.style["background-color"] = "red";
  }
}, false );

document.getElementById( "bSpline" ).addEventListener( 'click', function () {
  if(!drawBspline) {
    drawBspline = true;
    updateBsplineCurve();
    buttonBspline.style["background-color"] = "green";
  }
  else {
    drawBspline = false;
    clearBsplineCurve();
    buttonBspline.style["background-color"] = "red";
  }
}, false );

//mouse events to move control points
var mouseIsPressedOverPoint = false;
function onDocumentMouseDown( event ) {
  mouse.x = (( event.clientX / window.innerWidth ) * 2 - 1); //normalized [-1,1]
  mouse.y = (-( event.clientY / window.innerHeight ) * 2 + 1); //normalized [-1,1]

  if(nextClickAddPoint) {
    particles.geometry.attributes.position.array[numPoints * 3] = mouse.x * windowHalfX;
    particles.geometry.attributes.position.array[(numPoints * 3) + 1] = mouse.y * windowHalfY;
    particles.geometry.attributes.position.array[(numPoints * 3) + 2] = 10;

    particles.geometry.needsUpdate = true;
    numPoints = numPoints + 1;
    particles.geometry.setDrawRange(0, numPoints);

    updatePointPosition(numPoints);
    nextClickAddPoint = false;

    if(drawBezier) updateBezierCurve();
    if(drawHermite) updateHermiteCurve();
    if(drawCatmull) updateCatmullCurve();
    if(drawBspline) updateBsplineCurve();

    return;
  }

  raycaster.setFromCamera( mouse, camera );
  var intersects = raycaster.intersectObjects( controlPointsObject.children, true );

  //console.log(intersects); //REVER RAYCASTER PARA INTERSEÇÃO DO MOUSE COM PONTO DE CONTROLE
  //metodo feito pelo raycaster nao e confiavel. caso o raycaster nao pegue a intersecao, o metodo implementado pega
  if ( intersects.length > 0 ) {
    pointIntersectIndex = intersects[0].index;
    mouseIsPressedOverPoint = true;
  }
  else {
    let index = testIntersection();
    if(index != -1) {
      pointIntersectIndex = index;
      // console.log(index);
      mouseIsPressedOverPoint = true;
    }
  }
}

function onDocumentMouseMove( event ) {
  if(mouseIsPressedOverPoint) {
    mouse.x = (( event.clientX / window.innerWidth ) * 2 - 1);
    mouse.y = (-( event.clientY / window.innerHeight ) * 2 + 1);
    updatePointPosition(pointIntersectIndex);
    if(drawBezier) updateBezierCurve();
    if(drawHermite) updateHermiteCurve();
    if(drawCatmull) updateCatmullCurve();
    if(drawBspline) updateBsplineCurve();
  }
}

function onDocumentMouseUp( event ) {
  controlPointsObject.children[0].geometry.needsUpdate = true;
  mouseIsPressedOverPoint = false;
  mouse.x = (( event.clientX / window.innerWidth ) * 2 - 1);
  mouse.y = (-( event.clientY / window.innerHeight ) * 2 + 1);
}

//if mouse is pressed and it intersected any point, if the mouse move, the point's position needs to be updated
function updatePointPosition( pointIndex ) {
  particles.geometry.attributes.position.array[ pointIndex * 3 ] = mouse.x * windowHalfX;
  particles.geometry.attributes.position.array[ (pointIndex * 3) + 1 ] = mouse.y * windowHalfY;
  particles.geometry.attributes.position.needsUpdate = true;
  getParticlesGeometry();
}

//get control points as a Geometry
function getParticlesGeometry() {
  particlesGeometry = new THREE.Geometry();
  for(let i = 0; i < numPoints * 3; i += 3) {
    particlesGeometry.vertices.push(
      new THREE.Vector3( particles.geometry.attributes.position.array[i + 0]
        , particles.geometry.attributes.position.array[i + 1]
        , particles.geometry.attributes.position.array[i + 2] )
      );
    }
}

function testIntersection() {
  let x = mouse.x * windowHalfX + windowHalfX;
  let y = mouse.y * windowHalfY + windowHalfY;

  for(let i = 0; i < numPoints; i += 1) {
    let x2 = particles.geometry.attributes.position.array[i * 3] + windowHalfX - x;
    x2 = x2*x2;
    let y2 = particles.geometry.attributes.position.array[(i*3) + 1] + windowHalfY - y;
    y2 = y2*y2;
    if( x2 + y2 <= 100 ) {
      return i;
    }
  }

  return -1;
}

function animate() {
  requestAnimationFrame( animate );
  render();
}

function render() {
  renderer.render( scene, camera );
}
