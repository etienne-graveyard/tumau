import * as path from 'path';
import fse from 'fs-extra';
import unified from 'unified';
import markdown from 'remark-parse';
import html from 'rehype-parse';
import { Node } from 'unist';
import visit from 'unist-util-visit';
import { PAGES, Page, Slug } from './pages';

const markdownProcessor = unified().use(markdown, { commonmark: true });
const htmlProcessor = unified().use(html, { fragment: true });

export type PageContent = Node;

export interface PageData {
  page: Page;
  content: Node;
}

export async function packagePageData(slug: Slug): Promise<PageData> {
  const page = PAGES.find((p) => p.slug === slug);
  if (!page) {
    throw new Error(`Cannot find package with slug ${slug}`);
  }
  const monorepoPath = path.resolve(process.cwd(), '..');
  const readmePath = path.resolve(monorepoPath, page.file);
  const readmeContent = await fse.readFile(readmePath, 'utf8');
  const parsed = markdownProcessor.parse(readmeContent);
  visit(parsed, 'html', (node) => {
    node.parsed = htmlProcessor.parse(node.value as string);
  });
  const usedIds = new Set<string>();
  visit(parsed, 'heading', (node) => {
    const title = nodeToString(node.children as Array<Node>);
    const id = title
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/[^\w\-]+/g, '') // Remove all non-word chars
      .replace(/\-\-+/g, '-') // Replace multiple - with single -
      .replace(/^-+/, '') // Trim - from start of text
      .replace(/-+$/, ''); // Trim - from end of text
    let uniqueId = id;
    if (usedIds.has(id)) {
      let num = 1;
      uniqueId = id + '-' + num;
      while (uniqueId) {
        num += 1;
        uniqueId = id + '-' + num;
      }
    }
    node.id = uniqueId;
  });
  return {
    page: page,
    content: parsed,
  };
}

function nodeToString(node: Array<Node> | Node): string {
  if (Array.isArray(node)) {
    return node.map((n) => nodeToString(n)).join('');
  }
  if (node.type === 'text') {
    return node.value as string;
  }
  if (node.type === 'inlineCode') {
    return node.value as string;
  }
  throw new Error(`Unhandled node ${node.type} in nodeToString`);
}
