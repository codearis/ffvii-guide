import materiaRaw from './data/materia.json'
import { Materia } from './lib'

const materia = materiaRaw as Materia[]
export const byName = (n: string | null) =>
  n ? materia.find(m => m.name === n) ?? null : null

export type Equip = 'weapon' | 'armor'
export interface Slot {
  name: string
  level: number
}
export const PAIRS: [number, number][] = [
  [0, 1],
  [2, 3],
  [4, 5],
  [6, 7],
]

// níveis = thresholds de AP (a partir do lv 2, incl. master) + o nível 1
export const maxLevel = (m: Materia) => m.ap.length + 1

// aproximação: assume 1 habilidade nova por nível a partir do 1 (vale para Fire/Steal/etc.;
// materias com habilidade só no lv 2+, como Full Cure, aparecem um nível antes do real)
const abilitiesAt = (m: Materia, level: number) =>
  m.abilities.slice(0, Math.min(level, m.abilities.length))

// elemento oculto que cada materia empresta à Elemental
const ELEMENT_OF: Record<string, string> = {
  Fire: 'Fogo',
  Ice: 'Gelo',
  Lightning: 'Raio',
  Earth: 'Terra',
  Poison: 'Veneno',
  Gravity: 'Gravidade',
  Contain: 'Fogo/Gelo/Terra/Vento',
  Ifrit: 'Fogo',
  Shiva: 'Gelo',
  Ramuh: 'Raio',
  Titan: 'Terra',
  Leviathan: 'Água',
  Alexander: 'Sagrado',
  Phoenix: 'Fogo',
  Kujata: 'Fogo/Gelo/Raio',
  'Choco/Mog': 'Vento',
}

// status que cada materia empresta à Added Effect
const STATUS_OF: Record<string, string> = {
  Poison: 'Veneno',
  Seal: 'Sono e Silêncio',
  Mystify: 'Confusão e Berserk',
  Transform: 'Mini e Sapo',
  Time: 'Lentidão e Parada',
  Destruct: 'Morte',
  Contain: 'Parada, Petrificação e Confusão',
  Odin: 'Morte',
  Hades: 'Sono, Veneno, Confusão, Silêncio, Sapo e Mini',
  'Choco/Mog': 'Parada',
}

// resistências dos acessórios mais relevantes (o resto mostra só a descrição)
export const ACC_RESIST: Record<string, string> = {
  Ribbon: 'Imune a todos os status anormais',
  'Star Pendant': 'Imune a Veneno',
  'White Cape': 'Imune a Sapo e Mini',
  'Silver Glasses': 'Imune a Escuridão',
  Headband: 'Imune a Sono',
  'Fairy Ring': 'Imune a Veneno e Escuridão',
  'Jem Ring': 'Imune a Paralisia, Petrificação e Slow-numb',
  'Peace Ring': 'Imune a Berserk, Fúria e Confusão',
  'Safety Bit': 'Imune a Morte súbita, Petrificação e Slow-numb',
  'Fire Ring': 'Anula Fogo',
  'Ice Ring': 'Anula Gelo',
  'Bolt Ring': 'Anula Raio',
  'Water Ring': 'Absorve Água',
  'Tetra Elemental': 'Absorve Fogo, Gelo, Raio e Terra',
  'Reflect Ring': 'Reflete magias automaticamente',
}

const isCastable = (m: Materia) => m.type === 'Magic' || m.type === 'Summon'

const elementalVerb = (level: number) => (level >= 3 ? 'absorve' : level === 2 ? 'anula' : 'reduz')

export function combo(sup: Slot, partner: Slot | null, where: Equip): string {
  const s = byName(sup.name)!
  const p = partner ? byName(partner.name) : null
  const pre = p ? `${s.name} + ${p.name}: ` : ''
  if (!p || !partner) return `${s.name}: linke com outra materia no par para ter efeito.`
  switch (s.name) {
    case 'All':
      return p.type === 'Magic'
        ? pre + `as magias de ${p.name} atingem todos os alvos.`
        : pre + `sem efeito — All só funciona com materia de magia.`
    case 'Elemental': {
      const el = ELEMENT_OF[p.name]
      if (!el) return pre + `sem efeito — ${p.name} não tem elemento aproveitável.`
      return where === 'weapon'
        ? pre + `o ataque físico ganha o elemento ${el}.`
        : pre + `${elementalVerb(sup.level)} dano de ${el} (nível ${sup.level}: 1 reduz, 2 anula, 3+ absorve).`
    }
    case 'Added Effect': {
      const st = STATUS_OF[p.name]
      if (!st) return pre + `sem efeito — ${p.name} não carrega status.`
      return where === 'weapon'
        ? pre + `os ataques físicos podem causar ${st}.`
        : pre + `imunidade a ${st}.`
    }
    case 'Counter':
      return p.type === 'Command'
        ? pre +
            `ao ser atacado, contra-ataca com ${abilitiesAt(p, partner.level).join(' / ') || p.name}.`
        : pre + `sem efeito — Counter só funciona com materia de comando.`
    case 'Magic Counter':
      return isCastable(p)
        ? pre + `ao ser atacado, responde lançando ${p.name}.`
        : pre + `sem efeito — precisa de magia ou invocação.`
    case 'Final Attack':
      return isCastable(p) || p.type === 'Command'
        ? pre +
            `ao ser nocauteado, executa ${p.name} automaticamente.` +
            (p.name === 'Phoenix' ? ' Combo clássico: revive o grupo inteiro ao morrer.' : '') +
            (p.name === 'Revive' ? ' Auto-Life: se revive ao morrer.' : '')
        : pre + `sem efeito.`
    case 'Added Cut':
      return isCastable(p) || p.type === 'Command'
        ? pre + `após usar ${p.name}, emenda um ataque físico extra.`
        : pre + `sem efeito.`
    case 'Steal as well':
      return isCastable(p) || p.type === 'Command'
        ? pre + `ao usar ${p.name}, tenta roubar do alvo ao mesmo tempo.`
        : pre + `sem efeito.`
    case 'Quadra Magic':
      if (p.name === 'Knights of the Round')
        return pre + `sem efeito — Quadra Magic não funciona com Knights of the Round.`
      return isCastable(p)
        ? pre + `lança ${p.name} 4 vezes seguidas (com dano reduzido por lançamento).`
        : pre + `sem efeito — precisa de magia ou invocação.`
    case 'MP Turbo':
      return isCastable(p)
        ? pre + `${p.name} fica mais forte, gastando mais MP.`
        : pre + `sem efeito — precisa de magia ou invocação.`
    case 'MP Absorb':
      return isCastable(p)
        ? pre + `recupera MP proporcional ao dano causado por ${p.name}.`
        : pre + `sem efeito — precisa de magia ou invocação.`
    case 'HP Absorb':
      return isCastable(p)
        ? pre + `recupera HP proporcional ao dano causado por ${p.name}.`
        : pre + `sem efeito — precisa de magia ou invocação.`
    case 'Sneak Attack':
      return isCastable(p) || p.type === 'Command'
        ? pre + `chance de executar ${p.name} sozinho no início da batalha.`
        : pre + `sem efeito.`
    default:
      return pre + s.description
  }
}

