<script>
	import { onMount } from "svelte";
	import { grid, labels } from "../stores";
	import { size, empty, block, coordinate } from "../util";

	let down = Array();
	let across = Array();

	$: down.length && localStorage.setItem("down", JSON.stringify(down));
	$: across.length && localStorage.setItem("across", JSON.stringify(across));

	$: (down || across) && localStorage.setItem("timestamp", new Date());

	$: (() => {
		down = $labels
			.filter((label) => label.down)
			.map((label, i) => {
				const hint = down.length > i ? down[i].hint : "";
				let { row, col } = coordinate(label.index);
				let word = "";
				let idx = row * size + col;
				while (row < size && $grid[idx] !== empty && $grid[idx] !== block) {
					word += $grid[idx];
					idx = ++row * size + col;
				}
				return { word: word.trim(), text: label.text, hint: hint };
			});

		across = $labels
			.filter((label) => label.across)
			.map((label, i) => {
				const hint = across.length > i ? across[i].hint : "";
				let { row, col } = coordinate(label.index);
				let word = "";
				let idx = row * size + col;
				while (col < size && $grid[idx] !== empty && $grid[idx] !== block) {
					word += $grid[idx];
					idx = row * size + ++col;
				}

				return { word: word.trim(), text: label.text, hint: hint };
			});
	})();

	const clear = () => {
		down = Array();
		across = Array();
	};

	onMount(() => {
		const localDown = localStorage.getItem("down");
		if (localDown) {
			down = JSON.parse(localDown);
		}

		const localAcross = localStorage.getItem("across");
		if (localAcross) {
			across = JSON.parse(localAcross);
		}
	});
</script>

<section id="container">
	<header>
		<h2>Hints</h2>
		<button class="clear" on:click={clear}>Clear Hints</button>
	</header>
	<div id="hints">
		<section>
			<h3>Down</h3>
			{#each down as d}
				<label>
					<span>{d.text} {d.word}</span>
					<input id="down-{d.text}" bind:value={d.hint} />
				</label>
			{/each}
		</section>
		<section>
			<h3>Across</h3>
			{#each across as a}
				<label>
					<span>{a.text} {a.word}</span>
					<input id="across-{a.text}" bind:value={a.hint} />
				</label>
			{/each}
		</section>
	</div>
</section>

<style>
	#container {
		max-width: calc(1000px - calc(var(--size) * var(--squarepx)));
		width: 100%;
	}

	#hints {
		outline: 1px solid black;
		height: calc(var(--size) * var(--squarepx));
		overflow: scroll;
		resize: both;
	}

	#hints section {
		padding: 0.5rem;
		padding-bottom: 0;
	}

	h3 {
		margin: 0;
		margin-bottom: 0.5rem;
	}

	label {
		display: flex;
		margin-bottom: 0.5rem;
		align-items: center;
	}

	label span {
		font-size: 12px;
		font-weight: bold;
		display: block;
		width: 225px;
	}

	label input {
		border: none;
		width: 100%;
		border-bottom: 1px solid black;
	}

	label input:focus-visible {
		outline: none;
	}
</style>
