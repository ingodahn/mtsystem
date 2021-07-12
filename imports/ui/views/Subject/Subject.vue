<template>
    <div class="container">
        <h1>MathTrek Subjects</h1>
        <node :key="type" :type="type" :relations="relations" :leadRelation="leadRelation"></node>
    </div>
</template>

<script>
import node from "../../components/Node.vue"
export default {
    data () {
        return {
            type: 'subject',
            relations: [
                {
                    id: 'isBelow', 
                    name: 'is narrower than', 
                    inverse: 'is a wider than',
                    description: "Every complete description of TARGET must contain a complete description of SOURCE."
                },
                {
                    id: 'requires',
                    name: 'requires knowledge from',
                    inverse: 'is used in topic',
                    description: "Learning about some content in SOURCE require some knowledge from topic TARGET"
                }
            ],
            leadRelation: 'isBelow',
        }
    },
    components: { node },
    
}
</script>