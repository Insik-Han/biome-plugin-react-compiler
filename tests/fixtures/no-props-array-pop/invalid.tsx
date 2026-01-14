// @ts-nocheck
function Component(props: { items: string[] }) {
  // Invalid: mutating props with pop
  props.items.pop();
  return <div>{props.items.length}</div>;
}
