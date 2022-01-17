<template>
    <div class="container">
        <h1>MathTrek System</h1>
        <p>
            Login is only required to add personal notes or to edit content. 
        </p>
        <p>
            To view content, click one of the buttons above.
        </p>
        <div v-if="currentUser">
            <p>You are logged in into the MathTrek System as user {{ currentUser.username }}.</p>
            <v-btn color="primary" class="mx-1 my-1" v-on:click="logout">
                Logout {{currentUser.username}} 🚪
            </v-btn>
        </div>
        <template v-else>
            <LoginForm/>
        </template>
        <div>
             <v-row justify="center">
          <v-col cols="auto">
            <v-card width="600" height="300" raised>
              <v-card-title>Load session from file:</v-card-title>
              <br>
              <v-card-text>
                <v-file-input
                  accept=".json"
                  label="Click here to select a .json file"
                  outlined
                  v-model="sessionFile"
                >
                </v-file-input>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn right @click="loadSession">Load Session</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
          <!--
          <v-col cols="auto">
            <v-card width="600" height="300" raised>
              <v-card-title>File contents:</v-card-title>
              <v-card-text><p>{{ data }}</p></v-card-text>
            </v-card>
          </v-col>
          -->
        </v-row>
        </div>
    </div>
</template>

<script>
import LoginForm from "../../../ui/components/LoginForm.vue";
export default {
    data () {
        return {
            session: this.$root.$data.session,
            sessionFile: null
        }
    },
    watch: {
    },
    components: {
        LoginForm
    },
    methods: {
        logout() {
            Meteor.logout();
        },
        loadSession () {
            if (!this.sessionFile) {alert("No File Chosen")}
            var reader = new FileReader();
            
            // Use the javascript reader object to load the contents
            // of the file in the v-model prop
            reader.readAsText(this.sessionFile);
            reader.onload = () => {
                this.restoreSession(reader.result);
            }
        },
        // TODO: Handle Graph
        restoreSession (sessionString) {
            const sessionData=JSON.parse(sessionString);
            if (!sessionData) {
                alert('Incorrect Data Format in File');
                return;
            }
            const dataSession=sessionData.session;
            if (!dataSession) {
                alert('No Session Found in File')
            }
            this.session.set('type', dataSession.type);
            this.session.set('relation', dataSession.relation);
            this.session.set('id', dataSession.id);
            this.session.set('view', dataSession.view);
            this.session.set('mode', dataSession.mode);
            this.session.set('neighbourhood', dataSession.neighbourhood);
            this.session.set('direction', dataSession.direction);
            this.session.set('newNodes', dataSession.newNodes);
            this.$root.$data.coords=sessionData.coords;
            this.$emit('sessionReloaded')
        }
    },
    meteor: {
        currentUser() {
            return Meteor.user();
        },
        
    }
}

</script>