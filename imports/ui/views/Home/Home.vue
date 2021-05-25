<template>
    <div class="container">
        <h1>MathTrek System</h1>
        <template v-if="currentUser">
            <p>You are logged in into the MathTrek System as user {{ currentUser.username }}.</p>
            <v-btn @click="logout">
                Logout {{currentUser.username}} 🚪
            </v-btn>
        </template>
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
    meteor: {
        currentUser() {
            return Meteor.user();
        },
        logout() {
            Meteor.logout();
        }
    }
}

</script>