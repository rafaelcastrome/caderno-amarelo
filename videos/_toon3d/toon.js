// Motor "3D desenho" (cel shading + contorno preto + olho-de-peixe), estilo das historinhas em 1ª pessoa.
// Global: window.T. A cena define window.CENA = (T) => { ...; return { dur } } e usa T.cada(fn(t)) pra animar.
(function () {
  const W = 720, H = 1280, SS = 1.5; // render interno 1080x1920
  const T = window.T = {};
  const canvas = document.getElementById('c');
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  r.setSize(W, H, false); r.setPixelRatio(1);
  r.outputColorSpace = THREE.SRGBColorSpace;
  const cena = T.cena = new THREE.Scene();
  cena.background = new THREE.Color('#dfe6ea');
  const cam = T.cam = new THREE.PerspectiveCamera(104, W / H, 0.03, 80);
  cam.rotation.order = 'YXZ';
  cena.add(cam);
  T.anim = [];
  T.cada = (f) => T.anim.push(f);

  // ---------- luz e material toon ----------
  const grad = new THREE.DataTexture(new Uint8Array([150, 150, 150, 255, 205, 205, 205, 255, 255, 255, 255, 255]), 3, 1);
  grad.minFilter = grad.magFilter = THREE.NearestFilter; grad.needsUpdate = true;
  cena.add(new THREE.HemisphereLight(0xffffff, 0xb0a898, 1.55));
  const sol = new THREE.DirectionalLight(0xffffff, 1.5); sol.position.set(-3, 5, 2); cena.add(sol);
  T.sol = sol;
  const mats = {};
  T.mat = (cor, o = {}) => {
    const k = cor + JSON.stringify(o);
    if (!mats[k]) mats[k] = new THREE.MeshToonMaterial(Object.assign({ color: new THREE.Color(cor), gradientMap: grad }, o));
    return mats[k];
  };
  T.basico = (cor, o = {}) => new THREE.MeshBasicMaterial(Object.assign({ color: new THREE.Color(cor) }, o));

  // ---------- contorno (casca invertida) ----------
  const contornoMat = (w, radial) => new THREE.ShaderMaterial({
    uniforms: { w: { value: w } }, side: THREE.BackSide,
    vertexShader: `uniform float w; void main(){ vec3 d = ${radial ? 'normalize(position)' : 'normal'};
      vec4 mv = modelViewMatrix * vec4(position, 1.0); vec3 n = normalize(normalMatrix * d);
      mv.xyz += n * w * clamp(-mv.z, 0.3, 6.0) * 0.6; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `void main(){ gl_FragColor = vec4(0.07, 0.07, 0.09, 1.0); }`
  });
  const cMats = {};
  T.contorno = (mesh, w = 0.006, radial = false) => {
    const k = w + '' + radial; if (!cMats[k]) cMats[k] = contornoMat(w, radial);
    const o = new THREE.Mesh(mesh.geometry, cMats[k]); o.renderOrder = -1; mesh.add(o); return mesh;
  };
  // malha toon com contorno. geo, cor, pai, opções {w, radial, sem}
  T.m = (geo, cor, pai, o = {}) => {
    const m = new THREE.Mesh(geo, typeof cor === 'string' ? T.mat(cor) : cor);
    if (!o.sem) T.contorno(m, o.w || 0.006, o.radial);
    (pai || cena).add(m); return m;
  };
  T.caixa = (w, h, d, cor, pai, o = {}) => T.m(new THREE.BoxGeometry(w, h, d), cor, pai, Object.assign({ radial: true }, o));
  T.esfera = (rr, cor, pai, o = {}) => T.m(new THREE.SphereGeometry(rr, 32, 20), cor, pai, o);
  T.capsula = (rr, len, cor, pai, o = {}) => T.m(new THREE.CapsuleGeometry(rr, len, 8, 20), cor, pai, o);
  T.cilindro = (r1, r2, h, cor, pai, o = {}) => T.m(new THREE.CylinderGeometry(r1, r2, h, 28), cor, pai, o);
  T.grupo = (pai, x = 0, y = 0, z = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); (pai || cena).add(g); return g; };
  // linha grossa preta entre dois pontos (quinas de parede etc.)
  T.linha = (a, b, w = 0.018, pai) => {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A);
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, w, d.length()), T.basico('#141418'));
    m.position.copy(A).add(B).multiplyScalar(0.5); m.lookAt(B); (pai || cena).add(m); return m;
  };
  // plano com textura desenhada em canvas: f(ctx, w, h)
  T.tela = (larg, alt, px, f, pai, o = {}) => {
    const cv = document.createElement('canvas'); cv.width = px; cv.height = Math.round(px * alt / larg);
    const ctx = cv.getContext('2d'); f(ctx, cv.width, cv.height);
    const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 8;
    const mat = o.luz ? new THREE.MeshToonMaterial({ map: tx, gradientMap: grad, transparent: !!o.transp }) : new THREE.MeshBasicMaterial({ map: tx, transparent: !!o.transp });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(larg, alt), mat); (pai || cena).add(m);
    m.userData.redesenha = () => { ctx.clearRect(0, 0, cv.width, cv.height); f(ctx, cv.width, cv.height); tx.needsUpdate = true; };
    m.userData.ctx = ctx; m.userData.f = (g) => { f = g; };
    return m;
  };

  // ---------- olho-de-peixe (pós-processo) ----------
  const rt = new THREE.WebGLRenderTarget(W * SS, H * SS, { samples: 4 });
  rt.texture.colorSpace = THREE.SRGBColorSpace;
  const fe = new THREE.ShaderMaterial({
    uniforms: { tex: { value: rt.texture }, k: { value: 0.42 }, asp: { value: W / H }, vin: { value: 0.35 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }',
    fragmentShader: `uniform sampler2D tex; uniform float k, asp, vin; varying vec2 vUv;
      void main(){ vec2 p = (vUv - 0.5) * 2.0; p.x *= asp; float rc2 = asp*asp + 1.0;
        float s = 1.0 / (1.0 + k * rc2); vec2 q = p * s * (1.0 + k * dot(p, p)); q.x /= asp;
        vec2 uv = q * 0.5 + 0.5; vec4 c = texture2D(tex, uv);
        float v = 1.0 - vin * pow(length(p) / sqrt(rc2), 2.5);
        gl_FragColor = vec4(pow(c.rgb, vec3(1.0/2.2)) * v, 1.0); }`
  });
  T.fisheye = fe.uniforms;
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), fe);
  const cenaQ = new THREE.Scene(); cenaQ.add(quad);
  const camQ = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  window.render = (t) => {
    for (const f of T.anim) f(t);
    r.setRenderTarget(rt); r.render(cena, cam);
    r.setRenderTarget(null); r.render(cenaQ, camQ);
  };

  // ---------- utilidades de tempo ----------
  T.lerp = (a, b, u) => a + (b - a) * u;
  T.clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  T.suave = (u) => { u = T.clamp(u); return u * u * (3 - 2 * u); };
  T.janela = (t, a, b) => T.suave((t - a) / (b - a));
  // chaves [[t, valor], ...] -> valor interpolado suave
  T.chaves = (ks, t) => {
    if (t <= ks[0][0]) return ks[0][1];
    for (let i = 1; i < ks.length; i++) if (t <= ks[i][0]) {
      const u = T.suave((t - ks[i - 1][0]) / (ks[i][0] - ks[i - 1][0])); const a = ks[i - 1][1], b = ks[i][1];
      return Array.isArray(a) ? a.map((v, j) => T.lerp(v, b[j], u)) : T.lerp(a, b, u);
    }
    return ks[ks.length - 1][1];
  };
  // envelope de boca: window.BOCAS[nome] = {fps, v:[...]}; fala começa em t0
  T.boca = (nome, t0, t) => {
    const B = (window.BOCAS || {})[nome]; if (!B) return 0;
    const i = Math.floor((t - t0) * B.fps); return i >= 0 && i < B.v.length ? B.v[i] : 0;
  };
})();
