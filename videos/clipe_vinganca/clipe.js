// O clipe assistente (fiel ao meme): arame prateado-lilás, olhos grandes, sobrancelhas pretas, folha amarela pautada atrás.
// Carregado depois do lib.js e do ator.js. window.CLIPE(P, L) acrescenta L.clipe(o).
// o: x, y, z, s, pai, t (-1 = já em cena), velho (capacete, olho caído, arame fosco), folha (true), nome (boca/fala = window.BOCA[nome])
//    mov [[t,x,z]], olhar [[t,[x,y]]] (-1..1), palp [[t,v]] (0 aberto .. 1 fechado), sobr [[t,v]] (-1 triste, 0, 1 bravo, -2 surpreso)
//    bracos [[t,'pose',transição]], brilho [[t,v]] (olho aceso no escuro), caixa [[t,0|1]], vis [[t,0|1]], inclina [[t,rad]]
window.CLIPE = (P, L) => {
  const { THREE, F } = P; const K = L.K;
  const tr = (v, def) => (v === undefined ? () => def : K(v));
  const POSES = {
    repouso: { aL: -0.32, fL: 0, eL: -0.25, aR: 0.32, fR: 0, eR: -0.25 },
    carrega: { aL: 0.05, fL: -0.55, eL: -1.0, aR: -0.05, fR: -0.55, eR: -1.0 },
    segura: { aL: -0.32, fL: 0, eL: -0.25, aR: -0.55, fR: -1.15, eR: -1.25 },
    cima: { aL: -2.55, fL: -0.2, eL: -0.35, aR: 2.55, fR: -0.2, eR: -0.35 },
    aceno: { aL: -0.32, fL: 0, eL: -0.25, aR: 2.25, fR: -0.15, eR: -0.5, acena: 1 },
    alcanca: { aL: 0.35, fL: -1.25, eL: -0.25, aR: -0.35, fR: -1.25, eR: -0.25 },
    alcancaD: { aL: -0.4, fL: -0.2, eL: -0.4, aR: 1.38, fR: -0.25, eR: -0.12 },
    puxa: { aL: -0.7, fL: -0.3, eL: -0.6, aR: 1.25, fR: -0.2, eR: -0.55 },
    abre: { aL: -1.0, fL: -0.5, eL: -0.6, aR: 1.0, fR: -0.5, eR: -0.6 },
  };
  const CH = ['aL', 'fL', 'eL', 'aR', 'fR', 'eR', 'acena'];

  // caminho do arame (clipe em pé), em unidades com base perto de y=0
  function caminho() {
    const pts = []; const arc = (cx, cy, r, a0, a1, n = 14) => { for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; pts.push(new THREE.Vector3(cx + r * Math.cos(a), cy + r * Math.sin(a), 0)); } };
    const lin = (x0, y0, x1, y1, n = 6) => { for (let i = 1; i < n; i++) pts.push(new THREE.Vector3(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n, 0)); };
    pts.push(new THREE.Vector3(-0.1, 0.52, 0)); lin(-0.1, 0.52, -0.1, 1.08);
    arc(0.02, 1.08, 0.12, Math.PI, 0);              // curva de cima, por dentro
    lin(0.14, 1.08, 0.14, 0.27);
    arc(-0.07, 0.27, 0.21, 0, -Math.PI);           // curva de baixo
    lin(-0.28, 0.27, -0.28, 1.27);
    arc(-0.01, 1.27, 0.27, Math.PI, 0);            // curva grande de cima
    lin(0.26, 1.27, 0.26, 0.6);
    pts.push(new THREE.Vector3(0.26, 0.6, 0));
    return new THREE.CatmullRomCurve3(pts, false, 'centripetal');
  }
  const CURVA = caminho();

  L.clipe = (o = {}) => {
    const s = o.s ?? 1; const velho = !!o.velho;
    const g = P.grupo({ x: o.x || 0, y: o.y || 0, z: o.z || 0, pai: o.pai });
    const corpo = P.grupo({ pai: g });
    const corArame = velho ? 0x9c98ae : 0xbdb8e0;
    const arame = new THREE.MeshStandardMaterial({ color: corArame, metalness: velho ? 0.45 : 0.7, roughness: velho ? 0.55 : 0.28, emissive: 0x231f33, emissiveIntensity: 0.25 });
    const fio = new THREE.Mesh(new THREE.TubeGeometry(CURVA, 220, 0.036, 12, false), arame); fio.castShadow = true; fio.position.y = 0.04; corpo.add(fio);
    [0, 1].forEach((k) => { const p = CURVA.getPoint(k); const b = new THREE.Mesh(new THREE.SphereGeometry(0.036, 12, 8), arame); b.position.set(p.x, p.y + 0.04, 0); corpo.add(b); });
    // folha amarela pautada atrás (como no meme)
    if (o.folha !== false) {
      const fol = P.impresso(0.95, 1.25, (c, w, h) => {
        c.fillStyle = velho ? '#efe2a0' : '#f7eb9e'; c.fillRect(0, 0, w, h);
        c.strokeStyle = 'rgba(90,120,170,0.55)'; c.lineWidth = 2; for (let y = h * 0.12; y < h; y += h * 0.07) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
        c.strokeStyle = 'rgba(200,80,80,0.6)'; c.beginPath(); c.moveTo(w * 0.14, 0); c.lineTo(w * 0.14, h); c.stroke();
        if (velho) { c.fillStyle = 'rgba(150,110,60,0.25)'; c.beginPath(); c.arc(w * 0.7, h * 0.75, w * 0.12, 0, 7); c.fill(); }
      }, { pai: corpo, x: -0.05, y: 0.66, z: -0.12, rz: 0.04, ry: 0.12, t: -1, entra: 'fixo', esboco: false });
    }
    // olhos: círculo com textura redesenhada a cada quadro (pupila, pálpebra, brilho)
    const olhos = [[-0.13, 0.99, 0], [0.165, 0.965, 1]].map(([x, y, lado]) => {
      const cv = document.createElement('canvas'); cv.width = cv.height = 160; const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
      const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0 });
      const m = P.peca(F.circulo(0.155), { pai: corpo, prof: 0.07, cor: mat, corBorda: 0xf2f0ea, x, y, z: 0.1, t: -1, entra: 'fixo', esboco: false });
      return { m, cv, tex, mat, lado };
    });
    // sobrancelhas pretas grossas (arco)
    const arcoPts = []; for (let i = 0; i <= 12; i++) { const a = Math.PI * (0.18 + 0.64 * i / 12); arcoPts.push([Math.cos(a) * 0.19, Math.sin(a) * 0.12 - 0.08]); }
    for (let i = 12; i >= 0; i--) { const a = Math.PI * (0.18 + 0.64 * i / 12); arcoPts.push([Math.cos(a) * 0.165, Math.sin(a) * 0.08 - 0.085]); }
    const sobr = olhos.map((ol) => { const gr = P.grupo({ pai: corpo, x: ol.m.position.x, y: ol.m.position.y + 0.2, z: 0.15 });
      P.peca(F.poligono(arcoPts), { pai: gr, prof: 0.04, cor: 0x1e1a1a, t: -1, entra: 'fixo', esboco: false }); return gr; });
    // capacete amarelo (serviço braçal)
    if (velho && o.capacete !== false) {
      const cap = P.grupo({ pai: corpo, x: -0.01, y: 1.5, rz: 0.1 });
      const mc = P.papel(0xf2c230);
      const dome = new THREE.Mesh(new THREE.SphereGeometry(0.24, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), mc); dome.castShadow = true; cap.add(dome);
      const aba = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.035, 24), mc); aba.position.y = 0.01; aba.castShadow = true; cap.add(aba);
      const fr = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.5), P.papel(0xd9a820)); fr.position.y = 0.2; cap.add(fr);
      fr.scale.set(1, 1, 0.9); fr.position.y = 0.21;
    }
    // braços de arame (ombro -> cotovelo -> argolinha da mão)
    const braco = (x, lado) => {
      const omb = P.grupo({ pai: corpo, x, y: 0.78, z: 0.04 });
      const seg = (pai, len) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, len, 10), arame); c.position.y = -len / 2; c.castShadow = true; pai.add(c); const j = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), arame); pai.add(j); };
      seg(omb, 0.3); const cot = P.grupo({ pai: omb, y: -0.3 }); seg(cot, 0.28);
      const mao = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.022, 8, 18), arame); mao.position.y = -0.33; mao.castShadow = true; cot.add(mao);
      return { omb, cot, mao };
    };
    const bracos = [braco(-0.28, 0), braco(0.26, 1)];
    // caixa de papelão carregada
    let cx = null;
    if (o.caixa) {
      cx = P.grupo({ pai: corpo, y: 0.42, z: 0.42 });
      P.caixa(0.62, 0.46, 0.44, { pai: cx, cor: 0xb88654, t: -1, entra: 'fixo', esboco: false });
      P.peca(F.ret(0.64, 0.08, 0.01), { pai: cx, prof: 0.01, cor: 0xd9c7a0, y: 0.1, z: 0.225, t: -1, entra: 'fixo', esboco: false });
      P.peca(F.ret(0.2, 0.12, 0.02), { pai: cx, prof: 0.01, cor: 0xf8f3e8, x: -0.15, y: -0.08, z: 0.225, t: -1, entra: 'fixo', esboco: false });
    }
    const mov = o.mov ? K(o.mov.map(([t, x, z]) => [t, [x, z ?? (o.z || 0)]])) : null;
    const olhar = tr(o.olhar, [0, 0]), palp = tr(o.palp, velho ? 0.42 : 0), sb = tr(o.sobr, velho ? -0.6 : 0.2), bril = tr(o.brilho, 0);
    const caixaV = tr(o.caixa === true ? undefined : o.caixa, 1), vis = tr(o.vis, 1), incl = tr(o.inclina, velho ? -0.07 : 0);
    const poses = o.bracos || [[0, 'repouso']];
    const corPalp = velho ? '#8f8ba3' : '#b4afd6';
    let ultimoX = null;
    function desenhaOlho(ol, lx, ly, pv, ang, br) {
      const c = ol.cv.getContext('2d'), w = 160, h = 160;
      c.fillStyle = br > 0.3 ? '#fffbe8' : '#fbfaf4'; c.fillRect(0, 0, w, h);
      const px = w / 2 + lx * 30, py = h / 2 - ly * 30;
      c.fillStyle = '#141212'; c.beginPath(); c.arc(px, py, 33, 0, 7); c.fill();
      c.fillStyle = '#ffffff'; c.beginPath(); c.arc(px - 11, py - 12, 8, 0, 7); c.fill();
      // pálpebra: desce do topo; bravo = canto de dentro mais baixo, triste = canto de fora mais baixo
      const dentro = ol.lado ? 0 : w; const base = h * pv;
      const yIn = base + h * 0.32 * Math.max(0, ang) - h * 0.12 * Math.max(0, -ang), yOut = base - h * 0.06 * Math.max(0, ang) + h * 0.22 * Math.max(0, -ang);
      if (pv > 0.01 || Math.abs(ang) > 0.05) {
        c.fillStyle = corPalp; c.beginPath(); c.moveTo(0, -2); c.lineTo(w, -2);
        const yR = ol.lado ? yOut : yIn, yL = ol.lado ? yIn : yOut;
        c.lineTo(w, Math.max(-2, yR)); c.lineTo(0, Math.max(-2, yL)); c.closePath(); c.fill();
        c.strokeStyle = 'rgba(30,25,35,0.8)'; c.lineWidth = 5; c.beginPath(); c.moveTo(0, Math.max(-2, yL)); c.lineTo(w, Math.max(-2, yR)); c.stroke();
      }
      c.strokeStyle = 'rgba(40,36,40,0.55)'; c.lineWidth = 6; c.beginPath(); c.arc(w / 2, h / 2, w / 2 - 3, 0, 7); c.stroke();
      ol.tex.needsUpdate = true; ol.mat.emissiveIntensity = br * 0.9;
    }
    const BOCA = o.nome && window.BOCA ? window.BOCA[o.nome] : null;
    P.animar((ts, t) => {
      g.visible = vis(t) > 0.5; if (!g.visible) return;
      let x = o.x || 0, z = o.z || 0, pulo = 0;
      if (mov) { [x, z] = mov(t); const v = Math.hypot(...[mov(t + 0.05)[0] - x, mov(t + 0.05)[1] - z]) / 0.05; pulo = v > 0.05 ? Math.abs(Math.sin(t * 9)) * 0.07 * Math.min(1, v) : 0; }
      const fr = BOCA ? BOCA[Math.min(BOCA.length - 1, Math.max(0, Math.round(t * 30)))] || 0 : 0;
      g.position.set(x, (o.y || 0) + pulo, z); g.scale.setScalar(s);
      const resp = Math.sin(t * 2.1) * 0.012;
      corpo.scale.set(1 - fr * 0.02, 1 + resp + fr * 0.035, 1); corpo.rotation.z = incl(t) + Math.sin(t * 1.3) * 0.015 + fr * 0.03 * Math.sin(t * 8);
      // pose dos braços
      let i = 0; for (let j = 0; j < poses.length; j++) if (poses[j][0] <= t) i = j;
      const [tp, nome, dp] = poses[i], prev = i > 0 ? POSES[poses[i - 1][1]] : POSES[nome]; const kp = i > 0 ? L.sm((t - tp) / (dp || 0.35)) : 1;
      const q = {}; for (const k of CH) { const a = prev[k] ?? 0, b = POSES[nome][k] ?? 0; q[k] = a + (b - a) * kp; }
      if (q.acena) q.aR += Math.sin(t * 9) * 0.35 * q.acena;
      if (fr > 0.05 && nome === 'repouso') { q.aR += 0.5 * fr; q.fR -= 0.6 * fr; q.eR -= 0.6 * fr; }
      bracos[0].omb.rotation.set(q.fL, 0, q.aL); bracos[0].cot.rotation.set(q.eL, 0, 0);
      bracos[1].omb.rotation.set(q.fR, 0, q.aR); bracos[1].cot.rotation.set(q.eR, 0, 0);
      bracos.forEach((b) => { b.mao.rotation.x = -(b.omb.rotation.x + b.cot.rotation.x) + Math.PI / 2 * 0; });
      if (cx) cx.visible = caixaV(t) > 0.5;
      // rosto
      const [lx, ly] = olhar(t); const ang = sb(t); const pisca = ((t + (o.fase || 0)) % 3.6) < 0.1;
      const pv = pisca ? 1 : palp(t);
      const angP = Math.max(-1, Math.min(1, ang));
      olhos.forEach((ol) => desenhaOlho(ol, lx, ly, pv, pisca ? 0 : angP, bril(t)));
      sobr.forEach((gr, k) => { const lado = k ? 1 : -1;
        const sur = Math.max(0, -ang - 1); // -2 = surpreso: sobe tudo
        gr.rotation.z = lado * (ang > 0 ? 0.42 * Math.min(1.2, ang) : 0.3 * Math.max(-1, ang));
        gr.position.y = olhos[k].m.position.y + 0.2 - 0.05 * Math.max(0, ang) + 0.07 * sur + fr * 0.04; });
    });
    g.userData.bracos = bracos;
    return g;
  };
};
