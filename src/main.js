// import { createApp } from 'vue'
// import App from './App.vue'
import { routes } from "./router";
// import store from './store'
// import Navigation from '@/components/Navigation.vue'

// const app = createApp(App)
//   .use(store).use(router)
//   .component('navigation', Navigation)
// app.mount('#app')

import { ViteSSG } from "vite-ssg";
import App from "./App.vue";

// `export const createApp` is required instead of the original `createApp(App).mount('#app')`
export const createApp = ViteSSG(
  // the root component
  App,
  // vue-router options
  {
    routes,
    scrollBehavior() {
      document.querySelector("#app").scrollIntoView();
      return { x: 0, y: 0 };
    },
  },
  // function to have custom setups
  ({ app, router, routes, isClient, initialState }) => {
    if (isClient) {
      router.beforeEach((to, from, next) => {
        if (to.path == "/khe.io") {
          window.location.href = "https://khe.io";
        } else {
          next();
        }
      });

      router.afterEach((to) => {
        document.title = to.meta.title || to.name || "HacKSU";
      });
    }
    console.log("hello from ssg");
  }
);


