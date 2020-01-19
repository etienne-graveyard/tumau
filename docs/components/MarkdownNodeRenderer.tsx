import React from 'react';
import { Node } from 'unist';
import { CodeHighlight } from './CodeHighlight';
import Link from 'next/link';
import { PAGES } from '../data/pages';

interface Props {
  node: Node | Array<Node>;
}

export const MarkdownNodeRenderer: React.FC<Props> = ({ node }) => {
  if (Array.isArray(node)) {
    return (
      <React.Fragment>
        {node.map((n, index) => {
          return <MarkdownNodeRenderer key={index} node={n} />;
        })}
      </React.Fragment>
    );
  }
  if (node.type === 'root') {
    return (
      <React.Fragment>
        {(node.children as Array<Node>).map((n, index) => {
          return <MarkdownNodeRenderer key={index} node={n} />;
        })}
      </React.Fragment>
    );
  }
  if (node.type === 'heading') {
    const tag = 'h' + (node.depth as number);
    // TODO: generate href
    return React.createElement(
      tag,
      { id: node.id as string },
      <a href={`#${node.id as string}`}>#</a>,
      <MarkdownNodeRenderer node={node.children as Array<Node>} />
    );
  }
  if (node.type === 'text') {
    return <React.Fragment>{node.value as string}</React.Fragment>;
  }
  if (node.type === 'blockquote') {
    return (
      <blockquote>
        <MarkdownNodeRenderer node={node.children as Array<Node>} />
      </blockquote>
    );
  }
  if (node.type === 'paragraph') {
    return (
      <p>
        <MarkdownNodeRenderer node={node.children as Array<Node>} />
      </p>
    );
  }
  if (node.type === 'code') {
    return <CodeHighlight code={node.value as string} lang={node.lang as string} />;
  }
  if (node.type === 'strong') {
    return (
      <strong>
        <MarkdownNodeRenderer node={node.children as Array<Node>} />
      </strong>
    );
  }
  if (node.type === 'emphasis') {
    return (
      <em>
        <MarkdownNodeRenderer node={node.children as Array<Node>} />
      </em>
    );
  }
  if (node.type === 'link') {
    const url = node.url as string;
    if (url.startsWith(`https://github.com/etienne-dldc/tumau/tree/master/packages/tumau-`)) {
      const packageName = url.substring(`https://github.com/etienne-dldc/tumau/tree/master/packages/tumau-`.length);
      const p = PAGES.find(p => p.slug === `/package/${packageName}`);
      if (p) {
        return (
          <Link href="/package/[slug]" as={`/package/${packageName}`}>
            <a>
              <MarkdownNodeRenderer node={node.children as Array<Node>} />
            </a>
          </Link>
        );
      }
    }

    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        <MarkdownNodeRenderer node={node.children as Array<Node>} />
      </a>
    );
  }
  if (node.type === 'list') {
    return (
      <ul>
        <MarkdownNodeRenderer node={node.children as Array<Node>} />
      </ul>
    );
  }
  if (node.type === 'listItem') {
    return (
      <li>
        <MarkdownNodeRenderer node={node.children as Array<Node>} />
      </li>
    );
  }
  if (node.type === 'inlineCode') {
    return <code>{node.value as string}</code>;
  }
  if (node.type === 'html') {
    return null;
    // return <HtmlNodeRenderer node={node.parsed as Node} />;
  }
  if (node.type === 'image') {
    let url = node.url as string;
    if (url.startsWith('https://github.com/etienne-dldc/tumau/blob/master/design/')) {
      url = url.replace('https://github.com/etienne-dldc/tumau/blob/master/design/', '/images/');
    }
    return <img alt={node.alt as string} src={url} />;
  }

  return <pre>{JSON.stringify(node, null, 2)}</pre>;
};
