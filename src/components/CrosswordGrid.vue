<script>
export default {
  data() {
    return {
      grid: new Array(15 * 15).fill("A"),
    };
  },
  methods: {
    update(e, i) {
      this.grid[i] = String(e.target.value).toUpperCase();
    },
    focus(e) {
      e.target.select();
    },
  },
  mounted() {
    console.log(this.grid);
  },
};
</script>

<template>
  <article>
    <h2>Crossword grid</h2>
    <section class="grid">
      <input
        v-for="(_, i) in grid"
        :key="i"
        :value="grid[i]"
        class="item"
        maxlength="1"
        @click="focus"
        @focus="focus"
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
