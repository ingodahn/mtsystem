<template>
    <node :key="type" :type="type" :relations="relations"></node>
</template>

<script>
import node from "../../components/Node.vue"
export default {
    data () {
        return {
            type: 'unit',
            relations: [
                {
                    id: 'isBelowxx', 
                    name: 'is a part of', 
                    inverse: 'has a part',
                    description: "Every complete description of TARGET must contain a complete description of SOURCE."
                },
                {
                    id: 'requiresxx',
                    name: 'requires knowledge from',
                    inverse: 'is used in unit',
                    description: "Learning about some content in SOURCE requires some knowledge from unit TARGET"
                }
            ],
        }
    },
    components: { node },
    
}
</script>