# Roteiro, narração e publicação

## Tom do perfil Caderno Amarelo (padrão)

O perfil é de **curiosidades e assuntos do dia a dia, leves e com humor**: "explico no papel o que ninguém te explicou". Política, finanças sérias e notícias entram só quando o usuário pedir.

- **Temas que funcionam:** perguntas que todo mundo já se fez ("por que a fila do lado anda mais rápido?"), contas surpreendentes do cotidiano (tempo de vida no trânsito, R$ 1 por dia), paradoxos simples (aniversário, espera do ônibus) e "mitos" testados com uma conta.
- **Humor:**
  - um exagero ou comparação absurda no meio ("isso dá 3 anos da sua vida olhando pro semáforo");
  - um personagem que se dá mal na história (o João que sempre escolhe a fila errada);
  - uma piada curta no fim, antes do CTA.
  - Sem humor que ofenda grupos ou pessoas reais.
- **Ritmo:** curiosidade em segundos, gancho em forma de pergunta e a resposta guardada para a "virada". Frases curtas, linguagem de conversa ("olha só", "e aqui vem o pulo do gato").
- **Visual:** mais bonecos, carinhas, balões e objetos rabiscados (relógio, ônibus, celular). Use gráficos só quando a conta pedir.

## Estrutura que prende no TikTok, Reels e Shorts

Duração padrão: 30–60 s para curiosidades leves e 45–90 s para explicações mais densas (6–9 cenas de 5–15 s). **Se o usuário pedir uma duração, ela manda.** Cada cena tem uma ideia e um desenho.

**Orçamento de fala:** a voz Kokoro (pm_alex, speed 1.1) fala cerca de **18 caracteres por segundo** (≈ 3 palavras/s); a edge-tts Antonio +10% fala num ritmo parecido. Para um vídeo de N segundos:
- total de caracteres das falas ≈ (N − soma das pausas) × 18;
- 50 s com ~6 s de pausas → ~800 caracteres.

Confira depois de gerar o áudio (`timeline.json` → `total`) e ajuste o texto se passar do pedido.

**Vídeos curtos (até ~50 s):** o CTA falado das redes custa ~5 s. Use menos re-ganchos (2), deixe a história em 1 cena e junte o fechamento com o CTA.

### O arco de retenção (obrigatório em todo vídeo)

O vídeo é uma **promessa aberta no começo e paga só no final**. A pessoa fica porque quer ver a resposta, e no meio precisa ganhar motivos novos para continuar. O efeito "uau" é o **fato mais surpreendente guardado para o fim**, e ele também segue "Fatos e fontes": uau inventado não vale.

1. **Gancho com promessa (0–3 s, cena 1):** abra um "loop" de curiosidade que só fecha no final.
   - A **primeira frase** já é o gancho: pergunta intrigante, afirmação que contraria o senso comum ou uma cena absurda. Nada de "oi", "hoje vou explicar" ou contexto antes.
   - **Prometa a revelação** sem entregá-la: "e no final eu te mostro por que você SEMPRE escolhe a fila errada", "o último número vai te assustar", "a resposta não é a que você está pensando".
   - Na tela: título curto e um **elemento de mistério**, por exemplo uma caixa ou cartão com "?" que só será preenchido no final, ou um número tampado com rabisco.
2. **Expectativa crescente no meio (re-ganchos a cada 8–12 s):** cada cena entrega uma parte e **abre a próxima pergunta**.
   - Frases-ponte: "mas isso nem é o mais estranho…", "e aqui vem a parte que ninguém te conta", "só que tem um detalhe…", "guarda esse número, que ele vai voltar".
   - **Escalada:** comece pelo fato menos surpreendente e vá subindo (1 ano → 3 anos → 10 anos). Nunca coloque o maior impacto no meio.
   - **Pergunta para o espectador** ("chuta aí: quantos você acha que…?") faz a pessoa pensar e esperar a resposta; em seguida desenhe a resposta com pausa.
   - **Quebras de padrão visual** a cada ~10 s: virar a folha, carimbo, mudar a cor, um personagem novo, algo sendo arrastado. Tela parada é tela abandonada.
3. **Clímax "uau" (penúltima cena):** feche o loop do começo com a revelação mais forte.
   - Destaque visual: o "?" do começo vira o número/resposta, com carimbo, círculo vermelho, letras grandes (100–140) e uma comparação concreta que dá escala ("dá pra fazer o ensino fundamental e o médio inteiros").
   - Prepare com uma frase curta de suspense antes ("e o resultado é…") e uma pausa breve de ~0,4 s (pode ser uma vírgula ou reticências na fala).
