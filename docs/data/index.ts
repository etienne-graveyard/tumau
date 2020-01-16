import * as path from 'path';
import fse from 'fs-extra';
import unified from 'unified';
import markdown from 'remark-parse';
import html from 'rehype-parse';
import { Node } from 'unist';
import visit from 'unist-util-visit';
import PACKAGES from './packages.json';

const markdownProcessor = unified().use(markdown, { commonmark: true });
const htmlProcessor = unified().use(html, { fragment: true });

export interface PageData {
  packageName: string;
  packageSlug: string;
  content: Node;
}

export async function packagePageData(slug: string): Promise<PageData> {
  const pkg = slug === 'tumau' ? { name: 'tumau', path: '.', slug: 'tumau' } : PACKAGES.find(p => p.slug === slug);
  if (!pkg) {
    throw new Error(`Cannot find package with slug ${slug}`);
  }
  const monorepoPath = path.resolve(process.cwd(), '..');
  const readmePath = path.resolve(monorepoPath, pkg.path, 'README.md');
  const readmeContent = await fse.readFile(readmePath, 'utf8');
  const parsed = markdownProcessor.parse(readmeContent);
  visit(parsed, 'html', node => {
    node.parsed = htmlProcessor.parse(node.value as string);
  });
  return {
    packageSlug: pkg.slug,
    packageName: pkg.name,
    content: parsed,
  };
}
