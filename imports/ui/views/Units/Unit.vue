<template>
    <div class="container">
        <node :key="type" :type="type" :relations="relations"></node>
    </div>
</template>

<script>
import node from "../../components/NodeX.vue"
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
                    inverse: 'is used in topic',
                    description: "Learning about some content in SOURCE requires some knowledge from topic TARGET"
                }
            ],
        }
    },
    components: { node },
    
}
</script>