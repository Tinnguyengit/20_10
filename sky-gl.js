/* =========================================================
   Món Quà 20/10 — sky-gl.js
   A living nebula painted on the GPU (WebGL fragment shader):
   domain-warped noise in wine, rose and champagne gold.
   It brightens on key moments (window.SkyGL.pulse) and warms
   up scene by scene (window.SkyGL.setWarm). Falls back to the
   CSS nebula when WebGL is not available.
   ========================================================= */
(() => {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = window.matchMedia('(max-width: 640px), (pointer: coarse)').matches;
  const noop = { pulse() {}, setWarm() {}, active: false };
  window.SkyGL = noop;

  const sky = document.querySelector('.sky');
  if (!sky) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'sky-gl';
  canvas.setAttribute('aria-hidden', 'true');
  let gl = null;
  try { gl = canvas.getContext('webgl', { antialias: false, alpha: false, depth: false, stencil: false, powerPreference: 'low-power', preserveDrawingBuffer: false }); } catch (e) { gl = null; }
  if (!gl) return;
  // software renderers (no GPU) would make the whole page stutter: keep the CSS sky there
  let force = false;
  try { force = localStorage.getItem('mq_force_gl') === '1'; } catch (e) { /* ignore */ }
  try {
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    const name = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : '';
    if (!force && /swiftshader|llvmpipe|software|basic render/i.test(name)) return;
  } catch (e) { /* ignore */ }

  const VS = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
  const FS = `
precision mediump float;
uniform vec2 r; uniform float t; uniform vec2 m; uniform float e; uniform float w; uniform float o;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1.,0.)),u.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;mat2 R=mat2(.8,.6,-.6,.8);
  for(int i=0;i<5;i++){if(float(i)>=o)break;v+=a*n(p);p=R*p*2.03;a*=.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/r;
  vec2 p=(gl_FragCoord.xy-.5*r)/r.y;
  p+=m*.07;
  float tt=t*.035;
  vec2 q=vec2(fbm(p*1.5+vec2(0.,tt)),fbm(p*1.5+vec2(5.2,-tt)+1.3));
  vec2 s=vec2(fbm(p*1.9+q*1.9+vec2(1.7,9.2)+tt*1.2),fbm(p*1.9+q*1.9+vec2(8.3,2.8)-tt*.9));
  float f=fbm(p*1.3+s*1.7);
  vec3 col=mix(vec3(.055,.008,.03),vec3(.16,.025,.085),pow(1.-uv.y,1.4));
  vec3 wine=vec3(.42,.06,.2), rose=vec3(.95,.36,.57), gold=vec3(.98,.77,.52);
  col=mix(col,wine,smoothstep(.3,.84,f)*.9);
  col+=rose*pow(smoothstep(.4,1.02,f*length(s)*1.08),2.)*(.78+e*1.);
  col+=gold*pow(smoothstep(.52,1.05,s.y*f*1.38),2.6)*(.34+e*.6)*(.5+w*.7);
  // luminous filaments where the two warp fields meet, and gold highlights in the densest smoke
  float fil=pow(max(0.,1.-abs(s.x-s.y)*2.6),6.)*smoothstep(.35,.7,f);
  col+=rose*fil*(.42+e*.9);
  col+=gold*pow(max(0.,f-.25)*1.45,5.)*(.5+e*.8)*(.55+w*.6);
  col+=vec3(.55,.12,.3)*pow(1.-uv.y,3.)*(.28+w*.12);
  col+=vec3(1.,.82,.9)*e*.05;
  float v=smoothstep(1.3,.2,length((uv-.5)*vec2(1.15,1.)));
  col*=mix(.5,1.,v);
  gl_FragColor=vec4(col,1.);
}`;
  function shader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader');
    return s;
  }
  let prog;
  try {
    prog = gl.createProgram();
    gl.attachShader(prog, shader(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error('link');
  } catch (err) { return; }
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = { r: gl.getUniformLocation(prog, 'r'), t: gl.getUniformLocation(prog, 't'), m: gl.getUniformLocation(prog, 'm'), e: gl.getUniformLocation(prog, 'e'), w: gl.getUniformLocation(prog, 'w'), o: gl.getUniformLocation(prog, 'o') };

  sky.prepend(canvas);
  document.body.classList.add('has-gl');

  // the nebula is soft, so a low internal resolution looks the same and costs little
  let SCALE = mobile ? 0.33 : 0.5;
  let octaves = mobile ? 4 : 5;
  function resize() {
    const w = Math.max(2, Math.round(window.innerWidth * SCALE));
    const h = Math.max(2, Math.round(window.innerHeight * SCALE));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
  }
  resize();
  window.addEventListener('resize', resize);

  let energy = 0, target = 0, warm = 0.3, warmTarget = 0.3;
  let mx = 0, my = 0, tmx = 0, tmy = 0;
  if (!mobile && !reduce) {
    window.addEventListener('pointermove', (ev) => { tmx = ev.clientX / window.innerWidth - 0.5; tmy = 0.5 - ev.clientY / window.innerHeight; }, { passive: true });
  }
  const start = performance.now();
  let last = start, running = true, lost = false;
  canvas.addEventListener('webglcontextlost', (ev) => { ev.preventDefault(); lost = true; document.body.classList.remove('has-gl'); canvas.remove(); });

  // adapt to the device: watch the first seconds, lower quality if frames are slow, give up if still slow
  let samples = 0, acc = 0, stage = 0;
  function watch(dt) {
    if (stage > 2 || reduce) return;
    acc += dt; samples++;
    if (samples < 90) return;
    const avg = acc / samples; samples = 0; acc = 0;
    if (avg < 0.024) { stage = 3; return; }
    if (stage === 0) { stage = 1; SCALE *= 0.65; octaves = 3; resize(); }
    else if (stage === 1) { stage = 2; SCALE *= 0.7; resize(); }
    else { lost = true; document.body.classList.remove('has-gl'); canvas.remove(); window.SkyGL = noop; }
  }

  function frame(now) {
    if (!running || lost) return;
    const dt = Math.min(0.1, (now - last) / 1000); last = now;
    target *= Math.pow(0.25, dt);                  // pulses fade within a couple of seconds
    energy += (target - energy) * Math.min(1, dt * 6);
    warm += (warmTarget - warm) * Math.min(1, dt * 0.8);
    mx += (tmx - mx) * Math.min(1, dt * 2); my += (tmy - my) * Math.min(1, dt * 2);
    gl.uniform2f(U.r, canvas.width, canvas.height);
    gl.uniform1f(U.t, reduce ? 20 : (now - start) / 1000);
    gl.uniform2f(U.m, mx, my);
    gl.uniform1f(U.e, energy);
    gl.uniform1f(U.w, warm);
    gl.uniform1f(U.o, octaves);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    watch(dt);
    if (!reduce && !lost) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running && !reduce) { last = performance.now(); requestAnimationFrame(frame); }
  });

  window.SkyGL = {
    active: true,
    pulse(amount) { target = Math.min(1.4, target + (amount || 0.5)); if (reduce) requestAnimationFrame(frame); },
    setWarm(v) { warmTarget = Math.max(0, Math.min(1, v)); if (reduce) requestAnimationFrame(frame); }
  };
})();
