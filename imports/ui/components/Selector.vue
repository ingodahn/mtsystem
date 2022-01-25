<template>
    <div class="container">
        <div class="select" data-app>
            <v-autocomplete
                :label="selectLabel"
                v-model="session.id"
                hide-details="auto"
                :items="items"
                item-text="title"
                item-value="id"
                clearable
            ></v-autocomplete>
        </div>
    </div>
</template>

<script>
import { UnitsCollection } from "../../api/UnitsCollection";

export default {
    data () {
        return {
            session: this.$root.$data.session,
            selectedId: ''
        }
    },
    props: ['items'],

    mounted () {
        this.selectedId=this.session.id;
    },

    watch: {
        selectedId: function (newId,oldId) {
            if (newId == oldId) return;
            this.session.set('id',newId);
            console.log('Selector found coords',this.$root.$data.coords)
            if (newId && !this.$root.$data.coords) this.session.set('mode','text','Selector watcher'); else this.session.set('mode','graph','Selector watcher');
            //if (this.selectedId) this.$emit('selected',this.selectedId);
            //else this.$emit('selected','')
        }
    },

    computed: {
        selectLabel () {
            const label=(this.session.mode == 'text')?this.session.type:'node';
            return "Select "+label+':';
        },
    },

    meteor: {
        all() {
            return UnitsCollection.find(
                {type: this.type},{sort: { title: 1}}
            ).fetch();
        },
    }
}
</script>