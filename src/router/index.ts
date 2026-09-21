import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import CategoryListView from '@/views/CategoryListView.vue'
import CategoryTopicsView from '@/views/CategoryTopicsView.vue'
import TopicDetailView from '@/views/TopicDetailView.vue'
import ShowcaseView from '@/views/ShowcaseView.vue'
import SyncSpiderView from '@/views/SyncSpiderView.vue'
import AboutView from '@/views/AboutView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/categories',
      name: 'categories',
      component: CategoryListView
    },
    {
      path: '/c/:slug/:id',
      name: 'category-topics',
      component: CategoryTopicsView
    },
    {
      path: '/t/:id',
      name: 'topic-detail',
      component: TopicDetailView
    },
    {
      path: '/showcase',
      name: 'showcase',
      component: ShowcaseView
    },
    {
      path: '/sync',
      name: 'sync',
      component: SyncSpiderView
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ],
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router
