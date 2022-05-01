<script>
const EMPTY = "/";
const SIZE = 35;
const setColor = (element, color) => {
  element.style.backgroundColor = color;
};

const normalize = (num) => {
  if (num < 0) {
    num = 0;
  }
  if (num > 14) {
    num = 14;
  }
  return num;
};

export default {
  data() {
    return {
      grid: Array(15 * 15).fill(" "),
      vertical: false,
      back: false,
      active: {
        i: null,
        row: null,
        col: null,
        el: null,
      },
    };
  },
  methods: {
    label() {
      let l = 1;
      this.$refs.labels.forEach((el, i) => {
        const row = Math.floor(i / 15);
        const col = i % 15;

        el.style.top = `${row * SIZE + 1.5}px`;
        el.style.left = `${col * SIZE + 1.5}px`;

        el.style.display = "none";

        if (this.grid[row * 15 + col] !== EMPTY) {
          if (row === 0 || col === 0) {
            el.style.display = "unset";
            el.textContent = l;
            l++;
          }

          const top = this.grid[(row - 1) * 15 + col];
          const left = this.grid[row * 15 + col - 1];
          if (top === EMPTY || left === EMPTY) {
            el.style.display = "unset";
            el.textContent = l;
            l++;
          }
        }
      });
    },
    setItem(v, i) {
      this.grid[i] = v;
      localStorage.setItem("grid", JSON.stringify(this.grid));
    },
    colorUpdate(e) {
      const { row, col, i } = this.active;
      const orow = Math.abs(15 - row) - 1;
      const ocol = Math.abs(15 - col) - 1;

      const item = this.$refs.items[i];
      if (e.target.value === EMPTY) {
        setColor(item, "black");
        setColor(this.$refs.items[orow * 15 + ocol], "black");
        this.setItem(EMPTY, orow * 15 + ocol);
      } else {
        if (item.style.backgroundColor === "black") {
          setColor(item, "white");
        }
      }

      if (this.grid[i] === EMPTY && e.target.value !== EMPTY) {
        setColor(item, "lightcoral");
        setColor(this.$refs.items[orow * 15 + ocol], "white");
        this.setItem(" ", orow * 15 + ocol);
      }
    },
    update(e) {
      let { row, col, i } = this.active;

      this.colorUpdate(e);
      this.setItem(e.target.value.toUpperCase(), i);
      this.label();

      if (this.vertical) {
        row = normalize(row + (this.back ? -1 : 1));
      } else {
        col = normalize(col + (this.back ? -1 : 1));
      }

      this.moveActive(e, row * 15 + col);
    },
    colorFocus() {
      this.$refs.items.forEach((item) => {
        if (
          item.style.backgroundColor === "lightcoral" ||
          item.style.backgroundColor === "lightyellow"
        ) {
          setColor(item, "white");
        }
        if (item === document.activeElement) {
          if (this.grid[this.active.i] === EMPTY) {
            setColor(item, "black");
          } else {
            setColor(item, "lightcoral");
          }
        }
      });

      const getIndex = this.vertical
        ? (i) => i * 15 + this.active.col
        : (i) => this.active.row * 15 + i;

      for (let i = 0; i < 15; i++) {
        const index = getIndex(i);
        const item = this.$refs.items[index];
        if (item !== this.active.el && this.grid[index] !== EMPTY) {
          setColor(item, "lightyellow");
        }
      }
    },
    focus(e, i) {
      e.target.select();

      this.active.i = i;
      this.active.row = Math.floor(i / 15);
      this.active.col = i % 15;
      this.active.el = document.activeElement;

      this.colorFocus();
    },
    moveActive(e, i) {
      if (i !== this.active.i) {
        e.preventDefault();
        this.active.i = i;
        const item = this.$refs.items[i];
        item.focus();
        item.select();
      }
      this.colorFocus();
    },
    navigate(e) {
      this.back = e.key === "Backspace";
      const arrows = new Set([
        "ArrowRight",
        "ArrowLeft",
        "ArrowUp",
        "ArrowDown",
      ]);
      const selected = document.querySelector(".item:focus-visible");
      if (selected && arrows.has(e.key)) {
        let { row, col } = this.active;
        if (this.vertical) {
          if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
            this.vertical = false;
          } else {
            row = normalize(row + (e.key === "ArrowUp" ? -1 : 1));
          }
        } else {
          if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            this.vertical = true;
          } else {
            col = normalize(col + (e.key === "ArrowLeft" ? -1 : 1));
          }
        }
        this.moveActive(e, row * 15 + col);
      }
    },
    clear() {
      this.grid = new Array(15 * 15).fill(" ");
      localStorage.setItem("grid", JSON.stringify(this.grid));
      this.$refs.items.forEach((item) => {
        setColor(item, "white");
      });
      this.label();
    },
  },
  mounted() {
    window.addEventListener("keydown", this.navigate);
    const storage = localStorage.getItem("grid");
    if (storage) {
      this.grid = JSON.parse(storage);
      this.$refs.items.forEach((item, i) => {
        if (this.grid[i] === EMPTY) {
          setColor(item, "black");
        }
      });
      this.label();
    }
  },
  beforeUnmount() {
    window.removeEventListener("keydown", this.navigate);
  },
};
</script>

<template>
  <article>
    <h2>Crossword grid</h2>
    <button role="button" class="clear" @click="clear">Clear</button>
    <section class="crossword">
      <section class="grid">
        <input
          class="item"
          maxlength="1"
          ref="items"
          v-for="(_, i) in grid"
          :key="i"
          :value="grid[i]"
          :id="`input-${i}`"
          @click="(e) => e.target.select()"
          @focus="(e) => focus(e, i)"
          @input="update"
        />
      </section>
      <section>
        <label
          v-for="(_, i) in grid"
          :key="i"
          :for="`input-${i}`"
          class="label"
          ref="labels"
        ></label>
      </section>
    </section>
  </article>
</template>

<style>
:root {
  --size: 35px;
}

.crossword {
  position: relative;
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

.grid {
  display: grid;
  grid-template-columns: repeat(15, var(--size));
  width: fit-content;
  outline: 1px solid black;
}

.item {
  width: var(--size);
  height: var(--size);
  display: grid;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  background-color: white;
  padding: 0;
  outline: 1px solid black;
  border: unset;
  text-align: center;
  text-transform: uppercase;
}

.label {
  position: absolute;
  font-size: 9px;
}

.item:focus-visible {
  background-color: lightcoral;
  caret-color: transparent;
}

.item::selection {
  background: transparent;
}

.item::-moz-selection {
  background: transparent;
}
</style>
