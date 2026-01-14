// INVALID: Mutating props

import React from "react";

interface Props {
  name: string;
  items: string[];
  config: { enabled: boolean };
}

function BadMutationComponent(props: Props) {
  // BAD: Direct prop mutation
  props.name = "new name";

  // BAD: Mutating array prop with push
  props.items.push("new item");

  // BAD: Mutating array prop with pop
  props.items.pop();

  // BAD: Mutating array prop with splice
  props.items.splice(0, 1);

  // BAD: Mutating array prop with sort
  props.items.sort();

  // BAD: Mutating array prop with reverse
  props.items.reverse();

  return <div>{props.name}</div>;
}

function DestructuredBadComponent({ name, items }: Props) {
  // This pattern is harder to detect but still problematic
  items.push("new item");

  return <div>{name}</div>;
}

export { BadMutationComponent, DestructuredBadComponent };
