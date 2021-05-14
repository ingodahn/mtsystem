<template>
<span class="container">
  <span v-if="mode == 'list'">{{ this.unit.title }}</span>
  <div v-else>
    <div class="unitMenu">
      <v-btn @click="viewUnit">View</v-btn> | 
      <v-btn @click="unitMode='update'">Update</v-btn> | 
      <v-btn @click="saveUnit">Save</v-btn> | 
      <v-btn @click="unitMode='delete'">Delete</v-btn></div>
    </div>
    <div v-if="unitMode == 'view'">
      <h2>{{ this.unit.title}}</h2>
      <div v-html="unit.content"></div>
    </div>
    <div v-if="unitMode == 'update'">
      <v-text-field
        label="Title"
        hide-details="auto"
        v-model="unit.title"
      ></v-text-field>
      <ul v-for="(u,i) in urls" 
      v-bind:key="i"      >
        <li><v-text-field label="URL" v-model="unit.urls[i]"></v-text-field></li>
      </ul>
    <v-textarea
          outlined
          label="Content"
          v-model="unit.content"
        ></v-textarea>
    </div>
</span>
</template>

<script>
import { UnitsCollection } from "../../../api/UnitsCollection";
import Vue from 'vue'
import VMarkdown from 'v-markdown/src';
 
Vue.use(VMarkdown);
export default {
  props: ["unit", "mode"],
  data() {
    return {
      unitMode: this.mode
    };
  },
  mounted: function() {
    console.log("element mounted...");
    MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
    if (! this.unit.urls) this.unit.urls=["https://mathtrek.eu"];
  },
  methods: {
    saveUnit () {
      console.log('saving');
      UnitsCollection.update(
        {_id: this.unit._id},
        {
          $set: this.unit
        }
      )
    },
    viewUnit () {
      this.unitMode='view';
      MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
    }
  },
  computed: {
    urls () {
      if (this.unit.urls) {
        console.log(this.unit.urls);
        return this.unit.urls;
      }
      return ["bbb"];
    }
  }
};
</script>