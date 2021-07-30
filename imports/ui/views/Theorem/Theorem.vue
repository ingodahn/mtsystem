<template>
        <node :key="type" :type="type" :relations="relations"></node>
</template>

<script>
import node from "../../components/Node.vue"
export default {
    data () {
        return {
            type: 'theorem',
            relations: [
                {
                    id: 'isBelow', 
                    name: 'helps proving', 
                    inverse: 'can be proved using',
                    description: "A proof of \"TARGET\" can use \"SOURCE\"."
                }
            ],
        }
    },
    components: { node },
    
}
</script>
