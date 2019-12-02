const Hermite = [
  [ 2 ,-2 , 1 , 1 ],
  [-3 , 3 ,-2 ,-1 ],
  [ 0 , 0 , 1 , 0 ],
  [ 1 , 0 , 0 , 0 ],
]

//making hermite curve
var geometryHermitePoints = new THREE.Geometry();
if(drawHermite) setHermitePoints(particlesGeometry.vertices, geometryHermitePoints);
var hermiteMaterial = new THREE.LineBasicMaterial( { color: 'green', linewidth: 2 } );
var hermiteCurve = new THREE.Line( geometryHermitePoints , hermiteMaterial );
scene.add( hermiteCurve );

function setHermitePoints(controlPoints, hermiteGemeometry) {
  //based on http://www.ic.uff.br/~aconci/Hermite-Splines.pdf
  var numHermiteControlPoints = (controlPoints.length % 2 == 1) ? controlPoints.length - 1 : controlPoints.length;
  if(numHermiteControlPoints >= 4) {
    for(let i = 0; i <= numHermiteControlPoints - 4; i += 2) {
      p0 = controlPoints[i];
      p1 = controlPoints[i + 2];
      vet0 = controlPoints[i + 1];// - controlPoints[i];
      vet1 = controlPoints[i + 3];// - controlPoints[i + 2];
      for(let t = 0; parseFloat(t.toFixed(3)) <= 1.0; t += 0.01) {
        setHermitePoints2(p0, vet0, p1, vet1, t, hermiteGemeometry);
      }
    }
  }
  hermiteGemeometry.verticesNeedUpdate = true;
}

function setHermitePoints2(p0, vet0, p1, vet1, t, hermiteGemeometry) {
  let x = multVV( [t*t*t, t*t, t, 1], multMV( Hermite, [p0.x, p1.x, vet0.x - p0.x, vet1.x - p1.x] ));
  let y = multVV( [t*t*t, t*t, t, 1], multMV( Hermite, [p0.y, p1.y, vet0.y - p0.y, vet1.y - p1.y] ));
  let z = multVV( [t*t*t, t*t, t, 1], multMV( Hermite, [p0.z, p1.z, vet0.z - p0.z, vet1.z - p1.z] ));
  hermiteGemeometry.vertices.push(
    new THREE.Vector3( x , y , z )
  );
}

function updateHermiteCurve() {
  getParticlesGeometry();
  hermiteCurve.geometry = new THREE.Geometry();
  setHermitePoints(particlesGeometry.vertices, hermiteCurve.geometry);
  hermiteCurve.geometry.verticesNeedUpdate = true;
}

function clearHermiteCurve() {
  hermiteCurve.geometry = new THREE.Geometry();
  hermiteCurve.geometry.verticesNeedUpdate = true;
}

// function setHermiteArrows() {
//   var dir = new THREE.Vector3( 25, 0, 0 );
//   //normalize the direction vector (convert to vector of length 1)
//   //dir.normalize();
//   var origin = new THREE.Vector3( 0, 0, 0 );
//   var length = 10;
//   var hex = 0x483D8B;
//
//   var arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex, 1, 1 );
//   scene.add( arrowHelper );
// }
