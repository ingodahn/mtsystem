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
            <v-btn v-on:click="logout">
                Logout {{currentUser.username}} 🚪
            </v-btn>
        </div>
        <template v-else>
            <LoginForm/>
        </template>
        <v-btn color="primary" @click="clearLocalStorage()">Clear Session</v-btn>
    </div>
</template>

<script>
import LoginForm from "../../../ui/components/LoginForm.vue";
export default {
    components: {
        LoginForm
    },
    methods: {
        logout() {
            Meteor.logout();
        },
        clearLocalStorage () {
            localStorage.clear();
        }
    },
    meteor: {
        currentUser() {
            return Meteor.user();
        },
        
    }
}

</script>