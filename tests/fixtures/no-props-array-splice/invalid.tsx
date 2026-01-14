// @ts-nocheck
function Component(props: { items: string[] }) {
  // Invalid: mutating props with splice
  props.items.splice(0, 1);
  return <div>{props.items.length}</div>;
}
