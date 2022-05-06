<<<<<<< HEAD
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

const app = createApp(App);

app.use(router);

app.mount("#app");
=======
import App from './App.svelte';

const app = new App({
	target: document.body,
});

export default app;
>>>>>>> svelte
