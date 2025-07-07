import { createRouter, createWebHistory } from 'vue-router'
import GameView from '../views/GameView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'game',
      component: GameView,
    },
    {
      path: '/presentation',
      name: 'presentation',
      component: () => import('../views/PresentationView.vue'),
    },
        {
      path: '/adminmk',
      name: 'admin',
      component: () => import('../views/AdminView.vue'),
    },
  ],
})

export default router
