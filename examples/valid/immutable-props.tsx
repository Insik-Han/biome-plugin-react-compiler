// VALID: Treating props as immutable

import React, { useState } from "react";

interface Props {
  name: string;
  items: string[];
  config: { enabled: boolean };
}

function GoodImmutableComponent(props: Props) {
  // GOOD: Create new values instead of mutating
  const newName = props.name.toUpperCase();

  // GOOD: Use spread to create new array
  const newItems = [...props.items, "new item"];

  // GOOD: Use filter to create new array
  const filteredItems = props.items.filter((item) => item !== "remove");

  // GOOD: Use spread for sorted array
  const sortedItems = [...props.items].sort();

  // GOOD: Use spread for reversed array
  const reversedItems = [...props.items].reverse();

  // GOOD: Create new object instead of mutating
  const newConfig = { ...props.config, enabled: true };

  return (
    <div>
      <p>{newName}</p>
      <ul>
        {sortedItems.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function StateBasedComponent({ initialItems }: { initialItems: string[] }) {
  // GOOD: Use local state for mutable data
  const [items, setItems] = useState(initialItems);

  const addItem = () => {
    setItems([...items, "new item"]);
  };

  return (
    <div>
      <button onClick={addItem}>Add Item</button>
      <ul>
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export { GoodImmutableComponent, StateBasedComponent };
