<template>
<div>

<div class="container" ref="conti">
	<Map2D v-if="view=='2D'" :cmap="cmap" :orientation="orientation" v-on:nodeclicked="nodeClicked"></Map2D>
	<Map3D v-if="view=='3D'" :cmap="cmap" :orientation="orientation" v-on:nodeclicked="nodeClicked"></Map3D>
</div>
</div>

</template>

  <script>
  import Map2D from "./Map2D.vue";
  import Map3D from "./Map3D.vue";
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
		Map3D  
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
  }
			
  </script>