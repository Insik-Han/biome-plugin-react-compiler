// @ts-nocheck
function Component(props: { items: string[] }) {
  // Valid: spread then sort
  const sorted = [...props.items].sort();
  return <div>{sorted[0]}</div>;
}
