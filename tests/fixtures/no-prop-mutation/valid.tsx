// @ts-nocheck
function Component(props: { name: string }) {
  // Valid: create new value
  const newName = props.name.toUpperCase();
  return <div>{newName}</div>;
}
