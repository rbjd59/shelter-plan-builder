export function HomePoints({ items }: { items: readonly string[] }) {
  return <ul className="home-simple-points">{items.map(item => <li key={item}>{item}</li>)}</ul>;
}