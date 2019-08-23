import * as fse from 'fs-extra';
import { saveFile } from './utils/saveFile';
import * as sortPackageJson from 'sort-package-json';

norm();

async function norm() {
  console.log('Norm in ' + process.env.LERNA_PACKAGE_NAME);
  const pkg = await normPackageJson();
  normReadme(pkg);
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
  await saveFile(pkgPath, JSON.stringify((sortPackageJson as any)(pkg)));
  return pkg;
}

async function normReadme(pkg: any) {
  const readmePath = process.env.PWD + '/README.md';
  const readmeLocalPath = process.env.PWD + '/README.local.md';
  const readmeTemplatePath = process.env.LERNA_ROOT_PATH + '/README.template.md';
  const local = fse.existsSync(readmeLocalPath) ? (await fse.readFile(readmeLocalPath)).toString() : null;
  const template = (await fse.readFile(readmeTemplatePath)).toString();
  const result = [
    `# ${process.env.LERNA_PACKAGE_NAME}`,
    ...(pkg.description ? [``, `> ${pkg.description}`] : []),
    ``,
    template,
    ...(local ? [``, local] : []),
  ].join('\n');

  await saveFile(readmePath, result);
}
