import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import KHE from '../views/KHE.vue'
import Constitution from '../views/Constitution.vue'
import Alumni from '../views/Alumni.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/khe',
    name: 'khe',
    component: KHE
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: function () {
      return import(/* webpackChunkName: "about" */ '../views/About.vue')
    }
  },
  {
    path: '/constitution',
    name: 'constitution',
    component: Constitution
  },
  {
    path: '/alumni',
    name: 'alumni',
    component: Alumni
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
