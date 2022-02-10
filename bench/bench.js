import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { Worker } from 'worker_threads';

const BENCHMARKS = {
  packed_1: 5_000,
  packed_5: 1_000,
  simple_iter: 1_000,
  frag_iter: 100,
  entity_cycle: 1_000,
  add_remove: 1_000,
};

for (let name in BENCHMARKS) {
  let config = BENCHMARKS[name];
  let path = `./cases/${name}.js`;
  let log = `  ${name} ${' '.repeat(14 - name.length)}`;
  try {
    //	console.log(path,BENCHMARKS)
    let result = await run_bench(path, config);
    console.log(`${log} ${Math.floor(result.hz).toLocaleString()} op/s`);
  } catch (err) {
    console.log(`${log} ${err.code ?? 'ERROR'}`);
    console.log(err.stack);
  }
}

/*
console.log("|     | " + Object.keys(BENCHMARKS).join(" | ") + " |");
console.log("| --- | " + "--: |".repeat(Object.keys(BENCHMARKS).length));
for (let i = 0; i < LIBRARIES.length; i++) {
  console.log(
    `| ${LIBRARIES[i]} | ` +
      RESULTS[i]
        .map((result) =>
          "hz" in result
            ? `${Math.floor(result.hz).toLocaleString()} op/s`
            : result.code ?? "ERROR"
        )
        .join(" | ") +
      " |"
  );
}
*/

function run_bench(path, config) {
  let current_dir = dirname(fileURLToPath(import.meta.url));
  let worker_file = resolve(current_dir, 'bench_worker.js');

  return new Promise((resolve, reject) => {
    let worker = new Worker(worker_file, {
      workerData: {
        path,
        config,
      },
    });

    worker.on('message', resolve);
    worker.on('error', reject);
  });
}
