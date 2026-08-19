import { useState } from 'react'
import { asset, slugify } from './lib'

const BY_SECTION: Record<string, string> = {
  Itens: 'item',
  Armaduras: 'armor',
  Acessórios: 'accessory',
}

// ícone do menu do jogo: armas variam por personagem; key items não têm ícone próprio no FF7
export default function Icon({ section, character }: { section: string; character?: string }) {
  const [err, setErr] = useState(false)
  const file =
    section === 'Armas' || section === 'Arma'
      ? character
        ? `weapon-${slugify(character)}`
        : null
      : BY_SECTION[section] ?? null
  if (!file || err) return null
  return (
    <img
      className="menu-icon"
      src={asset(`img/icons/${file}.png`)}
      alt=""
      loading="lazy"
      onError={() => setErr(true)}
    />
  )
}
