<template>
    <v-row>
        <v-col xs="12" md="12">
            <h2 :class="classColor">{{currentNode.title}}</h2>
            <show-math-doc :key="firstParagraph" :content="firstParagraph"></show-math-doc>
        </v-col>
    </v-row>
</template>

<script>
import { UnitsCollection } from "../../api/UnitsCollection";
import ShowMathDoc from "./ShowMathDoc.vue";

export default {
    props: ['nodeId'],
    components: {
        ShowMathDoc,
    },

    computed: {
        currentNode () {
            const node=UnitsCollection.findOne({_id: this.nodeId})
            if (node) {
                desc = node.description
                const regex = /(<p>[\s\S]*?<\/p>)/gm;
                const corresp = regex.exec(desc);
                const firstParagraph = (corresp) ? corresp[0] : "No description available";
                return {title: node.title, firstParagraph: firstParagraph};
            } else {
                return {title: "Description", firstParagraph: "Description of the current node"};
            }         
        },
        firstParagraph () {
            return this.currentNode.firstParagraph;
        },
        classColor () {
            return (this.nodeId == this.$root.$data.session.id)?"sessionNode":"selectedNode";
        }
    },
    methods: {
        reRender() {
            if(window.MathJax) {
                console.log('rendering mathjax');
                window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub], () => console.log('done'));
            }
        }
    },
    watch: {
        firstParagraph: function () {
            let self=this;
            this.$nextTick().then(()=>{
                this.reRender();
            }) 
        }
    },
    meteor: {
        
    }
}
</script>

<style scoped>
.sessionNode {
    background-color: pink;
    text-align: center;
}
.selectedNode {
    background-color: brown;
    color: white;
    text-align: center;
}
</style>