export function indiv(slot: Slot): string {
  const m = byName(slot.name)!
  const lv = slot.level >= maxLevel(m) ? 'Master' : `Lv ${slot.level}`
  switch (m.type) {
    case 'Magic':
      return `${m.name} (${lv}): habilita ${abilitiesAt(m, slot.level).join(', ') || m.description}`
    case 'Command':
      return `${m.name} (${lv}): adiciona o comando ${abilitiesAt(m, slot.level).join(' / ') || m.name}`
    case 'Summon':
      return `${m.name} (${lv}): habilita a invocação`
    default:
      return `${m.name}: ${m.description}`
  }
}

export function equipEffects(slots: (Slot | null)[], where: Equip): string[] {
  const lines: string[] = []
  for (const [a, b] of PAIRS) {
    const sa = slots[a]
    const sb = slots[b]
    const ma = sa ? byName(sa.name) : null
    const mb = sb ? byName(sb.name) : null
    if (!ma && !mb) continue
    const aSup = ma?.type === 'Support'
    const bSup = mb?.type === 'Support'
    if (aSup && bSup) lines.push(`${ma!.name} + ${mb!.name}: inválida — duas de suporte juntas não geram efeito.`)
    else if (aSup) lines.push(combo(sa!, sb, where))
    else if (bSup) lines.push(combo(sb!, sa, where))
    else if (ma && mb)
      lines.push(
        `${ma.name} + ${mb.name}: link sem efeito — nenhuma é de suporte. As duas funcionam normalmente, só não interagem.`
      )
  }
  slots.forEach(s => {
    if (s && byName(s.name)?.type !== 'Support') lines.push(indiv(s))
  })
  return lines
}

// interações globais que não dependem de link (ex.: Mega All é Independente e vale pro personagem todo)
export function crossEffects(weapon: (Slot | null)[], armor: (Slot | null)[]): string[] {
  const all = [...weapon, ...armor]
    .map(s => (s ? byName(s.name) : null))
    .filter((m): m is Materia => m != null)
  const lines: string[] = []
  if (all.some(m => m.name === 'Mega All')) {
    const cmds = all.filter(m => m.type === 'Command').map(m => m.name)
    lines.push(
      cmds.length
        ? `Mega All + ${cmds.join(', ')}: os comandos atingem todos os inimigos. Efeito global — Mega All é Independente, não precisa (nem adianta) linkar.`
        : `Mega All: Attack e os demais comandos atingem todos os inimigos — efeito global, sem precisar de link.`
    )
  }
  return lines
}

export function resistances(armor: (Slot | null)[], acc: string | null): string[] {
  const lines: string[] = []
  for (const [a, b] of PAIRS) {
    const pair = [armor[a], armor[b]]
    const supSlot = pair.find(s => s && (s.name === 'Elemental' || s.name === 'Added Effect'))
    const otherSlot = pair.find(s => s && s !== supSlot) ?? null
    if (!supSlot || !otherSlot) continue
    if (supSlot.name === 'Elemental' && ELEMENT_OF[otherSlot.name])
      lines.push(
        `Elemento ${ELEMENT_OF[otherSlot.name]}: ${elementalVerb(supSlot.level)} o dano (Elemental nível ${supSlot.level}).`
      )
    if (supSlot.name === 'Added Effect' && STATUS_OF[otherSlot.name])
      lines.push(`Imune a ${STATUS_OF[otherSlot.name]}.`)
  }
  if (acc && ACC_RESIST[acc]) lines.push(`${acc}: ${ACC_RESIST[acc]}.`)
  return lines
}
