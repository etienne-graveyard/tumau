import * as fse from 'fs-extra';

async function run() {
  console.log('Norm in ' + process.env.LERNA_PACKAGE_NAME + ' (' + process.env.INIT_CWD + ')');
  console.log(process.env.PWD + '/package.json');

  const pkgStr = await fse.readFile(process.env.PWD + '/package.json');
  const pkg = JSON.parse(pkgStr.toString());

  console.log(pkg);
}

run();
