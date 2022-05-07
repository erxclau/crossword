<script>
  import { onMount } from "svelte";
  import { grid, labels } from "./stores";
  import { size, empty, block, coordinate } from "./util";

  let vertical = false;

  let current;

  $: $grid.length && localStorage.setItem("grid", JSON.stringify($grid));

  $: (() => {
    $labels = $grid.reduce((arr, sq, i) => {
      const { row, col } = coordinate(i);
      if (sq !== block) {
        const top = $grid[(row - 1) * size + col];
        const left = $grid[row * size + col - 1];

        if (row === 0 || col === 0) {
          arr.push({
            index: i,
            text: arr.length + 1,
            down: row === 0,
            across: col === 0,
          });
        } else if (top === block || left === block) {
          arr.push({
            index: i,
            text: arr.length + 1,
            down: top === block,
            across: left === block,
          });
        }
      }
      return arr;
    }, Array());
  })();

  const row = (i) => Math.floor(i / size);
  const col = (i) => i % size;

  const reflect = (i) => {
    const { row, col } = coordinate(i);
    const orow = Math.abs(size - row) - 1;
    const ocol = Math.abs(size - col) - 1;
    return orow * size + ocol;
  };

  const normalize = (major, minor, increment) => {
    const tmp = major + increment;
    if (tmp < 0 && minor > 0) {
      minor--;
      major = size - 1;
    } else if (tmp > size - 1 && minor < size - 1) {
      minor++;
      major = 0;
    } else if (tmp < size && tmp > -1) {
      major = tmp;
    }
    return { major, minor };
  };

  const next = (i, forward) => {
    let { row, col } = coordinate(i);
    const v = forward ? 1 : -1;
    if (vertical) {
      ({ major: row, minor: col } = normalize(row, col, v));
    } else {
      ({ major: col, minor: row } = normalize(col, row, v));
    }
    return row * size + col;
  };

  const move = (selection, i) => {
    const child = selection.parentNode.children[i];
    child.focus();
    child.select();
  };

  const focus = (e, i) => {
    const square = e.target;
    square.select();
    current = i;
  };

  const clear = () => {
    $grid = Array(size * size).fill(empty);
  };

  onMount(() => {
    const localGrid = localStorage.getItem("grid");
    $grid = localGrid ? JSON.parse(localGrid) : Array(size * size).fill(empty);
  });
</script>

<svelte:window
  on:keydown={(e) => {
    const arrows = new Set(["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"]);
    const selected = document.querySelector(".square:focus-visible");
    if (selected && arrows.has(e.key)) {
      e.preventDefault();

      const index = [...selected.parentNode.children].indexOf(selected);
      let n = index;

      if (vertical) {
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
          vertical = false;
        } else {
          n = next(index, e.key === "ArrowDown");
        }
      } else {
        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
          vertical = true;
        } else {
          n = next(index, e.key === "ArrowRight");
        }
      }

      move(selected, n);
    }
  }}
/>

<section>
  <header>
    <h2>Grid</h2>
    <button class="clear" on:click={clear}>Clear Grid</button>
  </header>
  <div id="grid">
    {#each $grid as square, i}
      <input
        id="square-{i}"
        class="square"
        class:block={square === block}
        class:active={i === current}
        class:axis={(() => {
          const axis = vertical ? "col" : "row";
          return (
            coordinate(i)[axis] === coordinate(current)[axis] &&
            i !== current &&
            square !== block
          );
        })()}
        maxlength="1"
        on:click={(e) => e.target.select()}
        on:focus={(e) => focus(e, i)}
        on:input={(e) => {
          const input = e.target;
          const v = input.value.toUpperCase();

          if (square !== block && v === block) {
            $grid[reflect(i)] = block;
          }
          if (square === block && v !== block) {
            $grid[reflect(i)] = empty;
          }

          const insert = e.inputType === "insertText";
          $grid[i] = insert ? v : empty;

          const n = next(i, insert);
          if (i === n && $grid[i] === empty) {
            $grid[i] = "";
          }
          move(e.target, n);
        }}
        bind:value={square}
      />
    {/each}
    {#each $labels as label}
      <label
        style:top="calc({row(label.index)} * var(--squarepx) + 1.5px)"
        style:left="calc({col(label.index)} * var(--squarepx) + 1.5px)"
        for="square-{label.index}"
        >{label.text}
      </label>
    {/each}
  </div>
</section>

<style>
  section {
    max-width: calc(var(--size) * var(--squarepx));
  }

  #grid {
    display: grid;
    grid-template-columns: repeat(var(--size), var(--squarepx));
    position: relative;
    width: fit-content;
    outline: 1px solid black;
    box-sizing: border-box;
    margin: 0px;
  }

  .square {
    width: var(--squarepx);
    height: var(--squarepx);

    display: grid;
    align-items: center;
    justify-content: center;

    font-weight: bold;
    text-align: center;
    text-transform: uppercase;

    background-color: white;
    padding: 0;
    outline: 1px solid black;
    border: unset;
  }

  .square::selection {
    background: transparent;
  }

  .block {
    background-color: black;
  }

  .active {
    background-color: lightcoral;
  }

  .axis {
    background-color: lightyellow;
  }

  label {
    position: absolute;
    font-size: 9px;
  }
</style>
