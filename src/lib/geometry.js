// Returns the Z coordinate of AB ^ BC
export function signOfVectorProduct(a, b, c) {
  return (b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]);
}

// Returns OA.OB
export function scalarProduct(o, a, b) {
  return (a[0] - o[0]) * (b[0] - o[0]) + (a[1] - o[1]) * (b[1] - o[1]);
}

export function distance (a, b) {
  return Math.sqrt(Math.pow(b[0] - a[0], 2) + Math.pow(b[1] - a[1], 2));
}

export function getVectorAngleFromXAxis(x,y){
  const angle = x === 0 ? Math.PI / 2 : Math.atan(y / Math.abs(x));
  if(x < 0)
    return Math.PI - angle;
  return angle;
}

export function isPointInTriangle(p, a, b, c) {
  // A bit of geometry
  // See https://stackoverflow.com/a/2049593/3841242
  // Compute the vector product (along Z) to know the angle. All must have the same sign
  const results = [
    this.signOfVectorProduct(a, b, p),
    this.signOfVectorProduct(b, c, p),
    this.signOfVectorProduct(c, a, p),
  ];
  const hasPos = results.reduce((a, v) => a || (v > 0), false),
    hasNeg = results.reduce((a, v) => a || (v < 0), false);
  return !(hasNeg && hasPos);
}

export function vectorRotation(x, y, alpha) {
  // Time for some complex numbers!
  return [x * Math.cos(alpha) - y * Math.sin(alpha), x * Math.sin(alpha) + y * Math.cos(alpha)];
}

export function findRectangleCorners(width, height, centerX, centerY, angle) {
  return [[1,1], [-1, 1], [-1, -1], [1,-1]].map(([mx, my]) =>
    this.vectorRotation( width / 2 * mx,  height / 2 * my, angle),
  ).map(([x,y]) => [centerX + x, centerY + y]);
}

export function tryMatchingMagicAngle(angle, n_divisions, tolerance) {
  angle %= 2 * Math.PI; // Angle is not between -2PI and 2PI
  if(angle < 0) // Angle is now between 0 and 2PI
    angle += 2 * Math.PI;
  // Try to match the angle with a canonic angle
  for (let i = 0; i <= n_divisions; i++) {
    const candidate = 2 * Math.PI * i / n_divisions;
    if(Math.abs(angle - candidate) < tolerance)
      return candidate;
  }
  // No angle matched!
  return angle;
}