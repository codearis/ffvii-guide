import { useSyncExternalStore } from 'react'
import sacNames from './data/sac-names.json'

// Versões suportadas. O database é o do FF7 clássico; a SAC (Shinra Archaeology Cut)
// é uma retradução, então só troca NOMES — por isso um mapa de aliases resolve, sem duplicar dados.
export type Version = 'classic' | 'sac'

const KEY = 'ff7-version'
const listeners = new Set<() => void>()
let current: Version = (localStorage.getItem(KEY) as Version) || 'classic'

export const setVersion = (v: Version) => {
  current = v
  localStorage.setItem(KEY, v)
  listeners.forEach(l => l())
}

export const useVersion = () =>
  useSyncExternalStore(
    l => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => current
  )

const map = sacNames as Record<string, string>

// nome exibido conforme a versão; nomes sem equivalente conhecido ficam como no clássico
export const useName = () => {
  const v = useVersion()
  return (n: string) => (v === 'sac' ? map[n] ?? n : n)
}

// texto livre (descrições, passos do detonado) com os nomes trocados
export const useText = () => {
  const v = useVersion()
  return (t: string) =>
    v === 'sac'
      ? t.replace(/\b(All|Fire2|Fire3|Ice2?|Ice3|Bolt2?|Bolt3|Cure2|Cure3|Life2?|Bio2|Bio3|Barrier|MBarrier|DeSpell|Sleepel|Confu|Soft|Aeris)\b/g, m => map[m] ?? m)
      : t
}

// aceita busca pelos dois nomes (clássico e SAC)
export const searchAliases = (n: string) => {
  const sac = map[n]
  return sac ? `${n} ${sac}` : n
}
