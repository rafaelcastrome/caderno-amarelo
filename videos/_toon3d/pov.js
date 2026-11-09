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
    V.botaoVerde = new V3(0.019, -0.05, PD / 2 + 0.002);
    V.botaoVermelho = new V3(-0.019, -0.05, PD / 2 + 0.002);

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
    if (o.sentado) {
      const jeans = o.jeans || '#3b5a8c', alt = o.y || 1.12;
      for (const sx of [-1, 1]) {
        const coxa = T.capsula(0.078, 0.42, jeans, corpo); coxa.rotation.x = Math.PI / 2 - 0.08; coxa.position.set(0.11 * sx, -alt + 0.56, -0.26);
        const canela = T.capsula(0.065, 0.36, jeans, corpo); canela.position.set(0.12 * sx, -alt + 0.3, -0.5);
        const meia = T.capsula(0.05, 0.12, '#f4f4f0', corpo); meia.rotation.x = Math.PI / 2; meia.position.set(0.12 * sx, -alt + 0.05, -0.56); meia.scale.set(1.05, 1, 0.75);
      }
    }

    // ---------- mão esquerda segurando o celular (dedos dão a volta na borda direita, polegar na esquerda) ----------
    const mE = V.maoE = T.grupo(cel, 0, 0, 0);
    const pl = T.esfera(0.05, pele, mE); pl.scale.set(0.95, 1.1, 0.42); pl.position.set(-0.012, -0.045, -0.022);
    const pulso = T.capsula(0.034, 0.05, pele, mE); pulso.position.set(-0.03, -0.1, -0.03); pulso.rotation.z = 0.5;
    // 4 dedos: atrás do celular -> borda direita -> ponta por cima da frente
    const comp = [0.0, 0.004, 0.002, -0.004];
    [0.034, 0.012, -0.01, -0.03].forEach((y, i) => {
      const r = 0.0085 - i * 0.0004;
      const tras = T.capsula(r, 0.05, pele, mE, { w: 0.003 }); tras.rotation.z = Math.PI / 2; tras.position.set(0.012, y, -PD / 2 - r);
      const borda = T.capsula(r, PD + 0.004, pele, mE, { w: 0.003 }); borda.rotation.x = Math.PI / 2; borda.position.set(PW / 2 + r * 0.6, y, 0);
      const ponta = T.capsula(r * 0.95, 0.007 + comp[i], pele, mE, { w: 0.003 }); ponta.rotation.z = Math.PI / 2;
      ponta.position.set(PW / 2 - 0.004 - comp[i] / 2, y, PD / 2 + r * 0.7);
      const unha = T.esfera(r * 0.55, '#f3c9ad', mE, { sem: true }); unha.scale.set(1, 0.8, 0.35);
      unha.position.set(PW / 2 - 0.009 - comp[i], y, PD / 2 + r * 1.55);
    });
    // polegar: sobe pela borda esquerda, por cima da frente
    const p1 = T.capsula(0.0098, 0.03, pele, mE, { w: 0.003 }); p1.position.set(-PW / 2 - 0.004, -0.05, 0.002); p1.rotation.z = -0.35;
    const p2 = T.capsula(0.0092, 0.02, pele, mE, { w: 0.003 }); p2.position.set(-PW / 2 + 0.002, -0.022, PD / 2 + 0.008); p2.rotation.z = -0.15;
    const pu = T.esfera(0.006, '#f3c9ad', mE, { sem: true }); pu.position.set(-PW / 2 + 0.004, -0.012, PD / 2 + 0.017); pu.scale.set(1, 1.2, 0.35);
    V.pulsoE = new V3(-0.035, -0.125, -0.035); // ponto do pulso no espaço do celular

    // ---------- mão direita apontando (indicador esticado ao longo de +z local) ----------
    const mD = V.maoD = T.grupo(corpo, 0.12, -0.42, -0.25);
    const punhoD = T.esfera(0.036, pele, mD); punhoD.scale.set(1, 0.8, 1.1); punhoD.position.z = -0.01;
    const ind1 = T.capsula(0.0095, 0.03, pele, mD, { w: 0.003 }); ind1.rotation.x = Math.PI / 2; ind1.position.set(-0.012, 0.02, 0.045);
    const ind2 = T.capsula(0.009, 0.02, pele, mD, { w: 0.003 }); ind2.rotation.x = Math.PI / 2; ind2.position.set(-0.012, 0.02, 0.075);
    const unhaD = T.esfera(0.0055, '#f3c9ad', mD, { sem: true }); unhaD.position.set(-0.012, 0.028, 0.083); unhaD.scale.set(1, 0.4, 1.2);
    for (let i = 0; i < 3; i++) { const d = T.capsula(0.0095, 0.014, pele, mD, { w: 0.003 }); d.rotation.z = Math.PI / 2; d.position.set(0.006 + 0, 0.004 - i * 0.017, 0.035); }
    const polD = T.capsula(0.011, 0.025, pele, mD, { w: 0.003 }); polD.position.set(-0.032, -0.005, 0.02); polD.rotation.x = Math.PI / 2; polD.rotation.y = 0.6;
    V.pontaD = new V3(-0.012, 0.02, 0.088); // ponta do indicador no espaço da mão

    // atualiza braços (chamar depois de posicionar cel e maoD)
    V.bracos = () => {
      corpo.updateMatrixWorld(true);
      const pE = cel.localToWorld(V.pulsoE.clone()); corpo.worldToLocal(pE);
      T.ik2(V.bE.ombro, V.bE.cot, L1, L2, pE, new V3(-1, -0.6, 0.2));
      const pD = mD.localToWorld(new V3(0.015, -0.01, -0.05)); corpo.worldToLocal(pD);
      T.ik2(V.bD.ombro, V.bD.cot, L1, L2, pD, new V3(1, -0.6, 0.2));
      V.bD.ombro.visible = mD.visible;
    };
    // leva a mão direita: u=0 descansando (fora de quadro), u=1 com a ponta do dedo no ponto 'alvo' (local do celular)
    V.dedo = (u, alvoCel, toque = 0) => {
      corpo.updateMatrixWorld(true);
      const alvo = cel.localToWorld(alvoCel.clone().add(new V3(0, 0, 0.004 + 0.012 * (1 - toque)))); corpo.worldToLocal(alvo);
      const desc = new V3(0.2, -0.5, -0.22);
      const perto = alvo.clone().add(new V3(0.05, -0.06, 0.06));
      const pos = desc.clone().lerp(perto, T.suave(u));
      mD.position.copy(pos); mD.lookAt(cel.localToWorld(alvoCel.clone()));
      // corrige pra ponta do dedo cair no alvo quando u=1
      if (u > 0) {
        mD.updateMatrixWorld(true);
        const ponta = mD.localToWorld(V.pontaD.clone()); corpo.worldToLocal(ponta);
        mD.position.add(alvo.clone().sub(ponta).multiplyScalar(T.suave(u)));
      }
      mD.visible = u > 0.001;
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
