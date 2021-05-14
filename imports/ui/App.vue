<template>
  <div class="container">
    <v-btn to="/">Home</v-btn>
    <v-btn to="/topics">Topics</v-btn>
    <v-btn to="/units">Units</v-btn>
    <v-btn to="/admin">Tools</v-btn>
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
    }
  };
</script>

<style>

</style>
