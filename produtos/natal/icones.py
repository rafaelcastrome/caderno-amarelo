"""Desenhos de Natal em traço (SVG 100x100), no estilo fofo do caderno: traço grosso, cantos redondos, carinhas."""

def _olhos(x1, x2, y, r=2.6):
    return f'<circle cx="{x1}" cy="{y}" r="{r}" class="p"/><circle cx="{x2}" cy="{y}" r="{r}" class="p"/>'

def _sorriso(cx, y, w=6):
    return f'<path d="M{cx-w} {y} Q{cx} {y+w*0.9} {cx+w} {y}"/>'

def _bochechas(x1, x2, y):
    return f'<ellipse cx="{x1}" cy="{y}" rx="3.2" ry="2" class="b"/><ellipse cx="{x2}" cy="{y}" rx="3.2" ry="2" class="b"/>'

def _carinha(cx, cy, esp=9):
    return _olhos(cx-esp/2, cx+esp/2, cy) + _sorriso(cx, cy+4, 4) + _bochechas(cx-esp/2-4, cx+esp/2+4, cy+4)

ICONES = {
'arvore': f'''<path d="M50 17 L30 40 H40 L24 60 H36 L18 82 H82 L64 60 H76 L60 40 H70 Z"/>
<rect x="43" y="82" width="14" height="10" rx="2"/>
<path d="M50 3 L52.5 8.5 L58 9 L54 12.8 L55.2 18.5 L50 15.6 L44.8 18.5 L46 12.8 L42 9 L47.5 8.5 Z" class="v"/>
<circle cx="38" cy="70" r="2.5" class="p"/><circle cx="64" cy="50" r="2.5" class="p"/><circle cx="56" cy="74" r="2.5" class="p"/>
{_carinha(50, 56)}''',

'estrela': f'''<path d="M50 8 L61 34 L90 37 L68 56 L75 85 L50 70 L25 85 L32 56 L10 37 L39 34 Z"/>
{_carinha(50, 48, 11)}''',

'presente': f'''<rect x="16" y="42" width="68" height="46" rx="4"/>
<rect x="12" y="30" width="76" height="14" rx="3"/>
<path d="M44 30 V88 M56 30 V88"/>
<path d="M50 30 C40 14 22 18 30 28 C34 32 44 30 50 30 C56 30 66 32 70 28 C78 18 60 14 50 30"/>
{_carinha(50, 64, 12)}''',

'sino': f'''<path d="M50 14 C30 14 26 36 26 52 C26 64 20 70 16 76 H84 C80 70 74 64 74 52 C74 36 70 14 50 14 Z"/>
<circle cx="50" cy="84" r="7"/><path d="M44 10 Q50 4 56 10"/>
<path d="M40 14 Q30 4 22 10 Q28 18 40 16 M60 14 Q70 4 78 10 Q72 18 60 16"/>
{_carinha(50, 48, 12)}''',

'bengala': '''<path d="M44 92 V36 C44 18 72 18 72 36 V44" style="stroke-width:17"/>
<path d="M44 92 V36 C44 18 72 18 72 36 V44" style="stroke:#fff;stroke-width:10.6"/>
<path d="M39.5 84 L48.5 78 M39.5 70 L48.5 64 M39.5 56 L48.5 50 M39.5 42 L48.5 36 M43 26 L50 32 M56 20 L57 29 M68 24 L63 31 M67.5 38 L76.5 36"/>''',

'boneco_neve': f'''<circle cx="50" cy="70" r="22"/><circle cx="50" cy="34" r="16"/>
<path d="M36 21 H64 M41 21 V7 H59 V21"/>
<rect x="34" y="47" width="32" height="7" rx="3.5" class="v"/><path d="M58 54 V64 H64 V54"/>
<path d="M29 64 L13 52 M17 55 L11 58 M71 64 L87 52 M83 55 L89 58"/>
<path d="M50 35 L61 37.5 L50 40 Z" class="p"/>
<circle cx="50" cy="66" r="2.5" class="p"/><circle cx="50" cy="76" r="2.5" class="p"/>
{_olhos(44, 56, 30)}{_bochechas(39, 61, 37)}''',

'bola': f'''<circle cx="50" cy="56" r="32"/>
<rect x="42" y="16" width="16" height="10" rx="2"/>
<path d="M46 16 Q50 6 54 16"/>
<path d="M20 46 Q35 40 50 46 Q65 52 80 46 M20 68 Q35 62 50 68 Q65 74 80 68"/>
{_carinha(50, 56, 12)}''',

'meia': f'''<path d="M34 10 H66 V56 L76 64 C88 72 82 92 66 90 L40 86 C28 84 26 72 34 66 Z"/>
<rect x="30" y="10" width="40" height="14" rx="4"/>
<path d="M64 78 Q70 74 76 80"/>
{_carinha(50, 46, 11)}''',

'biscoito': f'''<path d="M50 10 C40 10 36 18 38 26 C30 26 16 28 16 36 C16 44 28 42 34 42 L28 76 C26 86 38 90 42 82 L50 66 L58 82 C62 90 74 86 72 76 L66 42 C72 42 84 44 84 36 C84 28 70 26 62 26 C64 18 60 10 50 10 Z"/>
<path d="M22 34 l3 4 M78 34 l-3 4 M34 78 l4 2 M66 78 l-4 2"/>
<circle cx="50" cy="48" r="2.3" class="p"/><circle cx="50" cy="58" r="2.3" class="p"/>
{_olhos(45, 55, 20, 2.2)}{_sorriso(50, 24, 3.5)}''',

'rena': f'''<ellipse cx="50" cy="58" rx="24" ry="28"/>
<path d="M34 36 C24 26 20 14 26 8 M26 20 L16 16 M30 28 L20 28 M66 36 C76 26 80 14 74 8 M74 20 L84 16 M70 28 L80 28"/>
<path d="M28 44 C18 40 14 48 26 52 M72 44 C82 40 86 48 74 52"/>
<circle cx="50" cy="74" r="8" class="v"/>
{_olhos(42, 58, 56)}{_bochechas(36, 64, 64)}''',

'gorro': '''<path d="M18 72 C24 40 44 20 66 24 C78 26 84 42 82 56"/>
<path d="M66 24 C72 18 78 20 80 28"/>
<circle cx="84" cy="62" r="8"/>
<rect x="12" y="70" width="66" height="16" rx="8"/>''',

'floco': '''<path d="M50 8 V92 M14 29 L86 71 M14 71 L86 29"/>
<path d="M42 16 L50 24 L58 16 M42 84 L50 76 L58 84 M17 40 L28 35 L24 23 M83 60 L72 65 L76 77 M17 60 L28 65 L24 77 M83 40 L72 35 L76 23"/>
<circle cx="50" cy="50" r="8"/>''',

'vela': f'''<rect x="36" y="38" width="28" height="50" rx="4"/>
<path d="M50 34 C40 26 46 16 50 8 C54 16 60 26 50 34 Z"/>
<path d="M36 50 Q42 56 44 50 M56 46 Q60 52 64 46"/>
<path d="M24 88 H76"/>
{_carinha(50, 64, 10)}''',

'luva': f'''<path d="M34 76 L30 40 C28 24 38 14 50 14 C62 14 70 22 70 38 L70 50 L76 42 C82 36 90 42 86 50 L72 72 L70 76 Z"/>
<rect x="30" y="76" width="44" height="14" rx="4"/>
<path d="M44 34 l4 6 4-6 4 6 M40 46 l4 6 4-6 4 6 4-6"/>
{_carinha(52, 60, 10)}''',

'caneca': f'''<path d="M22 40 H70 V78 C70 86 64 90 56 90 H36 C28 90 22 86 22 78 Z"/>
<path d="M70 50 C84 48 86 70 70 72"/>
<path d="M34 32 C30 26 38 22 34 14 M46 32 C42 26 50 22 46 14 M58 32 C54 26 62 22 58 14"/>
<ellipse cx="46" cy="40" rx="24" ry="5"/>
{_carinha(46, 62, 12)}''',

'guirlanda': '''<circle cx="50" cy="50" r="36"/><circle cx="50" cy="50" r="20"/>
<path d="M22 30 l6 4 M30 18 l4 6 M50 14 v7 M70 18 l-4 6 M78 30 l-6 4 M86 50 h-7 M14 50 h7 M22 70 l6 -4 M78 70 l-6 -4"/>
<circle cx="32" cy="40" r="3" class="p"/><circle cx="68" cy="40" r="3" class="p"/><circle cx="40" cy="78" r="3" class="p"/><circle cx="64" cy="76" r="3" class="p"/>
<path d="M50 80 C40 70 30 80 38 86 C42 88 48 84 50 80 C52 84 58 88 62 86 C70 80 60 70 50 80 Z"/>
<path d="M46 84 L40 96 M54 84 L60 96"/>''',

'noel': f'''<path d="M22 46 C26 22 46 10 66 16 C76 20 80 30 78 40"/>
<circle cx="80" cy="44" r="6"/>
<rect x="18" y="42" width="64" height="12" rx="6"/>
<path d="M22 54 C18 80 36 94 50 94 C64 94 82 80 78 54"/>
<path d="M34 72 C38 66 46 68 50 72 C54 68 62 66 66 72"/>
<circle cx="50" cy="66" r="4"/>
{_olhos(41, 59, 60)}{_bochechas(34, 66, 66)}''',

'pirulito': '''<circle cx="50" cy="36" r="26"/>
<path d="M50 36 m0 0 a4 4 0 0 1 8 0 a8 8 0 0 1 -16 0 a12 12 0 0 1 24 0 a16 16 0 0 1 -32 0 a20 20 0 0 1 40 0"/>
<path d="M50 62 V94"/>
<path d="M42 64 L50 70 L58 64"/>''',
}

NOMES = {
 'arvore': 'Árvore', 'estrela': 'Estrela', 'presente': 'Presente', 'sino': 'Sino', 'bengala': 'Bengala doce',
 'boneco_neve': 'Boneco de neve', 'bola': 'Bolinha', 'meia': 'Meia', 'biscoito': 'Biscoito', 'rena': 'Rena',
 'gorro': 'Gorro', 'floco': 'Floco de neve', 'vela': 'Vela', 'luva': 'Luva', 'caneca': 'Chocolate quente',
 'guirlanda': 'Guirlanda', 'noel': 'Papai Noel', 'pirulito': 'Pirulito',
}

ESTILO_SVG = '<style>.ic path,.ic rect,.ic circle,.ic ellipse{fill:none;stroke:#1d1d1d;stroke-width:3.2;stroke-linecap:round;stroke-linejoin:round}.ic .p{fill:#1d1d1d;stroke:none}.ic .b{fill:#f4a6a6;stroke:none}.ic .v{fill:#fff}</style>'

def svg(nome, tam=100, extra=''):
    return f'<svg class="ic" viewBox="0 0 100 100" width="{tam}" height="{tam}" {extra}>{ESTILO_SVG}{ICONES[nome]}</svg>'
