<template>
    <v-container class="container" ref="conti">
        <v-row>
            <v-col xs="12" md="12">
                <h2>MathTrek Cockpit</h2>
            </v-col>
        </v-row>
        <v-row>
            <v-col xs="12" md="12">
                <localMap :key="type+'Local'" :type="type" :relations="relations" v-on:localmapclicked="localmapclicked" :location="location"></localMap>
            </v-col>
        </v-row>
        
        <v-row>
            <v-col xs="12" md="12">
                <spacemap :key="type+'Space'" :type="type" :relations="relations" v-on:spacemapclicked="spacemapclicked"></spacemap>
            </v-col>
        </v-row>
        
    </v-container>
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
    methods: {
        spacemapclicked (id) {
            this.location = id;
            this.$root.$data.session.set('id',id);
        },
        localmapclicked (id) {
            this.location = id;
            this.$root.$data.session.set('id',id);
        },
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