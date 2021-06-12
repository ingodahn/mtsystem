<template>
  <div class="container">
    <v-btn to="/">Home</v-btn>
    <v-btn to="/topics" v-if="currentUser && currentUser.username == 'dahn'">Topics</v-btn>
    <v-btn to="/concepts">Concepts</v-btn>
    <v-btn to="/units" v-if="currentUser && currentUser.username == 'dahn'">Units</v-btn>
    <v-btn to="/admin" v-if="currentUser && currentUser.username == 'dahn'">Tools</v-btn>
    <div>
      <router-view></router-view>
    </div>
  </div>
</template>

<script>

  export default {
    components: {
    },
    data() {
        return {
        };
    },
    methods: {},
    meteor: {
      currentUser() {
        return Meteor.user();
      }
    }
  };
</script>

<style>

</style>
