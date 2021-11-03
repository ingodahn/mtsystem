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
            ],
        }
    },
    components: { node },
    
}
</script>