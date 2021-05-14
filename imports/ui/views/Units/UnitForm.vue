<template>
  <form className="new-unit" @submit.prevent="handleSubmit">
    <input
      type="text"
      placeholder="Type to add new unit"
      v-model="newUnit"
    />
    <button type="submit">Add Unit</button>
  </form>
</template>

<script>
  import Vue from "vue";
  import { UnitsCollection } from "../../../api/UnitsCollection";

  export default {
    data() {
      return {
        newUnit: ""
      }
    },
    methods: {
      handleSubmit(event) {
        UnitsCollection.insert({
          title: this.newUnit,
          createdAt: new Date(), // current time
          content: "",
          urls: []
        });
        // Clear form
        this.newUnit=""
      }
    },
}
</script>