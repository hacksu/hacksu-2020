<template>
    <div class="admin-container" v-if="loggedIn">
        <div class="admin-content">
            <h1 class="admin-title">Admin Dashboard</h1>
            <div class="admin-grid">
                <router-link to="/admin/redirects" class="admin-card">
                    <h3>Redirect Links</h3>
                    <p>Manage URL redirects and short links</p>
                </router-link>
                <router-link to="/admin/staff" class="admin-card">
                    <h3>Staff Page</h3>
                    <p>Edit staff members and roles</p>
                </router-link>
                <router-link to="/admin/events" class="admin-card">
                    <h3>Events</h3>
                    <p>Manage upcoming and past events</p>
                </router-link>
                <router-link to="/admin/informations" class="admin-card">
                    <h3>Information Cards</h3>
                    <p>Edit information and announcements</p>
                </router-link>
                <router-link to="/admin/notes" class="admin-card">
                    <h3>Meeting Notes</h3>
                    <p>Edit meeting notes and minutes</p>
                </router-link>
                <router-link to="/admin/meetings" class="admin-card">
                    <h3>View Meetings</h3>
                    <p>Browse all meeting notes</p>
                </router-link>
                <a href="/audit-log" class="admin-card">
                    <h3>DB Edit Log</h3>
                    <p>View database change history</p>
                </a>
            </div>
        </div>
    </div>
</template>

<script setup>
import { loggedIn } from "../globals.js";
</script>

<style scoped lang="scss">
.admin-container {
    min-height: 100vh;
    background-color: #f5f5f5;
    padding: 2rem;
}

.admin-content {
    max-width: 1200px;
    margin: 0 auto;
    padding-top: 80px;
}

.admin-title {
    color: #333;
    font-size: 2.5rem;
    margin-bottom: 2rem;
    text-align: center;
}

.admin-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    padding: 1rem;
}

.admin-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    text-decoration: none;
    color: inherit;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    h3 {
        color: #2c3e50;
        margin: 0 0 0.5rem 0;
        font-size: 1.25rem;
    }

    p {
        color: #666;
        margin: 0;
        font-size: 0.9rem;
    }
}
</style>
