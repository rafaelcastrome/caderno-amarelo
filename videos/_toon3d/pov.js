// Primeira pessoa: câmera na cabeça + corpo (braços de moletom, mãos bem feitas) + celular.
// T.pov({manga, pele, x,y,z}) -> V; V.olhar(yaw, pitch, roll); V.cel (grupo do celular, filho do corpo);
// V.celTela(estado, t) redesenha a tela; V.dedo(u 0..1, alvo) leva o indicador direito até a tela.
(function () {
  const T = window.T, V3 = THREE.Vector3;
  T.pov = (o = {}) => {
    const manga = o.manga || '#2f8f4e', pele = o.pele || '#f1c6a2', punho = o.punho || '#277a42';
    const V = {};
    const corpo = V.corpo = T.grupo(null, o.x || 0, o.y || 1.15, o.z || 0); // na altura do olho; gira só no yaw
    corpo.rotation.order = 'YXZ';
    V.olhar = (yaw, pitch, roll = 0) => {
      corpo.rotation.y = yaw;
      T.cam.position.copy(corpo.position);
      T.cam.rotation.set(pitch, yaw, roll);
    };
    // ---------- celular ----------
    const PW = 0.074, PH = 0.152, PD = 0.009;
    const cel = V.cel = T.grupo(corpo, 0, -0.2, -0.33);
    const caixa = T.caixa(PW, PH, PD, '#22252b', cel, { w: 0.0035 });
    const tela = T.tela(PW - 0.007, PH - 0.012, 380, () => {}, cel); tela.position.z = PD / 2 + 0.0004;
    const cam = T.esfera(0.003, '#000', cel, { sem: true }); cam.position.set(0, PH / 2 - 0.004, PD / 2 + 0.001);
    V.PW = PW; V.PH = PH;
    let ultimo = '';
    V.celTela = (estado, t) => {
      const chave = estado + Math.floor(t * 15);
      if (chave === ultimo) return; ultimo = chave;
      tela.userData.f((c, w, h) => desenhaTela(c, w, h, estado, t)); tela.userData.redesenha();
    };
    // botões na tela (coordenadas locais do celular)
    V.botaoVerde = new V3(0.0168, -0.046, PD / 2 + 0.002);
    V.botaoVermelho = new V3(-0.0168, -0.046, PD / 2 + 0.002);

    // ---------- braço genérico (manga + antebraço) ----------
    const L1 = 0.3, L2 = 0.29;
    const braco = (sx) => {
      const ombro = T.grupo(corpo, 0.2 * sx, -0.3, 0.08);
      const sup = T.capsula(0.058, L1 - 0.05, manga, ombro); sup.position.y = -L1 / 2;
      const cot = T.grupo(ombro, 0, -L1, 0);
      const inf = T.capsula(0.052, L2 - 0.06, manga, cot); inf.position.y = -L2 / 2 + 0.01;
      const cuff = T.cilindro(0.05, 0.05, 0.035, punho, cot); cuff.position.y = -L2 + 0.03;
      return { ombro, cot, sx };
    };
    V.bE = braco(-1); V.bD = braco(1);
    // pernas sentado (jeans + meia), seguem o tronco
    if (o.empe) {
      const alt = o.y || 1.62;
      for (const sx of [-1, 1]) {
        const perna = T.capsula(0.075, 0.7, o.jeans || '#3b5a8c', corpo); perna.position.set(0.11 * sx, -alt + 0.5, 0.02);
        const tn = T.esfera(0.075, '#f2f2f2', corpo); tn.scale.set(0.85, 0.55, 1.5); tn.position.set(0.11 * sx, -alt + 0.05, -0.04);
        const tn2 = T.esfera(0.05, '#2f8f4e', corpo); tn2.scale.set(1, 0.6, 1.3); tn2.position.set(0.11 * sx, -alt + 0.085, -0.06);
      }
    }
    if (o.sentado) {
      const jeans = o.jeans || '#3b5a8c', alt = o.y || 1.12;
      for (const sx of [-1, 1]) {
        const coxa = T.capsula(0.078, 0.42, jeans, corpo); coxa.rotation.x = Math.PI / 2 - 0.08; coxa.position.set(0.11 * sx, -alt + 0.56, -0.26);
        const canela = T.capsula(0.065, 0.36, jeans, corpo); canela.position.set(0.12 * sx, -alt + 0.3, -0.5);
        const meia = T.capsula(0.05, 0.12, '#f4f4f0', corpo); meia.rotation.x = Math.PI / 2; meia.position.set(0.12 * sx, -alt + 0.05, -0.56); meia.scale.set(1.05, 1, 0.75);
      }
    }

    // ---------- mão esquerda segurando o celular: palma atrás, dedos dão a volta na borda direita, polegar na frente da borda esquerda ----------
    const AJ = V.ajE = Object.assign({ x: -0.016, y: -0.025, z: -0.0185, inc: 0.4,
      dedos: [[0.3, 1.5, 0.25], [0.3, 1.55, 0.25], [0.3, 1.55, 0.25], [0.35, 1.5, 0.25]], pol: [0.55, 0.7, 0.22, 0.12] }, o.ajE || {});
    const mE = V.maoE = T.mao({ pele, sx: -1, pai: cel });
    const posE = () => {
      mE.g.position.set(AJ.x, AJ.y, AJ.z);
      T.orientaMao(mE, new V3(1, AJ.inc, 0), new V3(0, 0, -1));
      mE.pose({ dedos: AJ.dedos, abre: 0.03, pol: AJ.pol });
    };
    posE(); V.posE = posE;
    // ---------- mão direita apontando ----------
    const mD = T.mao({ pele, sx: 1, pai: corpo });
    mD.pose({ dedos: [[0.08, 0.12, 0.08], [1.45, 1.55, 0.9], [1.5, 1.55, 0.9], [1.5, 1.5, 0.85]], abre: 0.02, pol: [0.35, 1.05, 0.55, 0.35] });
    V.maoD = mD.g;
    // atualiza braços (chamar depois de posicionar cel e maoD)
    V.bracos = () => {
      corpo.updateMatrixWorld(true);
      const pE = mE.pulso.getWorldPosition(new V3()); corpo.worldToLocal(pE);
      T.ik2(V.bE.ombro, V.bE.cot, L1, L2, pE, new V3(-1, -0.6, 0.2));
      const pD = mD.pulso.getWorldPosition(new V3()); corpo.worldToLocal(pD);
      T.ik2(V.bD.ombro, V.bD.cot, L1, L2, pD, new V3(1, -0.6, 0.2));
      V.bD.ombro.visible = mD.g.visible;
    };
    // leva a mão direita: u=0 descansando (fora de quadro), u=1 com a ponta do dedo no ponto 'alvo' (local do celular)
    V.dedo = (u, alvoCel, toque = 0) => {
      corpo.updateMatrixWorld(true);
      const alvo = cel.localToWorld(alvoCel.clone().add(new V3(0, 0, 0.004 + 0.012 * (1 - toque)))); corpo.worldToLocal(alvo);
      const desc = new V3(0.2, -0.5, -0.22);
      const perto = alvo.clone().add(new V3(0.05, -0.06, 0.06));
      const pos = desc.clone().lerp(perto, T.suave(u));
      mD.g.position.copy(pos);
      const alvoW = cel.localToWorld(alvoCel.clone()); corpo.worldToLocal(alvoW);
      const dir = alvoW.clone().sub(pos).normalize();
      const dorso = pos.clone().multiplyScalar(-1).normalize().add(new V3(0.3, 0, 0));
      T.orientaMao(mD, dir, dorso);
      if (u > 0) {
        mD.g.updateMatrixWorld(true);
        const ponta = mD.ponta.getWorldPosition(new V3()); corpo.worldToLocal(ponta);
        mD.g.position.add(alvo.clone().sub(ponta).multiplyScalar(T.suave(u)));
      }
      mD.g.visible = u > 0.001;
    };
    return V;
  };

  // ---------- tela do celular ----------
  function desenhaTela(c, w, h, estado, t) {
    const g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#2b3a55'); g.addColorStop(1, '#141a28'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.fillStyle = '#fff'; c.font = 'bold 20px sans-serif'; c.textAlign = 'left'; c.fillText('6:52', 22, 34);
    c.textAlign = 'right'; c.fillText('▮▮▮ 78%', w - 20, 34);
    c.textAlign = 'center';
    if (estado === 'apagada') { c.fillStyle = '#0a0c10'; c.fillRect(0, 0, w, h); return; }
    if (estado === 'hora') {
      c.fillStyle = '#fff'; c.font = 'bold 130px sans-serif'; c.fillText('6:59', w / 2, h * 0.33);
      c.font = '28px sans-serif'; c.fillStyle = '#c9d6ea'; c.fillText('segunda-feira', w / 2, h * 0.39);
      return;
    }
    if (estado === 'msg') {
      c.fillStyle = '#fff'; c.font = 'bold 110px sans-serif'; c.fillText('6:58', w / 2, h * 0.22);
      const y = h * 0.3; c.fillStyle = 'rgba(235,240,248,0.95)'; c.beginPath(); c.roundRect(24, y, w - 48, 200, 26); c.fill();
      c.fillStyle = '#9fb6d8'; c.beginPath(); c.arc(70, y + 50, 28, 0, 7); c.fill();
      c.fillStyle = '#e9b48c'; c.beginPath(); c.arc(70, y + 44, 11, 0, 7); c.fill(); c.fillStyle = '#2f8f4e'; c.beginPath(); c.arc(70, y + 68, 17, Math.PI, 0); c.fill();
      c.textAlign = 'left'; c.fillStyle = '#111'; c.font = 'bold 32px sans-serif'; c.fillText('EU', 112, y + 46);
      c.fillStyle = '#777'; c.font = '22px sans-serif'; c.fillText('agora', w - 110, y + 46);
      c.fillStyle = '#222'; c.font = '31px sans-serif'; c.fillText('olha pro outro lado', 112, y + 110); c.fillText('da rua.', 112, y + 150);
      c.textAlign = 'center'; return;
    }
    const cx = w / 2, cy = h * 0.3;
    if (estado === 'tocando') {
      for (let k = 0; k < 3; k++) { const f = ((t * 0.9 + k / 3) % 1); c.strokeStyle = `rgba(120,220,140,${(1 - f) * 0.8})`; c.lineWidth = 5; c.beginPath(); c.arc(cx, cy, 62 + f * 80, 0, 7); c.stroke(); }
    }
    c.fillStyle = '#9fb6d8'; c.beginPath(); c.arc(cx, cy, 62, 0, 7); c.fill();
    c.fillStyle = '#e9b48c'; c.beginPath(); c.arc(cx, cy - 10, 24, 0, 7); c.fill();
    c.fillStyle = '#2f8f4e'; c.beginPath(); c.arc(cx, cy + 46, 38, Math.PI, 0); c.fill();
    c.fillStyle = '#fff'; c.font = 'bold 92px sans-serif'; c.fillText('EU', cx, h * 0.53);
    c.font = '28px sans-serif'; c.fillStyle = '#c9d6ea';
    if (estado === 'tocando') c.fillText('chamando...', cx, h * 0.6);
    if (estado === 'chamada') { const s = Math.max(0, Math.floor(t)); c.fillText('00:' + String(s).padStart(2, '0'), cx, h * 0.6); }
    if (estado === 'encerrada') c.fillText('chamada encerrada', cx, h * 0.6);
    const by = h * 0.83, r = 40;
    if (estado === 'tocando') {
      c.fillStyle = '#e04848'; c.beginPath(); c.arc(w * 0.25, by, r, 0, 7); c.fill();
      c.fillStyle = '#3cc35c'; c.beginPath(); c.arc(w * 0.75, by, r, 0, 7); c.fill();
      tel(c, w * 0.25, by, true); tel(c, w * 0.75, by, false);
    } else if (estado === 'chamada') {
      c.fillStyle = '#e04848'; c.beginPath(); c.arc(cx, by, r, 0, 7); c.fill(); tel(c, cx, by, true);
    }
  }
  function tel(c, x, y, desliga) {
    c.save(); c.translate(x, y); c.rotate(desliga ? 2.36 : 0); c.strokeStyle = '#fff'; c.lineWidth = 9; c.lineCap = 'round';
    c.beginPath(); c.arc(0, 4, 17, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); c.restore();
  }
})();
