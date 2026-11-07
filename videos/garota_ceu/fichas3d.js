// Fichas fixas dos personagens (continuidade entre episódios), versão 3D.
window.FICHAS = (P, L) => {
  L.JU = { nome: 'juliane', s: 0.94, cabelo: 0x8a6440, cabeloLongo: true, oculos: true, roupa: 0x9cc8e6, saia: 0x9cc8e6, saiaH: 0.4, semManga: true, sapato: 0xf4efe6, corOlho: 0x4a6a8a };
  L.JU_FERIDA = Object.assign({}, L.JU, { oculos: false, roupa: 0x8fa6b4, saia: 0x86a2b0, descalco: true, machucado: true });
  L.JU_ANDA = Object.assign({}, L.JU_FERIDA, { poses: [[0, 'ombro_quebrado']], olhoInchado: true });
  L.MAE = { nome: 'mae', s: 0.95, cabelo: 0x2a211b, coque: true, roupa: 0xeee4cf, saia: 0x3a4050, sapato: 0x3a2a20 };
  L.PAI = { nome: 'pai', cabelo: 0xb5afa4, barba: 0xa9a399, roupa: 0xb8a57a, calca: 0x6a5a40, sapato: 0x4a3a2a, corOlho: 0x4a6a8a };
};
