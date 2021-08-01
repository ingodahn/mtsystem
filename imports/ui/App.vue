<template>
  <v-app>
    
    <v-app-bar app>
      <v-btn color="primary" @click="page='home'">Home</v-btn>
      <v-btn color="primary" @click="page='subject'">Subjects</v-btn>
      <v-btn color="primary" @click="page='concept'">Concepts</v-btn>
      <v-btn color="primary" @click="page='theorem'">Theorems</v-btn>
      <v-btn color="primary" @click="page='question'">Questions</v-btn>
      <v-btn color="primary" @click="page='unit'" v-if="currentUser && currentUser.username == 'dahn'">Units</v-btn>
      <v-btn color="primary" @click="page='admin'" v-if="currentUser && currentUser.username == 'dahn'">Tools</v-btn>
      <!--
      <v-btn color="primary" to="/">Home</v-btn>
      <v-btn color="primary" to="/subject">Subjects</v-btn>
      <v-btn color="primary" to="/concepts">Concepts</v-btn>
      <v-btn color="primary" to="/theorem">Theorems</v-btn>
      <v-btn color="primary" to="/question">Questions</v-btn>
      <v-btn color="primary" to="/unit" v-if="currentUser && currentUser.username == 'dahn'">Units</v-btn>
      <v-btn color="primary" to="/admin" v-if="currentUser && currentUser.username == 'dahn'">Tools</v-btn>
      &nbsp;
      -->
      <div class="loading" v-if="!$subReady.units">Loading...</div>
    </v-app-bar>
    <v-main>
      <v-container fluid>
        <home v-if="page=='home'"></home>
        <admin v-else-if="page=='admin'"></admin>
        <any :key="page" v-else :type="page"></any>
        <!--
        <router-view></router-view>
        -->
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
  import Home from '/imports/ui/views/Home/Home.vue'
  import Admin from '/imports/ui/views/Admin/Admin.vue'
  import Any from '/imports/ui/views/Any.vue'
  export default {
    components: {
    },
    data() {
        return {
          page: 'home'
        };
    },
    components: {
      Home,
      Admin,
      Any
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
