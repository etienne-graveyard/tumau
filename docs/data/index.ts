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
  console.log(slug);
  const page = PAGES.find(p => p.slug === slug);
  if (!page) {
    throw new Error(`Cannot find package with slug ${slug}`);
  }
  const monorepoPath = path.resolve(process.cwd(), '..');
  const readmePath = path.resolve(monorepoPath, page.file);
  const readmeContent = await fse.readFile(readmePath, 'utf8');
  const parsed = markdownProcessor.parse(readmeContent);
  visit(parsed, 'html', node => {
    node.parsed = htmlProcessor.parse(node.value as string);
  });
  return {
    page: page,
    content: parsed,
  };
}
