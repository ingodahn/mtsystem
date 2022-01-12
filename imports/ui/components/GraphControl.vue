<template>
    <div>
        <v-row>
            <h2>Graph Settings</h2>
        </v-row>
        <v-row xs="12" md="8" align="center">
            <v-col
                class="d-flex"
                cols="12"
                sm="6"
            >
                <v-select
                :items="orientations"
                label="Orientation"
                v-model="session.graph.orientation"
                ></v-select>
            </v-col>
            <v-col
                class="d-flex"
                cols="12"
                sm="6"
            >
                <v-select
                :items="views"
                label="View"
                v-model="session.graph.view"
                ></v-select>
            </v-col>
        </v-row>
        <p>The nodes, that have been updated in the last 
                <select v-model="session.graph.newNodes">
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                    <option>7</option>
                    <option>14</option>
                    <option>30</option>
                </select>      
            days, <span v-html="markNew"></span>.
            </p>

    </div>
</template>

<script>
export default {
    data () {
        return {
            session: this.$root.$data.session,
            orientations: [
                {text: 'None', value: null},
			  	{text: 'Bottom up', value: 'bu'} ,
                {text: 'Top down', value: 'td'},
				{text: 'Left-right', value: 'lr'},
				{text: 'Right-left', value:'rl'},
				{text: 'Out', value: 'radialout'} ,
				{text: 'In', value: 'radialin'} 
			],
            views: ['2D', '3D'],
            reveal: false
        }
    },
    computed: {
        markNew () {
            return (this.session.graph.view == '2D')?"are marked with an <span style='border:solid orange; border-radius: 10px; padding: 1px;'>orange ring</span>":"are shown surrounded by an <span style='border:solid orange; padding: 1px;'>orange polygon</span>";
        }
    }
    
}
</script>