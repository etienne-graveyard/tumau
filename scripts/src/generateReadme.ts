import * as fse from 'fs-extra';
import * as path from 'path';
import { DocsyParser, DocsyResolver } from 'docsy';
import * as MDComponents from './utils/MDComponents';

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const SOURCE_BASE = path.resolve(PROJECT_ROOT, 'docs', 'content');

main();

async function main() {
  await generateReadme('index.dy', '.');
}

async function generateReadme(sourcePath: string, destPath: string) {
  const sourceResolved = path.resolve(SOURCE_BASE, sourcePath);
  const destResolved = path.resolve(PROJECT_ROOT, destPath, 'README.md');
  const content = await fse.readFile(sourceResolved, { encoding: 'utf8' });
  console.log({
    sourceResolved,
    destResolved,
  });
  const { document } = DocsyParser.parseDocument(content);
  const resolved = DocsyResolver.resolve(document, {
    createElement: (type: any, props: any, ...children: any) => {
      try {
        return type({ ...props, children });
      } catch (error) {
        console.log({ ...props, children });
        throw error;
      }
    },
    ...MDComponents,
  }).join('');
  const header = `<!-- This file has been generated, to change it edit ${path.relative(
    PROJECT_ROOT,
    sourceResolved
  )} -->\n`;

  await fse.writeFile(destResolved, header + resolved);
}
