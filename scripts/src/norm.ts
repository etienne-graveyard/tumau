import * as path from 'path';
import * as fse from 'fs-extra';
import { saveFile } from './utils/saveFile';
import * as sortPackageJson from 'sort-package-json';

norm();

async function norm() {
  const name = process.env.LERNA_PACKAGE_NAME || '';
  console.log('Norm in ' + name);
  const pkg = await normPackageJson();
  if (name === 'tumau' || name.startsWith('@tumau/') || name.startsWith('@tumau-example/')) {
    normReadme(pkg);
  }
}

async function normPackageJson() {
  const pkgPath = process.env.PWD + '/package.json';
  const pkg = JSON.parse((await fse.readFile(pkgPath)).toString());
  const rootPkg = JSON.parse((await fse.readFile(process.env.LERNA_ROOT_PATH + '/package.json')).toString());
  const keysToCopy = ['author', 'license', 'homepage', 'bugs', 'repository'];
  keysToCopy.forEach(key => {
    if (rootPkg[key]) {
      pkg[key] = rootPkg[key];
    }
  });
  const examplesFolder = path.resolve(process.env.LERNA_ROOT_PATH || '', 'examples');
  const isExample = pkgPath.startsWith(examplesFolder + '/');
  if (isExample) {
    const folder = path.basename(path.dirname(pkgPath));
    const packageName = `@tumau-example/${folder}`;
    pkg.name = packageName;
  }

  await saveFile(pkgPath, JSON.stringify((sortPackageJson as any)(pkg)));
  return pkg;
}

async function normReadme(pkg: any) {
  const localRoot = process.env.PWD || '';
  const readmePath = process.env.PWD + '/README.md';
  const readmeLocalPath = process.env.PWD + '/README.local.md';
  const readmeTemplatePath = process.env.LERNA_ROOT_PATH + '/README.template.md';
  const rootReadmePath = process.env.LERNA_ROOT_PATH + '/README.md';

  const isRootPackage = process.env.LERNA_PACKAGE_NAME === 'tumau';

  const local = fse.existsSync(readmeLocalPath) ? (await fse.readFile(readmeLocalPath)).toString() : null;
  const template = (await fse.readFile(readmeTemplatePath)).toString();
  const result = (isRootPackage
    ? local
      ? [local]
      : []
    : [
        `# ${process.env.LERNA_PACKAGE_NAME}${pkg.private === true ? ' (private)' : ''}`,
        ...(pkg.description ? [``, `> ${pkg.description}`] : []),
        ``,
        template,
        ...(local ? [``, local] : []),
      ]
  ).join('\n');

  const resutlReplaced = await replaceInjectTags(result, localRoot, pkg);

  await saveFile(readmePath, resutlReplaced);
  if (isRootPackage) {
    await saveFile(rootReadmePath, resutlReplaced);
  }
}

async function replaceInjectTags(content: string, localRoot: string, pkg: any): Promise<string> {
  const injectTags = Array.from(content.matchAll(/\[\[([A-Za-z0-9_@\-.\/]+)\]\]/g)).map(match => ({
    path: match[1],
    position: match.index,
  }));

  const injectValues = await Promise.all(
    injectTags.map(async tag => {
      const { file, isLocal } = resolveFilePath(localRoot, tag.path);
      let content = await fse.readFile(file, 'utf8');
      if (isLocal) {
        content = content.replace(/from \'\.\.\/src\'/g, `from '${pkg.name}'`);
      }
      const lines = content.split('\n');
      while (lines[0].startsWith(`/* eslint-disable`)) {
        lines.shift();
      }
      content = lines.join('\n');
      return {
        path: tag.path,
        content,
        ext: path.extname(file).substring(1),
      };
    })
  );

  const resutlReplaced = content.replace(/\[\[([A-Za-z0-9_@\-.\/]+)\]\]/g, (match, path) => {
    const replacer = injectValues.find(i => i.path === path);
    if (!replacer) {
      return match;
    }
    return ['```' + replacer.ext, replacer.content, '```'].join('\n');
  });

  return resutlReplaced;
}

function resolveFilePath(root: string, pathStr: string): { file: string; isLocal: boolean; packageFolder: string } {
  if (pathStr.startsWith('/')) {
    throw new Error(`Absolute import not supported`);
  }
  if (pathStr.startsWith('.') === false) {
    const hasNamespace = pathStr.startsWith('@');
    // module
    const parts = pathStr.split('/');
    const [p1, p2, ...pathParts] = parts;
    const packageName = hasNamespace ? [p1, p2].join('/') : p1;
    const filePath = hasNamespace ? pathParts.join('/') : [p2, ...pathParts].join('/');
    const packageFolder = findModuleRoot(require.resolve(packageName));
    const resolved = path.resolve(packageFolder, filePath);
    return { file: resolved, isLocal: false, packageFolder };
  }
  // relative file
  const resolved = path.resolve(root, pathStr);
  const packageFolder = findModuleRoot(resolved);
  return { file: resolved, isLocal: true, packageFolder };
}

function findModuleRoot(pathStr: string): string {
  if (!fse.pathExistsSync(pathStr)) {
    throw new Error('Path does not exist');
  }
  if (pathStr === '/') {
    throw new Error(`Could not find module root`);
  }
  if (fse.statSync(pathStr).isFile()) {
    return findModuleRoot(path.dirname(pathStr));
  }
  const packagePath = path.resolve(pathStr, 'package.json');
  if (fse.pathExistsSync(packagePath) && fse.statSync(packagePath).isFile()) {
    return pathStr;
  }
  return findModuleRoot(path.dirname(pathStr));
}
