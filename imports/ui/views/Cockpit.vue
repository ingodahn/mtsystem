<template>
    <div class="container" ref="conti">
        <h2>MathTrek Cockpit</h2>
        <localMap :location="location"></localMap>
        <spacemap :key="type" :type="type" :relations="relations"></spacemap>
    </div>
</template>

<script>
import {relations} from '/imports/config.js'
import spacemap from "../components/Cockpit/Spacemap.vue"
import LocalMap from "../components/Cockpit/LocalMap.vue"
export default {
    data () {
        return {
            session: this.$root.$data.session,
            location: "xaTAqFNYuu5rWDm5m" // _id of Mathematics
        }
    },
    components: { spacemap,LocalMap },
    created () {
        this.$root.$data.session.set('relation',this.initialRelation);
        if (!this.$root.$data.session.id) this.$root.$data.session.set('id',"xaTAqFNYuu5rWDm5m"); //Defaul location Mathematics
    },
    computed: {
        type () {
            return this.session.type;
        },
        relations () {
            let t=this.type;
            return relations.filter(e => (e.sourceType == t || e.targetType == t));
        },
        initialRelation () {
            return this.relations[0].id;
        },
    }
}
</script>