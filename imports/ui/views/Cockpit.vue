<template>
    <v-container class="container" ref="conti">
        <v-row>
            <v-col xs="12" md="4">
                <h2>MathTrek Cockpit {{ session.type }} ID: {{session.id}}</h2>
            </v-col>
            <v-col xs="12" md="4">
                <selector :key="session.id" :type="session.type" v-on:selected="selectedNode"></selector>
            </v-col>
        </v-row>
        <v-row>
            <v-col xs="12" md="12">
                <localMap :key="type+'Local'" :type="type" :relations="relations" v-on:localmapclicked="localmapclicked" :location="session.id" v-on:explore="explore"></localMap>
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
import {relations, defaultType, defaultRelation, defaultNode} from '/imports/config.js'
import spacemap from "../components/Cockpit/Spacemap.vue"
import LocalMap from "../components/Cockpit/LocalMap.vue"
import Selector from "../components/Selector.vue";
export default {
    data () {
        return {
            session: this.$root.$data.session
        }
    },
    components: { Selector,spacemap,LocalMap },
    created () {

    },
    methods: {
        spacemapclicked (id) {
            this.session.set('id',id);
        },
        localmapclicked (id) {
            this.session.set('id',id);
        },
        explore (id) {
            console.log('Cockpit explore',id);
            this.$emit('explore',id);
        },
        selectedNode (id) {
            console.log('Cockpit selectedNode',id);
            this.session.set('id',id);
        }
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