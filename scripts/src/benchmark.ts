import * as autocannon from 'autocannon';
import { spawn } from 'child_process';
import * as path from 'path';
import createResultFile from './utils/benchmarkResult';
import { saveFile } from './utils/saveFile';

const LERNA_ROOT_PATH = path.resolve(__dirname, '../..');

run();

let currentInstance: autocannon.Instance | null = null;
let stopped = false;

process.once('SIGINT', async () => {
  if (currentInstance) {
    currentInstance.stop();
  }
  stopped = true;
  await wait(500);
});

const wait = (time: number) => new Promise(r => setTimeout(r, time));

const results: Array<any> = [];

async function run() {
  const benchList = ['fastify', 'tumau', 'tumau-json', 'tumau-full', 'express', 'koa'];

  const bench = async (name: string, port: number) => {
    return new Promise(async (resolve, reject) => {
      try {
        const filePath = path.resolve(LERNA_ROOT_PATH, `./benchmarks/src/${name}.js`);

        const env = Object.create(process.env);
        env.PORT = port.toString();

        const subProcess = await spawn('node', [filePath], { env });
        await wait(500);

        const instance = autocannon(
          {
            title: name,
            url: `http://localhost:${port}`,
            connections: 10,
            pipelining: 1,
            duration: 40,
          },
          (_error, result) => {
            results.push(result);
            subProcess.kill();
            resolve();
          }
        );
        currentInstance = instance;
        console.log(`\n\nBenchmarking ${name}\n`);
        autocannon.track(instance);
      } catch (error) {
        reject(error);
      }
    });
  };

  const runNext = async (index: number): Promise<void> => {
    const fileName = benchList[index];

    const port = 3020 + index;

    await bench(fileName, port);

    if (stopped) {
      return;
    }

    if (index < benchList.length - 1) {
      return await runNext(index + 1);
    }
    // generate result file
    try {
      const fileContent = createResultFile(results);
      const filePath = path.resolve(LERNA_ROOT_PATH, './benchmarks/result/index.html');
      await saveFile(filePath, fileContent);
    } catch (error) {
      console.log(error);
    }
    return;
  };

  await runNext(0);
}