4. **Fechamento rápido (última cena, ≤ 6 s):** depois do uau, a energia cai; não alongue.
   - Uma frase de humor ou de impacto, e o CTA ("me segue pra mais").
   - **Loop:** quando der, termine com uma frase que conecte de volta ao começo, para quem rever o vídeo emendar sem perceber. Isso aumenta o tempo assistido.

**História curta** (personagem com nome comum, boneco, balão) funciona bem como veículo da escalada no meio ou como preparação do uau. **Moral/resumo** só se couber em uma frase antes do CTA.

**Checklist de retenção** (confira o roteiro antes de mostrar ao usuário):
- [ ] A primeira frase prende sozinha, sem contexto antes?
- [ ] Há uma promessa explícita de revelação no começo?
- [ ] A resposta principal só aparece no final?
- [ ] Toda cena do meio termina abrindo uma nova curiosidade?
- [ ] Os fatos estão em ordem crescente de surpresa?
- [ ] O uau tem fonte e uma comparação concreta que dá escala?
- [ ] Depois do uau há no máximo ~6 s?
- [ ] Há uma mudança visual a cada ~10 s?

Texto da fala: frases curtas, voz ativa, segunda pessoa ("você"). Evite parênteses e listas longas, porque a voz lê tudo.

## Fala ≠ texto na tela

O campo `fala` do `projeto.json` é o que a voz pronuncia. Escreva-o **como se fala**:
- **Números e símbolos por extenso:** "quarenta e três por cento", "cinquenta por cento mais um", "R$ 1.200" → "mil e duzentos reais".
- **Siglas soletradas:** "INSS" → "i ene esse esse".
- **Redes e @:** "Instagram" → `Instagrã`; "TikTok" → `Tic Tóc`; "@nome_sobrenome" → `arroba nome ânderláin sobrenome`. Separe palavras coladas (`cadernoamarelo` → `caderno amarelo`); quando o @ é igual nas duas redes, fale uma vez só ("Me segue no Instagrã e no Tic Tóc: arroba caderno ânderláin amarelo") e evite letras soltas ("ê" é lido como "e circunflexo").
- Para conferir a pronúncia da voz Kokoro antes de gerar: `python3 -c "from kokoro_onnx import Kokoro; import os; d=os.path.expanduser('~/.cache/whiteboard-video/kokoro'); k=Kokoro(d+'/kokoro-v1.0.onnx', d+'/voices-v1.0.bin'); print(k.tokenizer.phonemize('TEXTO', 'pt-br'))"`. Fonemas brasileiros têm "tʃ" em "ti" e "ʊ" no final de "-o".

Na tela, sempre use a grafia correta (`@caderno_amarelo`, `50%+1`).

## Fatos e fontes (vale para todo vídeo, principalmente curiosidades)

O perfil vive de credibilidade: um número inventado, quando alguém desmente nos comentários, contamina todos os vídeos. Regras:

1. **Liste os fatos antes de escrever.** Todo número, recorde, data, comparação ("o maior do mundo") ou afirmação científica do roteiro é um fato a verificar.
2. **Cada fato precisa de fonte concreta**, de preferência primária:
   - órgãos oficiais (IBGE, OMS, Ministério da Saúde, Banco Central, NASA);
   - pesquisas publicadas e relatórios conhecidos (relatórios anuais de institutos e consultorias de pesquisa);
   - enciclopédias e veículos jornalísticos sérios.
   Use WebSearch/WebFetch quando disponíveis e abra a página para confirmar o número; não confie só no resumo da busca.
3. **Contas são fatos derivados.** Se a conta parte de um dado com fonte (ex.: 5 h/dia de celular), mostre a conta; o resultado herda a fonte. Arredonde para baixo ou use "mais de", "quase".
4. **Sem fonte:**
   - o fato sai do roteiro, ou
   - vira **suposição declarada** na fala e na tela ("imagine 20 minutos por dia…", "se você…"), nunca "estudos mostram".
