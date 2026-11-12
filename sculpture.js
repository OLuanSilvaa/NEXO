/* A small, dependency-free WebGL sculpture. The SVG underneath is its fallback. */
(() => {
  'use strict';
  const canvas = document.getElementById('sculpture');
  if (!canvas) return;
  let gl;
  try { gl = canvas.getContext('webgl', { alpha: true, antialias: true, powerPreference: 'low-power' }); } catch { return; }
  if (!gl) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const vertexSource = `
    attribute vec3 aPosition;
    attribute vec3 aNormal;
    uniform mat4 uModel;
    uniform mat4 uProjection;
    varying vec3 vPosition;
    varying vec3 vNormal;
    void main() {
      vec4 p = uModel * vec4(aPosition, 1.0);
      vPosition = p.xyz;
      vNormal = mat3(uModel) * aNormal;
      gl_Position = uProjection * vec4(p.xyz - vec3(0.0, 0.0, 6.4), 1.0);
    }
  `;
  const fragmentSource = `
    precision mediump float;
    varying vec3 vPosition;
    varying vec3 vNormal;
    vec3 environment(vec3 r) {
      float sky = smoothstep(-0.5, 0.8, r.y);
      vec3 color = mix(vec3(0.025), vec3(0.27), sky);
      float strip = pow(max(0.0, 1.0-abs(dot(r,normalize(vec3(0.6,0.4,0.8))))), 30.0);
      float panel = pow(max(dot(r,normalize(vec3(-0.65,0.7,0.45))),0.0), 12.0);
      float side = pow(max(dot(r,normalize(vec3(0.9,0.1,0.15))),0.0), 18.0);
      float bottom = pow(max(dot(r,normalize(vec3(0.1,-0.6,0.8))),0.0), 25.0);
      color += vec3(1.3)*strip;
      color += vec3(2.4)*panel;
      color += vec3(0.95)*side;
      color += vec3(0.45)*bottom;
      return color;
    }
    void main() {
      vec3 n = normalize(vNormal);
      vec3 view = normalize(vec3(0.0,0.0,6.4)-vPosition);
      vec3 r = reflect(-view,n);
      float fresnel = pow(1.0-max(dot(n,view),0.0),3.0);
      vec3 color = environment(r)*0.82;
      float spec = pow(max(dot(n,normalize(vec3(-0.6,1.0,1.5))),0.0),42.0);
      color += vec3(0.85)*spec;
      color += vec3(0.12)*fresnel;
      color = color/(color+vec3(0.75));
      color = pow(color,vec3(0.74));
      gl_FragColor = vec4(color,1.0);
    }
  `;
  function compile(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source); gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { gl.deleteShader(shader); return null; }
    return shader;
  }
  const vs = compile(gl.VERTEX_SHADER, vertexSource);
  const fs = compile(gl.FRAGMENT_SHADER, fragmentSource);
  if (!vs || !fs) return;
  const program = gl.createProgram();
  gl.attachShader(program, vs); gl.attachShader(program, fs); gl.linkProgram(program);
  gl.deleteShader(vs); gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
  gl.useProgram(program);

  const positions = [], normals = [], indices = [];
  const segments = 280, sides = 32;
  const point = t => [(1.48 + .43 * Math.cos(3*t)) * Math.cos(2*t), (1.48 + .43 * Math.cos(3*t)) * Math.sin(2*t), .72 * Math.sin(3*t)];
  const subtract = (a,b) => a.map((value,i) => value-b[i]);
  const normalize = v => { const length = Math.hypot(...v) || 1; return v.map(value => value/length); };
  const cross = (a,b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
  for (let i=0;i<=segments;i++) {
    const t = i/segments * Math.PI*2;
    const center = point(t), next = point(t+.001);
    const tangent = normalize(subtract(next,center));
    const binormal = normalize(cross(tangent,center.map((value,j) => value+next[j])));
    const normal = normalize(cross(binormal,tangent));
    for (let j=0;j<=sides;j++) {
      const v = j/sides*Math.PI*2;
      const n = normal.map((value,k) => Math.cos(v)*value+Math.sin(v)*binormal[k]);
      positions.push(...center.map((value,k) => value+.315*n[k]));
      normals.push(...n);
      if (i<segments && j<sides) {
        const a = i*(sides+1)+j, b = a+sides+1;
        indices.push(a,b,a+1,b,b+1,a+1);
      }
    }
  }
  function attribute(name, data) {
    const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buffer); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);
    const location = gl.getAttribLocation(program,name); gl.enableVertexAttribArray(location); gl.vertexAttribPointer(location,3,gl.FLOAT,false,0,0);
  }
  attribute('aPosition',positions); attribute('aNormal',normals);
  const indexBuffer = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices),gl.STATIC_DRAW);
  const modelLocation = gl.getUniformLocation(program,'uModel');
  const projectionLocation = gl.getUniformLocation(program,'uProjection');
  gl.enable(gl.DEPTH_TEST); gl.clearColor(0,0,0,0);

  const multiply = (a,b) => {
    const out = new Float32Array(16);
    for(let col=0;col<4;col++) for(let row=0;row<4;row++) for(let k=0;k<4;k++) out[col*4+row] += a[k*4+row]*b[col*4+k];
    return out;
  };
  function rotation(x,y,z) {
    const cx=Math.cos(x), sx=Math.sin(x), cy=Math.cos(y), sy=Math.sin(y), cz=Math.cos(z), sz=Math.sin(z);
    const rx=[1,0,0,0,0,cx,sx,0,0,-sx,cx,0,0,0,0,1];
    const ry=[cy,0,-sy,0,0,1,0,0,sy,0,cy,0,0,0,0,1];
    const rz=[cz,sz,0,0,-sz,cz,0,0,0,0,1,0,0,0,0,1];
    return multiply(multiply(rz,ry),rx);
  }
  let visible = true, dragging = false, targetX=0, targetY=0, cursorX=0, cursorY=0, dragRotation=0, lastX=0;
  let frame = 0, previousTime = 0, elapsed = 0;
  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1,1.65);
    canvas.width=Math.max(1,Math.round(rect.width*dpr)); canvas.height=Math.max(1,Math.round(rect.height*dpr));
    gl.viewport(0,0,canvas.width,canvas.height);
    const aspect=canvas.width/canvas.height, f=1/Math.tan(42*Math.PI/360), near=.1, far=100;
    gl.uniformMatrix4fv(projectionLocation,false,new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+near)/(near-far),-1,0,0,2*far*near/(near-far),0]));
    draw();
  }
  function draw() {
    const model=rotation(.3+cursorY*.22, -.3+elapsed*.035+cursorX*.35+dragRotation, -.35);
    gl.uniformMatrix4fv(modelLocation,false,model);
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES,indices.length,gl.UNSIGNED_SHORT,0);
  }
  function animate(time) {
    frame=0;
    if (!visible || document.hidden || reducedMotion.matches) { previousTime=0; draw(); return; }
    elapsed += previousTime ? Math.min((time-previousTime)/1000,.05) : 0;
    previousTime=time;
    cursorX += (targetX-cursorX)*.035; cursorY += (targetY-cursorY)*.035;
    draw(); frame=requestAnimationFrame(animate);
  }
  function start() { if (!frame && visible && !document.hidden && !reducedMotion.matches) frame=requestAnimationFrame(animate); else draw(); }
  canvas.addEventListener('pointermove',event => {
    if (reducedMotion.matches) return;
    const rect=canvas.getBoundingClientRect();
    targetX=(event.clientX-rect.left)/rect.width-.5; targetY=(event.clientY-rect.top)/rect.height-.5;
    if (dragging) dragRotation += (event.clientX-lastX)*.006;
    lastX=event.clientX;
  },{passive:true});
  canvas.addEventListener('pointerleave',() => { targetX=0; targetY=0; });
  canvas.addEventListener('pointerdown',event => { if (reducedMotion.matches) return; dragging=true; lastX=event.clientX; canvas.setPointerCapture(event.pointerId); });
  const endDrag = () => { dragging=false; };
  canvas.addEventListener('pointerup',endDrag); canvas.addEventListener('pointercancel',endDrag);
  const observer=new IntersectionObserver(entries => { visible=entries[0].isIntersecting; if (visible) start(); },{threshold:0});
  observer.observe(canvas);
  const resizeObserver=new ResizeObserver(resize); resizeObserver.observe(canvas);
  document.addEventListener('visibilitychange',start);
  reducedMotion.addEventListener('change',() => { previousTime=0; start(); });
  canvas.addEventListener('webglcontextlost',event => { event.preventDefault(); cancelAnimationFrame(frame); frame=0; visible=false; document.documentElement.classList.remove('webgl-ready'); });
  // On restoration the original SVG remains visible until a refresh recreates GPU resources.
  resize(); start(); document.documentElement.classList.add('webgl-ready');
})();
