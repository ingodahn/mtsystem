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
			  session: this.$root.$data.session,
			  currentId: null,
			  currentColor: 'lightblue',
			  Graph: null
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
				this.Graph.graphData(this.neighbourhood(node,this.session.neighbourhood));
				this.setCurrentNode(node,'pink');
			  	this.Graph.zoomToFit(500);
			  //this.$emit('nodeclicked',node.id);
		  },
		  setCurrentNode(node,color) {
			  if (node.id != this.currentId) {
				  if (this.currentId) {
					  // Reset old node color
					  let cnode=this.cmap.nodes.find(d => d.id==this.currentId);
					  if (! cnode) {
						  console.log('Node',this.currentId,'not found')
					  } else {
						  cnode.color=this.currentColor;
					  }
				  }
				  let c=node.color;
				  this.currentColor = node.color;
				  node.color=color;
				  this.currentId=node.id;
			  }
		  },
		  copyData(d) {
			  return JSON.parse(JSON.stringify(d));
			  console.log('copied');
		  },
		  neighbourhood(node,d) {
            const cid=node.id;
			
            let id=0, newNodeIds=[cid],nodeIds=[cid];
            while (id < d) {
                let  nextNodeIds=[];
				//console.log(this.cmap.links[0], "Link 0");
				//console.log('Found as source',this.cmap.links.filter(ll => newNodeIds.includes(ll.source.id)).length);
				this.cmap.links.filter(ll => newNodeIds.includes(ll.source.id)).forEach(lf => {
					nextNodeIds.push(lf.target.id)
				});
				this.cmap.links.filter(ll => newNodeIds.includes(ll.target.id)).forEach(lf => {
					nextNodeIds.push(lf.source.id)
				});
				//console.log('Found',nextNodeIds.length);
                let nextNodeReduced=[...new Set(nextNodeIds)].filter(item => (! nodeIds.includes(item)));
                nodeIds=nodeIds.concat(nextNodeReduced);
                newNodeIds=[...nextNodeReduced];
                id++;
            }
			/*
            let nodeStatus={};
            if (this.currentUser) {
                UnitsCollection.find({type: 'note',
                    item: {$in: nodeIds},
                    userId: this.currentUser._id
                    }).fetch().forEach(n => {
                        nodeStatus[n.item]=n.status;
                    });
            }
            nodeIds.forEach(c => {
				/*
                let color="lightblue";
                const back = new Date().getTime()-parseInt(this.newNodes)*24*60*60*1000;
                switch (nodeStatus[c]) {
                    case "100": color="green"; break;
                    case "2": color="yellow"; break;
                    case "150": color="red"; break;
                    default: color="lightblue";
                }
                let updated=new Date(UnitsCollection.findOne({_id: c}).updatedAt).getTime();
                //let today = new Date()
                let isNew = (updated && updated > back)?true:false;
                if (c == this.currentId) color="black";
                if (nodeStatus[c]) group=nodeStatus[c];
                nodes.push({"id": c, "title": it[c], "color": color, "isNew": isNew});
            });
            linkIds.forEach(r => {
                links.push({source: r.source, target: r.target})
            });
			*/
			let nodes=this.cmap.nodes.filter(nn => nodeIds.includes(nn.id));
			let links=this.cmap.links.filter(nn => (nodeIds.includes(nn.source.id) && nodeIds.includes(nn.target.id)));
			console.log({"nodes": nodes, "links": links});
			if (this.currentId) this.cmap.nodes.find(n => n.id==this.currentId).color='pink';
            return {nodes: nodes, links: links};
        },
	  },
	  mounted() {
		this.currentId=this.session.id;
		/* let cmap1=this.copyData(this.cmap); // Orphaned links?
		let cnodes=cmap1.nodes.map(n => n.id),orp=[];
		cmap1.links.forEach(ll => {if (!cnodes.includes(ll.target.id) || !cnodes.includes(ll.source.id)) orp.push(ll)});
		console.log('Orphans',orp.length);
		*/
		this.Graph = ForceGraph3D({ controlType: 'orbit' })
		(document.getElementById(this.mapId));
		this.Graph
			.graphData(this.cmap)
			//.graphData(this.cmap)
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
			
		// ms to cool down
		  this.Graph.cooldownTime(2000);
		  // Zoom to fit
		  this.Graph.d3Force('center', null);

		  // fit to canvas when engine stops
		  //Graph.onEngineStop(() => Graph.zoomToFit(500));
		  this.Graph.zoomToFit(500);
	},
  }
			
  </script>