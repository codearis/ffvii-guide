const PRIMARY = [
  {
    stat: 'Strength',
    effect: 'Força do ataque físico. Cada ponto soma 1 no Attack, junto com o poder da arma.',
    raise: 'Level up · Power Source',
  },
  {
    stat: 'Dexterity',
    effect: 'Velocidade: define quão rápido a barra ATB enche. Também contribui para a evasão física (Defense% = Dex ÷ 4, somado ao da armadura).',
    raise: 'Level up · Speed Source',
  },
  {
    stat: 'Vitality',
    effect: 'Defesa física. Cada ponto soma 1 no Defense, junto com a armadura, reduzindo o dano físico recebido.',
    raise: 'Level up · Guard Source',
  },
  {
    stat: 'Magic',
    effect: 'Força do ataque mágico. Cada ponto soma 1 no Magic atk — base do dano de todas as magias e summons.',
    raise: 'Level up · Magic Source',
  },
  {
    stat: 'Spirit',
    effect: 'Defesa mágica. Cada ponto soma 1 no Magic def, reduzindo o dano mágico recebido.',
    raise: 'Level up · Mind Source',
  },
  {
    stat: 'Luck',
    effect: 'Sorte: aumenta a chance de acerto crítico, de Lucky Hit (acerto garantido) e de Lucky Evade (esquiva garantida).',
    raise: 'Level up · Luck Source',
  },
]

const DERIVED = [
  { stat: 'Attack', formula: 'Strength + poder da arma', effect: 'Dano físico causado.' },
  { stat: 'Attack%', formula: 'Precisão da arma equipada', effect: 'Chance de acertar ataques físicos.' },
  { stat: 'Defense', formula: 'Vitality + defesa da armadura', effect: 'Reduz o dano físico recebido.' },
  { stat: 'Defense%', formula: 'Dexterity ÷ 4 + evasão da armadura', effect: 'Chance de esquivar de ataques físicos.' },
  { stat: 'Magic atk', formula: 'Magic', effect: 'Dano mágico causado.' },
  { stat: 'Magic def', formula: 'Spirit (+ armadura — ver nota do bug)', effect: 'Reduz o dano mágico recebido.' },
  { stat: 'Magic def%', formula: 'Evasão mágica da armadura', effect: 'Chance de esquivar de magias.' },
]

const NOTES = [
  'Limites: HP 9999 · MP 999 · stats primários 255 · Level 99.',
  'Sources (Power, Guard, Magic, Mind, Speed, Luck) aumentam o stat permanentemente em +1 e são obtidas principalmente com o comando Morph em inimigos.',
  'Barra de Limit: enche proporcionalmente ao dano recebido. Fury (Hyper) faz encher mais rápido mas reduz a precisão física; Sadness (Tranquilizer) reduz ~30% do dano recebido mas enche a barra mais devagar.',
  'Magic Defense bug: na versão original de PlayStation a Magic def das armaduras não é aplicada — só o Spirit conta. Foi corrigido no re-release de PC (2012), onde a armadura conta normalmente.',
  'EXP sobe o Level (e os stats primários a cada level); AP evolui as materias equipadas conforme o Growth da arma/armadura (None, Normal, Double, Triple).',
]

export default function StatsPage() {
  return (
    <>
      <div className="window">
        <h3>Stats primários</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Stat</th>
                <th>O que faz</th>
                <th>Como aumentar</th>
              </tr>
            </thead>
            <tbody>
              {PRIMARY.map(s => (
                <tr key={s.stat}>
                  <td className="hl">{s.stat}</td>
                  <td className="dim">{s.effect}</td>
                  <td data-label="Aumentar">{s.raise}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="window">
        <h3>Stats derivados (menu de status)</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Stat</th>
                <th>Fórmula</th>
                <th>Efeito</th>
              </tr>
            </thead>
            <tbody>
              {DERIVED.map(s => (
                <tr key={s.stat}>
                  <td className="hl">{s.stat}</td>
                  <td data-label="Fórmula">{s.formula}</td>
                  <td className="dim">{s.effect}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="window">
        <h3>Notas</h3>
        <ul className="notes">
          {NOTES.map((n, k) => (
            <li key={k} className="dim">
              {n}
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
