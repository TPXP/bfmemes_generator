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
    signOfVectorProduct(a, b, p),
    signOfVectorProduct(b, c, p),
    signOfVectorProduct(c, a, p),
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
    vectorRotation( width / 2 * mx,  height / 2 * my, angle),
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

export function fitTextInRectangle(canvas, {maxSize, text, width, height, fontFamily = 'sans-serif', lineHeight = 1.2, fontWeight = '', forbiddenAreas = []}) {
  // This is a dichotomy algorithm between 1 and maxSize - Yes, I studied this in class!
  let a = 1, b = maxSize;
  // If we ever fall back to font size 1, put everything on the same line
  let bestSolution = [text];

  if(fontWeight) // Make those values easier to concatenate
    fontWeight += " ";

  // Normalize the font family
  if(/[ "]/.test(fontFamily))
    fontFamily = '"' + fontFamily.replace(/"/g, '\\"') + '"';

  const words = text.split(' ');

  function computeLineDimensions(index, fontSize) {
    const lTop = index * lineHeight * fontSize;
    let lLeft = 0, lWidth = width;
    // We have a rectangle of lWidth * fontSize at (lLeft, lTop). Find intersections with forbiddenAreas
    for (let {top, isOnRight = false, width: areaWidth, height:areaHeight} of forbiddenAreas){
      // We only accept rectangles on the sides of the text. No stuff in the middle!
      // Put the rectangle position relative to the line
      top -= lTop;
      // No vertical intersection with the line (above/below)
      if(top > fontSize /* below */ || top + areaHeight < 0 /* above */)
        continue;
      if(isOnRight) {
        // Crop it on the right if needed
        if(lLeft + lWidth > width - areaWidth)
          lWidth = width - areaWidth - lLeft;
      } else { // The space is on the right
        if(lLeft < areaWidth) {
          // Reduce the line width by the space we're taking
          lWidth -= (areaWidth - lLeft);
          // And change the left dimension
          lLeft = areaWidth;
        }
      }
      // We've reached invalid dimensions
      if(lWidth <= 0 || lLeft >= width)
        return {left: width, availableWidth: 0, invalid: true};
    }
    return {left: lLeft, availableWidth: lWidth};
  }

  while(a !== b) {
    // The dichotomy part - here we only work on integers, which greatly helps in reducing the number of rounds
    const c = Math.floor((a + b)/2) + 1, maxLines = Math.floor(height / (c * lineHeight)), candidate = [];

    function addNewLine(){
      candidate.push({
        ...computeLineDimensions(candidate.length, c),
        width: 0,
        text: '',
      });
    }
    addNewLine();
    let it_fits = true, spaceWidth = 0; // For the very first word, don't add the space width
    canvas.font = `${fontWeight}${c}px ${fontFamily}`;
    for(let word of words){
      const wordWidth = canvas.measureText(word).width;
      // Trivial case: a full word does not fit!
      if(wordWidth > width){
        it_fits = false;
        break;
      }
      // If it does not fit on the line, jump a line
      if(wordWidth + spaceWidth + candidate[candidate.length - 1].width > candidate[candidate.length - 1].availableWidth){
        // Find the next possible line
        do {
          addNewLine();
        } while (candidate[candidate.length - 1].availableWidth < wordWidth && candidate.length < maxLines)
        // If we added too many lines, it will be caught below (it_fits will be set to false)
        candidate[candidate.length - 1].width = wordWidth;
        candidate[candidate.length - 1].text = word;
      } else { // Else, add it at the end
        candidate[candidate.length - 1].width += wordWidth + spaceWidth;
        candidate[candidate.length - 1].text += `${spaceWidth ? ' ' : ''}${word}`;
      }
      // Do we have too many lines?
      if(candidate.length > maxLines) {
        it_fits = false;
        break;
      }
      // Make sure we take into account the space width properly for the next words
      if(!spaceWidth)
        spaceWidth = canvas.measureText(' ').width;
    }

    // The rest of the dichotomy algorithm. Feel free to reuse it if you get stuck in an infinite loop in the middle of an interview
    if(it_fits) {
      a = c;
      bestSolution = candidate;
    } else
      b = c - 1;
  }
  // Font size is a, words are in bestSolution
  // Set the font size, and return the lines to write (so that they can be centered or whatever)
  canvas.font = `${fontWeight}${a}px ${fontFamily}`;
  return {
    lines: bestSolution,
    fontSize: a,
  };
}
