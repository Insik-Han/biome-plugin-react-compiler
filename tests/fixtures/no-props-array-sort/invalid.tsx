// @ts-nocheck
function Component(props: { items: string[] }) {
  // Invalid: mutating props with sort
  props.items.sort();
  return <div>{props.items[0]}</div>;
}
