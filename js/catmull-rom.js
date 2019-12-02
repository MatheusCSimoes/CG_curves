var s = 0.5;

const Catmull = [
  [ -s , 2-s , s-2 , s ],
  [ 2*s , s-3 , 3 - 2*s , -s ],
  [ -s , 0 , s , 0 ],
  [ 0 , 1 , 0 , 0 ],
]

//making catmull curve
var geometryCatmullPoints = new THREE.Geometry();
if(drawCatmull) setCatmullPoints(particlesGeometry.vertices, geometryCatmullPoints);
var catmullMaterial = new THREE.LineBasicMaterial( { color: 'red', linewidth: 2 } );
var catmullCurve = new THREE.Line( geometryCatmullPoints , catmullMaterial );
scene.add( catmullCurve );

function setCatmullPoints(controlPoints, catmullGemeometry) {
  //based on https://www.cs.cmu.edu/afs/cs/academic/class/15462-s09/www/lec/10/lec10.pdf
  var numCatmullControlPoints = controlPoints.length;
  if(numCatmullControlPoints >= 4) {
    for(let i = 0; i <= numCatmullControlPoints - 4; i += 1) {
      p0 = controlPoints[i];
      p1 = controlPoints[i + 1];
      p2 = controlPoints[i + 2];
      p3 = controlPoints[i + 3];
      for(let t = 0; parseFloat(t.toFixed(3)) <= 1.0; t += 0.01) {
        setCatmullPoints2(p0, p1, p2, p3, t, catmullGemeometry);
      }
    }
  }
  catmullGemeometry.verticesNeedUpdate = true;
}

function setCatmullPoints2(p0, p1, p2, p3, t, catmullGemeometry) {
  let x = multVV( [t*t*t, t*t, t, 1], multMV( Catmull, [p0.x, p1.x, p2.x, p3.x] ));
  let y = multVV( [t*t*t, t*t, t, 1], multMV( Catmull, [p0.y, p1.y, p2.y, p3.y] ));
  let z = multVV( [t*t*t, t*t, t, 1], multMV( Catmull, [p0.z, p1.z, p2.z, p3.z] ));
  catmullGemeometry.vertices.push(
    new THREE.Vector3( x , y , z )
  );
}

function updateCatmullCurve() {
  getParticlesGeometry();
  catmullCurve.geometry = new THREE.Geometry();
  setCatmullPoints(particlesGeometry.vertices, catmullCurve.geometry);
  catmullCurve.geometry.verticesNeedUpdate = true;
}

function clearCatmullCurve() {
  catmullCurve.geometry = new THREE.Geometry();
  catmullCurve.geometry.verticesNeedUpdate = true;
}
