/**
 * WordSphere
 * Written by Hyojun Kim in 2017. Licensed in MIT.
 */
function wordSphere(canvas, texts, counts, options) {
  const pi = Math.PI; // happy math!
  const {
    width = 500,
    height = 500,
    radius = 150,
    padding = 50,
    fontSize = 22,
    tilt = 0,
    initialVelocityX = 0,
    initialVelocityY = 0,
    initialRotationX = 0,
    initialRotationZ = 0,
  } = options;
  
  let vx = initialVelocityX, vy = initialVelocityY;
  let rx = initialRotationX, rz = initialRotationZ;
  
  // canvas setup
  let ctx = canvas.getContext('2d'); 
  ctx.textAlign = 'center';
  
  // Hi-DPI support
  canvas.width = width;
  canvas.height = height;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.scale(2,2); 

  // scrolling
  let clicked = false, lastX, lastY;
  canvas.addEventListener('mousedown', event => {
    clicked = true;
    lastX = event.screenX;
    lastY = event.screenY;
  });
  canvas.addEventListener('mousemove', event => {
    if (!clicked) return;
    [dx, dy] = [event.screenX - lastX, event.screenY - lastY];
    [lastX, lastY] = [event.screenX, event.screenY];

    // rotation update
    rz += -dy * 0.01;
    rx += dx * 0.01;

    // velocity update
    vx = dx * 0.1;
    vy = dy * 0.1;

    if (!looping) startLoop();
  });
  canvas.addEventListener('mouseup', e => clicked = false);
  canvas.addEventListener('mouseleave', e => clicked = false);
  
  function rot(x,y,t) {
    return [x*Math.cos(t)-y*Math.sin(t), x*Math.sin(t)+y*Math.cos(t)];
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let ix = 0, iz = 0, i = 1;
    for (const text of texts) {
      const degZ = (pi/(counts.length-1)) * iz;
      const degX = (2*pi/counts[iz]) * ix;

      let x = radius * Math.sin(degZ) * Math.cos(degX);
      let y = radius * Math.sin(degZ) * Math.sin(degX); 
      let z = radius * Math.cos(degZ) + 8*(ix % 2) /* randomness */;

      // camera transform
      [y,z] = rot(y, z, tilt);
      [x,z] = rot(x, z, rz);
      [x,y] = rot(x, y, rx);

      // convert to cartesian and then draw.
      const alpha = 0.6 + 0.4 * (x/radius);
      const size = fontSize + 2 + 5*(x/radius);
      ctx.fillStyle = `rgba(0,0,0,${alpha})`;
      ctx.font = `${size}px "Brandon Grotesque"`;
      ctx.fillText(text, y + width/2, -z + height/2);

      ix--;
      if (ix < 0) {
        iz++;
        ix = counts[iz] - 1;
      }
      i++;
    }
  }

  // renderer
  let looping = false;
  function rendererLoop() {
    if (looping) window.requestAnimationFrame(rendererLoop);
    render();
    
    // deacceleration - dirty code xD
    if (vx > 0) vx = vx - 0.01;
    if (vy > 0) vy = vy - 0.01;
    if (vx < 0) vx = vx + 0.01;
    if (vy > 0) vy = vy + 0.01;
    if (vx == 0 && vy == 0) stopLoop();
    
    rz += vy * 0.01;
    rx += vx * 0.01;
  }

  function startLoop() {
    looping = true;
    window.requestAnimationFrame(rendererLoop);
  }

  function stopLoop() {
    looping = false;
  }
  startLoop();
}