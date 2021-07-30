<template>
        <node :key="type" :type="type" :relations="relations"></node>
</template>

<script>
import node from "../../components/Node.vue"
export default {
    data () {
        return {
            type: 'question',
            relations: [
                {
                    id: 'isBelow', 
                    name: 'helps answering', 
                    inverse: 'can be answered best, after answering',
                    description: "Answering \"SOURCE\" will help answering \"TARGET\"."
                }
            ],
        }
    },
    components: { node },
    
}
</script>
