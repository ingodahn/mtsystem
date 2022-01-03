<template>
  <v-app>
    
    <v-app-bar app>
      <v-btn color="primary" @click="page='home'">Home</v-btn>
      <v-btn color="primary" @click="launchAny('subject')">Subjects</v-btn>
      <v-btn color="primary" @click="launchAny('concept')">Concepts</v-btn>
      <v-btn color="primary" @click="launchAny('theorem')">Theorems</v-btn>
      <v-btn color="primary" @click="launchAny('person')">Persons</v-btn>
      <v-btn color="secondary" @click="page='toc'" v-if="currentUser && (currentUser.username == 'dahn' || currentUser.username == 'editor')">TOC</v-btn>
      <v-btn color="warning" @click="page='admin'" v-if="currentUser && currentUser.username == 'dahn'">Tools</v-btn>
      <div class="loading" v-if="!$subReady.units">Loading...</div>
    </v-app-bar>
    <v-main>
      <v-container fluid>
        <home v-if="page=='home'"></home>
        <admin v-else-if="page=='admin'"></admin>
        <toc v-else-if="page=='toc'"></toc>
        <any :key="page" v-else></any>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
  import Home from '/imports/ui/views/Home/Home.vue'
  import Admin from '/imports/ui/views/Admin/Admin.vue'
  import Toc from '/imports/ui/views/Toc/Toc.vue'
  import Any from '/imports/ui/views/Any.vue'
  import {relations, defaultType, defaultRelation, defaultNode} from '/imports/config.js'

  export default {
    components: {
    },
    data() {
        return {
          page: 'home',
          session: {
            type: defaultType,
            relation: defaultRelation[defaultType],
            edit: false,
            id: '',
            view: '2D',
            neighbourhood: 2,
            newNodes: 7,
            debug: false,
            set (item,newValue) {
              if (this.debug) console.log('Session setting', item,'to',newValue)
              this[item] = newValue;
            },
            mode: 'all',
            
            clear () {
              this.type = defaultType;
              this.relation=defaultRelation[defaultType];
              this.edit=false;
              this.id='';
            }
          }
        };
    },
    components: {
      Home,
      Admin,
      Toc,
      Any
    },
    methods: {
      launchAny(t) {
        this.session.type=t;
        this.session.mode='all';
        this.session.id='';
        this.page=t;
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
