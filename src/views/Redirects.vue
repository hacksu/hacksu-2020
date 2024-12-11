<template>
    <div class="redirects-page">
        <div class="page-header">
            <h1>Redirect Links</h1>
            <p class="subtitle">Manage HacKSU's redirect links and URLs</p>
        </div>

        <div class="redirects-grid">
            <div class="redirect-card" v-for="(redirect, j) in redirectsToDisplay" :key="redirect.id">
                <div class="redirect-form">
                    <div class="form-group">
                        <label>Redirect Path</label>
                        <div class="input-with-prefix">
                            <span class="prefix">hacksu.com/</span>
                            <input type="text" v-model="redirect.path" class="form-input" 
                                placeholder="e.g., discord" />
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Target URL</label>
                        <input type="url" v-model="redirect.url" class="form-input" 
                            placeholder="https://..." />
                    </div>

                    <div class="button-group">
                        <button class="btn btn-primary" @click="update(redirect, j)">
                            {{j === 0 ? "Add New Redirect" : "Save Changes"}}
                            <span v-if="confirmation.has(j)" class="confirmation-icon">✓</span>
                        </button>
                        <button class="btn btn-danger" v-if="j !== 0" @click="remove(redirect, j)">
                            Delete Redirect
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive, computed } from "vue";
import { remult } from "remult";
import { Redirect } from "../../db/entities.js";

const redirects = ref([]);
const confirmation = ref(new Set());
const repo = remult.repo(Redirect);
const newRedirect = reactive(repo.create());

const redirectsToDisplay = computed(() => [newRedirect, ...redirects.value]);

let unsubscribe;
onMounted(async () => {
    try {
        unsubscribe = repo.liveQuery({
            orderBy: { path: "asc" }
        }).subscribe(info => {
            redirects.value = info.applyChanges(redirects.value);
            console.log('Redirects loaded:', redirects.value);
        });
    } catch (error) {
        console.error('Error loading redirects:', error);
    }
});

onUnmounted(() => {
    if (unsubscribe) {
        unsubscribe();
    }
});

const update = async (redirect, j) => {
    try {
        // Validate URL format
        if (!redirect.url.match(/^https?:\/\/.+/)) {
            alert("Please enter a valid URL starting with http:// or https://");
            return;
        }

        let update;
        if (j === 0) {
            update = await repo.insert(newRedirect);
        } else {
            update = await repo.update(redirect.id, redirect);
        }
        
        confirmation.value.add(j);
        setTimeout(() => confirmation.value.delete(j), 3000);
        
        if (j === 0) {
            Object.assign(newRedirect, repo.create());
        }
    } catch (error) {
        console.error('Error updating redirect:', error);
        alert("Error updating redirect: " + error.message);
    }
};

const remove = async (redirect, j) => {
    if (confirm(`Are you sure you want to delete the redirect "${redirect.path}"? This action cannot be undone.`)) {
        try {
            await repo.delete(redirect);
        } catch (error) {
            console.error('Error deleting redirect:', error);
            alert("Error deleting redirect: " + error.message);
        }
    }
};
</script>

<style scoped lang="scss">
.redirects-page {
    padding: 2rem;
    background-color: #f5f5f5;
    min-height: 100vh;
    color: #2c3e50;
}

.page-header {
    max-width: 1200px;
    margin: 0 auto 2rem;
    padding-top: 80px;
    text-align: center;

    h1 {
        color: #2c3e50;
        font-size: 2.5rem;
        margin: 0 0 0.5rem;
    }

    .subtitle {
        color: #666;
        font-size: 1.1rem;
        margin: 0;
    }
}

.redirects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
}

.redirect-card {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s;

    &:hover {
        transform: translateY(-2px);
    }
}

.redirect-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    label {
        color: #2c3e50;
        font-weight: 500;
    }
}

.input-with-prefix {
    display: flex;
    align-items: center;
    background: white;
    border: 1px solid #ddd;
    border-radius: 6px;
    overflow: hidden;

    .prefix {
        padding: 0.75rem;
        background: #f8f9fa;
        color: #6c757d;
        border-right: 1px solid #ddd;
        font-family: monospace;
    }

    .form-input {
        border: none;
        border-radius: 0;
        flex: 1;

        &:focus {
            outline: none;
        }
    }
}

.form-input {
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.2s;
    color: #2c3e50;
    background-color: white;

    &:focus {
        outline: none;
        border-color: #3498db;
    }

    &::placeholder {
        color: #999;
    }
}

.button-group {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
}

.btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: transform 0.2s, opacity 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

    &:hover {
        transform: translateY(-1px);
    }

    &:active {
        transform: translateY(0);
        opacity: 0.9;
    }
}

.btn-primary {
    background-color: #3498db;
    color: white;
    flex: 2;

    &:hover {
        background-color: #2980b9;
    }
}

.btn-danger {
    background-color: #e74c3c;
    color: white;
    flex: 1;

    &:hover {
        background-color: #c0392b;
    }
}

.confirmation-icon {
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
}
</style>
