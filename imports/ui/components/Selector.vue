<template>
    <div class="container">
        <div class="select" data-app>
            <v-autocomplete
                :label="selectLabel"
                v-model="session.id"
                hide-details="auto"
                :items="all"
                item-text="title"
                item-value="_id"
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
            items: [],
            selectedId: ''
        }
    },
    props: ['type'],

    mounted () {
        this.selectedId=this.session.id;
    },

    watch: {
        selectedId: function (newId,oldId) {
            if (newId == oldId) return;
            this.session.set('id',newId);
            if (newId) this.session.set('mode','single'); else this.session.set('mode','all');
            //if (this.selectedId) this.$emit('selected',this.selectedId);
            //else this.$emit('selected','')
        }
    },

    computed: {
        selectLabel () {
            return "Select "+this.type+':';
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