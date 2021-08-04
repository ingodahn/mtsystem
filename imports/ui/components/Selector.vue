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
            items: []
        }
    },
    props: ['type','currentId'],

    mounted () {
    },

    watch: {
        selectedId: function () {
            if (this.selectedId) this.$emit('selected',this.selectedId);
            else this.$emit('selected','')
        }
    },

    computed: {
        selectLabel () {
            return "Select "+this.type+':';
        },
        selectedId () {
            return this.session.id;
        }
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