import Vue from "vue";
import { createPinia, PiniaVuePlugin } from "pinia";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";

import App from "./App.vue";

import "./assets/main.css";

Vue.use(PiniaVuePlugin);
Vue.use(ElementUI);

new Vue({
	pinia: createPinia(),
	render: (h) => h(App),
}).$mount("#app");
