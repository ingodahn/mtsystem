<template>
        <node :key="type" :type="type" :relations="relations"></node>
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
                    name: 'is a part of', 
                    inverse: 'has as a part',
                    description: "Every complete description of TARGET must contain a complete description of SOURCE."
                },
                {
                    id: 'requires',
                    name: 'requires knowledge from',
                    inverse: 'is used in subject',
                    description: "Learning about some content in SOURCE requires some knowledge from subject TARGET"
                }
            ],
        }
    },
    components: { node },
    
}
</script>