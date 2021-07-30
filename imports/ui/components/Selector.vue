<template>
    <div class="container">
        <div class="select" data-app>
            <v-autocomplete
                :label="selectLabel"
                v-model="selectedId"
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
            selectedId: this.currentId,
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