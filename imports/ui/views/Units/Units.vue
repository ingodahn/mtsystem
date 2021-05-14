<template>
  <div class="container">
    <header>
      <h1>MathTrek Units</h1>
    </header>
    <UnitForm />
    <div v-if="mode == 'list'">
    <ul>
      <li v-for="unit in units"
        v-bind:key="unit._id"
        v-on:click="currentUnit=unit;mode='select'" class="unitItem">
      <Unit
        v-bind:unit="unit"
        mode="list"
      />
      </li>
      <p>Mode: {{ mode }}</p>
    </ul>
    </div>
    <div v-else>
      <Unit
        v-bind:unit="currentUnit"
        mode="view"
      />
    </div>
  </div>
</template>

<script>
  import Vue from "vue";
  import Unit from "./Unit.vue";
  import UnitForm from "./UnitForm.vue";
  import { UnitsCollection } from "../../../api/UnitsCollection";

  export default {
    components: {
      Unit,
      UnitForm
    },
    data() {
        return {
          currentUnit: "",
          mode: "list"
        };
    },
    methods: {},
    meteor: {
      units() {
        return UnitsCollection.find({type: "unit"}).fetch();
      }
    }
  };
</script>

<style>
.unitItem:hover {
  background-color: greenyellow;
}
</style>
