import * as prettier from 'prettier';
import * as fse from 'fs-extra';

export async function saveFile(path: string, content: string) {
  const prettierConf = await prettier.resolveConfig(path);
  const formatted = await prettier.format(content, {
    ...prettierConf,
    filepath: path,
  });
  await fse.writeFile(path, formatted);
}
