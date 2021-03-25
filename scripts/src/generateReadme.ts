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
  const { document } = await DocsyParser.parseDocument(content);
  const resolved = DocsyResolver.resolve(document, {
    jsx: (type: any, props: any) => {
      try {
        return type(props);
      } catch (error) {
        console.log({
          type,
          props,
        });
        throw error;
      }
    },
    globals: {
      ...MDComponents,
    },
  });

  const header = `<!-- This file has been generated, to change it edit ${path.relative(
    PROJECT_ROOT,
    sourceResolved
  )} -->\n`;

  await fse.writeFile(destResolved, header + resolved);
}
