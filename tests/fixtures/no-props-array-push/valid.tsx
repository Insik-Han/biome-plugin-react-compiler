// @ts-nocheck
function Component(props: { items: string[] }) {
  // Valid: create new array
  const newItems = [...props.items, "new item"];
  return <div>{newItems.length}</div>;
}
