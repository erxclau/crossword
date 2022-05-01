<script>
const EMPTY = "/";

export default {
  data() {
    return {
      grid: new Array(15 * 15).fill(" "),
      vertical: false,
      activeIndex: null,
      lastBack: false,
    };
  },
  methods: {
    fill(v, i) {
      this.grid[i] = v;
      const storage = JSON.stringify(this.grid);
      localStorage.setItem("grid", storage);
    },
    colorBlack(e, i) {
      const row = Math.floor(i / 15);
      const col = i % 15;
      const orow = Math.abs(15 - row) - 1;
      const ocol = Math.abs(15 - col) - 1;

      const item = this.$refs.items[i];
      if (e.target.value === EMPTY) {
        item.style.backgroundColor = "black";
        this.$refs.items[orow * 15 + ocol].style.backgroundColor = "black";
        this.fill(EMPTY, orow * 15 + ocol);
      } else {
        if (item.style.backgroundColor === "black") {
          item.style.backgroundColor = "white";
        }
      }

      if (this.grid[i] === EMPTY && e.target.value !== EMPTY) {
        item.style.backgroundColor = "lightcoral";
        this.$refs.items[orow * 15 + ocol].style.backgroundColor = "white";
        this.fill(" ", orow * 15 + ocol);
      }
    },
    colorRow(row) {
      const selected = document.activeElement;
      for (let i = 0; i < 15; i++) {
        const index = row * 15 + i;
        const item = this.$refs.items[index];
        if (item !== selected && this.grid[index] !== EMPTY) {
          item.style.backgroundColor = "lightyellow";
        }
      }
    },
    colorColumn(col) {
      const selected = document.activeElement;
      for (let i = 0; i < 15; i++) {
        const index = i * 15 + col;
        const item = this.$refs.items[index];
        if (item !== selected && this.grid[index] !== EMPTY) {
          item.style.backgroundColor = "lightyellow";
        }
      }
    },
    colorFocus(i) {
      const row = Math.floor(i / 15);
      const col = i % 15;

      this.$refs.items.forEach((item) => {
        if (
          item.style.backgroundColor === "lightcoral" ||
          item.style.backgroundColor === "lightyellow"
        ) {
          item.style.backgroundColor = "white";
        }
        if (item === document.activeElement) {
          if (this.grid[i] === EMPTY) {
            item.style.backgroundColor = "black";
          } else {
            item.style.backgroundColor = "lightcoral";
          }
        }
      });

      if (this.vertical) {
        this.colorColumn(col);
      } else {
        this.colorRow(row);
      }
    },
    colorMask() {
      this.$refs.items.forEach((item, i) => {
        if (this.grid[i] === EMPTY) {
          item.style.backgroundColor = "black";
        }
      });
    },
    update(e, i) {
      this.colorBlack(e, i);
      this.fill(String(e.target.value).toUpperCase(), i);

      let row = Math.floor(this.activeIndex / 15);
      let col = this.activeIndex % 15;
      if (this.vertical) {
        row += this.lastBack ? -1 : 1;
        if (row < 0) {
          row = 0;
        }
        if (row > 14) {
          row = 14;
        }
      } else {
        col += this.lastBack ? -1 : 1;
        if (col < 0) {
          col = 0;
        }
        if (col > 14) {
          col = 14;
        }
      }

      this.moveActive(e, row * 15 + col);
    },
    focus(e, i) {
      e.target.select();
      this.activeIndex = i;
      this.colorFocus(i);
    },
    moveActive(e, index) {
      if (index !== this.activeIndex) {
        e.preventDefault();
        this.activeIndex = index;
        const item = this.$refs.items[index];
        item.focus();
        item.select();
      }
      this.colorFocus(this.activeIndex);
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
        let row = Math.floor(this.activeIndex / 15);
        let col = this.activeIndex % 15;
        if (this.vertical) {
          if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
            this.vertical = false;
          } else {
            row += e.key === "ArrowUp" ? -1 : 1;
            if (row < 0) {
              row = 0;
            }
            if (row > 14) {
              row = 14;
            }
          }
        } else {
          if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            this.vertical = true;
          } else {
            col += e.key === "ArrowLeft" ? -1 : 1;
            if (col < 0) {
              col = 0;
            }
            if (col > 14) {
              col = 14;
            }
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
      this.colorMask();
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
        pattern="[a-zA-Z /]"
        maxlength="1"
        ref="items"
        v-for="(_, i) in grid"
        :key="i"
        :value="grid[i]"
        @click="(e) => e.target.select()"
        @focus="(e) => focus(e, i)"
        @input="(e) => update(e, i)"
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
