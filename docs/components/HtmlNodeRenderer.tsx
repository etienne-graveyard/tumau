import React from 'react';
import { Node } from 'unist';

interface Props {
  node: Node | Array<Node>;
}

export const HtmlNodeRenderer: React.FC<Props> = ({ node }) => {
  if (Array.isArray(node)) {
    return (
      <React.Fragment>
        {node.map((n, index) => {
          return <HtmlNodeRenderer key={index} node={n} />;
        })}
      </React.Fragment>
    );
  }

  return (
    <>
      <h1>HTML</h1>
      <pre>{JSON.stringify(node, null, 2)}</pre>
    </>
  );
};
