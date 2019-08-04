import fse from 'fs-extra';
import { saveFile } from './saveFile';
import sortPackageJson from 'sort-package-json';

async function run() {
  console.log('Norm in ' + process.env.LERNA_PACKAGE_NAME);

  const pkgPath = process.env.PWD + '/package.json';

  const pkg = JSON.parse((await fse.readFile(pkgPath)).toString());
  const rootPkg = JSON.parse((await fse.readFile(process.env.LERNA_ROOT_PATH + '/package.json')).toString());

  const keysToCopy = ['author', 'license', 'homepage', 'bugs', 'repository'];
  keysToCopy.forEach(key => {
    if (rootPkg[key]) {
      pkg[key] = rootPkg[key];
    }
  });

  await saveFile(pkgPath, JSON.stringify(sortPackageJson(pkg)));
}

run();
