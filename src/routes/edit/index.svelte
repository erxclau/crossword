<script>
	import GridContainer from "../../components/GridContainer.svelte";
	import HintContainer from "../../components/HintContainer.svelte";
	import { size } from "../../util";
</script>

<svelte:head>
	<title>Crossword</title>
</svelte:head>

<main style="--size: {size};">
	<h1>Crossword</h1>
	<details>
		<summary><b>Guidelines</b></summary>
		<ol>
			<li>Do not have more than 38 black squares</li>
			<li>Do not have more than 78 words</li>
			<li>Do not have 1 or 2 letter words</li>
			<li>The puzzle theme must consist of at least 3 entries</li>
			<li>The puzzle theme must total at least 33 squares</li>
		</ol>
	</details>
	<section>
		<GridContainer />
		<HintContainer />
	</section>
</main>

<style>
	:global(:root) {
		--squarepx: 32.5px;
	}

	:global(h2) {
		margin: 0;
		margin-bottom: 0.5rem;
	}

	:global(header) {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	:global(.clear) {
		margin-bottom: 0.5rem;
		padding: 0.25rem 0.5rem;
		background-color: rgb(211, 222, 226);
		border: none;
		cursor: pointer;
		font-weight: bold;
	}

	:global(.clear:hover) {
		background-color: rgb(165, 172, 175);
	}

	main {
		margin: 0.5rem;
	}

	details {
		margin: 1rem 0;
	}

	ol {
		max-width: calc(max(var(--size), 15) * var(--squarepx));
		padding-inline-start: 20px;
		margin: 0.5rem 0;
	}

	section {
		display: flex;
		gap: 1rem;
	}

	@media screen and (max-width: 1000px) {
		section {
			flex-direction: column;
		}
	}
</style>
