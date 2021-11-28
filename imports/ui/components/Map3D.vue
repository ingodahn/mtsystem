<template>
<div>

<div class="container" ref="conti">
	<div :id="mapId" :ref="mapId"></div>
</div>
</div>

</template>

  <script>
  export default {
	  props: {
		  'cmap': {type: Object, default: []},
		  'orientation': {type: String, default: null},
		  'zoomTo': {type: String, default: 'out'},
	  },
	  data () {
		  return {
			  session: this.$root.$data.session,
			  Graph: null,
			  currentColor: 'white',
		  }
	  },
	  watch: {
		  zoomTo (id) {
			  console.log('Watching in Map3D');
			  if (id == 'out') {
				  //this.Graph.zoom(0.5);
			  	this.Graph.zoomToFit(500)
			  } else {
				  let node = this.cmap.nodes.find(e => e.id == id);
				  if (node) {
					  this.zoomToNode(node);
				  }
			  }
		  },
		  session(newSession,oldSession) {
			  if (oldSession.id != newSession.id) {
				  this.Graph.nodeColor(d => d.id==newSession.id?'pink':d.color );
			  }
		  }
	  },
	  computed: {
		  mapId () {
			  return 'graph'+Math.random().toString();
		  }
	  },
	  methods: {
		  nodeClicked(node) {
			this.session.set(id,node.id);
			/*
			let currentNodeId = this.session.id;
			if (currentNodeId && currentNodeId != node.id) {
				this.cmap.nodes.find(e => e.id == currentNodeId).color = this.currentColor;
				this.currentColor=node.color;
				this.session.id = node.id;
				//this.Graph.nodeColor(d => d==node?'white':d.color );
				//console.log('nodeClicked', node);
				//this.$emit('selectLocal', node);
			}
			*/
			console.log('Emitting in Map3D',node.id);
			  this.$emit('nodeclicked',node.id);
		  },
		  zoomToNode(node) {
			// Aim at node from outside it
			const distance = 40;
			const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);

			this.Graph.cameraPosition(
				{ x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
				node, // lookAt ({ x, y, z })
				3000  // ms transition duration
			);
			this.Graph.nodeColor(d => d==node?'pink':d.color );
		}
	  },
	  mounted() {
		  console.log('Map3d mounted');
		this.Graph = ForceGraph3D({ controlType: 'orbit' })
		(document.getElementById(this.mapId))
		this.Graph
			.graphData(this.cmap)
			.width(this.$refs[this.mapId].clientWidth)
			.nodeId('id')
			.nodeLabel(node => `${node.title}`)
			.nodeRelSize(6)
			//.linkDirectionalArrowLength(10)
			.linkDirectionalParticles(10)
        	.linkDirectionalParticleSpeed(d => 0.005)
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
		//this.Graph.onNodeClick(node => this.zoomToNode(node));
		// ms to cool down
		  this.Graph.cooldownTime(2000);
		  // Zoom to fit
		  this.Graph.d3Force('center', null);

		  // fit to canvas when engine stops
		  //this.Graph.onEngineStop(() => this.Graph.zoomToFit(500));
		  console.log('Map3D Zooming to fit')
		  this.Graph.zoomToFit(500);
	},
  }
			
  </script>