5. **Mitos populares** ("usamos só 10% do cérebro", "a Muralha da China é vista do espaço") só entram para serem **desmentidos**, com fonte.
6. **Registre** em `projeto.json`:
   ```json
   "fontes": [
     { "fato": "<o fato exatamente como aparece no vídeo>", "fonte": "<instituição, publicação, ano>", "url": "<link da página consultada>" }
   ]
   ```
   O motor ignora esse campo, que serve para conferência e para a entrega.
7. **Sem acesso à internet** para verificar: diga isso ao usuário antes de renderizar e peça a fonte, ou a autorização para usar os números como suposição. Nunca preencha a lacuna com "conhecimento geral" apresentado como fato.
8. **Na entrega:** passe as fontes em formato curto para a legenda ou para um comentário fixado ("📚 Fontes: IBGE (2022), OMS (2023)").

## Temas sensíveis (política, saúde, finanças)

- **Política:** seja neutro. Use candidatos/partidos fictícios ("Candidato A"), não recomende voto em ninguém e centre o vídeo na regra ou na matemática. Isso protege o perfil de denúncias e alcança todos os lados.
- **Números reais** (pesquisas, taxas, leis): seguem "Fatos e fontes" acima. Regras estáveis e conhecidas (ex.: "50% + 1 dos votos válidos" no 1º turno) também levam a fonte oficial (Constituição, TSE).

## Legendas para postar (SEMPRE entregar as duas, TikTok e Instagram, assim que o vídeo ficar pronto)

As duas redes premiam coisas diferentes, então a legenda não é a mesma. Entregue cada uma num bloco de código pronto para copiar, salve tudo em `<projeto>/legenda.txt` e mostre na resposta final, sem esperar o usuário pedir.

**TikTok:** curta e direta, porque a legenda aparece por cima do vídeo e o TikTok funciona como busca.
```
<Pergunta-gancho com palavras-chave do tema> 🤔<emoji>

<1 linha que aumenta a curiosidade sem entregar o final: "o final vai te surpreender 👀">

👇 <pergunta fácil de responder nos comentários: sim/não, A ou B, "chuta um número">

#<tema> #<tema2> #curiosidades #vocesabia #aprendanotiktok
```
- 3–6 hashtags (tema + nicho + 1–2 amplas). Evite #fyp em excesso, porque não ajuda.
- Palavras-chave do tema na primeira linha (a busca do TikTok lê a legenda).

**Instagram (Reels):** primeira linha forte (é o que aparece antes do "mais"), corpo com mais contexto e chamada para **salvar e compartilhar**, que são os sinais que mais pesam no Instagram.
```
<Primeira linha-gancho curta, até ~120 caracteres> <emoji>

<2–3 linhas resumindo a curiosidade e o "uau" sem entregar tudo>

💾 Salva pra mostrar pra alguém depois
📤 Manda pra quem <situação do tema>
💬 <pergunta para comentar>

<se houver fontes: 📚 Fontes: ... (curto)>

#<tema> #<tema2> #<subtema> #curiosidades #vocesabia #aprendanoreels #cadernoamarelo
```
- 5–10 hashtags de nicho; sem hashtags genéricas demais.
- Fontes podem ir na legenda do Instagram (cabe) e, no TikTok, num **comentário fixado**.

**Também entregue:**
- **Comentário para fixar:** fontes + aviso quando for saúde/finanças.
- **Texto da capa:** 3–6 palavras em maiúsculas, a pergunta do gancho.
- **1 variação curta** de cada legenda, para teste.

Dicas de publicação:
- **Capa:** escolha um quadro do começo (título), nunca o quadro final com @/CTA.
- **Uma conta por vídeo:** não poste o mesmo vídeo em dois perfis (o TikTok marca o repetido como "não original"); para divulgar no perfil pessoal, use "repostar" ou compartilhe o link.
- **Visibilidade restrita por "conteúdo não original"** → recorrer pelo app ("Recurso"), explicando que animação e narração são originais.
- Na capa, um texto curto em maiúsculas com a pergunta.
- Fixe um comentário próprio com uma pergunta.
- Responda os primeiros comentários.
- Poste no horário de pico (18h–21h).

## Música de fundo (recomendação para o usuário aplicar no app)

O vídeo sai só com a narração. Recomende adicionar a música no próprio TikTok:
- **Estilos:** lo-fi/chill sem letra, pizzicato "curious" ou violão leve.
- **Volume:** música entre 5% e 15% e som original em 100%.
- **Evite** músicas com letra, funk, trap ou trilha dramática.
- **Contas comerciais** só podem usar a Biblioteca de Música Comercial.
