var s = 0.5;

const Bspline = [
  [ -1 , 3 , -3 , 1 ],
  [ 3 , -6 , 3 , 0 ],
  [ -3 , 0 , 3 , 0 ],
  [ 1 , 4 , 1 , 0 ],
]

//making bspline curve
var geometryBsplinePoints = new THREE.Geometry();
if(drawBspline) setBsplinePoints(particlesGeometry.vertices, geometryBsplinePoints);
var bsplineMaterial = new THREE.LineBasicMaterial( { color: 'orange', linewidth: 2 } );
var bsplineCurve = new THREE.Line( geometryBsplinePoints , bsplineMaterial );
scene.add( bsplineCurve );

function setBsplinePoints(controlPoints, bsplineGemeometry) {
  //based on https://www.cs.cmu.edu/afs/cs/academic/class/15462-s09/www/lec/10/lec10.pdf
  // and http://www2.cs.uregina.ca/~anima/408/Notes/Interpolation/UniformBSpline.htm
  var numBsplineControlPoints = controlPoints.length;
  if(numBsplineControlPoints >= 4) {
    for(let i = 0; i <= numBsplineControlPoints - 4; i += 1) {
      p0 = controlPoints[i];
      p1 = controlPoints[i + 1];
      p2 = controlPoints[i + 2];
      p3 = controlPoints[i + 3];
      for(let t = 0; parseFloat(t.toFixed(3)) <= 1.0; t += 0.01) {
        setBsplinePoints2(p0, p1, p2, p3, t, bsplineGemeometry);
      }
    }
  }
  bsplineGemeometry.verticesNeedUpdate = true;
}

function setBsplinePoints2(p0, p1, p2, p3, t, bsplineGemeometry) {
  let x = multVV( [t*t*t, t*t, t, 1], multMV( Bspline, [p0.x, p1.x, p2.x, p3.x] )) / 6;
  let y = multVV( [t*t*t, t*t, t, 1], multMV( Bspline, [p0.y, p1.y, p2.y, p3.y] )) / 6;
  let z = multVV( [t*t*t, t*t, t, 1], multMV( Bspline, [p0.z, p1.z, p2.z, p3.z] )) / 6;
  bsplineGemeometry.vertices.push(
    new THREE.Vector3( x , y , z )
  );
}

function updateBsplineCurve() {
  getParticlesGeometry();
  bsplineCurve.geometry = new THREE.Geometry();
  setBsplinePoints(particlesGeometry.vertices, bsplineCurve.geometry);
  bsplineCurve.geometry.verticesNeedUpdate = true;
}

function clearBsplineCurve() {
  bsplineCurve.geometry = new THREE.Geometry();
  bsplineCurve.geometry.verticesNeedUpdate = true;
}
