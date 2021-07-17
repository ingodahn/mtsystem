<template>
  <v-app>
    
    <v-app-bar app>
      <v-btn color="primary" to="/">Home</v-btn>
      <v-btn color="primary" to="/subject">Subjects</v-btn>
      <v-btn color="primary" to="/concepts">Concepts</v-btn>
      <v-btn color="primary" to="/units" v-if="currentUser && currentUser.username == 'dahn'">Units</v-btn>
      <v-btn color="primary" to="/admin" v-if="currentUser && currentUser.username == 'dahn'">Tools</v-btn>
      &nbsp;
      <div class="loading" v-if="!$subReady.units">Loading...</div>
    </v-app-bar>
    <v-main>
      <v-container fluid>
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
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
      $subscribe: {
        'units': [],
        'notes': []
      },
      currentUser() {
        return Meteor.user();
      }
    }
  };
</script>

<style>

</style>
