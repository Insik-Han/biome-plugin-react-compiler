// @ts-nocheck
// Valid: No try/catch - use Error Boundaries instead
function Component() {
  return <div>Hello</div>;
}

// Valid: Error handling without try/catch
function ComponentWithError() {
  const [error, setError] = React.useState(null);

  if (error) {
    return <div>Error occurred</div>;
  }

  return <div>Content</div>;
}
