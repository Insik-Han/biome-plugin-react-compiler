// @ts-nocheck
function Component(props: { items: string[] }) {
  // Valid: create new array without last item
  const newItems = props.items.slice(0, -1);
  return <div>{newItems.length}</div>;
}
