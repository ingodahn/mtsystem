<template>
    <div class="container">
        <div>
            <h1>MathTrek System</h1>
            <p>
                Login is only required to add personal notes or to edit content. 
            </p>
            <p>
                To view content, click one of the buttons above.
            </p>
        </div>
        <div v-if="currentUser" class="c1">
            <div>
                You are logged in into the MathTrek System as user {{ currentUser.username }}.
            </div>
            <div>
                <v-btn v-on:click="logout">
                    Logout {{currentUser.username}}
                </v-btn>
            </div>
        </div>
        <div v-else>
            <template>
                <LoginForm/>
            </template>
        </div>
        <div>
            <GraphControl/>
        </div>
    </div>
</template>

<script>
import LoginForm from "../../../ui/components/LoginForm.vue";
import GraphControl from "/imports/ui/components/GraphControl.vue";
export default {
    components: {
        LoginForm,
        GraphControl,
    },
    methods: {
        logout() {
            Meteor.logout();
        }
    },
    meteor: {
        currentUser() {
            return Meteor.user();
        },
        
    }
}

</script>

<style scoped>
.c1 {
    margin: 1em;
}
</style>