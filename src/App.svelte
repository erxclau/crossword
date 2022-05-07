<script>
  import { onMount } from "svelte";

  const size = 15;
  const empty = " ";
  const block = "/";
  let grid = Array();
  let labels = Array();
  let down = Array();
  let across = Array();
  let vertical = false;

  let current;

  $: grid.length && localStorage.setItem("grid", JSON.stringify(grid));
  $: down.length && localStorage.setItem("down", JSON.stringify(down));
  $: across.length && localStorage.setItem("across", JSON.stringify(across));

  $: (() => {
    labels = grid.reduce((arr, sq, i) => {
      const { row, col } = coordinate(i);
      if (sq !== block) {
        const top = grid[(row - 1) * size + col];
        const left = grid[row * size + col - 1];

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

  $: (() => {
    down = labels
      .filter((label) => label.down)
      .map((label, i) => {
        const hint = down.length > i ? down[i].hint : "";
        let { row, col } = coordinate(label.index);
        let word = "";
        let idx = row * size + col;
        while (row < size && grid[idx] !== empty && grid[idx] !== block) {
          word += grid[idx];
          idx = ++row * size + col;
        }
        return { word: word.trim(), text: label.text, hint: hint };
      });

    across = labels
      .filter((label) => label.across)
      .map((label, i) => {
        const hint = across.length > i ? across[i].hint : "";
        let { row, col } = coordinate(label.index);
        let word = "";
        let idx = row * size + col;
        while (col < size && grid[idx] !== empty && grid[idx] !== block) {
          word += grid[idx];
          idx = row * size + ++col;
        }

        return { word: word.trim(), text: label.text, hint: hint };
      });
  })();

  const row = (i) => Math.floor(i / size);
  const col = (i) => i % size;
  const coordinate = (i) => ({ row: Math.floor(i / size), col: i % size });
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

  const clearGrid = () => {
    grid = Array(size * size).fill(empty);
  };

  const clearHints = () => {
    down = Array();
    across = Array();
  };

  const reflect = (i) => {
    const { row, col } = coordinate(i);
    const orow = Math.abs(size - row) - 1;
    const ocol = Math.abs(size - col) - 1;
    return orow * size + ocol;
  };

  onMount(() => {
    const localGrid = localStorage.getItem("grid");
    grid = localGrid ? JSON.parse(localGrid) : Array(size * size).fill(empty);

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
  <section id="crossword">
    <section id="grid-container">
      <header>
        <h2>Grid</h2>
        <button class="clear" on:click={clearGrid}>Clear Grid</button>
      </header>
      <div id="grid">
        {#each grid as square, i}
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
                grid[reflect(i)] = block;
              }
              if (square === block && v !== block) {
                grid[reflect(i)] = empty;
              }

              const insert = e.inputType === "insertText";
              grid[i] = insert ? v : empty;

              const n = next(i, insert);
              if (i === n && grid[i] === empty) {
                grid[i] = "";
              }
              move(e.target, n);
            }}
            bind:value={square}
          />
        {/each}
        {#each labels as label}
          <label
            class="label"
            style:top="calc({row(label.index)} * var(--squarepx) + 1.5px)"
            style:left="calc({col(label.index)} * var(--squarepx) + 1.5px)"
            for="square-{label.index}"
            >{label.text}
          </label>
        {/each}
      </div>
    </section>
    <section id="hints-container">
      <header>
        <h2>Hints</h2>
        <button class="clear" on:click={clearHints}>Clear Hints</button>
      </header>
      <div id="hints">
        <section>
          <h3>Down</h3>
          {#each down as d}
            <label class="hint">
              <span>{d.text} {d.word}</span>
              <input id="down-{d.text}" bind:value={d.hint} />
            </label>
          {/each}
        </section>
        <section>
          <h3>Across</h3>
          {#each across as a}
            <label class="hint">
              <span>{a.text} {a.word}</span>
              <input id="across-{a.text}" bind:value={a.hint} />
            </label>
          {/each}
        </section>
      </div>
    </section>
  </section>
</main>

<style>
  :root {
    --squarepx: 32.5px;
  }

  main {
    margin: 0.5rem;
  }

  details {
    margin: 1rem 0;
  }

  ol {
    max-width: calc(var(--size) * var(--squarepx));
    padding-inline-start: 20px;
    margin: 0.5rem 0;
  }

  h2 {
    margin: 0;
    margin-bottom: 0.5rem;
  }

  .clear {
    margin-bottom: 0.5rem;
    padding: 0.25rem 0.5rem;
    background-color: rgb(211, 222, 226);
    border: none;
    cursor: pointer;
    font-weight: bold;
  }
  .clear:hover {
    background-color: rgb(165, 172, 175);
  }

  #crossword {
    display: flex;
    gap: 1rem;
  }

  @media screen and (max-width: 1000px) {
    #crossword {
      flex-direction: column;
    }
  }

  #grid-container {
    max-width: calc(var(--size) * var(--squarepx));
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
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

  #hints-container {
    width: calc(1000px - calc(var(--size) * var(--squarepx)));
  }

  #hints {
    outline: 1px solid black;
    height: calc(var(--size) * var(--squarepx));
    overflow: scroll;
  }

  #hints section {
    padding: 0.5rem;
    padding-bottom: 0;
  }

  #hints h3 {
    margin: 0;
    margin-bottom: 0.5rem;
  }

  .hint {
    display: flex;
    margin-bottom: 0.5rem;
    align-items: center;
  }

  .hint span {
    font-size: 12px;
    font-weight: bold;
    display: block;
    width: 225px;
  }

  .hint input {
    border: none;
    width: 100%;
    border-bottom: 1px solid black;
  }

  .hint input:focus-visible {
    outline: none;
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

  .label {
    position: absolute;
    font-size: 9px;
  }
</style>
