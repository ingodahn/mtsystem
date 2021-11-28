<template>
<div>

<div class="container" ref="conti">
	<Map2D v-if="view=='2D'" :cmap="cmap" :orientation="orientation" v-on:nodeclicked="nodeClicked"></Map2D>
	<Map3D v-if="view=='3D'" :cmap="cmap" :orientation="orientation" :zoomTo="zoomTarget"  v-on:nodeclicked="nodeClicked"></Map3D>
</div>
</div>

</template>

  <script>
  import Map2D from "./Map2D.vue";
  import Map3D from "./Map3D.vue";
  export default {
	  props: {'cmap': {type: Object, default: {}},'orientation': {type: String, default: null},'view': {type: String, default: '2D'},'zoomTo': {type: String, default: 'out'}},
	  data () {
		  return {
			  zoomTarget: 'out'
		  }
	  },
	  watch: {
		  zoomTo(id) {
			  console.log('Watching in ConceptMap');
			  this.zoomTarget = id;
		  }
	  },
	  components: {
		Map2D,
		Map3D  
	  },
	  computed: {
	  },
	  methods: {
		  nodeClicked(nodeId) {
			  console.log('nodeClicked in ConceptMap',nodeId);
			  this.$emit('nodeclicked', nodeId);
			this.zoomTarget=nodeId;
			console.log('zoomTarget in ConceptMap is now ',this.zoomTarget);
			this.$emit('nodeclicked',nodeId);	
		  }
	  },
	  mounted() {
	},
  }
			
  </script>