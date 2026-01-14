// @ts-nocheck
function Component(props: { items: string[] }) {
  // Invalid: mutating props with reverse
  props.items.reverse();
  return <div>{props.items[0]}</div>;
}
