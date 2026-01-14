// @ts-nocheck
function Component(props: { items: string[] }) {
  // Invalid: mutating props with push
  props.items.push("new item");
  return <div>{props.items.length}</div>;
}
