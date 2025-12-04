

<script setup>
import { useRouter } from "vue-router";
import { ref } from "vue";

const router = useRouter();
const email = ref("");
const password = ref("");

function Login() {
    router.push('/dashboard');
}
</script>
<template>
  <h1>Login</h1>
  <input v-model="email" type="email" placeholder="Email" />
  <input v-model="password" type="password" placeholder="Password" />
  <button @click="Login">Login</button>
</template>
<style scoped>
.login-container {
    max-width: 350px;
    margin: 60px auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 8px;
    background: white;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

h1 {
    text-align: center;
    margin-bottom: 20px;
}

input {
    width: 100%;
    padding: 10px;
    margin-bottom: 14px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 16px;
}

button {
    width: 100%;
    padding: 10px;
    background: #4f46e5;
    border: none;
    border-radius: 6px;
    color: white;
    font-size: 16px;
    cursor: pointer;
    transition: 0.2s;
}

button:hover {
    background: #4338ca;
}

</style>