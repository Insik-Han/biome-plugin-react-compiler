// INVALID: Using try/catch to handle JSX errors
// Should use Error Boundaries instead

import React from "react";

function BadComponent() {
  try {
    return <ChildComponent />;
  } catch (error) {
    return <div>Error occurred</div>;
  }
}

function AnotherBadComponent() {
  try {
    const data = fetchData();
    return (
      <div>
        <span>{data.name}</span>
      </div>
    );
  } catch (error) {
    console.error(error);
    return null;
  }
}

export { BadComponent, AnotherBadComponent };
