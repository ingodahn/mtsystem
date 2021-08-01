<template>
    <node :key="type" :type="type" :relations="relations"></node>
</template>

<script>
import node from "../../components/Node.vue"
import {relations} from '/imports/config.js'
export default {
    data () {
        return {
            type: 'unit',
        }
    },
    components: { node },
    computed: {
        relations () {
            return relations.filter(e => (e.sourceType == 'unit' || e.targetType == 'unit'));
        }
    }
    
}
</script>