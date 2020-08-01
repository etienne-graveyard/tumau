import React from 'react';
import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';
import bash from 'highlight.js/lib/languages/bash';
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('bash', bash);

interface Props {
  lang: string;
  code: string;
}

export const CodeHighlight: React.FC<Props> = ({ code, lang }) => {
  const el = React.useRef<HTMLPreElement>(null);

  React.useEffect(() => {
    if (el.current) {
      hljs.highlightBlock(el.current);
    }
  }, []);

  return (
    <pre ref={el}>
      <code className={`hljs language-${lang}`}>{code}</code>
    </pre>
  );
};
