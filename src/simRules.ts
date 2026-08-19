import materiaRaw from './data/materia.json'
import { Materia } from './lib'

const materia = materiaRaw as Materia[]
export const byName = (n: string | null) =>
  n ? materia.find(m => m.name === n) ?? null : null

export type Equip = 'weapon' | 'armor'
export const PAIRS: [number, number][] = [
  [0, 1],
  [2, 3],
  [4, 5],
  [6, 7],
]

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

export function combo(sup: Materia, partner: Materia | null, where: Equip): string {
  const pre = partner ? `${sup.name} + ${partner.name}: ` : ''
  if (!partner) return `${sup.name}: linke com outra materia no par para ter efeito.`
  switch (sup.name) {
    case 'All':
      return partner.type === 'Magic'
        ? pre + `as magias de ${partner.name} atingem todos os alvos.`
        : pre + `sem efeito — All só funciona com materia de magia.`
    case 'Elemental': {
      const el = ELEMENT_OF[partner.name]
      if (!el) return pre + `sem efeito — ${partner.name} não tem elemento aproveitável.`
      return where === 'weapon'
        ? pre + `o ataque físico ganha o elemento ${el}.`
        : pre + `resiste a ${el} (nível 1 reduz, 2 anula, 3 absorve o dano).`
    }
    case 'Added Effect': {
      const st = STATUS_OF[partner.name]
      if (!st) return pre + `sem efeito — ${partner.name} não carrega status.`
      return where === 'weapon'
        ? pre + `os ataques físicos podem causar ${st}.`
        : pre + `imunidade a ${st}.`
    }
    case 'Counter':
      return partner.type === 'Command'
        ? pre + `ao ser atacado, contra-ataca com ${partner.abilities.join(' / ') || partner.name}.`
        : pre + `sem efeito — Counter só funciona com materia de comando.`
    case 'Magic Counter':
      return isCastable(partner)
        ? pre + `ao ser atacado, responde lançando ${partner.name}.`
        : pre + `sem efeito — precisa de magia ou invocação.`
    case 'Final Attack':
      return isCastable(partner) || partner.type === 'Command'
        ? pre +
            `ao ser nocauteado, executa ${partner.name} automaticamente.` +
            (partner.name === 'Phoenix' ? ' Combo clássico: revive o grupo inteiro ao morrer.' : '') +
            (partner.name === 'Revive' ? ' Auto-Life: se revive ao morrer.' : '')
        : pre + `sem efeito.`
    case 'Added Cut':
      return isCastable(partner) || partner.type === 'Command'
        ? pre + `após usar ${partner.name}, emenda um ataque físico extra.`
        : pre + `sem efeito.`
    case 'Steal as well':
      return isCastable(partner) || partner.type === 'Command'
        ? pre + `ao usar ${partner.name}, tenta roubar do alvo ao mesmo tempo.`
        : pre + `sem efeito.`
    case 'Quadra Magic':
      if (partner.name === 'Knights of the Round')
        return pre + `sem efeito — Quadra Magic não funciona com Knights of the Round.`
      return isCastable(partner)
        ? pre + `lança ${partner.name} 4 vezes seguidas (com dano reduzido por lançamento).`
        : pre + `sem efeito — precisa de magia ou invocação.`
    case 'MP Turbo':
      return isCastable(partner)
        ? pre + `${partner.name} fica mais forte, gastando mais MP.`
        : pre + `sem efeito — precisa de magia ou invocação.`
    case 'MP Absorb':
      return isCastable(partner)
        ? pre + `recupera MP proporcional ao dano causado por ${partner.name}.`
        : pre + `sem efeito — precisa de magia ou invocação.`
    case 'HP Absorb':
      return isCastable(partner)
        ? pre + `recupera HP proporcional ao dano causado por ${partner.name}.`
        : pre + `sem efeito — precisa de magia ou invocação.`
    case 'Sneak Attack':
      return isCastable(partner) || partner.type === 'Command'
        ? pre + `chance de executar ${partner.name} sozinho no início da batalha.`
        : pre + `sem efeito.`
    default:
      return pre + sup.description
  }
}

export function indiv(m: Materia): string {
  switch (m.type) {
    case 'Magic':
      return `${m.name}: habilita ${m.abilities.join(', ') || m.description}`
    case 'Command':
      return `${m.name}: adiciona o comando ${m.abilities.join(' / ') || m.name}`
    case 'Summon':
      return `${m.name}: habilita a invocação`
    default:
      return `${m.name}: ${m.description}`
  }
}

export function equipEffects(slots: (string | null)[], where: Equip): string[] {
  const lines: string[] = []
  for (const [a, b] of PAIRS) {
    const ma = byName(slots[a])
    const mb = byName(slots[b])
    if (!ma && !mb) continue
    const aSup = ma?.type === 'Support'
    const bSup = mb?.type === 'Support'
    if (aSup && bSup) lines.push(`${ma!.name} + ${mb!.name}: duas de suporte juntas — sem efeito.`)
    else {
      if (aSup) lines.push(combo(ma!, mb, where))
      if (bSup) lines.push(combo(mb!, ma, where))
    }
  }
  slots.forEach(n => {
    const m = byName(n)
    if (m && m.type !== 'Support') lines.push(indiv(m))
  })
  return lines
}

export function resistances(armor: (string | null)[], acc: string | null): string[] {
  const lines: string[] = []
  for (const [a, b] of PAIRS) {
    const ma = byName(armor[a])
    const mb = byName(armor[b])
    const pair = [ma, mb]
    const sup = pair.find(m => m?.name === 'Elemental' || m?.name === 'Added Effect')
    const other = pair.find(m => m && m !== sup) ?? null
    if (!sup || !other) continue
    if (sup.name === 'Elemental' && ELEMENT_OF[other.name])
      lines.push(
        `Elemento ${ELEMENT_OF[other.name]}: reduz / anula / absorve conforme o nível da Elemental.`
      )
    if (sup.name === 'Added Effect' && STATUS_OF[other.name])
      lines.push(`Imune a ${STATUS_OF[other.name]}.`)
  }
  if (acc && ACC_RESIST[acc]) lines.push(`${acc}: ${ACC_RESIST[acc]}.`)
  return lines
}
