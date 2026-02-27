export default function Filters({ year, setYear, years, month, setMonth, months }) {
  return (
    <div className="filters">
      <select value={year ?? ""} onChange={e => setYear(+e.target.value)}>
        {years.map(y => (
          <option key={y}>{y}</option>
        ))}
      </select>

      <select value={month ?? ""} onChange={e => setMonth(+e.target.value)}>
        {months.map(m => (
          <option key={m}>{m}</option>
        ))}
      </select>
    </div>
  );
}
