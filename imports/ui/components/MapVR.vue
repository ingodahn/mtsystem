<template>
<div>

<div class="container" ref="conti">
	<div id="graph" ref="graph"></div>
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
		  myMap () {
			return JSON.parse(JSON.stringify(this.cmap));
		  }
	  },
	  methods: {
		  nodeClicked(node) {
			  this.$emit('nodeclicked',node.id);
		  }
	  },
	  mounted() {
		const Graph = ForceGraphVR();
		Graph(document.getElementById('graph'))
			.graphData(this.myMmap)
			.width(this.$refs.graph.clientWidth)
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
			//.onNodeDragEnd(node => {
			//	node.fx = node.x;
			//	node.fy = node.y;
			//	node.fz = node.z;
			//})
			.dagMode(this.orientation)
			.onNodeClick(node => this.nodeClicked(node));
			
		// ms to cool down
		  Graph.cooldownTime(2000);
		  // Zoom to fit
		  Graph.d3Force('center', null);

		  // fit to canvas when engine stops
		  //Graph.onEngineStop(() => Graph.zoomToFit(500));
		  
		  /*
		  const NODE_R = 8;
		  const Graph = ForceGraph()
		  (document.getElementById('graph'))
		  .graphData(this.cmap)
		  .linkDirectionalArrowLength(10)
		  .nodeRelSize(6)
		  .nodeId('id')
		  .nodeAutoColorBy('group')
		  .nodeLabel(node => `${node.title}`)
		  .nodeRelSize(NODE_R)
		  
		  .dagMode(this.orientation)
		  //.dagLevelDistance(50)
		  //.width(400)
		  .d3Force('link', d3.forceLink().id(d => d.id).distance(100).strength(1))
		  //.d3Force('charge', d3.forceManyBody().strength(-100))
		  .width(this.$refs.conti.clientWidth)
		  .height(Math.max(this.$refs.conti.clientHeight,800))
		  .nodeCanvasObjectMode(node => (node.isNew)?'before':undefined)
		  .nodeCanvasObject((node, ctx) => {
        // add ring just for highlighted nodes
        ctx.beginPath();
        //ctx.arc(node.x, node.y, NODE_R * 1.4, 0, 2 * Math.PI, false); // ???
		ctx.arc(node.x, node.y, node.val +10, 0, 2 * Math.PI, false); // ???
        ctx.fillStyle = 'orange';
        ctx.fill();
      })
		  .onNodeDragEnd(node => {
				node.fx = node.x;
				node.fy = node.y;
			})
		  .onNodeClick(node => this.nodeClicked(node))
		  ;
		  // ms to cool down
		  Graph.cooldownTime(2000);
		  // Zoom to fit
		  Graph.d3Force('center', null);

		  // fit to canvas when engine stops
		  Graph.onEngineStop(() => Graph.zoomToFit(500));
		  */
	},
  }
			
  </script>