import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

import Units from '../imports/ui/views/Units/Units.vue'
import Home from '../imports/ui/views/Home/Home.vue'
import Topics from '../imports/ui/views/Topics/Topics.vue'
import Subject from '../imports/ui/views/Subject/Subject.vue'
import Concepts from '../imports/ui/views/Concepts/Concepts.vue'
import Admin from '../imports/ui/views/Admin/Admin.vue'

const routes = [
    {
        path: "/",
        name: "Home",
        component: Home
    },
    {
        path: "/topics",
        name: "Topics",
        component: Topics
    },
    {
        path: "/subject",
        name: "Subject",
        component: Subject
    },
    {
        path: "/concepts",
        name: "Concepts",
        component: Concepts
    },
    
    {
        path: "/units",
        name: "Units",
        component: Units
    },
    {
        path: "/admin",
        name: "Admin",
        component: Admin
    }
]

const router = new VueRouter({
    routes
})

export default router
