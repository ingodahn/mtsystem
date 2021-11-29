<template>
  <v-app>
    
    <v-app-bar app>
      <v-btn color="primary" @click="page='home'">Home</v-btn>
      <v-btn color="primary" @click="launchAny('subject')">Subjects</v-btn>
      <v-btn color="primary" @click="launchAny('concept')">Concepts</v-btn>
      <v-btn color="primary" @click="launchAny('theorem')">Theorems</v-btn>
      <v-btn color="primary" @click="launchAny('question')">Questions</v-btn>
      <v-btn color="secondary" @click="launchAny('unit')" v-if="currentUser && currentUser.username == 'dahn'">Units</v-btn>
      <v-btn color="secondary" @click="page='toc'" v-if="currentUser && (currentUser.username == 'dahn' || currentUser.username == 'editor')">TOC</v-btn>
       <v-btn color="secondary" @click="launchCockpit()" v-if="currentUser && currentUser.username == 'dahn'">Cockpit</v-btn>
      <v-btn color="warning" @click="page='admin'" v-if="currentUser && currentUser.username == 'dahn'">Tools</v-btn>
      <div class="loading" v-if="!$subReady.units">Loading...</div>
    </v-app-bar>
    <v-main>
      <v-container fluid>
        <home v-if="page=='home'"></home>
        <admin v-else-if="page=='admin'"></admin>
        <toc v-else-if="page=='toc'"></toc>
        <cockpit v-else-if="page=='cockpit'"></cockpit>
        <any :key="page" v-else></any>
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
  import Toc from '/imports/ui/views/Toc/Toc.vue'
  import Any from '/imports/ui/views/Any.vue'
  import Cockpit from '/imports/ui/views/Cockpit.vue'
  var session = {
    type: '',
    relation: '',
    edit: false,
    id: '',
    view: '3D',
    newNodes: 7,
    debug: true,
    set (item,newValue) {
      if (this.debug) console.log('Session setting', item,'to',newValue)
      this[item] = newValue;
    },
    mode () {
      if (this.id) {
        if (this.edit) return "update";
        else return "single";
      } else {
        if (this.edit) return "new";
        else return "all";
      }
    },
    clear () {
      this.type = '';
      this.relation='';
      this.edit=false;
      this.id='';
    }
  };

  export default {
    data() {
        return {
          page: 'home',
          session: session
        };
    },
    components: {
      Home,
      Admin,
      Toc,
      Any,
      Cockpit
    },
    methods: {
      launchAny(t) {
        this.session.type=t;
        this.session.edit=false;
        this.session.id='';
        this.page=t;
      },
      launchCockpit() {
        this.session.type='subject';
        this.session.edit=false;
        this.session.id='';
        this.page='cockpit';
      }
    },
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
