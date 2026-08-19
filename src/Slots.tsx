// desenha slots de materia como no jogo: furo escuro com aro metálico, par linkado unido por barra
export default function Slots({ str }: { str: string }) {
  const groups = str.trim() ? str.trim().split(/\s+/) : []
  if (!groups.length) return <span className="dim">sem slots</span>
  return (
    <span className="slots-row">
      {groups.map((g, i) =>
        g.includes('=') ? (
          <span key={i} className="slot-pair">
            <span className="slot" />
            <span className="slot-link" />
            <span className="slot" />
          </span>
        ) : (
          <span key={i} className="slot" />
        )
      )}
    </span>
  )
}
