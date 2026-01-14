// @ts-nocheck
function Component(props: { name: string }) {
  // Invalid: direct prop mutation
  props.name = "new name";
  return <div>{props.name}</div>;
}
