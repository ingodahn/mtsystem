<template>
<div>

<div class="container" ref="conti">
	<div :id="mapId" :ref="mapId"></div>
</div>
</div>

</template>

  <script>
  export default {
	  props: ['cmap','orientation'],
	  data () {
		  return {
			  
		  }
	  },
	  watch: {
		  
	  },
	  computed: {
		  mapId () {
			  return 'graph'+Math.random().toString();
		  }
	  },
	  methods: {
		  nodeClicked(node) {
			  this.$emit('nodeclicked',node.id);
		  }
	  },
	  mounted() {
		const Graph = ForceGraph3D({ controlType: 'orbit' })
		(document.getElementById(this.mapId))
			.graphData(this.cmap)
			.width(this.$refs[this.mapId].clientWidth)
			.nodeId('id')
			.nodeLabel(node => `${node.title}`)
			.nodeRelSize(6)
			.linkDirectionalArrowLength(10)
			.nodeAutoColorBy('group')
			.nodeThreeObject(node => {
				if (node.isNew) {
					const obj = new THREE.Mesh(
					new THREE.TorusGeometry(5+node.val,5),
					new THREE.MeshBasicMaterial({
						color: node.color,
						opacity: 0.5,
						transparent: true
					})
				)
				obj.userData = node
				return obj
				}
			})
			.onNodeDragEnd(node => {
				node.fx = node.x;
				node.fy = node.y;
				node.fz = node.z;
			})
			.dagMode(this.orientation)
			.onNodeClick(node => this.nodeClicked(node));
			
		// ms to cool down
		  Graph.cooldownTime(2000);
		  // Zoom to fit
		  Graph.d3Force('center', null);

		  // fit to canvas when engine stops
		  Graph.onEngineStop(() => Graph.zoomToFit(500));
		  
	},
  }
			
  </script>