// @ts-nocheck
function Component(props: { items: string[] }) {
  // Valid: use filter instead
  const newItems = props.items.filter((_, i) => i !== 0);
  return <div>{newItems.length}</div>;
}
