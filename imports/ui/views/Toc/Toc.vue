<template>
    <div class="toc">
        <div class="toc-header">
        <h2>Table of Contents</h2>
        </div>
        <div class="toc-body">
        <ul>
            <li v-for="(item, index) in items" :key="index">
            <a :href="item.href" target="_blank">{{ item.title }}</a>
            <ul v-if="item.children.length > 0">
                <li v-for="(child, cindex) in item.children" :key="cindex">
                <a :href="child.href" target="_blank">{{ child.title }}</a>
                </li>
            </ul>
            </li>
        </ul>
        </div>
    </div>
</template>

<script>
import { UnitsCollection } from "../../../api/UnitsCollection";
export default {
    name: 'Toc',
    props: {
    },
    data() {
        return {
            items: {
                type: Array,
                required: true
            }
        }
    },
    mounted () {
        this.items=[{title: 'Subjects', children:[]},{title: 'Concepts',children:[]},{title: 'Theorems',children:[]},{title: 'Persons',children:[]}];
        ['subject','concept','theorem','person'].forEach((item, index) => {
            let nodes=UnitsCollection.find({type: item},{sort: { title: 1}}).fetch();
            this.items[index].children=nodes.map((node) => {
                return {
                    title: node.title,
                    href: node.see,
                    children: []
                }
            });
        });
    },
    methods: {
        
    }
}
</script>