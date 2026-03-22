const { fork } = require('child_process');
const { performance } = require('perf_hooks');
const os = require('os');
const path = require('path');

const TOTAL = 300_000;

/** Диапазоны [start, end], покрывающие 1..TOTAL без пересечений и пропусков */
function splitIntoRanges(total, parts) {
	const ranges = [];
	const base = Math.floor(total / parts);
	const rem = total % parts;
	let start = 1;
	for (let i = 0; i < parts; i++) {
		const len = base + (i < rem ? 1 : 0);
		const end = start + len - 1;
		ranges.push({ start, end });
		start = end + 1;
	}
	return ranges;
}

function countDivisibleBy3Simple(arr) {
	let count = 0;
	for (let i = 0; i < arr.length; i++) {
		if (arr[i] % 3 === 0) count++;
	}
	return count;
}

function runForkChunk(range) {
	return new Promise((resolve, reject) => {
		const child = fork(path.join(__dirname, 'fork.js'));
		child.on('message', (msg) => resolve(msg));
		child.on('error', reject);
		child.on('exit', (code) => {
			if (code !== 0 && code !== null) {
				reject(new Error(`fork exited with code ${code}`));
			}
		});
		child.send(range);
	});
}

async function main() {
	const cores = os.cpus().length;

	// 1) Простой цикл по массиву 1..300_000
	const t0 = performance.now();
	const arr = Array.from({ length: TOTAL }, (_, i) => i + 1);
	const countSimple = countDivisibleBy3Simple(arr);
	const t1 = performance.now();

	console.log('--- Простой цикл ---');
	console.log(`Чисел, делящихся на 3: ${countSimple}`);
	console.log(`Время: ${(t1 - t0).toFixed(3)} ms`);
	console.log();

	// 2) N процессов (N = число ядер)
	const ranges = splitIntoRanges(TOTAL, cores);
	const t2 = performance.now();
	const partials = await Promise.all(ranges.map((r) => runForkChunk(r)));
	const countFork = partials.reduce((a, b) => a + b, 0);
	const t3 = performance.now();

	console.log(`--- ${cores} процессов (fork), чанки по диапазонам 1..${TOTAL} ---`);
	console.log(`Чисел, делящихся на 3: ${countFork}`);
	console.log(`Время: ${(t3 - t2).toFixed(3)} ms`);
	console.log();
	console.log(
		`Ускорение (простой / fork): ${((t1 - t0) / (t3 - t2)).toFixed(2)}× (fork может быть медленнее из-за накладных расходов)`
	);
}

main().catch(console.error);
