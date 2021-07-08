<template>
    <div class="container">
        <h2>Select</h2>
        <div class="select" data-app>
            <v-autocomplete
                :label="label"
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
    props: ['type','currentId','label'],

    mounted () {
    },

    watch: {
        selectedId: function () {
            console.log(this.selectedId);
            //let cid=this.selectedId;
            //this.items.sort(function(x,y){ return x._id == cid ? -1 : y._id == cid ? 1 : 0; });
            this.$emit('selected',this.selectedId);
        }
    },

    computed: {
        
    },

    meteor: {
        all() {
        return UnitsCollection.find(
            {type: this.type}
        ).fetch();
        },
    }
}
</script>