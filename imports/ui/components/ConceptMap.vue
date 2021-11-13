<template>
<div>

<div class="container" ref="conti">
	<Map2D v-if="view=='2D'" :cmap="cmap" :orientation="orientation" v-on:nodeclicked="nodeClicked"></Map2D>
	<Map3D v-if="view=='3D'" :cmap="cmap" :orientation="orientation" v-on:nodeclicked="nodeClicked"></Map3D>
	<MapVR v-if="view=='VR'" :cmap="cmap" :orientation="orientation" v-on:nodeclicked="nodeClicked"></MapVR>
	<!--
	<MapAFrame v-if="view=='AFrame'" :cmap="cmap" :orientation="orientation" v-on:nodeclicked="nodeClicked"></MapAFrame>
	-->
	<SaveMap v-if="currentUser.username" :map="cmap"></SaveMap>
</div>
</div>

</template>

  <script>
  import MapVR from "./MapVR.vue";
  import Map3D from "./Map3D.vue";
  import Map2D from "./Map2D.vue";
  
  //import MapAFrame from "./MapAFrame.vue";
  import SaveMap from "./SaveMap.vue";

  export default {
	  props: ['cmap','orientation','view'],
	  data () {
		  return {
			  
		  }
	  },
	  watch: {
		  
	  },
	  components: {
		Map2D,
		Map3D,
		MapVR,
		//MapAFrame,
		SaveMap
	  }, 
	
	  computed: {
	  },
	  methods: {
		  nodeClicked(node) {
			  this.$emit('nodeclicked',node);
		  }
	  },
	  mounted() {
	},
	meteor: {
        currentUser() {
            return Meteor.user();
        },
    }
  }
			
  </script>