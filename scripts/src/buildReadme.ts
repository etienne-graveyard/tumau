import { parse, resolve } from 'docsy';
import * as fse from 'fs-extra';
import * as path from 'path';

main();

function createElement(type: any, props: any, ...children: Array<any>) {
  return {
    type,
    props,
    children,
  };
}

const COMPONENTS = {
  Image: (props: any) => {
    console.log('TODO', props);
  },
  Center: (props: any) => {
    console.log('TODO', props);
  },
  Title: (props: any) => {
    console.log('TODO', props);
  },
  SubTitle: (props: any) => {
    console.log('TODO', props);
  },
  Quote: (props: any) => {
    console.log('TODO', props);
  },
  LineComment: (props: any) => {
    console.log('TODO', props);
  },
};

async function main() {
  const indexPath = path.resolve(__dirname, '../../docs/content/index.docsy');
  const content = await fse.readFile(indexPath, { encoding: 'utf8' });
  const parsed = parse(content);
  const md = parsed.children.map(child => {
    return resolve(child, {
      createElement,
      ...COMPONENTS,
    });
  });

  console.log(md.length);
}
