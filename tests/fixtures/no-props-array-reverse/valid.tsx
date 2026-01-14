// @ts-nocheck
function Component(props: { items: string[] }) {
  // Valid: spread then reverse
  const reversed = [...props.items].reverse();
  return <div>{reversed[0]}</div>;
}
