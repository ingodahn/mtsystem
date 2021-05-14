<template>
    <div class="container">
        <h1>MathTrek System Administration</h1>
        <p>This is the admin page</p>
        <v-btn @click="setField('type','unit')">Set field</v-btn>
    </div>
</template>

<script>
import { UnitsCollection } from "../../../api/UnitsCollection";
import Vue from 'vue'
export default {
    methods: {
        setField(name,value) {
            this.items.forEach(item => {
                item[name]=value;
                UnitsCollection.update(
                    {_id: item._id},
                    {
                    $set: item
                    }
                );
            });
        }
    },
    meteor: {
      items() {
        return UnitsCollection.find({}).fetch();
      }
    }
}
</script>