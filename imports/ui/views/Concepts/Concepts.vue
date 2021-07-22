<template>
        <node :key="type" :type="type" :relations="relations"></node>
</template>

<script>
import node from "../../components/Node.vue"
export default {
    data () {
        return {
            type: 'concept',
            relations: [
                {
                    id: 'isBelow', 
                    name: 'is a kind of', 
                    inverse: 'is an abstraction of',
                    description: "Every SOURCE can be interpreted as an instance of TARGET in a canonical way."
                }
            ],
        }
    },
    components: { node },
    
}
</script>
