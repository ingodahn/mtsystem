<template>
        <node :key="type" :type="type" :relations="relations"></node>
</template>

<script>
import node from "../../components/Node.vue"
export default {
    data () {
        return {
            type: 'example',
            relations: [
            ],
        }
    },
    components: { node },
    
}
</script>
