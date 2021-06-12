<template>
    <div class="container">
        <h1>MathTrek System</h1>
        <p>
            Login is only required to edit content. 
            To view content, click on the <b>CONCEPTS</b> button.
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
        }
    },
    meteor: {
        currentUser() {
            return Meteor.user();
        },
        
    }
}

</script>