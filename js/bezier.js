//making bezier curve
var geometryBezierPoints = new THREE.Geometry();
if(drawBezier) setBezierPoints(particlesGeometry.vertices, geometryBezierPoints);
var bezierMaterial = new THREE.LineBasicMaterial( { color: 'blue', linewidth: 2 } );
var bezierCurve = new THREE.Line( geometryBezierPoints , bezierMaterial );
scene.add( bezierCurve );

function setBezierPoints2(bezierControlPoints, t, bezierGemeometry) {
  if(bezierControlPoints.length == 1) {
    bezierGemeometry.vertices.push(
      new THREE.Vector3( bezierControlPoints[0].x , bezierControlPoints[0].y , bezierControlPoints[0].z )
    );
    return;
  }

  let newBezierControlPoints = new THREE.Geometry();
  for(let i = 0; (i + 1) < bezierControlPoints.length; i++) {
    newBezierControlPoints.vertices.push( new THREE.Vector3(
      (bezierControlPoints[i].x * t) + (bezierControlPoints[i+1].x * (1-t)),
      (bezierControlPoints[i].y * t) + (bezierControlPoints[i+1].y * (1-t)),
      (bezierControlPoints[i].z * t) + (bezierControlPoints[i+1].z * (1-t))
    ));
  }
  setBezierPoints2(newBezierControlPoints.vertices, t, bezierGemeometry);
}

function setBezierPoints(controlPoints, bezierGemeometry) {
  //based on De Casteljau's algorithm -- https://javascript.info/bezier-curve
  if(controlPoints.length > 1) {
    for(let t = 0; parseFloat(t.toFixed(3)) <= 1.0; t += 0.01) {
      setBezierPoints2(controlPoints, t, bezierGemeometry);
    }
    bezierGemeometry.verticesNeedUpdate = true;
  }
}

function updateBezierCurve() {
  getParticlesGeometry();
  bezierCurve.geometry = new THREE.Geometry();
  setBezierPoints(particlesGeometry.vertices, bezierCurve.geometry);
  bezierCurve.geometry.verticesNeedUpdate = true;
}

function clearBezierCurve() {
  bezierCurve.geometry = new THREE.Geometry();
  bezierCurve.geometry.verticesNeedUpdate = true;
}
