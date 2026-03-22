/**
 * Дочерний процесс: считает, сколько чисел в диапазоне [start, end] делятся на 3.
 */
process.on('message', (msg) => {
	const { start, end } = msg;
	let count = 0;
	for (let n = start; n <= end; n++) {
		if (n % 3 === 0) count++;
	}
	process.send(count);
	process.disconnect();
});
