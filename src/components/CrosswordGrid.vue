<script>
const EMPTY = "/";
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
      grid: new Array(15 * 15).fill(" "),
      vertical: false,
      active: {
        i: null,
        row: null,
        col: null,
        el: null,
      },
      lastBack: false,
    };
  },
  methods: {
    setItem(v, i) {
      this.grid[i] = v;
      const storage = JSON.stringify(this.grid);
      localStorage.setItem("grid", storage);
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

      if (this.vertical) {
        row = normalize(row + (this.lastBack ? -1 : 1));
      } else {
        col = normalize(col + (this.lastBack ? -1 : 1));
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
    colorMount() {
      this.$refs.items.forEach((item, i) => {
        if (this.grid[i] === EMPTY) {
          setColor(item, "black");
        }
      });
    },
    navigate(e) {
      this.lastBack = e.key === "Backspace";
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
  },
  mounted() {
    window.addEventListener("keydown", this.navigate);
    const storage = localStorage.getItem("grid");
    if (storage) {
      this.grid = JSON.parse(storage);
      this.colorMount();
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
    <section class="grid">
      <input
        class="item"
        maxlength="1"
        ref="items"
        v-for="(_, i) in grid"
        :key="i"
        :value="grid[i]"
        @click="(e) => e.target.select()"
        @focus="(e) => focus(e, i)"
        @input="update"
      />
    </section>
  </article>
</template>

<style>
:root {
  --size: 30px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(15, var(--size));
  width: fit-content;
  border: 1px solid black;
  background-color: black;
  gap: 1px;
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
  border: unset;
  text-align: center;
  text-transform: uppercase;
}

.item:focus-visible {
  outline: none;
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
