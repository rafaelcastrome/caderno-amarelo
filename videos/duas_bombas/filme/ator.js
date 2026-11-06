// "Cena de filme": boneco de perfil com joelho, cotovelo, pé que pisa firme (IK), boca que mexe com a fala,
// poses com transição suave, ser arremessado, deitar e levantar. Mais props do filme (avião, bomba, explosão).
// Carregado depois do lib.js. window.ATOR(P, L) acrescenta L.ator, L.K e os props.
window.ATOR = (P, L) => {
  const { F, THREE } = P;
  const PELE = 0xe9b98e, CALCA = 0x34343e, CABELO = 0x221c18, BRANCO = 0xf6f1e4;
  const sm = (k) => { k = Math.min(1, Math.max(0, k)); return k * k * (3 - 2 * k); };
  // trilha de keyframes: [[t, valor(número ou lista), 'lin'?], ...] com easing suave
  const K = (ks) => (t) => {
    if (t <= ks[0][0]) return ks[0][1];
    for (let i = 1; i < ks.length; i++) if (t <= ks[i][0]) {
      const [t0, v0] = ks[i - 1], [t1, v1, e] = ks[i]; let k = (t - t0) / (t1 - t0); k = e === 'lin' ? k : sm(k);
      return Array.isArray(v0) ? v0.map((a, j) => a + (v1[j] - a) * k) : v0 + (v1 - v0) * k;
    }
    return ks[ks.length - 1][1];
  };
  L.K = K; L.sm = sm;
  const escuro = (c, f = 0.8) => new THREE.Color(c).multiplyScalar(f).getHex();

  // poses (ângulos em radianos; ombro/cotovelo positivos = pra frente; cabeça positiva = olha pra cima)
  const POSES = {
    normal: {},
    sentado: { hipY: 0.66, tN: 1.5, kN: -1.45, tF: 1.4, kF: -1.4, pN: 0, pF: 0, lean: 0.1 },
    desenha: { sN: 1.0, eN: 0.95, osc: 1, head: -0.18 },
    levanta_lapis: { sN: 0.7, eN: 1.5, head: 0.15 },
    bracos_cima: { sN: 2.75, eN: 0.35, sF: 2.55, eF: 0.4, head: 0.25 },
    mao_cabeca: { sN: 2.3, eN: 2.25, head: -0.2, lean: 0.06 },
    bolsos: { sN: -0.15, eN: 0.9, sF: -0.1, eF: 0.8, head: -0.35, bolso: 1 },
    aponta: { sN: 1.5, eN: 0.05 },
    aponta_cima: { sN: 2.45, eN: 0.05, head: 0.55, lean: -0.08 },
    olha_cima: { head: 0.55, lean: -0.1, sN: 0.2, eN: 0.3 },
    protege: { sN: 1.9, eN: 2.3, sF: 1.75, eF: 2.2, head: -0.3, lean: 0.2 },
    voando: { sN: 2.9, eN: 0.6, sF: -2.4, eF: 0.8, tN: 0.9, kN: -1.2, tF: -0.5, kF: -0.4, pN: 0, pF: 0, head: -0.4, flail: 1 },
    deitado: { rot: 1.52, ly: -0.98, tN: 0.25, kN: -0.5, tF: 0.05, kF: -0.15, pN: 0, pF: 0, sN: 2.7, eN: 0.5, sF: 3.0, eF: 0.3, head: 0.15, olhosF: 1 },
    deitado_mexe: { rot: 1.45, ly: -0.98, tN: 0.6, kN: -1.0, tF: 0.1, kF: -0.3, pN: 0, pF: 0, sN: 1.8, eN: 1.0, sF: 2.8, eF: 0.4, head: 0.35, lean: 0.15 },
    ajoelhado: { hipY: 0.6, tN: 1.45, kN: -1.5, tF: -0.2, kF: -1.35, pN: 0, pF: 0, lean: 0.42, sN: 0.7, eN: 0.5, sF: 0.2, eF: 0.6, head: -0.1 },
    curvado: { lean: 0.32, sN: 0.45, eN: 0.9, sF: -0.1, eF: 1.2, head: -0.05 },
    sentado_chao: { hipY: 0.24, tN: 1.25, kN: -2.45, tF: 1.15, kF: -2.35, pN: 0.3, pF: 0.3, lean: 0.35, sN: 1.05, eN: 1.55, sF: 0.95, eF: 1.5, head: -0.35 },
    abre_bracos: { sN: 1.35, eN: 0.25, sF: 1.15, eF: 0.35, head: 0.1 },
    mao_orelha: { sN: 2.0, eN: 2.55, head: -0.15, lean: 0.05 },
    apoia: { sN: 1.25, eN: 0.6 },
    ferido: { lean: 0.14, head: -0.12, sF: 0.1, eF: 1.4 },
  };
  const CH = ['lean', 'head', 'sN', 'eN', 'sF', 'eF', 'hipY', 'tN', 'kN', 'tF', 'kF', 'pN', 'pF', 'rot', 'ly', 'osc', 'bolso', 'flail', 'olhosF'];
  const pega = (nome) => (typeof nome === 'string' ? nome.split('+').reduce((a, n) => Object.assign(a, POSES[n]), {}) : nome);

  // o: x, z, s, t (entrada; -1 = já está lá), nome (pra boca), dir (1 olha pra direita, -1 esquerda),
  //    mov [[t, x, z?], ...], dirs [[t, ±1], ...], poses [[t, 'pose', durTransição], ...], voo {t0, t1, dx, h, giro},
  //    roupa, chapeu, mala ([[t, 0|1]] visível na mão), band, D (duração da cena)
  L.ator = (o = {}) => {
    const g = P.grupo({ x: o.x || 0, z: o.z || 0, pai: o.pai }); const s = o.s ?? 1;
    const t0 = o.t ?? -1, fixo = t0 < 0; const T = (dt) => fixo ? 0 : t0 + dt;
    const op = (dt, extra = {}) => Object.assign({ t: T(dt), entra: fixo ? 'fixo' : (extra.entra || 'pop'), esboco: !fixo }, extra);
    const roupa = o.roupa ?? BRANCO, calca = o.calca ?? CALCA;
    const giro = P.grupo({ pai: g, y: 1.2 }); const base = P.grupo({ pai: giro, y: -1.2 });
    const pelve = P.grupo({ pai: base, y: 1.0 });
    // pernas: coxa -> canela -> pé (grupo por articulação)
    const perna = (lado) => {
      const z = lado ? -0.07 : 0.07, f = lado ? 0.8 : 1;
      const coxa = P.grupo({ pai: pelve, z });
      P.peca(F.ret(0.2, 0.56, 0.06), { pai: coxa, prof: 0.06, cor: escuro(calca, f), y: -0.25, ...op(0.05 + lado * 0.04) });
      const joelho = P.grupo({ pai: coxa, y: -0.5 });
      P.peca(F.ret(0.17, 0.56, 0.06), { pai: joelho, prof: 0.06, cor: escuro(calca, f), y: -0.25, ...op(0.08 + lado * 0.04) });
      const tor = P.grupo({ pai: joelho, y: -0.5 });
      P.peca(F.poligono([[-0.09, 0.04], [0.08, 0.04], [0.26, -0.02], [0.26, -0.08], [-0.1, -0.08]]), { pai: tor, prof: 0.07, cor: escuro(0x231c17, f), ...op(0.1 + lado * 0.04) });
      return { coxa, joelho, tor };
    };
    const pernas = [perna(0), perna(1)];
    const tronco = P.grupo({ pai: pelve });
    P.peca(F.poligono([[-0.17, -0.05], [0.16, -0.05], [0.2, 0.45], [0.17, 0.82], [0.05, 0.9], [-0.14, 0.9], [-0.21, 0.6]]), { pai: tronco, prof: 0.12, cor: roupa, ...op(0.15) });
    if (o.terno) P.peca(F.poligono([[0.1, 0.88], [0.19, 0.8], [0.14, 0.45]]), { pai: tronco, prof: 0.02, cor: BRANCO, z: 0.065, ...op(0.2) });
    P.peca(F.ret(0.38, 0.09, 0.03), { pai: tronco, prof: 0.125, cor: escuro(calca, 0.7), y: 0.0, ...op(0.18) }); // cinto
    // braços: ombro -> cotovelo -> mão
    const braco = (lado) => {
      const z = lado ? -0.09 : 0.09, f = lado ? 0.8 : 1;
      const omb = P.grupo({ pai: tronco, x: 0.0, y: 0.78, z });
      P.peca(F.ret(0.15, 0.46, 0.06), { pai: omb, prof: 0.05, cor: escuro(roupa, f), y: -0.2, ...op(0.22 + lado * 0.04) });
      const cot = P.grupo({ pai: omb, y: -0.4 });
      P.peca(F.ret(0.13, 0.42, 0.05), { pai: cot, prof: 0.05, cor: escuro(o.manga === false ? PELE : roupa, f), y: -0.18, ...op(0.25 + lado * 0.04) });
      const mao = P.grupo({ pai: cot, y: -0.4 });
      P.peca(F.circulo(0.075), { pai: mao, prof: 0.05, cor: escuro(PELE, f), ...op(0.28 + lado * 0.04) });
      return { omb, cot, mao };
    };
    const bracos = [braco(0), braco(1)];
    if (o.band) P.peca(F.ret(0.17, 0.22, 0.03), { pai: bracos[0].omb, prof: 0.06, cor: BRANCO, y: -0.2, z: 0.01, ...op(0.5) });
    // cabeça de perfil (olhando pra +x)
    const pesc = P.grupo({ pai: tronco, x: 0.02, y: 0.86 });
    P.peca(F.ret(0.12, 0.14, 0.03), { pai: pesc, prof: 0.06, cor: PELE, y: 0.05, ...op(0.3) });
    const cab = P.grupo({ pai: pesc, y: 0.1 });
    P.peca(F.circulo(0.27), { pai: cab, prof: 0.08, cor: o.pele ?? PELE, x: 0.03, y: 0.24, ...op(0.32) });
    P.peca(F.poligono([[0.27, 0.3], [0.37, 0.2], [0.27, 0.17]]), { pai: cab, prof: 0.06, cor: o.pele ?? PELE, ...op(0.34) }); // nariz
    P.peca(F.poligono([[0.18, 0.04], [0.26, 0.06], [0.28, 0.12], [0.1, 0.1]]), { pai: cab, prof: 0.07, cor: o.pele ?? PELE, ...op(0.34) }); // queixo
    P.peca(F.arco(0.29, 0, Math.PI * 0.42, Math.PI * 1.22), { pai: cab, prof: 0.1, cor: o.cabelo ?? CABELO, x: 0.03, y: 0.25, z: 0.005, ...op(0.38) });
    P.peca(F.circulo(0.065), { pai: cab, prof: 0.02, cor: escuro(PELE, 0.92), x: -0.03, y: 0.22, z: 0.06, ...op(0.4, { esboco: false }) }); // orelha
    const olho = P.peca(F.circulo(0.032), { pai: cab, prof: 0.02, cor: 0x231c17, x: 0.17, y: 0.3, z: 0.05, ...op(0.42, { esboco: false }) });
    const sob = P.peca(F.ret(0.1, 0.025, 0.01), { pai: cab, prof: 0.02, cor: o.cabelo ?? CABELO, x: 0.17, y: 0.38, z: 0.05, ...op(0.42, { esboco: false }) });
    const boca = P.peca(F.elipse ? F.elipse(0.045, 0.03) : F.circulo(0.035), { pai: cab, prof: 0.02, cor: 0x7a2a24, x: 0.22, y: 0.12, z: 0.05, ...op(0.44, { esboco: false }) });
    if (o.chapeu) {
      P.peca(F.ret(0.78, 0.06, 0.03), { pai: cab, prof: 0.1, cor: o.chapeu, x: 0.04, y: 0.44, z: 0.02, rz: -0.06, ...op(0.46) });
      P.peca(F.poligono([[-0.22, 0], [0.26, 0], [0.22, 0.24], [-0.18, 0.26]]), { pai: cab, prof: 0.1, cor: o.chapeu, x: 0.02, y: 0.45, z: 0.01, ...op(0.48) });
      P.peca(F.ret(0.46, 0.05, 0.02), { pai: cab, prof: 0.105, cor: 0x2b2622, x: 0.04, y: 0.5, z: 0.02, ...op(0.5, { esboco: false }) });
    }
    if (o.band) {
      P.peca(F.ret(0.6, 0.12, 0.03), { pai: cab, prof: 0.11, cor: BRANCO, x: 0.02, y: 0.4, z: 0.02, rz: -0.15, ...op(0.55) });
      P.peca(F.ret(0.16, 0.18, 0.03), { pai: cab, prof: 0.02, cor: BRANCO, x: 0.1, y: 0.18, z: 0.06, ...op(0.56) });
    }
    // mala na mão da frente (fica sempre pendurada na vertical)
    let mala = null;
    if (o.mala) {
      mala = P.grupo({ pai: bracos[1].mao, z: 0.05 });
      P.peca(F.ret(0.5, 0.36, 0.04), { pai: mala, prof: 0.16, cor: o.corMala ?? 0x8a5a34, y: -0.24, ...op(0.5) });
      P.peca(F.ret(0.5, 0.05, 0.02), { pai: mala, prof: 0.17, cor: 0x5a3a22, y: -0.18, ...op(0.55, { esboco: false }) });
      P.peca(F.anel(0.07, 0.045), { pai: mala, prof: 0.03, cor: 0x3a2a1a, y: -0.04, ...op(0.55, { esboco: false }) });
    }
    const malaVis = o.mala ? (Array.isArray(o.mala) ? K(o.mala) : () => 1) : () => 0;

    // trilhas
    const D = o.D ?? 30, mov = o.mov ? K(o.mov.map(([t, x, z]) => [t, [x, z ?? (o.z || 0)]])) : () => [o.x || 0, o.z || 0];
    // distância percorrida (pra fase do passo bater com o chão: pé não escorrega)
    const passo = 1 / 120, dist = [0]; let ant = mov(0);
    for (let t = passo; t <= D + 0.5; t += passo) { const p = mov(t); dist.push(dist[dist.length - 1] + Math.hypot(p[0] - ant[0], p[1] - ant[1])); ant = p; }
    const distEm = (t) => dist[Math.min(dist.length - 1, Math.max(0, Math.round(t / passo)))];
    const dirs = o.dirs || [[0, o.dir ?? 1]];
    const dirEm = (t) => { let d = dirs[0][1], tt = -9, dAnt = d; for (const [tk, v] of dirs) if (tk <= t) { dAnt = d; d = v; tt = tk; } const k = sm((t - tt) / 0.22); return dAnt + (d - dAnt) * k; };
    const poses = (o.poses || [[0, 'normal']]).map(([t, n, dur]) => [t, pega(n), dur ?? 0.35]);
    const voo = o.voo;
    const BOCA = (window.BOCA || {})[o.nome] || null;
    const fase0 = (o.x || 0) * 1.7;
    const S = 1.0; // passada (um ciclo = dois passos)

    P.animar((ts, t) => {
      // posição e andar
      const p = mov(t), pa = mov(Math.max(0, t - 0.05)), pb = mov(t + 0.05);
      const v = Math.hypot(pb[0] - pa[0], pb[1] - pa[1]) / 0.1, w = sm(v / 0.35);
      const c = distEm(t) / S + 0.15;
      // pose (mistura da anterior com a atual)
      let i = 0; for (let j = 0; j < poses.length; j++) if (poses[j][0] <= t) i = j;
      const [tp, cur, dp] = poses[i], prev = i > 0 ? poses[i - 1][1] : {}; const kp = i > 0 ? sm((t - tp) / dp) : 1;
      // automático (de pé / andando)
      const pes = [0, 1].map((lado) => {
        const u = ((c + lado * 0.5) % 1 + 1) % 1; let fx, fy, rp = 0;
        if (u < 0.6) { fx = 0.3 * S - (u / 0.6) * 0.6 * S; fy = 0; rp = -0.4 * sm((u - 0.42) / 0.18); }
        else { const q = (u - 0.6) / 0.4; fx = -0.3 * S + 0.6 * S * sm(q); fy = 0.1 * Math.sin(Math.PI * q); rp = -0.4 * (1 - sm(q * 3)) + 0.25 * sm((q - 0.7) / 0.3); }
        const st = lado ? [-0.06, 0] : [0.08, 0];
        return [st[0] + (fx - st[0]) * w, fy * w, rp * w];
      });
      const auto = {
        lean: 0.07 * w, head: 0.03 * Math.sin(ts * 1.2 + fase0) - 0.04 * w,
        sN: 0.06 + (-0.38 * Math.cos(2 * Math.PI * c)) * w + 0.03 * Math.sin(ts * 1.7 + fase0), eN: 0.18 + 0.25 * w * (1 - Math.cos(2 * Math.PI * c)) / 2,
        sF: -0.02 + (0.38 * Math.cos(2 * Math.PI * c)) * w, eF: 0.18 + 0.25 * w * (1 + Math.cos(2 * Math.PI * c)) / 2,
        hipY: 1.06 - w * (0.02 - 0.02 * Math.cos(4 * Math.PI * (c - 0.3))) + 0.006 * Math.sin(ts * 2.2 + fase0),
        rot: 0, ly: 0, osc: 0, bolso: 0, flail: 0, olhosF: 0,
      };
      // IK das pernas no modo automático
      const ik = (fx, fy) => { const dx = fx, dy = fy + 0.08 - auto.hipY; let d = Math.min(0.995, Math.hypot(dx, dy)); const b = Math.atan2(dx, -dy), a = Math.acos(d); return [b + a, -2 * a]; };
      const [tN, kN] = ik(pes[0][0], pes[0][1]), [tF, kF] = ik(pes[1][0], pes[1][1]);
      Object.assign(auto, { tN, kN, tF, kF, pN: pes[0][2], pF: pes[1][2] });
      const q = {};
      for (const k of CH) { const a = prev[k] ?? auto[k], b = cur[k] ?? auto[k]; q[k] = a + (b - a) * kp; }
      // fala: boca pela amplitude do áudio + mão gesticulando
      const fr = BOCA ? BOCA[Math.min(BOCA.length - 1, Math.max(0, Math.round(t * 30)))] || 0 : 0;
      boca.children[0].scale.set(1 + fr * 0.2, 0.35 + fr * 1.9, 1);
      if (fr > 0.05 && !cur.sN && o.gesticula !== false) { q.sN += 0.35 * fr + 0.15 * Math.sin(t * 4.2); q.eN += 0.5 * fr; q.head += 0.06 * Math.sin(t * 7) * fr; }
      if (q.osc) { q.eN += 0.22 * q.osc * Math.sin(t * 13); q.sN += 0.08 * q.osc * Math.sin(t * 6.5); }
      if (q.bolso) { q.eN += 0.25 * q.bolso * Math.sin(t * 16); q.eF += 0.25 * q.bolso * Math.sin(t * 16 + 2); }
      if (q.flail) { q.sN += 0.6 * q.flail * Math.sin(t * 17); q.sF += 0.6 * q.flail * Math.sin(t * 15 + 1); q.kN -= 0.4 * q.flail * Math.abs(Math.sin(t * 13)); q.head += 0.3 * q.flail * Math.sin(t * 11); }
      // aplica
      let x = p[0], y = 0, rot = q.rot;
      if (voo && t > voo.t0) { const k = Math.min(1, (t - voo.t0) / (voo.t1 - voo.t0)); const e = 1 - Math.pow(1 - k, 1.6);
        x += voo.dx * e; y += (voo.h ?? 1) * 4 * k * (1 - k); rot += (voo.giro ?? 0) * sm(k); if (k >= 1) { const b = t - voo.t1; y += Math.abs(Math.sin(b * 9)) * 0.12 * Math.exp(-b * 5); } }
      const dir = dirEm(t);
      g.position.set(x, o.y || 0, p[1]); g.scale.set(s * (Math.abs(dir) < 0.05 ? 0.05 * Math.sign(dir || 1) : dir), s, s);
      giro.rotation.z = rot; giro.position.y = 1.2 + q.ly + y;
      pelve.position.y = q.hipY; tronco.rotation.z = -q.lean;
      pernas[0].coxa.rotation.z = q.tN; pernas[0].joelho.rotation.z = q.kN; pernas[0].tor.rotation.z = -(q.tN + q.kN) + q.pN;
      pernas[1].coxa.rotation.z = q.tF; pernas[1].joelho.rotation.z = q.kF; pernas[1].tor.rotation.z = -(q.tF + q.kF) + q.pF;
      bracos[0].omb.rotation.z = q.sN; bracos[0].cot.rotation.z = q.eN; bracos[1].omb.rotation.z = q.sF; bracos[1].cot.rotation.z = q.eF;
      pesc.rotation.z = q.lean * 0.5; cab.rotation.z = q.head;
      if (mala) { mala.rotation.z = -(rot - q.lean + q.sF + q.eF); mala.visible = malaVis(t) > 0.5; }
      const pis = ((t + fase0 * 0.3) % 3.3) < 0.11 || q.olhosF > 0.5; olho.children[0].scale.y = pis ? 0.15 : 1;
      sob.children[0].rotation.z = fr * 0.1;
    });
    g.userData.cab = cab;
    return g;
  };

  // ------------------------------- props do filme -------------------------------
  // céu de papel atrás de tudo (painel em pé)
  L.fundoCeu = (o = {}) => P.peca(F.ret(o.w ?? 10, o.h ?? 6, 0.04), { prof: 0.03, cor: o.cor ?? 0xbcd9ec, y: o.y ?? 2.6, z: o.z ?? -3.3, t: 0, entra: 'fixo', esboco: false });
  // véu colorido na frente da câmera (tinta da cena: poeira, entardecer)
  L.veu = (cor, opF) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshBasicMaterial({ color: cor, transparent: true, opacity: 0, depthTest: false }));
    m.renderOrder = 997; P.fg.add(m);
    P.animar((ts, t) => { m.material.opacity = typeof opF === 'function' ? opF(t) : opF; const d = new THREE.Vector3(); P.cam.getWorldDirection(d); m.position.copy(P.cam.position).addScaledVector(d, 1.3); m.quaternion.copy(P.cam.quaternion); });
    return m;
  };
  // B-29 de perfil (bico pra +x), hélices girando; mov(t) -> [x, y]
  L.b29 = (o = {}) => {
    const g = P.grupo({ x: o.x || 0, y: o.y ?? 4, z: o.z ?? -1.5 }); g.scale.setScalar(o.s ?? 0.6); const t = o.t ?? 0;
    const prata = 0xc3c8cf;
    P.peca(F.poligono([[-1.9, 0.02], [1.2, 0.0], [1.55, 0.08], [1.68, 0.2], [1.6, 0.32], [1.25, 0.38], [-1.5, 0.36], [-1.95, 0.9], [-2.2, 0.92], [-2.15, 0.3]]), { pai: g, prof: 0.1, cor: prata, t, entra: 'fixo', esboco: false });
    P.peca(F.poligono([[1.25, 0.37], [1.6, 0.32], [1.66, 0.2], [1.3, 0.22]]), { pai: g, prof: 0.11, cor: 0x6f8fa8, t, entra: 'fixo', esboco: false });
    P.peca(F.poligono([[-0.5, 0.18], [0.5, 0.18], [0.35, 0.1], [-0.6, 0.1]]), { pai: g, prof: 0.12, cor: 0x9aa0a8, z: 0.06, t, entra: 'fixo', esboco: false });
    P.peca(F.poligono([[-2.15, 0.35], [-1.6, 0.35], [-1.7, 0.28], [-2.2, 0.27]]), { pai: g, prof: 0.12, cor: 0x9aa0a8, z: 0.06, t, entra: 'fixo', esboco: false });
    const helices = [];
    [[-0.25, 0.08], [0.25, 0.1]].forEach(([x, z]) => {
      P.peca(F.ret(0.42, 0.12, 0.03), { pai: g, prof: 0.08, cor: 0x8d939b, x: x + 0.1, y: 0.08, z: z + 0.04, t, entra: 'fixo', esboco: false });
      helices.push(P.peca(F.ret(0.04, 0.5, 0.01), { pai: g, prof: 0.01, cor: 0x3a3330, x: x + 0.34, y: 0.08, z: z + 0.08, t, entra: 'fixo', esboco: false }));
    });
    P.animar((ts, tt) => { helices.forEach((h, i) => h.children[0].scale.y = Math.cos(tt * 40 + i)); if (o.mov) { const [x, y] = o.mov(tt); g.position.x = x; g.position.y = y; } g.rotation.z = Math.sin(tt * 0.8) * 0.015; });
    return g;
  };
  // bomba (Little Boy de perfil): solta em tSolta da posição do avião, cai girando pro bico
  L.bomba = (o = {}) => {
    const g = P.grupo({ x: o.x || 0, y: o.y ?? 4, z: o.z ?? -1.4 }); g.scale.setScalar(o.s ?? 0.5);
    const p = P.grupo({ pai: g });
    P.peca(F.poligono([[-0.55, -0.14], [0.35, -0.15], [0.5, -0.09], [0.55, 0], [0.5, 0.09], [0.35, 0.15], [-0.55, 0.14]]), { pai: p, prof: 0.28, cor: 0x4a5a52, t: 0, entra: 'fixo', esboco: false });
    P.peca(F.poligono([[-0.55, -0.2], [-0.85, -0.22], [-0.85, 0.22], [-0.55, 0.2]]), { pai: p, prof: 0.3, cor: 0x3a463f, t: 0, entra: 'fixo', esboco: false });
    P.peca(F.ret(0.06, 0.32, 0.01), { pai: p, prof: 0.29, cor: 0x9a3a2a, x: 0.1, t: 0, entra: 'fixo', esboco: false });
    const traj = o.traj; // (t) -> [x, y, rot, visível]
    P.animar((ts, t) => { const [x, y, r, vis] = traj(t); g.position.x = x; g.position.y = y; p.rotation.z = r; g.visible = vis; });
    return g;
  };
  // poeira/onda de choque varrendo da direita pra esquerda a partir de tChoque
  L.ondaChoque = (o = {}) => {
    const r = P.fixo(o.semente ?? 77), bolas = [];
    for (let i = 0; i < 18; i++) bolas.push([P.peca(F.nuvem(1.0 + r() * 0.8, 0.6 + r() * 0.3), { prof: 0.05, cor: [0xcdb79a, 0xb09a7e, 0xe0d0b4][i % 3], x: 9, y: 0.3 + r() * 1.6, z: -1.6 + (i % 6) * 0.55, t: 0, entra: 'fixo', esboco: false }), r()]);
    const v = o.v ?? 6.5, x0 = o.x0 ?? 4;
    P.animar((ts, t) => bolas.forEach(([b, rr], i) => { const k = t - o.t - rr * 0.25; b.visible = k > 0; b.position.x = x0 - k * v * (0.8 + rr * 0.4); b.scale.setScalar(0.6 + Math.min(1.4, k * 1.2)); b.children[0].rotation.z = k * (1 + rr); }));
  };
  // destroços voando (pedacinhos de papel) a partir de t, na direção dx
  L.destrocos = (o = {}) => {
    const r = P.fixo(o.semente ?? 21), bits = [];
    for (let i = 0; i < (o.n ?? 22); i++) bits.push([P.peca(F.poligono([[0, 0], [0.16 + r() * 0.16, 0.02], [0.06, 0.14 + r() * 0.12]]), { prof: 0.02, cor: [0x9a948a, 0x6b5a48, 0xd9c9a6, 0x5a3a2c][i % 4], x: 0, y: 0, z: 0, t: 0, entra: 'fixo', esboco: false }), r(), r(), r()]);
    P.animar((ts, t) => bits.forEach(([b, a, c, d], i) => { const k = t - o.t - a * 0.3; b.visible = k > 0 && k < 3; if (!b.visible) return;
      b.position.set((o.x ?? 3) - k * (4 + c * 4), (o.y ?? 0.3) + d * 2 + k * (1.5 + a) - 2.2 * k * k, (o.z ?? 0) + (c - 0.5) * 2.4); b.children[0].rotation.set(k * 3 * a, k * 4, k * (6 + i)); }));
  };
  // bola de fogo crescendo + clarão
  L.boladefogo = (o = {}) => {
    const g = P.grupo({ x: o.x || 0, y: o.y ?? 1.0, z: o.z ?? -2.6 });
    const a = P.peca(F.circulo(1.0), { pai: g, prof: 0.05, cor: 0xf08a2a, t: 0, entra: 'fixo', esboco: false });
    const b = P.peca(F.circulo(0.8), { pai: g, prof: 0.05, cor: 0xffc84a, z: 0.06, t: 0, entra: 'fixo', esboco: false });
    const c = P.peca(F.circulo(0.5), { pai: g, prof: 0.05, cor: 0xfff4c8, z: 0.12, t: 0, entra: 'fixo', esboco: false });
    P.animar((ts, t) => { const k = t - o.t; g.visible = k > 0 && k < (o.dur ?? 4); const e = Math.min(1, k / 0.6); const s = (o.s ?? 1.4) * (1 - Math.pow(1 - e, 3));
      a.children[0].scale.setScalar(Math.max(0.01, s * (1 + Math.sin(t * 9) * 0.04))); b.children[0].scale.setScalar(Math.max(0.01, s * (1 - Math.min(0.5, k * 0.15)))); c.children[0].scale.setScalar(Math.max(0.01, s * Math.max(0, 1 - k * 0.4))); g.position.y = (o.y ?? 1.0) + Math.max(0, k - 0.8) * 0.5; });
    return g;
  };
  // tremor de câmera: picos [[t, força, duração]]
  L.tremor = (picos) => { P.camOff = (t) => { let a = 0; for (const [t0, f, d] of picos) if (t > t0 && t < t0 + d) a += f * (1 - (t - t0) / d); return [Math.sin(t * 53) * a, Math.sin(t * 61 + 1) * a * 0.8, 0]; }; };
};
