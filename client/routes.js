import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

import Units from '../imports/ui/views/Units/Unit.vue'
import Home from '../imports/ui/views/Home/Home.vue'
import Subject from '../imports/ui/views/Subject/Subject.vue'
import Concepts from '../imports/ui/views/Concepts/Concepts.vue'
import Theorem from '../imports/ui/views/Theorem/Theorem.vue'
import Question from '../imports/ui/views/Question/Question.vue'
import Admin from '../imports/ui/views/Admin/Admin.vue'
import Any from '../imports/ui/views/Any.vue'

const routes = [
    {
        path: "/",
        name: "Home",
        component: Home
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
        path: "/question",
        name: "Question",
        component: Question
    },
    {
        path: "/theorem",
        name: "Theorem",
        component: Theorem
    },
    {
        path: "/admin",
        name: "Admin",
        component: Admin
    },
    {
        path: "/:type",
        name: "Any",
        component: Any
    },
]

const router = new VueRouter({
    routes
})

export default router
